# SchemeDB data

A free, open database of football scheme strategy. Every record is a JSON file validated by a schema in `data/schema/` (generated from `src/schema/schema.ts`) and by cross-record checks in `src/schema/validate-dataset.ts`.

The data is licensed CC BY 4.0, see [LICENSE.md](./LICENSE.md). The code in this repository stays MIT. These files are the source of truth: the site, the downloads and the tests all read them. To add or fix a record, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Accuracy

All 180 launch concepts are labeled `illustrative`; contributions may be `reconstructed` when they cite sources. Their player geometry is hand-authored to teach the idea of a scheme. It is not tracking data and has not been checked against film. A record can only move to `reconstructed` or `verified` when it lists at least one source.

| `confidence` | Meaning |
| --- | --- |
| `illustrative` | Authored to illustrate the concept. No sources required. |
| `reconstructed` | Rebuilt from cited film, books, clinics or articles. At least one source required. |
| `verified` | Reconstructed, then reviewed by a second person. At least one source required. |

## Layout

| Directory | One file per | Contents |
| --- | --- | --- |
| `schemes/<scheme>.json` | scheme | Name, coach, team, side, era, lineage branch, description |
| `concepts/<scheme>/<concept>.json` | concept | Personnel, formation, situation, coverage, front, summary, beats, relations, provenance |
| `tracks/<scheme>/<concept>.json` | concept | Duration and the 22 player tracks with timed waypoints |
| `formations/<formation>.json` | formation | A named pre-snap look: where the 11 offensive and 11 defensive players line up and what position each plays, keyed by track id |
| `coaches/<coach>.json` | coach | Profile, mentor and disciples, associated schemes |
| `lineages/<branch>.json` | lineage | A coaching tree as nested coach ids |
| `glossary/<term>.json` | term | Definition, aliases, category |
| `schema/*.schema.json` | record kind | JSON Schema; each record points at its schema through `$schema` |

A concept can name the formation it starts from with `formationId`. Its tracks may still move individual players off the preset, for example a pistol quarterback or a shifted front. 68 concepts name a formation; 63 start exactly on it and 5 move one or more players (`bun run data:validate` checks that every preset player has a track).

Play specs in `specs/` compile to `tracks/` records, see [specs/README.md](../specs/README.md).

Coordinates are yards relative to the line of scrimmage: `x` runs 0 to 53.33 across the field, `y` is negative in the offensive backfield and positive downfield. Every play is drawn with the ball at `x = 26.67`, the middle of the field. A concept's optional `ballSpot` (`left`, `middle` or `right`) says where the ball really sits; add the offset in `src/engine/field.ts` to place the play on the field. NFL hash marks are 23.58 and 29.75 yards from the left sideline and college hash marks are 20 and 33.33. The release `concepts` table carries `ball_spot` and `ball_x`.

## Working with the data

```
bun run data:new <kind>      start a concept, scheme, coach or term with a valid skeleton (TODO: marks what to write)
bun run data:validate        parse every record and run the cross-record checks
bun run data:format          rewrite every record in canonical formatting
bun run data:format --check  fail if any record is not canonical (CI runs this)
bun run data:schema          regenerate data/schema/*.schema.json
bun run data:frames [file]   write the 10 Hz frames export as CSV (default dist/data/frames.csv)
bun run data:release         build the JSON, CSV and SQLite downloads into dist/release (CI runs this)
bun run data:package         turn dist/release into the files of a GitHub release, in dist/release-assets (CI runs this too)
```

The frames export has one row per player per tenth of a second: `conceptId, playerId, frame, t, x, y`. It uses the same spline interpolation as the viewer, so it is a resampling of the waypoints, not tracking data.

## Downloads

`bun run data:release [--version v0.1.0] [--out dist/release]` writes three views of the same data, plus checksums and the license:

- `scheme-db.json`: every record nested as in `data/`, plus a `meta` block.
- `csv/*.csv`: 18 flat tables, one file each (schemes, coaches, concepts, concept beats, players, waypoints, frames and so on).
- `scheme-db.sqlite`: the same tables with primary keys, ready to query.

Lists of ids become join tables (`coach_schemes`, `concept_relations`, `glossary_aliases`); lists of free text, such as a coach's key concepts, are JSON arrays in one column. Booleans are 0 or 1 and a missing value is empty in CSV and NULL in SQLite. The build is deterministic, so the same data and version give the same checksums.

