import type { Play, PlayerTrack, Waypoint } from './types';
import { positionAt } from './interpolate';

/**
 * Coverage Scheme catalogue.
 *
 * A coverage scheme describes the defensive secondary, box and shell behaviour of a
 * secondary call. It is deliberately coarse-grained: the purpose of the coverage-variant
 * switcher is to expose (and teach) *how the same offensive concept attacks different
 * cover calls*, not to reproduce every NFL sub-call. The engine derives a full, playable
 * 11-player defense from the offence's actual alignment and route structure, so the
 * off-the-shelf `Play` data (whose defense is hand-authored for a single coverage) can be
 * re-rendered against any of these schemes.
 */

export type CoverageSchemeId =
  | 'cover0'
  | 'cover1'
  | 'cover2'
  | 'tampa2'
  | 'cover3'
  | 'cover4'
  | 'cover6';

export type CoverageShell = 'single-high' | 'two-high' | 'man';

export interface CoverageScheme {
  id: CoverageSchemeId;
  name: string;
  short: string;
  shell: CoverageShell;
  deepSafeties: 0 | 1 | 2;
  box: 'standard' | 'blitz' | 'spy';
  description: string;
}

export const COVERAGE_SCHEMES: CoverageScheme[] = [
  {
    id: 'cover0',
    name: 'Cover 0 — Man Press, All-Out',
    short: 'MAN · ZERO',
    shell: 'man',
    deepSafeties: 0,
    box: 'blitz',
    description:
      'Man-to-man across the board with zero deep help. Corners press, the box brings six to the quarterback, and every receiver is covered 1-on-1 — a high-risk all-or-nothing call best used against a quarterbacks with no hot-route answer.',
  },
  {
    id: 'cover1',
    name: 'Cover 1 — Man-Free',
    short: 'MAN FREE',
    shell: 'single-high',
    deepSafeties: 1,
    box: 'spy',
    description:
      'Man-to-man underneath with a single deep safety over the top (the "free" safety), who eyes the quarterback and bails over any deep threat. Corners press and trail their man; a box spy keeps eyes on the quarterback and the running back.',
  },
  {
    id: 'cover2',
    name: 'Cover 2 — Zone',
    short: '2-DEEP',
    shell: 'two-high',
    deepSafeties: 2,
    box: 'standard',
    description:
      'Two deep safeties split the field in halves, corners take the flat/curl responsibilities and the three under defenders sink into hook-to-curl zones. The classic "no deep middle, force the underneath throw" call.',
  },
  {
    id: 'tampa2',
    name: 'Tampa 2 — Milan Mike',
    short: 'TAMPA 2',
    shell: 'two-high',
    deepSafeties: 2,
    box: 'standard',
    description:
      'Cover 2 with the middle linebacker dropping to a deep middle hook, widening the two high safeties to protect the deep curls. Underneath defenders match the flat; the Mike patrols the deep seam that Cover 2 conventionally gives up.',
  },
  {
    id: 'cover3',
    name: 'Cover 3 — Sky',
    short: '3-DEEP',
    shell: 'single-high',
    deepSafeties: 1,
    box: 'standard',
    description:
      'Four-under, three-deep zone: corners take the deep thirds to each side, a single safety takes the deep middle, and the under defenders wall off the underneath. The foundational no-explosives shell.',
  },
  {
    id: 'cover4',
    name: 'Cover 4 — Quarters',
    short: 'QUARTERS',
    shell: 'two-high',
    deepSafeties: 2,
    box: 'standard',
    description:
      'Two-high quarters: corners and safeties each own a deep quarter, giving a 2-read match technique on the #2 receiver. Resilient against the deep middle while still playing tough on the perimeter.',
  },
  {
    id: 'cover6',
    name: 'Cover 6 — Quarter-Quarter-Half',
    short: 'Q-Q-H',
    shell: 'two-high',
    deepSafeties: 2,
    box: 'standard',
    description:
      'Split-field coverage: the field side plays quarters (Cover 4 rules) and the boundary side plays a half/half Cover 2 look. The most common hybrid two-high call because it blends single-side coverage pressure with boundary safety support.',
  },
];

