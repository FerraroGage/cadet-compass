// Weekly office-holder check (STUB). Run by .github/workflows/weekly-officials.yml.
//
// It asks only public questions ("who holds this office") and never sends user data: this script has no
// access to any, because the app keeps everything on the cadet's device.
//
// It never edits content. It writes officials-report.md; the workflow opens an issue from that report,
// and a person decides what to change.
//
// The Gemini call is behind a feature flag and has NOT been run against the live API yet.
//   GEMINI_ENABLED=true   turn the call on (repository variable)
//   GEMINI_API_KEY        GitHub Actions secret; never commit it
//   GEMINI_MODEL          model name (repository variable); no default on purpose, check Google's current list
import { readFileSync, writeFileSync } from 'node:fs';

const today = new Date().toISOString().slice(0, 10);
const offices = JSON.parse(readFileSync('content/usmc/chain.json', 'utf8')).filter((f) => f.review_tier === 1);
const lines = [`# Office holder check, ${today}`, ''];

if (process.env.GEMINI_ENABLED !== 'true') {
  lines.push('Gemini check is switched off (GEMINI_ENABLED is not "true"). Listing stored values only.', '');
  for (const f of offices) lines.push(`- ${f.q} Stored: ${f.a || 'NOT VERIFIED'} (verified ${f.verified_on}, ${f.source.url})`);
  writeFileSync('officials-report.md', lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  process.exit(0);
}

const { GEMINI_API_KEY: key, GEMINI_MODEL: model } = process.env;
if (!key || !model) throw new Error('GEMINI_ENABLED is true but GEMINI_API_KEY or GEMINI_MODEL is missing.');

let changed = 0, failed = 0;
for (const f of offices) {
  const prompt = `Answer with JSON only: {"holder": string, "status": "confirmed" | "acting", "since": "YYYY-MM-DD" or null, "source_url": string}. Question about a United States public office, as of ${today}: ${f.q} Prefer the official page ${f.source.url}.`;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const answer = JSON.parse((await res.json()).candidates[0].content.parts[0].text);
    // The model's answer is untrusted text: it goes into a report for a person to read, never into the content files.
    const surname = (s) => String(s).trim().split(/\s+/).pop().toLowerCase();
    const same = f.a && surname(answer.holder) && f.a.toLowerCase().includes(surname(answer.holder));
    if (!same) changed++;
    lines.push(`- ${same ? 'same' : '**CHECK**'}: ${f.q} Stored: ${f.a || 'NOT VERIFIED'}. Reported: ${String(answer.holder).slice(0, 80)} (${String(answer.status).slice(0, 12)}, since ${String(answer.since).slice(0, 10)}). Evidence: ${String(answer.source_url).slice(0, 200)}`);
  } catch (e) {
    failed++;
    lines.push(`- FAILED: ${f.q} ${e.message}`);
  }
}
lines.push('', `${changed} to check, ${failed} failed, ${offices.length} offices.`);
writeFileSync('officials-report.md', lines.join('\n') + '\n');
console.log(lines.join('\n'));
// Exit codes for the workflow: 0 nothing to do, 10 a person should review, 20 the check itself failed.
process.exit(failed ? 20 : changed ? 10 : 0);
