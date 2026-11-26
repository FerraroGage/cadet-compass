<script lang="ts">
  import { app, facts, save, makeDue, award, today, fmtDate, setHidden } from '../lib/store.svelte';
  import { MODULES, quizzable, obscure, buildQuestion, newPlacement, nextFact, record, summarize, gaps, modulePriority, type Question } from '../lib/quiz';
  import { addDays } from '../lib/srs';
  import type { Fact } from '../lib/bundle';
  import Cite from '../lib/Cite.svelte';
  import Skip from '../lib/Skip.svelte';

  const t = today();
  const all = facts();
  const pool = all.filter((f) => quizzable(f, t) && !obscure(f) && buildQuestion(f, all));

  let cur = $state<{ fact: Fact; q: Question } | null>(null);
  let picked = $state<number | null>(null);
  let result = $state<boolean | null>(null);

  function load() {
    const fact = app.placement && !app.placement.done ? nextFact(app.placement, pool) : null;
    cur = fact ? { fact, q: buildQuestion(fact, all)! } : null;
    picked = null;
    result = null;
  }
  async function start() {
    await save('placement', newPlacement(pool.length));
    load();
  }
  // The answer is saved the moment it is given, so the test can be left and resumed at any point.
  // Not in my program: hidden, and a wrong answer to it is undone, then another question comes up.
  let before: typeof app.placement = null;
  async function swap() {
    if (!cur) return;
    if (result !== null && before) await save('placement', before);
    await setHidden([cur.fact.id], true);
    load();
  }
  async function submit(sure: boolean) {
    if (!cur || picked === null) return;
    result = picked === cur.q.correct;
    before = $state.snapshot(app.placement!);
    const next = record(app.placement!, { factId: cur.fact.id, module: cur.fact.module, correct: result, sure }, t);
    await save('placement', next);
    if (next.done) { await makeDue(gaps(next.answers)); await award('placement'); }
  }
  if (app.placement && !app.placement.done) load();

  const results = $derived(app.placement?.done ? summarize(app.placement.answers) : null);
  const gapIds = $derived(app.placement?.done ? gaps(app.placement.answers) : []);
  const plan = $derived(results ? modulePriority(app.profile!.goals, results).map((m) => ({ name: MODULES.find((x) => x.id === m)!.name, id: m, n: gapIds.filter((id) => all.find((f) => f.id === id)?.module === m).length })).filter((x) => x.n) : []);
  const PIPS = { 'Not started': 0, Learning: 1, Solid: 3, Mastered: 4 };
</script>

<h1>Knowledge placement test</h1>

{#if cur}
  {@const n = app.placement!.answers.length + (result === null ? 1 : 0)}
  <p class="label">Question {n} of {app.placement!.length} / {MODULES.find((m) => m.id === cur!.fact.module)?.name}</p>
  <article class="card">
    <div class="q" id="question">{cur.fact.q}</div>
    <div role="radiogroup" aria-labelledby="question">
      {#each cur.q.choices as c, i}
        <button class="choice" class:right={result !== null && i === cur.q.correct} class:wrong={result === false && i === picked}
          role="radio" aria-checked={picked === i} disabled={result !== null} onclick={() => (picked = i)}>
          <b>{'ABCD'[i]}</b><span>{c}</span>
        </button>
      {/each}
    </div>
    {#if result !== null}
      <div class="a" aria-live="polite">
        <p class="verdict {result ? 'good' : 'bad'}">{result ? 'Correct' : 'Incorrect'}</p>
        <p>{cur.fact.text}</p>
        <Cite fact={cur.fact} />
      </div>
    {/if}
  </article>
  {#if result === null || (result === false && !app.placement!.done)}<Skip onskip={swap} after={result !== null} />{/if}
  {#if result === null}
    <p class="label" style="margin-top: 16px">Pick an answer, then say how sure you are</p>
    <div class="row fill" style="margin-top: 4px">
      <button class="btn primary" disabled={picked === null} onclick={() => submit(true)}>Sure</button>
      <button class="btn" disabled={picked === null} onclick={() => submit(false)}>Guess</button>
    </div>
    <p class="help" style="margin-top: 16px">You can leave at any time. The test picks up where you stopped.</p>
  {:else}
    <div class="row"><button class="btn primary" onclick={load}>{app.placement!.done ? 'See results' : 'Next question'}</button></div>
  {/if}
{:else if results}
  <p class="label">Tested {fmtDate(app.placement!.finishedOn!)}. Retest after {fmtDate(addDays(app.placement!.finishedOn!, 14))}.</p>
  <h2>Readiness by module</h2>
  <table>
    <thead><tr><th scope="col">Module</th><th class="num" scope="col">Right</th><th class="num" scope="col">Guess</th><th scope="col">Status</th></tr></thead>
    <tbody>
      {#each results as r}
        <tr>
          <td>{r.name}</td>
          <td class="num">{r.correct}/{r.asked}</td>
          <td class="num">{r.guessed}</td>
          <td><span class="pips" aria-hidden="true">{#each [1, 2, 3, 4] as k}<i class:on={k <= PIPS[r.status]}></i>{/each}</span>{r.status}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="help">A right answer marked as a guess counts half. Mastered is 85 percent or better, Solid is 50 percent or better.</p>

  <h2>Training plan</h2>
  {#if plan.length}
    <p>The {gapIds.length} items you missed or guessed are in your cards and due today. Work them in this order:</p>
    <ol>
      {#each plan as m}<li><a href="#/cards/{m.id}">{m.name}</a>: {m.n} {m.n === 1 ? 'item' : 'items'}</li>{/each}
    </ol>
  {:else}
    <p>No gaps found. Keep up with your daily cards.</p>
  {/if}
  <div class="row">
    <a class="btn primary" href="#/cards">Study now</a>
    <button class="btn" onclick={start}>Take the test again</button>
  </div>
{:else}
  <div class="block">
    <div class="head"><span class="n">1</span><span class="t">How it works</span></div>
    <div class="in">
      <ol>
        <li>{Math.min(40, pool.length)} multiple-choice questions across all seven modules. Allow 15 to 20 minutes.</li>
        <li>It starts at medium difficulty and gets harder or easier with each answer.</li>
        <li>After each answer, mark it Sure or Guess. A lucky guess does not count as knowing it.</li>
        <li>You can stop and finish later.</li>
        <li>At the end you get a readiness table by module, and everything you missed goes into your cards.</li>
      </ol>
      <div class="row"><button class="btn primary" onclick={start}>Begin test</button></div>
    </div>
  </div>
{/if}