export function getCoverageScheme(id: CoverageSchemeId): CoverageScheme {
  return COVERAGE_SCHEMES.find((s) => s.id === id) ?? getCoverageScheme(DEFAULT_COVERAGE_SCHEME);
}

export const DEFAULT_COVERAGE_SCHEME: CoverageSchemeId = 'cover3';

/** Field bounds used to keep derived waypoints inside a sane render box. */
const X_MIN = 0;
const X_MAX = 53.33;
const Y_MIN = -13;
const Y_MAX = 26;

function clampX(x: number): number {
  return Math.max(X_MIN, Math.min(X_MAX, x));
}

function clampY(y: number): number {
  return Math.max(Y_MIN, Math.min(Y_MAX, y));
}

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

function at0(track: PlayerTrack) {
  return positionAt(track, 0);
}

/**
 * Builds an ascending, de-duplicated set of sample times over a play's duration,
 * anchored on the ~1.2s mesh/read window that the rest of the app treats as the
 * disguise break point.
 */
function sampleTimes(duration: number): number[] {
  const raw = [0, 0.5, 1.2, 1.9, 2.7, 3.6, duration];
  const filtered = raw.filter((t) => t >= 0 && t <= duration);
  const unique = Array.from(new Set(filtered)).sort((a, b) => a - b);
  if (unique[unique.length - 1] !== duration) {
    unique.push(duration);
  }
  return unique;
}

type SecondaryRole =
  | 'corner-left'
  | 'corner-right'
  | 'slot'
  | 'strong-safety'
  | 'free-safety';

interface Assignment {
  role: SecondaryRole;
  receiver?: PlayerTrack;
}

const SAFETY_ID = /^(FS|SS|BS|WS|S)$/i;

/**
 * Distinguishes the deep corner/slot/safety roles of a defensive secondary from the
 * offence's split and each persona's original alignment. Falls back to a positional
 * heuristic (extreme x = corner, deepest y = free safety) so historical fronts with
 * unusual id labels still resolve.
 */
function assignSecondary(play: Play): Map<string, Assignment> {
  const dbTracks = play.defense
    .filter((d) => d.role === 'db')
    .sort((a, b) => at0(a).x - at0(b).x);

  const assignment = new Map<string, Assignment>();
  if (dbTracks.length < 2) {
    return assignment;
  }

  const receivers = eligibleReceivers(play);
  const outermost = (track: PlayerTrack) => {
    if (receivers.length === 0) return undefined;
    return receivers.reduce((a, b) =>
      Math.abs(at0(a).x - at0(track).x) < Math.abs(at0(b).x - at0(track).x) ? a : b
    );
  };

  const cornerLeft = dbTracks[0];
  const cornerRight = dbTracks[dbTracks.length - 1];
  const leftRec = receivers[0];
  const rightRec = receivers[receivers.length - 1];
  assignment.set(cornerLeft.id, { role: 'corner-left', receiver: leftRec });
  assignment.set(cornerRight.id, { role: 'corner-right', receiver: rightRec });

  const rest = dbTracks.filter((t) => t !== cornerLeft && t !== cornerRight);
  const explicitSlots = rest.filter((t) => !SAFETY_ID.test(t.id));

  // The slot/nickel exists on a 5-DB nickel front: an explicit slot id, or (when all of
  // the mid DBs are safeties) the shallowest mid-DB. A 4-DB front has no slot at all.
  let slotDb: PlayerTrack | undefined;
  if (explicitSlots.length > 0) {
    slotDb = explicitSlots[0];
  } else if (rest.length >= 3) {
    slotDb = rest.reduce((a, b) => (at0(a).y < at0(b).y ? a : b));
  }

  // A slot defender matches the nearest inner receiver (one that no corner owns).
  if (slotDb) {
    const inner = receivers.filter(
      (r) => r !== leftRec && r !== rightRec && r.role !== 'ol'
    );
    const match =
      inner.length > 0
        ? inner.reduce((a, b) =>
            Math.abs(at0(a).x - at0(slotDb).x) < Math.abs(at0(b).x - at0(slotDb).x) ? a : b
          )
        : undefined;
    assignment.set(slotDb.id, { role: 'slot', receiver: match });
  }

  const deepCandidates = rest.filter((t) => t !== slotDb);
  deepCandidates.sort((a, b) => at0(b).y - at0(a).y);

  if (deepCandidates.length > 0) {
    assignment.set(deepCandidates[0].id, { role: 'free-safety', receiver: outermost(deepCandidates[0]) });
  }
  if (deepCandidates.length > 1) {
    assignment.set(deepCandidates[1].id, { role: 'strong-safety', receiver: outermost(deepCandidates[1]) });
  }

  return assignment;
}

