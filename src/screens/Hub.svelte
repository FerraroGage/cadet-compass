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

  // Across every module, for the card at the top.
  const all = app.bundle!.facts.filter((f) => quizzable(f, t));
  const allLearned = $derived(all.filter((f) => (app.progress[f.id]?.reps ?? 0) > 0).length);
  const allDue = $derived(all.filter((f) => app.progress[f.id] && app.progress[f.id].due <= t).length);

  const p = app.profile!;
  const days = p.eventDate ? Math.round((Date.parse(p.eventDate) - Date.parse(t)) / 864e5) : null;
  const who = [p.rank !== 'Not sure' && p.rank, !['None', 'Not sure'].includes(p.billet) && p.billet, p.level, p.region && 'Region ' + p.region, p.unit].filter(Boolean).join(' / ');
</script>

<h1>Marine Corps hub</h1>
<p class="label">{who}</p>
{#if p.eventType && days !== null && days >= 0}
  <p class="notice"><strong>{p.eventType}</strong> in {days} {days === 1 ? 'day' : 'days'}, on {fmtDate(p.eventDate)}.</p>
{/if}

<div class="today">
  <div class="big"><b>{allDue}</b> {allDue === 1 ? 'card' : 'cards'} due today</div>
  <div class="meter" role="img" aria-label="{allLearned} of {all.length} cards learned"><i style="width: {(allLearned / all.length) * 100}%"></i></div>
  <p>{allLearned} of {all.length} cards learned</p>
  <div class="row">
    <a class="btn" href="#/cards">{allDue ? 'Study now' : 'Learn new cards'}</a>
    {#if !app.placement?.done}<a class="btn ghost" href="#/test">Placement test</a>{/if}
  </div>
</div>

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

  <h2>Look it up</h2>
  {#each topics as topic, i}
    <details class="fold" open={i === 0}>
      <summary>{topic.name}<span class="label">{topic.rows.length}</span></summary>
      <FactTable rows={topic.rows} />
    </details>
  {/each}

  <p class="help" style="margin-top: 24px">Your instructor and your unit's standing orders outrank anything on this page. Not an official publication.</p>
</section>
