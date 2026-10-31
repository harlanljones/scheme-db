import type { Formation, Tracks } from '../schema/schema';
import type { Spec } from './schema';
import { MAN_COVERAGE, PASS_SET, POCKET_GAP, QB_DROP, RECEIVER, RUSH, ZONE_TIMING } from './calibration';
import { DEEP_ZONES, ROUTES, ZONE_SHAPES, type Point, type ZoneSide } from './vocabulary';

/** Bump when a template changes in a way that moves compiled waypoints. Recorded in `generatedFrom`. */
export const COMPILER_VERSION = '0.3.0';

/** Seconds between compiled waypoints. Short enough that the viewer's spline keeps the corner of a route break. */
export const STEP_SECONDS = 0.2;

const MIDFIELD = 26.67;
const FIELD_MIN_X = 0.5;
const FIELD_MAX_X = 52.8;

type Role = Formation['offense'][string]['role'];

type Motion = (t: number) => Point;

const round2 = (value: number): number => Math.round(value * 100) / 100 + 0;
const clampX = (x: number): number => Math.min(FIELD_MAX_X, Math.max(FIELD_MIN_X, x));

/** The point `distance` yards along a polyline; stops at the last vertex. */
function along(path: Point[], distance: number): Point {
  let remaining = distance;
  for (let i = 0; i < path.length - 1; i++) {
    const length = Math.hypot(path[i + 1].x - path[i].x, path[i + 1].y - path[i].y);
    if (remaining <= length) {
      const u = length === 0 ? 0 : remaining / length;
      return { x: path[i].x + (path[i + 1].x - path[i].x) * u, y: path[i].y + (path[i + 1].y - path[i].y) * u };
    }
    remaining -= length;
  }
  return path[path.length - 1];
}

/** A runner who starts from rest at `delay` seconds; `pace` scales the position's top speed (see calibration.ts). */
const run = (path: Point[], delay: number, pace: number, role: Role): Motion => {
  const top = (RECEIVER.topSpeed as Record<string, number>)[role] ?? RECEIVER.topSpeed.wr;
  return (t) => {
    const u = Math.max(0, t - delay);
    return along(path, pace * top * (u - RECEIVER.tau * (1 - Math.exp(-u / RECEIVER.tau))));
  };
};

/** Yards gained `t` seconds after `delay`, approaching `reach` with time constant `tau`. */
const approach = (t: number, delay: number, reach: number, tau: number): number => reach * (1 - Math.exp(-Math.max(0, t - delay) / tau));

/** Sideways yards per yard upfield for a path `angle` degrees off vertical. */
const slope = (angle: number): number => Math.tan((angle * Math.PI) / 180);

const REACH = 80;

/**
 * Seconds a back checks for a blitzer before he releases. Not measured. A back lined up behind a tackle has to be clear
 * of him before the tackle's pass set carries him back to the back's depth, which takes about 2 seconds.
 */
const CHECK_RELEASE_DELAY = 0.6;

