import { PRESNAP_MAX_SECONDS } from './presnap';
import { LIMITS } from './limits';
import { accelerationProfile, speedProfile } from './speed';
import type { PlayerTrack, Waypoint } from './types';

/**
 * Helpers that move a player's waypoint times so the same path takes a time a person can run. They keep every
 * waypoint's position and note as drawn. What they change is `t`, and what they add is the in between waypoints that
 * keep a fast run at an even speed on the viewer's curve (see `densify`), plus, for a lead in, the waypoints at the
 * snap and before it. They are the tool an author reaches for when `bun run data:validate` reports a speed error,
 * and the tool the pre-snap migration was done with.
 */

/** The highest speed, on the viewer's curve, a retimed track is allowed to reach. A little under the warn line. */
export const RETIME_PEAK = 10.4;

/** Segment speed a retime starts from. The curve runs a few percent over a segment's average, so this lands near the peak. */
export const RETIME_START_CAP = 9.75;

/** Seconds between the waypoints `densify` leaves a run with. */
export const DENSE_STEP = 0.25;

const GRID = 0.05;
const snapUp = (t: number): number => Math.ceil(t / GRID - 1e-9) * GRID;
const clean = (value: number): number => Math.round(value * 100) / 100;

const gap = (a: Waypoint, b: Waypoint): number => Math.hypot(b.x - a.x, b.y - a.y);

const copy = (waypoints: readonly Waypoint[]): Waypoint[] => waypoints.map((waypoint) => ({ ...waypoint }));

/**
 * Pushes waypoints at or after the snap later, only as far as needed, so no segment averages more than `cap` yd/s.
 * A segment that is already slower keeps its time, so a delay is absorbed by the first segment with slack.
 * Waypoints before the snap are left alone.
 */
export function slowToCap(waypoints: readonly Waypoint[], cap: number): Waypoint[] {
  const out = copy(waypoints);
  for (let i = 1; i < out.length; i++) {
    if (out[i].t < 0) continue;
    const earliest = Math.max(snapUp(out[i - 1].t + gap(out[i - 1], out[i]) / cap), out[i - 1].t + GRID);
    if (out[i].t < earliest) out[i].t = clean(earliest);
  }
  return out;
}

/**
 * Cuts every segment into equal pieces of about `step` seconds, along the straight line between its two waypoints, and
 * adds the points between as waypoints with no note. The viewer's curve gives each knot a speed from the waypoints on
 * both sides of it without looking at their times, so a short segment next to a long one is run too fast and the long one too slow.
 * Equal pieces take that away: a run at one speed stays at that speed. Existing waypoints keep their time, position and note.
 * A segment between two identical points (a player standing set) is left whole.
 */
export function densify(waypoints: readonly Waypoint[], step: number = DENSE_STEP): Waypoint[] {
  const out: Waypoint[] = [];
  for (let i = 0; i < waypoints.length; i++) {
    const a = waypoints[i];
    out.push({ ...a });
    const next = waypoints[i + 1];
    if (!next) break;
    // A player standing still needs no points between: they would only repeat the same spot.
    const pieces = gap(a, next) < 1e-9 ? 1 : Math.max(1, Math.round((next.t - a.t) / step));
    for (let k = 1; k < pieces; k++) {
      const f = k / pieces;
      out.push({ t: clean(a.t + (next.t - a.t) * f), x: clean(a.x + (next.x - a.x) * f), y: clean(a.y + (next.y - a.y) * f) });
    }
  }
  return out;
}

const withinPeak = (track: PlayerTrack, waypoints: Waypoint[], peak: number): boolean =>
  speedProfile({ ...track, waypoints }).every((sample) => sample.speed <= peak);

/**
 * Makes a track no faster than `peak` on the viewer's curve by slowing the segments that are too fast. It starts at
 * `RETIME_START_CAP` yd/s a segment and goes lower, a quarter yard a second at a time, until the curve itself is under the line.
 * Returns the new waypoints, or undefined when no speed down to 5 yd/s is enough.
 */
export function retimeTrack(track: PlayerTrack, peak: number = RETIME_PEAK): Waypoint[] | undefined {
  for (let cap = RETIME_START_CAP; cap >= 5; cap -= 0.25) {
    const next = densify(slowToCap(track.waypoints, cap));
    if (withinPeak(track, next, peak)) return next;
  }
  return undefined;
}

export interface LeadInOptions {
  /** Yards per second the player runs in the lead in, to start with. It goes lower until the curve is under `RETIME_PEAK`. */
  cap?: number;
  /** Seconds he stands set in his spot before he starts to move. Zero for no hold. */
  hold?: number;
  /** Yards per second squared he speeds up at from the set position, until he reaches his running speed. */
  accel?: number;
  /** Note for the new waypoint at the snap. */
  snapNote?: string;
  /** Note for the new waypoint where he stands set. */
  setNote?: string;
}

/** How far a player in motion may drift toward the line of scrimmage: this share of the distance he runs. */
const MAX_TOWARD_LINE = 0.08;