```sql
-- plays per scheme, with the coach
SELECT c.name AS coach, s.name AS scheme, COUNT(*) AS plays
FROM concepts k JOIN schemes s ON s.id = k.scheme_id JOIN coaches c ON c.id = s.coach_id
GROUP BY s.id ORDER BY plays DESC;

-- where receiver H is during the first second of a play
SELECT frame, t, x, y FROM frames WHERE concept_id = 'kelly-mesh-spacing-concept' AND player_id = 'H' AND frame <= 10;
```

### Cutting a data release

A data release is a Git tag named `data-vMAJOR.MINOR.PATCH`, for example `data-v1.0.0`. The version also lives in one file, `data/VERSION`, which is what the site's downloads (`/downloads/scheme-db.json`, the SQLite `meta` table, `meta.csv`) and the Data page say. To cut a release, set `data/VERSION` to the new version in a commit on `main`, wait for CI to pass on it, then tag that commit:

```bash
git tag data-v1.0.0 && git push origin data-v1.0.0
```

The workflow refuses a tag that does not match `data/VERSION` (a suffix such as `-rc.1` is ignored for the match), so the files on the site and on the GitHub release always name the same version. A build can override the file with the `DATA_VERSION` environment variable, which is for trying things out, not for releases.

That runs `.github/workflows/release-data.yml`, which validates the data, builds the downloads, packages them with `bun run data:package` and creates a **draft** GitHub release with these files (the CSV tables are zipped):

- `scheme-db-v0.1.0.json`, `scheme-db-v0.1.0.sqlite`, `scheme-db-v0.1.0-csv.zip` and `LICENSE.md`
- `SHA256SUMS`, which names those four files, so `sha256sum -c SHA256SUMS` works in the folder you download them to (macOS: `shasum -a 256 -c SHA256SUMS`)

Nothing is public until you open the draft on the Releases page, look at the files and notes, and press Publish. The release notes are written from the data (counts, and whether the plays are illustrative), so they cannot go stale. A tag with a suffix, such as `data-v0.1.0-rc.1`, makes a pre-release. A tag that does not look like `data-v1.2.3` or `data-v1.2.3-rc.1` fails the workflow before anything is built. To redo a release, delete the draft (or release) and the tag, then push the tag again.

To try the whole path without releasing, run the workflow by hand (Actions tab, "Release data"; it appears once the workflow is on `main`). It builds the same files and keeps them as a workflow artifact instead of releasing. `bun run data:release --version v0.1.0 && bun run data:package --version v0.1.0` does the same on your machine and needs the `zip` command.

## Where the launch data came from

The 180 launch plays, 53 coaches, 17 lineages and 30 glossary terms were migrated once from the previous TypeScript library (`src/data`, since removed from the repository; it is in git history at commit `134ac94`). From the migration on, `data/` is edited directly. What changed on the way:

- A play is split in two: the descriptive record (`concepts/`) and the geometry (`tracks/`).
- `Play.coach` and `Play.family` are gone. The scheme links to its coach through `coachId`, and a concept links to its scheme through `schemeId`. `Play.family` disagreed with the scheme id for the 8 Shanahan and Kubiak plays (`wide-zone`, `split-zone-leak`).
- `SchemeFamily.coach` (a display string) is gone; the coach's own `name` is the single source. One name differed: the Delaware Wing-T scheme said `Harold "Tubby" Raymond`, his profile says `Tubby Raymond`.
- The 25 modern-NFL schemes had no `era`; they are now `modern-nfl`.
- `treeBranch` is now `lineage`, `category` is `side`, `schemeFamilyIds` is `schemeIds`, `sequence` is `relations`.
- Each tree node holds a `coachId` instead of a copy of the whole profile.

## Known gaps

Twelve people are named as a mentor or disciple but have no coach record: Bill Parcells, Bobby Slowik, Bruce Arians, Dan Campbell, Frank Reich, George Seifert, Gus Bradley, Jim Johnson, Jim Mora, Mike Holmgren, Monte Kiffin and Paul Brown. The validator reports them as warnings and accepts only these names; any other mentor or disciple id without a coach record is an error. Adding a record for one of them is a welcome contribution. The mentor links were carried over from the previous library; the audit corrected several, and none has been fact-checked against a source.
