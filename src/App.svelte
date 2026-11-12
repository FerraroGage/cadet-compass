<script lang="ts">
  import { app, boot } from './lib/store.svelte';
  import { TERMS } from './legal/terms';
  import Onboarding from './screens/Onboarding.svelte';
  import Hub from './screens/Hub.svelte';
  import Cards from './screens/Cards.svelte';
  import Placement from './screens/Placement.svelte';
  import Settings from './screens/Settings.svelte';
  import Train from './screens/Train.svelte';
  import Quiz from './screens/Quiz.svelte';
  import Guide from './screens/Guide.svelte';
  import Order from './screens/Order.svelte';
  import Board from './screens/Board.svelte';
  import Metronome from './screens/Metronome.svelte';

  let hash = $state(location.hash.slice(2));
  $effect(() => {
    const onHash = () => { hash = location.hash.slice(2); scrollTo(0, 0); };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  });
  boot();

  const parts = $derived(hash.split('?')[0].split('/'));
  const params = $derived(new URLSearchParams(hash.split('?')[1] ?? ''));
  const section = $derived(parts[0] || 'hub');
  const accepted = $derived(app.terms?.version === TERMS[0].version);
  // The legal pages can be read before agreeing to anything.
  const readingLegal = $derived(section === 'settings' && ['terms', 'privacy', 'legal', 'about'].includes(parts[1]));
  const nav = [['hub', 'Hub'], ['cards', 'Cards'], ['train', 'Train'], ['settings', 'Settings']];
  // The placement test and the Study Guide are reached from the Train menu.
  const navSection = $derived(['test', 'guide'].includes(section) ? 'train' : section);
</script>

<header class="band">
  <div>
    <a href="#/hub">Ready Seats</a>
    <span>Marine Corps JROTC<br />Unofficial study aid</span>
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
  {:else if !accepted || !app.profile}
    <Onboarding />
  {:else}
    {#if app.notice}<p class="notice" role="status">{app.notice}</p>{/if}
    {#key hash}
      {#if section === 'cards'}
        <Cards module={parts[1]} />
      {:else if section === 'test'}
        <Placement />
      {:else if section === 'guide'}
        <Guide />
      {:else if section === 'train'}
        {#if parts[1] === 'quiz'}<Quiz {params} />
        {:else if parts[1] === 'order'}<Order which={parts[2]} />
        {:else if parts[1] === 'board'}<Board />
        {:else if parts[1] === 'metronome'}<Metronome />
        {:else}<Train custom={parts[1] === 'custom'} />{/if}
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
        <a href="#/{id}" aria-current={navSection === id ? 'page' : undefined}>{name}</a>
      {/each}
    </div>
  </nav>
{/if}
