<script lang="ts">
  import { app, boot } from './lib/store.svelte';
  import { TERMS } from './legal/terms';
  import TermsGate from './screens/TermsGate.svelte';
  import Onboarding from './screens/Onboarding.svelte';
  import Hub from './screens/Hub.svelte';
  import Cards from './screens/Cards.svelte';
  import Placement from './screens/Placement.svelte';
  import Settings from './screens/Settings.svelte';

  let hash = $state(location.hash.slice(2));
  $effect(() => {
    const onHash = () => { hash = location.hash.slice(2); scrollTo(0, 0); };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  });
  boot();

  const parts = $derived(hash.split('/'));
  const section = $derived(parts[0] || 'hub');
  const accepted = $derived(app.terms?.version === TERMS[0].version);
  // The legal pages can be read before agreeing to anything.
  const readingLegal = $derived(section === 'settings' && ['terms', 'privacy', 'legal', 'about'].includes(parts[1]));
  const nav = [['hub', 'Hub'], ['cards', 'Cards'], ['test', 'Test'], ['settings', 'Settings']];
</script>

<header class="band">
  <div>
    <a href="#/hub">Ready Seats</a>
    <span>Marine Corps JROTC. Unofficial study aid.</span>
  </div>
</header>

<main class="sheet">
  {#if !app.ready}
    <p class="label" style="margin-top: 24px">Loading</p>
  {:else if app.error}
    <h1>Cannot start</h1>
    <p>{app.error}</p>
  {:else if readingLegal}
    <Settings page={parts[1]} />
  {:else if !accepted}
    <TermsGate />
  {:else if !app.profile}
    <Onboarding />
  {:else}
    {#if app.notice}<p class="notice" role="status">{app.notice}</p>{/if}
    {#key hash}
      {#if section === 'cards'}
        <Cards module={parts[1]} />
      {:else if section === 'test'}
        <Placement />
      {:else if section === 'settings'}
        <Settings page={parts[1] ?? ''} />
      {:else}
        <Hub tab={parts[1]} />
      {/if}
    {/key}
  {/if}
</main>

{#if app.ready && !app.error && accepted && app.profile}
  <nav class="bar" aria-label="Main">
    <div>
      {#each nav as [id, name]}
        <a href="#/{id}" aria-current={section === id ? 'page' : undefined}>{name}</a>
      {/each}
    </div>
  </nav>
{/if}
