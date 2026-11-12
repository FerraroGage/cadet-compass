# Ready Seats

An unofficial study aid for Junior ROTC cadets. Installable web app (PWA), offline after first load, no accounts, nothing collected. Marine Corps JROTC is the first track.

Not affiliated with or endorsed by the Department of Defense (Department of War), any military service or any JROTC program. No service seal, emblem or logo is used anywhere in this repository.

Owner: Gage A. Pierce, Kellogg, Idaho. Contact: piercegage19@gmail.com

## Run it

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` then `npm run preview` | Production build, served locally (the service worker only exists here) |
| `npm test` | Unit tests: bundle signature and rollback, fact validation, scheduler, placement logic |
| `npm run check` | Type check |
| `npm run content:validate` | Fails on any fact without a source or verified-on date |
| `npm run content:sign` | Rebuilds and signs `public/content/bundle.json` (needs the private key) |
| `npm run content:check` | Confirms the committed bundle matches `content/` and its signature verifies (CI runs this) |

## Layout

```
content/schema/fact.schema.json   JSON Schema for a fact
content/usmc/*.json               Facts, one file per hub tab. This is the source of truth.
content/changelog.json            One entry per content version. Shown in the app as What Changed.
public/content/bundle.json, .sig  Signed bundle the app downloads. Built by content:sign. Committed.
scripts/                          validate, build-bundle (keygen, sign, check), make-icons, check-officials
src/lib/                          bundle.ts (signature check), srs.ts (SM-2), quiz.ts (questions, placement), store.svelte.ts (state, storage)
src/screens/                      TermsGate, Onboarding, Hub, Cards, Placement, Settings
src/legal/                        Terms of Service and Privacy Policy, every version kept
docs/DECISIONS.md                 Decision log, assumptions, open questions
```

## Changing content

1. Edit the JSON in `content/usmc/`. Every fact needs `source`, `edition`, `verified_on`, `confidence` and `review_tier`. If you cannot check something against an official publication, set `"confidence": "verify"` and leave `a` empty. The app shows it as "Not verified" and never quizzes it.
2. Add an entry with the next version number to `content/changelog.json`.
3. `npm run content:validate`, then `npm run content:sign`.
4. Commit `content/` and `public/content/` together and open a pull request.

The app rejects a bundle when the signature does not verify, when it was built for another app, or when its version is not higher than the one already on the device.

## The signing key

`keys/content-private.pem` is the Ed25519 private key. It is gitignored. Keep it offline with a backup. If it is lost or replaced, installed apps reject every later bundle until they also get a new app build with the new public key (`src/lib/content-key.ts`).

**Before public release, make a fresh key on a machine you trust** (`npm run content:keygen` after moving the old one away). The current key was made during development.

## Security and privacy

- No secrets in the repository. The Gemini key lives only in GitHub Actions secrets.
- Turn on in GitHub settings: secret scanning, push protection, Dependabot alerts, branch protection with required review on `main`, two-factor sign-in.
- The only network request the app makes is for its own files and the content bundle, from its own origin. A Content-Security-Policy in `index.html` enforces that.
- Content is data. All text is rendered as plain text; nothing downloaded is run or inserted as HTML.
- User data never goes to any AI service. The weekly job has no access to it.

## Weekly office-holder check

`.github/workflows/weekly-officials.yml` runs `scripts/check-officials.mjs` every Monday. It is a stub: the Gemini call is off until the repository variable `GEMINI_ENABLED` is `true`, with `GEMINI_MODEL` set and the secret `GEMINI_API_KEY` added. It writes a report and opens an issue. It never edits content.
