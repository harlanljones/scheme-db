# Contributing to SchemeDB

SchemeDB is a free, open database of football scheme strategy. Everything in it is a plain JSON file in [`data/`](data/), so you can add a play, fix a coach's record or define a glossary term without touching the site's code.

There are three ways to help, from least to most work:

1. **Tell us.** Open an issue with a form: [suggest a play](https://github.com/harlanljones/scheme-db/issues/new/choose), report a mistake, or suggest a coach, scheme or term. No code needed.
2. **Fix or add a record.** Edit the JSON in `data/`, or start a new record with `bun run data:new`, and open a pull request. This guide covers it.
3. **Change the site or the tools.** See [Working on the code](#working-on-the-code).

SchemeDB is a one person hobby project, so pull requests are reviewed in batches. A pull request that passes `bun run check` and says what it rests on is the fastest to merge.

---

## Be honest about how far to trust a play

Every play carries a `confidence` in its `provenance`. Pick the one that is true; it is shown on the play's page.

| `confidence` | Use it when | Needs |
| --- | --- | --- |
| `illustrative` | You drew the play to teach the idea. | Nothing. This is the default, and what all 180 launch plays are. |
| `reconstructed` | You rebuilt the play from film, a book, a clinic or an article. | At least one entry in `sources`. |
| `verified` | A second person has checked a reconstructed play against its sources. | Set by the maintainer at review, not by the author. |

A source is `{ "type": "film" | "book" | "clinic" | "article" | "video" | "self-authored", "citation": "...", "url": "...", "accessed": "2026-11-02" }`. Cite enough that a stranger can find it: title, author or channel, date, and a timestamp for film. `url` and `accessed` are optional but welcome for anything online.

A play marked `illustrative` is never "wrong" for being a clean drawing; a play marked `reconstructed` is wrong if it does not match what it cites.

## What you may submit

Your contribution to `data/` is published under [CC BY 4.0](data/LICENSE.md), and code under [MIT](LICENSE). By opening a pull request you agree to that. You keep your copyright and are credited through the git history and GitHub's contributor list.

Draw and write your own work. Facts and ideas (who ran which concept, what a coverage does) are fine; copying someone's diagram, playbook text or paywalled article is not. In particular:

- **Do not paste player tracking data.** The NFL Big Data Bowl and Next Gen Stats data is licensed for non-commercial use only. SchemeDB's compiler uses a few rounded constants from it with credit, and no raw rows or per-play measurements belong in this repository. See [`specs/README.md`](specs/README.md).
- **Do not copy game film stills or screenshots** into the repository.

---

## Set up

SchemeDB uses [Bun](https://bun.sh) for everything. Never use npm, yarn or pnpm; no `package-lock.json` or `yarn.lock` should appear.

```bash
git clone https://github.com/harlanljones/scheme-db.git
cd scheme-db
bun install
bun run data:validate   # should print "Data valid: ..."
bun run dev             # the site at http://localhost:4321
```

| Command | What it does |
| --- | --- |
| `bun run data:new <kind> ...` | Start a new record with a valid skeleton (below). |
| `bun run data:validate` | Parse every record against its schema and run the cross record checks. The fastest loop while you edit. |
| `bun run data:format` | Rewrite every record in canonical formatting. CI fails on any file that is not canonical. |
| `bun run data:schema` | Regenerate `data/schema/*.schema.json` after changing `src/schema/schema.ts`. Do not edit those files by hand. |
| `bun run check` | Everything CI runs: validate, format check, specs, release build, tests, typecheck, site build and site check. Run it before you open a pull request. |

Most editors will complete and check a record for you: every file in `data/` starts with a `$schema` line that points at its JSON Schema.

---

## Add a play

A play is two files that share an id: the **concept** (what the play is, in words) and the **tracks** (where the 22 players are, over time).

```
data/concepts/<scheme id>/<play id>.json
data/tracks/<scheme id>/<play id>.json
```

### 1. Start from a skeleton

Pick the scheme the play belongs to (the file names in `data/schemes/`) and a formation (the file names in `data/formations/`), then run:

```bash
bun run data:new concept --scheme shanahan-wide-zone --id shanahan-counter-trey --name "Counter Trey" --formation shanahan-21p-offset-i-vs-over-c3
```

This writes both files with all 22 players standing on their formation spots, and `TODO:` wherever you have to write something. Two options save work:

- `--like <play id>` copies another play's framing and player paths, so you edit a drawing instead of starting from standing still.
- `--formation` can be left out; the new play then uses the formation the scheme's first play uses.

Play ids are unique across the whole library, so start yours with the scheme's name (`shanahan-...`, `airraid-...`).

### 2. Draw the players

Open `data/tracks/<scheme>/<play>.json`. Each player has a list of **waypoints**: `{ "t": 1.2, "x": 24.2, "y": 0.4 }` means "1.2 seconds after the snap, 24.2 yards from the left sideline, 0.4 yards past the line of scrimmage". The viewer draws a smooth curve through them.

- `x` runs from `0` (left sideline) to `53.33` (right sideline). The middle of the field is `26.67`.
- `y` is measured from the line of scrimmage: `0` is the line, negative is the offensive backfield (a shotgun quarterback is about `-4.5`), positive is downfield. Never use pixels.
- Every player starts at `t: 0`. Times strictly increase, and none passes the play's `duration`.
- Draw every play with the ball at midfield; if the ball really sits on a hash, set `ballSpot` in the concept (`left`, `middle` or `right`) and the site places it.
- There are exactly 11 offensive and 11 defensive players, with unique ids. Offense uses `QB`, `RB`, `X`, `Z`, `TE`, `LT`, `LG`, `C`, `RG`, `RT` and the like; defense uses `WDE`, `NT`, `MIKE`, `LCB`, `FS` and the like. The formation's ids are the ones to use.
- Give each moving player a `trail` (`route`, `block`, `carry`, `drop` or `none`) and a short `assignment`. A waypoint's optional `note` says what the player is doing there; it stays in the record and the downloads for people who read the data.

The first 1.2 seconds matter most: SchemeDB compares how alike two related plays look in that window, so a constraint play should leave its base play's spots the same way until it shows itself.

If you would rather describe a pass play than place every waypoint, the optional [play spec](specs/README.md) compiles a short YAML description into tracks. It is still an experiment (pass plays only), and the compiled tracks are the record that gets published.

### 3. Write the framing

Open `data/concepts/<scheme>/<play>.json` and replace every `TODO:`.

- `situation` must start with the down: `"1st & 10, +40, base down"`. The plays list filters by it.
- `summary` says what the play is for, the defender it puts in conflict, why it works and how a defense beats it.
- `beats` are the coaching points. Each has a time `t`, a `title`, `text`, and `focus`, the ids of the players to light up. Keep them in time order.
- `relations` links the play to others. List at least one play **in the same scheme** in `setsUp` or `playsOff`, because the site compares a play with the plays it relates to. `tell` says what looks the same and when it stops.
- `provenance` is the confidence and sources described above.

### 4. Check it

```bash
bun run data:validate   # lists everything still wrong, in plain words
bun run dev             # open the play's page and scrub it
```

`data:validate` fails while any `TODO:` is left, so it is your checklist. Fix what it reports, then run `bun run data:format` and `bun run check`.

## Add a scheme, a coach or a glossary term

```bash
bun run data:new coach  --id jane-doe --name "Jane Doe" --team "Example Team" --side offense --lineage air-raid --mentor mike-leach
bun run data:new scheme --id doe-spread --name "Jane Doe's Spread" --coach jane-doe --team "Example Team" --era modern-nfl
bun run data:new term   --id mesh --term "Mesh" --category "Pass Concept"
```

- **A scheme needs at least one play** (`bun run data:new concept --scheme doe-spread ...`) and a coach who already has a record. The command also adds the scheme to the coach's `schemeIds`.
- **A coach** is placed on the lineage chart by adding `{ "coachId": "jane-doe", "children": [] }` under their mentor in `data/lineages/<branch>.json`. A mentor or disciple must have a coach record too; the twelve people who still do not are listed in `src/schema/validate-dataset.ts`, and adding a record for one of them is a welcome pull request.
- **A glossary term** is a short definition and a tactical note. Add the words readers will see in text to `aliases`.
- **A new formation** is a file in `data/formations/` with all 11 offensive and 11 defensive spots, keyed by the same player ids the tracks use. Copy one that is close.

Run `bun run data:new` with no arguments to see every option.

## Fix a record

Edit the JSON, then `bun run data:format` and `bun run check`. If you change what a play shows, say so in the pull request: a fix to a mentor link or a source is exactly what the project wants, and a change to a play's geometry changes its similarity scores, which is worth a sentence.

---

## Opening a pull request

Open it against `main`. The pull request template has a short checklist. In summary:

- `bun run check` passes. CI runs the same steps on every pull request.
- No `TODO:` is left, ids are lowercase words joined by hyphens, and files are canonically formatted.
- Anything not `illustrative` lists its sources.
- You wrote it or have the right to share it, and you are fine with CC BY 4.0.

What the reviewer looks at: whether the play teaches the idea it claims to, whether its first 1.2 seconds match the plays it relates to, and whether the sources say what you say they do. Expect questions rather than rewrites.

---

## Working on the code

| Path | What lives there |
| --- | --- |
| `data/` | The dataset: one JSON file per record, plus the generated JSON Schemas. The source of truth. |
| `src/schema/` | The Zod schemas, the loader, the validators and the scaffold behind `data:new`. |
| `src/engine/` | Pure functions: spline interpolation, frames, the disguise metric, hash marks. No DOM, no React. |
| `src/spec/` | The optional play spec compiler. |
| `src/release/` | Builds the JSON, CSV and SQLite downloads. |
| `site/` | The Astro site and its React islands. Pages read `data/` at build time. |
| `scripts/` | The command line tools behind the `bun run` commands. |

- The site is [Astro](https://astro.build) with React islands, built and run with Bun. Design decisions are recorded in [`docs/redesign/DECISIONS.md`](docs/redesign/DECISIONS.md).
- Add a test with every change. `bun run test` runs the whole suite.
- Site copy follows the data: counts, the "illustrative" notice and play lists are built from `data/`, so a new record never needs a code change. If a page says a number that the data could change, build it from the data and add a test.
- Always install the latest version of a dependency with `bun add <pkg>`; do not pin versions copied from elsewhere.
- `src/data/`, `src/components/`, `src/App.tsx` and `bun run dev:legacy` are the previous single page app and its TypeScript copy of the library. **They are frozen**: nothing reads `data/` through them and nothing in `data/` is tested against them. Do not add plays there; add them to `data/`.

Thank you for helping.
