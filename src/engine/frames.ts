import { positionAt } from './interpolate';
import { leadIn } from './presnap';
import type { PlayerTrack } from './types';

/** Sample rate of the frames export. Tracking data in the NFL Big Data Bowl is also published at 10 Hz. */
export const FRAME_RATE_HZ = 10;

/** One player at one instant. Column names follow the Big Data Bowl tracking files where they overlap. */
export interface FrameRow {
  conceptId: string;
  playerId: string;
  frame: number;   // 0 is the snap; a negative frame is before it
  t: number;       // seconds from snap, frame / FRAME_RATE_HZ
  x: number;       // yards across the field, 0..53.33
  y: number;       // yards relative to the LOS, negative = backfield
}

export const FRAME_COLUMNS = ['conceptId', 'playerId', 'frame', 't', 'x', 'y'] as const;

/** Number of frames needed to cover `duration` seconds, including frame 0 and the frame at the end. */
export function frameCount(duration: number): number {
  return Math.floor(duration * FRAME_RATE_HZ + 1e-9) + 1;
}

interface FramedPlay {
  conceptId: string;
  duration: number;
  offense: PlayerTrack[];
  defense: PlayerTrack[];
}

/** Number of frames before the snap (frame -1 down to frame -n) that cover `seconds` of lead in. */
export function leadInFrames(seconds: number): number {
  return Math.max(0, Math.ceil(seconds * FRAME_RATE_HZ - 1e-9)) + 0;
}

/**
 * Resamples a concept's waypoints to fixed 10 Hz frames, offense first then defense, in track order.
 * Positions come from the same Catmull-Rom interpolation the viewer uses, rounded to 2 decimals (about a centimeter
 * of field) so the output is stable across platforms.
 *
 * Frame 0 is the snap. When any track starts before the snap, every player gets the frames before it too, from
 * `-ceil(leadIn * 10)` to `-1`, so a play with a lead in has all 22 players at every frame and `(conceptId, playerId,
 * frame)` stays a unique key. A player holds the first waypoint until his track starts. A play with no lead in produces
 * exactly the frames it always has, so anyone who filters `frame >= 0` sees the same rows either way.
 */
export function framesFor(play: FramedPlay): FrameRow[] {
  const rows: FrameRow[] = [];
  const tracks = [...play.offense, ...play.defense];
  const first = 0 - leadInFrames(leadIn(tracks));
  const frames = frameCount(play.duration);
  for (const track of tracks) {
    for (let frame = first; frame < frames; frame++) {
      const t = frame / FRAME_RATE_HZ;
      const { x, y } = positionAt(track, t);
      rows.push({ conceptId: play.conceptId, playerId: track.id, frame, t, x: round2(x), y: round2(y) });
    }
  }
  return rows;
}

export function framesToCsv(rows: FrameRow[]): string {
  const lines = [FRAME_COLUMNS.join(',')];
  for (const row of rows) lines.push(FRAME_COLUMNS.map((column) => row[column]).join(','));
  return `${lines.join('\n')}\n`;
}

const round2 = (value: number): number => Math.round(value * 100) / 100 + 0;
