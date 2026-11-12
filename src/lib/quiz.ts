import type { Fact, Module } from './bundle';

export const MODULES: { id: Module; name: string }[] = [
  { id: 'ranks', name: 'Ranks' }, { id: 'ribbons', name: 'Ribbons' }, { id: 'chain', name: 'Chain of Command' },
  { id: 'uniform', name: 'Uniform' }, { id: 'drill', name: 'Drill' }, { id: 'knowledge', name: 'Knowledge' },
  { id: 'regulations', name: 'Regulations' },
];

const STALE_DAYS = 30;
export const isStale = (f: Fact, today: string) => f.review_tier === 1 && (Date.parse(today) - Date.parse(f.verified_on)) / 864e5 > STALE_DAYS;
/** Unverified facts and stale office holders are shown with a warning but never quizzed. */
export const quizzable = (f: Fact, today: string) => f.confidence !== 'verify' && !!f.a && !isStale(f, today);

export function shuffle<T>(xs: T[], rnd = Math.random): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export interface Question { factId: string; choices: string[]; correct: number }

/** Wrong choices come from the fact's own list, or from other answers in its group (the things cadets really mix up). */
export function buildQuestion(fact: Fact, all: Fact[], rnd = Math.random): Question | null {
  const pool = fact.distractors ?? [...new Set(all.filter((f) => f.group && f.group === fact.group && f.a && f.a !== fact.a).map((f) => f.a))];
  const wrong = shuffle(pool, rnd).slice(0, 3);
  if (wrong.length < 2) return null;
  const choices = shuffle([fact.a, ...wrong], rnd);
  return { factId: fact.id, choices, correct: choices.indexOf(fact.a) };
}

// ---- Placement test -------------------------------------------------------

export interface Answer { factId: string; module: Module; correct: boolean; sure: boolean }
export interface Placement { answers: Answer[]; level: 1 | 2 | 3; length: number; done: boolean; finishedOn?: string }
export const PLACEMENT_LENGTH = 40;

export const newPlacement = (available: number): Placement => ({ answers: [], level: 2, length: Math.min(PLACEMENT_LENGTH, available), done: false });

/** Adaptive pick: rotate through modules, and take the unused fact whose difficulty is closest to the current level. */
export function nextFact(p: Placement, facts: Fact[], rnd = Math.random): Fact | null {
  if (p.answers.length >= p.length) return null;
  const used = new Set(p.answers.map((a) => a.factId));
  const left = facts.filter((f) => !used.has(f.id));
  for (let i = 0; i < MODULES.length; i++) {
    const m = MODULES[(p.answers.length + i) % MODULES.length].id;
    const inModule = shuffle(left.filter((f) => f.module === m), rnd);
    if (inModule.length) return inModule.sort((a, b) => Math.abs((a.difficulty ?? 2) - p.level) - Math.abs((b.difficulty ?? 2) - p.level))[0];
  }
  return null;
}

export function record(p: Placement, a: Answer, today: string): Placement {
  const answers = [...p.answers, a];
  const level = Math.min(3, Math.max(1, p.level + (a.correct ? 1 : -1))) as 1 | 2 | 3;
  const done = answers.length >= p.length;
  return { ...p, answers, level, done, ...(done && { finishedOn: today }) };
}

export type Status = 'Not started' | 'Learning' | 'Solid' | 'Mastered';
export interface ModuleResult { module: Module; name: string; asked: number; correct: number; guessed: number; score: number; status: Status }

/** A correct answer marked "guess" counts half, so a lucky guess is not mastery. */
export function summarize(answers: Answer[]): ModuleResult[] {
  return MODULES.map(({ id, name }) => {
    const mine = answers.filter((a) => a.module === id);
    const correct = mine.filter((a) => a.correct).length;
    const guessed = mine.filter((a) => a.correct && !a.sure).length;
    const score = mine.length ? (correct - guessed / 2) / mine.length : 0;
    const status: Status = !mine.length ? 'Not started' : score >= 0.85 ? 'Mastered' : score >= 0.5 ? 'Solid' : 'Learning';
    return { module: id, name, asked: mine.length, correct, guessed, score, status };
  });
}

/** Facts to train: everything missed or guessed. */
export const gaps = (answers: Answer[]) => answers.filter((a) => !a.correct || !a.sure).map((a) => a.factId);

// Which modules matter most for each goal; used to rank the gap list and new cards.
export const GOALS: { id: string; name: string; modules: Module[] }[] = [
  { id: 'promotion', name: 'Next promotion', modules: ['ranks', 'knowledge', 'regulations'] },
  { id: 'board', name: 'Promotion board', modules: ['knowledge', 'chain', 'ranks'] },
  { id: 'inspection', name: 'Uniform inspection', modules: ['uniform', 'ribbons', 'chain'] },
  { id: 'drill', name: 'Drill team', modules: ['drill'] },
  { id: 'colorguard', name: 'Color guard', modules: ['drill', 'knowledge'] },
  { id: 'bowl', name: 'Academic bowl', modules: ['knowledge', 'regulations'] },
  { id: 'ribbons', name: 'Ribbons and awards', modules: ['ribbons'] },
  { id: 'service', name: 'ROTC or enlistment', modules: ['knowledge', 'ranks'] },
  { id: 'learning', name: 'Just learning', modules: [] },
];

/** Module order for study: goal modules first, then weakest placement score first. */
export function modulePriority(goalIds: string[], results: ModuleResult[] | null): Module[] {
  const wanted = new Set(GOALS.filter((g) => goalIds.includes(g.id)).flatMap((g) => g.modules));
  const score = (m: Module) => results?.find((r) => r.module === m)?.score ?? 0;
  return MODULES.map((m) => m.id).sort((a, b) => Number(wanted.has(b)) - Number(wanted.has(a)) || score(a) - score(b));
}
