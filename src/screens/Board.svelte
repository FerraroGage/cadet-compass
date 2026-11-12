<script lang="ts">
  // Mock Promotion Board: answer aloud as you would in front of the board, then mark yourself on the score sheet.
  import { app, grade, today } from '../lib/store.svelte';
  import { quizzable, shuffle } from '../lib/quiz';
  import Cite from '../lib/Cite.svelte';

  const t = today();
  const BOARD = ['knowledge', 'chain', 'ranks', 'uniform'];
  const pick = () => shuffle(app.bundle!.facts.filter((f) => BOARD.includes(f.module) && quizzable(f, t))).slice(0, 10);
  const MARKS = [[2, 'Correct'], [1, 'Partly'], [0, 'Missed']] as const;

  let set = $state(pick());
  let marks = $state<number[]>([]);
  let shown = $state(false);
  let started = Date.now();
  let seconds = $state(0);
  const fact = $derived(set[marks.length]);
  const total = $derived(marks.reduce((a, b) => a + b, 0));

  async function mark(m: number) {
    if (m === 0) await grade(fact.id, 0); // a missed board question goes back into today's cards
    marks.push(m);
    shown = false;
    if (marks.length === set.length) seconds = Math.round((Date.now() - started) / 1000);
  }
  function again() { set = pick(); marks = []; shown = false; started = Date.now(); }
</script>

<h1>Mock promotion board</h1>

{#if fact}
  <p class="label">Question {marks.length + 1} of {set.length}</p>
  <article class="card">
    <div class="q">{fact.q}</div>
    {#if shown}
      <div class="a" aria-live="polite"><strong>{fact.a}</strong><p>{fact.text}</p><Cite {fact} /></div>
    {/if}
  </article>
  {#if shown}
    <p class="label" style="margin-top: 16px">Mark your answer</p>
    <div class="row fill" style="margin-top: 4px">
      {#each MARKS as [m, name]}<button class="btn" onclick={() => mark(m)}>{name}</button>{/each}
    </div>
  {:else}
    <p class="help" style="margin-top: 16px">Stand at attention and answer aloud, in a full sentence. Then check yourself.</p>
    <div class="row" style="margin-top: 4px"><button class="btn primary" onclick={() => (shown = true)}>Show answer</button></div>
  {/if}
{:else}
  <h2>Score sheet</h2>
  <table>
    <thead><tr><th class="num" scope="col">No.</th><th scope="col">Question</th><th class="num" scope="col">Pts</th></tr></thead>
    <tbody>
      {#each set as f, i}<tr><td class="num">{i + 1}</td><td>{f.q}{#if marks[i] < 2}<p class="cite">Answer: {f.a}</p>{/if}</td><td class="num">{marks[i]}</td></tr>{/each}
      <tr><td></td><td><strong>Total</strong> <span class="cite">Time: {Math.floor(seconds / 60)} min {seconds % 60} s</span></td><td class="num"><strong>{total}/{set.length * 2}</strong></td></tr>
    </tbody>
  </table>
  <p class="help">Correct is 2 points, partly is 1. Missed questions are back in your cards, due today. Your unit's board may ask different questions and score differently.</p>
  <div class="row">
    <button class="btn primary" onclick={again}>New board</button>
    <a class="btn" href="#/train">Training menu</a>
  </div>
{/if}
