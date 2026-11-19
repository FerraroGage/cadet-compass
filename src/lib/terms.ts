// Everyday names cadets use for uniforms, shown when Settings > Wording is "simple" (the default).
// "official" shows the names as the regulations print them. Apply with term(text) anywhere a uniform name may appear.
import { app } from './store.svelte';

// [official name as it appears in the content and data, everyday name]; longest first so "Blue Dress \"Delta\"" wins over shorter matches.
export const UNIFORM_NAMES: [string, string][] = [
  ['Blue Dress "Alpha"', 'Dress Blue Alphas'],
  ['Blue Dress "Bravo"', 'Dress Blues'],
  ['Blue Dress "Charlie"', 'Dress Blue Charlies'],
  ['Blue Dress "Delta"', 'Dress Blue Deltas'],
  ['Service "Alpha"', 'Service Alphas'],
  ['Service "Bravo"', 'Service Bravos'],
  ['Service "Charlie"', 'Service Charlies'],
  ['Utility (camouflage, cammies)', 'Cammies'],
  ['Utility D uniform', 'Cammies'],
  ['Utility Uniform', 'Cammies'],
  ['Utility uniform', 'Cammies'],
  ['utility uniform', 'cammies'],
  ['Physical Training uniform', 'PT Gear'],
  ['PT uniform', 'PT Gear'],
  ['Blue Dress B', 'Dress Blues'],
  ['Utility D', 'Cammies'],
  ['MCCUU', 'Cammies'],
];

/** The text with uniform names in the cadet's chosen wording. */
export function term(text: string): string {
  if (app.wording === 'official' || !text) return text;
  let out = text;
  for (const [formal, plain] of UNIFORM_NAMES) out = out.split(formal).join(plain);
  return out;
}
