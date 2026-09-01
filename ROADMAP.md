# NFL Scheme Visualizer — Technical Roadmap

Audience for this document: **coding agents and contributors implementing the project.**
It is the single source of truth for architecture and build order. `AGENTS.md` in the repo
root is a short pointer here — if the two ever disagree, this file wins; fix `AGENTS.md`.

Read this whole document before writing code. Work phases in order (see **Build Sequence**);
do not skip ahead — later phases assume earlier ones' acceptance criteria are met.

---

## 1. Context

There is no tool that shows *why* an NFL scheme works — existing resources are either static
chalkboard art (shows structure, hides sequencing) or All-22 film (shows everything, explains
nothing). Kyle Shanahan's offense is built on **sequencing**: outside zone, the play-action shot
off it, the naked bootleg off that, and motion variants that recycle the same picture. The whole
point is that four different plays look identical for the first ~1.2 seconds. A static diagram
cannot express that; an animation with a scrub timeline can.

v1 builds the app from scratch and delivers one complete, deep scheme family: Kyle Shanahan's
wide zone run and its three constraint plays. Defensive schemes and other coaches come later —
the data model is designed so they slot in without restructuring.

**Decisions already made (do not revisit without user approval):**
- Runtime/package manager: **Bun**. Bundler/dev server: **Vite 8 with the Rolldown engine**.
- React + TypeScript, SVG field rendering.
- Animated playback with a scrub timeline (not static diagrams).
- Audience: serious fan / film-study learner — assumes positions and basic coverages are known;
  do not write beginner glossary copy.
- v1 content: outside zone + its three constraint plays (play-action, naked, jet motion).
- Player movement is hand-authored waypoint data. No in-app path editor in v1.
- Analysis has both timeline-anchored beats *and* a standing summary card per play.

---

## 2. Tech Stack

| Concern | Choice | Notes for implementers |
|---|---|---|
| Runtime / package manager | **Bun** (latest) | Use `bun install`, `bun add`, `bun run <script>`, `bun test` is **not** used for app tests — Vitest is, see below. Do not use `npm`/`yarn`/`pnpm` anywhere in this repo. |
| Bundler / dev server | **Vite 8**, Rolldown engine (the default build in Vite 8 — no separate opt-in package needed) | `bun run dev` / `bun run build` invoke Vite. Scaffold with `bun create vite@latest . --template react-ts` (see Phase 1). |
| UI framework | **React**, latest stable (19.x line as of writing) | Function components + hooks only. No class components. |
| Language | **TypeScript**, latest stable, `strict: true` | Play data leans on the type system to catch authoring mistakes — do not weaken strictness. |
| Test runner | **Vitest**, latest | Co-locate tests as `*.test.ts` next to the source file, or under `src/engine/__tests__/`. |
| SVG handling | `vite-plugin-svgr` if importing hand-drawn SVG icons as components; the field/markers/trails themselves are **generated SVG from React**, not imported art | Do not hand-draw the field in an external SVG editor — it's coordinate-driven, see §3.1. |
| Styling | Plain CSS Modules (`*.module.css`) | No CSS-in-JS runtime, no Tailwind for v1 — keep the dependency surface small until Phase 6 (visual pass) decides otherwise. |
| Linting/formatting | Whatever ships with the Vite `react-ts` template; do not add ESLint config complexity beyond the template defaults in v1 | |

**Package version policy:** always install the current latest of every package
(`bun add <pkg>` with no version pin, or `bun add <pkg>@latest`). Do not copy version numbers
out of this document as pins — none are specified above on purpose. Before starting Phase 1,
confirm current major versions with `bun outdated` / the npm registry if unsure whether a Vite 8
API in this doc still matches upstream.

**Explicitly not used:** npm/yarn/pnpm, webpack, Redux/Zustand/any global state library (React
state is sufficient at this scope), any charting library (the field is bespoke SVG, not a
chart), a CSS framework (deferred to Phase 6 decision).

---

## 3. Architecture

Three layers, each independently testable. Data flows one direction: `data` → `engine` → `UI`.
Nothing in `engine` imports from `components`; nothing in `data` imports from `engine` except
the type definitions.

