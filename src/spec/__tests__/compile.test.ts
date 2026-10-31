import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { positionAt } from '../../engine/interpolate';
import { validatePlay } from '../../engine/validate';
import { alignmentOverrides } from '../../schema/formations';
import { loadDataset } from '../../schema/load';
import type { Formation, Tracks } from '../../schema/schema';
import { validateDataset } from '../../schema/validate-dataset';
import { COMPILER_VERSION, compileSpec } from '../compile';
import { compareTracks } from '../diff';
import { Spec } from '../schema';
import type { Play } from '../../engine/types';

const SPEC_DIR = path.resolve(import.meta.dirname, '../../../specs');
const { dataset } = loadDataset();

const specFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? specFiles(path.join(dir, e.name)) : e.name.endsWith('.yaml') ? [path.join(dir, e.name)] : []));
const FILES = specFiles(SPEC_DIR).sort();

const formationOf = (id: string): Formation => dataset.formations.find((f) => f.id === id)!;
const load = (file: string) => {
  const text = fs.readFileSync(file, 'utf-8');
  return { spec: Spec.parse(parse(text)), hash: createHash('sha256').update(text).digest('hex') };
};
const compiled = FILES.map((file) => {
  const { spec, hash } = load(file);
  return { file, spec, hash, tracks: compileSpec(spec, formationOf(spec.formation), hash) };
});
const MIDFIELD_X = 26.67;
const mesh = compiled.find((c) => c.spec.conceptId === 'kelly-mesh-spacing-concept')!;
const xy = (tracks: Tracks, id: string, t: number): { x: number; y: number } => {
  const player = [...tracks.offense, ...tracks.defense].find((p) => p.id === id)!;
  return player.waypoints.find((w) => w.t === t)!;
};

describe('play specs', () => {
  it('ships three specs', () => {
    expect(compiled.map((c) => c.spec.conceptId)).toEqual([
      'kelly-four-verts-takeover',
      'kelly-mesh-spacing-concept',
      'payton-slant-flat-rhythm',
    ]);
  });

  it('compiles every spec to tracks that pass the geometry checks and the dataset checks', () => {
    for (const { spec, tracks } of compiled) {
      const concept = dataset.concepts.find((c) => c.id === spec.conceptId)!;
      const play = { ...concept, duration: tracks.duration, offense: tracks.offense, defense: tracks.defense, sequence: concept.relations } as unknown as Play;
      expect(validatePlay(play), spec.conceptId).toEqual([]);
      const swapped = { ...dataset, tracks: dataset.tracks.map((t) => (t.conceptId === spec.conceptId ? tracks : t)) };
      expect(validateDataset(swapped).errors, spec.conceptId).toEqual([]);
    }
  });

  it('is deterministic and records where the tracks came from', () => {
    for (const { spec, hash, tracks } of compiled) {
      expect(compileSpec(spec, formationOf(spec.formation), hash)).toEqual(tracks);
      expect(tracks.generatedFrom).toEqual({ spec: hash, compiler: COMPILER_VERSION });
      expect(tracks.offense.concat(tracks.defense).every((p) => p.origin === 'compiled')).toBe(true);
    }
  });

  it('starts every player exactly on the formation preset', () => {
    for (const { spec, tracks } of compiled) {
      expect(alignmentOverrides(formationOf(spec.formation), tracks), spec.conceptId).toEqual([]);
    }
  });

  it('lives where its concept says', () => {
    for (const { file, spec } of compiled) {
      const concept = dataset.concepts.find((c) => c.id === spec.conceptId)!;
      expect(concept.formationId).toBe(spec.formation);
      expect(path.relative(SPEC_DIR, file).split(path.sep).join('/')).toBe(`${concept.schemeId}/${concept.id}.yaml`);
    }
  });

  it('compares against the hand-made tracks without gating on them (they carry known errors; see specs/README.md)', () => {
    let total = 0;
    for (const { spec, tracks } of compiled) total += compareTracks(tracks, dataset.tracks.find((t) => t.conceptId === spec.conceptId)!).total;
    expect(total).toBe(66);
  });
});

