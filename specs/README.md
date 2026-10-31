# Play specs

A spec describes a play the way a coach would: a formation, then one job per player. `bun run specs:compile` turns it into the timed waypoints that `data/tracks/` stores. This is compiler v0.2 and covers pass plays only: routes, pass sets, quarterback drops, pass rushes, zone drops and man coverage. Run plays (zone, gap and pull blocks, mesh and option reads) come next.

The three specs here are `illustrative` like the rest of the library. They are proofs that the format works, and they do not replace the hand-made tracks yet.

```yaml
# abridged: a real spec gives every player a job
$schema: ../../data/schema/spec.schema.json
conceptId: kelly-mesh-spacing-concept     # the concept in data/concepts/
duration: 3.2
formation: kelly-10p-tempo-spread-vs-nickel   # a record in data/formations/
offense:
  OL: { block: pass-set }                 # OL stands for every lineman in the formation
  QB: { drop: gun }
  H: { route: shallow, depth: 5 }
  Y: { route: shallow, depth: 6.5 }
defense:
  DL: { rush: interior }                  # DL stands for every defensive lineman
  NICKEL: { man: H }                      # man coverage follows its target's compiled path
  FS: { zone: deep-half, side: left }
overrides:                                # optional hand-made points for one player
  NICKEL:
    path:
      - { t: 2.6, x: 30.1, y: 5.4, note: Screened by X }
```

Every player in the formation needs exactly one job. A spec lives at `specs/<scheme>/<concept>.yaml`, names the formation its concept starts from, and may only use the vocabulary in `src/spec/vocabulary.ts`. Each term's definition is published in `data/schema/spec.schema.json`, so an editor that reads the `$schema` line completes and explains the terms as you type.

## Commands

```
bun run specs:check          parse, compile and validate every spec (CI runs this)
bun run specs:compile [dir]  write the compiled Tracks records, default dist/specs
bun run specs:diff           compare each compiled spec with the hand-made tracks it would replace
```

A compiled record carries `generatedFrom` (the sha256 of the spec file and the compiler version) and marks each player `origin: compiled`. A player with an override is marked `authored`.

## How the compiled tracks are checked

Compiled tracks are tested against football, not against the hand-made tracks, because the three hand-made plays carry errors the compiler should not copy: their pass rushers run downfield, away from the quarterback, and the Kelly offensive line walks downfield in pass protection. Two kinds of check run in `src/spec/__tests__/compile.test.ts`:

- **Physics.** No player exceeds a sprint speed no one reaches; blockers do not walk downfield past their start in pass protection; every rusher moves into the backfield and ends closer to the quarterback than he began; no two teammates share a spot.
- **Concept.** Each spec states what its concept teaches and the test asserts it: four verts puts four receivers 10 yards deep by 2.6 seconds with the seams inside the numbers and the safeties on opposite sides; mesh brings the two crossers within 2.5 yards of each other; slant-flat leaves the slant inside the flat defender at the throw.

`bun run specs:diff` still reports the distance to the hand-made tracks over the first 1.2 seconds (the disguise window), for information only. Today 3 of 66 players are within a yard: 21 before the rush direction was fixed, 12 after, 3 after the calibration below. It falls each time the compiler gets closer to real football, because the hand-made plays start receivers at top speed, run rushers downfield and keep the offensive line at the line of scrimmage. Do not tune the compiler to push it back up.

## Calibration and credit

The compiler's constants live in `src/spec/calibration.ts`. They are medians and fits from player tracking in the [NFL Big Data Bowl 2025](https://www.kaggle.com/competitions/nfl-big-data-bowl-2025) data (NFL Next Gen Stats, weeks 1 to 9 of the 2022 season, released by the NFL under CC BY-NC 4.0), rounded to one or two significant figures, plus coaching sources where the data cannot say (quarterback step counts, route angles). The tracking data itself is not in this repository, and neither are per-play measurements: only the rounded constants and a handful of published medians that the tests check. Credit for the data goes to the NFL and Next Gen Stats.

What the constants change, against compiler v0:

- Receivers start from rest after a 0.4 s first step and reach a top speed of about 7 yd/s (6.5 for tight ends, 6 for backs), instead of starting at top speed. A go route is about 2.7 yd downfield at 1.2 s and 19.6 at 3.8 s.
- Pass rushers get 5 to 6 yd into the backfield by 2 s, reaching the quarterback near the median time to pressure of 2.5 s. `depth` is now a cap, as if a blocker stopped the rusher.
- Offensive linemen retreat in pass protection, tackles about 4 yd by 2 s, and stop about a yard in front of the quarterback. A shotgun quarterback drops about 3 yd by 2 s.
- Zone defenders wait about 0.9 s, then close on the spot where the throw would land, at the same rate in every zone. Zone depths follow the data: deep halves and the middle at about 22 yd, quarters at 16 to 18, hooks at 9.
- Man defenders copy the receiver 0.4 s late and take 0.5 s to start closing. `cushion` is replaced by `technique` (`off`, `press`, `trail`).

Not applied yet: the offensive linemen's alignment in the formation presets (tackles are about a yard off the line, guards 0.9, the center 0.35, where the presets put them at 0.4), because that changes 17 formation records and the starting point of 63 plays; extra route terms for quick outs, hitches and wheels; coverage shells and rotations; the distribution check against NFL aggregates; and a report of how far compiled paths sit from real ones for the same labels. The run game is next.