```
src/
  engine/          pure functions, no React, no DOM — all tests live here
    types.ts
    interpolate.ts
    playback.ts
    beats.ts
    validate.ts
    __tests__/
  data/            hand-authored content
    formations.ts
    schemes/
      shanahan/
        outside-zone.ts
        play-action-over.ts
        naked-bootleg.ts
        jet-motion-oz.ts
        index.ts       // exports the play array + family metadata
  components/      presentation only, driven by engine output
    Field.tsx
    PlayerMarker.tsx
    Trail.tsx
    PlayCanvas.tsx
    Timeline.tsx
    AnalysisPanel.tsx
    SequenceMap.tsx
    PlayPicker.tsx
  App.tsx
  main.tsx
```

### 3.1 Coordinate system

Yards, field-relative — **never pixels** in data or engine code:
- `x`: `0 … 53.33` across the field (left sideline → right sideline).
- `y`: yards relative to the line of scrimmage. Negative = offensive backfield, positive =
  downfield.
- SVG `viewBox` spans roughly `x: -2 … 55.33`, `y: -15 … 30`. Apply a transform that flips `y`
  so downfield renders upward on screen (SVG's native `y` grows downward).
- Pixel conversion happens **only** inside `Field.tsx` / `PlayCanvas.tsx`. If you find yourself
  writing a pixel number anywhere in `src/engine/` or `src/data/`, stop — that's a bug.

### 3.2 Data model — `src/engine/types.ts`

This is the contract every other file in the project depends on. Write it first, completely,
before anything else.

```ts
export type Side = 'offense' | 'defense';

export interface Waypoint {
  t: number;          // seconds from snap; t=0 is the snap
  x: number;           // yards across field, 0..53.33
  y: number;           // yards relative to LOS
  note?: string;       // author-facing comment, e.g. "reach step"
}

export interface PlayerTrack {
  id: string;                 // 'LT', 'Z', 'F', 'MIKE', 'FS' — unique within the play
  label: string;               // short text rendered inside the marker, e.g. 'Z'
  side: Side;
  role: 'ol' | 'qb' | 'rb' | 'te' | 'wr' | 'dl' | 'lb' | 'db';
  waypoints: Waypoint[];      // sorted ascending by t; first waypoint MUST have t === 0
  trail: 'route' | 'block' | 'carry' | 'drop' | 'none';
  assignment?: string;        // "reach the 3-tech", "sell the seam, break flat"
}

export interface Beat {
  t: number;                  // when this moment happens, seconds from snap
  title: string;               // "The Mike commits"
  text: string;                // 1-3 sentences of analysis
  focus?: string[];            // PlayerTrack ids to highlight while this beat is active
}

export interface PlaySummary {
  motive: string;               // what the play is trying to accomplish
  keyDefender: string;          // the player the play is designed to put in conflict
  whyItWorks: string;
  failureMode: string;          // how a defense takes it away
}

export interface Play {
  id: string;                   // unique across the whole library, kebab-case
  name: string;                 // display name, e.g. "Outside Zone Left"
  coach: /* union of 45 coach keys — see types.ts */ 'shanahan';
  family: string;                // 'wide-zone'
  personnel: string;             // '21', '11'
  formation: string;              // 'Offset I, Wing Right'
  situation: string;              // '1st & 10, +40, base down'
  coverage: string;               // defense's coverage call, e.g. 'Cover 3 Sky'
  frontName: string;              // 'Over front'
  duration: number;               // total seconds of animation
  offense: PlayerTrack[];        // exactly 11
  defense: PlayerTrack[];        // exactly 11
  beats: Beat[];                  // sorted ascending by t
  summary: PlaySummary;
  sequence: {
    setsUp: string[];             // Play ids this call sets up later in a game plan
    playsOff: string[];           // Play ids whose picture this play borrows/mimics
    tell: string;                 // the ONE visual cue that separates this play from what it mimics
  };
}

export type SchemeEra = 'past-nfl' | 'past-college' | 'current-college' | 'modern-nfl';

export interface SchemeFamily {
  id: string;
  name: string;
  coach: string;                  // display name, e.g. "Kyle Shanahan"
  coachId?: string;               // COACH_PROFILES key, e.g. 'kyle-shanahan'
  team: string;
  category?: 'offense' | 'defense';
  treeBranch?: CoachingTreeBranch; // one of the 17 lineage branches
  era?: SchemeEra;                 // required for all historical/college expansion families
  description: string;
  plays: Play[];
}
```

**Authoring format:** every play is a `.ts` module whose default (or named) export is typed as
`Play`, never raw `.json`. This is a hard requirement, not a preference — the compiler catching
a typo'd player id or a missing field at author time is the main defense against silently wrong
hand-authored coordinate data. Inline `//` comments next to a waypoint recording intent (e.g.
`// reach step, playside foot`) are encouraged.

### 3.3 Engine functions

Implement these in Phase 2, with Vitest coverage before any UI consumes them.

**`src/engine/interpolate.ts`**
- `positionAt(track: PlayerTrack, t: number): { x: number; y: number }`
  Finds the bracketing waypoint pair for `t` and interpolates between them. Clamp: for `t`
  before the first waypoint, return the first waypoint's position; for `t` after the last,
  return the last waypoint's position.
- `sampleTrack(track: PlayerTrack, from: number, to: number, steps: number): { x: number; y: number }[]`
  Samples the path between two times for trail drawing.
- **Use Catmull-Rom spline interpolation through the waypoints, not linear segments.** 4-6
  hand-authored points should produce a believable curved route. Straight-line polylines look
  robotic and would force authoring 15-20 points per player to fake a curve — reject that
  approach. A minimal centripetal Catmull-Rom (4-point window, clamped at the path ends by
  duplicating the endpoint) is sufficient; no external spline library needed.

**`src/engine/playback.ts`**
- `usePlayback(duration: number)` — a React hook wrapping a `requestAnimationFrame` loop that
  tracks elapsed seconds since play started, scaled by the current speed.
  Returns `{ t, playing, play, pause, toggle, seek(t), speed, setSpeed, reset }`.
  Speed options: `0.25`, `0.5`, `1`. Auto-pause when `t` reaches `duration`.
  This is the one place `requestAnimationFrame`/DOM timing logic lives — keep it out of
  components.

**`src/engine/beats.ts`**
- `activeBeatIndex(beats: Beat[], t: number): number` — index of the last beat whose `t <= t`
  (i.e., the most recent beat that has "happened" at the current scrub position). Returns `-1`
  if `t` is before the first beat.
- `isFocused(beat: Beat | undefined, playerId: string): boolean` — whether `playerId` is in the
  active beat's `focus` list; drives highlight/dim rendering on markers.

**`src/engine/validate.ts`**
- `validatePlay(play: Play): string[]` — returns a list of human-readable problem strings
  (empty array = valid). Check, at minimum:
  - `offense.length === 11` and `defense.length === 11`
  - no duplicate `PlayerTrack.id` within a play (across both sides)
  - each track's `waypoints` sorted ascending by `t`, and `waypoints[0].t === 0`
  - no waypoint `t` exceeds `play.duration`
  - no `Beat.t` exceeds `play.duration`; `beats` sorted ascending by `t`
  - every id in `Beat.focus` exists as a `PlayerTrack.id` in the play
  - every id in `sequence.setsUp` / `sequence.playsOff` refers to a play id that exists
    somewhere in the library (this check needs the full library, not just one play — see
    `validateLibrary` below)
  - every waypoint's `x` is within `[0, 53.33]` (flag, don't hard-fail, positions slightly off
    the numbered field are sometimes intentional for a receiver stacked near the sideline —
    use judgement in the message wording, e.g. `"warn: x=54.1 outside numbered field"`)