const everyTrack = (tracks: Tracks) => [...tracks.offense, ...tracks.defense];
const at = (tracks: Tracks, id: string, t: number) => positionAt(everyTrack(tracks).find((p) => p.id === id)!, t);
const timesTo = (duration: number): number[] => Array.from({ length: Math.floor(duration * 10 + 1e-9) + 1 }, (_, i) => i / 10);
const tracksOf = (conceptId: string): Tracks => compiled.find((c) => c.spec.conceptId === conceptId)!.tracks;

// Gate A: physics. Hard limits that hold for any football play, not a fit to anyone's data.
describe('compiled tracks obey physics', () => {
  const MAX_SPEED_YARDS_PER_SECOND = 11;

  it('keeps every player at or below a sprint speed no NFL player reaches', () => {
    for (const { spec, tracks } of compiled) {
      for (const player of everyTrack(tracks)) {
        let previous = positionAt(player, 0);
        for (const t of timesTo(tracks.duration).slice(1)) {
          const next = positionAt(player, t);
          const speed = Math.hypot(next.x - previous.x, next.y - previous.y) * 10;
          expect(speed, `${spec.conceptId} ${player.id} at ${t}s`).toBeLessThan(MAX_SPEED_YARDS_PER_SECOND);
          previous = next;
        }
      }
    }
  });

  it('keeps blockers from walking downfield past their start in pass protection', () => {
    for (const { spec, tracks } of compiled) {
      for (const player of tracks.offense.filter((p) => p.role === 'ol')) {
        const start = positionAt(player, 0);
        for (const t of timesTo(tracks.duration)) expect(positionAt(player, t).y, `${spec.conceptId} ${player.id} at ${t}s`).toBeLessThanOrEqual(start.y + 0.5);
      }
    }
  });

  it('sends every rusher into the backfield, no deeper than his cap, and an uncapped rusher ends closer to the quarterback', () => {
    for (const { spec, tracks } of compiled) {
      for (const [id, job] of Object.entries(spec.defense)) {
        if (!('rush' in job)) continue;
        // The waypoints, not the spline between them: Catmull-Rom can overshoot by a few hundredths of a yard where a rusher starts moving.
        const { waypoints } = tracks.defense.find((p) => p.id === id)!;
        waypoints.slice(1).forEach((w, i) => expect(w.y, `${spec.conceptId} ${id} at ${w.t}s`).toBeLessThanOrEqual(waypoints[i].y));
        if (job.depth !== undefined) {
          expect(waypoints[0].y - waypoints[waypoints.length - 1].y, `${spec.conceptId} ${id} cap`).toBeLessThanOrEqual(job.depth + 0.01);
          continue;
        }
        const gap = (t: number) => {
          const rusher = at(tracks, id, t);
          const qb = at(tracks, 'QB', t);
          return Math.hypot(rusher.x - qb.x, rusher.y - qb.y);
        };
        expect(gap(tracks.duration), `${spec.conceptId} ${id}`).toBeLessThan(gap(0));
      }
    }
  });

  it('never puts two teammates on the same spot', () => {
    for (const { spec, tracks } of compiled) {
      for (const side of ['offense', 'defense'] as const) {
        const players = tracks[side];
        for (const t of timesTo(tracks.duration)) {
          for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
              const a = positionAt(players[i], t);
              const b = positionAt(players[j], t);
              expect(Math.hypot(a.x - b.x, a.y - b.y), `${spec.conceptId} ${players[i].id}/${players[j].id} at ${t}s`).toBeGreaterThanOrEqual(0.5);
            }
          }
        }
      }
    }
  });
});

