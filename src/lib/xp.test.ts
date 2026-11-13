import { describe, it, expect } from 'vitest';
import { points, earn, levelOf, floor, streakOf, type XpEvent } from './xp';
import { nameProblem } from './names';

const ev = (kind: XpEvent['kind'], day: string, extra: Partial<XpEvent> = {}): XpEvent => ({ id: Math.random().toString(), kind, day, pts: 10, ...extra });

describe('xp', () => {
  it('pays more for higher quiz scores and nothing below the pass mark', () => {
    expect(points('quiz', { score: 0.5 })).toBe(0);
    expect(points('quiz', { score: 0.7 })).toBe(17);
    expect(points('quiz', { score: 0.9 })).toBe(19);
    expect(points('quiz', { score: 1 })).toBe(30);
    expect(points('quiz', { score: 99 })).toBe(30); // an out-of-range score is clamped
  });
  it('caps each activity per day', () => {
    const ledger = Array.from({ length: 5 }, () => ev('lesson', '2026-11-12'));
    expect(earn('lesson', {}, '2026-11-12', ledger)).toBe(0);
    expect(earn('lesson', {}, '2026-11-13', ledger)).toBe(10);
    expect(earn('quiz', { score: 1 }, '2026-11-12', ledger)).toBe(30);
  });
  it('pays placement and each streak milestone once', () => {
    expect(earn('placement', {}, '2026-11-13', [ev('placement', '2026-11-12')])).toBe(0);
    expect(earn('streak', { n: 7 }, '2026-11-13', [ev('streak', '2026-11-01', { n: 7 })])).toBe(0);
    expect(earn('streak', { n: 30 }, '2026-11-13', [ev('streak', '2026-11-01', { n: 7 })])).toBe(150);
    expect(earn('streak', { n: 8 }, '2026-11-13', [])).toBe(0);
  });
  it('raises level thresholds gradually', () => {
    expect([1, 2, 3, 4, 5].map(floor)).toEqual([0, 100, 250, 450, 700]);
    expect(levelOf(0).level).toBe(1);
    expect(levelOf(99).level).toBe(1);
    expect(levelOf(100)).toEqual({ level: 2, into: 0, span: 150, next: 250 });
    expect(levelOf(460).level).toBe(4);
  });
  it('counts a streak that ends today or yesterday', () => {
    const days = { '2026-11-10': 3, '2026-11-11': 1, '2026-11-12': 5 };
    expect(streakOf(days, '2026-11-12')).toBe(3);
    expect(streakOf(days, '2026-11-13')).toBe(3);
    expect(streakOf(days, '2026-11-14')).toBe(0);
    expect(streakOf({ '2026-03-01': 1, '2026-02-28': 1 }, '2026-03-01')).toBe(2);
  });
});

describe('display names', () => {
  it('accepts ordinary names', () => {
    for (const n of ['Gage', 'Jack', 'Hancock', 'Cadet Smith', 'Cassidy', 'sgt_pepper-7', 'Ana.M']) expect(nameProblem(n)).toBe('');
  });
  it('rejects bad length and characters', () => {
    expect(nameProblem('a')).not.toBe('');
    expect(nameProblem('x'.repeat(21))).not.toBe('');
    expect(nameProblem('<b>hi</b>')).not.toBe('');
  });
  it('rejects profanity, including disguised spellings, and staff names', () => {
    for (const n of ['fuck', 'Sh1thead', 'f.u.c.k', 'biiiitch', 'App Admin', 'a$$hole', 'n1gger']) expect(nameProblem(n)).not.toBe('');
  });
});
