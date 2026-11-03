# SchemeDB

**A free, open database of football scheme strategy.** Schemes, plays, coaches, coaching lineages and a glossary, as plain JSON files you can download, query and correct, with an animated viewer that shows how a play is built.

Live at **[schemedb.harlanljones.com](https://schemedb.harlanljones.com)**

[![License: MIT](https://img.shields.io/badge/code-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-blue.svg?style=flat-square)](data/LICENSE.md)

---

## What it is

Play design runs on sequencing and disguise. A play-action pass, a bootleg or a screen looks like the base run for the first second or so after the snap, so a defender who reads run is wrong before the play shows itself. A static chalkboard diagram hides that timing, and game film shows the result without explaining the geometry.

SchemeDB draws each play as 22 players moving through time, then compares a play with the plays it is built to mirror. The library has schemes from modern NFL offenses and defenses back to Lombardi's power sweep and Coryell's vertical passing game, plus college systems such as the Air Raid and the flexbone, each with a handful of plays and the coach who ran it.

- **Schemes, plays and coaches** each have a page. Every play has a viewer you can play and scrub, a beat by beat explanation, and a **same look** (offense) or **disguise** (defense) comparison with a related play over its first 1.2 seconds.
- **Lineages** show who worked under whom, from Bill Walsh and Andy Reid to Brian Flores and Mike Macdonald, with the influence that did not come from a job link drawn as a dashed line.
- **A glossary** defines the terms the pages use and links each to the schemes that use it.
- **Downloads** give the whole dataset as JSON, CSV tables and a SQLite database, so you can work with it directly.

## How far to trust a play

Every play carries a `confidence`: `illustrative`, `reconstructed` or `verified`. **At launch every play is `illustrative`:** the player paths are drawn by hand to teach the idea of a scheme. They are not tracking data and have not been checked against film. The site says so, and it says how many plays are illustrative from the data, so the notice changes the day a play is reconstructed from cited sources. The similarity score compares plays with each other; it does not measure what a defense sees.

## Use the data

Every record is a JSON file in [`data/`](data/), validated by a JSON Schema. [`data/README.md`](data/README.md) describes the layout, the coordinate system (yards, relative to the line of scrimmage) and the downloads. The site's **Data** page links the files:

- `scheme-db.json`: every record, nested as in `data/`
- `csv/*.csv`: flat tables (schemes, coaches, concepts, beats, players, waypoints, 10 Hz frames and more)
- `scheme-db.sqlite`: the same tables, ready to query

```sql
-- plays per scheme, with the coach
SELECT c.name AS coach, s.name AS scheme, COUNT(*) AS plays
FROM concepts k JOIN schemes s ON s.id = k.scheme_id JOIN coaches c ON c.id = s.coach_id
GROUP BY s.id ORDER BY plays DESC;
```

The data is licensed [CC BY 4.0](data/LICENSE.md): use it, remix it, and credit SchemeDB.

## Contribute

The data is open, and so is the way in. Every scheme, play, coach and glossary term is a JSON file.

- **No code:** [suggest a play, report a mistake, or suggest a coach, scheme or term](https://github.com/harlanljones/scheme-db/issues/new/choose) with a form.
- **Add or fix a record:** `bun run data:new concept --scheme <scheme> --id <play> --name "<Play name>"` writes a valid skeleton, `bun run data:validate` lists what is left to write, and `bun run check` is what CI runs. [CONTRIBUTING.md](CONTRIBUTING.md) walks through it, including how to label a play `reconstructed` and cite its sources.
- **Change the site or the tools:** see "Working on the code" in [CONTRIBUTING.md](CONTRIBUTING.md).

SchemeDB is a one person project, so pull requests are reviewed in batches. Please do not paste player tracking data (the NFL Big Data Bowl data is licensed for non-commercial use only) or copy anyone's diagrams.

## Run it locally

You need [Bun](https://bun.sh). SchemeDB uses Bun for everything; never npm, yarn or pnpm.

```bash
git clone https://github.com/harlanljones/scheme-db.git
cd scheme-db
bun install
bun run dev             # the site at http://localhost:4321
bun run data:validate   # check every record in data/
bun run check           # everything CI runs
```

## How it is built

| Layer | Technology |
| --- | --- |
| Data | JSON files in `data/`, parsed against [Zod](https://zod.dev) schemas in `src/schema/`; JSON Schemas are generated for editors |
| Engine | Pure TypeScript in `src/engine/`: spline interpolation of waypoints, 10 Hz frames, the similarity score, hash marks, geometry checks |
| Site | [Astro](https://astro.build) with React islands, built as static pages from `data/` and hosted on Cloudflare Workers |
| Tools | Bun, [Vitest](https://vitest.dev), `tsc`, [oxlint](https://oxc.rs); a play spec compiler in `src/spec/` and a release build in `src/release/` |

```
data/      the dataset: the source of truth
src/       schemas and validators, the engine, the spec compiler, the release build
site/      pages, components and React islands
scripts/   the command line tools behind `bun run`
worker/    redirects for links to the first version of the site
specs/     optional YAML play specs that compile to tracks
docs/      the redesign decision record
```

Paths are drawn as centripetal Catmull-Rom splines through timed waypoints, so a cut bends instead of snapping. Field coordinates are yards: `x` runs 0 to 53.33 across the field, `y` is 0 on the line of scrimmage, negative in the offensive backfield and positive downfield. The similarity score is described on the site's [About page](https://schemedb.harlanljones.com/about/#similarity).

More: [`DECISIONS.md`](docs/redesign/DECISIONS.md) records why the site looks and works the way it does, [`PRODUCT.md`](PRODUCT.md) and [`DESIGN.md`](DESIGN.md) are the product brief and the visual system, and [`AGENTS.md`](AGENTS.md) is the short guide for coding agents.

## License

Code is under the [MIT License](LICENSE). Data in `data/` is under [CC BY 4.0](data/LICENSE.md). Copyright © 2026 Harlan Jones.