// Gate C: concept assertions. What the concept is supposed to teach, stated once per spec.
describe('compiled tracks still teach their concept', () => {
  const NUMBERS_X = [12, 41.33];

  it('four verts: all four receivers are 10 yards deep by 2.6 s, the seams stay inside the numbers, and the two safeties split the middle', () => {
    const tracks = tracksOf('kelly-four-verts-takeover');
    for (const id of ['X', 'H', 'Y', 'Z']) expect(at(tracks, id, 2.6).y, id).toBeGreaterThanOrEqual(10);
    for (const id of ['H', 'Y']) {
      const { x } = at(tracks, id, 2.6);
      expect(x, id).toBeGreaterThan(NUMBERS_X[0]);
      expect(x, id).toBeLessThan(NUMBERS_X[1]);
    }
    expect(at(tracks, 'FS', 2.6).x).toBeLessThan(MIDFIELD_X);
    expect(at(tracks, 'SS', 2.6).x).toBeGreaterThan(MIDFIELD_X);
  });

  it('mesh: the two shallow crossers bring their paths within 2.5 yards of each other', () => {
    // The stronger form, crossing within 2 yd at 1.4-2.0 s as real mesh does, waits on the receiver speed profile.
    const tracks = tracksOf('kelly-mesh-spacing-concept');
    const closest = Math.min(
      ...timesTo(tracks.duration).map((t) => {
        const h = at(tracks, 'H', t);
        const y = at(tracks, 'Y', t);
        return Math.hypot(h.x - y.x, h.y - y.y);
      }),
    );
    expect(closest).toBeLessThan(2.5);
    for (const id of ['H', 'Y']) expect(at(tracks, id, tracks.duration).y, id).toBeLessThan(8);
  });

  it('slant-flat: at the throw the slant is inside the defender who carries the flat', () => {
    const tracks = tracksOf('payton-slant-flat-rhythm');
    const z = at(tracks, 'Z', tracks.duration);
    const flatDefender = at(tracks, 'NICKEL', tracks.duration);
    expect(Math.abs(z.x - MIDFIELD_X)).toBeLessThan(Math.abs(flatDefender.x - MIDFIELD_X));
    expect(z.y).toBeGreaterThan(at(tracks, 'H', tracks.duration).y);
  });
});

describe('Spec schema', () => {
  const base = () => structuredClone(load(FILES[0]).spec);

  it('rejects a route that is not in the vocabulary', () => {
    const spec = base();
    (spec.offense as Record<string, unknown>).X = { route: 'banana' };
    expect(Spec.safeParse(spec).success).toBe(false);
  });

  it('rejects unknown keys on a job', () => {
    const spec = base();
    (spec.offense as Record<string, unknown>).X = { route: 'go', speed: 9 };
    expect(Spec.safeParse(spec).success).toBe(false);
  });

  it('rejects a job that mixes two kinds of action', () => {
    const spec = base();
    (spec.offense as Record<string, unknown>).X = { route: 'go', block: 'pass-set' };
    expect(Spec.safeParse(spec).success).toBe(false);
  });
});

