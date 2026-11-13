# Branch study guide brief

You are writing the study content for ONE JROTC program in Cadet Compass, a study app for high school JROTC cadets.
Cadets study it for inspections, promotion boards and tests. A wrong fact is worse than a missing one.

## Output
Write files `content/<branch>/<module>.json`, where `<branch>` is your program id (army, navy, usaf, ussf, uscg) and
`<module>` is one of: ranks, ribbons, chain, uniform, drill, knowledge, regulations. Write only the modules you can source.
Edit nothing outside `content/<branch>/` except your report `docs/audit/<branch>.md`.

Each file is a JSON array of facts, 2-space indented. Copy the exact shape of the facts in `content/usmc/drill.json`
(read the first few). Schema: `content/schema/fact.schema.json`. Rules:
- `id`: `<branch>.<module>.<short-slug>`, unique. `branch`: `["<branch>"]`.
- `topic`: a short section name (facts are grouped by it on screen).
- `text`: one plain sentence stating the fact. `q`: a question with exactly one right answer. `a`: the short answer.
- Every quizzable fact needs wrong choices: either `distractors` (3 plausible but definitely wrong answers) or a shared
  `group` with at least 3 other facts whose answers are the wrong choices (for example all rank-order facts share `group: "rank"`).
- Ordered lists (rank order, ribbon precedence, chain of command) also get `order` (1 = highest/first) and a shared `group`.
- `difficulty` 1 to 3. `review_tier`: 1 for anything naming a current office holder, 2 for rules that change, 3 for stable facts.
- `source`: title, publisher, url, locator (page or paragraph). `edition` and `effective_from` (YYYY-MM-DD or null).
  `verified_on`: `2026-11-13`. `confidence`: "high" (official source read), "medium" (official source summary or several
  agreeing unit sources), "verify" (could not confirm; shown with a warning, never quizzed).

## Sources
- Use the program's own official publications first: the cadet handbook, field manual, or regulation published by that
  program's headquarters (.mil sites). Then the parent service's publications. Unit or school sites only as support.
- Many .mil sites block WebFetch (403). They open in the built-in browser: load tools with ToolSearch
  `select:mcp__Claude_Browser__tabs_create,mcp__Claude_Browser__navigate,mcp__Claude_Browser__get_page_text,mcp__Claude_Browser__javascript_tool`.
  Open your OWN tab with tabs_create and pass its tabId on every call (other helpers share the browser).
  For a PDF, navigate to it, then run in the page:
  `const m = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs'); m.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs'; window.d = await m.getDocument({data: await (await fetch(location.href)).arrayBuffer()}).promise; d.numPages`
  then read pages a few at a time with `(await (await d.getPage(n)).getTextContent()).items.map(x=>x.str).join(' ')`.
  Return short slices only; never dump a whole document into your context.
- Only open .mil, .gov and .edu pages in the browser. Never sign in, accept anything, download, or submit a form.

## What to include (core knowledge a cadet is actually tested on)
- ranks: cadet rank order (enlisted and officer) and insignia descriptions in words, as the program defines them.
- chain: the chain of command positions from the President to the cadet, as the program publishes it. Office holders
  only if you can confirm the current holder on an official .mil/.gov page today; otherwise leave names out.
- ribbons: the program's ribbon order of precedence, only from an official list. Never from memory.
- uniform: wear rules and measurements cadets are inspected on.
- drill: commands, step lengths, cadences, from the program's drill manual or the parent service's.
- knowledge: the program's mission, motto, creed or core values, key history, leadership principles, as published.
- regulations: rules cadets must follow (grade requirements for rank, conduct), only what cadets are tested on.

## What to leave out
- Trivia about how the program is designed, funded or authorized; anything about the handbook itself.
- Song or cadence lyrics (copyright). Service seals or emblems (do not describe them as images).
- Anything you cannot source. No invented names, numbers, dates or orders. Quality over count: 40 solid facts beat 150 shaky ones.

## Voice
Plain handbook voice. No exclamation points. No words "unlock", "journey", "seamless", "empower", "supercharge".

## When done
1. Run `node scripts/validate.mjs` in `C:\Users\gagep\JROTC APP` and fix every error in your files.
2. Write `docs/audit/<branch>.md`: the sources you used (title, URL, edition), facts per module, what you could not find.
3. Reply in 6 lines or fewer: facts per module, main sources, gaps.
