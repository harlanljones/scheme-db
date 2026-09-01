import { describe, it, expect } from 'vitest';
import {
  COVERAGE_SCHEMES,
  getCoverageScheme,
  buildCoverageDefense,
  buildCoverageVariant,
  supportsCoverageVariant,
  DEFAULT_COVERAGE_SCHEME,
} from '../coverage';
import { validateCoverageDefense } from '../validate';
import { SHANAHAN_WIDE_ZONE_PLAYS } from '../../data/schemes/shanahan/index';
import { KUBIAK_SPLIT_ZONE_PLAYS } from '../../data/schemes/kubiak/index';
import { REID_SPREAD_RPO_PLAYS } from '../../data/schemes/reid/index';

const TEST_PLAYS = [...SHANAHAN_WIDE_ZONE_PLAYS, ...KUBIAK_SPLIT_ZONE_PLAYS, ...REID_SPREAD_RPO_PLAYS];

describe('COVERAGE_SCHEMES catalogue', () => {
  it('exposes a unique, well-formed set of coverage schemes', () => {
    expect(COVERAGE_SCHEMES.length).toBeGreaterThanOrEqual(7);
    const ids = COVERAGE_SCHEMES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of COVERAGE_SCHEMES) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.short.length).toBeGreaterThan(0);
      expect(['single-high', 'two-high', 'man']).toContain(s.shell);
      expect([0, 1, 2]).toContain(s.deepSafeties);
      expect(['standard', 'blitz', 'spy']).toContain(s.box);
      expect(s.description.length).toBeGreaterThan(0);
    }
  });

  it('resolves schemes by id with a deterministic fallback', () => {
    expect(getCoverageScheme('cover3').id).toBe('cover3');
    expect(getCoverageScheme('bogus' as never).id).toBe(DEFAULT_COVERAGE_SCHEME);
  });
});

describe('buildCoverageDefense', () => {
  it('produces an 11-player defense preserving persona identity', () => {
    for (const play of TEST_PLAYS) {
      const originalIds = play.defense.map((d) => d.id);
      for (const scheme of COVERAGE_SCHEMES) {
        const defense = buildCoverageDefense(play, scheme.id);
        expect(defense).toHaveLength(11);
        expect(defense.map((d) => d.id)).toEqual(originalIds);
      }
    }
  });

  it('generates structurally valid waypoints for every scheme and fixture', () => {
    for (const play of TEST_PLAYS) {
      for (const scheme of COVERAGE_SCHEMES) {
        const defense = buildCoverageDefense(play, scheme.id);
        const problems = validateCoverageDefense(play, defense);
        expect(problems).toEqual([]);
      }
    }
  });

  it('keeps the offense untouched and only re-schemes the defense', () => {
    const play = SHANAHAN_WIDE_ZONE_PLAYS[0];
    const defense = buildCoverageDefense(play, 'cover2');
    expect(defense.length).toBe(play.defense.length);
    for (const d of defense) {
      expect(play.offense.some((o) => o.id === d.id)).toBe(false);
    }
    // DL personas retain their authored front / rush path.
    for (const dl of defense.filter((d) => d.role === 'dl')) {
      const orig = play.defense.find((o) => o.id === dl.id)!;
      expect(dl.waypoints).toEqual(orig.waypoints);
    }
  });

  it('differs between schemes but every scheme the same defense reacts to the receiver', () => {
    const play = SHANAHAN_WIDE_ZONE_PLAYS[0];
    const c3 = buildCoverageDefense(play, 'cover3');
    const c2 = buildCoverageDefense(play, 'cover2');
    const fsC3 = c3.find((d) => d.id === 'FS')!;
    const fsC2 = c2.find((d) => d.id === 'FS')!;
    const endC3 = fsC3.waypoints[fsC3.waypoints.length - 1];
    const endC2 = fsC2.waypoints[fsC2.waypoints.length - 1];
    expect(Math.abs(endC3.y - endC2.y)).toBeGreaterThan(1);
  });
});

describe('buildCoverageVariant', () => {
  it('re-tags the coverage call while preserving the rest of the play', () => {
    const play = SHANAHAN_WIDE_ZONE_PLAYS[0];
    const variant = buildCoverageVariant(play, 'cover4');
    expect(variant.id).toBe(play.id);
    expect(variant.coverage).toBe(getCoverageScheme('cover4').name);
    expect(variant.duration).toBe(play.duration);
    expect(variant.offense).toBe(play.offense);
    expect(variant.beats).toBe(play.beats);
    expect(variant.summary).toBe(play.summary);
    expect(variant.sequence).toBe(play.sequence);
    expect(variant.defense).not.toBe(play.defense);
  });
});

describe('supportsCoverageVariant', () => {
  it('accepts conventional offensive alignments with a real secondary', () => {
    for (const play of TEST_PLAYS) {
      expect(supportsCoverageVariant(play)).toBe(true);
    }
  });
});
