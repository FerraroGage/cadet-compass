<script lang="ts">
  // Change anything answered during setup, plus display name and avatar.
  import { app, save, hooks, BRANCHES, STATES, type Profile } from '../lib/store.svelte';
  import { GOALS } from '../lib/quiz';
  import { nameProblem } from '../lib/names';
  import Avatar, { AVATARS } from '../lib/Avatar.svelte';

  // Ranks and billets exactly as the Marine Corps JROTC Cadet Handbook lists them (p. 10 to 11).
  const RANKS = ['Cadet Private', 'Cadet Private First Class', 'Cadet Lance Corporal', 'Cadet Corporal', 'Cadet Sergeant', 'Cadet Staff Sergeant', 'Cadet Gunnery Sergeant', 'Cadet First Sergeant', 'Cadet Sergeant Major', 'Cadet Second Lieutenant', 'Cadet First Lieutenant', 'Cadet Captain', 'Cadet Major', 'Cadet Lieutenant Colonel', 'Cadet Colonel'];
  const BILLETS = ['Fire Team Leader', 'Squad Leader', 'Company Clerk', 'Company Guide', 'Company Supply Sergeant', 'Platoon Sergeant', 'Company Gunnery Sergeant', 'Company First Sergeant', 'Battalion Sergeant Major', 'Platoon Commander', 'Company Executive Officer', 'Public Affairs Officer/Historian', 'S-1 Administrative Officer', 'S-3 Operations Officer', 'S-4 Logistics Officer', 'Company Commander', 'Battalion Executive Officer', 'Battalion Commander'];

  let f = $state<Profile>($state.snapshot(app.profile!));
  const problem = $derived(nameProblem(f.name));
  const levels = $derived(['New cadet', ...['I', 'II', 'III', 'IV'].map((n, i) => (f.branch === 'usmc' ? `LE-${n}` : `Year ${i + 1}`))]);
  $effect(() => { if (!levels.includes(f.level)) f.level = levels[0]; });

  async function submit(e: Event) {
    e.preventDefault();
    if (problem) return;
    await save('profile', { ...f, name: f.name.trim(), unit: f.unit.trim() });
    await hooks.profile();
    location.hash = '#/profile';
  }
</script>

<h1>Edit profile</h1>

<form onsubmit={submit}>
  <fieldset class="block">
    <legend><span class="n">1</span><span class="t">Name and avatar</span></legend>
    <div class="in">
      <label class="field"><span class="label">Display name</span>
        <input type="text" bind:value={f.name} maxlength="20" autocomplete="off" aria-invalid={!!problem} aria-describedby="name-help" />
        <span class="help" id="name-help" class:err={!!problem} role={problem ? 'alert' : undefined}>{problem || 'A nickname is fine. Do not use your full name.'}</span>
      </label>
      <div class="avatars" role="radiogroup" aria-label="Avatar">
        {#each AVATARS as [name], i}
          <button type="button" role="radio" aria-checked={f.avatar === i} aria-label={name} onclick={() => (f.avatar = i)}><Avatar id={i} size={48} /></button>
        {/each}
      </div>
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">2</span><span class="t">Program</span></legend>
    <div class="in cols">
      <label class="field"><span class="label">Branch</span>
        <select bind:value={f.branch}>
          {#each BRANCHES as b}<option value={b.id}>{b.name} JROTC{app.bundle?.facts.some((x) => x.branch.includes(b.id)) ? '' : ' (not published yet)'}</option>{/each}
        </select>
      </label>
      <label class="field"><span class="label">Year in the program</span>
        <select bind:value={f.level}>{#each levels as l}<option>{l}</option>{/each}</select>
      </label>
      {#if f.branch === 'usmc'}
        <label class="field"><span class="label">Rank</span>
          <select bind:value={f.rank}><option>Not sure</option>{#each RANKS as r}<option>{r}</option>{/each}</select>
        </label>
        <label class="field"><span class="label">Billet</span>
          <select bind:value={f.billet}><option>None</option><option>Not sure</option>{#each BILLETS as b}<option>{b}</option>{/each}</select>
        </label>
      {/if}
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">3</span><span class="t">Region</span></legend>
    <div class="in cols">
      <label class="field"><span class="label">State or territory</span>
        <select bind:value={f.region}><option value="">Not set</option>{#each STATES as s}<option>{s}</option>{/each}</select>
      </label>
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">4</span><span class="t">Goals</span></legend>
    <div class="in cols">
      {#each GOALS as g}
        <label class="opt"><input type="checkbox" value={g.id} bind:group={f.goals} /><span>{g.name}</span></label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">5</span><span class="t">Daily goal</span></legend>
    <div class="in cols">
      {#each [5, 10, 15, 20] as m}
        <label class="opt"><input type="radio" name="minutes" value={m} bind:group={f.minutes} /><span>{m} minutes <small>{m} items a day</small></span></label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="block">
    <legend><span class="n">6</span><span class="t">Upcoming date (optional)</span></legend>
    <div class="in cols">
      <label class="field"><span class="label">Event</span>
        <select bind:value={f.eventType}><option value="">None</option><option>Inspection</option><option>Promotion board</option><option>Competition</option></select>
      </label>
      <label class="field"><span class="label">Date</span><input type="date" bind:value={f.eventDate} /></label>
    </div>
  </fieldset>

  <div class="row">
    <button class="btn primary" type="submit" disabled={!!problem}>Save profile</button>
    <a class="btn" href="#/profile">Cancel</a>
  </div>
</form>
