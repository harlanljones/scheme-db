import { describe, it, expect } from 'vitest';
import { mergeComparisonBeats } from '../beats';
import { SHANAHAN_WIDE_ZONE_PLAYS } from '../../data/schemes/shanahan/index';

describe('PlayComparison helpers', () => {
  it('merges and sorts the key beats of two plays into one rail', () => {
    const a = SHANAHAN_WIDE_ZONE_PLAYS[0];
    const b = SHANAHAN_WIDE_ZONE_PLAYS[3];
    const merged = mergeComparisonBeats(a, b);
    expect(merged.length).toBeGreaterThanOrEqual(a.beats.length);
    expect(merged.length).toBeGreaterThanOrEqual(b.beats.length);
    for (let i = 1; i < merged.length; i++) {
      expect(merged[i].t).toBeGreaterThanOrEqual(merged[i - 1].t);
    }
  });

  it('de-duplicates overlapping beat timestamps (same t rounded to centisecond)', () => {
    const a = SHANAHAN_WIDE_ZONE_PLAYS[0];
    const b = SHANAHAN_WIDE_ZONE_PLAYS[1];
    const merged = mergeComparisonBeats(a, b);
    const keys = merged.map((beat) => Math.round(beat.t * 100));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('carries beats from both plays onto the single rail', () => {
    const a = SHANAHAN_WIDE_ZONE_PLAYS[0];
    const b = SHANAHAN_WIDE_ZONE_PLAYS[2];
    const merged = mergeComparisonBeats(a, b);
    const aTitles = new Set(a.beats.map((x) => x.title));
    const bTitles = new Set(b.beats.map((x) => x.title));
    const carriedA = merged.filter((x) => aTitles.has(x.title)).length;
    const carriedB = merged.filter((x) => bTitles.has(x.title)).length;
    expect(carriedA).toBeGreaterThan(0);
    expect(carriedB).toBeGreaterThan(0);
  });
});