- `validateLibrary(plays: Play[]): Record<string, string[]>` — runs `validatePlay` over every
  play plus the cross-play `sequence` reference check; maps play id → problems.
  **This is the highest-value test in the project.** Hand-authored coordinate data is exactly
  where silent errors hide, and this is the only thing that catches them before a screenshot
  does.

### 3.4 Components

| File | Responsibility |
|---|---|
| `Field.tsx` | SVG field: turf, yard lines every 5 yards, yard numbers, hash marks, LOS marker, first-down marker. Pure presentation — receives no play data, only which yard line is the LOS. |
| `PlayerMarker.tsx` | One player at a given `(x, y)`: circle (offense) vs. square-ish marker (defense), `label` text inside, focus/dim visual state driven by `isFocused`. |
| `Trail.tsx` | The path traveled up to the current `t`, styled by `PlayerTrack.trail`: `route` = solid line with arrowhead, `block` = line ending in a T-bar, `carry` = thick line, `drop` = dashed, `none` = nothing rendered. |
| `PlayCanvas.tsx` | Composes `Field` + one `PlayerMarker` and `Trail` per track, for a given `(play, t)`. Converts yard coordinates to SVG pixel space here (see §3.1). |
| `Timeline.tsx` | Scrubber input with tick marks at each `Beat.t`, play/pause button, speed selector (0.25/0.5/1×), current time readout, frame-step buttons. |
| `AnalysisPanel.tsx` | Standing `PlaySummary` card (motive / key defender / why it works / failure mode) plus the beat list below it. The currently active beat (via `activeBeatIndex`) is visually highlighted; clicking any beat calls `seek(beat.t)`. |
| `SequenceMap.tsx` | The scheme's concept web: outside zone at the center node, constraint plays radiating out as connected nodes, edges labeled with each play's `sequence.tell`. Clicking a node selects that play. This view is what makes the "illusion of complexity" argument legible at a glance — treat it as a first-class deliverable, not a nice-to-have. |
| `PlayPicker.tsx` | List of plays in the currently loaded family; highlights the selected play. |
| `App.tsx` | Holds `selectedPlayId` state, wires `usePlayback` output into `PlayCanvas`, `Timeline`, and `AnalysisPanel`. |

