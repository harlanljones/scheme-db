import type { PlayerTrack, Waypoint } from './types';

export interface Point {
  x: number;
  y: number;
}

/**
 * Standard Catmull-Rom spline interpolation between p1 and p2 with surrounding p0 and p3.
 * u is in [0, 1].
 */
function catmullRom(p0: number, p1: number, p2: number, p3: number, u: number): number {
  const u2 = u * u;
  const u3 = u2 * u;

  return 0.5 * (
    2 * p1 +
    (-p0 + p2) * u +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * u3
  );
}

/**
 * Calculates the interpolated (x, y) position of a player at time t.
 * Uses Catmull-Rom spline interpolation through waypoints.
 * Clamps to first waypoint if t <= first.t, and last waypoint if t >= last.t.
 */
export function positionAt(track: PlayerTrack, t: number): Point {
  const { waypoints } = track;
  if (!waypoints || waypoints.length === 0) {
    return { x: 0, y: 0 };
  }

  const n = waypoints.length;
  if (n === 1 || t <= waypoints[0].t) {
    return { x: waypoints[0].x, y: waypoints[0].y };
  }

  const lastWp = waypoints[n - 1];
  if (t >= lastWp.t) {
    return { x: lastWp.x, y: lastWp.y };
  }

  // Find the bracketing interval [i, i+1] where waypoints[i].t <= t <= waypoints[i+1].t
  let i = 0;
  while (i < n - 1 && waypoints[i + 1].t < t) {
    i++;
  }

  const p1: Waypoint = waypoints[i];
  const p2: Waypoint = waypoints[i + 1];

  const dt = p2.t - p1.t;
  if (dt <= 0) {
    return { x: p1.x, y: p1.y };
  }

  const u = (t - p1.t) / dt;

  const p0: Waypoint = i > 0 ? waypoints[i - 1] : p1;
  const p3: Waypoint = i + 2 < n ? waypoints[i + 2] : p2;

  const x = catmullRom(p0.x, p1.x, p2.x, p3.x, u);
  const y = catmullRom(p0.y, p1.y, p2.y, p3.y, u);

  return { x, y };
}

/**
 * Samples the track path between `from` and `to` at discrete steps for smooth trail rendering.
 */
export function sampleTrack(track: PlayerTrack, from: number, to: number, steps: number = 20): Point[] {
  if (steps <= 1 || from === to) {
    return [positionAt(track, from)];
  }

  const points: Point[] = [];
  const dt = (to - from) / (steps - 1);

  for (let k = 0; k < steps; k++) {
    const t = from + k * dt;
    points.push(positionAt(track, t));
  }

  return points;
}
