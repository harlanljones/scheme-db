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

`bun run specs:diff` still reports the distance to the hand-made tracks over the first 1.2 seconds (the disguise window), for information only. Today 12 of 66 players are within a yard. That number fell from 21 when the rush direction was fixed, since the hand-made rushers have the same error, and it should not be pushed back up.

Not done yet: the receiver speed profile still starts at top speed (v0 fitted it to the hand-made routes), and the pocket depths and zone timings are v0 values. They wait on calibration against real tracking data, and on a decision about which data may be used. A distribution check against NFL tracking aggregates comes after that.