**Layout:** field canvas dominant on the left, `AnalysisPanel` on the right, `Timeline` beneath
the field, `SequenceMap` reachable via a tab next to `PlayPicker`. No router in v1 — a single
`useState<string>` for the selected play id is sufficient. Add routing only when a second coach
is added to the library (out of scope here).

### 3.5 v1 play library — `src/data/schemes/shanahan/`

Each file exports one `Play`. The four together *are* the argument the tool is making — author
them so the first ~1.2 seconds of offensive-line and running-back movement in plays 1-3 are
visually identical when scrubbed:

1. **`outside-zone.ts`** — 21 personnel, offset I, wing right. Outside zone run, playside left.
   The base call. Beats: the reach steps, the running back's aiming point and three-way read
   (bounce / bang / bend), the backside cut. Key defender: the playside flow linebacker.
2. **`play-action-over.ts`** — identical formation and identical first ~1.2s of OL/RB movement
   as `outside-zone`, but the offensive line sells the zone step while the backside receiver
   runs a deep over route behind the linebackers who bit on run flow. Key defender: the same
   flow linebacker from play 1, now in conflict between run fit and pass drop.
3. **`naked-bootleg.ts`** — full outside-zone fake, quarterback pulls the ball and rolls
   opposite the run flow, working a drag / flat / deep-comeback triangle read. Key defender:
   the backside defensive end (contain) and the flat defender.
4. **`jet-motion-oz.ts`** — pre-snap jet motion across the formation with outside zone run
   either with or away from the motion, forcing the defense to declare its run fit and adjust
   numbers before the snap. Key defender: the overhang/nickel defender.

Each play's `sequence.tell` names the single visual cue that distinguishes it from the play(s)
it mimics (e.g., `"the backside tackle sets to pass-block instead of reaching downfield"`).
`SequenceMap` renders these strings on the edges between nodes.

Shared starting alignments (offset I, gun trips, etc.) live in `src/data/formations.ts` as named
constants, so each play file builds from a named alignment rather than 11 sets of magic-number
coordinates repeated across files. The historical/college expansion families instead define a
**local `ALIGN` const at the top of each play file** (same shape as the `formations.ts` entries)
and reference it at every track's `t = 0` waypoint — both patterns are acceptable; prefer shared
`formations.ts` constants when multiple plays genuinely share an alignment.

---

## 4. Build Sequence & Implementation Status

All primary phases have been implemented and verified:

### Phase 0 — Docs ✅ (Completed)
`ROADMAP.md`, `DESIGN.md`, `PRODUCT.md`, and `AGENTS.md` established.

### Phase 1 — Scaffold ✅ (Completed)
- Bun + Vite 8 (Rolldown) scaffold.
- Complete data model contracts in `src/engine/types.ts`.
- SVG coordinate-to-field rendering in `Field.tsx`.

