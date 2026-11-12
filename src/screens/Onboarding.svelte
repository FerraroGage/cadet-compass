<script lang="ts">
  import { app, save, today, type Profile } from '../lib/store.svelte';
  import { GOALS } from '../lib/quiz';
  import { TERMS } from '../legal/terms';
  import Logo from '../lib/Logo.svelte';

  // Ranks and billets exactly as the Cadet Handbook lists them (p. 10 to 11).
  const RANKS = ['Cadet Private', 'Cadet Private First Class', 'Cadet Lance Corporal', 'Cadet Corporal', 'Cadet Sergeant', 'Cadet Staff Sergeant', 'Cadet Gunnery Sergeant', 'Cadet First Sergeant', 'Cadet Sergeant Major', 'Cadet Second Lieutenant', 'Cadet First Lieutenant', 'Cadet Captain', 'Cadet Major', 'Cadet Lieutenant Colonel', 'Cadet Colonel'];
  const BILLETS = ['Fire Team Leader', 'Squad Leader', 'Company Clerk', 'Company Guide', 'Company Supply Sergeant', 'Platoon Sergeant', 'Company Gunnery Sergeant', 'Company First Sergeant', 'Battalion Sergeant Major', 'Platoon Commander', 'Company Executive Officer', 'Public Affairs Officer/Historian', 'S-1 Administrative Officer', 'S-3 Operations Officer', 'S-4 Logistics Officer', 'Company Commander', 'Battalion Executive Officer', 'Battalion Commander'];
  const PROGRAMS = [['usmc', 'Marine Corps JROTC'], ['army', 'Army JROTC'], ['navy', 'Navy JROTC'], ['usaf', 'Air Force JROTC'], ['ussf', 'Space Force JROTC'], ['uscg', 'Coast Guard JROTC']];
  const LEVELS = ['New cadet', 'LE-I', 'LE-II', 'LE-III', 'LE-IV'];
  const BLANK: Profile = { branch: 'usmc', region: '', unit: '', level: 'New cadet', rank: 'Not sure', billet: 'None', goals: [], minutes: 10, eventType: '', eventDate: '' };

  let { edit = false }: { edit?: boolean } = $props();
  // This is also the first screen of the app, where the cadet agrees to the Terms.
  const mustAgree = app.terms?.version !== TERMS[0].version;
  // A half-filled sheet survives a trip to read the Terms. The draft lives in this tab only and is cleared on save.
  const draft = () => { try { return JSON.parse(sessionStorage.getItem('draft') ?? 'null'); } catch { return null; } };
  let f = $state<Profile>($state.snapshot(app.profile) ?? draft() ?? BLANK);
  let agreed = $state(false);
  // First launch opens on the welcome screen; a saved draft means the cadet is already past it.
  let started = $state(!!app.profile || !!draft());
  $effect(() => { if (started && !app.profile) try { sessionStorage.setItem('draft', JSON.stringify(f)); } catch { /* private mode */ } });

  async function submit(e: Event) {
    e.preventDefault();
    if (mustAgree) await save('terms', { version: TERMS[0].version, acceptedOn: today() });
    await save('profile', { ...f, region: f.region.trim(), unit: f.unit.trim() });
    try { sessionStorage.removeItem('draft'); } catch { /* private mode */ }
    location.hash = '#/hub';
  }
</script>

