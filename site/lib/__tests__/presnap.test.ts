import { describe, expect, it } from 'vitest';
import { describeField, describePresnap } from '../describe';
import { fieldWindow, firstMotionAt, movingAt, type LitePlay, type LiteTrack } from '../field';
import { beforeSnap, clockShort, clockTenths, clockWords } from '../format';
import { library, litePlay } from '../data';

/** A play whose Z starts 2.0 s before the snap, stands set for the first 0.4 s, and jets across at 6 yd/s from then on. */
const track = (id: string, side: LiteTrack['side'], w: LiteTrack['w']): LiteTrack => ({ id, side, role: side === 'offense' ? 'wr' : 'db', w });
const jet = (): LitePlay => {
  const z: LiteTrack['w'] = [[-2, 46, -1.5], [-1.6, 46, -1.5]];
  for (let t = -1.4; t <= 0 + 1e-9; t += 0.2) z.push([Math.round(t * 10) / 10, 46 - 6 * (t + 1.6), -1.5]);
  z.push([1, 28, -1.5]);
  return {
    id: 'demo',
    name: 'Demo',
    duration: 1,
    leadIn: 2,
    level: 'nfl',
    spot: 'middle',
    scored: 'offense',
    tracks: [track('Z', 'offense', z), track('X', 'offense', [[0, 7, -0.5], [1, 7, 4]]), track('FS', 'defense', [[0, 26.67, 12], [1, 26.67, 12]])],
  };
};

describe('the clock before the snap', () => {
  it('reads a time after the snap, before it, and never -0.0', () => {
    expect(clockWords(1.2)).toBe('1.2 seconds after the snap');
    expect(clockWords(-1)).toBe('1.0 seconds before the snap');
    expect(clockWords(0)).toBe('0.0 seconds after the snap');
    expect(clockWords(-0.04)).toBe('0.0 seconds after the snap');
    expect(clockShort(-0.04)).toBe('0.0 s');
    expect(clockShort(-1.5)).toBe('1.5 s before the snap');
    expect(clockTenths(-0.04)).toBe('0.0');
    expect(beforeSnap(-0.06)).toBe(true);
    expect(beforeSnap(-0.04)).toBe(false);
  });

  it('says so in the text alternative of a field', () => {
    const play = jet();
    expect(describeField({ play, t: -1 })).toContain('Demo, 1.0 seconds before the snap.');
    expect(describeField({ play, t: 0.5 })).toContain('Demo, 0.5 seconds after the snap.');
  });
});

describe('who is moving before the snap', () => {
  it('finds the players moving at a time and the first moment anyone moves', () => {
    const play = jet();
    expect(movingAt(play, -1.9)).toEqual([]);
    expect(movingAt(play, -0.8)).toEqual(['Z']);
    // The spline starts creeping a tenth of a second before the first waypoint that moves, so the first motion is near -1.6, not exactly on it.
    expect(firstMotionAt(play)!).toBeGreaterThanOrEqual(-1.8);
    expect(firstMotionAt(play)!).toBeLessThanOrEqual(-1.5);
  });

  it('reads the live line: set, in motion, shifting, moving on defense', () => {
    const play = jet();
    expect(describePresnap(play, -1.9)).toBe('1.9 s before the snap. Everyone is set.');
    expect(describePresnap(play, -0.8)).toBe('0.8 s before the snap. Z is in motion.');
    const shift = { ...play, tracks: [...play.tracks, track('H', 'offense', [[-2, 20, -1], [-0.8, 20, -1], [-0.4, 23, -1], [0, 23, -1]])] };
    expect(describePresnap(shift, -0.6)).toContain('Z and H are shifting');
    const rotate = { ...play, tracks: play.tracks.map((t) => (t.id === 'FS' ? track('FS', 'defense', [[-2, 26.67, 12], [-0.6, 26.67, 12], [0, 20, 10], [1, 20, 10]]) : t)) };
    expect(describePresnap(rotate, -0.2)).toContain('FS is moving on defense');
  });

  it('has no first motion for a play that starts at the snap', () => {
    expect(firstMotionAt({ ...jet(), leadIn: 0, tracks: [track('FS', 'defense', [[0, 1, 1], [1, 1, 1]])] })).toBeNull();
  });
});

describe('field windows with a lead in', () => {
  it('keeps a player in view before the snap, not only after it', () => {
    const deep = track('S', 'defense', [[-1.5, 26.67, 22], [0, 26.67, 18], [1, 26.67, 14]]);
    const base = { ...jet(), tracks: [deep] };
    const withLead = fieldWindow([{ ...base, leadIn: 1.5 }], 1);
    const withoutLead = fieldWindow([{ ...base, leadIn: 0 }], 1);
    expect(withLead.yHi).toBeGreaterThan(withoutLead.yHi);
  });

  it('is the window it always was for a play with no lead in', () => {
    const lib = library();
    const concept = lib.dataset.concepts.find((c) => lib.tracksById.get(c.id)!.offense.every((p) => p.waypoints[0].t === 0))!;
    const play = litePlay(concept, lib.tracksById.get(concept.id)!);
    expect(play.leadIn).toBe(0);
    expect(fieldWindow([play], play.duration)).toEqual(fieldWindow([{ ...play, leadIn: undefined as unknown as number }], play.duration));
  });
});