function routePath(route: keyof typeof ROUTES, start: Point, depth: number | undefined, side: 'left' | 'right' | undefined, role: Role): { path: Point[]; pace: number } {
  const inward = start.x < MIDFIELD ? 1 : -1;
  const outward = -inward;
  const toward = side ? (side === 'left' ? -1 : 1) : undefined;
  const { x, y } = start;
  const stem = (d: number): Point[] => [start, { x, y: y + d }];
  switch (route) {
    case 'go':
      return { path: [start, { x, y: y + REACH }], pace: 1 };
    case 'seam':
      return { path: [start, { x: x + inward * slope(10) * REACH, y: y + REACH }], pace: 1 };
    case 'slant': {
      const d = depth ?? 3;
      return { path: [...stem(d), { x: x + inward * slope(50) * REACH, y: y + d + REACH }], pace: 1 };
    }
    case 'out': {
      const d = depth ?? 10;
      return { path: [...stem(d), { x: x + outward * REACH, y: y + d + slope(10) * REACH }], pace: 1 };
    }
    case 'in': {
      const d = depth ?? 10;
      return { path: [...stem(d), { x: x + inward * REACH, y: y + d + slope(15) * REACH }], pace: 1 };
    }
    case 'curl': {
      const d = depth ?? 11;
      return { path: [...stem(d), { x: x + inward * 1.5, y: y + d - 1.5 }], pace: 1 };
    }
    case 'comeback': {
      const d = depth ?? 13;
      return { path: [...stem(d), { x: x + outward * 2.5, y: y + d - 3.5 }], pace: 1 };
    }
    case 'corner': {
      const d = depth ?? 12;
      return { path: [...stem(d), { x: x + outward * slope(40) * REACH, y: y + d + REACH }], pace: 1 };
    }
    case 'post': {
      const d = depth ?? 12;
      return { path: [...stem(d), { x: x + inward * slope(40) * REACH, y: y + d + REACH }], pace: 1 };
    }
    case 'flat': {
      const dir = toward ?? outward;
      const d = depth ?? (role === 'rb' ? 4 : 3);
      return { path: [start, { x: x + dir * 8, y: y + d }, { x: x + dir * REACH, y: y + d + REACH * 0.2 }], pace: 0.8 };
    }
    case 'shallow': {
      const dir = toward ?? inward;
      const d = depth ?? 4;
      return {
        path: [start, { x: x + inward * 0.2, y: y + d * 0.5 }, { x: x + dir * 5, y: y + d }, { x: x + dir * REACH, y: y + d + 0.5 }],
        pace: 0.85,
      };
    }
    case 'swing': {
      const dir = toward ?? outward;
      return { path: [start, { x: x + dir * 3, y: y + 0.5 }, { x: x + dir * 8, y: y + 1.5 }, { x: x + dir * 14, y: y + 3 }], pace: 0.6 };
    }
  }
}

const settle = (t: number, tau: number): number => 1 - Math.exp(-t / tau);

/** Linemen are told apart by their label: C, LG/RG, LT/RT. Any other lineman is treated as a guard. */
const lineman = (id: string): keyof typeof PASS_SET => (/^C\d*$/.test(id) ? 'center' : /T\d*$/.test(id) ? 'tackle' : 'guard');

interface Player {
  id: string;
  side: 'offense' | 'defense';
  start: Point;
  role: Formation['offense'][string]['role'];
}

function players(formation: Formation): Player[] {
  const out: Player[] = [];
  for (const side of ['offense', 'defense'] as const) {
    for (const [id, alignment] of Object.entries(formation[side])) {
      out.push({ id, side, start: { x: alignment.x, y: alignment.y }, role: alignment.role });
    }
  }
  return out;
}

/** Expands `OL` and `DL` and checks that every player in the formation has exactly one job. */
function jobsFor<T>(side: 'offense' | 'defense', given: Record<string, T>, formation: Formation): Map<string, T> {
  const alias: Record<string, string> = side === 'offense' ? { OL: 'ol' } : { DL: 'dl' };
  const jobs = new Map<string, T>();
  const labels = Object.keys(formation[side]);
  for (const [key, job] of Object.entries(given)) {
    const role = alias[key];
    const targets = role ? labels.filter((label) => formation[side][label].role === role) : [key];
    if (targets.length === 0) throw new Error(`${side}: "${key}" matches no player in formation "${formation.id}"`);
    for (const target of targets) {
      if (!formation[side][target]) throw new Error(`${side}: "${target}" is not a player in formation "${formation.id}" (${labels.join(', ')})`);
      if (jobs.has(target)) throw new Error(`${side}: "${target}" is given more than one job`);
      jobs.set(target, job);
    }
  }
  const idle = labels.filter((label) => !jobs.has(label));
  if (idle.length > 0) throw new Error(`${side}: no job for ${idle.join(', ')}`);
  return jobs;
}

function describe(job: Record<string, unknown>): string {
  if ('route' in job) return `${job.route} route${job.depth ? `, ${job.depth} yards` : ''}`;
  if ('block' in job) return String(job.block).replace('-', ' ');
  if ('drop' in job) return `${job.drop} drop`;
  if ('rush' in job) return `${job.rush} rush`;
  if ('zone' in job) return `${job.zone} zone${job.side ? ` (${job.side})` : ''}`;
  if ('man' in job) return `${job.technique ?? 'off'} man on ${job.man}`;
  return '';
}

