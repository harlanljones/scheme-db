# AGENTS.md

SchemeDB is a free, open database of football scheme strategy: schemes, plays, coaches, coaching
lineages and a glossary, published as JSON, CSV and SQLite and read by an animated, static site. All
data is CC BY 4.0; the code is MIT. Live at https://schemedb.harlanljones.com.

**Read `CONTRIBUTING.md` and `data/README.md` before implementing anything.** `data/` is the source
of truth: one JSON file per scheme, play, coach, lineage, formation and glossary term, validated by
the Zod schemas in `src/schema/`. Design decisions for the site are in `docs/redesign/DECISIONS.md`;
the visual system is in `DESIGN.md` and the product brief in `PRODUCT.md`.

## Tooling

- **Runtime & package manager: Bun.** Use `bun install`, `bun add <pkg>`, `bun run <script>`. Never
  use `npm`, `yarn` or `pnpm`; only `bun.lock` may exist.
- **Site: Astro with React islands** (`site/`, config in `astro.config.mjs`), run with Bun. Pages read
  `data/` at build time. Hosted on Cloudflare Workers (`wrangler.jsonc`); `main` is production.
- **Tests: Vitest**, run with `bun run test` (or `bunx vitest`), not `bun test`, which is Bun's own
  unrelated runner.
- **Always install the latest version of a package.** Use `bun add <pkg>` with no pinned version; do
  not copy version numbers from other projects, memory or older docs.

## Repo layout

- `data/`: **the dataset and the source of truth.** Add and edit plays, coaches, schemes, lineages,
  formations and glossary terms here, as JSON. `bun run data:new` starts a record.
- `src/schema/`: Zod schemas, loader, cross-record validators (`validate-dataset.ts`) and the scaffold
  behind `data:new`. Change a schema, then run `bun run data:schema`.
- `src/engine/`: pure functions only (spline interpolation, frames, disguise metric, hash marks,
  geometry validation, coverage variants). No React, no DOM.
- `src/spec/`, `src/release/`, `scripts/`: the optional play spec compiler, the JSON/CSV/SQLite
  release build, and the command line tools.
- `site/`: pages, components, React islands and `site/lib/data.ts`, which reads `data/`. Copy that
  states a count or says "illustrative" is built from the data, never typed.
- `worker/`: the one Cloudflare Worker. It runs first for `/` only and 301s the links the first version
  of the site gave out (`/?play=outside-zone`, `/?scheme=…`, `/?tab=trees`) to their pages; everything
  else is static files. `worker/legacy-links.json` is frozen: never delete an entry. If a play or scheme
  moves or is renamed, point its old id at the new page (a test fails until you do).
- `specs/`: play specs (YAML) that compile to tracks. `docs/redesign/`: the decision record.

## Hard conventions

- Play data is **JSON in `data/`**, parsed against `src/schema/schema.ts` and checked across records by
  `src/schema/validate-dataset.ts`: every id resolves, 22 players, strictly increasing times, a down at
  the start of `situation`, a source for anything not `illustrative`, no `TODO:` left. Run
  `bun run data:validate`.
- Field coordinates are **yards, line of scrimmage relative** (`x: 0…53.33`, `y` negative is the
  backfield, positive is downfield), never pixels. Conversion to screen space happens only in the
  site's field components.
- Tests must not break when a record is added. Assert floors and invariants, never an exact count of
  schemes, plays or coaches.
- The engine (`src/engine/`) must not import React or touch the DOM.
- The `main` branch is live production. Release work goes to `release/mid-season-2026` and is merged to
  `main` only when Harlan approves a release.

## Commands

- `bun run dev`: run the site
- `bun run data:new <concept|scheme|coach|term>`: start a record; `bun run data:validate`: check `data/`
- `bun run data:format`: canonical formatting; `bun run data:schema`: regenerate the JSON Schemas
- `bun run test`: Vitest (engine, schema and validators, site, release build)
- `bun run check`: everything CI runs; run it before opening a pull request

## History

The first version was a single page app with its own TypeScript copy of the library, built from a
phased roadmap. It was removed when `data/` became the source of truth and the site was rebuilt in Astro
(2026-11-02). Commit `134ac94` on `release/mid-season-2026` is the last one that has it. Its
coverage-variant switcher logic survives as `src/engine/coverage.ts`, unused by the site. To read the old
code, run `git show 134ac94:src/App.tsx` or check that commit out.
