import { FRAME_RATE_HZ } from './frames';
import { positionAt } from './interpolate';
import type { PlayerTrack } from './types';

/** The disguise window is frames 0 through 12 of the 10 Hz export: the first 1.2 s after the snap. */
export const DISGUISE_WINDOW_FRAMES = 12;

/** A mean gap of this many yards between two plays' players counts as no resemblance at all (0%). */
export const NO_RESEMBLANCE_YARDS = 6;

/** Similarity at or above this value reads as "the defense cannot tell the plays apart". */
export const DISGUISE_HOLD_PERCENT = 80;

/**
 * How alike two plays look at time `t`, from 0 to 100. Players are paired by id, so both plays must use the same
 * labels for the same job (they do within a scheme). The score falls linearly with the mean distance between paired
 * players and reaches 0 at NO_RESEMBLANCE_YARDS. Players that appear in only one play are ignored; two plays that
 * share no player ids score 0.
 */
export function disguiseSimilarity(base: PlayerTrack[], other: PlayerTrack[], t: number): number {
  const otherById = new Map(other.map((track) => [track.id, track]));
  let total = 0;
  let paired = 0;
  for (const track of base) {
    const match = otherById.get(track.id);
    if (!match) continue;
    const a = positionAt(track, t);
    const b = positionAt(match, t);
    total += Math.hypot(a.x - b.x, a.y - b.y);
    paired++;
  }
  if (paired === 0) return 0;
  const meanGap = total / paired;
  return Math.round(Math.max(0, 1 - meanGap / NO_RESEMBLANCE_YARDS) * 100);
}

export interface DisguiseSummary {
  /** Similarity at frames 0..DISGUISE_WINDOW_FRAMES. */
  profile: number[];
  /** Mean of `profile`: how well the pair hides itself over the whole window. */
  score: number;
  /** First frame whose similarity drops below DISGUISE_HOLD_PERCENT, or null if the window never breaks. */
  breakFrame: number | null;
}

/** Scores a pair of plays on the 10 Hz frames 0..12. */
export function summarizeDisguise(base: PlayerTrack[], other: PlayerTrack[]): DisguiseSummary {
  const profile: number[] = [];
  for (let frame = 0; frame <= DISGUISE_WINDOW_FRAMES; frame++) {
    profile.push(disguiseSimilarity(base, other, frame / FRAME_RATE_HZ));
  }
  const score = Math.round(profile.reduce((sum, value) => sum + value, 0) / profile.length);
  const broken = profile.findIndex((value) => value < DISGUISE_HOLD_PERCENT);
  return { profile, score, breakFrame: broken === -1 ? null : broken };
}
