import raw from '../data/usmc-uniform.json';

export type Units = 'in' | 'cm';
export interface Measure { label: string; in: number | null; text?: string; from?: string; src: string; loc: string }
export interface UItem {
  id: string; name: string; where: string;
  region: 'left-pocket' | 'right-pocket' | 'collar' | 'sleeve' | 'waist';
  measures: Measure[]; notes: string[]; confidence: 'high' | 'verify';
}
export interface Uniform { id: string; name: string; items: UItem[] }
export interface Device { id: string; name: string; meaning: string; max: number; src: string; loc: string }
export interface Rack {
  perRow: number; topRow: 'centered' | 'left' | 'right' | null;
  gapAbovePocket_in: number | null; gapAboveBadge_in: number | null; rowGap_in: number | null;
  ribbonWidth_in: number | null; ribbonHeight_in: number | null;
  devices: Device[]; src: string; loc: string;
}
export interface Line { id: string; text: string; uniforms: string[]; src: string; loc: string }
export interface UniformData {
  branch: string; checked: string;
  sources: Record<string, { title: string; url: string; edition: string }>;
  uniforms: Uniform[]; rack: Rack; checklist: Line[];
}

export const data = raw as unknown as UniformData;

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** "1/8 in", "2 3/4 in" (nearest 1/16) or "0.3 cm" (one decimal). */
export function fmt(inches: number, units: Units): string {
  if (units === 'cm') return `${(inches * 2.54).toFixed(1)} cm`;
  const n = Math.round(inches * 16);
  const whole = Math.floor(n / 16), rem = n % 16;
  if (!rem) return `${whole} in`;
  const g = gcd(rem, 16), frac = `${rem / g}/${16 / g}`;
  return `${whole ? whole + ' ' : ''}${frac} in`;
}

/** Rows senior first (row 0 is the top). The short row is the top row, padded with null per topRow. */
export function layoutRack(ids: string[], perRow: number, topRow: 'centered' | 'left' | 'right' | null): (string | null)[][] {
  if (!ids.length) return [];
  const short = ids.length % perRow;
  const rows: (string | null)[][] = [];
  let i = 0;
  if (short) {
    const gap = perRow - short;
    const left = topRow === 'left' ? 0 : topRow === 'right' ? gap : Math.floor(gap / 2);
    rows.push([...Array<null>(left).fill(null), ...ids.slice(0, short), ...Array<null>(gap - left).fill(null)]);
    i = short;
  }
  for (; i < ids.length; i += perRow) rows.push(ids.slice(i, i + perRow));
  return rows;
}
