import { describe, expect, it } from 'vitest';
import { motionFindings, type MotionCheck } from '../motion';
import type { PlayerTrack } from '../types';

const track = (id: string, side: PlayerTrack['side'], waypoints: PlayerTrack['waypoints']): PlayerTrack => ({
  id,
  label: id,
  side,
  role: side === 'offense' ? 'wr' : 'db',
  trail: 'route',
  waypoints,
});

/**
 * A straight run along the x axis at `speed` yd/s with a waypoint every 0.2 s. The ends of a spline are clamped, and the
 * first and last segment of any track are drawn faster at their midpoint than their average, so the peak speed
 * `motionFindings` reports for these fixtures is 1.125 times `speed`.
 */
const lateral = (id: string, side: PlayerTrack['side'], speed: number, from: number, to: number, y = -2, x0 = 10): PlayerTrack => {
  const wp: PlayerTrack['waypoints'] = [];
  for (let k = Math.round(from * 5); k <= Math.round(to * 5); k++) wp.push({ t: k / 5 + 0, x: x0 + speed * (k / 5 - from), y });
  return track(id, side, wp);
};
const stand = (id: string, side: PlayerTrack['side'], x = 20, y = side === 'offense' ? -1 : 5, until = 3): PlayerTrack =>
  track(id, side, [{ t: 0, x, y }, { t: until, x, y }]);

const checks = (offense: PlayerTrack[], defense: PlayerTrack[] = []): [MotionCheck, string][] =>
  motionFindings({ offense, defense }).map((finding) => [finding.check, finding.level]);

describe('motionFindings: speed', () => {
  it('passes a player at a sprint below the warn line (8 yd/s, 9 at the clamped ends)', () => {
    expect(checks([lateral('Z', 'offense', 8, 0, 3)])).toEqual([]);
  });

  it('warns above 10.5 yd/s and errors above 12 yd/s', () => {
    expect(checks([lateral('Z', 'offense', 10, 0, 3)])).toEqual([['speed', 'warn']]);
    expect(checks([lateral('Z', 'offense', 11.5, 0, 3)])).toEqual([['speed', 'error']]);
  });

  it('applies to the defense too, and names the player and the moment', () => {
    const [finding] = motionFindings({ offense: [], defense: [lateral('SAM', 'defense', 16, 0, 1)] });
    expect(finding).toMatchObject({ check: 'speed', level: 'error', playerId: 'SAM' });
    expect(finding.message).toContain('SAM runs 18.0 yd/s');
    expect(finding.message).toContain('after the snap');
  });

  it('flags a jet man drawn from a standing start after the snap (the bug this work fixes)', () => {
    const jet = track('Z', 'offense', [{ t: 0, x: 46, y: -1.5 }, { t: 0.6, x: 28, y: -2 }, { t: 1.2, x: 16, y: -2 }, { t: 2.2, x: 6, y: 0.5 }]);
    expect(checks([jet])).toContainEqual(['speed', 'error']);
  });

  it('passes the same run drawn with a lead in at a believable speed', () => {
    const wp: PlayerTrack['waypoints'] = [];
    for (let k = -14; k <= 10; k++) wp.push({ t: k / 5, x: 46 - 6.5 * (k / 5 + 2.8), y: -1.5 });
    expect(checks([track('Z', 'offense', wp)])).not.toContainEqual(['speed', expect.anything()]);
  });
});

describe('motionFindings: acceleration', () => {
  it('passes a steady run and a gentle start', () => {
    const wp: PlayerTrack['waypoints'] = [];
    for (let k = 0; k <= 20; k++) wp.push({ t: k / 5, x: 10 + 1.2 * (k / 5) ** 2, y: 0 });
    expect(checks([track('Z', 'offense', wp)])).toEqual([]);
  });

  it('warns above 12 yd/s² and errors above 16 yd/s², over half a second', () => {
    // A constant acceleration `a` for 0.8 s from a standstill, then a steady run: position = a t² / 2.
    const sprint = (a: number): PlayerTrack => {
      const wp: PlayerTrack['waypoints'] = [];
      for (let k = 0; k <= 20; k++) {
        const t = k / 5;
        const x = t <= 0.8 ? (a / 2) * t * t : (a / 2) * 0.64 + a * 0.8 * (t - 0.8);
        wp.push({ t, x: 10 + x, y: 0 });
      }
      return track('Z', 'offense', wp);
    };
    const accelerations = (a: number) => motionFindings({ offense: [sprint(a)], defense: [] }).filter((finding) => finding.check === 'acceleration').map((finding) => finding.level);
    expect(accelerations(8)).toEqual([]);
    expect(accelerations(14)).toEqual(['warn']);
    expect(accelerations(22)).toEqual(['error']);
  });

  it('flags an abrupt stop from a sprint: deceleration counts too', () => {
    const wp: PlayerTrack['waypoints'] = [];
    for (let k = 0; k <= 10; k++) wp.push({ t: k / 5, x: 10 + 9 * (k / 5), y: 0 });
    for (let k = 11; k <= 20; k++) wp.push({ t: k / 5, x: 10 + 9 * 2 + 0.05 * (k - 10), y: 0 });
    const found = motionFindings({ offense: [track('Z', 'offense', wp)], defense: [] }).filter((finding) => finding.check === 'acceleration');
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain('slows down');
    expect(found[0].level).toBe('error');
  });
});

