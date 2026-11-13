// All app state, and the only code that touches device storage.
// Storage: IndexedDB on this device. Network: the signed content bundle from this app's own origin.
// Account sync lives in backend.ts and reaches this file only through `hooks`.
import Dexie, { type Table } from 'dexie';
import { verifyBundle, type Bundle, type Fact } from './bundle';
import { CONTENT_PUBLIC_KEY } from './content-key';
import { review, type Card, type Grade } from './srs';
import type { Placement } from './quiz';
import { earn, levelOf, streakOf, LABEL, MILESTONES, type Kind, type XpEvent } from './xp';

export type Branch = 'usmc' | 'army' | 'navy' | 'usaf' | 'ussf' | 'uscg';
export const BRANCHES: { id: Branch; name: string }[] = [
  { id: 'usmc', name: 'Marine Corps' }, { id: 'army', name: 'Army' }, { id: 'navy', name: 'Navy' },
  { id: 'usaf', name: 'Air Force' }, { id: 'ussf', name: 'Space Force' }, { id: 'uscg', name: 'Coast Guard' },
];
export const STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'American Samoa', 'Guam', 'Northern Mariana Islands', 'Puerto Rico', 'U.S. Virgin Islands', 'Outside the United States'];
export const branchName = (id: string) => BRANCHES.find((b) => b.id === id)?.name ?? '';

export interface Profile {
  branch: Branch | ''; region: string; unit: string; level: string; goals: string[]; experience: 0 | 1 | 2 | 3; minutes: number;
  rank: string; billet: string; eventType: string; eventDate: string;
  name: string; avatar: number; joined: string;
}
/** Empty answers: onboarding fills them in one screen at a time. */
export const BLANK: Profile = { branch: '', region: '', unit: '', level: '', goals: [], experience: 0, minutes: 0, rank: 'Not sure', billet: 'None', eventType: '', eventDate: '', name: 'Cadet', avatar: 0, joined: '' };
export interface Acceptance { version: string; acceptedOn: string }

class DB extends Dexie {
  kv!: Table<{ k: string; v: unknown }, string>;
  progress!: Table<Card & { id: string }, string>;
  constructor() {
    super('ready-seats'); // the app's first name; kept so saved data survives the renames
    this.version(1).stores({ kv: 'k', progress: 'id' });
  }
}
const db = new DB();

/** Local calendar date, YYYY-MM-DD. */
export const today = () => new Date().toLocaleDateString('en-CA');
export const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

interface Saved {
  profile: Profile | null; terms: Acceptance | null; placement: Placement | null; seenVersion: number;
  onboarded: boolean; step: string;              // where onboarding stands
  ledger: XpEvent[]; days: Record<string, number>; best: number; // XP events, items studied per day, longest streak
  serverXp: number | null; dirty: string[];      // account sync: the server's total, cards not yet uploaded
  remind: boolean; ageBlocked: boolean;
}
const DEFAULTS: Saved = { profile: null, terms: null, placement: null, seenVersion: 0, onboarded: false, step: '', ledger: [], days: {}, best: 0, serverXp: null, dirty: [], remind: false, ageBlocked: false };

export const app = $state({
  ready: false, error: '', notice: '',
  bundle: null as Bundle | null,
  progress: {} as Record<string, Card>,
  user: null as { id: string; email: string } | null,
  toasts: [] as { pts: number; label: string; key: string }[],
  levelUp: 0,
  ...structuredClone(DEFAULTS),
});

/** Set by backend.ts. No-ops while the app has no account service or the cadet is a guest. */
export const hooks = { sync: async () => {}, profile: async () => {} };

export async function save<K extends keyof Saved>(k: K, v: Saved[K]) {
  app[k] = v as never;
  await db.kv.put({ k, v: $state.snapshot(v) });
}

/** Study content for the cadet's branch. Every screen reads facts through here. */
export const facts = (): Fact[] => (app.bundle ? app.bundle.facts.filter((f) => f.branch.includes(app.profile?.branch || 'usmc')) : []);

