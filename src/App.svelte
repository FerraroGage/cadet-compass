<script lang="ts">
  import { tick } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { app, boot, xpTotal, streak } from './lib/store.svelte';
  import { initBackend } from './lib/backend';
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
  import Profile from './screens/Profile.svelte';
  import EditProfile from './screens/EditProfile.svelte';
  import Learn from './screens/Learn.svelte';
  import Speed from './screens/Speed.svelte';
  import Match from './screens/Match.svelte';

  // The XP number counts up to its new value instead of jumping.
  const xpShown = new Tween(0, { duration: 700, easing: cubicOut });
  $effect(() => { xpShown.target = xpTotal(); });
  let hash = $state(location.hash.slice(2));
  $effect(() => {
    // Screens cross-fade where the browser supports view transitions; elsewhere they just change.
    const onHash = () => {
      const go = () => { hash = location.hash.slice(2); scrollTo(0, 0); return tick(); };
      if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(go);
      else go();
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  });
  boot().then(initBackend);

  // The loading screen lives in index.html so it shows before this script loads. Keep it up long enough to read.
  $effect(() => {
    if (!app.ready) return;
    const id = setTimeout(() => document.getElementById('splash')?.classList.add('out'), Math.max(0, 1500 - performance.now()));
    return () => clearTimeout(id);
  });
  // The accent color follows the cadet's branch.
  $effect(() => { document.documentElement.dataset.branch = app.profile?.branch || ''; });
  $effect(() => { document.documentElement.dataset.theme = app.theme; });
  // One +XP toast at a time; each stays for its animation, then the next one shows.
  $effect(() => {
    if (!app.toasts.length) return;
    const id = setTimeout(() => app.toasts.shift(), 1800);
    return () => clearTimeout(id);
  });

  const parts = $derived(hash.split('?')[0].split('/'));
  const params = $derived(new URLSearchParams(hash.split('?')[1] ?? ''));
  const section = $derived(parts[0] || 'hub');
  // The legal pages can be read before agreeing to anything.
  const readingLegal = $derived(section === 'settings' && ['terms', 'privacy', 'legal', 'about'].includes(parts[1]));
  const usable = $derived(app.ready && !app.error);
  const inApp = $derived(usable && app.onboarded && !!app.profile);
  // Bottom bar icons, drawn for this app on a 24 unit grid.
  const NAV = [
    ['hub', 'Home', 'M4 11l8-7 8 7v9h-5v-6H9v6H4z'],
    ['learn', 'Learn', 'M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z'],
    ['train', 'Play', 'M13 2 4 14h7l-1 8 9-12h-7z'],
    ['profile', 'Profile', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'],
  ];
  // Cards and the Study Guide belong to Learn; the placement test to Play.
  const navSection = $derived(['cards', 'guide'].includes(section) ? 'learn' : section === 'test' ? 'train' : section);
</script>

{#if usable && !inApp && !readingLegal}
  <Onboarding />
{:else}
  <header class="band">
    <div>
      <a class="brand" href="#/hub" aria-label="Cadet Compass home"><img class="logo-light" src="./icons/logo.svg" alt="" width="132" height="36" /><img class="logo-dark" src="./icons/logo-dark.svg" alt="" width="132" height="36" /></a>
      {#if inApp}
        <a class="chip" href="#/profile" aria-label="{streak()} day streak">
          <svg width="16" height="16" viewBox="0 0 24 24" fill={streak() ? '#c0392b' : '#8b97a3'} aria-hidden="true"><path d="M12 2.5c3.5 4 5.5 6.3 5.5 9.7a5.5 5.5 0 0 1-11 0c0-2 1-3.4 2.2-4.6.1 2 .9 3.2 2 3.4-.2-3 .1-5.7 1.3-8.5z" /></svg>
          {streak()}
        </a>
        {#key xpTotal()}<a class="chip bump" href="#/profile" aria-label="{xpTotal()} XP">{Math.round(xpShown.current)} XP</a>{/key}
        <a class="gear" href="#/settings" aria-label="Settings" aria-current={section === 'settings' ? 'page' : undefined}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </a>
      {/if}
    </div>
  </header>

  <main class="sheet">
    {#if !app.ready}
      <!-- Placeholder shapes in the layout of Home, shown only until the study content is ready. -->
      <div class="skel" aria-hidden="true">
        <i class="l w60"></i><i class="l w40"></i>
        <i class="b tall"></i><i class="b"></i>
        <i class="l w30"></i><i class="b row"></i><i class="b row"></i><i class="b row"></i>
      </div>
    {:else if app.error}
      <h1>Cannot start</h1>
      <p>{app.error}</p>
    {:else if readingLegal}
      <Settings page={parts[1]} />
    {:else}
      {#if app.notice}<p class="notice" role="status">{app.notice}</p>{/if}
      {#key hash}
        {#if section === 'learn'}
          <Learn tab={parts[1]} />
        {:else if section === 'cards'}
          <Cards module={parts[1]} />
        {:else if section === 'test'}
          <Placement />
        {:else if section === 'guide'}
          <Guide />
        {:else if section === 'train'}
          {#if parts[1] === 'quiz'}<Quiz {params} />
          {:else if parts[1] === 'speed'}<Speed {params} />
          {:else if parts[1] === 'match'}<Match {params} />
          {:else if parts[1] === 'order'}<Order which={parts[2]} />
          {:else if parts[1] === 'board'}<Board />
          {:else if parts[1] === 'metronome'}<Metronome />
          {:else}<Train custom={parts[1] === 'custom'} />{/if}
        {:else if section === 'profile'}
          {#if parts[1] === 'edit'}<EditProfile />{:else}<Profile />{/if}
        {:else if section === 'settings'}
          <Settings page={parts[1] ?? ''} />
        {:else}
          <Hub />
        {/if}
      {/key}
    {/if}
  </main>

  {#if inApp}
    <nav class="bar" aria-label="Main">
      <div>
        {#each NAV as [id, name, icon]}
          <a href="#/{id}" aria-current={navSection === id ? 'page' : undefined}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={icon} /></svg>
            {name}
          </a>
        {/each}
      </div>
    </nav>
  {/if}
{/if}

<div aria-live="polite">
  {#if app.toasts[0]}
    {#key app.toasts[0].key}<p class="toast">+{app.toasts[0].pts} XP <small>{app.toasts[0].label}</small></p>{/key}
  {/if}
</div>

{#if app.levelUp && !app.toasts.length}
  <div class="levelup" role="alertdialog" aria-modal="true" aria-labelledby="lvl-title">
    <div class="burst"><b>{app.levelUp}</b></div>
    <h1 id="lvl-title">Level {app.levelUp}</h1>
    <p>You have reached level {app.levelUp}. Keep your bearing.</p>
    <!-- svelte-ignore a11y_autofocus -->
    <button class="btn gold" autofocus onclick={() => (app.levelUp = 0)}>Continue</button>
  </div>
{/if}
