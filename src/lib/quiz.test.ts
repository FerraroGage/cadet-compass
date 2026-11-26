import { describe, it, expect } from 'vitest';
import { review } from './srs';
import { buildQuestion, newPlacement, nextFact, record, summarize, gaps, quizzable, modulePriority, weightOf, pickWeighted } from './quiz';
import type { Fact } from './bundle';

const fact = (id: string, over: Partial<Fact> = {}): Fact => ({
  id, branch: ['usmc'], module: 'ranks', topic: 't', text: 't', q: 'q', a: 'a-' + id, group: 'g', difficulty: 2,
  source: { title: 's', publisher: 'p', url: 'https://example.gov', locator: 'p. 1' }, edition: 'e',
  effective_from: null, verified_on: '2026-11-12', confidence: 'high', review_tier: 2, ...over,
});

describe('SM-2', () => {
  it('spaces good answers 1 day, 6 days, then by ease', () => {
    let c = review(undefined, 2, '2026-11-12');
    expect(c.due).toBe('2026-11-13');
    c = review(c, 2, '2026-11-13');
    expect(c.due).toBe('2026-11-19');
    c = review(c, 2, '2026-11-19');
    expect(c.interval).toBe(15);
  });
  it('brings a missed card back the same day and never lets ease fall below 1.3', () => {
    let c = review(undefined, 2, '2026-11-12');
    for (let i = 0; i < 10; i++) c = review(c, 0, '2026-11-13');
    expect(c.due).toBe('2026-11-13');
    expect(c.reps).toBe(0);
    expect(c.lapses).toBe(10);
    expect(c.ef).toBe(1.3);
  });
});

describe('questions', () => {
  const all = ['1', '2', '3', '4', '5'].map((i) => fact(i));
  it('draws wrong choices from the same group and marks the right one', () => {
    const q = buildQuestion(all[0], all)!;
    expect(q.choices).toHaveLength(4);
    expect(q.choices[q.correct]).toBe('a-1');
    expect(new Set(q.choices).size).toBe(4);
  });
  it('builds no question without enough wrong choices', () => {
    expect(buildQuestion(fact('x', { group: 'alone' }), all)).toBeNull();
  });
  it('never quizzes unverified facts or stale office holders', () => {
    expect(quizzable(fact('v', { confidence: 'verify', a: '' }), '2026-11-12')).toBe(false);
    expect(quizzable(fact('s', { review_tier: 1, verified_on: '2026-10-01' }), '2026-11-12')).toBe(false);
    expect(quizzable(fact('ok', { review_tier: 1 }), '2026-11-12')).toBe(true);
  });
});

describe('placement', () => {
  const facts = [fact('e', { difficulty: 1 }), fact('m', { difficulty: 2 }), fact('h', { difficulty: 3 })];
  it('starts at medium, stays there after a correct answer, and moves down after a miss', () => {
    let p = newPlacement(3);
    expect(nextFact(p, facts)!.id).toBe('m');
    p = record(p, { factId: 'm', module: 'ranks', correct: true, sure: true }, '2026-11-12');
    expect(p.level).toBe(2);
    p = record(p, { factId: 'h', module: 'ranks', correct: false, sure: true }, '2026-11-12');
    p = record(p, { factId: 'x', module: 'ranks', correct: false, sure: true }, '2026-11-12');
    expect(p.level).toBe(1);
    expect(p.done).toBe(true);
  });
  it('opens on the module chosen by its random start', () => {
    const mixed = [fact('r', { module: 'ranks' }), fact('d', { module: 'drill' })];
    expect(nextFact(newPlacement(2, 2, 2, () => 0), mixed)!.id).toBe('r'); // start 0 = Ranks
    expect(nextFact(newPlacement(2, 2, 2, () => 0.6), mixed)!.id).toBe('d'); // start 4 = Drill
  });
  it('counts a guessed correct answer as half and lists it as a gap', () => {
    const answers = [
      { factId: 'a', module: 'ranks' as const, correct: true, sure: true },
      { factId: 'b', module: 'ranks' as const, correct: true, sure: false },
    ];
    const r = summarize(answers).find((x) => x.module === 'ranks')!;
    expect(r.score).toBe(0.75);
    expect(r.status).toBe('Solid');
    expect(gaps(answers)).toEqual(['b']);
    expect(summarize(answers).find((x) => x.module === 'drill')!.status).toBe('Not started');
  });
  it('puts goal modules first', () => {
    expect(modulePriority(['drill'], null)[0]).toBe('drill');
  });
});

describe('question weights', () => {
  const fs = [fact('a', { module: 'ranks', topic: 'x' }), fact('b', { module: 'ranks', topic: 'y' }), fact('c', { module: 'drill', topic: 'z' })];
  const W = { modules: { drill: 3 }, topics: { 'ranks|y': 0 } };
  it('topic beats module beats 1', () => {
    expect(weightOf(fs[0], W)).toBe(1);
    expect(weightOf(fs[1], W)).toBe(0);
    expect(weightOf(fs[2], W)).toBe(3);
  });
  it('never picks weight 0 and picks without repeats', () => {
    for (let i = 0; i < 50; i++) expect(pickWeighted(fs, 3, W).map((f) => f.id).sort()).toEqual(['a', 'c']);
  });
  it('follows the weights', () => {
    let c = 0;
    for (let i = 0; i < 2000; i++) if (pickWeighted(fs, 1, { modules: { drill: 3 }, topics: {} })[0].id === 'c') c++;
    expect(c / 2000).toBeGreaterThan(0.5); // expected 0.6
  });
  it('falls back to uniform when everything is 0', () => {
    expect(pickWeighted(fs, 3, { modules: { ranks: 0, drill: 0 }, topics: {} })).toHaveLength(3);
  });
});

describe('obscure facts', () => {
  const w = { modules: {}, topics: {} };
  const f = (difficulty: 1 | 2 | 3, topic = 'History') => ({ module: 'knowledge', topic, difficulty }) as Fact;
  it('come up less often than common ones, unless a topic weight is set', () => {
    expect(weightOf(f(3), w)).toBeLessThan(weightOf(f(2), w));
    expect(weightOf(f(2), w)).toBeLessThan(weightOf(f(1), w));
    expect(weightOf(f(1, 'Glossary'), w)).toBeLessThan(weightOf(f(1), w));
    expect(weightOf(f(3), { modules: {}, topics: { 'knowledge|History': 2 } })).toBe(2);
  });
  it('placement level never climbs past standard', () => {
    let p = newPlacement(10, 5);
    for (let i = 0; i < 4; i++) p = record(p, { factId: String(i), module: 'knowledge', correct: true, sure: true }, '2026-11-25');
    expect(p.level).toBe(2);
  });
});