/** The offence's eligible receivers (WR/TE) sorted by lateral alignment. */
function eligibleReceivers(play: Play): PlayerTrack[] {
  return play.offense
    .filter((o) => o.role === 'wr' || o.role === 'te')
    .sort((a, b) => at0(a).x - at0(b).x);
}

/** The snap x-coordinate of the offence (centre, or the mean of the offensive line). */
function snapX(play: Play): number {
  const line = play.offense.filter((o) => o.role === 'ol');
  const c = play.offense.find((o) => o.id === 'C');
  if (c) {
    return at0(c).x;
  }
  if (line.length > 0) {
    return line.reduce((sum, t) => sum + at0(t).x, 0) / line.length;
  }
  return play.offense.reduce((sum, t) => sum + at0(t).x, 0) / play.offense.length;
}

/**
 * Produces a target (x, y) for a defensive persona at time `t` under a given scheme,
 * given its role and (optional) assigned receiver. This is the single place the coverage
 * variant ships its schematic personality.
 */
function secondaryTarget(
  scheme: CoverageScheme,
  assignment: Assignment,
  persona: PlayerTrack,
  snapXValue: number,
  t: number
): { x: number; y: number } {
  const base = at0(persona);

  const rec = assignment.receiver;
  const recPos = rec ? positionAt(rec, t) : undefined;

  switch (assignment.role) {
    case 'corner-left':
    case 'corner-right': {
      const isFieldSide = assignment.role === 'corner-right';
      const recX = recPos ? recPos.x : base.x;

      if (scheme.id === 'cover0' || scheme.id === 'cover1') {
        // Press/trail man: mirror the receiver while staying a step in front.
        const y = recPos ? clampY(recPos.y + 2.0) : clampY(lerp(base.y, 8, unit(t, 3.5)));
        return { x: clampX(recX - 1.0), y };
      }

      if (scheme.id === 'cover3') {
        // Deep third: bail outside the vertical seam, hold the deep landmark.
        const y = t < 1.2 ? clampY(lerp(base.y, 4.5, unit(t, 1.2))) : clampY(Math.max(12, (recPos?.y ?? 0) + 2.0));
        return { x: clampX(recX), y };
      }

      if (scheme.id === 'cover4') {
        // Quarters: carry the vertical but never over-commit outside the hash.
        const y = t < 1.2 ? clampY(lerp(base.y, 4.5, unit(t, 1.2))) : clampY(Math.max(9, (recPos?.y ?? 0) + 1.5));
        return { x: clampX(recX), y };
      }

      if (scheme.id === 'cover6') {
        // Split field: boundary side loses the deep quarter and plays flat.
        const deep = isFieldSide !== (recX < snapXValue) ? 'quarter' : 'flat';
        if (deep === 'quarter') {
          const y = t < 1.2 ? clampY(lerp(base.y, 4.5, unit(t, 1.2))) : clampY(Math.max(9, (recPos?.y ?? 0) + 1.5));
          return { x: clampX(recX), y };
        }
        const y = clampY(Math.min(4.5, lerp(base.y, 4.0, unit(t, 1.2))));
        return { x: clampX((recPos?.x ?? base.x) - 1.0), y };
      }

      // Cover 2 / Tampa 2: corner is the flat defender; sink to the curl.
      const y = clampY(Math.min(4.5, lerp(base.y, 4.0, unit(t, 1.2))));
      return { x: clampX((recPos?.x ?? base.x) - 1.0), y };
    }

    case 'slot': {
      if (scheme.id === 'cover0' || scheme.id === 'cover1') {
        const y = recPos ? clampY(recPos.y + 2.0) : clampY(lerp(base.y, 8, unit(t, 3.5)));
        return { x: clampX((recPos?.x ?? base.x) - 0.5), y };
      }
      // Zone: play the hook/curl wall underneath the #2 receiver.
      const y = clampY(lerp(base.y, 7.5, unit(t, 1.6)));
      const x = clampX((recPos?.x ?? base.x) - 1.0);
      return { x, y };
    }

    case 'free-safety': {
      if (scheme.id === 'cover0') {
        // No deep help: the free safety becomes a box accumulator who blitzes the A-gap.
        const y = t < 1.0 ? clampY(lerp(base.y, 2.0, unit(t, 1.0))) : clampY(lerp(2.0, -4.0, unit(t, 3)));
        return { x: clampX(snapXValue), y };
      }

      const single = scheme.shell === 'single-high';
      if (single) {
        // Deep middle, drifting toward the ball-side threat.
        const threatX = recPos ? recPos.x : snapXValue;
        const x = clampX(lerp(snapXValue, threatX, 0.25 * unit(t, 3.5)));
        const y = clampY(lerp(base.y, 15.0, unit(t, 1.4)));
        return { x, y };
      }

      // Two-high: own a half alongside the strong safety.
      const x = clampX(snapXValue + 9 * twoHighSide(persona, assignment, snapXValue));
      const y = clampY(lerp(base.y, 12.0, unit(t, 1.4)));
      return { x, y };
    }

    case 'strong-safety': {
      if (scheme.id === 'cover0') {
        // Box accumulator: outside blitz toward the boundary.
        const y = t < 1.0 ? clampY(lerp(base.y, 1.0, unit(t, 1.0))) : clampY(lerp(1.0, -4.0, unit(t, 3)));
        return { x: clampX(snapXValue - 4), y };
      }

      if (scheme.id === 'cover1') {
        // Man-help on the slot receiver underneath the free safety.
        const y = recPos ? clampY(recPos.y + 2.0) : clampY(lerp(base.y, 8, unit(t, 3.5)));
        return { x: clampX((recPos?.x ?? base.x) - 0.5), y };
      }

      const single = scheme.shell === 'single-high';
      if (single) {
        // Cover 3 strong safety becomes the overhang/curl-to-flat robber.
        const y = clampY(lerp(base.y, 8.5, unit(t, 1.6)));
        return { x: clampX(lerp(base.x, snapXValue, 0.3 * unit(t, 1.6))), y };
      }

      // Two-high: own the opposite half.
      const x = clampX(snapXValue + 9 * twoHighSide(persona, assignment, snapXValue));
      const y = clampY(lerp(base.y, 12.0, unit(t, 1.4)));
      return { x, y };
    }

    default: {
      return { x: clampX(base.x), y: clampY(base.y) };
    }
  }
}

