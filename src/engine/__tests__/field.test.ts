import { describe, expect, it } from 'vitest';
import { FIELD_WIDTH_YARDS, HASHES, MIDFIELD_X, ballX, levelOfEra, spotOffset } from '../field';

describe('field geometry', () => {
  it('puts the published ball at the middle of a 53 1/3 yard field', () => {
    expect(MIDFIELD_X).toBeCloseTo(FIELD_WIDTH_YARDS / 2, 1);
    expect(ballX('nfl')).toBe(MIDFIELD_X);
    expect(ballX('college', 'middle')).toBe(MIDFIELD_X);
  });

  it('places NFL hash marks 18 ft 6 in apart and college hash marks 40 ft apart, both centered', () => {
    const feet = (level: 'nfl' | 'college') => (HASHES[level].right - HASHES[level].left) * 3;
    expect(feet('nfl')).toBeCloseTo(18.5, 0);
    expect(feet('college')).toBeCloseTo(40, 0);
    for (const level of ['nfl', 'college'] as const) {
      expect((HASHES[level].left + HASHES[level].right) / 2).toBeCloseTo(MIDFIELD_X, 1);
    }
  });

  it('spots the ball on the hash a concept names', () => {
    expect(ballX('nfl', 'left')).toBe(23.58);
    expect(ballX('nfl', 'right')).toBe(29.75);
    expect(ballX('college', 'left')).toBe(20);
    expect(ballX('college', 'right')).toBe(33.33);
  });

  it('gives the shift to add to a published x value', () => {
    expect(spotOffset('nfl')).toBe(0);
    expect(spotOffset('nfl', 'left')).toBe(-3.09);
    expect(spotOffset('college', 'right')).toBe(6.66);
    // The left and right shifts mirror each other.
    expect(spotOffset('college', 'left')).toBeCloseTo(-spotOffset('college', 'right'), 1);
  });

  it('draws college eras on a college field and every other era on an NFL field', () => {
    expect(levelOfEra('current-college')).toBe('college');
    expect(levelOfEra('past-college')).toBe('college');
    expect(levelOfEra('modern-nfl')).toBe('nfl');
    expect(levelOfEra('past-nfl')).toBe('nfl');
  });
});
