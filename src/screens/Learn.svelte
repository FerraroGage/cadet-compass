<script lang="ts">
  // Learn: everything to read and study, one module at a time.
  import { facts } from '../lib/store.svelte';
  import { MODULES } from '../lib/quiz';
  import FactTable from '../lib/FactTable.svelte';

  let { tab }: { tab?: string } = $props();
  const all = facts();
  const mods = MODULES.filter((m) => all.some((f) => f.module === m.id));
  const current = $derived(mods.find((m) => m.id === tab) ?? mods[0]);
  const rows = $derived(current ? all.filter((f) => f.module === current.id) : []);
  const topics = $derived([...new Set(rows.map((f) => f.topic))].map((name) => ({ name, rows: rows.filter((f) => f.topic === name) })));
</script>

<h1>Learn</h1>
{#if !current}
  <p class="notice">Study content for your branch is not published yet.</p>
{:else}
  <nav class="tabs" aria-label="Modules">
    {#each mods as m}
      <a href="#/learn/{m.id}" aria-current={m.id === current.id ? 'page' : undefined}>{m.name}</a>
    {/each}
  </nav>

  <div class="actions">
    <a class="act" href="#/cards/{current.id}"><b>Flashcards</b><small>Study {current.name}, a few cards at a time</small></a>
    <a class="act" href="#/train/quiz?module={current.id}&n=10"><b>Test yourself</b><small>10 questions on {current.name}</small></a>
    <a class="act" href="#/train/speed?module={current.id}"><b>Speed Round</b><small>Beat the clock on {current.name}</small></a>
    {#if current.id === 'drill'}<a class="act" href="#/train/metronome"><b>Drill metronome</b><small>Hear the cadence</small></a>{/if}
  </div>

  <h2>{current.name}: what to know <span class="label">{rows.length} items</span></h2>
  {#each topics as topic, i}
    <details class="fold" open={i === 0}>
      <summary>{topic.name}<span class="label">{topic.rows.length}</span></summary>
      <FactTable rows={topic.rows} />
    </details>
  {/each}

  <div class="row"><a class="btn" href="#/guide">Printable Study Guide (all modules)</a></div>
{/if}
