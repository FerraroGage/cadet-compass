<script lang="ts">
  import { app, facts, today, fmtDate, xpTotal, level, streak, branchName } from '../lib/store.svelte';
  import { MODULES, quizzable } from '../lib/quiz';
  import { badges } from '../lib/xp';
  import { configured, signOut, unsynced } from '../lib/backend';
  import Avatar from '../lib/Avatar.svelte';
  import Account from './Account.svelte';

  const p = app.profile!;
  const t = today();
  const lv = $derived(level());
  // A module is done when every card in it has been learned at least once.
  const mods = MODULES.map((m) => facts().filter((f) => f.module === m.id && quizzable(f, t))).filter((fs) => fs.length);
  const modulesDone = $derived(mods.filter((fs) => fs.every((f) => (app.progress[f.id]?.reps ?? 0) > 0)).length);
  const list = $derived(badges({ ledger: app.ledger, streak: streak(), best: app.best, level: lv.level, modulesDone, modules: mods.length }));

  let busy = $state(false);
  async function out() {
    const warn = unsynced() && !navigator.onLine ? 'You are offline and some progress has not been saved to your account yet. Signing out now will lose it. ' : '';
    if (!confirm(warn + 'Sign out? This device is cleared, and your account keeps your saved progress.')) return;
    busy = true;
    await signOut();
  }
</script>

<div class="who">
  <Avatar id={p.avatar} size={76} />
  <div>
    <h1>{p.name}</h1>
    <p class="label" style="margin: 4px 0 0">{[branchName(p.branch) && branchName(p.branch) + ' JROTC', p.level, p.rank !== 'Not sure' && p.rank, p.region].filter(Boolean).join(' / ')}</p>
    {#if p.joined}<p class="label" style="margin: 0">Joined {fmtDate(p.joined)}</p>{/if}
  </div>
</div>

<div class="stats">
  <div><b>{xpTotal()}</b>XP</div>
  <div><b>{streak()}</b>day streak</div>
  <div><b>{app.best}</b>best streak</div>
</div>

<div class="lvl" role="img" aria-label="Level {lv.level}. {lv.into} of {lv.span} XP to the next level.">
  <span class="badge">{lv.level}</span>
  <span>Level {lv.level} <span class="num">{lv.into} / {lv.span} XP</span></span>
  <span class="meter"><i style="width: {(lv.into / lv.span) * 100}%"></i></span>
</div>

<div class="row"><a class="btn wide" href="#/profile/edit">Edit profile</a></div>

<h2>Badges <span class="label">{list.filter((b) => b.earned).length} of {list.length}</span></h2>
<ul class="badges">
  {#each list as b}
    <li class:off={!b.earned}>
      <span class="medal" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">{#if b.earned}<path d="m5 12.5 4.5 4.5L19 7.5" />{:else}<path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" />{/if}</svg>
      </span>
      <span>{b.name}<small>{b.earned ? 'Earned' : b.how}</small></span>
    </li>
  {/each}
</ul>

<h2>Account</h2>
{#if app.user}
  <p>Signed in as <strong>{app.user.email}</strong>. Your progress is saved to your account{unsynced() ? ', and some of it is waiting to upload' : ''}.</p>
  <div class="row"><button class="btn" onclick={out} disabled={busy}>Sign out</button></div>
{:else}
  {#if configured}<p>You are using the app as a guest. Make an account and everything you have done so far moves into it.</p>{/if}
  <Account />
{/if}
