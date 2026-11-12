# Decisions, assumptions and open questions

Running log. Newest session at the top.

## Session 1, 12 Nov 2026

### Decisions

| # | Decision | Why |
| --- | --- | --- |
| 1 | Vite + Svelte 5, not SvelteKit | There is no server. A static single-page app has fewer parts. |
| 2 | SM-2 written in `src/lib/srs.ts`, not FSRS | Twenty lines, tested, no dependency. Swap in FSRS later if review load needs tuning. |
| 3 | Browser WebCrypto for Ed25519, no crypto library | Built in. A browser too old to have it rejects the update and keeps the content it has. |
| 4 | The bundle is signed on the owner's machine and committed. CI only verifies. | The private key never touches GitHub. |
| 5 | Content bundle is kept in IndexedDB, not the service worker cache | The app checks the signature on every start, including the stored copy. |
| 6 | Working name "Ready Seats" | The classroom command from the handbook (p. 6). No service mark in it. See question 1. |
| 7 | Wrong answers in quizzes come from other answers in the same group | These are the things cadets really mix up. No question bank was copied from anywhere. |
| 8 | Facts marked `verify`, and office holders more than 30 days past their check, are shown with a flag and never quizzed | A wrong name in a quiz is worse than a missing one. |
| 9 | No ribbon or insignia drawings yet | The handbook text has no color or dimension specifications. Nothing was drawn from memory or from vendor pictures. |
| 10 | TypeScript pinned to 6 | svelte-check does not accept TypeScript 7 yet. |

### Assumptions to check

1. **The Cadet Handbook was not attached.** It was read from the address in the outline (mcjrotc.marines.mil). The file is 29 pages, has no printed edition date, and its PDF metadata says 30 Apr 2007. Every handbook fact cites it that way. `effective_from` on those facts is the file date, not a stated effective date.
2. **The handbook is old.** Things that may have changed since, all stored exactly as the handbook prints them:
   - Chain of command runs through "Commanding Officer, Marine Corps District" and a "District Project Officer". The outline describes a Training and Education Command and Region Director chain instead.
   - Quick time is given as 120 steps per minute. The outline quotes 112 to 120 from MCO 5060.20, which was not read this session.
   - 14 leadership traits. Newer material may list 15.
   - The 40-ribbon order of precedence. Item 35 reads "Color Guard, Page 16 Ribbon" in the PDF text, which is a page-break artifact; it is stored as "Color Guard Ribbon". "Military Officers Association of American" is stored as "America". "MCRA" is stored as printed, not expanded.
   - The ribbon list says "Physical Achievement Ribbon" (p. 15) and the PT section says "Physical Fitness Achievement Ribbon" (p. 20). Each is stored as printed on its page.
   - Marksmanship scores are stored as printed, including the gap between 200 and 221.
   - The handbook spells "Khe Sahn"; stored as "Khe Sanh".
   - Hair and earring standards are split by male and female cadets in the handbook and are stored that way.
3. The Marines' Hymn lyrics on p. 24 were left out under the no-lyrics rule.
4. Onboarding rank and billet lists are the handbook's (p. 10). It does not list Cadet Master Sergeant or Master Gunnery Sergeant, so neither is offered.
5. Region is free text. No official list of MCJROTC regions was found this session, so none was invented.

### Office holders (checked 12 Nov 2026)

| Office | Result | Source |
| --- | --- | --- |
| President, Vice President | Donald J. Trump, JD Vance | whitehouse.gov/administration |
| Secretary of the Navy | Hung Cao, still **Acting** (since 22 Apr 2026). Not shown as confirmed. | marines.mil/The-Corps/Leaders |
| Commandant | Gen Eric M. Smith | same |
| Assistant Commandant | Gen Bradford J. Gering | same |
| Sergeant Major of the Marine Corps | SgtMaj Carlos A. Ruiz, still in post | same |
| Director, MCJROTC | Col Robert G. Oltman, USMC (Ret) | mcjrotc.marines.mil home page |
| Secretary of Defense | **Not verified.** The official site blocked automated reading and the biography index did not show the office on its first page. Stored with no name. | |
| Region 1 Director | **Left blank** as instructed. | |

Not checked because they are outside the Marine Corps track: Army Secretary, Army Chief of Staff, MCPON, Chief of Space Operations, AFJROTC and SFJROTC cadet ranks.

### Not verified or not working

- **Service worker and offline use were not confirmed.** The preview pane used for testing refused to register a service worker. The build generates one (15 files precached). Test in Chrome and Safari on a phone, and run Lighthouse there.
- The Gemini call in `scripts/check-officials.mjs` has never been run against the live API.
- The GitHub workflows have never run; there is no remote yet.
- No screen reader pass yet. Labels, roles and focus outlines are in place; tap targets were measured at 44px or more.
- No dark mode.

### Phase 1 work not started

Study Guide with PDF export and Test Yourself; Rank Rush, Seniority Ladder, Rack Builder, Chain Builder, Inspector's Eye, Mock Promotion Board; custom training builder; metronome and call-the-command quiz; optional location suggestion for region; unit overrides.

### Questions for the owner

1. **App name.** "Ready Seats" turned up no app of that name in a web search (closest: "Ready Seat Eat", a restaurant app). A web search is not a trademark search. Check the App Store, Google Play and USPTO before committing. "Drill Card" was rejected because an app called DrillCard exists.
2. **Which handbook does your unit use?** If your SMI has a newer edition than the 2007 file on marines.mil, the facts should be re-based on it.
3. **Terms section 9 (Fees)** says the app is free and also describes subscriptions and renewals. Keep both, or cut the subscription sentences until there is something to buy?
4. **Mailing address** for the Terms is a marked placeholder. A P.O. box works if you do not want a home address published.
5. **Under 13.** The Terms set the minimum age at 13, but some cadets are eighth graders under 13. The app collects nothing, which is the simplest COPPA position, but the Terms and the audience do not match. Decide which gives.
6. **Hosting.** GitHub Pages is assumed. The Privacy Policy says the host sees IP addresses like any website; name the host there once chosen.
7. **Ribbon and insignia art** needs official color and dimension specifications. Does your instructor have the MCJROTC awards reference, or should the Ribbons tab stay text-only for now?
8. **Secretary of Defense and Region Director:** ask your SMI, or confirm from an official page, and they can be added with a source.
