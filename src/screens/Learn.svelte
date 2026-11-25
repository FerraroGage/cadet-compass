<script lang="ts">
  // Learn: everything to read and study, one module at a time.
  import { app, facts, setHidden, today } from '../lib/store.svelte';
  import { MODULES, quizzable } from '../lib/quiz';
  import FactTable from '../lib/FactTable.svelte';
  import RankInsignia from '../lib/RankInsignia.svelte';
  import Icon, { topicIcon } from '../lib/Icon.svelte';
  import type { Service } from '../lib/rankArt';
  import Ribbon from '../lib/Ribbon.svelte';
  import UniformPhotos from '../lib/UniformPhotos.svelte';

  let { tab }: { tab?: string } = $props();
  const all = facts(true); // Learn lists hidden items too, so they can be turned back on
  const mods = MODULES.filter((m) => all.some((f) => f.module === m.id));
  const current = $derived(mods.find((m) => m.id === tab) ?? mods[0]);
  const rows = $derived(current ? all.filter((f) => f.module === current.id) : []);
  // What boards and inspections ask about most comes first; background goes last. The rest keep their place between.
  const DOORS: [string, string, string, Service, string[]][] = [
    ['cadet', 'Cadet ranks', 'The 15 ranks in your program', 'cadet', ['Cadet Sergeant', 'Cadet Captain']],
    ['usmc', 'Marine Corps ranks', 'E-1 to O-10', 'usmc', ['Sergeant', 'Captain']],
    ['navy', 'Navy ranks', 'E-1 to O-10', 'navy', ['Petty Officer Second Class', 'Lieutenant']],
  ];
  const FIRST = ['Office holders', 'Order of the chain', 'Order of precedence', 'General orders', 'Orders of the Sentry', 'Cadet Creed', 'Leadership traits', 'Leadership principles', '11 Principles of Leadership', 'Core values', 'Army Values', 'Coast Guard core values', 'Guardian values', 'Placement and fit', 'Wearing the uniform', 'Insignia', 'Drill terms', 'Position of attention', 'Positions', 'Commands', 'Mission of MCJROTC'];
  const LAST = ['Enrollment', 'Eligibility', 'Program', 'Program basis', 'Program sponsorship', 'Purpose of drill', 'History', 'Drill history', 'Navy history', 'Coast Guard history', 'Marine Corps history', 'Glossary', 'Navy enlisted ranks', 'Navy officer ranks', 'Marine Corps enlisted ranks pay grades', 'Marine Corps officer ranks pay grades', 'Navy enlisted ranks pay grades', 'Navy officer ranks pay grades'];
  const place = (t: string) => (FIRST.includes(t) ? FIRST.indexOf(t) - 100 : LAST.indexOf(t) + 1);
  const topics = $derived([...new Set(rows.map((f) => f.topic))].sort((a, b) => place(a) - place(b)).map((name) => ({ name, rows: rows.filter((f) => f.topic === name) })));
</script>

<h1>Learn</h1>
{#if !current}
  <p class="notice">Study content for your branch is not published yet.</p>
{:else}
  <nav class="tabs" aria-label="Modules">
    {#each mods as m}
      <a href="#/learn/{m.id}" aria-current={m.id === current.id ? 'page' : undefined}><Icon name={m.id} size={18} />{m.name}</a>
    {/each}
  </nav>

  {#if current.id === 'ranks' && app.profile?.branch === 'usmc'}
    <div class="doors">
      {#each DOORS as [id, name, note, service, ranks]}
        <a href="#/ranks/{id}"><span class="fan">{#each ranks as r}<RankInsignia rank={r} {service} size={48} />{/each}</span><span><b>{name}</b><small>{note}</small></span></a>
      {/each}
    </div>
  {/if}

  <div class="actions">
    <a class="act" href="#/cards/{current.id}"><Icon name="cards" /><b>Flashcards</b><small>Study {current.name}, a few cards at a time</small></a>
    <a class="act" href="#/train/quiz?module={current.id}&n=10"><Icon name="quiz" /><b>Test yourself</b><small>10 questions on {current.name}</small></a>
    <a class="act" href="#/train/speed?module={current.id}"><Icon name="speed" /><b>Speed Round</b><small>Beat the clock on {current.name}</small></a>
    {#if current.id === 'uniform' && app.profile?.branch === 'usmc'}
      <a class="act" href="#/tools"><Icon name="tools" /><b>Uniform tools</b><small>Rack builder, placement guide, checklist</small></a>
    {/if}
    {#if current.id === 'drill'}<a class="act" href="#/train/metronome"><Icon name="metronome" /><b>Drill metronome</b><small>Hear the cadence</small></a>{/if}
  </div>

  {#if current.id === 'uniform' && app.profile?.branch === 'usmc'}<UniformPhotos />{/if}

  {#if current.id === 'ribbons' && app.profile?.branch === 'usmc'}
    <h2>Ribbon chart</h2>
    <ul class="badges ribbonchart">
      {#each all.filter((f) => f.group === 'ribbon' && f.order !== undefined).sort((a, b) => a.order! - b.order!) as f}
        <li><Ribbon name={f.a} width={110} /><span>{f.a}</span></li>
      {/each}
    </ul>
  {/if}

  <h2>{current.name}: what to know <span class="label">{rows.length} items</span></h2>
  {#each topics as topic}
    {@const live = topic.rows.filter((f) => quizzable(f, today()) && !app.hidden.includes(f.id)).length}
    {@const off = topic.rows.filter((f) => app.hidden.includes(f.id)).length}
    <details class="fold">
      <summary><Icon name={topicIcon(topic.name, current.id)} size={20} /><span>{topic.name}</span><span class="label">{off ? `${off} hidden / ` : ''}{topic.rows.length}</span></summary>
      {#if live >= 3}
        <div class="foldquiz">
          <a class="btn primary" href="#/train/quiz?module={current.id}&topic={encodeURIComponent(topic.name)}&n={Math.min(10, live)}">Quiz this section</a>
          <a class="btn" href="#/train/quiz?module={current.id}&topic={encodeURIComponent(topic.name)}&n={Math.min(10, live)}&type=recall">Recall</a>
          <span class="label">{live} questions</span>
        </div>
      {/if}
      <div class="foldbar">
        <span class="help">Not taught in your program? Switch items off and they stop showing up in quizzes and games.</span>
        <button class="btn link" onclick={() => setHidden(topic.rows.map((f) => f.id), off < topic.rows.length)}>{off < topic.rows.length ? 'Hide this whole section' : 'Turn this section back on'}</button>
      </div>
      <FactTable rows={topic.rows} toggle />
    </details>
  {/each}

  <div class="row"><a class="btn" href="#/guide">Printable Study Guide (all modules)</a></div>
{/if}