describe('compileSpec', () => {
  const { spec, hash } = load(FILES[0]);
  const formation = formationOf(spec.formation);
  const compile = (change: (s: Spec) => void) => {
    const copy = structuredClone(spec);
    change(copy);
    return compileSpec(copy, formation, hash);
  };

  it('expands OL to the five linemen', () => {
    const lineman = compile(() => undefined).offense.filter((p) => p.role === 'ol');
    expect(lineman.map((p) => p.id).sort()).toEqual(['C', 'LG', 'LT', 'RG', 'RT']);
    expect(lineman.every((p) => p.trail === 'block')).toBe(true);
  });

  it('refuses a spec that leaves a player without a job', () => {
    expect(() => compile((s) => delete s.offense.Z)).toThrow(/no job for Z/);
  });

  it('refuses a player the formation does not have', () => {
    expect(() => compile((s) => ((s.offense as Record<string, unknown>).Q = { route: 'go' }))).toThrow(/"Q" is not a player/);
  });

  it('refuses a player with two jobs', () => {
    expect(() => compile((s) => ((s.offense as Record<string, unknown>).LT = { block: 'pass-set' }))).toThrow(/"LT" is given more than one job/);
  });

  it('refuses a man target that is not on offense', () => {
    expect(() => compile((s) => ((s.defense as Record<string, unknown>).NICKEL = { man: 'FS' }))).toThrow(/not an offensive player/);
  });

  it('refuses a zone side that does not exist', () => {
    expect(() => compile((s) => ((s.defense as Record<string, unknown>).MIKE = { zone: 'flat', side: 'middle' }))).toThrow(/no "middle" side/);
  });

  it('refuses a formation that is not the one the spec names', () => {
    expect(() => compileSpec(spec, formationOf('payton-11p-gun-spread-vs-nickel'), hash)).toThrow(/names formation/);
  });

  it('compiles man coverage relative to its target, so changing the route moves the defender', () => {
    const { spec: meshSpec, hash: meshHash } = load(mesh.file);
    const formationForMesh = formationOf(meshSpec.formation);
    const changed = structuredClone(meshSpec);
    (changed.offense as Record<string, unknown>).X = { route: 'slant' };
    const after = compileSpec(changed, formationForMesh, meshHash);
    expect(xy(after, 'X', 2).x).toBeGreaterThan(xy(mesh.tracks, 'X', 2).x + 1);
    expect(xy(after, 'LCB', 2).x).toBeGreaterThan(xy(mesh.tracks, 'LCB', 2).x + 0.5);
  });

  it('merges overrides after the compile and marks that player authored', () => {
    const tracks = compile((s) => {
      s.overrides = { NICKEL: { path: [{ t: 1.2, x: 30, y: 5, note: 'rub' }, { t: 1.3, x: 31, y: 5 }] } };
    });
    const nickel = tracks.defense.find((p) => p.id === 'NICKEL')!;
    expect(nickel.origin).toBe('authored');
    expect(nickel.waypoints.find((w) => w.t === 1.2)).toEqual({ t: 1.2, x: 30, y: 5, note: 'rub' });
    expect(nickel.waypoints.find((w) => w.t === 1.3)).toEqual({ t: 1.3, x: 31, y: 5 });
    expect(nickel.waypoints.map((w) => w.t)).toEqual([...nickel.waypoints.map((w) => w.t)].sort((a, b) => a - b));
    expect(tracks.defense.find((p) => p.id === 'FS')!.origin).toBe('compiled');
  });

  it('refuses an override for a player that is not in the formation', () => {
    expect(() => compile((s) => (s.overrides = { Q: { path: [{ t: 1, x: 1, y: 1 }] } }))).toThrow(/overrides: "Q"/);
  });

  const heading = (tracks: Tracks, id: string, from: number, to: number): number => {
    const a = at(tracks, id, from);
    const b = at(tracks, id, to);
    return (Math.atan2(Math.abs(b.x - a.x), b.y - a.y) * 180) / Math.PI;
  };

  it('runs a go route straight upfield with no lateral drift', () => {
    const tracks = compile(() => undefined);
    for (const id of ['X', 'Z']) expect(at(tracks, id, 3).x, id).toBeCloseTo(at(tracks, id, 0).x, 1);
  });

  it('cuts a slant at about 50 degrees after a stem of about 3 yards', () => {
    const tracks = compile((s) => {
      (s.offense as Record<string, unknown>).X = { route: 'slant' };
    });
    const start = at(tracks, 'X', 0);
    const times = timesTo(tracks.duration);
    const stemmed = times.filter((t) => at(tracks, 'X', t).y - start.y < 2.5);
    expect(stemmed.length).toBeGreaterThan(0);
    for (const t of stemmed) expect(Math.abs(at(tracks, 'X', t).x - start.x), `at ${t}s`).toBeLessThan(0.1);
    const brokenAt = times.find((t) => Math.abs(at(tracks, 'X', t).x - start.x) > 0.5)!;
    expect(heading(tracks, 'X', brokenAt, brokenAt + 1)).toBeGreaterThan(45);
    expect(heading(tracks, 'X', brokenAt, brokenAt + 1)).toBeLessThan(55);
  });

  it('keeps a swing behind the line of scrimmage', () => {
    const tracks = compile((s) => {
      (s.offense as Record<string, unknown>).RB = { route: 'swing', side: 'left' };
    });
    for (const t of timesTo(tracks.duration)) expect(at(tracks, 'RB', t).y).toBeLessThan(0);
  });

  it('moves rushers into the backfield, edges drifting toward the quarterback', () => {
    const tracks = compile(() => undefined);
    const end = tracks.duration;
    for (const id of ['WDE', 'NT', '3T', 'SDE']) expect(at(tracks, id, end).y, id).toBeLessThan(at(tracks, id, 0).y);
    expect(at(tracks, 'WDE', end).x).toBeGreaterThan(at(tracks, 'WDE', 0).x);
    expect(at(tracks, 'SDE', end).x).toBeLessThan(at(tracks, 'SDE', 0).x);
    expect(at(tracks, 'NT', end).x).toBeCloseTo(at(tracks, 'NT', 0).x, 5);
  });

  it('refuses two defenders in the same deep zone and side, and allows them in different sides', () => {
    expect(() =>
      compile((s) => {
        (s.defense as Record<string, unknown>).FS = { zone: 'quarter-inside', side: 'right' };
      }),
    ).toThrow(/quarter-inside\/right is already covered by SS/);
    expect(() => compile(() => undefined)).not.toThrow();
  });

  it('gives the middle hole no sides and the hook-curl a left and a right', () => {
    expect(() =>
      compile((s) => {
        (s.defense as Record<string, unknown>).MIKE = { zone: 'hole', side: 'left' };
      }),
    ).toThrow(/has no "left" side/);
  });

  // Medians from NFL Big Data Bowl 2025 (weeks 1-9 of 2022), rounded; see src/spec/calibration.ts. Tolerances are loose on purpose.
  describe('calibration against published medians', () => {
    const tracks = compile(() => undefined);
    const run = (id: string, t: number) => {
      const start = at(tracks, id, 0);
      const now = at(tracks, id, t);
      return { x: now.x - start.x, y: now.y - start.y };
    };

    it('starts a go route from rest: about 0.7 yd after 0.7 s, 2.7 after 1.2 s, 7.6 after 2.0 s, 19.6 after 3.8 s', () => {
      const medians: [number, number, number][] = [[0.7, 0.7, 0.5], [1.2, 2.7, 0.6], [2, 7.6, 0.8], [3.8, 19.6, 1.2]];
      for (const [t, yards, tolerance] of medians) expect(Math.abs(run('X', t).y - yards), `${t}s`).toBeLessThan(tolerance);
    });

    it('drops a shotgun quarterback about 3 yd by 2 s', () => {
      expect(Math.abs(run('QB', 2).y + 3)).toBeLessThan(0.5);
    });

    it('retreats a tackle about 4 yd by 2 s and a center about 3 yd', () => {
      expect(Math.abs(run('LT', 2).y + 4.1)).toBeLessThan(0.5);
      expect(Math.abs(run('C', 2).y + 3.2)).toBeLessThan(0.5);
    });

    it('puts an edge rusher about 6 yd into the backfield by 2 s, drifting about 2 yd toward the quarterback', () => {
      const uncapped = compile((s) => {
        (s.defense as Record<string, unknown>).WDE = { rush: 'edge' };
      });
      const wde = (t: number) => ({ x: at(uncapped, 'WDE', t).x - at(uncapped, 'WDE', 0).x, y: at(uncapped, 'WDE', t).y - at(uncapped, 'WDE', 0).y });
      expect(Math.abs(wde(2).y + 5.8)).toBeLessThan(0.7);
      expect(Math.abs(wde(2.5).x - 2.7)).toBeLessThan(0.7);
    });

    it('moves zone defenders about half of the way to their spot by 2 s', () => {
      const mike = at(tracks, 'MIKE', 0);
      const share = (t: number) => (at(tracks, 'MIKE', t).y - mike.y) / (9 - mike.y);
      expect(share(2)).toBeGreaterThan(0.43);
      expect(share(2)).toBeLessThan(0.62);
    });
  });
});
