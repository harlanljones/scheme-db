# SchemeDB data

A free, open database of football scheme strategy. Every record is a JSON file validated by a schema in `data/schema/` (generated from `src/schema/schema.ts`) and by cross-record checks in `src/schema/validate-dataset.ts`.

The data is licensed CC BY 4.0, see [LICENSE.md](./LICENSE.md). The code in this repository stays MIT.

## Accuracy

All 180 launch concepts are labeled `illustrative`. Their player geometry is hand-authored to teach the idea of a scheme. It is not tracking data and has not been checked against film. A record can only move to `reconstructed` or `verified` when it lists at least one source.

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
bun run data:validate        parse every record and run the cross-record checks
bun run data:format          rewrite every record in canonical formatting
bun run data:format --check  fail if any record is not canonical (CI runs this)
bun run data:schema          regenerate data/schema/*.schema.json
bun run data:frames [file]   write the 10 Hz frames export as CSV (default dist/data/frames.csv)
bun run data:release         build the JSON, CSV and SQLite downloads into dist/release (CI runs this)
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

Pushing a tag such as `data-v0.1.0` runs `.github/workflows/release-data.yml`, which attaches the files to a GitHub release. Run that workflow by hand to get the same files as a workflow artifact without releasing.

## Migration from the TypeScript library

`bun run data:migrate` regenerated these files from `src/data`. It is a one-off and goes away when the app reads `data/` directly. A parity test (`src/schema/__tests__/dataset.test.ts`) proves every play, coach, tree and glossary term round-trips unchanged. What changed on the way:

- A play is split in two: the descriptive record (`concepts/`) and the geometry (`tracks/`).
- `Play.coach` and `Play.family` are gone. The scheme links to its coach through `coachId`, and a concept links to its scheme through `schemeId`. `Play.family` disagreed with the scheme id for the 8 Shanahan and Kubiak plays (`wide-zone`, `split-zone-leak`).
- `SchemeFamily.coach` (a display string) is gone; the coach's own `name` is the single source. One name differed: the Delaware Wing-T scheme said `Harold "Tubby" Raymond`, his profile says `Tubby Raymond`.
- The 25 modern-NFL schemes had no `era`; they are now `modern-nfl`.
- `treeBranch` is now `lineage`, `category` is `side`, `schemeFamilyIds` is `schemeIds`, `sequence` is `relations`.
- Each tree node holds a `coachId` instead of a copy of the whole profile.

## Known gaps

Nine people are named as a mentor or disciple but have no coach record: Bill Parcells, Paul Brown, Mike Holmgren, George Seifert, Jack Elway, Bobby Slowik, Monte Kiffin, Gus Bradley and Jim Mora. The validator reports them as warnings. The mentor links themselves were carried over from the legacy data and have not been fact-checked.
