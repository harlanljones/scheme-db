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
- Authored and typed play datasets across 20 full scheme families (80 plays; 10 offensive, 10 defensive systems): Shanahan Wide Zone, Kubiak Split-Zone, Reid Spread-RPO, McVay Duo, McDaniel Speed Motion, Stefanski Multi-TE Gap, Steichen QB Mesh RPO, LaFleur Illusion, Sirianni Power RPO, Johnson Counter Deception, Saleh 4-3 Wide-9, Macdonald Sim-Pressure, Flores Psycho Blitz, Fangio Two-High Quarters, Minter Amoeba Creeper, Ryans Wide-9 Attack, Shula Match Quarters, Spagnuolo Exotic Blitz, Quinn Cover 3 Press, and Bowles Creeper Blitz.
- 6 interactive 2026 coaching lineage trees comprising 20 detailed coach profiles with career achievements and scheme mappings.
- Contextual Football Glossary system (`glossary.ts`, `GlossaryTooltip.tsx`) auto-detecting core NFL schematic concepts across film room analysis.
- Mathematical interpolation and sequencing engine (`interpolate.ts`, `playback.ts`, `beats.ts`, `validate.ts`).
- Architectural roadmap (`ROADMAP.md`), design specification (`DESIGN.md`), and Vitest validation suites (71/71 tests passing).

## Product Principles
1. **Sequencing is the Scheme**: Timing and visual disguise during the initial mesh/drop steps define modern offensive systems.
2. **Tactical Authenticity**: Diagrams, hashes, player badges, trails, and terminology adhere to genuine NFL coaching standards.
3. **Structured Analytical Hierarchy**: Macro scheme trees, family catalogs, and micro player-track timelines form a cohesive, low-friction investigation flow.

