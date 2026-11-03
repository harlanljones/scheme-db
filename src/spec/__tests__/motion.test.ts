import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { leadIn, snapIndex } from '../../engine/presnap';
import { motionFindings } from '../../engine/motion';
import { loadDataset } from '../../schema/load';
import { Tracks } from '../../schema/schema';
import { validateDataset } from '../../schema/validate-dataset';
import { compileSpec } from '../compile';
import { Spec } from '../schema';

const { dataset } = loadDataset();
const file = path.resolve(import.meta.dirname, '../../../specs/kelly-tempo-spread/kelly-four-verts-takeover.yaml');
const text = fs.readFileSync(file, 'utf-8');
const base = parse(text) as Record<string, any>;
const formation = dataset.formations.find((f) => f.id === base.formation)!;
const hash = createHash('sha256').update(text).digest('hex');

// Y lines up at [37, -1]. A jet man runs from there to [31, -1] in 1.2 s: 5 yd/s toward the middle.
const withMotion = (motion: Record<string, unknown>, route: Record<string, unknown> = { route: 'flat' }) =>
  Spec.parse({ ...base, offense: { ...base.offense, Y: { ...route, motion } } });
const compile = (motion: Record<string, unknown>, route?: Record<string, unknown>) => compileSpec(withMotion(motion, route), formation, hash);
const Y = (tracks: ReturnType<typeof compile>) => tracks.offense.find((p) => p.id === 'Y')!;

describe('spec motion (compiler 0.4.0)', () => {
  const motion = { from: [37, -1], to: [31, -1], seconds: 1.2 };

  it('compiles to waypoints that end at the snap at a constant speed', () => {
    const waypoints = Y(compile(motion)).waypoints;
    const pre = waypoints.filter((w) => w.t < 0);
    expect(pre[0]).toMatchObject({ t: -1.2, x: 37, y: -1 });
    expect(pre.map((w) => w.t)).toEqual([-1.2, -1, -0.8, -0.6, -0.4, -0.2]);
    const steps = pre.slice(1).map((w, i) => w.x - pre[i].x);
    for (const step of steps.slice(0, -1)) expect(step).toBeCloseTo(-1, 2);
    expect(waypoints[pre.length]).toMatchObject({ t: 0, x: 31, y: -1 });
  });

  it('puts a waypoint at the snap and a lead in on the play, and passes the schema', () => {
    const tracks = compile(motion);
    expect(snapIndex(Y(tracks))).toBeGreaterThan(0);
    expect(leadIn([...tracks.offense, ...tracks.defense])).toBe(1.2);
    expect(Tracks.safeParse(tracks).success).toBe(true);
  });

  it('keeps every other player exactly where the compiler would have put him without motion', () => {
    const plain = compileSpec(Spec.parse({ ...base, offense: { ...base.offense, Y: { route: 'flat' } } }), formation, hash);
    const moved = compile(motion);
    for (const side of ['offense', 'defense'] as const) {
      for (const player of moved[side].filter((p) => p.id !== 'Y' && p.id !== 'NICKEL')) {
        expect(player.waypoints, player.id).toEqual(plain[side].find((p) => p.id === player.id)!.waypoints);
      }
    }
  });

  it('carries the speed of the motion into the route instead of restarting from rest', () => {
    const tracks = compile(motion);
    const speeds = Y(tracks).waypoints.filter((w) => w.t >= -0.4 && w.t <= 0.6);
    const step = (i: number) => Math.hypot(speeds[i + 1].x - speeds[i].x, speeds[i + 1].y - speeds[i].y) / 0.2;
    for (let i = 0; i < speeds.length - 1; i++) expect(step(i), `step ${i}`).toBeGreaterThan(3);
  });

  it('has the defender cover the man where he is at the snap and still line up on his preset', () => {
    const tracks = compile(motion);
    const nickel = tracks.defense.find((p) => p.id === 'NICKEL')!;
    const preset = formation.defense.NICKEL;
    expect(nickel.waypoints[0]).toMatchObject({ t: 0, x: preset.x, y: preset.y });
  });

  it('produces no movement finding for a believable motion', () => {
    const tracks = compile(motion);
    expect(motionFindings(tracks)).toEqual([]);
  });

  it('fails with a clear message when the motion is faster than a person runs', () => {
    expect(() => compile({ from: [37, -1], to: [13, -1], seconds: 1.2 })).toThrow(/20 yd\/s, faster than a person runs \(10.5 yd\/s\)/);
  });

  it('refuses a start that is not where the formation lines him up', () => {
    expect(() => compile({ from: [40, -1], to: [31, -1], seconds: 1.5 })).toThrow(/formation lines him up at \[37, -1\]/);
  });

  it('offers motion on routes only, and refuses it for a player told to wait after the snap', () => {
    for (const job of [{ block: 'pass-set' }, { drop: 'gun' }]) {
      expect(() => Spec.parse({ ...base, offense: { ...base.offense, RB: { ...job, motion } } })).toThrow();
    }
    expect(() => compile(motion, { route: 'flat', delay: 0.4 })).toThrow(/cannot also wait after the snap/);
  });

  it('rejects more than six seconds of motion at the schema', () => {
    expect(() => withMotion({ from: [37, -1], to: [31, -1], seconds: 6.5 })).toThrow();
  });

  it('keeps the compiled specs under the speed line', () => {
    const tracks = compile(motion);
    const swapped = { ...dataset, tracks: dataset.tracks.map((t) => (t.conceptId === base.conceptId ? tracks : t)) };
    expect(validateDataset(swapped).errors).toEqual([]);
  });
});

describe('spec overrides before the snap', () => {
  it('allows a negative time in an override and keeps the snap waypoint the compiler made', () => {
    const spec = Spec.parse({
      ...base,
      overrides: { H: { path: [{ t: -1, x: 16.5, y: -1 }, { t: -0.5, x: 16.5, y: -1.5, note: 'Settles' }] } },
    });
    const tracks = compileSpec(spec, formation, hash);
    const h = tracks.offense.find((p) => p.id === 'H')!;
    expect(h.waypoints[0]).toMatchObject({ t: -1 });
    expect(h.origin).toBe('authored');
    expect(snapIndex(h)).toBeGreaterThan(0);
    expect(Tracks.safeParse(tracks).success).toBe(true);
  });
});
