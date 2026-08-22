# Contributing to SchemeDB

Thank you for your interest in contributing to **SchemeDB**! This document outlines our architectural principles, authoring conventions, and pull request workflow.

---

## 🏛 Architecture & Principles

SchemeDB is built around strict separation of concerns:

1. **Engine Layer (`src/engine/`)**: Pure mathematical functions for interpolation, clock management, disguise telemetry calculation, and schema validation.
   - **Zero DOM / Zero React dependencies** in the engine.
   - Standardized on **Centripetal Catmull-Rom spline interpolation** ($\alpha = 0.5$) for natural player acceleration, realistic curvature, and zero cusp self-intersection.
2. **Data Layer (`src/data/`)**: Strictly typed `.ts` play definitions, coaching profiles, and coaching trees.
   - Hand-authored play modules organized under `src/data/schemes/<system-name>/` typed as `Play` (`src/engine/types.ts`).
   - 53 coach profiles and 17 lineage trees in `src/data/coaches/index.ts`.
   - 45 scheme families (180 plays) registered in `src/data/schemes/index.ts`; every historical/college family declares a `SchemeEra`.
3. **Presentation Layer (`src/components/`)**: React 19 visual components driven entirely by engine output.

---

## 📐 Coordinate System Conventions

- **Units**: Field coordinates are strictly **yards, Line-of-Scrimmage (LOS) relative**.
  - `x`: `0.0` (left sideline) to `53.33` (right sideline). Center of field is `x = 26.67`.
  - `y`: `0.0` is the Line of Scrimmage (LOS).
  - `y < 0`: Offensive backfield (e.g., QB shotgun at `y = -4.5`, RB at `y = -5.0`).
  - `y > 0`: Defensive alignment and downfield routes (e.g., safety at `y = 12.0`).
- **Screen Conversion**: Conversion to SVG pixel space occurs exclusively within `<Field />` / `<PlayCanvas />`. Never author plays using raw pixels.

---

## 🏈 Authoring New Plays & Systems

When contributing a new play or expanding a scheme family:

1. Create a `.ts` module under `src/data/schemes/<system-name>/` (e.g., `src/data/schemes/shanahan/boot-leak.ts`):
   - Provide all `Play` fields from `src/engine/types.ts`: `id` (kebab-case, globally unique — prefix with the system name, e.g. `coryell-`), `name`, `coach` (a key from the closed union), `family`, `personnel`, `formation`, `situation`, `coverage`, `frontName`, `duration`.
   - Author 11 offensive tracks and 11 defensive tracks (22 players total) — all 22 ids unique within the play:
     - Offense: `QB`, `RB`, `X`, `Z`, `F`/`H` (Slot), `TE`/`Y`, `LT`, `LG`, `C`, `RG`, `RT`.
     - Defense: `LDE`/`WDE`/`SDE`, `NT`, `3T`/`LDT`/`RDT`, `RDE`, `WILL`/`WLB`, `MIKE`/`MLB`, `SAM`/`SLB`, `LCB`, `RCB`, `FS`, `SS` (plus Nickel/Peso/Dime variants).
   - Define starting alignments in a shared constant (`src/data/formations.ts`) or a local `ALIGN` const at the top of the play file; reference it at every track's `t = 0.0` waypoint.
   - Author keyframes starting at `t = 0.0` with strictly monotonic timestamps up to `play.duration`; keep every `x` inside `[0, 53.33]`.
   - Provide chronological `beats` (`t`, `title`, `text`, `focus` — every focus id must exist among the player ids).
   - Define `summary` (`motive`, `keyDefender`, `whyItWorks`, `failureMode`) and `sequence` (`setsUp`, `playsOff`, `tell`). Cross-references must point at play ids that exist somewhere in the library.
2. Export the plays from `src/data/schemes/<system-name>/index.ts` as `<SYSTEM>_PLAYS: Play[]` plus a `<SYSTEM>_FAMILY: SchemeFamily` (with `category`, `treeBranch`, and — for any historical or college system — an `era`), then register both in `src/data/schemes/index.ts`.
3. Run the validation suite:
   ```bash
   bun run test
   ```
   Every play must pass `validatePlay()` with zero errors (all 22 players present, strictly monotonic timestamps, keyframes within field bounds), and the whole-library sweep must pass `validateLibrary()` across all 180+ plays.

---

## 🛠 Local Development Setup

SchemeDB uses **Bun** as its package manager and runtime.

```bash
# Clone repository
git clone https://github.com/harlanljones/scheme-db.git
cd scheme-db

# Install dependencies (never use npm/yarn)
bun install

# Start Vite dev server with instant HMR
bun run dev

# Run Vitest test suite (engine + whole-library validation sweep)
bun run test

# Typecheck and production build
bun run build && bun run typecheck
```

---

## 🚀 Pull Request Checklist

Before submitting a PR, verify:
- [ ] `bun run test` passes (100% tests passing, all 180+ plays validated via `validateLibrary`).
- [ ] `bun run typecheck` passes with zero errors (`tsc --noEmit`).
- [ ] `bun run lint` passes (`oxlint`).
- [ ] Field coordinates use LOS-relative yards (`x: 0..53.33`, `y: -15..+25`).
- [ ] Any new scheme family declares `category` and, for historical/college content, a `SchemeEra`.
- [ ] No `package-lock.json` or `yarn.lock` files are committed.

