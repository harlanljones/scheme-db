import { describe, expect, it } from 'vitest';
import { framesFor, leadInFrames } from '../frames';
import { positionAt } from '../interpolate';
import { PRESNAP_MAX_SECONDS, hasLeadIn, leadIn, snapIndex } from '../presnap';
import type { PlayerTrack } from '../types';

const track = (id: string, waypoints: PlayerTrack['waypoints'], side: PlayerTrack['side'] = 'offense'): PlayerTrack => ({
  id,
  label: id,
  side,
  role: side === 'offense' ? 'wr' : 'db',
  trail: 'route',
  waypoints,
});

const still = (id: string, side: PlayerTrack['side'] = 'defense') => track(id, [{ t: 0, x: 26.67, y: 5 }, { t: 1, x: 26.67, y: 5 }], side);
const jet = track('Z', [
  { t: -1.2, x: 40, y: -2 },
  { t: -0.6, x: 36, y: -2 },
  { t: 0, x: 32, y: -2 },
  { t: 1, x: 24, y: -2 },
]);

describe('time before the snap', () => {
  it('limits a waypoint to six seconds before the snap, in one place', () => {
    expect(PRESNAP_MAX_SECONDS).toBe(6);
  });

  it('derives the lead in from the earliest waypoint of any track and never returns a negative zero', () => {
    expect(leadIn([still('A'), still('B')])).toBe(0);
    expect(Object.is(leadIn([still('A')]), 0)).toBe(true);
    expect(leadIn([still('A'), jet])).toBeCloseTo(1.2, 10);
    expect(leadIn([jet, track('Y', [{ t: -2.5, x: 10, y: 0 }, { t: 0, x: 12, y: 0 }])])).toBe(2.5);
    expect(leadIn([])).toBe(0);
  });

  it('finds the waypoint at the snap, or says there is none', () => {
    expect(snapIndex(jet)).toBe(2);
    expect(snapIndex(still('A'))).toBe(0);
    expect(snapIndex(track('B', [{ t: -1, x: 0, y: 0 }, { t: 1, x: 0, y: 1 }]))).toBe(-1);
  });

  it('knows which tracks start before the snap', () => {
    expect(hasLeadIn(jet)).toBe(true);
    expect(hasLeadIn(still('A'))).toBe(false);
  });
});

describe('positionAt before the first waypoint', () => {
  it('holds a track that starts at the snap still for all earlier time', () => {
    const z = track('Z', [{ t: 0, x: 40, y: -1 }, { t: 1, x: 30, y: -1 }]);
    expect(positionAt(z, -3)).toEqual({ x: 40, y: -1 });
    expect(positionAt(z, -0.1)).toEqual({ x: 40, y: -1 });
  });

  it('holds a lead in track at its first waypoint before it starts and moves through negative time', () => {
    expect(positionAt(jet, -5)).toEqual({ x: 40, y: -2 });
    expect(positionAt(jet, -1.2)).toEqual({ x: 40, y: -2 });
    const mid = positionAt(jet, -0.6);
    expect(mid.x).toBeCloseTo(36, 10);
    expect(positionAt(jet, 0)).toEqual({ x: 32, y: -2 });
  });
});

describe('framesFor with a lead in', () => {
  const play = { conceptId: 'demo', duration: 1, offense: [jet], defense: [still('FS')] };

  it('counts the frames before the snap', () => {
    expect(leadInFrames(0)).toBe(0);
    expect(leadInFrames(1.2)).toBe(12);
    expect(leadInFrames(1.25)).toBe(13);
  });

  it('emits negative frames in order for every player, with a unique key', () => {
    const rows = framesFor(play);
    const z = rows.filter((row) => row.playerId === 'Z');
    expect(z.map((row) => row.frame)).toEqual(Array.from({ length: 23 }, (_, i) => i - 12));
    expect(z[0]).toMatchObject({ frame: -12, t: -1.2, x: 40, y: -2 });
    expect(z[12]).toMatchObject({ frame: 0, t: 0, x: 32, y: -2 });
    const fs = rows.filter((row) => row.playerId === 'FS');
    expect(fs).toHaveLength(23);
    expect(fs[0]).toMatchObject({ frame: -12, x: 26.67, y: 5 });
    const keys = rows.map((row) => `${row.conceptId}/${row.playerId}/${row.frame}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('gives anyone who filters frame >= 0 exactly the rows a play with no lead in gives', () => {
    const noLead = { ...play, offense: [track('Z', jet.waypoints.filter((w) => w.t >= 0))] };
    const withLead = framesFor(play).filter((row) => row.frame >= 0);
    expect(withLead.filter((row) => row.playerId === 'FS')).toEqual(framesFor(noLead).filter((row) => row.playerId === 'FS'));
    expect(withLead.filter((row) => row.playerId === 'Z')).toHaveLength(framesFor(noLead).filter((row) => row.playerId === 'Z').length);
  });

  it('leaves a play with no lead in exactly as it was: frame 0 first', () => {
    const rows = framesFor({ ...play, offense: [track('Z', jet.waypoints.filter((w) => w.t >= 0))] });
    expect(rows[0].frame).toBe(0);
    expect(rows.every((row) => row.frame >= 0)).toBe(true);
  });
});
