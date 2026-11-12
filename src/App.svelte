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
  import Logo from './lib/Logo.svelte';

  // The loading screen lives in index.html so it shows before this script loads. Keep it up long enough to read.
  $effect(() => {
    if (!app.ready) return;
    const id = setTimeout(() => document.getElementById('splash')?.classList.add('out'), Math.max(0, 700 - performance.now()));
    return () => clearTimeout(id);
  });

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
  const nav = [['hub', 'Hub'], ['cards', 'Cards'], ['train', 'Train']];
  // Bottom bar icons, drawn for this app on a 24 unit grid.
  const ICONS: Record<string, string> = {
    hub: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    cards: 'M7 4h13v13M4 7h13v13H4z',
    train: 'M12 3a9 9 0 1 0 9 9M12 8a4 4 0 1 0 4 4M12 12l8-8',
  };
  // The placement test and the Study Guide are reached from the Train menu.
  const navSection = $derived(['test', 'guide'].includes(section) ? 'train' : section);
</script>

<header class="band">
  <div>
    <a class="brand" href="#/hub"><Logo />Gigline</a>
    <span>Marine Corps JROTC<br />Unofficial study aid</span>
    {#if app.ready && !app.error && accepted && app.profile}
      <a class="gear" href="#/settings" aria-label="Settings" aria-current={section === 'settings' ? 'page' : undefined}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
      </a>
    {/if}
  </div>
</header>

<main class="sheet">
  {#if !app.ready}
    <!-- The loading screen in index.html covers this. -->
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
        <a href="#/{id}" aria-current={navSection === id ? 'page' : undefined}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={ICONS[id]} /></svg>
          {name}
        </a>
      {/each}
    </div>
  </nav>
{/if}
