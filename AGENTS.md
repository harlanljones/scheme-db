# AGENTS.md

NFL Scheme Visualizer: an interactive workstation that animates NFL offensive and defensive schemes
on an SVG field with a scrub timeline, and pairs each play with timeline-anchored analysis of
*why* it works. The platform covers 25 scheme families (15 offensive, 10 defensive), 100 plays, 7 coaching trees, and 25 coach profiles.

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
- **25 Scheme Systems (100 Plays)**: 15 Offensive systems (Shanahan Wide Zone, Kubiak Split Zone, Reid Spread-RPO, McVay Duo, McDaniel Speed Motion, Stefanski Multi-TE Gap, Steichen QB Mesh RPO, LaFleur Illusion, Sirianni Power RPO, Johnson Counter Deception, Payton Quick Game & Screens, Roman Power Read & QB Run, O'Connell Boot & Dagger, Coen Wide-Zone RPO, Kelly Tempo Spread) and 10 Defensive systems (Saleh 4-3 Wide-9, Macdonald Sim-Pressure, Flores Psycho Blitz, Fangio Two-High Shell, Minter Amoeba Creeper, Ryans Wide-9 Attack, Shula Match Quarters, Spagnuolo Exotic Blitz, Quinn Cover 3 Press, Bowles Creeper Blitz).
- **7 Coaching Lineage Trees (25 Coaches)**: Bill Walsh, Mike Shanahan, Gary Kubiak, Kyle Shanahan, Sean McVay, Klint Kubiak, Kevin Stefanski, Andy Reid, John Harbaugh, Shane Steichen, Nick Sirianni, Mike Macdonald, Jesse Minter, Vic Fangio, Chris Shula, Pete Carroll, Robert Saleh, DeMeco Ryans, Bill Belichick, Brian Flores, Ben Johnson, Steve Spagnuolo, Dan Quinn, Todd Bowles, Sean Payton, Greg Roman, Kevin O'Connell, Liam Coen, Chip Kelly.
- **Interactive Features**: Film Room Visualizer with Catmull-Rom spline path interpolation, 0.0s–1.2s Disguise Mesh Window comparison with Ghost Overlay and Conflict Telemetry, Coaching Tree Graph with Pan/Zoom and Search, Multi-Layout Scheme Catalog (Master Matrix, Split Inspector, Cards), Contextual Football Glossary Hover Tooltips (`GlossaryTooltip`), Coaching Tree Clustering in `PlayPicker`, Read-Key Conflict Defender badging, and full ARIA accessibility (`PlayerMarker`).
- **100% Vitest & TypeScript Passing**: Full 71-test suite passing across engine, validation, lineage, glossary, and accessibility — including the whole-library sweep of all 100 plays.

