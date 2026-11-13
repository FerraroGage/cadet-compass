// XP, levels, streaks and badges. Pure functions, no storage.
// The same point values and caps are enforced on the server in supabase/schema.sql (award_xp).
// Change one, change the other. A signed-in cadet's total is always the server's number.

export type Kind = 'lesson' | 'quiz' | 'review' | 'placement' | 'goal' | 'streak';
/** `score` is 0..1 for a quiz. `n` is the streak length for a streak milestone. */
export interface XpEvent { id: string; kind: Kind; day: string; pts: number; score?: number; n?: number; synced?: boolean }

export const PASS = 0.7;
export const MILESTONES: Record<number, number> = { 7: 50, 30: 150, 100: 500 };
/** How many times a day each activity can earn XP. Placement and each streak milestone pay once, ever. */
export const DAILY_CAP: Record<Kind, number> = { lesson: 5, quiz: 5, review: 5, goal: 1, placement: 1, streak: 1 };
export const LABEL: Record<Kind, string> = { lesson: 'Lesson complete', quiz: 'Quiz passed', review: 'Misses reviewed', placement: 'Placement test', goal: 'Daily goal met', streak: 'Streak milestone' };

export function points(kind: Kind, d: { score?: number; n?: number } = {}): number {
  switch (kind) {
    case 'lesson': return 10;
    case 'review': return 5;
    case 'placement': return 50;
    case 'goal': return 20;
    case 'streak': return MILESTONES[d.n ?? 0] ?? 0;
    case 'quiz': {
      const s = Math.min(1, Math.max(0, d.score ?? 0));
      if (s < PASS) return 0;
      return 10 + Math.round(s * 10) + (s === 1 ? 10 : 0); // 17 at 70 percent, 30 for a perfect score
    }
  }
}

/** What this event may earn given what is already in the ledger. 0 when a cap is reached. */
export function earn(kind: Kind, d: { score?: number; n?: number }, day: string, ledger: XpEvent[]): number {
  const same = ledger.filter((e) => e.kind === kind && e.pts > 0);
  if (kind === 'placement' && same.length) return 0;
  if (kind === 'streak' && same.some((e) => e.n === d.n)) return 0;
  if (same.filter((e) => e.day === day).length >= DAILY_CAP[kind]) return 0;
  return points(kind, d);
}

/** XP needed to reach a level. Level 1 is 0, then 100, 250, 450, 700: each step costs 50 more than the last. */
export const floor = (level: number) => 25 * (level - 1) * (level + 2);
export function levelOf(xp: number) {
  let level = 1;
  while (floor(level + 1) <= xp) level++;
  const base = floor(level), next = floor(level + 1);
  return { level, into: xp - base, span: next - base, next };
}

const prev = (iso: string) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); };
/** Days in a row with any study, ending today, or yesterday if today has not started yet. */
export function streakOf(days: Record<string, number>, today: string): number {
  let d = days[today] ? today : prev(today), n = 0;
  while (days[d]) { n++; d = prev(d); }
  return n;
}

export interface Badge { id: string; name: string; how: string; earned: boolean }
export function badges(s: { ledger: XpEvent[]; streak: number; best: number; level: number; modulesDone: number; modules: number }): Badge[] {
  const has = (k: Kind) => s.ledger.some((e) => e.kind === k);
  const top = Math.max(s.streak, s.best);
  return [
    { id: 'placement', name: 'Bearing taken', how: 'Finish the placement test', earned: has('placement') },
    { id: 'lesson', name: 'First lesson', how: 'Finish a set of cards', earned: has('lesson') },
    { id: 'quiz', name: 'First quiz', how: 'Pass a quiz', earned: s.ledger.some((e) => e.kind === 'quiz' && e.pts > 0) },
    { id: 'perfect', name: 'Dead on', how: 'Score 100 percent on a quiz', earned: s.ledger.some((e) => e.kind === 'quiz' && e.score === 1) },
    { id: 'streak7', name: '7-day streak', how: 'Study 7 days in a row', earned: top >= 7 },
    { id: 'streak30', name: '30-day streak', how: 'Study 30 days in a row', earned: top >= 30 },
    { id: 'level5', name: 'Level 5', how: 'Reach level 5', earned: s.level >= 5 },
    { id: 'module', name: 'Module mastery', how: 'Learn every card in one module', earned: s.modulesDone >= 1 },
    { id: 'branch', name: 'Branch mastery', how: 'Learn every card in every module', earned: s.modules > 0 && s.modulesDone >= s.modules },
  ];
}

/** Training events open up as the cadet levels up. */
export const UNLOCK: Record<string, number> = { custom: 2, order: 2, board: 3 };
