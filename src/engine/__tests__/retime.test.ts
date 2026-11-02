import { describe, expect, it } from 'vitest';
import { LIMITS } from '../limits';
import { densify, easeTrack, peakSpeed, retimeTrack, RETIME_PEAK, slowToCap, startEarlier } from '../retime';
import { accelerationProfile, snapMotion } from '../speed';
import type { PlayerTrack, Waypoint } from '../types';

const track = (waypoints: Waypoint[], side: PlayerTrack['side'] = 'offense'): PlayerTrack => ({ id: 'Z', label: 'Z', side, role: 'wr', trail: 'route', waypoints });
const wp = (t: number, x: number, y = -1, note?: string): Waypoint => ({ t, x, y, ...(note ? { note } : {}) });

describe('slowToCap', () => {
  it('pushes a too fast segment later and leaves a slow one where it was', () => {
    // 18 yd in 0.6 s is 30 yd/s; the next 4 yd in 2 s is slow.
    const out = slowToCap([wp(0, 46), wp(0.6, 28), wp(2.6, 24)], 9);
    expect(out[1].t).toBe(2);
    expect(out[2].t).toBe(2.6 + 0 > out[1].t + 4 / 9 ? 2.6 : out[1].t + 0.45);
    expect(out[2].t - out[1].t).toBeGreaterThanOrEqual(4 / 9 - 1e-9);
  });

  it('leaves a track that is already slow exactly as it is', () => {
    const slow = [wp(0, 30), wp(1, 34), wp(2, 38)];
    expect(slowToCap(slow, 9)).toEqual(slow);
  });

  it('never makes two waypoints share a time, even for a player who stands still', () => {
    const out = slowToCap([wp(0, 30), wp(0.2, 20), wp(0.4, 20), wp(0.6, 20)], 9);
    for (let i = 1; i < out.length; i++) expect(out[i].t).toBeGreaterThan(out[i - 1].t);
  });

  it('does not touch waypoints before the snap', () => {
    const before = [wp(-2, 46), wp(-1, 20), wp(0, 19)];
    expect(slowToCap(before, 9)).toEqual(before);
  });
});

describe('densify', () => {
  it('cuts a long segment into equal steps and keeps the waypoints it was given, notes included', () => {
    const out = densify([wp(0, 40, -1, 'start'), wp(1, 30, -1, 'end')]);
    expect(out.map((w) => w.t)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(out.map((w) => w.x)).toEqual([40, 37.5, 35, 32.5, 30]);
    expect([out[0].note, out[4].note]).toEqual(['start', 'end']);
    expect(out[2].note).toBeUndefined();
  });

  it('leaves a segment between two identical points whole', () => {
    expect(densify([wp(-1, 40), wp(0, 40)])).toHaveLength(2);
  });
});

describe('retimeTrack', () => {
  const sprint = track([wp(0, 40), wp(0.7, 30, 8), wp(1.4, 30, 20), wp(2.4, 30, 30)]);

  it('brings a track that runs 16 yd/s under the peak line on the viewer curve, with every waypoint where it was drawn', () => {
    expect(peakSpeed(sprint)).toBeGreaterThan(14);
    const out = retimeTrack(sprint)!;
    expect(out).toBeDefined();
    expect(peakSpeed({ waypoints: out })).toBeLessThanOrEqual(RETIME_PEAK);
    for (const original of sprint.waypoints) expect(out.some((w) => w.x === original.x && w.y === original.y)).toBe(true);
    for (let i = 1; i < out.length; i++) expect(out[i].t).toBeGreaterThan(out[i - 1].t);
    expect(out.at(-1)!.t).toBeGreaterThan(2.4);
  });
});

describe('startEarlier', () => {
  const jet = track([wp(0, 46, -1.5, 'Jet motion'), wp(0.6, 28, -2), wp(1.2, 16, -2), wp(2.2, 6, 0.5)]);

  it('starts the run before the snap, sets him first, and has him on the line he runs at the snap', () => {
    const out = startEarlier(jet)!;
    expect(out).toBeDefined();
    expect(out[0].t).toBeLessThan(-1);
    expect(out[0]).toMatchObject({ x: 46, y: -1.5, note: 'Set in the formation' });
    expect(out.filter((w) => w.t === 0)).toHaveLength(1);
    expect(out.find((w) => w.t === 0)!.note).toBe('In motion at the snap');
    // He stands still while he is set, then runs.
    expect(out.filter((w) => w.t < -1.5 && w.x === 46).length).toBeGreaterThan(0);
    const moving = { ...jet, waypoints: out };
    expect(snapMotion(moving).speed).toBeGreaterThan(5);
    expect(peakSpeed(moving)).toBeLessThanOrEqual(RETIME_PEAK);
  });

  it('speeds him up the way a person does, so no acceleration passes the warn line', () => {
    const out = startEarlier(jet)!;
    const worst = Math.max(...accelerationProfile({ ...jet, waypoints: out }).map((a) => Math.abs(a.acceleration)));
    expect(worst).toBeLessThanOrEqual(LIMITS.acceleration.warn);
  });

  it('does not let an offensive player in motion run toward the line of scrimmage', () => {
    const climbing = track([wp(0, 46, -4), wp(0.6, 30, -1), wp(1.2, 20, -1)]);
    const out = startEarlier(climbing)!;
    expect(snapMotion({ ...climbing, waypoints: out }).towardLine).toBeLessThanOrEqual(LIMITS.towardLineTolerance);
  });

  it('returns nothing for a first segment that is already slow', () => {
    expect(startEarlier(track([wp(0, 40), wp(1, 36), wp(2, 30)]))).toBeUndefined();
  });
});

describe('easeTrack', () => {
  // A sprint at 9 yd/s into a stop at the end of the track: a sack.
  const sack = track([wp(0, 26), wp(1, 26, 3), wp(2, 26, 12), wp(3, 26, 21), wp(3.3, 26, 21.4), wp(4, 26, 21.5)], 'defense');

  it('slows the approach until the stop is one a person can make, and only ever later', () => {
    const worst = (waypoints: Waypoint[]): number => Math.max(...accelerationProfile({ ...sack, waypoints }).map((a) => Math.abs(a.acceleration)));
    expect(worst(sack.waypoints)).toBeGreaterThan(LIMITS.acceleration.warn);
    const out = easeTrack(sack)!;
    expect(out).toBeDefined();
    expect(worst(out)).toBeLessThanOrEqual(LIMITS.acceleration.warn);
    sack.waypoints.forEach((original, i) => {
      expect(out[i].t).toBeGreaterThanOrEqual(original.t);
      expect([out[i].x, out[i].y]).toEqual([original.x, original.y]);
    });
  });

  it('does not make any segment faster than it was', () => {
    const out = easeTrack(sack)!;
    for (let i = 1; i < out.length; i++) {
      const before = Math.hypot(sack.waypoints[i].x - sack.waypoints[i - 1].x, sack.waypoints[i].y - sack.waypoints[i - 1].y) / (sack.waypoints[i].t - sack.waypoints[i - 1].t);
      const after = Math.hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y) / (out[i].t - out[i - 1].t);
      expect(after).toBeLessThanOrEqual(before + 1e-9);
    }
  });
});
