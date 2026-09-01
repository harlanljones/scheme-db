# AGENTS.md

NFL Scheme Visualizer: an interactive workstation that animates NFL offensive and defensive schemes
on an SVG field with a scrub timeline, and pairs each play with timeline-anchored analysis of
*why* it works. The platform covers 45 scheme families (25 offensive, 20 defensive — spanning modern NFL, historical NFL, and college football), 180 plays, 17 coaching trees, and 53 coach profiles.

**Read `ROADMAP.md` before implementing anything.** It has the full tech stack, data model,
engine function signatures, component breakdown, play library spec, and phased build sequence
with per-phase acceptance criteria. This file is orientation only — don't duplicate ROADMAP
content here or let the two drift; if they ever disagree, `ROADMAP.md` wins and this file should
be fixed to match.

## Tooling — read carefully, this project's toolchain is not npm/webpack

- **Runtime & package manager: Bun.** Use `bun install`, `bun add <pkg>`, `bun run <script>`.
  Never use `npm`, `yarn`, or `pnpm` in this repo — no `package-lock.json` or `yarn.lock` should
  ever appear; only `bun.lock` (or `bun.lockb`).
- **Bundler/dev server: Vite 8 with the Rolldown engine** (Vite 8's default build — no separate
  package to opt in). Scaffolded via `bun create vite@latest . --template react-ts`.
  `bun run dev` / `bun run build` invoke it.
- **Test runner: Vitest**, run via `bun run test` (or `bunx vitest`) — not `bun test`, which is
  Bun's own unrelated built-in test runner and is not used for this project's tests.
- **Always install the latest version of every package.** Use `bun add <pkg>` (or
  `bun add <pkg>@latest`) with no version pinning when adding a new dependency. Do not copy
  version numbers from other projects, memory, or older docs — check the registry/`bun outdated`
  if unsure. This applies to React, TypeScript, Vitest, and every other dependency.

See `ROADMAP.md` §2 (Tech Stack) for the full rationale and what's deliberately excluded
(no Redux/Zustand, no CSS framework in v1, no npm/webpack).

## Repo layout

- `src/engine/` — pure functions only (interpolation, playback clock, beat lookup, validation).
  No React, no DOM. This is where the tests live.
- `src/data/` — hand-authored play data (`.ts` files typed as `Play`), coaching profiles & tree lineages (`COACH_PROFILES`, `COACHING_TREES`), and shared formation constants.
- `src/components/` — presentation only, driven entirely by engine output. No play-specific
  logic lives here.

## Hard conventions

- Field coordinates are **yards, LOS-relative** (`x: 0…53.33`, `y` negative = backfield,
  positive = downfield) — never raw pixels. Conversion to screen space happens only inside
  `Field`/`PlayCanvas`.
- Play data is authored as **`.ts` modules typed as `Play`**, never raw `.json` — the compiler
  should catch a missing field or typo'd player id.
- The engine (`src/engine/`) must not import React or touch the DOM.
- Every play must pass `validatePlay`, and the whole library must pass `validateLibrary`
  (`src/engine/validate.ts`) — run it in a test over the whole library before considering a new
  play done.

## Commands

- `bun run dev` — run the app
- `bun run test` — Vitest (engine unit tests + whole-library validation sweep + coaching trees)
- `bun run build && bunx tsc --noEmit` — production build + type-check (play data leans on the
  type system, so a type error here likely signals an authoring mistake)

## Status

