<script lang="ts">
  import { app, facts, save, level, today } from '../lib/store.svelte';
  import { UNLOCK } from '../lib/xp';
  import { MODULES, quizzable } from '../lib/quiz';

  let { custom = false }: { custom?: boolean } = $props();
  const t = today();
  const mine = facts().filter((f) => quizzable(f, t));

  let f = $state({ module: '', topic: '', type: 'mc', n: '10', diff: '', timer: '', pool: 'all' });
  let eventType = $state(app.profile!.eventType);
  let eventDate = $state(app.profile!.eventDate);
  const topics = $derived([...new Set(mine.filter((x) => x.module === f.module).map((x) => x.topic))]);
  $effect(() => { if (!topics.includes(f.topic)) f.topic = ''; });

  async function start(e: Event) {
    e.preventDefault();
    await save('profile', { ...$state.snapshot(app.profile!), eventType: eventDate ? eventType || 'Inspection' : '', eventDate });
    location.hash = '#/train/quiz?' + new URLSearchParams(Object.entries(f).filter(([, v]) => v));
  }

  const lvl = level().level;
  /** The level an event needs, or 0 when it is open. */
  const need = (href: string) => { const min = UNLOCK[href.split('/')[2]] ?? 0; return min > lvl ? min : 0; };
  // [link, name, what it is, icon path on a 24 grid]
  const GAMES = [
    ['#/train/speed', 'Speed Round', 'Ten questions against the clock. Faster answers and streaks score more.', 'M13 2 4 14h7l-1 8 9-12h-7z'],
    ['#/train/match', 'Match Up', 'Six questions, six answers. Tap the pairs as fast as you can.', 'M4 4h7v7H4zM13 13h7v7h-7zM13 4h7v7h-7zM4 13h7v7H4z'],
    ['#/train/order/ranks', 'Seniority Ladder', 'Put cadet ranks in order, senior first.', 'M6 20h12M8 16h8M10 12h4M12 4v4'],
    ['#/train/order/ribbons', 'Rack Builder', 'Put ribbons in order of precedence.', 'M4 7h5v4H4zM10 7h5v4h-5zM16 7h4v4h-4zM7 13h5v4H7zM13 13h5v4h-5z'],
    ['#/train/order/chain', 'Chain Builder', 'Rebuild the chain of command from the top down.', 'M9 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0M9 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0M12 10v4'],
  ];
  const TESTS = [
    ['#/test', 'Placement test', 'Adaptive test that finds your strengths and gaps.'],
    ['#/train/custom', 'Custom quiz', 'Pick module, question type, count, difficulty and timer.'],
    ['#/train/board', 'Mock promotion board', 'Ten board questions, answered aloud, with a score sheet.'],
  ];
</script>

{#if !custom}
  <h1>Play</h1>
  <p class="label">Level {lvl}. More events open as you level up. Every game earns XP.</p>
  <h2>Games</h2>
  <div class="games">
    {#each GAMES as [href, name, note, icon]}
      {#if need(href)}
        <div class="gcard lock"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={icon} /></svg><strong>{name}</strong><small>Opens at level {need(href)}</small></div>
      {:else}
        <a class="gcard" {href}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={icon} /></svg><strong>{name}</strong><small>{note}</small>{#if app.scores[href.split('/')[2]]}<span class="best">Best {href.includes('match') ? app.scores.match + 's' : app.scores[href.split('/')[2]].toLocaleString()}</span>{/if}</a>
      {/if}
    {/each}
  </div>
  <h2>Tests</h2>
  <ol class="plan">
    {#each TESTS as [href, name, note], i}
      <li>
        {#if need(href)}
          <div class="lock"><span class="n">{i + 1}</span><span><strong>{name}</strong><small>{note}</small></span><span class="xp">Level {need(href)}</span></div>
        {:else}
          <a {href}><span class="n">{i + 1}</span><span><strong>{name}</strong><small>{note}</small></span></a>
        {/if}
      </li>
    {/each}
  </ol>
{:else if need('#/train/custom')}
  <h1>Custom training</h1>
  <p class="notice">Custom training opens at level {need('#/train/custom')}. Finish a few lessons and quizzes to get there.</p>
  <div class="row"><a class="btn" href="#/train">Training menu</a></div>
{:else}
  <h1>Custom training</h1>
  <form onsubmit={start}>
    <fieldset class="block">
      <legend><span class="n">1</span><span class="t">What to study</span></legend>
      <div class="in cols">
        <label class="field"><span class="label">Module</span>
          <select bind:value={f.module}><option value="">All modules</option>{#each MODULES.filter((m) => mine.some((x) => x.module === m.id)) as m}<option value={m.id}>{m.name}</option>{/each}</select>
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
