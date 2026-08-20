import type { Beat } from './types';

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
