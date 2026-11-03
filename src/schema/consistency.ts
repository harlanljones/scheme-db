import { positionAt } from '../engine/interpolate';
import { LIMITS } from '../engine/limits';
import { snapMotion } from '../engine/speed';
import type { Concept, Tracks } from './schema';

/**
 * Checks that what a play says about itself matches what it draws. A concept's text (its formation, its personnel,
 * its front) and its tracks are written separately, so they can disagree; these read both and say where.
 *
 *  - Alignment: the offense lines up on its own side of the ball, with seven on the line of scrimmage.
 *  - Depth: a quarterback in the gun stands about five yards deep, one under center stands close to the line.
 *  - Labels: the personnel and the secondary a play names are the ones it draws.
 *
 * All three read only the first waypoints of the tracks, the text fields of the concept, and the snap.
 */

/** Yards past the line of scrimmage an offensive player may stand. The ball is at 0. */
const OFFSIDE_TOLERANCE = 0.05;

/** A player this close to the line, or closer, is on it: the offensive line stands at -0.4 and a split end at -0.5. */
export const ON_LINE_DEPTH = 1;

/** Offensive players that must be on the line of scrimmage at the snap. */
export const MIN_ON_LINE = 7;

/** A quarterback in the shotgun is at least this many yards behind the line. The usual depth is five. */
export const GUN_QB_DEPTH = 3.5;

/** A pistol quarterback stands between these two depths (about four). */
export const PISTOL_QB_DEPTH = [3, 5] as const;

/** A quarterback under center is no deeper than this. */
export const CENTER_QB_DEPTH = 2.5;

/** In the shotgun a back stands about level with the quarterback, and no deeper than this many yards behind him. */
export const GUN_BACK_BEHIND_QB = 1.5;

const one = (value: number): string => (Math.round(value * 10) / 10).toString();

/** A scaffolded play leaves "TODO: ..." in the text it has not written yet; `data:validate` reports those on their own, so these checks skip them. */
const unwritten = (text: string | undefined): boolean => /^\s*TODO\b/i.test(text ?? '');

/** Offside, and the seven on the line. */
function lineProblems(tracks: Tracks): string[] {
  const problems: string[] = [];
  for (const track of tracks.offense) {
    const past = track.waypoints.find((waypoint) => waypoint.t <= 0 && waypoint.y > OFFSIDE_TOLERANCE);
    if (past) problems.push(`${track.id} is ${one(past.y)} yd past the line of scrimmage ${past.t < 0 ? 'before' : 'at'} the snap; an offensive player must stand at or behind it`);
  }

  // A player moving at the snap is in motion, not on the line, whatever his depth.
  const onLine = tracks.offense.filter((track) => positionAt(track, 0).y >= -ON_LINE_DEPTH && snapMotion(track).speed <= LIMITS.movingAtSnap).length;
  if (onLine < MIN_ON_LINE) problems.push(`only ${onLine} offensive players are on the line of scrimmage at the snap; ${MIN_ON_LINE} are required`);
  return problems;
}

/** The quarterback's depth and the backs' depth against the formation the concept names. */
function depthProblems(concept: Concept, tracks: Tracks): string[] {
  const problems: string[] = [];
  const quarterback = tracks.offense.find((track) => track.role === 'qb');
  if (!quarterback) return problems;
  const depth = -positionAt(quarterback, 0).y;
  const text = concept.formation;
  if (unwritten(text)) return problems;
  const underCenter = /under[- ]center/i.test(text);
  const gun = /\b(?:shotgun|gun|empty)\b/i.test(text) && !underCenter;
  const pistol = /\bpistol\b/i.test(text);

  if (gun && !pistol && depth < GUN_QB_DEPTH) {
    problems.push(`the formation says "${text}" but the quarterback stands ${one(depth)} yd behind the line, which is under center; a shotgun quarterback is about 5 yd deep`);
  }
  if (pistol && (depth < PISTOL_QB_DEPTH[0] || depth > PISTOL_QB_DEPTH[1])) {
    problems.push(`the formation says "${text}" but the quarterback stands ${one(depth)} yd behind the line; a pistol quarterback is about 4 yd deep`);
  }
  if (underCenter && depth > CENTER_QB_DEPTH) {
    problems.push(`the formation says "${text}" but the quarterback stands ${one(depth)} yd behind the line, which is the gun`);
  }
  if (gun && !pistol) {
    for (const back of tracks.offense.filter((track) => track.role === 'rb')) {
      const behind = -positionAt(back, 0).y - depth;
      if (behind > GUN_BACK_BEHIND_QB) problems.push(`${back.id} stands ${one(behind)} yd deeper than the quarterback in the gun; a back stands about level with him`);
    }
  }
  return problems;
}

/** Players of each position the play draws. */
const drawn = (tracks: Tracks['offense'], role: string): number => tracks.filter((track) => track.role === role).length;

/** The personnel a concept states for the offense ("11", "21P Pony", "22 Jumbo") and the secondary a front names ("Nickel 4-2-5"). */
function labelProblems(concept: Concept, tracks: Tracks): string[] {
  const problems: string[] = [];

  const offense = unwritten(concept.personnel) ? null : /^(\d)(\d)(?!\d)/.exec(concept.personnel);
  if (offense) {
    const backs = drawn(tracks.offense, 'rb');
    const ends = drawn(tracks.offense, 'te');
    if (Number(offense[1]) !== backs || Number(offense[2]) !== ends) {
      problems.push(`personnel says "${concept.personnel}" (${offense[1]} RB, ${offense[2]} TE) but the offense draws ${backs} RB and ${ends} TE`);
    }
  }

  // A front written as "4-2-5" says how many defensive backs it has. Only the first three numbers of a field count: "(3-1-7 Drop)" is a drop.
  const backs = drawn(tracks.defense, 'db');
  for (const [field, text] of [['personnel', concept.personnel], ['frontName', concept.frontName]] as const) {
    const front = unwritten(text) ? null : /\b(\d)-(\d)-(\d)\b/.exec(text ?? '');
    if (front && Number(front[1]) + Number(front[2]) + Number(front[3]) === 11 && Number(front[3]) !== backs) {
      problems.push(`${field} says "${text}" (${front[3]} defensive backs) but the defense draws ${backs}`);
    }
  }
  return problems;
}

/** Everything about a play's text and tracks that disagree. One sentence per problem, with no concept id: the caller adds it. */
export function consistencyProblems(concept: Concept, tracks: Tracks): string[] {
  return [...lineProblems(tracks), ...depthProblems(concept, tracks), ...labelProblems(concept, tracks)];
}
