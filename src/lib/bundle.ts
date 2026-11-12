// Content bundle types and signature check. A bundle is data only; nothing in it is ever executed.

export interface Source { title: string; publisher: string; url: string; locator: string }
export type Module = 'ranks' | 'ribbons' | 'chain' | 'uniform' | 'drill' | 'knowledge' | 'regulations';
export interface Fact {
  id: string; branch: string[]; module: Module; topic: string; text: string; q: string; a: string;
  group?: string; distractors?: string[]; order?: number; difficulty?: 1 | 2 | 3;
  source: Source; edition: string; effective_from: string | null; verified_on: string;
  confidence: 'high' | 'medium' | 'verify'; review_tier: 1 | 2 | 3;
}
export interface ChangeEntry { version: number; date: string; branch: string; changes: string[] }
export interface Bundle { app: string; version: number; date: string; changelog: ChangeEntry[]; facts: Fact[] }

export const APP_ID = 'ready-seats';

const fromB64 = (s: string) => Uint8Array.from(atob(s.trim()), (c) => c.charCodeAt(0));

/**
 * Accepts a bundle only if the Ed25519 signature covers these exact bytes, it was built for this app,
 * and its version is newer than the one already held (rollback protection). Throws otherwise.
 */
export async function verifyBundle(bytes: Uint8Array, signatureB64: string, publicKeyB64: string, heldVersion: number): Promise<Bundle> {
  let ok = false;
  try {
    const key = await crypto.subtle.importKey('raw', fromB64(publicKeyB64), { name: 'Ed25519' }, false, ['verify']);
    ok = await crypto.subtle.verify({ name: 'Ed25519' }, key, fromB64(signatureB64), bytes as BufferSource);
  } catch {
    // A malformed signature, or a browser without Ed25519, is treated the same as a bad signature.
  }
  if (!ok) throw new Error('Content bundle rejected: signature does not verify.');
  const bundle = JSON.parse(new TextDecoder().decode(bytes)) as Bundle;
  if (bundle.app !== APP_ID) throw new Error('Content bundle rejected: built for a different app.');
  if (!Number.isInteger(bundle.version) || bundle.version <= heldVersion) throw new Error('Content bundle rejected: not newer than the content already held.');
  if (!Array.isArray(bundle.facts) || !Array.isArray(bundle.changelog)) throw new Error('Content bundle rejected: wrong shape.');
  return bundle;
}
