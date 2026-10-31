import type { Alignment, Formation, Tracks } from './schema';

export interface AlignmentOverride {
  side: 'offense' | 'defense';
  id: string;
  /** Where the formation puts the player. */
  preset: Alignment;
  /** Where the concept's track actually starts the player (waypoint at t = 0). */
  track: { x: number; y: number };
}

/**
 * The players a concept moves off its formation preset at the snap (a pistol QB, a shifted front, a man in motion).
 * An empty list means the tracks start exactly on the preset. A compiler applies the preset first, then these.
 */
export function alignmentOverrides(formation: Formation, tracks: Tracks, tolerance = 1e-9): AlignmentOverride[] {
  const out: AlignmentOverride[] = [];
  for (const side of ['offense', 'defense'] as const) {
    for (const player of tracks[side]) {
      const preset = formation[side][player.id];
      const start = player.waypoints[0];
      if (!preset || !start) continue;
      if (Math.abs(start.x - preset.x) > tolerance || Math.abs(start.y - preset.y) > tolerance) {
        out.push({ side, id: player.id, preset, track: { x: start.x, y: start.y } });
      }
    }
  }
  return out;
}
