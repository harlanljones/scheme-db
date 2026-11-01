/**
 * Field geometry and positions, shared by the build (static figures, scores) and the browser (islands).
 * No node imports. Positions come from the same engine the downloads and tests use: a smooth curve through
 * each player's timed waypoints.
 */
import { FIELD_WIDTH_YARDS, type BallSpot, type Level } from '../../src/engine/field';
import { positionAt } from '../../src/engine/interpolate';
import type { PlayerTrack } from '../../src/engine/types';

export { FIELD_WIDTH_YARDS };

/** One player, reduced to what a figure needs. `w` holds [t, x, y] triples in yards from the left sideline and the line of scrimmage. */
export interface LiteTrack {
  id: string;
  side: 'offense' | 'defense';
  role: string;
  w: Array<[number, number, number]>;
}

export interface LitePlay {
  id: string;
  name: string;
  duration: number;
  /** Which hash marks the field has: NFL or college. */
  level: Level;
  /** Where the ball is spotted. Positions are drawn with the ball at midfield; add the spot offset to place them. */
  spot: BallSpot;
  /** The side the score counts: the side the scheme belongs to. */
  scored: 'offense' | 'defense';
  tracks: LiteTrack[];
}

export interface Point {
  x: number;
  y: number;
}

const engineTracks = new WeakMap<LiteTrack, PlayerTrack>();

function engineTrack(track: LiteTrack): PlayerTrack {
  let cached = engineTracks.get(track);
  if (!cached) {
    cached = {
      id: track.id,
      label: track.id,
      side: track.side,
      role: track.role as PlayerTrack['role'],
      trail: 'none',
      waypoints: track.w.map(([t, x, y]) => ({ t, x, y })),
    };
    engineTracks.set(track, cached);
  }
  return cached;
}

export function pos(track: LiteTrack, t: number): Point {
  return positionAt(engineTrack(track), t);
}

/** Rows of the field, in yards from the line of scrimmage: `yLo` is the bottom edge and `yHi` the top. */
export interface FieldWindow {
  yLo: number;
  yHi: number;
}

const STEP = 0.1;

/**
 * A window that keeps every player of every given play in view from the snap to `tMax`, in multiples of five
 * yards so the yard lines land on the edges. It is at least 25 yards tall.
 */
export function fieldWindow(plays: LitePlay[], tMax: number): FieldWindow {
  let lo = 0;
  let hi = 0;
  for (const play of plays) {
    for (const track of play.tracks) {
      for (let t = 0; t <= tMax + 1e-9; t += STEP) {
        const { y } = pos(track, t);
        if (y < lo) lo = y;
        if (y > hi) hi = y;
      }
      const end = pos(track, tMax).y;
      if (end < lo) lo = end;
      if (end > hi) hi = end;
    }
  }
  const yLo = Math.min(-5, Math.floor((lo - 1) / 5) * 5);
  let yHi = Math.max(10, Math.ceil((hi + 1.5) / 5) * 5);
  if (yHi - yLo < 25) yHi = yLo + 25;
  return { yLo, yHi };
}

/** Players, in both plays, that stand more than `threshold` yards apart at time `t`, with the distance, in track order. */
export function gapDistances(
  a: LitePlay,
  b: LitePlay,
  t: number,
  threshold = 1,
  side?: 'offense' | 'defense',
): Array<{ id: string; yards: number }> {
  const other = new Map(b.tracks.map((track) => [track.id, track]));
  const out: Array<{ id: string; yards: number }> = [];
  for (const track of a.tracks) {
    if (side && track.side !== side) continue;
    const match = other.get(track.id);
    if (!match) continue;
    const p = pos(track, t);
    const q = pos(match, t);
    const yards = Math.hypot(p.x - q.x, p.y - q.y);
    if (yards > threshold) out.push({ id: track.id, yards });
  }
  return out;
}

/** Ids of players, in both plays, that stand more than `threshold` yards apart at time `t`. */
export function gapsAt(a: LitePlay, b: LitePlay, t: number, threshold = 1, side?: 'offense' | 'defense'): string[] {
  return gapDistances(a, b, t, threshold, side).map((gap) => gap.id);
}

/** Players in `a` that also stand in `b` (same id), and the size of `a`. Counts only `side` when given. */
export function pairedCount(a: LitePlay, b: LitePlay, side?: 'offense' | 'defense'): { paired: number; total: number } {
  const ids = new Set(b.tracks.map((track) => track.id));
  const mine = side ? a.tracks.filter((track) => track.side === side) : a.tracks;
  return { paired: mine.filter((track) => ids.has(track.id)).length, total: mine.length };
}

export function parsePlay(json: string): LitePlay {
  return JSON.parse(json) as LitePlay;
}
