import { describe, it, expect } from 'vitest';
import { positionAt, sampleTrack } from '../interpolate';
import type { PlayerTrack } from '../types';
import { outsideZone } from '../../data/schemes/shanahan/outside-zone';
import { playActionOver } from '../../data/schemes/shanahan/play-action-over';
import { nakedBootleg } from '../../data/schemes/shanahan/naked-bootleg';

describe('interpolate engine', () => {
  const track: PlayerTrack = {
    id: 'RB',
    label: 'T',
    side: 'offense',
    role: 'rb',
    trail: 'carry',
    waypoints: [
      { t: 0.0, x: 26.67, y: -5.5 },
      { t: 1.0, x: 28.0, y: -4.0 },
      { t: 2.0, x: 32.0, y: -1.0 },
      { t: 3.0, x: 35.0, y: 5.0 },
    ],
  };

  it('clamps to first waypoint when t is before or at the first waypoint', () => {
    const before = positionAt(track, -1.0);
    expect(before).toEqual({ x: 26.67, y: -5.5 });

    const atFirst = positionAt(track, 0.0);
    expect(atFirst).toEqual({ x: 26.67, y: -5.5 });
  });

  it('clamps to last waypoint when t is after or at the last waypoint', () => {
    const after = positionAt(track, 5.0);
    expect(after).toEqual({ x: 35.0, y: 5.0 });

    const atLast = positionAt(track, 3.0);
    expect(atLast).toEqual({ x: 35.0, y: 5.0 });
  });

  it('evaluates exactly at intermediate waypoints', () => {
    const atT1 = positionAt(track, 1.0);
    expect(atT1.x).toBeCloseTo(28.0, 4);
    expect(atT1.y).toBeCloseTo(-4.0, 4);

    const atT2 = positionAt(track, 2.0);
    expect(atT2.x).toBeCloseTo(32.0, 4);
    expect(atT2.y).toBeCloseTo(-1.0, 4);
  });

  it('interpolates smoothly between waypoints', () => {
    const mid = positionAt(track, 0.5);
    // x should be between 26.67 and 28.0
    expect(mid.x).toBeGreaterThan(26.67);
    expect(mid.x).toBeLessThan(28.0);
    // y should be between -5.5 and -4.0
    expect(mid.y).toBeGreaterThan(-5.5);
    expect(mid.y).toBeLessThan(-4.0);
  });

  it('demonstrates Catmull-Rom continuity approaching waypoints', () => {
    const justBefore = positionAt(track, 1.999);
    const exact = positionAt(track, 2.0);
    const justAfter = positionAt(track, 2.001);

    expect(justBefore.x).toBeCloseTo(exact.x, 2);
    expect(justBefore.y).toBeCloseTo(exact.y, 2);
    expect(justAfter.x).toBeCloseTo(exact.x, 2);
    expect(justAfter.y).toBeCloseTo(exact.y, 2);
  });

  it('handles single waypoint track', () => {
    const singleWpTrack: PlayerTrack = {
      id: 'QB',
      label: 'QB',
      side: 'offense',
      role: 'qb',
      trail: 'none',
      waypoints: [{ t: 0, x: 26.67, y: -1.5 }],
    };

    expect(positionAt(singleWpTrack, 0)).toEqual({ x: 26.67, y: -1.5 });
    expect(positionAt(singleWpTrack, 2.5)).toEqual({ x: 26.67, y: -1.5 });
  });

  it('sampleTrack returns correct number of steps and endpoints', () => {
    const samples = sampleTrack(track, 0, 2.0, 5);
    expect(samples.length).toBe(5);
    expect(samples[0].x).toBeCloseTo(26.67, 4);
    expect(samples[0].y).toBeCloseTo(-5.5, 4);
    expect(samples[4].x).toBeCloseTo(32.0, 4);
    expect(samples[4].y).toBeCloseTo(-1.0, 4);
  });

  it('guarantees offensive line and running back positions at t=1.2s match across base OZ, PA Over, and Naked Bootleg', () => {
    const oz = outsideZone;
    const pa = playActionOver;
    const boot = nakedBootleg;

    const keyPlayerIds = ['LT', 'LG', 'C', 'RG', 'RT', 'FB', 'RB', 'QB'];

    for (const id of keyPlayerIds) {
      const trackOZ = oz.offense.find((p) => p.id === id)!;
      const trackPA = pa.offense.find((p) => p.id === id)!;
      const trackBoot = boot.offense.find((p) => p.id === id)!;

      const posOZ = positionAt(trackOZ, 1.2);
      const posPA = positionAt(trackPA, 1.2);
      const posBoot = positionAt(trackBoot, 1.2);

      // Verify PA matches OZ
      expect(posPA.x, `${id} x-coord at t=1.2s between OZ and PA`).toBeCloseTo(posOZ.x, 1);
      expect(posPA.y, `${id} y-coord at t=1.2s between OZ and PA`).toBeCloseTo(posOZ.y, 1);

      // Verify Bootleg matches OZ
      expect(posBoot.x, `${id} x-coord at t=1.2s between OZ and Bootleg`).toBeCloseTo(posOZ.x, 1);
      expect(posBoot.y, `${id} y-coord at t=1.2s between OZ and Bootleg`).toBeCloseTo(posOZ.y, 1);
    }
  });
});