Fully implemented and verified across all phases:
- **45 Scheme Systems (180 Plays)**: 25 Offensive systems — the 15 modern-NFL systems (Shanahan Wide Zone, Kubiak Split Zone, Reid Spread-RPO, McVay Duo, McDaniel Speed Motion, Stefanski Multi-TE Gap, Steichen QB Mesh RPO, LaFleur Illusion, Sirianni Power RPO, Johnson Counter Deception, Payton Quick Game & Screens, Roman Power Read & QB Run, O'Connell Boot & Dagger, Coen Wide-Zone RPO, Kelly Tempo Spread) plus 10 historical/college systems (Air Coryell, Walsh Classic WCO, Run and Shoot, Flexbone Triple Option, Air Raid, Delaware Wing-T, T-Formation Power Sweep, Pistol Read-Option, Baylor Choice, Meyer Spread-Option). 20 Defensive systems — the 10 modern-NFL systems (Saleh 4-3 Wide-9, Macdonald Sim-Pressure, Flores Psycho Blitz, Fangio Two-High Shell, Minter Amoeba Creeper, Ryans Wide-9 Attack, Shula Match Quarters, Spagnuolo Exotic Blitz, Quinn Cover 3 Press, Bowles Creeper Blitz) plus 10 historical/college systems (Buddy Ryan 46, LeBeau Fire Zone, Tampa 2, Landry Flex, Phillips Two-Gap 3-4, Jimmy Johnson Speed 4-3, Belichick Okie/Bear Package, Aranda Tite/Peso, Rocky Long 3-3-5 Stack, Cover 2 Man-Under).
- **17 Coaching Lineage Trees (53 Coaches)**: original 7 trees plus 10 expansion trees (`coryell-vertical`, `air-raid`, `option-spread`, `delaware-wing-t`, `buddy-46`, `lebeau-zone-blitz`, `landry-dallas`, `phillips-two-gap`, `two-deep-shell`, `college-defensive-fronts`) covering Don Coryell, June Jones, Hal Mumme, Mike Leach, Paul Johnson, Urban Meyer, Chris Ault, Art Briles, Tubby Raymond, Vince Lombardi, Buddy Ryan, Dick LeBeau, Dom Capers, Tony Dungy, Lovie Smith, Marvin Lewis, Tom Landry, Jimmy Johnson, Bum Phillips, Dave Aranda, and Rocky Long.
- **Era Metadata**: every expansion family is tagged with a `SchemeEra` (`past-nfl` | `past-college` | `current-college` | `modern-nfl`) on `SchemeFamily.era`; UI filtering is intentionally not wired yet (data-only).
- **Coverage-Variant Switcher**: every offensive concept can now be re-called against any of 7 coverage schemes (Cover 0, 1, 2, Tampa 2, Cover 3, 4, 6). Selecting a scheme derives a fresh 11-player defense from the offence's real alignment/route structure via `src/engine/coverage.ts` (`buildCoverageVariant`), keeping the offence, beats, summary and duration untouched — exposing *why* the concept attacks one cover and not another. The authored defense is the default (Cover 3) baseline.
- **Dual-Play Comparison Scrubber**: scrub any two plays side-by-side on one synchronized timeline (`compare` tab, `[5]`). Each slot picks a scheme family + concept independently, and the shared timeline's key-beat rail is a sorted, de-duplicated merge of both plays (`src/engine/beats.ts`). Play B defaults to the selected play's `sequence.playsOff` constraint so the disguise comparison is the default. A `Ghost Overlay` toggle (on by default) renders the *other* play over each canvas as a translucent ghost at the same scrub time (`PlayCanvas.ghostPlay`).
- **Interactive Features**: Film Room Visualizer with Catmull-Rom spline path interpolation, 0.0s–1.2s Disguise Mesh Window comparison with Ghost Overlay and Conflict Telemetry, Coaching Tree Graph with Pan/Zoom and Search, Multi-Layout Scheme Catalog (Master Matrix, Split Inspector, Cards), Contextual Football Glossary Hover Tooltips (`GlossaryTooltip`), Coaching Tree Clustering in `PlayPicker` (now covering all 17 branches), Read-Key Conflict Defender badging, and full ARIA accessibility (`PlayerMarker`).
- **Vitest & TypeScript**: the suite (engine, validation, lineage, glossary, accessibility, coverage-variant derivation, and comparison-beat merging) passes, including the whole-library sweep of all 180 plays and 1253 generated coverage variants. (`bun run test` currently also surfaces an unrelated, pre-existing `llm-seo` failure caused by an uncommitted `index.html` edit in the working tree — not by the coverage-variant or comparison work.)

