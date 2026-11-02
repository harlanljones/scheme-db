/**
 * Field geometry shared by the engine, the release tables and the site.
 *
 * Published coordinates are drawn with the ball at midfield (x = MIDFIELD_X), so a play reads the same wherever
 * it is spotted. A concept's `ballSpot` says where the ball really sits: on the left hash, in the middle, or on
 * the right hash. Add `spotOffset` to an x value to get the position on the field.
 */
export const FIELD_WIDTH_YARDS = 53.33;

/** Where the ball sits in every published track: the middle of the field. */
export const MIDFIELD_X = 26.67;

export type Level = 'nfl' | 'college';
export type BallSpot = 'left' | 'middle' | 'right';

/**
 * Hash marks in yards from the left sideline. NFL hash marks are 70 ft 9 in from each sideline, so they are 18 ft 6 in
 * apart. College hash marks are 60 ft (20 yards) from each sideline.
 */
export const HASHES: Record<Level, { left: number; right: number }> = {
  nfl: { left: 23.58, right: 29.75 },
  college: { left: 20, right: 33.33 },
};

export const LEVEL_LABELS: Record<Level, string> = { nfl: 'NFL', college: 'College' };

/** Past and current college schemes are drawn on a college field, NFL schemes on an NFL field. */
export function levelOfEra(era: string): Level {
  return era === 'current-college' || era === 'past-college' ? 'college' : 'nfl';
}

/** Where the ball sits across the field, in yards from the left sideline. */
export function ballX(level: Level, spot: BallSpot = 'middle'): number {
  if (spot === 'left') return HASHES[level].left;
  if (spot === 'right') return HASHES[level].right;
  return MIDFIELD_X;
}

/** Yards to add to a published x value to place the play where its ball is spotted. */
export function spotOffset(level: Level, spot: BallSpot = 'middle'): number {
  return Math.round((ballX(level, spot) - MIDFIELD_X) * 100) / 100;
}
