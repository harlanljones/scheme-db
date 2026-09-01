import type { Play, PlayerTrack } from './types';

/**
 * Validates a coverage-variant defense (the output of buildCoverageDefense) by running
 * the full single-play invariant sweep against a play whose defense has been swapped.
 * Reuses every structural check so derived defense cannot silently violate the
 * hand-authored data contract (count, ids, waypoint ordering, bounds, beat focus ids).
 */
export function validateCoverageDefense(play: Play, defense: PlayerTrack[]): string[] {
  const variant: Play = { ...play, defense };
  return validatePlay(variant);
}

/**
 * Validates a single Play object against the data model invariants.
 * Returns an array of human-readable problem / warning strings.
 * An empty array indicates a valid play.
 */
export function validatePlay(play: Play): string[] {
  const problems: string[] = [];

  // 1. Player counts: exactly 11 offense, 11 defense
  if (!play.offense || play.offense.length !== 11) {
    problems.push(`Offense must have exactly 11 players, found ${play.offense?.length ?? 0}`);
  }
  if (!play.defense || play.defense.length !== 11) {
    problems.push(`Defense must have exactly 11 players, found ${play.defense?.length ?? 0}`);
  }

  // 2. Duplicate player IDs across both sides
  const allTracks: PlayerTrack[] = [...(play.offense || []), ...(play.defense || [])];
  const seenIds = new Set<string>();
  for (const track of allTracks) {
    if (!track.id) {
      problems.push('PlayerTrack missing id');
      continue;
    }
    if (seenIds.has(track.id)) {
      problems.push(`Duplicate player id "${track.id}" found in play`);
    }
    seenIds.add(track.id);

    // 3. Track waypoints validation
    if (!track.waypoints || track.waypoints.length === 0) {
      problems.push(`Player ${track.id} has no waypoints`);
      continue;
    }

    if (track.waypoints[0].t !== 0) {
      problems.push(`Player ${track.id} first waypoint must have t === 0, found t=${track.waypoints[0].t}`);
    }

    for (let i = 0; i < track.waypoints.length; i++) {
      const wp = track.waypoints[i];

      // Check chronological order
      if (i > 0 && wp.t <= track.waypoints[i - 1].t) {
        problems.push(`Player ${track.id} waypoints not sorted ascending by t at index ${i} (t=${wp.t} <= ${track.waypoints[i - 1].t})`);
      }

      // Check duration bounds
      if (wp.t > play.duration) {
        problems.push(`Player ${track.id} waypoint at t=${wp.t} exceeds play duration ${play.duration}`);
      }

      // Check x field boundaries [0, 53.33]
      if (wp.x < 0 || wp.x > 53.33) {
        problems.push(`warn: x=${wp.x} outside numbered field [0, 53.33] for player ${track.id}`);
      }
    }
  }

  // 4. Beats validation
  if (play.beats) {
    for (let i = 0; i < play.beats.length; i++) {
      const beat = play.beats[i];

      if (beat.t > play.duration) {
        problems.push(`Beat "${beat.title}" at t=${beat.t} exceeds play duration ${play.duration}`);
      }

      if (i > 0 && beat.t < play.beats[i - 1].t) {
        problems.push(`Beats not sorted ascending by t at index ${i} ("${beat.title}" at t=${beat.t} < "${play.beats[i - 1].title}" at t=${play.beats[i - 1].t})`);
      }

      if (beat.focus) {
        for (const focusId of beat.focus) {
          if (!seenIds.has(focusId)) {
            problems.push(`Beat "${beat.title}" focus id "${focusId}" does not exist in play`);
          }
        }
      }
    }
  }

  return problems;
}

/**
 * Validates an entire library of plays, including cross-play sequence references.
 * Returns a mapping of playId -> array of problems.
 */
export function validateLibrary(plays: Play[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const playIds = new Set(plays.map((p) => p.id));

  for (const play of plays) {
    const problems = validatePlay(play);

    // Cross-play sequence references
    if (play.sequence) {
      if (play.sequence.setsUp) {
        for (const targetId of play.sequence.setsUp) {
          if (!playIds.has(targetId)) {
            problems.push(`sequence.setsUp references non-existent play id "${targetId}"`);
          }
        }
      }

      if (play.sequence.playsOff) {
        for (const targetId of play.sequence.playsOff) {
          if (!playIds.has(targetId)) {
            problems.push(`sequence.playsOff references non-existent play id "${targetId}"`);
          }
        }
      }
    }

    result[play.id] = problems;
  }

  return result;
}
