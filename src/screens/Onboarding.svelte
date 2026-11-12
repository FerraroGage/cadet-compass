<script lang="ts">
  import { app, save, type Profile } from '../lib/store.svelte';
  import { GOALS } from '../lib/quiz';

  // Ranks and billets exactly as the Cadet Handbook lists them (p. 10 to 11).
  const RANKS = ['Cadet Private', 'Cadet Private First Class', 'Cadet Lance Corporal', 'Cadet Corporal', 'Cadet Sergeant', 'Cadet Staff Sergeant', 'Cadet Gunnery Sergeant', 'Cadet First Sergeant', 'Cadet Sergeant Major', 'Cadet Second Lieutenant', 'Cadet First Lieutenant', 'Cadet Captain', 'Cadet Major', 'Cadet Lieutenant Colonel', 'Cadet Colonel'];
  const BILLETS = ['Fire Team Leader', 'Squad Leader', 'Company Clerk', 'Company Guide', 'Company Supply Sergeant', 'Platoon Sergeant', 'Company Gunnery Sergeant', 'Company First Sergeant', 'Battalion Sergeant Major', 'Platoon Commander', 'Company Executive Officer', 'Public Affairs Officer/Historian', 'S-1 Administrative Officer', 'S-3 Operations Officer', 'S-4 Logistics Officer', 'Company Commander', 'Battalion Executive Officer', 'Battalion Commander'];
  const PROGRAMS = [['usmc', 'Marine Corps JROTC'], ['army', 'Army JROTC'], ['navy', 'Navy JROTC'], ['usaf', 'Air Force JROTC'], ['ussf', 'Space Force JROTC'], ['uscg', 'Coast Guard JROTC']];
  const LEVELS = ['New cadet', 'LE-I', 'LE-II', 'LE-III', 'LE-IV'];

  let { edit = false }: { edit?: boolean } = $props();
  let f = $state<Profile>($state.snapshot(app.profile) ?? { branch: 'usmc', region: '', unit: '', level: 'New cadet', rank: 'Not sure', billet: 'None', goals: [], minutes: 10, eventType: '', eventDate: '' });

  async function submit(e: Event) {
    e.preventDefault();
    await save('profile', { ...f, region: f.region.trim(), unit: f.unit.trim() });
    location.hash = '#/hub';
  }
</script>

<h1>{edit ? 'Cadet profile' : 'Cadet profile sheet'}</h1>
<p>Fill this in once. It sets what you study first. Everything on this sheet stays on this device. No name, email or location is asked for.</p>

<form onsubmit={submit}>
  <fieldset class="block">
    <legend><span class="n">1</span><span class="t">Program</span></legend>
    <div class="in">
      {#each PROGRAMS as [id, name]}
        <label class="opt">
          <input type="radio" name="branch" value={id} bind:group={f.branch} disabled={id !== 'usmc'} />
          <span>{name} {#if id !== 'usmc'}<small>Content not published yet</small>{/if}</span>
        </label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">2</span><span class="t">Region and unit (optional)</span></legend>
    <div class="in cols">
      <label class="field"><span class="label">Region</span>
        <input type="text" bind:value={f.region} maxlength="30" autocomplete="off" />
        <span class="help">MCJROTC is divided into regions. Ask your instructor which one is yours.</span>
      </label>
      <label class="field"><span class="label">School or unit</span>
        <input type="text" bind:value={f.unit} maxlength="60" autocomplete="off" />
        <span class="help">Shown on your hub only. It is not sent anywhere.</span>
      </label>
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">3</span><span class="t">Leadership Education level</span></legend>
    <div class="in cols">
      {#each LEVELS as l}
        <label class="opt"><input type="radio" name="level" value={l} bind:group={f.level} /><span>{l}</span></label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">4</span><span class="t">Current rank and billet</span></legend>
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
    <legend><span class="n">5</span><span class="t">Goals (mark any)</span></legend>
    <div class="in cols">
      {#each GOALS as g}
        <label class="opt"><input type="checkbox" value={g.id} bind:group={f.goals} /><span>{g.name}</span></label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">6</span><span class="t">Study time each day</span></legend>
    <div class="in cols">
      {#each [5, 10, 20] as m}
        <label class="opt"><input type="radio" name="minutes" value={m} bind:group={f.minutes} /><span>{m} minutes <small>{m} new cards a day</small></span></label>
      {/each}
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

  <div class="row">
    <button class="btn primary" type="submit">{edit ? 'Save profile' : 'Save and open the hub'}</button>
    {#if edit}<a class="btn" href="#/settings">Cancel</a>{/if}
  </div>
</form>
