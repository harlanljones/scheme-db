# Play specs

A spec describes a play the way a coach would: a formation, then one job per player. `bun run specs:compile` turns it into the timed waypoints that `data/tracks/` stores. This is compiler v0 and covers pass plays only: routes, pass sets, quarterback drops, pass rushes, zone drops and man coverage. Run plays (zone, gap and pull blocks, mesh and option reads) come next.

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

## How well it matches the hand-made tracks

`bun run specs:diff` measures the largest distance between compiled and hand-made paths over the first 1.2 seconds (the disguise window). On the three specs, 21 of 66 players stay within a yard, 41 within two and 61 within three. The speed and zone-drop constants are fitted to the hand-made plays. Quarterbacks, linebackers and defensive linemen fit best (median gap about a yard or less), defensive backs and receivers next (about 1.3 and 1.9 yards). Offensive linemen fit worst (median 2.6 yards) because the hand-made Kelly plays move the line downfield during pass protection, which the pass-set template does not do. The v0 goal of about a yard for every player is not met, and `src/spec/__tests__/compile.test.ts` pins the current fit as a floor so it can only improve.
