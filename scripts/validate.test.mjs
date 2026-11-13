import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { validate, loadFacts } from './validate.mjs';

const schema = JSON.parse(readFileSync('content/schema/fact.schema.json', 'utf8'));
const good = loadFacts().flatMap((f) => f.data).find((f) => f.confidence === 'high');
const run = (fact) => validate([{ file: 'test.json', data: [fact] }], schema, good.verified_on).errors; // judged on the sample's own check date, so the test does not age

describe('fact validation', () => {
  it('passes the real content', () => {
    expect(validate(loadFacts(), schema).errors).toEqual([]);
  });
  it('fails a fact with no source', () => {
    const { source, ...f } = good;
    expect(run(f).join()).toMatch(/source/);
  });
  it('fails a fact with no verified_on date', () => {
    const { verified_on, ...f } = good;
    expect(run(f).join()).toMatch(/verified_on/);
  });
  it('fails a fact with an empty answer that is not marked verify', () => {
    expect(run({ ...good, a: '' }).join()).toMatch(/no answer/);
  });
});
