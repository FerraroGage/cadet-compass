<script lang="ts">
  // One quiz runner for Test Yourself and custom training. Settings arrive in the address:
  //   module, topic, n (count), diff (1..3), pool (all | due | missed), type (mc | recall), timer (seconds per question)
  import { app, facts, grade, tick, award, today, setHidden } from '../lib/store.svelte';
  import { MODULES, quizzable, buildQuestion, shuffle, gaps, type Question } from '../lib/quiz';
  import type { Fact } from '../lib/bundle';
  import Cite from '../lib/Cite.svelte';
  import Skip from '../lib/Skip.svelte';

  let { params }: { params: URLSearchParams } = $props();
  const t = today();
  const all = facts();
  const p = (k: string) => params.get(k) ?? '';
  const recall = p('type') === 'recall';
  const seconds = Number(p('timer')) || 0;
  const placementMisses = new Set(app.placement ? gaps(app.placement.answers) : []);

  const pool = all.filter((f) =>
    quizzable(f, t) &&
    (!p('module') || f.module === p('module')) &&
    (!p('topic') || f.topic === p('topic')) &&
    (!p('diff') || (f.difficulty ?? 2) === Number(p('diff'))) &&
    (p('pool') !== 'due' || (app.progress[f.id] && app.progress[f.id].due <= t)) &&
    (p('pool') !== 'missed' || (app.progress[f.id]?.lapses ?? 0) > 0 || placementMisses.has(f.id)) &&
    (recall || buildQuestion(f, all)),
  );
  const set = $state(shuffle(pool).slice(0, Number(p('n')) || 10));

  let i = $state(0);
  let q = $state<Question | null>(null);
  let picked = $state<number | null>(null);
  let shown = $state(false); // answered and marked
  let revealed = $state(false); // recall only: answer on screen, not yet marked
  let left = $state(seconds);
  let missed = $state<Fact[]>([]);
  let right = $state(0);
  const fact = $derived(set[i]);
  const done = $derived(i >= set.length);

  function begin() {
    q = fact && !recall ? buildQuestion(fact, all) : null;
    picked = null;
    shown = false;
    revealed = false;
    left = seconds;
  }
  begin();

  // A miss goes back into today's cards.
  async function mark(ok: boolean) {
    shown = true;
    void tick();
    if (ok) right++;
    else { missed.push(fact); await grade(fact.id, 0); }
  }
  const choose = (n: number) => { picked = n; mark(n === q!.correct); };
  // Short quizzes earn nothing, so a one-question quiz cannot be farmed.
  const MIN = 5;
  const review = p('pool') === 'missed';
  let earned = $state(0);
  async function next() {
    i++;
    begin();
    if (i < set.length || !set.length) return;
    if (review) earned = await award('review');
    else if (set.length >= MIN) earned = await award('quiz', { score: right / set.length });
  }

  // Skipped: taken out of this quiz, so it counts toward nothing, and hidden from now on.
  async function skip() {
    await setHidden([fact.id], true);
    set.splice(i, 1);
    i--;
    await next();
  }

  $effect(() => {
    if (!seconds || done || recall) return; // the timer applies to multiple choice only
    const id = setInterval(() => {
      if (shown) return;
      left--;
      if (left <= 0) mark(false); // time ran out
    }, 1000);
    return () => clearInterval(id);
  });
  const title = [MODULES.find((m) => m.id === p('module'))?.name, p('topic')].filter(Boolean).join(': ') || 'All modules';
</script>

<h1>Test yourself</h1>
<p class="label">{title}</p>

{#if !set.length}
  <div class="block">
    <div class="head"><span class="n">0</span><span class="t">No questions match</span></div>
    <div class="in">
      <p>Nothing fits those settings. A "due" or "missed" pool is empty until you have studied some cards.</p>
      <a class="btn primary" href="#/train/custom">Change settings</a>
    </div>
  </div>
{:else if done}
  <h2>Score</h2>
  <p><span class="num">{right}</span> of <span class="num">{set.length}</span> correct.</p>
  <p class="help">{earned ? `+${earned} XP` : !review && set.length < MIN ? `Quizzes of ${MIN} or more questions earn XP.` : !review && right / set.length < 0.7 ? 'Score 70 percent or better to earn XP.' : 'You have reached today\'s XP limit for this activity.'}</p>
  {#if missed.length}
    <p>{missed.length === 1 ? 'This one is' : `These ${missed.length} are`} back in your cards, due today.</p>
    <table>
      <thead><tr><th scope="col">Question</th><th scope="col">Answer</th></tr></thead>
      <tbody>{#each missed as f}<tr><td>{f.q}</td><td>{f.a}<Cite fact={f} /></td></tr>{/each}</tbody>
    </table>
  {/if}
  <div class="row">
    <button class="btn primary" onclick={() => location.reload()}>Go again</button>
    {#if missed.length}<a class="btn" href="#/train/quiz?pool=missed&n=10">Review misses</a>{/if}
    <a class="btn" href="#/cards">Study cards</a>
    <a class="btn" href="#/train">Training menu</a>
  </div>
{:else}
  <p class="label">Question {i + 1} of {set.length}{#if seconds && !recall && !shown} / <span aria-live="off">{left} seconds</span>{/if}</p>
  <article class="card">
    <div class="q" id="question">{fact.q}</div>
    {#if q}
      <div role="radiogroup" aria-labelledby="question">
        {#each q.choices as c, n}
          <button class="choice" class:right={shown && n === q.correct} class:wrong={shown && n === picked && n !== q.correct}
            role="radio" aria-checked={picked === n} disabled={shown} onclick={() => choose(n)}>
            <b>{'ABCD'[n]}</b><span>{c}</span>
          </button>
        {/each}
      </div>
    {/if}
    {#if shown || revealed}
      <div class="a" aria-live="polite">
        {#if q}
          <p class="verdict {picked === q.correct ? 'good' : 'bad'}">{picked === q.correct ? 'Correct' : picked === null ? 'Out of time' : 'Incorrect'}</p>
        {:else}
          <strong>{fact.a}</strong>
        {/if}
        <p>{fact.text}</p>
        <Cite {fact} />
      </div>
    {/if}
  </article>

  {#if !shown && !revealed}<Skip onskip={skip} />{/if}
  {#if recall && !revealed}
    <p class="help" style="margin-top: 16px">Say or write the answer, then check it.</p>
    <div class="row" style="margin-top: 4px"><button class="btn primary" onclick={() => (revealed = true)}>Show answer</button></div>
  {:else if recall && !shown}
    <div class="row fill">
      <button class="btn primary" onclick={async () => { await mark(true); next(); }}>I had it</button>
      <button class="btn" onclick={async () => { await mark(false); next(); }}>I missed it</button>
    </div>
  {:else if shown}
    <div class="row"><button class="btn primary" onclick={next}>{i + 1 === set.length ? 'See score' : 'Next question'}</button></div>
  {/if}
{/if}
