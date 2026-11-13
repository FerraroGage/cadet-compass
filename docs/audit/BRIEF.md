# Fact audit brief (Marine Corps JROTC content)

You are auditing ONE file of study facts for Cadet Compass, a study app for high school Marine Corps JROTC cadets.
Cadets use these to study for inspections, promotion boards and tests, so a wrong answer is worse than a missing one.

## Inputs
- Your file: `content/usmc/<module>.json` (an array of facts). Schema: `content/schema/fact.schema.json`.
- Primary source, full text: `docs/sources/mcjrotc-cadet-handbook.txt` (the MCJROTC Cadet Handbook, page markers `=== PAGE n ===`).
  It is old (PDF dated 2007). Where current Marine Corps or MCJROTC sources disagree, the current source wins.
- Web search for checking. marines.mil blocks automated page fetches, so rely on search result text, and on other official
  sites (usmcu.edu, history.navy.mil, navy.mil, defense.gov, whitehouse.gov, congress.gov, ecfr.gov) when you need a page.
  MCJROTC unit sites (Google Sites, school pages) are supporting evidence only, never the sole basis for a change.

## For every fact, check
1. **Correct.** Is `a` (the answer) and `text` right according to the best current source? Is `q` clear with exactly one right answer?
2. **Consistent.** Does it agree with the other facts in this file (same names, same numbers, same spelling)?
3. **Distractors.** If `distractors` exist, are they all definitely wrong but plausible? None may also be correct.
4. **Worth knowing.** Would a cadet plausibly be asked this at an inspection, board, test or in class? Remove facts that are
   trivia about the program's design or the handbook itself, e.g. "What is the rank structure modeled on?" or
   "What decides which ranks a unit uses?". Keep core knowledge: ranks, insignia wording, chain of command, uniform rules and
   measurements, drill commands and counts, general orders, leadership traits and principles, history, core values, customs.

## What to do
- **Wrong and you found a reliable source:** fix `q`/`a`/`text`/`distractors` in place. Keep the `id`. If the new source is not
  the handbook, replace `source` (title, publisher, url, locator) and `edition`. Set `verified_on` to `2026-11-13`.
- **Right:** set `verified_on` to `2026-11-13`. Leave everything else alone.
- **Can't confirm either way and it matters:** set `confidence` to `"verify"` (the app then shows it with a warning and never quizzes it).
- **Not worth knowing, or a duplicate:** delete it.
- Facts that name a current office holder (review_tier 1) were checked on 12 Nov 2026; only confirm them, do not rename anyone
  unless an official .mil or .gov source shows a change.
- Never invent names, numbers, dates or ribbon order. No song or cadence lyrics. Plain handbook voice, no exclamation points.
- Keep the JSON valid and 2-space indented. Edit ONLY your own file.

## When done
1. Run `node scripts/validate.mjs` from `C:\Users\gagep\JROTC APP` and fix any error it reports for your file.
2. Write `docs/audit/<module>.md`: one line per change, as `id: CHANGED|REMOVED|VERIFY: what and why (source)`. End with counts
   of facts checked, changed, removed, marked verify.
3. Reply in 6 lines or fewer: counts, the 3 most important corrections, any blocker.
