import { describe, expect, it } from 'vitest';
import {
  DISGUISE_HOLD_PERCENT,
  DISGUISE_WINDOW_FRAMES,
  NO_RESEMBLANCE_YARDS,
  disguiseSimilarity,
  summarizeDisguise,
} from '../disguise';
import type { PlayerTrack } from '../types';

const track = (id: string, waypoints: PlayerTrack['waypoints']): PlayerTrack => ({
  id,
  label: id,
  side: 'offense',
  role: 'rb',
  trail: 'carry',
  waypoints,
});

const still = (id: string, x: number, y: number): PlayerTrack => track(id, [{ t: 0, x, y }]);
const walk = (id: string, dx: number): PlayerTrack =>
  track(id, [{ t: 0, x: 20, y: 0 }, { t: 2, x: 20 + dx, y: 0 }]);

describe('disguiseSimilarity', () => {
  it('scores identical tracks 100', () => {
    expect(disguiseSimilarity([walk('RB', 6)], [walk('RB', 6)], 1.5)).toBe(100);
  });

  it('falls linearly with the mean gap and reaches 0 at NO_RESEMBLANCE_YARDS', () => {
    const half = NO_RESEMBLANCE_YARDS / 2;
    expect(disguiseSimilarity([still('RB', 20, 0)], [still('RB', 20 + half, 0)], 0)).toBe(50);
    expect(disguiseSimilarity([still('RB', 20, 0)], [still('RB', 20 + NO_RESEMBLANCE_YARDS, 0)], 0)).toBe(0);
    expect(disguiseSimilarity([still('RB', 20, 0)], [still('RB', 20 + 3 * NO_RESEMBLANCE_YARDS, 0)], 0)).toBe(0);
  });

  it('averages over players, so a block that matches dilutes a route that does not', () => {
    const base = [still('LT', 10, 0), walk('RB', 0)];
    const other = [still('LT', 10, 0), walk('RB', 6)];
    expect(disguiseSimilarity(base, other, 2)).toBe(50);
  });

  it('pairs players by id and ignores players on only one side', () => {
    const base = [still('RB', 20, 0), still('QB', 26, -2)];
    const other = [still('RB', 20, 0)];
    expect(disguiseSimilarity(base, other, 0)).toBe(100);
    expect(disguiseSimilarity(base, [still('FB', 20, 0)], 0)).toBe(0);
  });
});

describe('summarizeDisguise', () => {
  it('samples frames 0..12', () => {
    const summary = summarizeDisguise([walk('RB', 0)], [walk('RB', 0)]);
    expect(summary.profile).toHaveLength(DISGUISE_WINDOW_FRAMES + 1);
    expect(summary.score).toBe(100);
    expect(summary.breakFrame).toBeNull();
  });

  it('reports the first frame the disguise breaks', () => {
    const summary = summarizeDisguise([walk('RB', 0)], [walk('RB', 12)]);
    const frame = summary.breakFrame!;
    expect(summary.profile[0]).toBe(100);
    expect(frame).toBeGreaterThan(0);
    expect(summary.profile[frame]).toBeLessThan(DISGUISE_HOLD_PERCENT);
    expect(summary.profile[frame - 1]).toBeGreaterThanOrEqual(DISGUISE_HOLD_PERCENT);
    expect(summary.score).toBeLessThan(100);
    // The gap only grows, so similarity never recovers.
    expect(summary.profile).toEqual([...summary.profile].sort((a, b) => b - a));
  });
});

describe('scoring one side', () => {
  const dTrack = (id: string, x: number, y: number): PlayerTrack => ({ ...still(id, x, y), side: 'defense', role: 'db' });
  // The offense stands in the same place in both plays. One defender moves 6 yd, which is the full no resemblance gap.
  const base = [still('RB', 20, 0), dTrack('CB', 10, 5)];
  const other = [still('RB', 20, 0), dTrack('CB', 10 + NO_RESEMBLANCE_YARDS, 5)];

  it('counts both sides when no side is given', () => {
    expect(disguiseSimilarity(base, other, 0)).toBe(50);
  });

  it('counts only the side that sells the look', () => {
    expect(disguiseSimilarity(base, other, 0, 'offense')).toBe(100);
    expect(disguiseSimilarity(base, other, 0, 'defense')).toBe(0);
  });

  it('scores 0 when the chosen side has no player in both plays', () => {
    expect(disguiseSimilarity([still('RB', 20, 0)], [still('RB', 20, 0)], 0, 'defense')).toBe(0);
  });

  it('summarizes on the chosen side too', () => {
    expect(summarizeDisguise(base, other, 'offense').score).toBe(100);
    expect(summarizeDisguise(base, other, 'offense').breakFrame).toBeNull();
    expect(summarizeDisguise(base, other, 'defense').breakFrame).toBe(0);
  });
});