### Phase 2 — Engine + Unit Tests ✅ (Completed)
- `interpolate.ts`: Catmull-Rom spline interpolation and track sampling.
- `beats.ts`: Sub-second active beat lookup and focus identification.
- `validate.ts`: Invariant checking (`validatePlay`, `validateLibrary`).
- 100% test coverage in `src/engine/__tests__/`.

### Phase 3 — Playback & Core Visualizer ✅ (Completed)
- `playback.ts`: `usePlayback` animation clock hook.
- `Timeline.tsx`, `Trail.tsx`, `PlayerMarker.tsx`, `PlayCanvas.tsx`.
- First Shanahan wide zone play set wired and verified.

### Phase 4 — Analysis Console ✅ (Completed)
- `AnalysisPanel.tsx`: Live Beat Spotlight, 4-Dimension Scheme Breakdown, Blueprint, and Multi-Pane view.
- Real-time player focus highlights and key conflict read indicators.

### Phase 5 — Full Shanahan Sequence & 0.0s–1.2s Mesh Map ✅ (Completed)
- Full 4-play Shanahan wide zone family authored and verified (`outside-zone`, `play-action-over`, `naked-bootleg`, `jet-motion-oz`).
- `SequenceMap.tsx`: 0.0s–1.2s disguise mesh window analyzer, ghost overlays, and conflict telemetry HUD.

### Phase 6 — Expansion: 20-System Catalog (10 Offense, 10 Defense • 80 Plays) & Coaching Trees ✅ (Completed)
- **20 Scheme Families (80 Plays)** authored and validated across offense and defense (4 plays each):
  - ⚡ Kyle Shanahan — Wide Zone & Play-Action Family (4 plays)
  - ⚡ Klint Kubiak — Split-Zone & Y-Leak Family (4 plays)
  - ⚡ Andy Reid — West Coast Spread-RPO & Mesh Family (4 plays)
  - ⚡ Sean McVay — Condensed Duo & Play-Action Attack (4 plays)
  - ⚡ Mike McDaniel — Speed Cheat-Motion & Space Attack (4 plays)
  - ⚡ Kevin Stefanski — Multi-TE Gap & Under-Center Play-Action (4 plays)
  - ⚡ Shane Steichen — QB Mesh & Spread RPO System (4 plays)
  - ⚡ Matt LaFleur — Illusion of Complexity & Deep Shot Family (4 plays)
  - ⚡ Nick Sirianni — Power RPO & Brotherly Shove System (4 plays)
  - ⚡ Ben Johnson — Counter Deception & Gadget Offense (4 plays)
  - 🛡 Robert Saleh — 4-3 Wide-9 & Cover 3 Match Family (4 plays)
  - 🛡 Mike Macdonald — Hybrid Sim-Pressure & Creepers Family (4 plays)
  - 🛡 Brian Flores — Psycho Front & Cover 0 Blitz Family (4 plays)
  - 🛡 Vic Fangio — Two-High Shell & Quarters Family (4 plays)
  - 🛡 Jesse Minter — Amoeba Front & Simulated Creepers (4 plays)
  - 🛡 DeMeco Ryans — Wide-9 Attack & Match Coverage (4 plays)
  - 🛡 Chris Shula — Match Quarters & Penny Front Shell (4 plays)
  - 🛡 Steve Spagnuolo — Exotic Blitz & Sim Pressures (4 plays)
  - 🛡 Dan Quinn — Cover 3 Press-Bail & Under Front (4 plays)
  - 🛡 Todd Bowles — Creeper Blitz & Psycho Front (4 plays)
- **6 Coaching Lineage Trees (20 Coach Profiles)**:
  - `shanahan-kubiak`, `reid-west-coast`, `carroll-saleh-wide9`, `macdonald-pressure`, `fangio-two-high`, `belichick-flores`.
- **CoachingTreeGraph.tsx**: Pan/zoom interactive tree explorer with coach detail modals.
- **SchemeFamiliesDirectory.tsx**: High-density Master Matrix, Split Inspector, and Detailed Cards.
- **Contextual Football Glossary & Accessibility**: `glossary.ts` tactical lookup dictionary, `GlossaryTooltip.tsx` hover popovers, and full ARIA accessibility across `PlayerMarker.tsx` and cluster grouping in `PlayPicker.tsx`.
- **Whole-Library Test Suite**: `validateLibrary` passes 80/80 plays with 0 errors across 71 Vitest test cases.

