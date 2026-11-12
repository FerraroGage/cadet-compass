import { describe, it, expect, beforeAll } from 'vitest';
import { verifyBundle, APP_ID } from './bundle';

const b64 = (b: ArrayBuffer | Uint8Array) => Buffer.from(b as ArrayBuffer).toString('base64');
const enc = (o: unknown) => new TextEncoder().encode(JSON.stringify(o));
let pub: string;
let signBytes: (bytes: Uint8Array) => Promise<string>;

beforeAll(async () => {
  const pair = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])) as CryptoKeyPair;
  pub = b64(await crypto.subtle.exportKey('raw', pair.publicKey));
  signBytes = async (bytes) => b64(await crypto.subtle.sign({ name: 'Ed25519' }, pair.privateKey, bytes as BufferSource));
});

const good = (version = 2) => enc({ app: APP_ID, version, date: '2026-11-12', changelog: [], facts: [] });

describe('verifyBundle', () => {
  it('accepts a correctly signed, newer bundle', async () => {
    const bytes = good(2);
    expect((await verifyBundle(bytes, await signBytes(bytes), pub, 1)).version).toBe(2);
  });

  it('rejects a bundle changed after signing', async () => {
    const bytes = good(2);
    const sig = await signBytes(bytes);
    const tampered = new TextEncoder().encode(new TextDecoder().decode(bytes).replace('"facts":[]', '"facts":[{"id":"fake"}]'));
    await expect(verifyBundle(tampered, sig, pub, 1)).rejects.toThrow(/signature/);
  });

  it('rejects a bundle signed with another key', async () => {
    const other = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])) as CryptoKeyPair;
    const bytes = good(2);
    const sig = b64(await crypto.subtle.sign({ name: 'Ed25519' }, other.privateKey, bytes as BufferSource));
    await expect(verifyBundle(bytes, sig, pub, 1)).rejects.toThrow(/signature/);
  });

  it('rejects an older bundle and a replay of the held version', async () => {
    const older = good(1), same = good(3);
    await expect(verifyBundle(older, await signBytes(older), pub, 3)).rejects.toThrow(/not newer/);
    await expect(verifyBundle(same, await signBytes(same), pub, 3)).rejects.toThrow(/not newer/);
  });

  it('rejects a validly signed bundle built for a different app', async () => {
    const bytes = enc({ app: 'someone-else', version: 9, date: '2026-11-12', changelog: [], facts: [] });
    await expect(verifyBundle(bytes, await signBytes(bytes), pub, 1)).rejects.toThrow(/different app/);
  });

  it('rejects a missing or malformed signature', async () => {
    await expect(verifyBundle(good(2), '', pub, 1)).rejects.toThrow(/signature/);
    await expect(verifyBundle(good(2), 'not base64 !!', pub, 1)).rejects.toThrow(/signature/);
  });
});
