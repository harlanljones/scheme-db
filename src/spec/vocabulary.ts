/**
 * Vocabulary v0 of the play spec: the closed list of things a player can be told to do. Every term has a definition,
 * which is published as the `description` of that term in `data/schema/spec.schema.json`.
 *
 * "Left" and "right" are x-axis directions as the field is drawn (left is x = 0). "Inward" is toward the middle of
 * the field (x = 26.67) and "outward" toward the nearer sideline.
 */

export const ROUTES = {
  go: 'Vertical release straight upfield.',
  seam: 'Vertical release up the seam between the numbers and the hash, leaning about 10 degrees toward the middle (the lean is unverified).',
  slant: 'Stem of about 3 yards, then a hard cut toward the middle at about 50 degrees from vertical.',
  out: 'Stem to `depth` (default 10), then a nearly flat cut toward the sideline, about 80 degrees from vertical.',
  in: 'Stem to `depth` (default 10), then a cut toward the middle at about 75 degrees from vertical (a dig). A `depth` of 5 gives a quick in.',
  curl: 'Stem to `depth` (default 11), then turn back toward the quarterback and settle. A `depth` of 5 gives a hitch.',
  comeback: 'Stem to `depth` (default 13), then return toward the sideline and the quarterback.',
  corner: 'Stem to `depth` (default 12), then a cut toward the sideline and the pylon at about 40 degrees from vertical.',
  post: 'Stem to `depth` (default 12), then a cut toward the goalposts at about 40 degrees from vertical.',
  flat: 'Quick release toward the sideline, reaching `depth` yards upfield of the start (default 3 for a receiver, 4 for a back, who stays behind the line).',
  shallow: 'Short crossing route that runs the field at `depth` yards upfield of the start (default 4), under the linebackers.',
  swing: "A back's slow arc toward the sideline, staying behind the line of scrimmage while widening.",
} as const;

export const BLOCKS = {
  'pass-set': 'Retreat and form the pocket, spreading away from the center, stopping about a yard in front of the quarterback.',
  'check-release': 'Check for a blitzer for a moment, then release into the flat on the `side` given.',
} as const;

export const DROPS = {
  gun: 'Shotgun drop: about 3 yards back from the alignment, set by about 2 seconds.',
  '3-step': 'Three-step drop from under center: about 3.5 yards back, quickly.',
  '5-step': 'Five-step drop from under center: about 6 yards back.',
  '7-step': 'Seven-step drop from under center: about 8 yards back, unhurried.',
} as const;

export const RUSHES = {
  edge: 'Rush the passer around the tackle: get into the backfield, drifting toward the quarterback. `depth` caps the yards gained.',
  interior: 'Rush the passer between the tackles: get into the backfield on a straight line. `depth` caps the yards gained.',
} as const;

export const ZONES = {
  hole: 'Underneath zone in the middle of the field, about 9 yards deep.',
  'hook-curl': 'Underneath zone between the hash and the numbers, about 9 yards deep.',
  'curl-flat': 'Underneath zone outside the hash, about 8 yards deep.',
  flat: 'Shallow outside zone, about 7 yards deep, near the sideline.',
  'quarter-outside': 'Outside deep quarter of the field, about 16 yards deep.',
  'quarter-inside': 'Inside deep quarter of the field, about 18 yards deep.',
  'deep-half': 'One half of the deep field, about 22 yards deep.',
  'deep-third': 'One third of the deep field, about 17 yards deep at the sidelines and 22 in the middle.',
  'deep-free': 'Deep middle of the field, about 22 yards deep: the single-high safety.',
} as const;

/** A deep zone is defended by one player; a spec that gives two players the same deep zone and side is refused. */
export const DEEP_ZONES: readonly (keyof typeof ZONES)[] = ['quarter-outside', 'quarter-inside', 'deep-half', 'deep-third', 'deep-free'];

export const MAN = 'Follow the offensive player named in `man`, a few tenths of a second behind him. The `technique` sets where he finishes: press and off over the top, trail behind.';

export const TECHNIQUES = ['off', 'press', 'trail'] as const;

export type Route = keyof typeof ROUTES;
export type Block = keyof typeof BLOCKS;
export type Drop = keyof typeof DROPS;
export type Rush = keyof typeof RUSHES;
export type Zone = keyof typeof ZONES;

export const keysOf = <T extends Record<string, string>>(table: T): [keyof T & string, ...(keyof T & string)[]] =>
  Object.keys(table) as [keyof T & string, ...(keyof T & string)[]];

export interface Point {
  x: number;
  y: number;
}

export type ZoneSide = 'left' | 'middle' | 'right';

export interface ZoneShape {
  /** Where the zone is defended, per side. A missing side means that zone does not exist there. */
  landmarks: Partial<Record<ZoneSide, Point>>;
  /** Deep halves read the quarterback and start moving earlier (see `ZONE_TIMING`). */
  early?: boolean;
}

// Landmarks are where defenders are when the ball arrives, in yards from the line (see calibration.ts for the source).
// The ball is at midfield, x = 26.67. The inside quarters sit 6.5 yards either side of it.
export const ZONE_SHAPES: Record<Zone, ZoneShape> = {
  hole: { landmarks: { middle: { x: 26.67, y: 9 } } },
  'hook-curl': { landmarks: { left: { x: 21.2, y: 9 }, right: { x: 32.2, y: 9 } } },
  'curl-flat': { landmarks: { left: { x: 15.5, y: 8.5 }, right: { x: 37.8, y: 8.5 } } },
  flat: { landmarks: { left: { x: 9.5, y: 7 }, right: { x: 43.8, y: 7 } } },
  'quarter-outside': { landmarks: { left: { x: 10.7, y: 16 }, right: { x: 42.6, y: 16 } } },
  'quarter-inside': { landmarks: { left: { x: 20.2, y: 18 }, right: { x: 33.2, y: 18 } } },
  'deep-half': { early: true, landmarks: { left: { x: 16.3, y: 22 }, right: { x: 37, y: 22 } } },
  'deep-third': { landmarks: { left: { x: 11.5, y: 17 }, middle: { x: 26.67, y: 22 }, right: { x: 41.8, y: 17 } } },
  'deep-free': { landmarks: { middle: { x: 26.67, y: 22 } } },
};