### Phase 7 — Expansion II: 25-System Catalog (15 Offense, 10 Defense • 100 Plays) ✅ (Completed)
Five new offensive scheme families authored via 5 parallel agents, each owning exactly one
`src/data/schemes/<coach>/` directory (shared files edited only in the serial phases):
  - ⚡ Sean Payton — Quick Game & Screen Package (4 plays) — `payton-quick-game-screens`
  - ⚡ Greg Roman — Power Read & QB Run Attack (4 plays) — `roman-power-read`
  - ⚡ Kevin O'Connell — Boot & Dagger Play-Action System (4 plays) — `oconnell-boot-dagger`
  - ⚡ Liam Coen — Hybrid Wide-Zone RPO System (4 plays) — `coen-wide-zone-rpo`
  - ⚡ Chip Kelly — Tempo Spread & Air Raid System (4 plays) — `kelly-tempo-spread`
- Supporting changes: coach union extended (`payton|roman|oconnell|coen|kelly`), 5 new
  `CoachProfile`s + new `power-gap-duo` coaching tree (7 trees / 25 coaches now), 5 new shared
  formation constants in `formations.ts`, `power-gap-duo` cluster in `PlayPicker`.
- Whole-library validation now sweeps **100/100 plays**; test counts updated
  (`validate.test.ts`, `playpicker-playermarker.test.ts`) and public LLM assets regenerated.

### Phase 9 — Coverage-Variant Switcher ✅ (Completed)

The core extension beyond content: every offensive concept can be re-called against
several defensive cover calls, exposing *why* it attacks one cover and not another.

- **`src/engine/coverage.ts`** — pure, deterministic coverage engine. Exposes
  `CoverageScheme` + `COVERAGE_SCHEMES` (Cover 0, Cover 1, Cover 2, Tampa 2, Cover 3,
  Cover 4, Cover 6) and `buildCoverageVariant(play, schemeId)`: derives a fresh 11-player
  defense from the offence's real alignment and route structure while leaving the offence,
  beats, summary, duration and sequence untouched. The defence's front keeps its authored
  rush path; the box re-schemes (blitz / spy / sink, including the Tampa 2 deep-Mike); the
  secondary re-shells per coverage (man-press / man-free / 2-high / single-high / quarters /
  split-field) and the corners and slot mirror the receivers they own.
- **`src/components/CoverageSwitcher.tsx`** — ARIA-accessible coverage-call switcher wired
  into the Film Room. The authored Cover 3 reality is the default; selecting any other call
  swaps the derived defense. `supportsCoverageVariant` gates it to real secondary units.
- **Derived invariant enforcement** — `validateCoverageDefense` reuses `validatePlay`.
- **Verification** — the whole library sweep builds 1253 coverage variants across 179
  offensive plays with 0 validation errors; the suite grew to 80 tests.

### Phase 10 — Dual-Play Comparison Scrubber ✅ (Completed)

The generalisation of the Sequence-Matrix disguise idea: scrub any two plays side by side on
one synchronized timeline to study how a base concept and its constraint counterpart mirror
each other across the disguise window.

- **`src/components/PlayComparison.tsx`** — two independent play selectors (scheme family +
  concept each, with a ⇄ swap), two `PlayCanvas` renders locked to a single `usePlayback`
  clock, and one shared `Timeline`. The default Play B is the selected play's
  `sequence.playsOff` constraint (the picture it borrows) so the disguise comparison is the
  default, not a setup chore. New `compare` tab + `[5]` keyboard shortcut; the host App's
  keyboard handler is guarded so the comparison view owns its own playback keys.
- **Ghost overlay toggle** — a `Ghost Overlay` switch (on by default) renders the *other*
  play over each canvas as a translucent slate ghost (full route paths + hollow player
  tokens) at the same scrub time, so the disguise window reads visually. `PlayCanvas` gained
  an optional `ghostPlay` prop; the comparison view passes each play the other as its ghost.
- **`src/engine/beats.ts`** — `mergeBeats` / `mergeComparisonBeats`: merges two plays' key-beat
  rails into one sorted, de-duplicated timeline so both sides' key moments appear on one
  scrub cursor.