function unit(t: number, at: number): number {
  if (at <= 0) {
    return 1;
  }
  return Math.max(0, Math.min(1, t / at));
}

/**
 * Lateral side of a two-high safety: -1 (boundary) or +1 (field). The two deep safeties split
 * the field symmetrically around the centre snap point, deterministically by role, so the
 * shell never stacks both safeties on one half regardless of their authored pre-snap align.
 */
function twoHighSide(_persona: PlayerTrack, assignment: Assignment, _snapXValue: number): number {
  return assignment.role === 'free-safety' ? 1 : -1;
}

/** Recomputes a defensive DB persona's waypoints for the chosen scheme. */
function buildSecondaryTrack(
  play: Play,
  scheme: CoverageScheme,
  persona: PlayerTrack,
  assignment: Assignment,
  snapXValue: number
): PlayerTrack {
  const times = sampleTimes(play.duration);
  const waypoints: Waypoint[] = times.map((t) => {
    const pos = secondaryTarget(scheme, assignment, persona, snapXValue, t);
    return { t, x: clampX(pos.x), y: clampY(pos.y) };
  });
  return { ...persona, waypoints };
}

/** Recomputes a box (LB) persona's waypoints for the chosen scheme. */
function buildBoxTrack(
  scheme: CoverageScheme,
  persona: PlayerTrack,
  snapXValue: number,
  duration: number
): PlayerTrack {
  const times = sampleTimes(duration);
  const base = at0(persona);
  const waypoints: Waypoint[] = times.map((t) => {
    let x = base.x;
    let y = base.y;

    if (scheme.box === 'blitz') {
      // Cover 0: linebackers attack the backfield through the gaps.
      x = clampX(lerp(base.x, snapXValue, 0.5 * unit(t, 2.5)));
      y = clampY(lerp(base.y, -5.0, unit(t, 2.5)));
    } else if (scheme.box === 'spy') {
      // Cover 1: a shifty spy keeps eyes on the QB / RB, staying shallow.
      y = clampY(base.y < 6 ? lerp(base.y, 6.5, unit(t, 1.4)) : base.y);
    } else if (scheme.id === 'tampa2' && /^MIKE$/i.test(persona.id)) {
      // Tampa 2: the Mike sinks to the deep middle hook.
      y = clampY(lerp(base.y, 10.5, unit(t, 1.8)));
    } else {
      // Standard zone: read the run then sink into the hook/curl wall.
      const read = 1.2;
      if (t < read) {
        y = clampY(base.y + unit(t, read) * 1.0);
      } else {
        y = clampY(lerp(base.y + 1.0, 8.0, unit(t - read, 2.0)));
      }
    }

    return { t, x: clampX(x), y: clampY(y) };
  });
  return { ...persona, waypoints };
}