export async function boot() {
  try {
    const kv = Object.fromEntries((await db.kv.toArray()).map((r) => [r.k, r.v])) as Partial<Saved> & { bundle?: { json: string; sig: string } };
    for (const k of Object.keys(DEFAULTS) as (keyof Saved)[]) if (kv[k] !== undefined) app[k] = kv[k] as never;
    // A profile saved by an earlier version lacks the newer fields, and its owner has already been through setup.
    if (app.profile) app.profile = { ...BLANK, ...app.profile };
    if (kv.onboarded === undefined) app.onboarded = !!(kv.profile && kv.terms);
    for (const { id, ...card } of await db.progress.toArray()) app.progress[id] = card;

    // The copy kept on the device is checked again on every start.
    if (kv.bundle) {
      try { app.bundle = await verifyBundle(new TextEncoder().encode(kv.bundle.json), kv.bundle.sig, CONTENT_PUBLIC_KEY, 0); } catch { /* fall through to download */ }
    }
    try {
      const base = import.meta.env.BASE_URL + 'content/';
      const [b, s] = await Promise.all([fetch(base + 'bundle.json', { cache: 'no-store' }), fetch(base + 'bundle.sig', { cache: 'no-store' })]);
      if (!b.ok || !s.ok) throw new Error('not available');
      const bytes = new Uint8Array(await b.arrayBuffer());
      const sig = await s.text();
      app.bundle = await verifyBundle(bytes, sig, CONTENT_PUBLIC_KEY, app.bundle?.version ?? 0);
      await db.kv.put({ k: 'bundle', v: { json: new TextDecoder().decode(bytes), sig } });
    } catch (e) {
      const msg = String((e as Error).message);
      // Offline, or already up to date, is normal. A failed check is worth telling the cadet about.
      if (msg.includes('rejected') && !msg.includes('not newer')) app.notice = 'A content update was downloaded but failed its signature check, so it was not used.';
    }
    if (!app.bundle) app.error = 'Study content could not be loaded. Connect to the internet and open the app again.';
  } catch {
    app.error = 'This browser would not open local storage. Private browsing can cause this.';
  } finally {
    app.ready = true;
  }
}

/** Writes cards to the device. `upload` marks them for the next account sync. */
export async function putCards(cards: Record<string, Card>, upload = true) {
  for (const [id, card] of Object.entries(cards)) app.progress[id] = card;
  await db.progress.bulkPut(Object.entries(cards).map(([id, card]) => ({ id, ...card })));
  if (upload && app.user) await save('dirty', [...new Set([...app.dirty, ...Object.keys(cards)])]);
}

export async function grade(id: string, g: Grade) {
  await putCards({ [id]: review(app.progress[id], g, today()) });
}

/** Puts facts in today's cards (used for placement test gaps). */
export async function makeDue(ids: string[]) {
  await putCards(Object.fromEntries(ids.map((id) => [id, { ...(app.progress[id] ?? { ef: 2.5, interval: 0, reps: 0, lapses: 0 }), due: today() }])));
}

// ---- XP ---------------------------------------------------------------------
// On this device XP is a convenience. For a signed-in cadet the server works the points out again
// from the event (never from a number sent by the app) and its total replaces this one.

const sum = (es: XpEvent[]) => es.reduce((n, e) => n + e.pts, 0);
export const xpTotal = () => (app.user && app.serverXp !== null ? app.serverXp + sum(app.ledger.filter((e) => !e.synced)) : sum(app.ledger));
/** A day counts toward the streak when XP was earned on it. */
export const streak = () => streakOf(Object.fromEntries(app.ledger.filter((e) => e.pts > 0).map((e) => [e.day, 1])), today());
export const level = () => levelOf(xpTotal());

export async function award(kind: Kind, d: { score?: number; n?: number } = {}): Promise<number> {
  const day = today();
  const pts = earn(kind, d, day, app.ledger);
  if (!pts) return 0;
  const before = level().level;
  const id = crypto.randomUUID();
  app.ledger.push({ id, kind, day, pts, ...d });
  await save('ledger', app.ledger);
  app.toasts.push({ pts, label: LABEL[kind], key: id });
  if (level().level > before) app.levelUp = level().level;
  const s = streak();
  if (s > app.best) await save('best', s);
  if (kind !== 'streak' && MILESTONES[s]) await award('streak', { n: s });
  else void hooks.sync();
  return pts;
}

/** Counts items studied today toward the daily goal: one item for each minute of the cadet's daily time. */
export async function tick(n = 1) {
  const day = today(), goal = app.profile?.minutes || 10, was = app.days[day] ?? 0;
  await save('days', { ...app.days, [day]: was + n });
  if (was < goal && was + n >= goal) await award('goal');
}

/** Removes the profile, progress, test results and stored content from this device. */
export async function wipeLocal() {
  await db.delete();
  location.hash = '';
  location.reload();
}
