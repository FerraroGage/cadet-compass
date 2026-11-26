<script lang="ts">
  // One quiz runner for Test Yourself and custom training. Settings arrive in the address:
  //   module, topic, n (count), diff (1..3), pool (all | due | missed), type (mc | recall), timer (seconds per question)
  // Answered questions can be stepped back through. A question marked "not in my program", before answering
  // or after getting it wrong, leaves the quiz and its score entirely.
  import { term } from '../lib/terms';
  import { app, facts, effectiveWeights, grade, tick, award, today, setHidden } from '../lib/store.svelte';
  import { MODULES, quizzable, buildQuestion, pickWeighted, gaps, type Question } from '../lib/quiz';
  import Cite from '../lib/Cite.svelte';
  import Ask from '../lib/Ask.svelte';
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
  // One entry per question: the fact, its choices (kept so a review shows the same ones), and the result once answered.
  type Item = { fact: (typeof pool)[number]; q: Question | null; picked: number | null; ok?: boolean };
  const set = $state<Item[]>(pickWeighted(pool, Number(p('n')) || 10, effectiveWeights()).map((fact) => ({ fact, q: recall ? null : buildQuestion(fact, all), picked: null })));

  let i = $state(0); // the question being answered
  let view = $state<number | null>(null); // an earlier question being looked at again
  let revealed = $state(false); // recall only: answer on screen, not yet marked
  let left = $state(seconds);
  let earned = $state(0);
  let awarded = false;
  const done = $derived(i >= set.length);
  const right = $derived(set.filter((x) => x.ok).length);
  const missed = $derived(set.filter((x) => x.ok === false).map((x) => x.fact));
  const shownAt = $derived(view ?? i);
  const cur = $derived(set[shownAt]);
  const answered = $derived(cur?.ok !== undefined);

  // Short quizzes earn nothing, so a one-question quiz cannot be farmed.
  const MIN = 5;
  const review = p('pool') === 'missed';

  // A miss goes back into today's cards.
  async function mark(ok: boolean, picked: number | null = null) {
    const item = set[i];
    item.picked = picked;
    item.ok = ok;
    void tick();
    if (!ok) await grade(item.fact.id, 0);
  }
  const choose = (n: number) => mark(n === set[i].q!.correct, n);

  async function next() {
    i++;
    revealed = false;
    left = seconds;
    await finish();
  }
  async function finish() {
    if (i < set.length || !set.length || awarded) return;
    awarded = true;
    if (review) earned = await award('review');
    else if (set.length >= MIN) earned = await award('quiz', { score: right / set.length });
  }

  // Not in my program: hidden from now on, and removed from this quiz as if it had never been asked.
  async function drop(k: number) {
    await setHidden([set[k].fact.id], true);
    set.splice(k, 1);
    if (k < i) i--;
    if (view !== null && view >= i) view = null;
    revealed = false;
    if (k === i) left = seconds;
    await finish();
  }
  const back = () => (view = Math.max(0, (view ?? i) - 1));
  const forward = () => (view = view !== null && view + 1 < i ? view + 1 : null);

  $effect(() => {
    if (!seconds || done || recall || view !== null) return; // the timer applies to multiple choice only, and waits during a look back
    const id = setInterval(() => {
      if (set[i]?.ok !== undefined) return;
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
{:else if done && view === null}
  <h2>Score</h2>
  <p><span class="num">{right}</span> of <span class="num">{set.length}</span> correct.</p>
  <p class="help">{earned ? `+${earned} XP` : !review && set.length < MIN ? `Quizzes of ${MIN} or more questions earn XP.` : !review && right / set.length < 0.7 ? 'Score 70 percent or better to earn XP.' : 'You have reached today\'s XP limit for this activity.'}</p>
  <ol class="recap">
    {#each set as x, k}
      <li><button class="recap-row" onclick={() => (view = k)}>
        <span class="mark {x.ok ? 'good' : 'bad'}" aria-label={x.ok ? 'Right' : 'Wrong'}>{x.ok ? '✓' : '✕'}</span>
        <span><Ask fact={x.fact} q={x.q} /></span>
      </button></li>
    {/each}
  </ol>
  {#if missed.length}<p class="help">{missed.length === 1 ? 'The one you missed is' : `The ${missed.length} you missed are`} back in your cards, due today. Tap any question to look at it again.</p>{/if}
  <div class="row">
    <button class="btn primary" onclick={() => location.reload()}>Go again</button>
    {#if missed.length}<a class="btn" href="#/train/quiz?pool=missed&n=10">Review misses</a>{/if}
    <a class="btn" href="#/train">All games and tests</a>
  </div>
{:else}
  {@const fact = cur.fact}
  {@const q = cur.q}
  <div class="qnav">
    <button class="btn link" onclick={back} disabled={shownAt === 0} aria-label="Previous question">‹ Back</button>
    <p class="label" aria-live="polite">
      {#if view !== null}Looking back: question {view + 1} of {set.length}{:else}Question {i + 1} of {set.length}{/if}
      {#if seconds && !recall && !answered && view === null} / <span aria-live="off">{left} seconds</span>{/if}
    </p>
    {#if view !== null}<button class="btn link" onclick={forward}>{view + 1 < i ? 'Next ›' : done ? 'Score ›' : 'Current ›'}</button>{/if}
  </div>
  <article class="card" class:past={view !== null}>
    <div class="q" id="question"><Ask {fact} {q} /></div>
    {#if q}
      <div role="radiogroup" aria-labelledby="question">
        {#each q.choices as c, n}
          <button class="choice" class:right={answered && n === q.correct} class:wrong={answered && n === cur.picked && n !== q.correct}
            role="radio" aria-checked={cur.picked === n} disabled={answered || view !== null} onclick={() => choose(n)}>
            <b>{'ABCD'[n]}</b><span>{term(c)}</span>
          </button>
        {/each}
      </div>
    {/if}
    {#if answered || (revealed && view === null)}
      <div class="a" aria-live="polite">
        {#if q}
          <p class="verdict {cur.ok ? 'good' : 'bad'}">{cur.ok ? 'Correct' : cur.picked === null ? 'Out of time' : 'Incorrect'}</p>
        {:else}
          <strong>{term(fact.a)}</strong>
          {#if answered}<p class="verdict {cur.ok ? 'good' : 'bad'}">{cur.ok ? 'You had it' : 'You missed it'}</p>{/if}
        {/if}
        <p>{term(fact.text)}</p>
        <Cite {fact} />
      </div>
    {/if}
  </article>

  <!-- Before answering, or after a wrong answer: "not in my program" takes it out of the quiz and the score. -->
  {#if !answered || cur.ok === false}<Skip onskip={() => drop(shownAt)} after={answered} />{/if}

  {#if view === null}
    {#if recall && !revealed}
      <p class="help" style="margin-top: 16px">Say or write the answer, then check it.</p>
      <div class="row" style="margin-top: 4px"><button class="btn primary" onclick={() => (revealed = true)}>Show answer</button></div>
    {:else if recall && !answered}
      <div class="row fill">
        <button class="btn primary" onclick={async () => { await mark(true); next(); }}>I had it</button>
        <button class="btn" onclick={async () => { await mark(false); next(); }}>I missed it</button>
      </div>
    {:else if answered}
      <div class="row"><button class="btn primary" onclick={next}>{i + 1 === set.length ? 'See score' : 'Next question'}</button></div>
    {/if}
  {/if}
{/if}
