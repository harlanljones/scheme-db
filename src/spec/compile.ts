import type { Formation, Tracks } from '../schema/schema';
import type { Spec } from './schema';
import { DROPS, ROUTES, ZONE_SHAPES, type Point, type ZoneSide } from './vocabulary';

/** Bump when a template changes in a way that moves compiled waypoints. Recorded in `generatedFrom`. */
export const COMPILER_VERSION = '0.1.0';

/** Seconds between compiled waypoints; the viewer's spline smooths the corners between them. */
export const STEP_SECONDS = 0.4;

const MIDFIELD = 26.67;
const FIELD_MIN_X = 0.5;
const FIELD_MAX_X = 52.8;

/**
 * Receiver speed profile: distance run after `t` seconds is `TOP * TAU * (1 - e^(-t / TAU))`. The constants are fitted
 * to the hand-made vertical routes already in the library (about 6 yards after 0.7 s, 11 after 1.6 s, 17 after 3.8 s),
 * which start much faster than a real player does. They keep compiled plays looking like the rest of the library.
 */
const TOP_SPEED = 10.3;
const TAU = 1.8;

/** Seconds a defender takes to close about two thirds of the way to his landmark or his man. */
const DEFENDER_TAU = 0.95;

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

const run = (path: Point[], delay: number, pace: number): Motion => (t) => {
  const elapsed = Math.max(0, t - delay);
  return along(path, pace * TOP_SPEED * TAU * (1 - Math.exp(-elapsed / TAU)));
};

const REACH = 80;

function routePath(route: keyof typeof ROUTES, start: Point, depth: number | undefined, side: 'left' | 'right' | undefined): { path: Point[]; pace: number } {
  const inward = start.x < MIDFIELD ? 1 : -1;
  const outward = -inward;
  const toward = side ? (side === 'left' ? -1 : 1) : undefined;
  const { x, y } = start;
  const stem = (d: number): Point[] => [start, { x, y: y + d }];
  switch (route) {
    case 'go':
      return { path: [start, { x: x + inward * 0.12 * REACH, y: y + REACH }], pace: 1 };
    case 'seam':
      return { path: [start, { x: x + inward * 0.4 * REACH, y: y + REACH }], pace: 1 };
    case 'slant': {
      const d = depth ?? 2;
      return { path: [...stem(d), { x: x + inward * 0.6 * REACH, y: y + d + REACH }], pace: 1 };
    }
    case 'out': {
      const d = depth ?? 10;
      return { path: [...stem(d), { x: x + outward * REACH, y: y + d + 0.5 }], pace: 1 };
    }
    case 'in': {
      const d = depth ?? 10;
      return { path: [...stem(d), { x: x + inward * REACH, y: y + d + 0.5 }], pace: 1 };
    }
    case 'curl': {
      const d = depth ?? 10;
      return { path: [...stem(d), { x: x + inward * 1.5, y: y + d - 1.5 }], pace: 1 };
    }
    case 'comeback': {
      const d = depth ?? 14;
      return { path: [...stem(d), { x: x + outward * 2.5, y: y + d - 3.5 }], pace: 1 };
    }
    case 'corner': {
      const d = depth ?? 10;
      return { path: [...stem(d), { x: x + outward * REACH, y: y + d + REACH }], pace: 1 };
    }
    case 'post': {
      const d = depth ?? 10;
      return { path: [...stem(d), { x: x + inward * REACH, y: y + d + REACH }], pace: 1 };
    }
    case 'flat': {
      const dir = toward ?? outward;
      const d = depth ?? 4;
      return { path: [start, { x: x + dir * 8, y: y + d }, { x: x + dir * REACH, y: y + d + REACH * 0.2 }], pace: 0.8 };
    }
    case 'shallow': {
      const dir = toward ?? inward;
      const d = depth ?? 5;
      return {
        path: [start, { x: x + inward * 0.2, y: y + d * 0.5 }, { x: x + dir * 5, y: y + d }, { x: x + dir * REACH, y: y + d + 0.5 }],
        pace: 0.85,
      };
    }
    case 'swing': {
      const dir = toward ?? outward;
      return { path: [start, { x: x + dir * 3, y: y + 1.5 }, { x: x + dir * 8, y: y + 5.5 }, { x: x + dir * 14, y: y + 11 }], pace: 0.5 };
    }
  }
}