describe('motionFindings: moving at the snap', () => {
  const motion = (id: string, speed = 6) => lateral(id, 'offense', speed, -1.2, 1.2);

  it('allows one offensive player in motion', () => {
    expect(checks([motion('Z'), stand('X', 'offense'), stand('Y', 'offense')])).toEqual([]);
  });

  it('errors on more than one offensive player moving at the snap (two moving together is also a shift)', () => {
    expect(checks([motion('Z'), motion('H'), stand('X', 'offense')])).toEqual([
      ['moving-at-snap', 'error'],
      ['shift-to-snap', 'warn'],
    ]);
  });

  it('only warns when the second mover is on defense', () => {
    expect(checks([motion('Z')], [lateral('SS', 'defense', 4, -1, 1)])).toEqual([['moving-at-snap', 'warn']]);
  });

  it('does not count a player who is only creeping at the snap as moving', () => {
    expect(checks([motion('Z', 1), motion('H', 1)]).map(([check]) => check)).not.toContain('moving-at-snap');
  });

  it('counts a player whose track starts at the snap as standing still', () => {
    expect(checks([stand('Z', 'offense'), stand('H', 'offense')], [stand('SS', 'defense'), stand('FS', 'defense')])).toEqual([]);
  });
});

describe('motionFindings: motion toward the line of scrimmage', () => {
  it('errors on an offensive player running toward the line as the ball is snapped', () => {
    const toward = track('Z', 'offense', [{ t: -1, x: 20, y: -5 }, { t: -0.5, x: 20, y: -3.5 }, { t: 0, x: 20, y: -2 }, { t: 1, x: 20, y: 1 }]);
    expect(checks([toward])).toEqual([['motion-toward-line', 'error']]);
  });

  it('passes parallel motion and motion away from the line', () => {
    expect(checks([lateral('Z', 'offense', 6, -1.2, 1.2)])).toEqual([]);
    const away = track('Z', 'offense', [{ t: -1, x: 20, y: -1 }, { t: -0.5, x: 20, y: -2.5 }, { t: 0, x: 20, y: -4 }, { t: 1, x: 20, y: -6 }]);
    expect(checks([away])).toEqual([]);
  });

  it('does not apply to the defense', () => {
    const toward = track('SS', 'defense', [{ t: -1, x: 20, y: 9 }, { t: -0.5, x: 20, y: 7 }, { t: 0, x: 20, y: 5 }, { t: 1, x: 20, y: 3 }]);
    expect(checks([], [toward])).toEqual([]);
  });
});

describe('motionFindings: the gap between a shift and the snap', () => {
  const shifting = (id: string, endsAt: number) =>
    track(id, 'offense', [
      { t: -3, x: 20, y: -1 },
      { t: endsAt - 0.4, x: 20, y: -1 },
      { t: endsAt - 0.2, x: 21, y: -1 },
      { t: endsAt, x: 22, y: -1 },
      { t: 1, x: 22, y: -1 },
    ]);
  const settled = (shiftEnds: number) => [shifting('H', shiftEnds), shifting('Y', shiftEnds), stand('X', 'offense')];

  it('passes a shift that ends a full second before the snap', () => {
    expect(checks(settled(-1.5))).toEqual([]);
  });

  it('warns when two or more players are still moving less than a second before the snap', () => {
    expect(checks(settled(-0.4))).toEqual([['shift-to-snap', 'warn']]);
  });

  it('does not call one man in motion a shift', () => {
    expect(checks([lateral('Z', 'offense', 5, -3, 1), stand('X', 'offense'), stand('Y', 'offense')])).toEqual([]);
  });

  it('has nothing to say about a play with no time before the snap', () => {
    expect(checks([stand('X', 'offense'), stand('Y', 'offense')])).toEqual([]);
  });
});
