# AGENTS.md

NFL Scheme Visualizer: an interactive workstation that animates NFL offensive and defensive schemes
on an SVG field with a scrub timeline, and pairs each play with timeline-anchored analysis of
*why* it works. The platform covers 45 scheme families (25 offensive, 20 defensive — spanning modern NFL, historical NFL, and college football), 180 plays, 17 coaching trees, and 53 coach profiles.

**Read `CONTRIBUTING.md` and `data/README.md` before implementing anything.** `data/` is the
source of truth: one JSON file per scheme, play, coach, lineage, formation and glossary term,
validated by the Zod schemas in `src/schema/`. Design decisions for the Astro site are in
`docs/redesign/DECISIONS.md`. `ROADMAP.md` is the original build plan for the previous single page
app (the legacy code described below); it is history, not the current plan, and where it disagrees
with the files above they win.

## Tooling — read carefully, this project's toolchain is not npm/webpack

- **Runtime & package manager: Bun.** Use `bun install`, `bun add <pkg>`, `bun run <script>`.
  Never use `npm`, `yarn`, or `pnpm` in this repo — no `package-lock.json` or `yarn.lock` should
  ever appear; only `bun.lock` (or `bun.lockb`).
- **Site: Astro with React islands** (`site/`, config in `astro.config.mjs`), run with Bun.
  `bun run dev` / `bun run build` invoke it; pages read `data/` at build time. Vite still runs
  Vitest, and `bun run dev:legacy` starts the frozen previous app.
- **Test runner: Vitest**, run via `bun run test` (or `bunx vitest`) — not `bun test`, which is
  Bun's own unrelated built-in test runner and is not used for this project's tests.
- **Always install the latest version of every package.** Use `bun add <pkg>` (or
  `bun add <pkg>@latest`) with no version pinning when adding a new dependency. Do not copy
  version numbers from other projects, memory, or older docs — check the registry/`bun outdated`
  if unsure. This applies to React, TypeScript, Vitest, and every other dependency.

No Redux/Zustand, no CSS framework in the legacy app, no npm/webpack.

## Repo layout

- `data/` — **the dataset and the source of truth.** Add and edit plays, coaches, schemes,
  lineages, formations and glossary terms here, as JSON. `bun run data:new` starts a record.
- `src/schema/` — Zod schemas, loader, cross-record validators (`validate-dataset.ts`) and the
  scaffold behind `data:new`. Change a schema, then run `bun run data:schema`.
- `src/engine/` — pure functions only (interpolation, frames, disguise metric, hash marks,
  playback clock, beat lookup, validation). No React, no DOM.
- `src/spec/`, `src/release/`, `scripts/` — the optional play spec compiler, the JSON/CSV/SQLite
  release build, and the command line tools.
- `site/` — the Astro site: pages, components, React islands and `site/lib/data.ts`, which reads
  `data/`. Copy that states a count or says "illustrative" is built from the data, never typed.
- `src/data/`, `src/components/`, `src/App.tsx` — **frozen legacy**: the previous single page app
  and its TypeScript copy of the library. Nothing reads `data/` through them. Do not add or edit
  plays there.

## Hard conventions

- Field coordinates are **yards, LOS-relative** (`x: 0…53.33`, `y` negative = backfield,
  positive = downfield) — never raw pixels. Conversion to screen space happens only inside
  `Field`/`PlayCanvas`.
- Play data is **JSON in `data/`**, parsed against the Zod schemas in `src/schema/schema.ts` and
  checked across records by `src/schema/validate-dataset.ts` (every id resolves, 22 players,
  strictly increasing times, a down at the start of `situation`, a source for anything not
  `illustrative`, no `TODO:` left). Run `bun run data:validate`.
- Tests must not break when a record is added. Assert floors and invariants from the data, never
  an exact count of schemes, plays or coaches.
- The engine (`src/engine/`) must not import React or touch the DOM.

## Commands

- `bun run dev` — run the site
- `bun run data:new <concept|scheme|coach|term>` — start a record; `bun run data:validate` — check `data/`
- `bun run test` — Vitest (engine, schema and validators, site, release build)
- `bun run check` — everything CI runs; run it before opening a pull request

## Status

Everything below this line describes the previous single page app, which is frozen (see Repo
layout). The live site is the Astro site in `site/`.

