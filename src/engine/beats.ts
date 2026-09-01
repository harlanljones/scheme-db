import type { Beat, Play } from './types';

/**
 * Merges one or more beat groups into a single sorted, de-duplicated rail (dedupe on
 * centisecond-rounded `t`). Used by the dual-play comparison scrubber so one timeline can
 * show every key moment of both plays at once.
 */
export function mergeBeats(...groups: Beat[][]): Beat[] {
  const all = groups.flat().slice().sort((a, b) => a.t - b.t);
  const seen = new Map<number, Beat>();
  for (const b of all) {
    const key = Math.round(b.t * 100);
    if (!seen.has(key)) {
      seen.set(key, b);
    }
  }
  return Array.from(seen.values());
}

/**
 * Merges the key-beat rails of two plays for the side-by-side comparison scrubber.
 */
export function mergeComparisonBeats(playA: Play, playB: Play): Beat[] {
  return mergeBeats(playA.beats, playB.beats);
}

/**
 * Returns the index of the last beat whose t <= current scrub time `t`.
 * (i.e. the most recent beat that has happened at the current scrub position).
 * Returns -1 if t is before the first beat or if beats array is empty.
 */
export function activeBeatIndex(beats: Beat[], t: number): number {
  if (!beats || beats.length === 0) {
    return -1;
  }

  let activeIdx = -1;
  for (let i = 0; i < beats.length; i++) {
    if (beats[i].t <= t) {
      activeIdx = i;
    } else {
      break;
    }
  }

  return activeIdx;
}

/**
 * Checks whether a given playerId is in the active beat's focus list.
 * Drives highlight/dim rendering on markers.
 */
export function isFocused(beat: Beat | undefined, playerId: string): boolean {
  if (!beat || !beat.focus || beat.focus.length === 0) {
    return false;
  }
  return beat.focus.includes(playerId);
}
