/**
 * Vocabulary v0 of the play spec: the closed list of things a player can be told to do. Every term has a definition,
 * which is published as the `description` of that term in `data/schema/spec.schema.json`.
 *
 * "Left" and "right" are x-axis directions as the field is drawn (left is x = 0). "Inward" is toward the middle of
 * the field (x = 26.67) and "outward" toward the nearer sideline.
 */

export const ROUTES = {
  go: 'Vertical release straight upfield, leaning slightly toward the middle.',
  seam: 'Vertical release up the seam between the numbers and the hash, leaning toward the middle.',
  slant: 'Short stem, then a hard cut toward the middle at about 30 degrees from vertical.',
  out: 'Stem to `depth`, then a flat 90-degree cut toward the sideline.',
  in: 'Stem to `depth`, then a flat 90-degree cut toward the middle (a dig).',
  curl: 'Stem to `depth`, then turn back toward the quarterback and settle.',
  comeback: 'Stem to `depth`, then return toward the sideline and the quarterback.',
  corner: 'Stem to `depth`, then a 45-degree cut toward the sideline and the pylon.',
  post: 'Stem to `depth`, then a 45-degree cut toward the goalposts.',
  flat: 'Quick release toward the sideline, reaching `depth` yards upfield.',
  shallow: 'Short crossing route that runs the field at `depth` yards, under the linebackers.',
  swing: "A back's slow arc toward the sideline behind and then past the line, reaching upfield.",
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
  edge: 'Rush the passer around the tackle, keeping contain: penetrate while drifting outward.',
  interior: 'Rush the passer between the tackles: penetrate straight upfield.',
} as const;

export const ZONES = {
  hook: 'Underneath zone in the middle of the field, about 9 to 10 yards deep.',
  'curl-flat': 'Underneath zone outside the hash, about 7 yards deep.',
  flat: 'Shallow outside zone, about 4 yards deep along the sideline.',
  'deep-quarter': 'Outside deep quarter of the field, about 16 yards deep.',
  'deep-half': 'One half of the deep field, about 15 yards deep.',
  'deep-third': 'One third of the deep field, about 15 yards deep.',
  'deep-middle': 'Deep middle of the field, about 15 yards deep.',
} as const;

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
  hook: { tau: 0.95, landmarks: { left: { x: 21, y: 9 }, middle: { x: 26.67, y: 10 }, right: { x: 32.3, y: 9 } } },
  'curl-flat': { tau: 0.95, landmarks: { left: { x: 12, y: 7 }, right: { x: 41.3, y: 7 } } },
  flat: { tau: 0.95, landmarks: { left: { x: 7, y: 4 }, right: { x: 46.3, y: 4 } } },
  'deep-quarter': { tau: 1.8, landmarks: { left: { x: 9, y: 16 }, right: { x: 44.3, y: 16 } } },
  'deep-half': { tau: 4, landmarks: { left: { x: 14, y: 15 }, right: { x: 39.3, y: 15 } } },
  'deep-third': { tau: 2.5, landmarks: { left: { x: 9, y: 15 }, middle: { x: 26.67, y: 16 }, right: { x: 44.3, y: 15 } } },
  'deep-middle': { tau: 4, landmarks: { middle: { x: 26.67, y: 15 } } },
};
