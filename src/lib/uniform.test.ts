import { describe, it, expect } from 'vitest';
import { fmt, layoutRack } from './uniform';

describe('fmt', () => {
  it('writes inches to the nearest sixteenth', () => {
    expect(fmt(0.125, 'in')).toBe('1/8 in');
    expect(fmt(2.75, 'in')).toBe('2 3/4 in');
    expect(fmt(0, 'in')).toBe('0 in');
    expect(fmt(1.99, 'in')).toBe('2 in');
    expect(fmt(0.0625, 'in')).toBe('1/16 in');
  });
  it('writes centimeters to one decimal', () => {
    expect(fmt(0.125, 'cm')).toBe('0.3 cm');
    expect(fmt(1, 'cm')).toBe('2.5 cm');
  });
});

describe('layoutRack', () => {
  const ids = ['a', 'b', 'c', 'd', 'e'];
  it('puts the short row on top, senior first', () => {
    expect(layoutRack(ids, 3, 'left')).toEqual([['a', 'b', null], ['c', 'd', 'e']]);
    expect(layoutRack(ids, 3, 'right')).toEqual([[null, 'a', 'b'], ['c', 'd', 'e']]);
    expect(layoutRack(['a', 'b', 'c', 'd'], 3, 'centered')).toEqual([[null, 'a', null], ['b', 'c', 'd']]);
  });
  it('centers a short row when the source does not say', () => {
    expect(layoutRack(['a', 'b', 'c', 'd'], 3, null)[0]).toEqual([null, 'a', null]);
  });
  it('has no padding when rows are full, and handles empty', () => {
    expect(layoutRack(['a', 'b', 'c'], 3, 'centered')).toEqual([['a', 'b', 'c']]);
    expect(layoutRack([], 3, 'left')).toEqual([]);
  });
});
