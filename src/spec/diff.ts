import { FRAME_RATE_HZ } from '../engine/frames';
import { DISGUISE_WINDOW_FRAMES } from '../engine/disguise';
import { positionAt } from '../engine/interpolate';
import type { Tracks } from '../schema/schema';

export interface PlayerFit {
  id: string;
  side: 'offense' | 'defense';
  /** Largest distance in yards between the two paths over frames 0..12 (the first 1.2 s). */
  maxGapEarly: number;
  /** Mean distance over the whole play. */
  meanGap: number;
}

export interface FitReport {
  conceptId: string;
  players: PlayerFit[];
  /** Players whose early gap stays within `withinYards`. */
  within: number;
  total: number;
}

/** How far a compiled Tracks record drifts from the hand-made one, per player, at 10 Hz. */
export function compareTracks(compiled: Tracks, authored: Tracks, withinYards = 1): FitReport {
  const players: PlayerFit[] = [];
  const frames = Math.floor(Math.min(compiled.duration, authored.duration) * FRAME_RATE_HZ + 1e-9);
  for (const side of ['offense', 'defense'] as const) {
    for (const mine of compiled[side]) {
      const theirs = authored[side].find((p) => p.id === mine.id);
      if (!theirs) continue;
      let maxGapEarly = 0;
      let total = 0;
      for (let frame = 0; frame <= frames; frame++) {
        const t = frame / FRAME_RATE_HZ;
        const a = positionAt(mine, t);
        const b = positionAt(theirs, t);
        const gap = Math.hypot(a.x - b.x, a.y - b.y);
        if (frame <= DISGUISE_WINDOW_FRAMES) maxGapEarly = Math.max(maxGapEarly, gap);
        total += gap;
      }
      players.push({ id: mine.id, side, maxGapEarly, meanGap: total / (frames + 1) });
    }
  }
  return {
    conceptId: compiled.conceptId,
    players,
    within: players.filter((p) => p.maxGapEarly <= withinYards).length,
    total: players.length,
  };
}
