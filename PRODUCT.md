# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Serious NFL fans, film-study learners, analysts, and coaches who already understand core football concepts (personnel groupings, route concepts, defensive coverages) and want to dissect *why* modern schemes work at an architectural and temporal level.

## Product Purpose
Deconstruct NFL offensive and defensive schemes through interactive playback, coaching tree lineages, and timeline-anchored sequencing analysis—specifically demonstrating how constraint plays mirror base looks during the first ~1.2 seconds to manipulate defensive keys.

## Positioning
Unlike static chalkboard diagrams (which freeze geometry and hide sequencing/timing) or All-22 game film (which shows everything but explains nothing), NFL Scheme Visualizer dynamically reveals the disguised symmetries, mesh points, and sequencing mathematics of modern NFL play design.

## Operating Context
Film-study and coaching analysis workstation. Used across desktop browsers for in-depth scheme breakdown: navigating coaching trees, browsing scheme directories, scrubbing synchronized All-22 playbacks, and inspecting side-by-side sequencing comparisons.

## Capabilities and Constraints
- LOS-relative yard coordinate system (`x: 0..53.33`, `y` negative = backfield, positive = downfield).
- Real-time SVG rendering and keyframe interpolation engine driven by pure TypeScript models.
- Hand-authored play datasets with strict validation (`validatePlay`, `validateLibrary`).
- Modern interactive coaching playbook interface: synchronized timeline, beat-by-beat tactical breakdowns, coaching tree graphs, and multi-play sequence comparison.
- Strict stack: Bun, Vite 8 (Rolldown), React 19, TypeScript.

## Brand Commitments
Interactive Coaching Playbook: Clean modern analytical dashboard with high-contrast tactical clarity, authentic coaching notation, legible field telemetry, and purposeful film-room typography—eschewing generic AI dark-mode gradients and clutter.

## Evidence on Hand
- Authored and typed play datasets across 45 full scheme families (180 plays; 25 offensive, 20 defensive systems) spanning modern NFL, historical NFL, and college football: the 15 modern-NFL offensive systems (Shanahan Wide Zone through Kelly Tempo Spread), 10 modern-NFL defensive systems (Saleh 4-3 Wide-9 through Bowles Creeper Blitz), plus historical/college expansions — Air Coryell, Walsh Classic WCO, Run and Shoot, Flexbone Triple Option, Air Raid, Delaware Wing-T, T-Formation Power Sweep, Pistol Read-Option, Baylor Choice, Meyer Spread-Option on offense; Buddy Ryan 46, LeBeau Fire Zone, Tampa 2, Landry Flex, Phillips Two-Gap 3-4, Jimmy Johnson Speed 4-3, Belichick Okie/Bear Package, Aranda Tite/Peso, Rocky Long 3-3-5 Stack, and Cover 2 Man-Under on defense.
- Every expansion family carries a `SchemeEra` tag (`past-nfl` | `past-college` | `current-college` | `modern-nfl`) for era-aware catalog slicing.
- 17 interactive coaching lineage trees comprising 53 detailed coach profiles with career achievements and scheme mappings — from Vince Lombardi, Don Coryell, Tom Landry, Buddy Ryan, and Dick LeBeau to all current 2026 NFL coaches in the library.
- Contextual Football Glossary system (`glossary.ts`, `GlossaryTooltip.tsx`) auto-detecting core NFL schematic concepts across film room analysis.
- Mathematical interpolation and sequencing engine (`interpolate.ts`, `playback.ts`, `beats.ts`, `validate.ts`).
- Architectural roadmap (`ROADMAP.md`), design specification (`DESIGN.md`), and Vitest validation suites (72/72 tests passing).

## Product Principles
1. **Sequencing is the Scheme**: Timing and visual disguise during the initial mesh/drop steps define modern offensive systems.
2. **Tactical Authenticity**: Diagrams, hashes, player badges, trails, and terminology adhere to genuine NFL coaching standards.
3. **Structured Analytical Hierarchy**: Macro scheme trees, family catalogs, and micro player-track timelines form a cohesive, low-friction investigation flow.

