import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
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

  it('stays close to the hand-made tracks in the first 1.2 s (regression floor, not a claim of equality)', () => {
    let within = 0;
    let total = 0;
    let worst = 0;
    for (const { spec, tracks } of compiled) {
      const fit = compareTracks(tracks, dataset.tracks.find((t) => t.conceptId === spec.conceptId)!);
      within += fit.within;
      total += fit.total;
      worst = Math.max(worst, ...fit.players.map((p) => p.maxGapEarly));
    }
    expect(total).toBe(66);
    expect(within).toBeGreaterThanOrEqual(20);
    expect(worst).toBeLessThan(5);
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
    expect(xy(after, 'X', 1.2).x).toBeGreaterThan(xy(mesh.tracks, 'X', 1.2).x + 1);
    expect(xy(after, 'LCB', 1.2).x).toBeGreaterThan(xy(mesh.tracks, 'LCB', 1.2).x + 0.5);
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
});