const DROP_DISTANCE: Record<keyof typeof DROPS, { yards: number; tau: number }> = {
  gun: { yards: 1.5, tau: 0.9 },
  '3-step': { yards: 3, tau: 0.5 },
  '5-step': { yards: 5, tau: 0.7 },
  '7-step': { yards: 7, tau: 0.9 },
};

const settle = (t: number, tau: number): number => 1 - Math.exp(-t / tau);

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
  const bits = (value: unknown): string => (typeof value === 'number' ? ` ${value}` : '');
  if ('route' in job) return `${job.route} route${job.depth ? `, ${job.depth} yards` : ''}`;
  if ('block' in job) return String(job.block).replace('-', ' ');
  if ('drop' in job) return `${job.drop} drop`;
  if ('rush' in job) return `${job.rush} rush`;
  if ('zone' in job) return `${job.zone} zone${job.side ? ` (${job.side})` : ''}`;
  if ('man' in job) return `man on ${job.man}${bits(job.cushion) ? `, ${job.cushion} yard cushion` : ''}`;
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

  for (const player of all.filter((p) => p.side === 'offense')) {
    const job = offenseJobs.get(player.id)!;
    const { start } = player;
    if ('route' in job) {
      const { path, pace } = routePath(job.route, start, job.depth, job.side);
      motions.set(player.id, run(path, job.delay ?? 0, pace));
    } else if ('block' in job && job.block === 'check-release') {
      const dir = job.side ? (job.side === 'left' ? -1 : 1) : start.x < MIDFIELD ? -1 : 1;
      const path = [start, { x: start.x + dir * 2, y: start.y + 1.2 }, { x: start.x + dir * 7, y: start.y + 5 }];
      motions.set(player.id, run(path, 1, 0.25));
    } else if ('block' in job) {
      const retreat = job.depth ?? 1.6;
      const spread = Math.abs(start.x - MIDFIELD) < 0.1 ? 0 : Math.sign(start.x - MIDFIELD) * 0.9;
      motions.set(player.id, (t) => ({ x: start.x + spread * settle(t, 0.7), y: start.y - retreat * settle(t, 0.7) }));
    } else {
      const drop = DROP_DISTANCE[job.drop];
      motions.set(player.id, (t) => ({ x: start.x, y: start.y - (job.depth ?? drop.yards) * settle(t, drop.tau) }));
    }
  }

  for (const player of all.filter((p) => p.side === 'defense')) {
    const job = defenseJobs.get(player.id)!;
    const { start } = player;
    if ('rush' in job) {
      const penetration = job.depth ?? 3;
      const drift = job.rush === 'edge' ? Math.sign(start.x - MIDFIELD || 1) * 0.8 : 0;
      motions.set(player.id, (t) => ({ x: start.x + drift * settle(t, TAU), y: start.y + penetration * settle(t, TAU) }));
    } else if ('zone' in job) {
      const { landmarks, tau } = ZONE_SHAPES[job.zone];
      const side: ZoneSide = job.side ?? (Object.keys(landmarks).length === 1 ? (Object.keys(landmarks)[0] as ZoneSide) : start.x < MIDFIELD ? 'left' : 'right');
      const landmark = landmarks[side];
      if (!landmark) throw new Error(`defense: ${player.id}: zone "${job.zone}" has no "${side}" side (${Object.keys(landmarks).join(', ')})`);
      motions.set(player.id, (t) => ({
        x: landmark.x + (start.x - landmark.x) * Math.exp(-t / tau),
        y: landmark.y + (start.y - landmark.y) * Math.exp(-t / tau),
      }));
    } else {
      const target = motions.get(job.man);
      const targetStart = offenseStart(formation, job.man);
      if (!target || !targetStart) throw new Error(`defense: ${player.id}: man target "${job.man}" is not an offensive player`);
      const lag = job.lag ?? 0.2;
      const cushion = job.cushion ?? 1;
      const gap = { x: start.x - targetStart.x, y: start.y - targetStart.y };
      motions.set(player.id, (t) => {
        const followed = target(Math.max(0, t - lag));
        const closing = Math.exp(-t / DEFENDER_TAU);
        return { x: followed.x + gap.x * closing, y: followed.y + (gap.y + cushion) * closing - cushion };
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

