// Builds the content bundle from content/ and signs or checks it.
//   --keygen  make a new Ed25519 key pair (private key stays in keys/, which is gitignored)
//   --sign    write public/content/bundle.json and bundle.sig (needs the private key; run on the owner's machine)
//   --check   rebuild in memory, compare with the committed bundle, verify the signature (runs in CI, needs no secret)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { generateKeyPairSync, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { loadFacts, validate } from './validate.mjs';

const OUT = 'public/content', KEY_FILE = 'keys/content-private.pem', PUB_FILE = 'src/lib/content-key.ts';
const mode = process.argv[2];

function build() {
  const files = loadFacts();
  const { errors } = validate(files, JSON.parse(readFileSync('content/schema/fact.schema.json', 'utf8')));
  if (errors.length) throw new Error('Content does not validate. Run npm run content:validate.');
  const changelog = JSON.parse(readFileSync('content/changelog.json', 'utf8')).sort((a, b) => b.version - a.version);
  // No timestamps: the same content must always produce the same bytes, so CI can compare.
  return Buffer.from(JSON.stringify({ app: 'ready-seats', version: changelog[0].version, date: changelog[0].date, changelog, facts: files.flatMap((f) => f.data) }));
}

const publicKey = () => {
  const raw = Buffer.from(readFileSync(PUB_FILE, 'utf8').match(/'([A-Za-z0-9+/=]{44})'/)[1], 'base64');
  return createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: raw.toString('base64url') }, format: 'jwk' });
};

if (mode === '--keygen') {
  if (existsSync(KEY_FILE)) throw new Error(`${KEY_FILE} already exists. Move it away first; replacing the key makes installed apps reject new bundles.`);
  const { privateKey, publicKey: pub } = generateKeyPairSync('ed25519');
  mkdirSync('keys', { recursive: true });
  writeFileSync(KEY_FILE, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
  const raw = Buffer.from(pub.export({ format: 'jwk' }).x, 'base64url').toString('base64');
  writeFileSync(PUB_FILE, `// Ed25519 public key for content bundles. Public by design. The private key never enters the repository.\nexport const CONTENT_PUBLIC_KEY = '${raw}';\n`);
  console.log(`Wrote ${KEY_FILE} (keep it offline, never commit it) and ${PUB_FILE}.`);
} else if (mode === '--sign') {
  const pem = process.env.CONTENT_SIGNING_KEY || readFileSync(KEY_FILE, 'utf8');
  const bytes = build();
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/bundle.json`, bytes);
  writeFileSync(`${OUT}/bundle.sig`, sign(null, bytes, createPrivateKey(pem)).toString('base64'));
  console.log(`Signed bundle version ${JSON.parse(bytes).version}, ${bytes.length} bytes.`);
} else if (mode === '--check') {
  const committed = readFileSync(`${OUT}/bundle.json`);
  if (!build().equals(committed)) throw new Error('public/content/bundle.json is out of date. Run npm run content:sign and commit the result.');
  if (!verify(null, committed, publicKey(), Buffer.from(readFileSync(`${OUT}/bundle.sig`, 'utf8'), 'base64'))) throw new Error('Bundle signature does not verify against the public key.');
  console.log(`Bundle version ${JSON.parse(committed).version} matches content/ and its signature verifies.`);
} else {
  console.error('Usage: node scripts/build-bundle.mjs --keygen | --sign | --check');
  process.exit(1);
}
