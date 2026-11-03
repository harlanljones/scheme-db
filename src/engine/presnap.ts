import type { PlayerTrack } from './types';

/**
 * How many seconds before the snap a waypoint may sit. The one place this number lives: the data schema, the play
 * validator and the viewer all read it. A negative `t` is seconds before the snap and `t = 0` is the snap itself.
 */
export const PRESNAP_MAX_SECONDS = 6;

/**
 * Seconds of play before the snap: how far before `t = 0` the earliest waypoint of any track sits. Zero when every
 * track starts at the snap. Derived from the waypoints every time and never stored, so it cannot disagree with them.
 */
export function leadIn(tracks: readonly PlayerTrack[]): number {
  let earliest = 0;
  for (const track of tracks) {
    const first = track.waypoints[0]?.t ?? 0;
    if (first < earliest) earliest = first;
  }
  return -earliest + 0;
}

/** Index of the waypoint at exactly the snap (`t = 0`), or -1 when a track has none. */
export function snapIndex(track: Pick<PlayerTrack, 'waypoints'>): number {
  return track.waypoints.findIndex((waypoint) => waypoint.t === 0);
}

/** True when a track has waypoints before the snap, so its player is already on the move (or shifting) at `t = 0`. */
export function hasLeadIn(track: Pick<PlayerTrack, 'waypoints'>): boolean {
  return (track.waypoints[0]?.t ?? 0) < 0;
}
