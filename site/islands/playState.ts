import { useSyncExternalStore } from 'react';

/**
 * Time and selection shared by the islands of one play page: the viewer, and the comparison further down.
 * Both import this module, so they see one clock. The server snapshot is always the opening state, which is
 * what the static HTML shows before the page wakes up.
 */
export interface PlayState {
  /** Seconds after the snap. */
  t: number;
  playing: boolean;
  speed: 0.5 | 1;
  /** Id of the play the comparison shows. */
  compareId: string | null;
  /** True until the visitor moves the clock: the page opens on a still frame at 1.2 s, and the first Play starts from the snap. */
  fresh: boolean;
}

export const OPENING_T = 1.2;

const INITIAL: PlayState = { t: OPENING_T, playing: false, speed: 1, compareId: null, fresh: true };

let state: PlayState = INITIAL;
const listeners = new Set<() => void>();

export function setPlayState(patch: Partial<Omit<PlayState, 'fresh'>>): void {
  const moved = 't' in patch || 'playing' in patch;
  state = { ...state, ...patch, fresh: state.fresh && !moved };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePlayState(): PlayState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  );
}

/** Rounds to a tenth of a second, the grain of the scrubber and of the scores. */
export const tenth = (t: number): number => Math.round(t * 10) / 10;