{#if !started}
  <div class="welcome">
    <Logo size={88} />
    <h1>Gigline</h1>
    <p>A study aid for JROTC cadets. Know your knowledge before the inspection does.</p>
    <ol class="steps">
      <li><div><strong>Set up your plan</strong><span>Rank, goals and study time. About a minute.</span></div></li>
      <li><div><strong>Take the placement test</strong><span>It finds what you know and what you do not.</span></div></li>
      <li><div><strong>Study your cards each day</strong><span>The app brings back what you missed until it sticks.</span></div></li>
      <li><div><strong>Look things up in the Hub</strong><span>Ranks, ribbons, chain of command, uniform, drill and more.</span></div></li>
    </ol>
    <button class="btn primary" type="button" onclick={() => { started = true; scrollTo(0, 0); }}>Get started</button>
    <p class="help">No account. No name, email or location. Everything you enter stays on this device. Unofficial: not endorsed by any military service.</p>
  </div>
{:else}
{#if edit}
  <h1>Cadet profile</h1>
{:else}
  <h1>Set up your study plan</h1>
  <p class="help">Tell the app about yourself and it picks what you study first.</p>
{/if}

<form onsubmit={submit}>
  <fieldset class="block">
    <legend><span class="n">1</span><span class="t">Program</span></legend>
    <div class="in">
      <select bind:value={f.branch} aria-label="Program">
        {#each PROGRAMS as [id, name]}<option value={id} disabled={id !== 'usmc'}>{name}{id !== 'usmc' ? ' (not published yet)' : ''}</option>{/each}
      </select>
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">2</span><span class="t">Leadership Education level</span></legend>
    <div class="in">
      <select bind:value={f.level} aria-label="Leadership Education level">{#each LEVELS as l}<option>{l}</option>{/each}</select>
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">3</span><span class="t">Current rank and billet</span></legend>
    <div class="in cols">
      <label class="field"><span class="label">Rank</span>
        <select bind:value={f.rank}><option>Not sure</option>{#each RANKS as r}<option>{r}</option>{/each}</select>
      </label>
      <label class="field"><span class="label">Billet</span>
        <select bind:value={f.billet}><option>None</option><option>Not sure</option>{#each BILLETS as b}<option>{b}</option>{/each}</select>
      </label>
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">4</span><span class="t">Goals (mark any)</span></legend>
    <div class="in cols">
      {#each GOALS as g}
        <label class="opt"><input type="checkbox" value={g.id} bind:group={f.goals} /><span>{g.name}</span></label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">5</span><span class="t">Study time each day</span></legend>
    <div class="in cols">
      {#each [5, 10, 20] as m}
        <label class="opt"><input type="radio" name="minutes" value={m} bind:group={f.minutes} /><span>{m} minutes <small>{m} new cards a day</small></span></label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">6</span><span class="t">Region and unit (optional)</span></legend>
    <div class="in cols">
      <label class="field"><span class="label">Region</span>
        <input type="text" bind:value={f.region} maxlength="30" autocomplete="off" />
        <span class="help">Ask your instructor which region is yours.</span>
      </label>
      <label class="field"><span class="label">School or unit</span>
        <input type="text" bind:value={f.unit} maxlength="60" autocomplete="off" />
      </label>
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">7</span><span class="t">Upcoming date (optional)</span></legend>
    <div class="in cols">
      <label class="field"><span class="label">Event</span>
        <select bind:value={f.eventType}><option value="">None</option><option>Inspection</option><option>Promotion board</option><option>Competition</option></select>
      </label>
      <label class="field"><span class="label">Date</span><input type="date" bind:value={f.eventDate} /></label>
    </div>
  </fieldset>

  {#if mustAgree}
    <fieldset class="block">
      <legend><span class="n">8</span><span class="t">Before you start</span></legend>
      <div class="in">
        <ul>
          <li>This is an unofficial study aid. It is not affiliated with or endorsed by the Department of Defense, any military service or any JROTC program.</li>
          <li>Your instructor and your unit's orders outrank anything in this app.</li>
          <li>You must be 13 or older. If you are under 18, you need a parent's or guardian's permission.</li>
        </ul>
        <p>Read the <a href="#/settings/terms">Terms of Service</a> and the <a href="#/settings/privacy">Privacy Policy</a>.</p>
        <label class="opt"><input type="checkbox" bind:checked={agreed} required /><span>I agree to the Terms of Service</span></label>
      </div>
    </fieldset>
  {/if}

  <div class="row">
    <button class="btn primary" type="submit">{edit ? 'Save profile' : 'Save and start'}</button>
    {#if edit}<a class="btn" href="#/settings">Cancel</a>{/if}
  </div>
</form>
{/if}
