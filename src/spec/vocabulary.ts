/**
 * Vocabulary v0 of the play spec: the closed list of things a player can be told to do. Every term has a definition,
 * which is published as the `description` of that term in `data/schema/spec.schema.json`.
 *
 * "Left" and "right" are x-axis directions as the field is drawn (left is x = 0). "Inward" is toward the middle of
 * the field (x = 26.67) and "outward" toward the nearer sideline.
 */

export const ROUTES = {
  go: 'Vertical release straight upfield.',
  seam: 'Vertical release up the seam between the numbers and the hash, leaning toward the middle (the lean is unverified against tracking data).',
  slant: 'Stem of about 3 yards, then a hard 45-degree cut toward the middle.',
  out: 'Stem to `depth`, then a flat 90-degree cut toward the sideline.',
  in: 'Stem to `depth`, then a flat 90-degree cut toward the middle (a dig).',
  curl: 'Stem to `depth`, then turn back toward the quarterback and settle.',
  comeback: 'Stem to `depth`, then return toward the sideline and the quarterback.',
  corner: 'Stem to `depth`, then a 45-degree cut toward the sideline and the pylon.',
  post: 'Stem to `depth`, then a 45-degree cut toward the goalposts.',
  flat: 'Quick release toward the sideline, reaching `depth` yards upfield.',
  shallow: 'Short crossing route that runs the field at `depth` yards, under the linebackers.',
  swing: "A back's slow arc toward the sideline, staying behind the line of scrimmage while widening.",
} as const;

export const BLOCKS = {
  'pass-set': 'Retreat a step or two and form the pocket, spreading away from the center.',
  'check-release': 'Check for a blitzer first, then release into the flat on the `side` given.',
} as const;

export const DROPS = {
  gun: 'Shotgun drop: about 1.5 yards back from the alignment.',
  '3-step': 'Three-step drop from under center: about 3 yards back, quickly.',
  '5-step': 'Five-step drop from under center: about 5 yards back.',
  '7-step': 'Seven-step drop from under center: about 7 yards back, unhurried.',
} as const;

export const RUSHES = {
  edge: 'Rush the passer around the tackle: get into the backfield while drifting slightly toward the quarterback.',
  interior: 'Rush the passer between the tackles: get into the backfield on a straight line.',
} as const;

export const ZONES = {
  hole: 'Underneath zone in the middle of the field, about 10 yards deep.',
  'hook-curl': 'Underneath zone between the hash and the numbers, about 9 yards deep.',
  'curl-flat': 'Underneath zone outside the hash, about 7 yards deep.',
  flat: 'Shallow outside zone, about 4 yards deep along the sideline.',
  'quarter-outside': 'Outside deep quarter of the field, about 16 yards deep.',
  'quarter-inside': 'Inside deep quarter of the field, about 16 yards deep.',
  'deep-half': 'One half of the deep field, about 15 yards deep.',
  'deep-third': 'One third of the deep field, about 15 yards deep.',
  'deep-free': 'Deep middle of the field, about 15 yards deep: the single-high safety.',
} as const;

/** A deep zone is defended by one player; a spec that gives two players the same deep zone and side is refused. */
export const DEEP_ZONES: readonly (keyof typeof ZONES)[] = ['quarter-outside', 'quarter-inside', 'deep-half', 'deep-third', 'deep-free'];

export const MAN = 'Follow the offensive player named in `man`, trailing him about `cushion` yards behind.';

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
  /** Seconds the defender takes to close about two thirds of the way to his landmark. Deep defenders hold and shade; underneath defenders drive. */
  tau: number;
}

export const ZONE_SHAPES: Record<Zone, ZoneShape> = {
  hole: { tau: 0.95, landmarks: { middle: { x: 26.67, y: 10 } } },
  'hook-curl': { tau: 0.95, landmarks: { left: { x: 21, y: 9 }, right: { x: 32.3, y: 9 } } },
  'curl-flat': { tau: 0.95, landmarks: { left: { x: 12, y: 7 }, right: { x: 41.3, y: 7 } } },
  flat: { tau: 0.95, landmarks: { left: { x: 7, y: 4 }, right: { x: 46.3, y: 4 } } },
  'quarter-outside': { tau: 1.8, landmarks: { left: { x: 9, y: 16 }, right: { x: 44.3, y: 16 } } },
  // Landmarks are the centres of the two inside quarters of the field (3/8 and 5/8 of its width).
  'quarter-inside': { tau: 4, landmarks: { left: { x: 20, y: 16 }, right: { x: 33.3, y: 16 } } },
  'deep-half': { tau: 4, landmarks: { left: { x: 14, y: 15 }, right: { x: 39.3, y: 15 } } },
  'deep-third': { tau: 2.5, landmarks: { left: { x: 9, y: 15 }, middle: { x: 26.67, y: 16 }, right: { x: 44.3, y: 15 } } },
  'deep-free': { tau: 4, landmarks: { middle: { x: 26.67, y: 15 } } },
};
