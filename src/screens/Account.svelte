<script lang="ts">
  // Create an account or sign in. Used at the end of onboarding and from the Profile screen.
  import { app, save } from '../lib/store.svelte';
  import { configured, signUp, signIn, google } from '../lib/backend';

  // `agreed`: the Terms box on the screen that hosts this form. An account is never made without it.
  let { agreed = true, start = 'up' }: { agreed?: boolean; start?: 'up' | 'in' } = $props();
  let mode = $state<'up' | 'in'>(app.ageBlocked ? 'in' : (() => start)());
  let email = $state('');
  let password = $state('');
  let month = $state('');
  let year = $state('');
  let msg = $state('');
  let busy = $state(false);

  const now = new Date();
  const YEARS = Array.from({ length: 80 }, (_, i) => now.getFullYear() - 5 - i);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // The birth month is used once, here, to check the age. It is not saved or sent anywhere.
  const oldEnough = () => (now.getFullYear() - Number(year)) * 12 + now.getMonth() - Number(month) > 13 * 12;
  const dated = $derived(month !== '' && year !== '');

  async function ageOk() {
    if (oldEnough()) return true;
    await save('ageBlocked', true);
    mode = 'in';
    return false;
  }
  async function submit(e: Event) {
    e.preventDefault();
    msg = '';
    busy = true;
    if (mode === 'in') msg = await signIn(email, password);
    else if (await ageOk()) {
      const r = await signUp(email, password);
      msg = r.error || (r.confirm ? 'Check your email and open the link we sent to confirm your address. Then come back here and sign in.' : '');
      if (r.confirm) mode = 'in';
    }
    busy = false;
  }
  async function withGoogle() {
    msg = '';
    if (mode === 'up' && !(await ageOk())) return;
    msg = await google();
  }
</script>

{#if !configured}
  <p class="notice">Accounts are not turned on in this copy of the app yet. Your progress is saved on this device.</p>
{:else if app.user}
  <p class="notice" role="status">Signed in as <strong>{app.user.email}</strong>. Your progress is saved to your account.</p>
{:else}
  <div class="tabs" role="tablist" aria-label="Account" style="margin-top: 16px">
    <a href="#/" role="tab" aria-selected={mode === 'up'} aria-current={mode === 'up' ? 'page' : undefined} onclick={(e) => { e.preventDefault(); if (!app.ageBlocked) mode = 'up'; msg = ''; }}>Create account</a>
    <a href="#/" role="tab" aria-selected={mode === 'in'} aria-current={mode === 'in' ? 'page' : undefined} onclick={(e) => { e.preventDefault(); mode = 'in'; msg = ''; }}>Sign in</a>
  </div>

  {#if app.ageBlocked}
    <p class="notice">You need to be 13 or older to make an account. You can keep studying as a guest, and your progress stays on this device.</p>
  {/if}

  <form onsubmit={submit} style="margin-top: 16px">
    <label class="field"><span class="label">Email</span>
      <input type="email" bind:value={email} required autocomplete="email" maxlength="254" />
    </label>
    <label class="field"><span class="label">Password{mode === 'up' ? ' (8 characters or more)' : ''}</span>
      <input type="password" bind:value={password} required minlength={mode === 'up' ? 8 : 1} maxlength="72" autocomplete={mode === 'up' ? 'new-password' : 'current-password'} />
    </label>
    {#if mode === 'up'}
      <fieldset style="border: 0; padding: 0; margin: 0">
        <legend class="label" style="margin-bottom: 4px">When were you born? Used once to check your age, then forgotten.</legend>
        <div class="row" style="margin-top: 0; flex-wrap: nowrap">
          <select bind:value={month} required aria-label="Birth month"><option value="" disabled>Month</option>{#each MONTHS as m, i}<option value={String(i)}>{m}</option>{/each}</select>
          <select bind:value={year} required aria-label="Birth year"><option value="" disabled>Year</option>{#each YEARS as y}<option>{y}</option>{/each}</select>
        </div>
      </fieldset>
    {/if}
    {#if msg}<p class="err" role="alert" style="margin-top: 12px">{msg}</p>{/if}
    {#if mode === 'up' && !agreed}<p class="help" style="margin-top: 12px">Tick the box above to agree to the Terms first.</p>{/if}
    <div class="row">
      <button class="btn primary wide" type="submit" disabled={busy || (mode === 'up' && !agreed)}>{mode === 'up' ? 'Create account' : 'Sign in'}</button>
      <button class="btn wide" type="button" onclick={withGoogle} disabled={busy || (mode === 'up' && (!agreed || !dated))}>Continue with Google</button>
    </div>
    {#if mode === 'up'}<p class="help" style="margin-top: 8px">For Google, pick your birth month and year first.</p>{/if}
  </form>
{/if}