function buildLeadIn(track: PlayerTrack, cap: number, options: LeadInOptions): Waypoint[] | undefined {
  const hold = options.hold ?? 1;
  const accel = options.accel ?? 8;
  const [start, first, ...rest] = track.waypoints;
  if (!first || start.t !== 0 || first.t <= 0) return undefined;

  // A player in motion may run parallel to the line of scrimmage or back, not toward it, so the run does not climb.
  const climb = first.y - start.y;
  const next: Waypoint = track.side === 'offense' && climb > 0 ? { ...first, y: clean(start.y + Math.min(climb, MAX_TOWARD_LINE * gap(start, first))) } : first;
  const distance = gap(start, next);

  // Speeds up at `accel` to a running speed, then holds it. The time the run takes fixes the speed it reaches: distance = v * (time - v / (2 * accel)).
  const time = snapUp(distance / cap + cap / (2 * accel));
  // Less than a frame of lead in is not worth a change to the track.
  if (time < next.t + 0.1) return undefined;
  const speed = accel * (time - Math.sqrt(Math.max(0, time * time - (2 * distance) / accel)));
  const ramp = speed / accel;
  const travelled = (tau: number): number => (tau <= ramp ? 0.5 * accel * tau * tau : 0.5 * speed * ramp + speed * (tau - ramp));
  const from = clean(next.t - time);
  const at = (t: number, note?: string): Waypoint => {
    const f = travelled(t - from) / distance;
    return { t: clean(t), x: clean(start.x + (next.x - start.x) * f), y: clean(start.y + (next.y - start.y) * f), ...(note ? { note } : {}) };
  };

  const run: Waypoint[] = [{ ...start, t: from, y: start.y, x: start.x }];
  const before = Math.max(1, Math.round(-from / DENSE_STEP));
  for (let k = 1; k < before; k++) run.push(at(from + (-from * k) / before));
  run.push(at(0, options.snapNote ?? 'In motion at the snap'));
  const after = Math.max(1, Math.round(next.t / DENSE_STEP));
  for (let k = 1; k < after; k++) run.push(at((next.t * k) / after));
  run.push({ ...next });

  const lead: Waypoint[] = [];
  if (hold > 0) lead.push({ t: clean(from - hold), x: start.x, y: start.y, note: options.setNote ?? 'Set in the formation' });
  return densify([...lead, ...run, ...slowToCap([next, ...rest], cap).slice(1)]);
}

/**
 * Turns a run that starts at the snap into one that starts earlier. The first segment (from the spot at t = 0 to the first
 * waypoint after it) keeps its end time and is run at a steady speed, so it starts before the snap; the player is on that
 * line, at speed, when the ball is snapped. A waypoint is added at t = 0 on that line and, when `hold` is above zero, a
 * waypoint `hold` seconds before he starts so he is set first. Later segments are slowed to the same speed.
 *
 * The speed starts at `cap` and goes lower, a quarter yard a second at a time, until the viewer's curve stays under
 * `RETIME_PEAK`. Returns undefined when the first segment already runs at or under the speed (no lead in is needed) or no
 * speed down to 5 yd/s gives a lead in of at most `PRESNAP_MAX_SECONDS`.
 */
export function startEarlier(track: PlayerTrack, options: LeadInOptions = {}): Waypoint[] | undefined {
  for (let cap = options.cap ?? 8.75; cap >= 5; cap -= 0.25) {
    const next = buildLeadIn(track, cap, options);
    if (!next) return undefined;
    if (next[0].t < -PRESNAP_MAX_SECONDS) return undefined;
    if (withinPeak(track, next, RETIME_PEAK)) return next;
  }
  return undefined;
}

/**
 * Slows the fastest segment near each too sharp change of speed, a little at a time, until no player speeds up or slows
 * down faster than `limit` yd/s² (measured the way `accelerationProfile` does). A sprint into a sudden stop takes the
 * most: the approach gets slower, and the arrival later, until the stop is one a person can make.
 * Returns the new waypoints, or undefined when 80 rounds do not get there.
 */
export function easeTrack(track: PlayerTrack, limit: number = LIMITS.acceleration.warn - 0.25): Waypoint[] | undefined {
  let waypoints = copy(track.waypoints);
  // No segment may get faster than it is now: a delay pushes the rest of the path later and does not squeeze it.
  const caps = waypoints.slice(1).map((waypoint, i) => {
    const distance = gap(waypoints[i], waypoint);
    return distance < 1e-9 ? Infinity : distance / (waypoint.t - waypoints[i].t);
  });
  for (let round = 0; round < 80; round++) {
    const profile = accelerationProfile({ ...track, waypoints });
    const worst = profile.reduce((a, b) => (Math.abs(b.acceleration) > Math.abs(a.acceleration) ? b : a), { t: 0, acceleration: 0 });
    if (Math.abs(worst.acceleration) <= limit) return waypoints;

    // The fastest segment in the second before the sharpest change is the one to slow.
    let fastest = -1;
    let fastestSpeed = 0;
    for (let i = 1; i < waypoints.length; i++) {
      if (waypoints[i].t < worst.t - 1 || waypoints[i - 1].t > worst.t) continue;
      const speed = gap(waypoints[i - 1], waypoints[i]) / (waypoints[i].t - waypoints[i - 1].t);
      if (speed > fastestSpeed) {
        fastestSpeed = speed;
        fastest = i - 1;
      }
    }
    if (fastest < 0) return undefined;
    caps[fastest] = Math.min(caps[fastest], fastestSpeed * 0.93);
    waypoints = slowToCaps(waypoints, caps);
  }
  return undefined;
}

/** Like `slowToCap`, with a separate cap for each segment. */
function slowToCaps(waypoints: readonly Waypoint[], caps: readonly number[]): Waypoint[] {
  const out = copy(waypoints);
  for (let i = 1; i < out.length; i++) {
    if (out[i].t < 0) continue;
    const earliest = Math.max(snapUp(out[i - 1].t + gap(out[i - 1], out[i]) / caps[i - 1]), out[i - 1].t + GRID);
    if (out[i].t < earliest) out[i].t = clean(earliest);
  }
  return out;
}

/** The speed, in yards per second, of the fastest 0.1 s step of a track. */
export function peakSpeed(track: Pick<PlayerTrack, 'waypoints'> & Partial<PlayerTrack>): number {
  return Math.max(0, ...speedProfile(track as PlayerTrack).map((sample) => sample.speed));
}