/**
 * Derives a fully playable defensive unit for a play under a given coverage scheme.
 *
 * The offence is untouched. The defensive line keeps its authored front/rush waypoints;
 * the box (linebackers) and secondary (defensive backs) are re-schemed against the
 * offence's actual alignment and route structure so the variant is a genuine re-call of
 * the same concept, not a cosmetic re-tint.
 */
export function buildCoverageDefense(play: Play, schemeId: CoverageSchemeId): PlayerTrack[] {
  const scheme = getCoverageScheme(schemeId);
  const assignments = assignSecondary(play);
  const snap = snapX(play);

  return play.defense.map((persona) => {
    if (persona.role === 'dl') {
      return { ...persona };
    }
    if (persona.role === 'lb') {
      return buildBoxTrack(scheme, persona, snap, play.duration);
    }
    const assignment = assignments.get(persona.id);
    if (assignment) {
      return buildSecondaryTrack(play, scheme, persona, assignment, snap);
    }
    return { ...persona };
  });
}

/**
 * Builds a full Play variant whose defense reflects a coverage scheme, keeping the
 * offence, beats, summary, sequence and metadata of the original untouched.
 */
export function buildCoverageVariant(play: Play, schemeId: CoverageSchemeId): Play {
  return {
    ...play,
    coverage: getCoverageScheme(schemeId).name,
    defense: buildCoverageDefense(play, schemeId),
  };
}

/**
 * Whether a play is a good candidate for the coverage-variant switcher. We require a
 * conventional offensive alignment (a centre and eligible receivers) and a conventional
 * secondary so the derived defense stays coherent and beat focus ids stay valid.
 */
export function supportsCoverageVariant(play: Play): boolean {
  const hasCenter = play.offense.some((o) => o.id === 'C' || o.role === 'ol');
  const hasEligible = eligibleReceivers(play).length >= 2;
  const hasSecondary = play.defense.filter((d) => d.role === 'db').length >= 4;
  const hasKeyDefense = play.defense.some((d) => /^(FS|SS|LCB|RCB)$/i.test(d.id));
  return hasCenter && hasEligible && hasSecondary && hasKeyDefense;
}
