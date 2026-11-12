<script lang="ts">
  import { app, today, fmtDate } from '../lib/store.svelte';
  import { MODULES, quizzable } from '../lib/quiz';
  import FactTable from '../lib/FactTable.svelte';

  let { tab }: { tab?: string } = $props();
  const t = today();
  const current = $derived(MODULES.find((m) => m.id === tab) ?? MODULES[0]);
  const facts = $derived(app.bundle!.facts.filter((f) => f.module === current.id));
  const topics = $derived([...new Set(facts.map((f) => f.topic))].map((name) => ({ name, rows: facts.filter((f) => f.topic === name) })));
  const cards = $derived(facts.filter((f) => quizzable(f, t)));
  const learned = $derived(cards.filter((f) => (app.progress[f.id]?.reps ?? 0) > 0).length);
  const due = $derived(cards.filter((f) => app.progress[f.id] && app.progress[f.id].due <= t).length);

  const p = app.profile!;
  const days = p.eventDate ? Math.round((Date.parse(p.eventDate) - Date.parse(t)) / 864e5) : null;
  const who = [p.rank !== 'Not sure' && p.rank, !['None', 'Not sure'].includes(p.billet) && p.billet, p.level, p.region && 'Region ' + p.region, p.unit].filter(Boolean).join(' / ');
</script>

<h1>Marine Corps hub</h1>
<p class="label">{who}</p>
{#if p.eventType && days !== null && days >= 0}
  <p class="notice"><strong>{p.eventType}</strong> in {days} {days === 1 ? 'day' : 'days'}, on {fmtDate(p.eventDate)}.</p>
{/if}

<nav class="tabs" aria-label="Hub sections">
  {#each MODULES as m}
    <a href="#/hub/{m.id}" aria-current={m.id === current.id ? 'page' : undefined}>{m.name}</a>
  {/each}
</nav>

<section aria-labelledby="tab-title">
  <div class="block">
    <div class="head"><span class="n">{MODULES.indexOf(current) + 1}</span><span class="t" id="tab-title">{current.name}: study status</span></div>
    <div class="in">
      <p><span class="num">{learned}</span> of <span class="num">{cards.length}</span> cards learned. <span class="num">{due}</span> due today.</p>
      <div class="row" style="margin-top: 0">
        <a class="btn primary" href="#/cards/{current.id}">Study cards</a>
        <a class="btn" href="#/train/quiz?module={current.id}&n=10">Test yourself</a>
        <a class="btn" href="#/guide">Study Guide</a>
      </div>
    </div>
  </div>

  {#each topics as topic}
    <h2>{topic.name}</h2>
    <FactTable rows={topic.rows} />
  {/each}

  <p class="help" style="margin-top: 24px">Your instructor and your unit's standing orders outrank anything on this page. Not an official publication.</p>
</section>