Fully implemented and verified across all phases:
- **45 Scheme Systems (180 Plays)**: 25 Offensive systems — the 15 modern-NFL systems (Shanahan Wide Zone, Kubiak Split Zone, Reid Spread-RPO, McVay Duo, McDaniel Speed Motion, Stefanski Multi-TE Gap, Steichen QB Mesh RPO, LaFleur Illusion, Sirianni Power RPO, Johnson Counter Deception, Payton Quick Game & Screens, Roman Power Read & QB Run, O'Connell Boot & Dagger, Coen Wide-Zone RPO, Kelly Tempo Spread) plus 10 historical/college systems (Air Coryell, Walsh Classic WCO, Run and Shoot, Flexbone Triple Option, Air Raid, Delaware Wing-T, T-Formation Power Sweep, Pistol Read-Option, Baylor Choice, Meyer Spread-Option). 20 Defensive systems — the 10 modern-NFL systems (Saleh 4-3 Wide-9, Macdonald Sim-Pressure, Flores Psycho Blitz, Fangio Two-High Shell, Minter Amoeba Creeper, Ryans Wide-9 Attack, Shula Match Quarters, Spagnuolo Exotic Blitz, Quinn Cover 3 Press, Bowles Creeper Blitz) plus 10 historical/college systems (Buddy Ryan 46, LeBeau Fire Zone, Tampa 2, Landry Flex, Phillips Two-Gap 3-4, Jimmy Johnson Speed 4-3, Belichick Okie/Bear Package, Aranda Tite/Peso, Rocky Long 3-3-5 Stack, Cover 2 Man-Under).
- **17 Coaching Lineage Trees (53 Coaches)**: original 7 trees plus 10 expansion trees (`coryell-vertical`, `air-raid`, `option-spread`, `delaware-wing-t`, `buddy-46`, `lebeau-zone-blitz`, `landry-dallas`, `phillips-two-gap`, `two-deep-shell`, `college-defensive-fronts`) covering Don Coryell, June Jones, Hal Mumme, Mike Leach, Paul Johnson, Urban Meyer, Chris Ault, Art Briles, Tubby Raymond, Vince Lombardi, Buddy Ryan, Dick LeBeau, Dom Capers, Tony Dungy, Lovie Smith, Marvin Lewis, Tom Landry, Jimmy Johnson, Bum Phillips, Dave Aranda, and Rocky Long.
- **Era Metadata**: every expansion family is tagged with a `SchemeEra` (`past-nfl` | `past-college` | `current-college` | `modern-nfl`) on `SchemeFamily.era`; UI filtering is intentionally not wired yet (data-only).
- **Coverage-Variant Switcher**: every offensive concept can now be re-called against any of 7 coverage schemes (Cover 0, 1, 2, Tampa 2, Cover 3, 4, 6). Selecting a scheme derives a fresh 11-player defense from the offence's real alignment/route structure via `src/engine/coverage.ts` (`buildCoverageVariant`), keeping the offence, beats, summary and duration untouched — exposing *why* the concept attacks one cover and not another. The authored defense is the default (Cover 3) baseline.
- **Dual-Play Comparison Scrubber**: scrub any two plays side-by-side on one synchronized timeline (`compare` tab, `[5]`). Each slot picks a scheme family + concept independently, and the shared timeline's key-beat rail is a sorted, de-duplicated merge of both plays (`src/engine/beats.ts`). Play B defaults to the selected play's `sequence.playsOff` constraint so the disguise comparison is the default. A `Ghost Overlay` toggle (on by default) renders the *other* play over each canvas as a translucent ghost at the same scrub time (`PlayCanvas.ghostPlay`).
- **Interactive Features**: Film Room Visualizer with Catmull-Rom spline path interpolation, 0.0s–1.2s Disguise Mesh Window comparison with Ghost Overlay and Conflict Telemetry, Coaching Tree Graph with Pan/Zoom and Search, Multi-Layout Scheme Catalog (Master Matrix, Split Inspector, Cards), Contextual Football Glossary Hover Tooltips (`GlossaryTooltip`), Coaching Tree Clustering in `PlayPicker` (now covering all 17 branches), Read-Key Conflict Defender badging, and full ARIA accessibility (`PlayerMarker`).
- **Vitest & TypeScript**: the suite (engine, validation, lineage, glossary, accessibility, coverage-variant derivation, and comparison-beat merging) passes, including the whole-library sweep of all 180 plays and 1253 generated coverage variants. (`bun run test` currently also surfaces an unrelated, pre-existing `llm-seo` failure caused by an uncommitted `index.html` edit in the working tree — not by the coverage-variant or comparison work.)

