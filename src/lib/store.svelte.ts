// All app state, and the only code that touches storage or the network.
// Storage: IndexedDB on this device. Network: one fetch of the signed content bundle from this app's own origin.
import Dexie, { type Table } from 'dexie';
import { verifyBundle, type Bundle } from './bundle';
import { CONTENT_PUBLIC_KEY } from './content-key';
import { review, type Card, type Grade } from './srs';
import type { Placement } from './quiz';

export interface Profile {
  branch: 'usmc'; region: string; unit: string; level: string; rank: string; billet: string;
  goals: string[]; minutes: number; eventType: string; eventDate: string;
}
export interface Acceptance { version: string; acceptedOn: string }

class DB extends Dexie {
  kv!: Table<{ k: string; v: unknown }, string>;
  progress!: Table<Card & { id: string }, string>;
  constructor() {
    super('ready-seats');
    this.version(1).stores({ kv: 'k', progress: 'id' });
  }
}
const db = new DB();

/** Local calendar date, YYYY-MM-DD. */
export const today = () => new Date().toLocaleDateString('en-CA');
export const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

interface Saved { profile: Profile | null; terms: Acceptance | null; placement: Placement | null; seenVersion: number }
export const app = $state({
  ready: false, error: '', notice: '',
  bundle: null as Bundle | null,
  progress: {} as Record<string, Card>,
  profile: null, terms: null, placement: null, seenVersion: 0,
} as { ready: boolean; error: string; notice: string; bundle: Bundle | null; progress: Record<string, Card> } & Saved);

export async function save<K extends keyof Saved>(k: K, v: Saved[K]) {
  app[k] = v as never;
  await db.kv.put({ k, v: $state.snapshot(v) });
}

export async function boot() {
  try {
    const kv = Object.fromEntries((await db.kv.toArray()).map((r) => [r.k, r.v])) as Partial<Saved> & { bundle?: { json: string; sig: string } };
    app.profile = kv.profile ?? null;
    app.terms = kv.terms ?? null;
    app.placement = kv.placement ?? null;
    app.seenVersion = kv.seenVersion ?? 0;
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

export async function grade(id: string, g: Grade) {
  const card = review(app.progress[id], g, today());
  app.progress[id] = card;
  await db.progress.put({ id, ...card });
}

/** Puts facts in today's cards (used for placement test gaps). */
export async function makeDue(ids: string[]) {
  for (const id of ids) {
    const card: Card = { ...(app.progress[id] ?? { ef: 2.5, interval: 0, reps: 0, lapses: 0 }), due: today() };
    app.progress[id] = card;
    await db.progress.put({ id, ...card });
  }
}

/** Removes the profile, progress, test results and stored content from this device. */
export async function deleteEverything() {
  await db.delete();
  location.hash = '';
  location.reload();
}
