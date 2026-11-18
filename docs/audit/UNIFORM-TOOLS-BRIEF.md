# Uniform tools: data contract

App: Cadet Compass (Svelte 5 + TypeScript + Vite, repo root `C:\Users\gagep\JROTC APP`). Marine Corps JROTC first.
The data file `src/data/usmc-uniform.json` drives three tools: a placement guide with measured diagrams, a ribbon rack
builder, and an inspection checklist. Every number must come from a cited source. No guessing.

## Shape of src/data/usmc-uniform.json

```jsonc
{
  "branch": "usmc",
  "checked": "2026-11-18",
  "sources": {                       // short keys used below
    "hb": { "title": "Marine Corps JROTC Cadet Handbook", "url": "https://www.mcjrotc.marines.mil/Portals/209/Docs/Marine%20Corps%20JROTC%20Cadet%20Handbook.pdf", "edition": "Undated; PDF file dated 30 Apr 2007" },
    "mco": { "title": "MCO 1020.34H Marine Corps Uniform Regulations", "url": "...", "edition": "..." }
  },
  "uniforms": [
    {
      "id": "blue-dress-a",           // blue-dress-a|b|c|d, service-a|b|c, utility (only the ones a source covers for cadets)
      "name": "Blue Dress \"A\"",
      "items": [
        {
          "id": "ribbons",             // ribbons | badge | rank-collar | rank-sleeve | nametag | patch | belt | other
          "name": "Ribbons",
          "where": "Centered above the left breast pocket",      // one plain sentence
          "region": "left-pocket",     // left-pocket | right-pocket | collar | sleeve | waist  (picks which outline to draw)
          "measures": [
            { "label": "Above the pocket", "in": 0.125, "from": "top edge of the pocket flap", "src": "hb", "loc": "p. 14" }
            // "in": a number in inches, or null when the rule is not a distance (then give "text")
          ],
          "notes": ["Only one marksmanship badge is worn."],
          "confidence": "high"       // high (read in the source) | verify (sources disagree or not found)
        }
      ]
    }
  ],
  "rack": {                          // ribbon rack rules
    "perRow": 3, "topRow": "centered", // how a short top row sits: centered | left | right, per source
    "gapAbovePocket_in": 0.125, "gapAboveBadge_in": 0.125, "rowGap_in": 0,
    "ribbonWidth_in": 1.375, "ribbonHeight_in": 0.375,   // only if a source gives them; else null
    "devices": [ { "id": "star", "name": "...", "meaning": "...", "max": 4, "src": "hb", "loc": "p. 15" } ],
    "src": "hb", "loc": "pp. 14-16"
  },
  "checklist": [                     // inspection checklist, one line each
    { "id": "gig-line", "text": "Shirt edge, belt buckle and trouser fly in one straight line", "uniforms": ["*"], "src": "hb", "loc": "p. 13" }
  ]
}
```

Rules: MCJROTC sources win over active-duty ones where they differ (cadets follow the cadet handbook and their SMI).
If a cadet-specific rule is missing, use MCO 1020.34H and say so in `notes`. Mark `confidence: "verify"` rather than guess.
Ribbon precedence already exists in `content/usmc/ribbons.json` (facts with group "ribbon" and `order`); the rack builder
reads names and order from there, so do not repeat them here.
