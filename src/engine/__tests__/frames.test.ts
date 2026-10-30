import { describe, expect, it } from 'vitest';
import { FRAME_COLUMNS, FRAME_RATE_HZ, frameCount, framesFor, framesToCsv } from '../frames';
import type { PlayerTrack } from '../types';

const track = (id: string, side: PlayerTrack['side'], waypoints: PlayerTrack['waypoints']): PlayerTrack => ({
  id,
  label: id,
  side,
  role: side === 'offense' ? 'wr' : 'db',
  trail: 'route',
  waypoints,
});

const play = {
  conceptId: 'demo',
  duration: 1,
  offense: [track('Z', 'offense', [{ t: 0, x: 40, y: 0 }, { t: 1, x: 40, y: 10 }])],
  defense: [track('FS', 'defense', [{ t: 0, x: 26.67, y: 12 }])],
};

describe('framesFor', () => {
  it('runs at 10 Hz', () => {
    expect(FRAME_RATE_HZ).toBe(10);
  });

  it('counts the snap frame and the frame at the end', () => {
    expect(frameCount(1)).toBe(11);
    expect(frameCount(2.5)).toBe(26);
    expect(frameCount(0.3)).toBe(4);
  });

  it('emits one row per player per frame, offense first, with t = frame / 10', () => {
    const rows = framesFor(play);
    expect(rows).toHaveLength(22);
    expect(rows[0]).toEqual({ conceptId: 'demo', playerId: 'Z', frame: 0, t: 0, x: 40, y: 0 });
    expect(rows[10]).toEqual({ conceptId: 'demo', playerId: 'Z', frame: 10, t: 1, x: 40, y: 10 });
    expect(rows[11].playerId).toBe('FS');
    expect(rows[5].t).toBe(0.5);
  });

  it('holds a player at the last waypoint after the track ends', () => {
    const rows = framesFor({ ...play, duration: 2 });
    const z = rows.filter((row) => row.playerId === 'Z');
    expect(z).toHaveLength(21);
    expect(z[20]).toMatchObject({ x: 40, y: 10 });
  });

  it('is deterministic', () => {
    expect(framesFor(play)).toEqual(framesFor(play));
  });
});

describe('framesToCsv', () => {
  it('writes the header and one line per row', () => {
    const csv = framesToCsv(framesFor(play));
    const lines = csv.trimEnd().split('\n');
    expect(lines[0]).toBe(FRAME_COLUMNS.join(','));
    expect(lines[1]).toBe('demo,Z,0,0,40,0');
    expect(lines).toHaveLength(23);
    expect(csv.endsWith('\n')).toBe(true);
  });
});
