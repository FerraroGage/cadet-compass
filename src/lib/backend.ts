// Accounts and sync (Supabase). Everything here is optional: with no keys in .env the app is guest-only
// and this file never loads the client library or touches the network.
// The anon key is public by design. What protects the data is row-level security in supabase/schema.sql.
import type { SupabaseClient } from '@supabase/supabase-js';
import { app, hooks, save, putCards, wipeLocal, today, BLANK, type Branch } from './store.svelte';
import type { Card } from './srs';
import type { XpEvent } from './xp';

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const configured = !!(URL && KEY);

let client: Promise<SupabaseClient> | undefined;
const sb = () => (client ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(URL!, KEY!, { auth: { flowType: 'pkce' } })));
const here = () => location.origin + location.pathname;

export async function initBackend() {
  if (!configured) return;
  hooks.sync = sync;
  hooks.profile = pushProfile;
  const c = await sb();
  c.auth.onAuthStateChange((_event, session) => {
    const was = app.user?.id;
    app.user = session ? { id: session.user.id, email: session.user.email ?? '' } : null;
    // Supabase calls must not run inside this callback, so the merge is queued.
    if (app.user && app.user.id !== was) setTimeout(() => void signedIn(), 0);
  });
  addEventListener('online', () => void sync());
}

const plain = (e: { message: string } | null) => (!e ? '' : /fetch|network/i.test(e.message) ? 'No connection. Try again when you are online.' : e.message);

export async function signUp(email: string, password: string) {
  const { data, error } = await (await sb()).auth.signUp({ email, password, options: { emailRedirectTo: here() } });
  return { error: plain(error), confirm: !error && !data.session };
}
export async function signIn(email: string, password: string) {
  const { error } = await (await sb()).auth.signInWithPassword({ email, password });
  return plain(error);
}
export async function google() {
  const { error } = await (await sb()).auth.signInWithOAuth({ provider: 'google', options: { redirectTo: here() } });
  return plain(error);
}

/** The card that has been studied more wins; a tie goes to the later due date. */
const better = (a: Card, b: Card) => a.reps + a.lapses > b.reps + b.lapses || (a.reps + a.lapses === b.reps + b.lapses && a.due > b.due);

/** Runs once per sign-in: joins what is on this device with what is in the account, so guest progress is kept. */
async function signedIn() {
  try {
    const c = await sb(), uid = app.user!.id;
    const [{ data: remote }, { data: rows }, { data: events }] = await Promise.all([
      c.from('profiles').select('display_name, avatar, branch, region, level, created_at').eq('id', uid).maybeSingle(),
      c.from('progress').select('fact_id, card').eq('user_id', uid),
      // shortcut: the API returns 1,000 rows at most, enough for badges and streaks for a long while. Page this when a cadet can pass 1,000 events.
      c.from('xp_events').select('id, kind, day, pts, score, n').eq('user_id', uid).order('day', { ascending: false }),
    ]);

    if (remote?.branch && !app.onboarded) {
      // A returning cadet on a fresh device: take the account's profile and skip setup.
      await save('profile', { ...BLANK, name: remote.display_name, avatar: remote.avatar, branch: remote.branch as Branch, region: remote.region ?? '', level: remote.level ?? '', minutes: 10, experience: 2, joined: String(remote.created_at).slice(0, 10) });
      await save('terms', app.terms ?? { version: 'account', acceptedOn: today() });
      await save('onboarded', true);
    } else if (app.onboarded) {
      await pushProfile();
    }

    const theirs = Object.fromEntries((rows ?? []).map((r) => [r.fact_id as string, r.card as Card]));
    const pull: Record<string, Card> = {};
    for (const [id, card] of Object.entries(theirs)) if (!app.progress[id] || better(card, app.progress[id])) pull[id] = card;
    await putCards(pull, false);
    const push = Object.keys(app.progress).filter((id) => !theirs[id] || better(app.progress[id], theirs[id]));
    await save('dirty', [...new Set([...app.dirty, ...push])]);

    const known = new Set(app.ledger.map((e) => e.id));
    await save('ledger', [...app.ledger, ...((events ?? []) as XpEvent[]).filter((e) => !known.has(e.id)).map((e) => ({ ...e, score: e.score ?? undefined, n: e.n ?? undefined, synced: true }))]);
    await sync();
  } catch {
    // Offline or a server error: the device copy keeps working and the next sync tries again.
  }
}

async function pushProfile() {
  if (!app.user || !app.profile || !navigator.onLine) return;
  const p = app.profile;
  await (await sb()).from('profiles').update({ display_name: p.name, avatar: p.avatar, branch: p.branch || null, region: p.region || null, level: p.level || null, terms_version: app.terms?.version ?? null }).eq('id', app.user.id);
}

let busy = false;
/** Sends waiting XP events and changed cards, then reads back the server's XP total. Safe to call at any time. */
export async function sync() {
  if (!configured || !app.user || !navigator.onLine || busy) return;
  busy = true;
  try {
    const c = await sb(), uid = app.user.id;
    // Oldest first, so streak milestones are checked after the days that earn them.
    for (const e of app.ledger.filter((x) => !x.synced).sort((a, b) => a.day.localeCompare(b.day))) {
      const { data, error } = await c.rpc('award_xp', { p_id: e.id, p_kind: e.kind, p_day: e.day, p_score: e.score ?? null, p_n: e.n ?? null });
      if (error) break;
      e.pts = data as number; // the server's figure replaces the device's
      e.synced = true;
    }
    await save('ledger', app.ledger);
    const ids = app.dirty.filter((id) => app.progress[id]);
    for (let i = 0; i < ids.length; i += 200) {
      const { error } = await c.from('progress').upsert(ids.slice(i, i + 200).map((id) => ({ user_id: uid, fact_id: id, card: app.progress[id] })));
      if (error) return;
    }
    await save('dirty', []);
    const { data } = await c.from('profiles').select('xp').eq('id', uid).single();
    if (data) await save('serverXp', data.xp as number);
  } catch {
    // Left in the outbox for next time.
  } finally {
    busy = false;
  }
}

export const unsynced = () => app.ledger.some((e) => !e.synced) || app.dirty.length > 0;

/** Signing out clears this device, so the next person to use it starts clean. The account keeps everything that was synced. */
export async function signOut() {
  await sync();
  await (await sb()).auth.signOut();
  await wipeLocal();
}

/** Deletes the account and every row that belongs to it on the server, then clears this device. */
export async function deleteAccount(): Promise<string> {
  const c = await sb();
  const { error } = await c.rpc('delete_account');
  if (error) return plain(error);
  await c.auth.signOut();
  await wipeLocal();
  return '';
}
