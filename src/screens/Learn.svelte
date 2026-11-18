<script lang="ts">
  // Learn: everything to read and study, one module at a time.
  import { app, facts, setHidden } from '../lib/store.svelte';
  import { MODULES } from '../lib/quiz';
  import FactTable from '../lib/FactTable.svelte';
  import RankInsignia from '../lib/RankInsignia.svelte';
  import { CADET_RANKS } from '../lib/cadetRanks';

  let { tab }: { tab?: string } = $props();
  const all = facts(true); // Learn lists hidden items too, so they can be turned back on
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
    {#if current.id === 'uniform' && app.profile?.branch === 'usmc'}
      <a class="act" href="#/tools/placement"><b>Placement guide</b><small>Where each item goes, with measures</small></a>
      <a class="act" href="#/tools/rack"><b>Ribbon rack builder</b><small>Build your rack and print it</small></a>
      <a class="act" href="#/tools/checklist"><b>Inspection checklist</b><small>Check yourself before you fall in</small></a>
    {/if}
    {#if current.id === 'drill'}<a class="act" href="#/train/metronome"><b>Drill metronome</b><small>Hear the cadence</small></a>{/if}
  </div>

  {#if current.id === 'ranks' && app.profile?.branch === 'usmc'}
    <h2>Rank chart</h2>
    <ul class="badges rankchart">
      {#each CADET_RANKS as r}
        <li>{#if r === 'Cadet Private'}<span class="rankcell"></span>{:else}<RankInsignia rank={r} size={72} />{/if}<span>{r}{#if r === 'Cadet Private'}<small>No insignia</small>{/if}</span></li>
      {/each}
    </ul>
  {/if}

  <h2>{current.name}: what to know <span class="label">{rows.length} items</span></h2>
  {#each topics as topic}
    {@const off = topic.rows.filter((f) => app.hidden.includes(f.id)).length}
    <details class="fold">
      <summary>{topic.name}<span class="label">{off ? `${off} hidden / ` : ''}{topic.rows.length}</span></summary>
      <div class="foldbar">
        <span class="help">Not taught in your program? Switch items off and they stop showing up in quizzes and games.</span>
        <button class="btn link" onclick={() => setHidden(topic.rows.map((f) => f.id), off < topic.rows.length)}>{off < topic.rows.length ? 'Hide this whole section' : 'Turn this section back on'}</button>
      </div>
      <FactTable rows={topic.rows} toggle />
    </details>
  {/each}

  <div class="row"><a class="btn" href="#/guide">Printable Study Guide (all modules)</a></div>
{/if}
