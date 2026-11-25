import { test, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { RANKS, rankOf, type Service } from './rankArt';
import { CADET_RANKS } from './cadetRanks';
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
