import { LIMITS } from './limits';
import { snapMotion, speedProfile, accelerationProfile } from './speed';
import { positionAt } from './interpolate';
import type { PlayerTrack } from './types';

export type MotionCheck = 'speed' | 'acceleration' | 'moving-at-snap' | 'motion-toward-line' | 'shift-to-snap';

export interface MotionFinding {
  check: MotionCheck;
  /** `error` once the check is enforced and the play is past its error line; otherwise `warn`. */
  level: 'warn' | 'error';
  /** The player concerned, or several ids joined by commas for a check about the whole offense. */
  playerId: string;
  /** Seconds from the snap where it happens (negative: before the snap). */
  t: number;
  message: string;
}

interface Tracks {
  offense: PlayerTrack[];
  defense: PlayerTrack[];
}

const one = (value: number): string => value.toFixed(1);
const at = (t: number): string => (t < 0 ? `${one(-t)} s before the snap` : `${one(t)} s after the snap`);

function peak<T>(items: T[], size: (item: T) => number): T | undefined {
  let best: T | undefined;
  for (const item of items) if (!best || size(item) > size(best)) best = item;
  return best;
}

/**
 * Every way a play asks a player to move that a person cannot, or that football does not allow. Pure: it reads the
 * waypoints and nothing else, and reports one finding per player per check, at the worst moment.
 */
export function motionFindings({ offense, defense }: Tracks): MotionFinding[] {
  const findings: MotionFinding[] = [];
  const everyone = [...offense, ...defense];

  for (const track of everyone) {
    const fastest = peak(speedProfile(track), (sample) => sample.speed);
    if (fastest && fastest.speed > LIMITS.speed.warn) {
      findings.push({
        check: 'speed',
        level: fastest.speed > LIMITS.speed.error ? 'error' : 'warn',
        playerId: track.id,
        t: fastest.t,
        message: `${track.id} runs ${one(fastest.speed)} yd/s at ${at(fastest.t)} (a person tops out near ${LIMITS.speed.warn})`,
      });
    }

    const sharpest = peak(accelerationProfile(track), (sample) => Math.abs(sample.acceleration));
    if (sharpest && Math.abs(sharpest.acceleration) > LIMITS.acceleration.warn) {
      const verb = sharpest.acceleration > 0 ? 'speeds up' : 'slows down';
      findings.push({
        check: 'acceleration',
        level: Math.abs(sharpest.acceleration) > LIMITS.acceleration.error ? 'error' : 'warn',
        playerId: track.id,
        t: sharpest.t,
        message: `${track.id} ${verb} at ${one(Math.abs(sharpest.acceleration))} yd/s² by ${at(sharpest.t)} (limit ${LIMITS.acceleration.warn})`,
      });
    }
  }

  const moving = (tracks: PlayerTrack[]): PlayerTrack[] => tracks.filter((track) => snapMotion(track).speed > LIMITS.movingAtSnap);
  const movingOffense = moving(offense);
  const movingDefense = moving(defense);
  if (movingOffense.length + movingDefense.length > 1) {
    findings.push({
      check: 'moving-at-snap',
      level: movingOffense.length > 1 ? 'error' : 'warn',
      playerId: [...movingOffense, ...movingDefense].map((track) => track.id).join(', '),
      t: 0,
      message: `${movingOffense.length + movingDefense.length} players are moving at the snap (${[...movingOffense, ...movingDefense].map((track) => track.id).join(', ')}); only one offensive player may be in motion`,
    });
  }

  // The rule is about offensive players only: a defender may be moving as the ball is snapped.
  for (const track of movingOffense) {
    const { towardLine, speed } = snapMotion(track);
    if (towardLine > LIMITS.towardLineTolerance) {
      findings.push({
        check: 'motion-toward-line',
        level: 'error',
        playerId: track.id,
        t: 0,
        message: `${track.id} is moving toward the line of scrimmage at the snap (${one(towardLine)} of ${one(speed)} yd/s); a player in motion may only run parallel to it or back`,
      });
    }
  }

  const shift = lastShiftEnd(offense);
  if (shift !== undefined && -shift < LIMITS.setSeconds - 1e-9) {
    findings.push({
      check: 'shift-to-snap',
      level: 'warn',
      playerId: offense.map((track) => track.id).join(', '),
      t: shift,
      message: `The offense is still shifting ${one(-shift)} s before the snap; after a shift every player must be set for ${LIMITS.setSeconds} s`,
    });
  }

  return findings;
}

/**
 * The last time before the snap that two or more offensive players were moving at once (a shift), or undefined when that
 * never happens. One player moving alone is motion, not a shift.
 */
function lastShiftEnd(offense: PlayerTrack[]): number | undefined {
  const earliest = Math.min(0, ...offense.map((track) => track.waypoints[0]?.t ?? 0));
  const steps = Math.round(-earliest * 10);
  for (let k = 0; k < steps; k++) {
    const t = -k / 10;
    let movers = 0;
    for (const track of offense) {
      const a = positionAt(track, t - 0.1);
      const b = positionAt(track, t);
      if (Math.hypot(b.x - a.x, b.y - a.y) / 0.1 > LIMITS.still) movers++;
    }
    if (movers > 1) return t;
  }
  return undefined;
}
