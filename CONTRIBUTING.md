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
   - 20 coach profiles and 6 lineage trees in `src/data/coaches/index.ts`.
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
   - Provide `id`, `name`, `coach`, `category` (`'offense' | 'defense'`), `formation`, `personnel`, `coverage`, `frontName`, and `duration`.
   - Author 11 offensive tracks and 11 defensive tracks (22 players total):
     - Offense: `QB`, `RB`, `X`, `Z`, `F` (Slot), `TE`, `LT`, `LG`, `C`, `RG`, `RT`.
     - Defense: `LDE`, `LDT`, `RDT`, `RDE`, `WLB`, `MLB`, `SLB`, `LCB`, `RCB`, `FS`, `SS` (or Nickel / Star variants).
   - Author keyframes starting at `t = 0.0` with strictly monotonic timestamps up to `play.duration`.
   - Provide chronological `beats` (`timestamp`, `title`, `text`, `focus`).
   - Define `summary` (`keyDefender`, `whyItWorks`, `failureMode`, `motive`) and `sequence` (`tell`, `basePlayId`).
2. Export the play in `src/data/schemes/<system-name>/index.ts` and register it in `src/data/schemes/index.ts`.
3. Run the validation suite:
   ```bash
   bun run test
   ```
   Every play must pass `validatePlay()` with zero errors (all 22 players present, strictly monotonic timestamps, keyframes within field bounds).

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
- [ ] `bun run test` passes (100% tests passing, all 80+ plays validated).
- [ ] `bun run typecheck` passes with zero errors (`tsc --noEmit`).
- [ ] `bun run lint` passes (`oxlint`).
- [ ] Field coordinates use LOS-relative yards (`x: 0..53.33`, `y: -15..+25`).
- [ ] No `package-lock.json` or `yarn.lock` files are committed.

