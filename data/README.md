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

Time in a track is `t`, in seconds from the snap: `t = 0` is the snap and a negative `t` is before it, down to `-6` (`PRESNAP_MAX_SECONDS` in `src/engine/presnap.ts`). A player who is already moving when the ball is snapped, such as a jet man, starts his track at a negative time, so he reaches the snap at the speed he really has. A track may start at the snap, as every track did before, but every track must have a waypoint at exactly `t = 0` and times must ascend. `duration` stays the seconds after the snap, and beats start at the snap (`t >= 0`). The lead in, how many seconds of play come before the snap, is derived from the earliest waypoint and never stored. The 1.2 s window behind the similarity scores is still the first 1.2 s after the snap.

## Working with the data

```
bun run data:new <kind>      start a concept, scheme, coach or term with a valid skeleton (TODO: marks what to write)
bun run data:validate        parse every record and run the cross-record checks
bun run data:format          rewrite every record in canonical formatting
bun run data:format --check  fail if any record is not canonical (CI runs this)
bun run data:schema          regenerate data/schema/*.schema.json
bun run data:frames [file]   write the 10 Hz frames export as CSV (default dist/data/frames.csv)
bun run data:release         build the JSON, CSV and SQLite downloads into dist/release (CI runs this)
bun run speed:report         list every player drawn faster than a person runs, and every motion the rules do not allow
```

The frames export has one row per player per tenth of a second: `conceptId, playerId, frame, t, x, y`. It uses the same spline interpolation as the viewer, so it is a resampling of the waypoints, not tracking data. Frame 0 is the snap. A play whose tracks start before the snap also has negative frames, `-n` to `-1`, for all 22 players, so `(conceptId, playerId, frame)` stays unique; filter `frame >= 0` for the frames a play without a lead in always had.

### Movement checks

`bun run data:validate` checks every track against numbers in `src/engine/limits.ts`. Past the error line it fails; between the warn and the error line it warns.

| Check | Warn | Error |
|---|---|---|
| Speed over any tenth of a second | above 10.5 yd/s | above 12 yd/s |
| Speed change over half a second | above 12 yd/s² | above 16 yd/s² |
| More than one offensive player moving at the snap | | yes |
| An offensive player moving toward the line of scrimmage at the snap | | yes |
| A shift that ends less than a second before the snap | | yes |

The thresholds are this project's own, set against the rounded constants in `src/spec/calibration.ts`, not measured on tracking data. `bun run speed:report` lists every finding with the segments to edit.

A fast run needs an even pace on the viewer's curve, which gives each waypoint a speed from its neighbours without looking at their times. A short segment next to a long one is run too fast and the long one too slow, so a run at one speed wants waypoints a quarter second apart. `bun run retime <concept-id>` does the work for a player who is over a line: it slows the segments that are too fast, adds the in between waypoints, and prints what it would change (add `--write` to write it). `--player Z --lead-in` starts a player running before the snap: a set position, then a run that reaches the snap at speed. Read the beats after a write, since a later arrival can move them.

### Play checks

`data:validate` also fails a play whose text and tracks disagree (`src/schema/consistency.ts`):

- No offensive player stands past the line of scrimmage at or before the snap, and seven stand on it (a player moving at the snap is in motion, not on the line).
- A quarterback in the gun is at least 3.5 yd deep, a pistol quarterback is 3 to 5 yd deep, and one under center is no deeper than 2.5 yd. A back in the gun stands no more than 1.5 yd deeper than the quarterback.
- The personnel (`11`, `21P Pony`) names the backs and tight ends the play draws, and a front that names its secondary (`4-2-5`) draws that many defensive backs.

These checks skip a field that still starts with `TODO`, the placeholder a scaffolded play starts with.

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
