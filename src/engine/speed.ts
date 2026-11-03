import { positionAt } from './interpolate';
import type { PlayerTrack } from './types';

/** Seconds per step of the speed profile. It is the 10 Hz grid of the frames export, so a step is one frame to the next. */
export const SPEED_STEP_SECONDS = 0.1;

const STEPS_PER_SECOND = 1 / SPEED_STEP_SECONDS;

export interface SpeedSample {
  /** Seconds from the snap at the end of the step (a multiple of 0.1). */
  t: number;
  /** Yards per second over the step that ends at `t`. */
  speed: number;
}

export interface AccelerationSample {
  /** Seconds from the snap at the end of the window (a multiple of 0.1). */
  t: number;
  /** Yards per second squared; negative when the player slows down. */
  acceleration: number;
}

/**
 * The speed at each 0.1 s step, measured on the same Catmull-Rom curve the viewer draws and the frames export samples.
 * A step runs from one multiple of 0.1 s to the next; only whole steps between the first and last waypoint count, so
 * the clamped time before a track starts and after it ends never reads as a stop.
 */
export function speedProfile(track: PlayerTrack): SpeedSample[] {
  const { waypoints } = track;
  if (waypoints.length < 2) return [];
  const first = Math.ceil(waypoints[0].t * STEPS_PER_SECOND - 1e-9);
  const last = Math.floor(waypoints[waypoints.length - 1].t * STEPS_PER_SECOND + 1e-9);
  const samples: SpeedSample[] = [];
  let previous = positionAt(track, first / STEPS_PER_SECOND);
  for (let k = first + 1; k <= last; k++) {
    const t = k / STEPS_PER_SECOND;
    const here = positionAt(track, t);
    samples.push({ t, speed: Math.hypot(here.x - previous.x, here.y - previous.y) / SPEED_STEP_SECONDS });
    previous = here;
  }
  return samples;
}

/**
 * Seconds over which acceleration is measured. A 0.1 s step is too short: the spline changes speed at each waypoint
 * (adjacent segments of different length run at different speeds), so a step-to-step difference reads 20 to 40 yd/s²
 * on ordinary plays and on the compiler's own receivers. Half a second smooths the knots and still sees a player who
 * goes from a walk to a sprint, or from a sprint to a stop, faster than a person can.
 */
export const ACCELERATION_WINDOW_SECONDS = 0.5;

/**
 * How quickly a player speeds up or slows down, at each 0.1 s step: the average speed over the last half second minus
 * the average speed over the half second before it, divided by 0.5 s. It starts one second after the first waypoint,
 * so a standing start counts, and stops at the last waypoint, so the clamped stop after the track does not.
 */
export function accelerationProfile(track: PlayerTrack): AccelerationSample[] {
  const { waypoints } = track;
  if (waypoints.length < 2) return [];
  const window = ACCELERATION_WINDOW_SECONDS;
  const averageSpeed = (t: number): number => {
    const from = positionAt(track, t - window);
    const to = positionAt(track, t);
    return Math.hypot(to.x - from.x, to.y - from.y) / window;
  };
  const first = Math.ceil((waypoints[0].t + 2 * window) * STEPS_PER_SECOND - 1e-9);
  const last = Math.floor(waypoints[waypoints.length - 1].t * STEPS_PER_SECOND + 1e-9);
  const out: AccelerationSample[] = [];
  for (let k = first; k <= last; k++) {
    const t = k / STEPS_PER_SECOND;
    out.push({ t, acceleration: (averageSpeed(t) - averageSpeed(t - window)) / window });
  }
  return out;
}

export interface SnapMotion {
  /** Yards per second over the 0.1 s that end at the snap. Zero for a player with no lead in. */
  speed: number;
  /** Yards per second downfield (positive: toward the line of scrimmage for a player in the backfield) or back (negative) over those 0.1 s. */
  towardLine: number;
}

/** How a player is moving as the ball is snapped: the step from `t = -0.1` to `t = 0`. */
export function snapMotion(track: PlayerTrack): SnapMotion {
  const before = positionAt(track, -SPEED_STEP_SECONDS);
  const at = positionAt(track, 0);
  return {
    speed: Math.hypot(at.x - before.x, at.y - before.y) / SPEED_STEP_SECONDS,
    towardLine: (at.y - before.y) / SPEED_STEP_SECONDS,
  };
}
