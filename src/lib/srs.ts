// SM-2 spaced repetition (Wozniak, 1990). Small enough to own; no scheduler dependency.
export interface Card { ef: number; interval: number; reps: number; lapses: number; due: string }
export type Grade = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy

export const addDays = (isoDate: string, days: number) => {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export function review(card: Card | undefined, grade: Grade, today: string): Card {
  const c = card ?? { ef: 2.5, interval: 0, reps: 0, lapses: 0, due: today };
  const q = [1, 3, 4, 5][grade];
  const ef = Math.max(1.3, c.ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  // A miss is due again today so it comes back in the same sitting.
  if (q < 3) return { ef, interval: 0, reps: 0, lapses: c.lapses + 1, due: today };
  const reps = c.reps + 1;
  const interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(c.interval * ef);
  return { ef, interval, reps, lapses: c.lapses, due: addDays(today, interval) };
}