/**
 * Compiles a play spec to timed waypoints. Pure and deterministic: the same spec, formation and compiler version
 * always give the same Tracks. `specHash` is the sha256 of the spec file, recorded in `generatedFrom`.
 */
export function compileSpec(spec: Spec, formation: Formation, specHash: string): Tracks {
  if (spec.formation !== formation.id) throw new Error(`Spec names formation "${spec.formation}" but was given "${formation.id}"`);

  const offenseJobs = jobsFor('offense', spec.offense, formation);
  const defenseJobs = jobsFor('defense', spec.defense, formation);
  const all = players(formation);
  const motions = new Map<string, Motion>();
  const times: number[] = [];
  for (let t = 0; t < spec.duration - 1e-9; t += STEP_SECONDS) times.push(round2(t));
  times.push(spec.duration);

  const quarterback = all.find((p) => p.side === 'offense' && p.role === 'qb');
  /** The quarterback's position at time `t`, read lazily because his motion is set while the offense is compiled. */
  const qb = (t: number): Point => (quarterback ? motions.get(quarterback.id)!(t) : { x: MIDFIELD, y: -5 });

  for (const player of all.filter((p) => p.side === 'offense')) {
    const job = offenseJobs.get(player.id)!;
    const { start } = player;
    if ('route' in job) {
      const { path, pace } = routePath(job.route, start, job.depth, job.side, player.role);
      motions.set(player.id, run(path, RECEIVER.delay + (job.delay ?? 0), pace, player.role));
    } else if ('block' in job && job.block === 'check-release') {
      const dir = job.side ? (job.side === 'left' ? -1 : 1) : start.x < MIDFIELD ? -1 : 1;
      const path = [start, { x: start.x + dir * 2, y: start.y + 1.2 }, { x: start.x + dir * 7, y: start.y + 5 }];
      motions.set(player.id, run(path, CHECK_RELEASE_DELAY, 0.4, player.role));
    } else if ('block' in job && player.role === 'ol') {
      const set = PASS_SET[lineman(player.id)];
      const side = Math.abs(start.x - MIDFIELD) < 0.1 ? 0 : Math.sign(start.x - MIDFIELD);
      motions.set(player.id, (t) => {
        const room = Math.max(0, start.y - (qb(spec.duration).y + POCKET_GAP));
        const retreat = Math.min(set.speed * Math.max(0, t - set.delay), job.depth ?? room, room);
        const open = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.4) / 2.1)));
        return { x: start.x + side * set.spread * open, y: start.y - retreat };
      });
    } else if ('block' in job) {
      // A back or tight end in protection steps up and holds; this is not measured.
      const retreat = job.depth ?? 1.6;
      const spread = Math.abs(start.x - MIDFIELD) < 0.1 ? 0 : Math.sign(start.x - MIDFIELD) * 0.9;
      motions.set(player.id, (t) => ({ x: start.x + spread * settle(t, 0.7), y: start.y - retreat * settle(t, 0.7) }));
    } else {
      const drop = QB_DROP[job.drop];
      motions.set(player.id, (t) => ({ x: start.x, y: start.y - approach(t, drop.delay, job.depth ?? drop.yards, drop.tau) }));
    }
  }

  const deepZonesTaken = new Map<string, string>();
  for (const player of all.filter((p) => p.side === 'defense')) {
    const job = defenseJobs.get(player.id)!;
    const { start } = player;
    if ('rush' in job) {
      const rush = RUSH[job.rush];
      const toward = Math.sign((quarterback?.start.x ?? MIDFIELD) - start.x);
      motions.set(player.id, (t) => {
        const gain = Math.min(approach(t, rush.delay, rush.reach, rush.tau), job.depth ?? Infinity);
        const toQuarterback = Math.max(0, Math.abs((quarterback?.start.x ?? MIDFIELD) - start.x) - 1);
        const drift = rush.drift ? Math.min(rush.drift.rate * Math.max(0, t - rush.drift.delay), rush.drift.max, toQuarterback) : 0;
        return { x: start.x + toward * drift, y: Math.max(start.y - gain, qb(t).y) };
      });
    } else if ('zone' in job) {
      const { landmarks, early } = ZONE_SHAPES[job.zone];
      const side: ZoneSide = job.side ?? (Object.keys(landmarks).length === 1 ? (Object.keys(landmarks)[0] as ZoneSide) : start.x < MIDFIELD ? 'left' : 'right');
      const landmark = landmarks[side];
      if (DEEP_ZONES.includes(job.zone)) {
        const key = `${job.zone}/${side}`;
        if (deepZonesTaken.has(key)) throw new Error(`defense: ${player.id}: ${key} is already covered by ${deepZonesTaken.get(key)}`);
        deepZonesTaken.set(key, player.id);
      }
      if (!landmark) throw new Error(`defense: ${player.id}: zone "${job.zone}" has no "${side}" side (${Object.keys(landmarks).join(', ')})`);
      const delay = ZONE_TIMING.delay - (early ? ZONE_TIMING.deepHalfEarly : 0);
      motions.set(player.id, (t) => {
        const share = approach(t, delay, 1, ZONE_TIMING.tau);
        return { x: start.x + (landmark.x - start.x) * share, y: start.y + (landmark.y - start.y) * share };
      });
    } else {
      const target = motions.get(job.man);
      const targetStart = offenseStart(formation, job.man);
      if (!target || !targetStart) throw new Error(`defense: ${player.id}: man target "${job.man}" is not an offensive player`);
      const lag = job.lag ?? MAN_COVERAGE.lag;
      const finish = MAN_COVERAGE.finish[job.technique ?? 'off'];
      const gap = { x: start.x - targetStart.x, y: start.y - targetStart.y };
      motions.set(player.id, (t) => {
        const followed = target(Math.max(0, t - lag));
        const closing = 1 - approach(t, MAN_COVERAGE.delay, 1, MAN_COVERAGE.tau);
        return { x: followed.x + gap.x * closing, y: followed.y + (gap.y - finish) * closing + finish };
      });
    }
  }

  const overrides = spec.overrides ?? {};
  for (const id of Object.keys(overrides)) {
    if (!all.some((p) => p.id === id)) throw new Error(`overrides: "${id}" is not a player in formation "${formation.id}"`);
  }

  const track = (player: Player) => {
    const job = (player.side === 'offense' ? offenseJobs : defenseJobs).get(player.id) as Record<string, unknown>;
    const motion = motions.get(player.id)!;
    let waypoints = times.map((t) => {
      const p = motion(t);
      return { t, x: round2(clampX(p.x)), y: round2(p.y) };
    });
    const override = overrides[player.id];
    if (override) {
      const replaced = new Set(override.path.map((w) => w.t));
      waypoints = [...waypoints.filter((w) => !replaced.has(w.t)), ...override.path].sort((a, b) => a.t - b.t);
    }
    const trail = 'route' in job ? 'route' : 'block' in job ? 'block' : 'drop' in job ? 'drop' : 'rush' in job ? 'none' : 'drop';
    return {
      id: player.id,
      label: player.id,
      side: player.side,
      role: player.role,
      trail: trail as 'route' | 'block' | 'drop' | 'none',
      assignment: (job.assignment as string | undefined) ?? describe(job),
      origin: override ? ('authored' as const) : ('compiled' as const),
      waypoints,
    };
  };

  return {
    conceptId: spec.conceptId,
    duration: spec.duration,
    generatedFrom: { spec: specHash, compiler: COMPILER_VERSION },
    offense: all.filter((p) => p.side === 'offense').map(track),
    defense: all.filter((p) => p.side === 'defense').map(track),
  };
}

function offenseStart(formation: Formation, id: string): Point | undefined {
  const alignment = formation.offense[id];
  return alignment && { x: alignment.x, y: alignment.y };
}

