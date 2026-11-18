<script lang="ts">
  // First launch: one question per screen. Every answer is saved as it is given, so Back loses nothing
  // and closing the app resumes on the same screen.
  import { tick as domTick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { app, save, facts, today, award, makeDue, hooks, setHidden, BLANK, BRANCHES, STATES, branchName, type Profile } from '../lib/store.svelte';
  import { GOALS, MODULES, quizzable, buildQuestion, newPlacement, nextFact, record, summarize, gaps, modulePriority, type Question } from '../lib/quiz';
  import type { Fact } from '../lib/bundle';
  import { TERMS } from '../legal/terms';
  import { configured } from '../lib/backend';
  import Account from './Account.svelte';
  import Skip from '../lib/Skip.svelte';

  const STEPS = ['splash', 'branch', 'region', 'level', 'goal', 'exp', 'time', 'theme', 'test', 'build', 'results', 'remind', 'account'] as const;
  type Step = (typeof STEPS)[number];
  const OPTIONAL: Step[] = ['region', 'goal', 'remind'];
  const EXP: [1 | 2 | 3, string, string][] = [[1, 'Brand new', 'I am just starting out'], [2, 'I know the basics', 'I can answer some questions'], [3, 'Squared away', 'I want the harder material']];
  const TEST_LENGTH = 10;

  let step = $state<Step>(STEPS.includes(app.step as Step) ? (app.step as Step) : 'splash');
  let dir = $state(1);
  let signingIn = $state(false);
  let agreed = $state(false);
  const p = $state<Profile>({ ...BLANK, ...$state.snapshot(app.profile) });
  const t = today();
  const slide = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240;
  const index = $derived(STEPS.indexOf(step));

  // Marine Corps JROTC calls its years Leadership Education I to IV (Cadet Handbook). Other programs get plain year numbers.
  const levels = $derived(['New cadet', ...['I', 'II', 'III', 'IV'].map((n, i) => (p.branch === 'usmc' ? `LE-${n}` : `Year ${i + 1}`))]);

  async function show(next: Step, d: 1 | -1) {
    dir = d;
    step = next;
    await save('profile', p);
    await save('step', next);
    scrollTo(0, 0);
    await domTick();
    document.querySelector<HTMLElement>('.ob h1')?.focus({ preventScroll: true }); // screen readers announce the new question
  }
  const next = () => show(STEPS[index + 1], 1);
  // Back from the results goes to the last question the cadet can change, not back into the test.
  const back = (e: MouseEvent) => {
    if (p.branch) flush(e, 'out');
    return show(['results', 'test'].includes(step) ? 'theme' : STEPS[index - 1], -1);
  };

  const ok = $derived(
    step === 'branch' ? !!p.branch : step === 'level' ? !!p.level : 
    step === 'exp' ? p.experience > 0 : step === 'time' ? p.minutes > 0 : true,
  );
  // The flush: a soft circle of branch color grows from the tap ('in') or shrinks back into it ('out').
  let wash = $state<{ x: number; y: number; name: string; dir: 'in' | 'out'; key: number } | null>(null);
  let washTimer: ReturnType<typeof setTimeout> | undefined;
  function flush(e: MouseEvent, dir: 'in' | 'out') {
    if (!slide) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    wash = { x: e.clientX || r.left + r.width / 2, y: e.clientY || r.top + r.height / 2, name: dir === 'in' ? branchName(p.branch) : '', dir, key: performance.now() };
    clearTimeout(washTimer);
    washTimer = setTimeout(() => (wash = null), dir === 'in' ? 1500 : 900);
  }
  function pickBranch(id: Profile['branch'], e: MouseEvent) {
    if (p.branch !== id) p.level = '';
    p.branch = id;
    document.documentElement.dataset.branch = id;
    flush(e, 'in');
  }
  const toggleGoal = (id: string) => { p.goals = p.goals.includes(id) ? p.goals.filter((g) => g !== id) : [...p.goals, id]; };

  // ---- Placement test: one question per screen, marked the moment it is answered ----
  const pool = $derived(facts().filter((f) => quizzable(f, t) && buildQuestion(f, facts())));
  let cur = $state<{ fact: Fact; q: Question } | null>(null);
  let picked = $state<number | null>(null);
  const testing = $derived(!!app.placement && !app.placement.done);
  function loadQuestion() {
    const fact = testing ? nextFact(app.placement!, pool) : null;
    cur = fact ? { fact, q: buildQuestion(fact, facts())! } : null;
    picked = null;
  }
  async function startTest() {
    await save('placement', newPlacement(pool.length, TEST_LENGTH, Math.min(2, Math.max(1, (p.experience || 2) - 1)) as 1 | 2));
    loadQuestion();
  }
  async function pick(i: number) {
    if (!cur || picked !== null) return;
    picked = i;
    const after = record(app.placement!, { factId: cur.fact.id, module: cur.fact.module, correct: i === cur.q.correct, sure: true }, t);
    await save('placement', after);
    if (after.done) await makeDue(gaps(after.answers));
  }
  // Not taught in this program: hide it and show a different question. Nothing is recorded for it.
  async function swapQuestion() {
    if (!cur) return;
    await setHidden([cur.fact.id], true);
    loadQuestion();
  }
  async function skipTest() {
    cur = null; // the question on screen reads the test, so clear it first
    if (testing) await save('placement', null);
    await show('build', 1);
  }
  $effect(() => { if (step === 'test' && testing && !cur && picked === null) loadQuestion(); });

  // ---- "Building your plan": three lines tick off, then the results ----
  let built = $state(0);
  $effect(() => {
    if (step !== 'build') return;
    built = 0;
    const ids = [600, 1300, 2000].map((ms, i) => setTimeout(() => (built = i + 1), slide ? ms : 0));
    ids.push(setTimeout(() => void show('results', 1), slide ? 2800 : 600));
    return () => ids.forEach(clearTimeout);
  });

  const results = $derived(app.placement?.done ? summarize(app.placement.answers).filter((r) => r.asked) : null);
  const path = $derived(modulePriority(p.goals, app.placement?.done ? summarize(app.placement.answers) : null).slice(0, 4).map((m) => MODULES.find((x) => x.id === m)!.name));

  async function remind(want: boolean) {
    let on = false;
    if (want && 'Notification' in window) on = (await Notification.requestPermission()) === 'granted';
    await save('remind', on);
    await next();
  }

  async function finish() {
    p.joined ||= t;
    await save('profile', p);
    await save('terms', { version: TERMS[0].version, acceptedOn: t });
    await save('onboarded', true);
    await save('step', '');
    await hooks.profile();
    if (app.placement?.done) await award('placement');
    location.hash = '#/hub';
  }
</script>

{#if wash}{#key wash.key}<div class="wash {wash.dir}" style="--x: {wash.x}px; --y: {wash.y}px" aria-hidden="true">{#if wash.name}<b>{wash.name}</b>{/if}</div>{/key}{/if}
<div class="ob">
  <div class="ob-top">
    {#if step !== 'splash' && step !== 'build'}
      <button class="back" onclick={back} aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <div class="meter" role="progressbar" aria-label="Setup progress" aria-valuemin="0" aria-valuemax={STEPS.length - 1} aria-valuenow={index}><i style="width: {(index / (STEPS.length - 1)) * 100}%"></i></div>
    {/if}
  </div>

  <div class="ob-body">
    {#key step}
      <section in:fly={{ x: 48 * dir, duration: slide }} out:fly={{ x: -48 * dir, duration: slide }}>
        {#if step === 'splash'}
          <div class="hero">
            <img class="logo-light" src="./icons/logo.svg" alt="Cadet Compass" width="1100" height="300" /><img class="logo-dark" src="./icons/logo-dark.svg" alt="Cadet Compass" width="1100" height="300" />
            <h1 tabindex="-1" class="sr">Cadet Compass</h1>
            <p>Find your way through JROTC.</p>
            <span class="help">Ranks, ribbons, chain of command, uniform, drill and general knowledge. An unofficial study aid.</span>
          </div>
          {#if signingIn}<Account start="in" />{/if}

        {:else if step === 'branch'}
          <h1 tabindex="-1">Which JROTC program are you in?</h1>
          <div class="picks" role="radiogroup" aria-label="Program">
            {#each BRANCHES as b}
              <button class="pick" role="radio" aria-checked={p.branch === b.id} onclick={(e) => pickBranch(b.id, e)}><span>{b.name}</span></button>
            {/each}
          </div>

        {:else if step === 'region'}
          <h1 tabindex="-1">Which state is your unit in?</h1>
          <p class="help">Optional. Your state tells the app which region you are in. Nothing more exact is asked for or kept.</p>
          <label class="field" style="margin-top: 16px"><span class="label">State or territory</span>
            <select bind:value={p.region}><option value="">Choose one</option>{#each STATES as s}<option>{s}</option>{/each}</select>
          </label>

        {:else if step === 'level'}
          <h1 tabindex="-1">What year are you in the program?</h1>
          <div class="picks" role="radiogroup" aria-label="Cadet level">
            {#each levels as l}
              <button class="pick" role="radio" aria-checked={p.level === l} onclick={() => (p.level = l)}><span>{l}</span></button>
            {/each}
          </div>

        {:else if step === 'goal'}
          <h1 tabindex="-1">What are you studying for?</h1>
          <p class="help">Optional. Pick any that apply and your plan puts them first, or skip this.</p>
          <div class="picks" role="group" aria-label="Study goals">
            {#each GOALS as g}
              <button class="pick" role="checkbox" aria-checked={p.goals.includes(g.id)} onclick={() => toggleGoal(g.id)}><span>{g.name}</span></button>
            {/each}
          </div>

        {:else if step === 'exp'}
          <h1 tabindex="-1">How much do you know already?</h1>
          <div class="picks" role="radiogroup" aria-label="Experience">
            {#each EXP as [n, name, note]}
              <button class="pick" role="radio" aria-checked={p.experience === n} onclick={() => (p.experience = n)}><span>{name}<small>{note}</small></span></button>
            {/each}
          </div>

        {:else if step === 'theme'}
          <h1 tabindex="-1">Light or dark?</h1>
          <p class="help">You can change this later in Settings.</p>
          <div class="picks" role="radiogroup" aria-label="Appearance">
            {#each [['light', 'Light', 'Bright screen, best in daylight'], ['dark', 'Dark', 'Easier on the eyes at night'], ['system', 'Match my device', 'Follows your phone setting']] as [id, name, note]}
              <button class="pick" role="radio" aria-checked={app.theme === id} onclick={() => save('theme', id as 'light' | 'dark' | 'system')}><span>{name}<small>{note}</small></span></button>
            {/each}
          </div>

        {:else if step === 'time'}
          <h1 tabindex="-1">How long can you study each day?</h1>
          <p class="help">This sets your daily goal. You can change it later.</p>
          <div class="picks two" role="radiogroup" aria-label="Daily study time">
            {#each [5, 10, 15, 20] as m}
              <button class="pick" role="radio" aria-checked={p.minutes === m} onclick={() => (p.minutes = m)}><span>{m} min<small>{m} items a day</small></span></button>
            {/each}
          </div>

        {:else if step === 'test'}
          {#if pool.length < TEST_LENGTH}
            <h1 tabindex="-1">No placement test yet</h1>
            <p>Study content for {branchName(p.branch)} JROTC is not published yet, so there is nothing to test you on. Your plan will be built from your goals.</p>
          {:else if cur}
            <p class="label" style="margin-top: 16px">Question {app.placement!.answers.length + (picked === null ? 1 : 0)} of {app.placement!.length} / {MODULES.find((m) => m.id === cur!.fact.module)?.name}</p>
            <h1 tabindex="-1" id="question" style="margin-top: 4px">{cur.fact.q}</h1>
            <div class="picks" role="radiogroup" aria-labelledby="question">
              {#each cur.q.choices as c, i}
                <button class="pick" class:right={picked !== null && i === cur.q.correct} class:wrong={picked === i && i !== cur.q.correct}
                  role="radio" aria-checked={picked === i} disabled={picked !== null} onclick={() => pick(i)}><span>{c}</span></button>
              {/each}
            </div>
            {#if picked === null}<Skip onskip={swapQuestion} />{/if}
            {#if picked !== null}
              <div class="feedback {picked === cur.q.correct ? 'good' : 'bad'}" role="status">
                <p class="verdict {picked === cur.q.correct ? 'good' : 'bad'}">{picked === cur.q.correct ? 'Correct' : 'Not quite'}</p>
                <p style="margin: 0">{cur.fact.text}</p>
              </div>
            {/if}
          {:else}
            <h1 tabindex="-1">Take a quick placement test</h1>
            <p>{TEST_LENGTH} questions, about two minutes. It finds what you already know so your plan starts in the right place.</p>
            <p class="help">You see the answer after each question. What you miss goes into your first cards.</p>
            {#if app.placement?.done}<p class="notice">You have taken this test. Take it again, or skip to keep your results.</p>{/if}
          {/if}

        {:else if step === 'build'}
          <h1 tabindex="-1" style="margin-top: 48px">Building your plan</h1>
          <ul class="build" role="status">
            <li class:on={built > 0}>Sorting {facts().length} {branchName(p.branch)} items</li>
            <li class:on={built > 1}>Putting your goals first</li>
            <li class:on={built > 2}>Setting a {p.minutes}-minute daily goal</li>
          </ul>

        {:else if step === 'results'}
          <h1 tabindex="-1">Your plan is ready</h1>
          {#if results}
            <p class="help">From your placement test: {app.placement!.answers.filter((a) => a.correct).length} of {app.placement!.answers.length} correct.</p>
            <div class="bars">
              {#each results as r}
                <div class:weak={r.score < 0.5}>
                  <span>{r.name}</span><span>{r.score >= 0.5 ? 'Strength' : 'Gap'}</span>
                  <span class="meter" role="img" aria-label="{r.correct} of {r.asked} correct"><i style="width: {Math.max(6, r.score * 100)}%"></i></span>
                </div>
              {/each}
            </div>
          {:else}
            <p class="help">No placement test taken, so the plan follows your goals. You can take the test later from Train.</p>
          {/if}
          <h2>Your path</h2>
          <ol class="plan">
            {#each path as name, i}<li><div><span class="n">{i + 1}</span><strong>{name}</strong></div></li>{/each}
          </ol>
          <p class="help" style="margin-top: 16px">{p.minutes} items a day. Cards you miss come back until they stick.</p>

        {:else if step === 'remind'}
          <h1 tabindex="-1">Want a nudge to study?</h1>
          <p>A {p.minutes}-minute habit works best when it happens every day. Turn on reminders and the app can prompt you when it is time.</p>
          <p class="help">Optional. You can change this in your device settings at any time.</p>

        {:else if step === 'account'}
          <h1 tabindex="-1">Save your progress</h1>
          <p>Make a free account to keep your progress if you change phones, or carry on as a guest and make one later. Nothing you have done so far is lost either way.</p>
          <label class="opt" style="margin-top: 8px">
            <input type="checkbox" bind:checked={agreed} />
            <span>I am 13 or older and I agree to the <a href="#/settings/terms">Terms of Service</a> and <a href="#/settings/privacy">Privacy Policy</a>. <small>Cadet Compass is an unofficial study aid, not endorsed by any military service.</small></span>
          </label>
          <Account {agreed} />
        {/if}
      </section>
    {/key}
  </div>

  {#if step !== 'build'}
    <div class="ob-foot">
      <div>
        {#if step === 'splash'}
          <button class="btn primary wide" onclick={next}>Get started</button>
          {#if configured && !signingIn}<button class="btn link wide" onclick={() => (signingIn = true)}>I already have an account</button>{/if}
        {:else if step === 'test' && pool.length >= TEST_LENGTH}
          {#if cur}
            <button class="btn primary wide" disabled={picked === null} onclick={() => { if (app.placement!.done) { cur = null; picked = null; void next(); } else loadQuestion(); }}>Continue</button>
          {:else}
            <button class="btn primary wide" onclick={startTest}>{app.placement?.done ? 'Take it again' : 'Start the test'}</button>
          {/if}
          <button class="btn link wide" onclick={skipTest}>Skip the test</button>
        {:else if step === 'remind'}
          <button class="btn primary wide" onclick={() => remind(true)}>Turn on reminders</button>
          <button class="btn link wide" onclick={() => remind(false)}>Not now</button>
        {:else if step === 'account'}
          <button class="btn primary wide" disabled={!agreed} onclick={finish}>{app.user ? 'Finish' : 'Continue as guest'}</button>
        {:else}
          <button class="btn primary wide" disabled={!ok} onclick={next}>Continue</button>
          {#if OPTIONAL.includes(step)}<button class="btn link wide" onclick={next}>Skip</button>{/if}
        {/if}
      </div>
    </div>
  {/if}
</div>
