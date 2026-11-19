import { describe, it, expect } from 'vitest';
import { term } from './terms';
import { app } from './store.svelte';

describe('term', () => {
  it('uses everyday names by default', () => {
    app.wording = 'simple';
    expect(term('Blue Dress "Delta": trousers')).toBe('Dress Blue Deltas: trousers');
    expect(term('On the Service "Bravo" and Utility D')).toBe('On the Service Bravos and Cammies');
    expect(term('the utility uniform, MCCUU')).toBe('the cammies, Cammies');
  });
  it('keeps official names', () => {
    app.wording = 'official';
    expect(term('Blue Dress "Delta"')).toBe('Blue Dress "Delta"');
    app.wording = 'simple';
  });
});
