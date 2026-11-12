<script lang="ts">
  import { app, fmtDate } from '../lib/store.svelte';
  import { MODULES } from '../lib/quiz';
  import FactTable from '../lib/FactTable.svelte';

  const b = app.bundle!;
  const sections = MODULES.map((m, i) => {
    const facts = b.facts.filter((f) => f.module === m.id);
    return { ...m, n: i + 1, topics: [...new Set(facts.map((f) => f.topic))].map((name) => ({ name, rows: facts.filter((f) => f.topic === name) })) };
  });
</script>

<h1>Study Guide, based on official publications</h1>
<p class="label">Marine Corps JROTC / content version {b.version}, {fmtDate(b.date)}</p>
<p>Not an official publication. Your instructor, your unit's orders and the current official publications outrank this guide. Every table names the publication and page it came from and the date it was last checked.</p>
<div class="row" style="margin-top: 0">
  <button class="btn primary" onclick={() => print()}>Print or save as PDF</button>
</div>

<h2>Contents</h2>
<ol>{#each sections as s}<li><a href="#/guide" onclick={(e) => { e.preventDefault(); document.getElementById('s-' + s.id)?.scrollIntoView(); }}>{s.name}</a></li>{/each}</ol>

{#each sections as s}
  <section class="guide-section" id="s-{s.id}">
    <h2>{s.n}. {s.name}</h2>
    {#each s.topics as topic}
      <h3>{topic.name}</h3>
      <FactTable rows={topic.rows} />
    {/each}
    <div class="row"><a class="btn" href="#/train/quiz?module={s.id}&n=10">Test yourself: {s.name}</a></div>
  </section>
{/each}
