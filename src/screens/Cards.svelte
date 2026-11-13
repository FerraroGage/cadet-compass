<script lang="ts">
  import { app, facts, grade, tick, award, today, fmtDate } from '../lib/store.svelte';
  import { MODULES, quizzable, modulePriority, summarize } from '../lib/quiz';
  import type { Grade } from '../lib/srs';
  import Cite from '../lib/Cite.svelte';

  let { module }: { module?: string } = $props();
  const t = today();
  const scope = MODULES.find((m) => m.id === module);
  const mine = facts().filter((f) => quizzable(f, t) && (!scope || f.module === scope.id));
  const byId = new Map(mine.map((f) => [f.id, f]));

  // A sitting: everything due, then new cards. New cards per sitting equals the daily minutes on the profile.
  function build() {
    const order = modulePriority(app.profile!.goals, app.placement?.done ? summarize(app.placement.answers) : null);
    const due = mine.filter((f) => app.progress[f.id] && app.progress[f.id].due <= t);
    const fresh = mine.filter((f) => !app.progress[f.id]).sort((a, b) => order.indexOf(a.module) - order.indexOf(b.module)).slice(0, app.profile!.minutes);
    return [...due, ...fresh].map((f) => f.id);
  }
  const first = build();
  let queue = $state(first);
  let total = $state(first.length);
  let shown = $state(false);
  const fact = $derived(byId.get(queue[0]));
  const left = $derived(mine.filter((f) => !app.progress[f.id]).length);
  const nextDue = $derived(Object.entries(app.progress).filter(([id, c]) => byId.has(id) && c.due > t).map(([, c]) => c.due).sort()[0]);

  async function answer(g: Grade) {
    const id = queue[0];
    await grade(id, g);
    queue = g === 0 ? [...queue.slice(1), id] : queue.slice(1);
    shown = false;
    await tick();
    if (!queue.length) await award('lesson');
  }
  function more() { queue = build(); total = queue.length; }
  const GRADES: [Grade, string, string][] = [[0, 'Again', 'Missed it'], [1, 'Hard', 'Barely'], [2, 'Good', 'Knew it'], [3, 'Easy', 'No effort']];
</script>

<h1>{scope ? scope.name + ' cards' : 'Cards'}</h1>
{#if total}<div class="meter" role="progressbar" aria-label="Cards done" aria-valuemin="0" aria-valuemax={total} aria-valuenow={total - queue.length}><i style="width: {((total - queue.length) / total) * 100}%"></i></div>{/if}

{#if fact}
  <p class="label">Card {total - queue.length + 1} of {Math.max(total, total - queue.length + 1)}</p>
  <article class="card">
    <div class="top"><span class="label">{MODULES.find((m) => m.id === fact.module)?.name}</span><span class="label">{fact.topic}</span></div>
    <div class="q">{fact.q}</div>
    {#if shown}
      <div class="a" aria-live="polite">
        <strong>{fact.a}</strong>
        <p>{fact.text}</p>
        <Cite {fact} />
      </div>
    {/if}
  </article>
  {#if shown}
    <p class="label" style="margin-top: 16px">How well did you know it?</p>
    <div class="row fill" style="margin-top: 4px">
      {#each GRADES as [g, name, hint]}
        <button class="btn" onclick={() => answer(g)} aria-label="{name}: {hint}">{name}</button>
      {/each}
    </div>
  {:else}
    <div class="row"><button class="btn primary" onclick={() => (shown = true)}>Show answer</button></div>
  {/if}
{:else}
  <div class="block">
    <div class="head"><span class="n">0</span><span class="t">{total ? 'Lesson complete' : 'Nothing due'}</span></div>
    <div class="in">
      <p>You have finished today's cards{scope ? ' for ' + scope.name : ''}.</p>
      {#if nextDue}<p>Next review: {fmtDate(nextDue)}.</p>{/if}
      <p><span class="num">{left}</span> cards not started yet.</p>
      <div class="row">
        {#if left}<button class="btn primary" onclick={more}>Add {Math.min(left, app.profile!.minutes)} new cards</button>{/if}
        <a class="btn" href="#/learn{scope ? '/' + scope.id : ''}">Back to Learn</a>
      </div>
    </div>
  </div>
{/if}
