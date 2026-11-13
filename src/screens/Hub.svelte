<script lang="ts">
  // Home: today's goal, level, a short plan, and the reference tables for the cadet's branch.
  import { app, facts, today, fmtDate, level, streak, branchName } from '../lib/store.svelte';
  import { MODULES, quizzable, modulePriority, summarize } from '../lib/quiz';
  import FactTable from '../lib/FactTable.svelte';

  let { tab }: { tab?: string } = $props();
  const t = today();
  const p = app.profile!;
  const all = facts();
  const cards = all.filter((f) => quizzable(f, t));
  const mods = MODULES.filter((m) => all.some((f) => f.module === m.id));
  const current = $derived(mods.find((m) => m.id === tab) ?? mods[0] ?? MODULES[0]);
  const rows = $derived(all.filter((f) => f.module === current.id));
  const topics = $derived([...new Set(rows.map((f) => f.topic))].map((name) => ({ name, rows: rows.filter((f) => f.topic === name) })));

  const goal = p.minutes || 10;
  const done = $derived(Math.min(goal, app.days[t] ?? 0));
  const due = $derived(cards.filter((f) => app.progress[f.id] && app.progress[f.id].due <= t).length);
  const lv = $derived(level());
  const days = p.eventDate ? Math.round((Date.parse(p.eventDate) - Date.parse(t)) / 864e5) : null;

  // The plan: what is due, then new cards in the module that matters most, then a quiz on it.
  // Quizzes get longer with level, and timed from level 5.
  const order = modulePriority(p.goals, app.placement?.done ? summarize(app.placement.answers) : null);
  const focus = MODULES.find((m) => m.id === order.find((id) => cards.some((f) => f.module === id && !app.progress[f.id])))
    ?? MODULES.find((m) => m.id === order[0])!;
  const quiz = $derived(`#/train/quiz?module=${focus.id}&n=${lv.level >= 4 ? 15 : 10}${lv.level >= 5 ? '&timer=20' : ''}`);
  const plan = $derived([
    !app.placement?.done && ['#/test', 'Take the placement test', 'Finds your strengths and gaps', '+50 XP'],
    due > 0 && ['#/cards', `Review ${due} due ${due === 1 ? 'card' : 'cards'}`, 'What you missed comes back first', '+10 XP'],
    [`#/cards/${focus.id}`, `Learn new ${focus.name} cards`, `${goal} cards, picked for your goals`, '+10 XP'],
    [quiz, `Quiz: ${focus.name}`, 'Pass with 70 percent. More XP for a higher score.', 'up to +30 XP'],
  ].filter(Boolean) as string[][]);
  const R = 34, C = 2 * Math.PI * R;
</script>

<h1>{p.name === 'Cadet' ? 'Welcome, cadet' : `Welcome, ${p.name}`}</h1>
<p class="label">{[branchName(p.branch) + ' JROTC', p.level, p.region].filter(Boolean).join(' / ')}</p>
{#if p.eventType && days !== null && days >= 0}
  <p class="notice"><strong>{p.eventType}</strong> in {days} {days === 1 ? 'day' : 'days'}, on {fmtDate(p.eventDate)}.</p>
{/if}

{#if !cards.length}
  <p class="notice"><strong>Study content for {branchName(p.branch)} JROTC is not published yet.</strong> Nothing here is invented, so each branch is added only once it has been checked against that program's own publications. You can switch program in <a href="#/profile/edit">your profile</a>.</p>
{:else}
  <div class="today">
    <div class="ringwrap" role="img" aria-label="{done} of {goal} items done today">
      <svg class="ring" width="88" height="88" viewBox="0 0 88 88"><circle class="t" cx="44" cy="44" r={R} /><circle class="v" cx="44" cy="44" r={R} stroke-dasharray={C} stroke-dashoffset={C * (1 - done / goal)} /></svg>
      <b>{done}/{goal}</b>
    </div>
    <div>
      <h2>{done >= goal ? 'Daily goal met' : `${goal - done} to go today`}</h2>
      <p>{streak() ? `${streak()}-day streak. ` : ''}{due} {due === 1 ? 'card' : 'cards'} due.</p>
    </div>
    <a class="btn gold" href="#/cards">{due ? 'Study now' : 'Learn new cards'}</a>
  </div>

  <a class="lvl" href="#/profile" aria-label="Level {lv.level}. {lv.into} of {lv.span} XP to the next level.">
    <span class="badge">{lv.level}</span>
    <span>Level {lv.level} <span class="num">{lv.into} / {lv.span} XP</span></span>
    <span class="meter"><i style="width: {(lv.into / lv.span) * 100}%"></i></span>
  </a>

  <h2>Today's plan</h2>
  <ol class="plan">
    {#each plan as [href, name, note, xp], i}
      <li><a {href}><span class="n">{i + 1}</span><span><strong>{name}</strong><small>{note}</small></span><span class="xp">{xp}</span></a></li>
    {/each}
  </ol>

  <h2>Look it up</h2>
  <nav class="tabs" aria-label="Modules" style="margin-top: 8px">
    {#each mods as m}
      <a href="#/hub/{m.id}" aria-current={m.id === current.id ? 'page' : undefined}>{m.name}</a>
    {/each}
  </nav>
  <section aria-label={current.name}>
    <div class="row" style="margin: 8px 0 16px">
      <a class="btn" href="#/cards/{current.id}">Study {current.name}</a>
      <a class="btn" href="#/train/quiz?module={current.id}&n=10">Test yourself</a>
    </div>
    {#each topics as topic, i}
      <details class="fold" open={i === 0 && !!tab}>
        <summary>{topic.name}<span class="label">{topic.rows.length}</span></summary>
        <FactTable rows={topic.rows} />
      </details>
    {/each}
  </section>
{/if}

<p class="help" style="margin-top: 24px">Your instructor and your unit's standing orders outrank anything in this app. Cadet Compass is an unofficial study aid.</p>
