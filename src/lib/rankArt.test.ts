import { test, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { RANKS, rankOf, type Service } from './rankArt';
import { CADET_RANKS } from './cadetRanks';
import { quizzable } from './quiz';
import type { Fact } from './bundle';
import facts from '../../content/usmc/ranks.json';

test('every rank taught has an entry, and every picture exists', () => {
  for (const r of CADET_RANKS) expect(rankOf('cadet', r), r).toBeDefined();
  for (const f of facts) {
    const m = f.group?.match(/^rank-(usmc|navy)-/);
    if (m && f.order) expect(rankOf(m[1] as Service, f.a), f.a).toBeDefined();
  }
  for (const s of Object.values(RANKS)) for (const k of Object.values(s)) for (const [art] of Object.values(k)) if (art) expect(existsSync(`public/img/ranks/${art}.png`), art).toBe(true);
});

test('pay grades match the content', () => {
  for (const f of facts) {
    const m = f.group?.match(/^paygrade-(usmc|navy)-/);
    const name = m && f.q.match(/(?:a|an) (.+)\?$/)?.[1];
    if (name) expect(rankOf(m[1] as Service, name)?.[2], name).toBe(f.a);
  }
});

test('rank questions ask about insignia, never order or pay grade, and every pictured rank has one', () => {
  const asked = (facts as Fact[]).filter((f) => quizzable(f, '2026-11-25'));
  expect(asked.some((f) => /^(rank|paygrade)-(usmc|navy)-/.test(f.group ?? ''))).toBe(false);
  for (const [s, k] of Object.entries(RANKS)) for (const ranks of Object.values(k)) for (const [name, [art]] of Object.entries(ranks))
    if (art) expect(asked.some((f) => f.group?.startsWith(`ins-${s}-`) && f.a === name), `${s} ${name}`).toBe(true);
});