- **Verification** — whole-library config unchanged; 3 new unit tests (merge/sort/dedupe)
  bring the suite to 83 tests.

### Phase 8 — Expansion III: Historical NFL & Current College (45 Systems • 180 Plays) ✅ (Completed)

Twenty new scheme families authored via parallel agents, researched against web sources for
historical accuracy. Each family owns one `src/data/schemes/<dir>/` directory (4 plays + index).

**Offense (10 families / 40 plays):**
- ⚡ Don Coryell — Air Coryell Vertical Passing — `coryell-vertical` (`past-nfl`)
- ⚡ Bill Walsh — Classic West Coast Offense — `walsh-classic-wco` (`past-nfl`)
- ⚡ June Jones — Run and Shoot — `run-and-shoot` (`past-nfl`)
- ⚡ Paul Johnson — Flexbone Triple Option — `flexbone-triple-option` (`current-college`)
- ⚡ Mike Leach — Air Raid — `air-raid` (`current-college`)
- ⚡ Tubby Raymond — Delaware Wing-T — `delaware-wing-t` (`past-college`)
- ⚡ Vince Lombardi — T-Formation Power Sweep — `t-formation-power-sweep` (`past-nfl`)
- ⚡ Chris Ault — Pistol Read-Option — `pistol-read-option` (`past-college`)
- ⚡ Art Briles — Baylor Vertical Choice Spread — `baylor-choice` (`past-college`)
- ⚡ Urban Meyer — Spread-Option — `meyer-spread-option` (`past-college`)

**Defense (10 families / 40 plays):**
- 🛡 Buddy Ryan — 46 Defense — `buddy-46-defense` (`past-nfl`)
- 🛡 Dick LeBeau — Fire Zone Zone Blitz — `lebeau-fire-zone` (`past-nfl`)
- 🛡 Tony Dungy — Tampa 2 — `tampa-2` (`past-nfl`)
- 🛡 Tom Landry — Flex Defense — `landry-flex` (`past-nfl`)
- 🛡 Bum Phillips — Two-Gap 3-4 — `phillips-two-gap-34` (`past-nfl`)
- 🛡 Jimmy Johnson — Speed 4-3 — `jj-speed-43` (`past-nfl`)
- 🛡 Bill Belichick — Okie/Bear Package — `belichick-okie-bear` (`modern-nfl`)
- 🛡 Dave Aranda — Tite Front / Peso — `aranda-tite-peso` (`current-college`)
- 🛡 Rocky Long — 3-3-5 Stack — `rlong-335-stack` (`current-college`)
- 🛡 Marvin Lewis — Cover 2 Man-Under — `cover2-man-under` (`past-nfl`)

**Supporting changes:**
- Data model: coach union extended by 19 keys; `SchemeEra` type + `SchemeFamily.era` added
  (**data-only** — no UI filtering wired); `CoachingTreeBranch` union grown from 7 to 17.
- Coaches: 21 new `CoachProfile`s and 9 new coaching trees (17 trees / 53 coaches now);
  Vince Lombardi grafted into `power-gap-duo`; Walsh classic WCO attached to his existing
  `shanahan-kubiak` branch via `walsh-classic-wco`.
- Components: 10 new `TREE_CLUSTERS` entries in `PlayPicker.tsx` covering every new branch
  (cluster fallback removed — all 45 families resolve to a named cluster).
- Whole-library validation now sweeps **180/180 plays** with zero errors; test counts updated
  (72 tests) plus a new era-tag test asserting exactly 20 era-tagged families.

---

## 5. Verification Checklist

- `bun run test` — All 72 engine unit tests, coach lineage tests, glossary lookup tests, accessibility/clustering tests, era-tag tests, and whole-library validation tests passing.
- `bun run build && bunx tsc --noEmit` — Type-clean build with zero errors.
- Visual acceptance: The 0.0s–1.2s backfield mesh in base vs constraint plays is visually indistinguishable before the breakout point.

---

## 6. Future Expansion Horizons (v2+)

- In-app interactive route & block path authoring canvas.
- Real-time NextGenStats telemetry coordinate ingestion.
- Coverage-variant switcher driven by authored breakdown copy (the current v1 derives the
  defense from alignment/route geometry; a future pass adds per-coverage hand-authored
  analysis of *why* the concept wins against that specific call).

