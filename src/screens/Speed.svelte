<script lang="ts">
  // Speed Round: ten questions against the clock. Points for a right answer, more the faster it comes,
  // plus a streak bonus. Wrong answers go back into today's cards.
  import { term } from '../lib/terms';
  import { app, facts, effectiveWeights, save, grade, tick, award, today, setHidden } from '../lib/store.svelte';
  import { quizzable, buildQuestion, pickWeighted, MODULES, type Question } from '../lib/quiz';
  import type { Fact } from '../lib/bundle';
  import Skip from '../lib/Skip.svelte';

  let { params }: { params: URLSearchParams } = $props();
  const SECONDS = 15, COUNT = 10;
  const t = today();
  // svelte-ignore state_referenced_locally (the screen is rebuilt whenever the address changes)
  const mod = params.get('module') ?? '';
  const all = facts();
  const set: { fact: Fact; q: Question }[] = $state((() => { const pl = all.filter((f) => quizzable(f, t) && (!mod || f.module === mod)); return pickWeighted(pl, pl.length, effectiveWeights()); })()
    .map((fact) => ({ fact, q: buildQuestion(fact, all)! })).filter((x) => x.q).slice(0, COUNT));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'speed' + (mod ? '-' + mod : '');

  let phase = $state<'count' | 'ask' | 'shown' | 'done'>('count');
  let n = $state(0);
  let countdown = $state(3);
  let left = $state(SECONDS);
  let picked = $state<number | null>(null);
  let score = $state(0);
  let gained = $state(0);
  let streak = $state(0);
  let right = $state(0);
  let earned = $state(0);
  let best = $state(0);
  let started = 0;
  const cur = $derived(set[n]);

  $effect(() => {
    if (phase !== 'count') return;
    if (reduced) { begin(); return; }
    const id = setInterval(() => { if (--countdown <= 0) { clearInterval(id); begin(); } }, 700);
    return () => clearInterval(id);
  });
  function begin() { phase = 'ask'; picked = null; left = SECONDS; started = performance.now(); }
  $effect(() => {
    if (phase !== 'ask') return;
    const id = setInterval(() => {
      left = Math.max(0, SECONDS - (performance.now() - started) / 1000);
      if (left <= 0) answer(-1);
    }, 100);
    return () => clearInterval(id);
  });

  async function answer(i: number) {
    if (phase !== 'ask') return;
    picked = i;
    phase = 'shown';
    const ok = i === cur.q.correct;
    lastStreak = streak;
    streak = ok ? streak + 1 : 0;
    // 500 for a right answer, up to 500 more for speed, and 100 per answer in a streak (up to 500).
    gained = ok ? 500 + Math.round((left / SECONDS) * 500) + Math.min(500, (streak - 1) * 100) : 0;
    score += gained;
    if (ok) right++;
    else await grade(cur.fact.id, 0);
    await tick();
  }
  // Skipped: out of this round and its score, and hidden from now on.
  let lastStreak = 0;
  async function skip() {
    if (phase === 'shown') streak = lastStreak; // a wrong answer to it no longer counts
    await setHidden([cur.fact.id], true);
    set.splice(n, 1);
    if (n < set.length) begin();
    else await finish();
  }
  async function next() {
    if (n + 1 < set.length) { n++; begin(); return; }
    await finish();
  }
  async function finish() {
    phase = 'done';
    if (!set.length) return;
    best = app.scores[KEY] ?? 0;
    if (score > best) await save('scores', { ...app.scores, [KEY]: score });
    earned = await award('quiz', { score: right / set.length });
  }
  const COLORS = ['#16324f', '#c0392b', '#1f7a4d', '#7a5d00'];
</script>

<div class="game">
  {#if set.length < 4}
    <h1>Speed Round</h1>
    <p class="notice">There are not enough questions for your branch yet.</p>
  {:else if phase === 'count'}
    <div class="go" aria-live="assertive">{#key countdown}<b>{countdown}</b>{/key}<span>Get ready</span></div>
  {:else if phase === 'done'}
    <div class="final">
      <p class="label">Speed Round{mod ? ': ' + MODULES.find((m) => m.id === mod)?.name : ''}</p>
      <b class="big">{score.toLocaleString()}</b>
      <p>{right} of {set.length} right{score > best ? (best ? ', a new best' : '') : `. Your best is ${best.toLocaleString()}`}.</p>
      {#if earned}<p class="xpline">+{earned} XP</p>{/if}
      <div class="row">
        <button class="btn primary" onclick={() => location.reload()}>Play again</button>
        <a class="btn" href="#/train">All games</a>
      </div>
    </div>
  {:else}
    <div class="hud">
      <span class="label">{n + 1} / {set.length}</span>
      {#if streak > 1}<span class="streak" aria-label="{streak} in a row">{streak} in a row</span>{/if}
      <span class="num">{score.toLocaleString()}</span>
    </div>
    <div class="clock" role="progressbar" aria-label="Time left" aria-valuemin="0" aria-valuemax={SECONDS} aria-valuenow={Math.ceil(left)}><i style="width: {(left / SECONDS) * 100}%"></i></div>
    <h1 class="ask" id="q">{term(cur.fact.q)}</h1>
    <div class="tiles" role="radiogroup" aria-labelledby="q">
      {#each cur.q.choices as c, i}
        <button class="tile" style="--c: {COLORS[i]}" role="radio" aria-checked={picked === i} disabled={phase === 'shown'}
          class:right={phase === 'shown' && i === cur.q.correct} class:wrong={phase === 'shown' && i === picked && i !== cur.q.correct}
          class:dim={phase === 'shown' && i !== cur.q.correct && i !== picked} onclick={() => answer(i)}>
          <b aria-hidden="true">{'ABCD'[i]}</b><span>{term(c)}</span>
        </button>
      {/each}
    </div>
    {#if phase === 'ask' || (phase === 'shown' && picked !== cur.q.correct)}<Skip onskip={skip} after={phase === 'shown'} />{/if}
    {#if phase === 'shown'}
      <div class="verdictbar {picked === cur.q.correct ? 'good' : 'bad'}" role="status">
        <strong>{picked === cur.q.correct ? `+${gained}` : picked === -1 ? 'Out of time' : 'Not this time'}</strong>
        <span>{picked === cur.q.correct ? (streak > 1 ? `${streak} in a row` : 'Correct') : term(cur.fact.a)}</span>
        <button class="btn gold" onclick={next}>{n + 1 < set.length ? 'Next' : 'See score'}</button>
      </div>
    {/if}
  {/if}
</div>
