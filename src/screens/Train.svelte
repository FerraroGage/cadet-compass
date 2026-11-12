<script lang="ts">
  import { app, save, today } from '../lib/store.svelte';
  import { MODULES, quizzable } from '../lib/quiz';

  let { custom = false }: { custom?: boolean } = $props();
  const t = today();
  const facts = app.bundle!.facts.filter((f) => quizzable(f, t));

  let f = $state({ module: '', topic: '', type: 'mc', n: '10', diff: '', timer: '', pool: 'all' });
  let eventType = $state(app.profile!.eventType);
  let eventDate = $state(app.profile!.eventDate);
  const topics = $derived([...new Set(facts.filter((x) => x.module === f.module).map((x) => x.topic))]);
  $effect(() => { if (!topics.includes(f.topic)) f.topic = ''; });

  async function start(e: Event) {
    e.preventDefault();
    await save('profile', { ...$state.snapshot(app.profile!), eventType: eventDate ? eventType || 'Inspection' : '', eventDate });
    location.hash = '#/train/quiz?' + new URLSearchParams(Object.entries(f).filter(([, v]) => v));
  }

  const MENU = [
    ['#/test', 'Knowledge placement test', '40 adaptive questions. Builds your readiness table and training plan.'],
    ['#/train/custom', 'Custom training', 'Pick modules, question type, count, difficulty, timer and pool.'],
    ['#/guide', 'Study Guide', 'Everything in one printable document, with a test at the end of each section.'],
    ['#/train/order/ranks', 'Seniority Ladder', 'Put cadet ranks in order, senior first.'],
    ['#/train/order/ribbons', 'Rack Builder', 'Put ribbons in order of precedence against the clock.'],
    ['#/train/order/chain', 'Chain Builder', 'Rebuild the chain of command from the top down.'],
    ['#/train/board', 'Mock Promotion Board', 'Ten board questions, answered aloud, with a score sheet.'],
    ['#/train/metronome', 'Drill metronome', 'Cadence at 60, 112, 120 and 180 steps per minute.'],
  ];
</script>

{#if !custom}
  <h1>Training</h1>
  <table>
    <thead><tr><th class="num" scope="col">No.</th><th scope="col">Event</th></tr></thead>
    <tbody>
      {#each MENU as [href, name, note], i}
        <tr>
          <td class="num">{i + 1}</td>
          <td><a class="btn" style="width: 100%; justify-content: flex-start" {href}>{name}</a><p class="cite">{note}</p></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="help" style="margin-top: 16px">Rank Rush, Inspector's Eye and Call the Command are not built yet. They need insignia and uniform drawings made from official specifications, and commands taken from the drill manual.</p>
{:else}
  <h1>Custom training</h1>
  <form onsubmit={start}>
    <fieldset class="block">
      <legend><span class="n">1</span><span class="t">What to study</span></legend>
      <div class="in cols">
        <label class="field"><span class="label">Module</span>
          <select bind:value={f.module}><option value="">All modules</option>{#each MODULES as m}<option value={m.id}>{m.name}</option>{/each}</select>
        </label>
        <label class="field"><span class="label">Subtopic</span>
          <select bind:value={f.topic} disabled={!f.module}><option value="">All subtopics</option>{#each topics as name}<option>{name}</option>{/each}</select>
        </label>
      </div>
    </fieldset>

    <fieldset class="block">
      <legend><span class="n">2</span><span class="t">Question type</span></legend>
      <div class="in">
        <label class="opt"><input type="radio" name="type" value="mc" bind:group={f.type} /><span>Multiple choice</span></label>
        <label class="opt"><input type="radio" name="type" value="recall" bind:group={f.type} /><span>Written recall <small>Answer from memory, then grade yourself</small></span></label>
      </div>
    </fieldset>

    <fieldset class="block">
      <legend><span class="n">3</span><span class="t">Count, difficulty and timer</span></legend>
      <div class="in cols">
        <label class="field"><span class="label">Questions</span>
          <select bind:value={f.n}><option>5</option><option>10</option><option>20</option><option>40</option></select>
        </label>
        <label class="field"><span class="label">Difficulty</span>
          <select bind:value={f.diff}><option value="">Any</option><option value="1">Basic</option><option value="2">Standard</option><option value="3">Hard</option></select>
        </label>
        <label class="field"><span class="label">Timer</span>
          <select bind:value={f.timer} disabled={f.type === 'recall'}><option value="">Off</option><option value="10">10 seconds a question</option><option value="20">20 seconds a question</option></select>
          <span class="help">Multiple choice only.</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="block">
      <legend><span class="n">4</span><span class="t">Pool</span></legend>
      <div class="in">
        <label class="opt"><input type="radio" name="pool" value="all" bind:group={f.pool} /><span>Everything</span></label>
        <label class="opt"><input type="radio" name="pool" value="due" bind:group={f.pool} /><span>Due for review</span></label>
        <label class="opt"><input type="radio" name="pool" value="missed" bind:group={f.pool} /><span>Only what I have missed</span></label>
      </div>
    </fieldset>

    <fieldset class="block">
      <legend><span class="n">5</span><span class="t">Exam date (optional)</span></legend>
      <div class="in cols">
        <label class="field"><span class="label">Event</span>
          <select bind:value={eventType}><option value="">None</option><option>Inspection</option><option>Promotion board</option><option>Competition</option></select>
        </label>
        <label class="field"><span class="label">Date</span><input type="date" bind:value={eventDate} />
          <span class="help">Shown as a countdown on your hub.</span>
        </label>
      </div>
    </fieldset>

    <div class="row">
      <button class="btn primary" type="submit">Start</button>
      <a class="btn" href="#/train">Back</a>
    </div>
  </form>
{/if}
