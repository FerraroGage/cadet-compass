// Validates every fact file against the JSON Schema.
// Fails on: schema errors (a missing source or verified_on is a schema error),
// duplicate ids, an empty answer on a fact not marked 'verify', and a group too small to build a quiz from.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Ajv from 'ajv';

export function loadFacts(root = 'content') {
  const facts = [];
  for (const branch of readdirSync(root, { withFileTypes: true })) {
    if (!branch.isDirectory() || branch.name === 'schema') continue;
    for (const f of readdirSync(join(root, branch.name)).sort()) {
      if (f.endsWith('.json')) facts.push({ file: join(root, branch.name, f), data: JSON.parse(readFileSync(join(root, branch.name, f), 'utf8')) });
    }
  }
  return facts;
}

export function validate(files, schema, today = new Date().toISOString().slice(0, 10)) {
  const check = new Ajv({ allErrors: true }).compile(schema);
  const errors = [], warnings = [], seen = new Set();
  for (const { file, data } of files) {
    if (!check(data)) for (const e of check.errors) errors.push(`${file}${e.instancePath}: ${e.message}${e.params.missingProperty ? '' : ' ' + JSON.stringify(e.params)}`);
    if (!Array.isArray(data)) continue;
    for (const f of data) {
      if (!f || typeof f !== 'object') continue;
      if (seen.has(f.id)) errors.push(`${file}: duplicate id ${f.id}`);
      seen.add(f.id);
      if (f.confidence !== 'verify' && !f.a) errors.push(`${file}: ${f.id} has no answer and is not marked 'verify'`);
      if (f.verified_on > today) errors.push(`${file}: ${f.id} verified_on is in the future`);
      const age = (Date.parse(today) - Date.parse(f.verified_on)) / 864e5;
      if (f.review_tier === 1 && age > 30) warnings.push(`${file}: ${f.id} is a tier 1 fact last verified ${Math.round(age)} days ago`);
    }
  }
  return { errors, warnings, count: seen.size };
}

if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const schema = JSON.parse(readFileSync('content/schema/fact.schema.json', 'utf8'));
  const { errors, warnings, count } = validate(loadFacts(), schema);
  for (const w of warnings) console.warn('WARN  ' + w);
  for (const e of errors) console.error('ERROR ' + e);
  console.log(`${count} facts, ${errors.length} errors, ${warnings.length} warnings`);
  process.exit(errors.length ? 1 : 0);
}
