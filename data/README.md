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
| `coaches/<coach>.json` | coach | Profile, mentor and disciples, associated schemes |
| `lineages/<branch>.json` | lineage | A coaching tree as nested coach ids |
| `glossary/<term>.json` | term | Definition, aliases, category |
| `schema/*.schema.json` | record kind | JSON Schema; each record points at its schema through `$schema` |

Coordinates are yards relative to the line of scrimmage: `x` runs 0 to 53.33 across the field, `y` is negative in the offensive backfield and positive downfield.

## Working with the data

```
bun run data:validate        parse every record and run the cross-record checks
bun run data:format          rewrite every record in canonical formatting
bun run data:format --check  fail if any record is not canonical (CI runs this)
bun run data:schema          regenerate data/schema/*.schema.json
```

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
