import { describe, expect, it } from 'vitest';
import { LIMITS } from '../limits';
import { ACCELERATION_WINDOW_SECONDS, SPEED_STEP_SECONDS, accelerationProfile, snapMotion, speedProfile } from '../speed';
import type { PlayerTrack } from '../types';

const track = (waypoints: PlayerTrack['waypoints']): PlayerTrack => ({ id: 'Z', label: 'Z', side: 'offense', role: 'wr', trail: 'route', waypoints });

/** A straight run at `speed` yd/s along the field, one waypoint every 0.2 s so the spline keeps the speed constant. */
const cruise = (speed: number, from: number, to: number, y = 0): PlayerTrack['waypoints'] => {
  const out: PlayerTrack['waypoints'] = [];
  for (let t = from; t <= to + 1e-9; t += 0.2) out.push({ t: Math.round(t * 10) / 10, x: 10 + speed * (t - from), y });
  return out;
};

describe('speedProfile', () => {
  it('steps in tenths of a second', () => {
    expect(SPEED_STEP_SECONDS).toBe(0.1);
  });

  it('returns the speed of a constant speed run at every step, from the first step to the last', () => {
    const run = track(cruise(8, 0, 2));
    const profile = speedProfile(run);
    expect(profile).toHaveLength(20);
    expect(profile[0].t).toBe(0.1);
    expect(profile.at(-1)!.t).toBe(2);
    // The ends of a spline are clamped, so the first and last steps run slower; the interior is exact.
    for (const sample of profile.slice(2, -2)) expect(sample.speed).toBeCloseTo(8, 6);
  });

  it('covers time before the snap on the same grid', () => {
    const run = track([...cruise(6, -1, -0.2), { t: 0, x: 10 + 6, y: 0 }, { t: 0.2, x: 10 + 7.2, y: 0 }]);
    const profile = speedProfile(run);
    expect(profile[0].t).toBe(-0.9);
    expect(profile.some((sample) => sample.t === 0)).toBe(true);
    expect(profile.find((sample) => sample.t === -0.5)!.speed).toBeCloseTo(6, 6);
  });

  it('returns nothing for a player who never moves from one waypoint', () => {
    expect(speedProfile(track([{ t: 0, x: 5, y: 5 }]))).toEqual([]);
  });

  it('reads a track that teleports as a very fast one', () => {
    const jump = track([{ t: 0, x: 40, y: 0 }, { t: 0.6, x: 22, y: 0 }]);
    expect(Math.max(...speedProfile(jump).map((sample) => sample.speed))).toBeGreaterThan(LIMITS.speed.error);
  });
});

describe('accelerationProfile', () => {
  it('measures over half a second', () => {
    expect(ACCELERATION_WINDOW_SECONDS).toBe(0.5);
  });

  it('is zero for a constant speed run', () => {
    const profile = accelerationProfile(track(cruise(8, 0, 4)));
    expect(profile.length).toBeGreaterThan(0);
    for (const sample of profile.slice(3, -3)) expect(Math.abs(sample.acceleration)).toBeLessThan(0.01);
  });

  it('sees a steady speed up: positive, and about the change in speed over the change in time', () => {
    // Speed rises 3 yd/s per second: position = 1.5 t².
    const wp: PlayerTrack['waypoints'] = [];
    for (let t = 0; t <= 3 + 1e-9; t += 0.2) wp.push({ t: Math.round(t * 10) / 10, x: 1.5 * t * t, y: 0 });
    const profile = accelerationProfile(track(wp));
    const middle = profile.find((sample) => sample.t === 2)!;
    expect(middle.acceleration).toBeGreaterThan(2.5);
    expect(middle.acceleration).toBeLessThan(3.5);
  });

  it('stays out of the clamped time after the track ends', () => {
    const profile = accelerationProfile(track(cruise(8, 0, 2)));
    expect(profile.at(-1)!.t).toBeLessThanOrEqual(2);
  });

  it('needs at least a second of track', () => {
    expect(accelerationProfile(track(cruise(8, 0, 0.8)))).toEqual([]);
  });
});

describe('snapMotion', () => {
  it('is zero for a player whose track starts at the snap', () => {
    expect(snapMotion(track(cruise(8, 0, 2)))).toEqual({ speed: 0, towardLine: 0 });
  });

  it('reports the speed and the direction of a man in motion as the ball is snapped', () => {
    const lateral = track([...cruise(6, -1.2, -0.2, -2), { t: 0, x: 10 + 7.2, y: -2 }, { t: 1, x: 10 + 13, y: -2 }]);
    const lateralMotion = snapMotion(lateral);
    expect(lateralMotion.speed).toBeGreaterThan(5);
    expect(lateralMotion.towardLine).toBeCloseTo(0, 6);

    const forward = track([{ t: -1, x: 20, y: -5 }, { t: -0.5, x: 20, y: -3 }, { t: 0, x: 20, y: -1 }, { t: 1, x: 20, y: 3 }]);
    expect(snapMotion(forward).towardLine).toBeGreaterThan(LIMITS.towardLineTolerance);
  });
});
