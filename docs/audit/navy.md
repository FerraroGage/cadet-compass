# Navy JROTC (navy) audit

Verified 2026-11-13. All facts read from official NSTC PDFs on netc.navy.mil (confidence high).

## Sources
- NJROTC Cadet Field Manual (CFM), 12th Edition, NAVEDTRA 37116-L, 17 Apr 2024 (0509-LP-002-6028).
  https://www.netc.navy.mil/Portals/46/NSTC/NJROTC/docs/Manuals/CFM%2012th%20Edition%20Master%20Draft%20(0509-LP-002-6028)%2017%20APR%202024.pdf
  The file name says "Master Draft". Locators are the printed page numbers.
- NJROTC Cadet Reference Manual (CRM), Fourth Edition, 18 Apr 2024 (0509-LP-002-6029).
  https://www.netc.navy.mil/Portals/46/NSTC/NJROTC/docs/Manuals/2024%20CRM%204th%20Edition%20(0509-LP-002-6029)%2018%20APR%202024.pdf
- NJROTC Cadet Drill Manual, 1st Edition, 2024 (NSN 0509LP0029217).
  https://www.netc.navy.mil/Portals/46/NSTC/NJROTC/docs/Manuals/NJROTC%20Drill%20Manual%201st%20Edition-NSN%200509LP0029217-2024%20Electronic%20Version-Color.pdf

## Facts per module
ranks 15, ribbons 34, chain 5, uniform 25, drill 26, knowledge 35, regulations 3 (143 total after cleanup).

## Gaps
- Rank insignia: shown only as pictures in the CRM, so no wording to cite. Not written.
- Ribbon order: the CRM list (28 items) is cited as given. Ribbon criteria written for only two ribbons.
- Chain of command: only the cadet chain (CRM p. 14). The DoD and Navy chain charts are images with no text, so no
  office holders or higher links were written.
- Rank-to-grade requirements and promotion rules are not in the three manuals read (CRM, CFM, Drill Manual); NSTC instructions were not read.
- Uniform: per-uniform component lists and tie-knot steps are image-heavy and were skipped. Drill: manual of arms and
  ceremonies chapters were not covered.
- Drill Manual effective date is not stated in the text read, so effective_from is null.

## Cleanup pass (coordinator review)
- Yes/No questions rewritten to name the answer: no-sister, no-partial, no-political, necklace, sunglasses (uniform).
- Removed regulations.reflective (yes/no, no specific answer).
- Count questions rewritten to name the items: drill.cmd-types (four command types), drill.rest-positions (four rests).
- Manual-centered wording removed: chain.squads-per-platoon (no "chart"), knowledge.leadership-count (no "CRM").
- Distractors fixed because they were true elsewhere: ribbons.wear-rows (Two, allowed under SDB lapel), uniform.women-bun (2 inches is hair bulk),
  drill.quick-step (15 inch is a listed Quick Time step length), drill.arm-swing (3 inches is the rear swing), drill.front (12 inches is depth),
  drill.interval (close interval), drill.halt-counts (Two is the Quick Time halt), uniform.aig-uniforms (Service Khaki is a Service uniform),
  uniform.khaki-approval (instructor option), uniform.women-bangs (pinned-bangs option was unsupported).
