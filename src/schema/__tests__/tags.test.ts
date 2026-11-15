import { describe, expect, it } from 'vitest';
import { loadDataset } from '../load';
import type { Concept, Tracks } from '../schema';
import {
  CONCEPT_KEY_ORDER,
  COVERAGE_FAMILIES,
  coverageFamilyOf,
  defensePackageOf,
  deriveTags,
  fieldZoneAt,
  offensePersonnelOf,
  orderConcept,
  readSituation,
  stale,
  tagFindings,
} from '../tags';
import { CoverageFamily, DefensePackage, FieldZone } from '../schema';

const { dataset } = loadDataset();
const tracksOf = (id: string): Tracks => dataset.tracks.find((t) => t.conceptId === id)!;
const sideOf = (concept: Concept): 'offense' | 'defense' => dataset.schemes.find((s) => s.id === concept.schemeId)!.side;

/** An offensive and a defensive play from the library with every field set and a carry on offense, copied so each test can break one thing. */
const offensePlay = dataset.concepts.find((c) => c.playType?.includes('run') && sideOf(c) === 'offense')!;
const defensePlay = dataset.concepts.find((c) => c.playType?.includes('blitz') && sideOf(c) === 'defense')!;
const fresh = (concept: Concept) => ({ concept: structuredClone(concept), tracks: structuredClone(tracksOf(concept.id)), side: sideOf(concept) });

describe('situation', () => {
  it.each([
    ['1st & 10, +40, base down', { down: 1, distance: 10, fieldZone: 'midfield', yardsToGoal: 40 }],
    ['1st & 10, +38, base down', { down: 1, distance: 10, fieldZone: 'opponent-territory', yardsToGoal: 38 }],
    ['1st & 10, +45, base down', { down: 1, distance: 10, fieldZone: 'midfield', yardsToGoal: 45 }],
    ['3rd & 6, own 40, must-pass down', { down: 3, distance: 6, fieldZone: 'midfield', yardsToGoal: 60 }],
    ['1st & 10, Own 25, base down', { down: 1, distance: 10, fieldZone: 'own-territory', yardsToGoal: 75 }],
    ['3rd & 8, -45, 3rd down vs elite #1 WR', { down: 3, distance: 8, fieldZone: 'midfield', yardsToGoal: 55 }],
    ['4th & 3, opponent +38, do-or-die down', { down: 4, distance: 3, fieldZone: 'opponent-territory', yardsToGoal: 38 }],
    ['3rd & 5, midfield (+48), critical conversion down', { down: 3, distance: 5, fieldZone: 'midfield', yardsToGoal: 48 }],
    ['3rd & 1 from midfield, must-punt distance', { down: 3, distance: 1, fieldZone: 'midfield', yardsToGoal: 50 }],
    ['3rd & 2, red zone, run-check down', { down: 3, distance: 2, fieldZone: 'red-zone' }],
    ['2nd & 4, red zone top, condensed-run down', { down: 2, distance: 4, fieldZone: 'red-zone' }],
    ['2nd & 4, +32, red zone edge', { down: 2, distance: 4, fieldZone: 'opponent-territory', yardsToGoal: 32 }],
    ['3rd & 3, +22, just outside the red zone, strike zone high-pressure down', { down: 3, distance: 3, fieldZone: 'opponent-territory', yardsToGoal: 22 }],
    ['3rd & Goal from the 6, red zone', { down: 3, distance: 6, fieldZone: 'red-zone', yardsToGoal: 6 }],
    ['1st & Goal, +8, power run down', { down: 1, distance: 8, fieldZone: 'red-zone', yardsToGoal: 8 }],
    ['4th & Goal from the 1, fourth quarter', { down: 4, distance: 1, fieldZone: 'goal-line', yardsToGoal: 1 }],
    ['4th & 1, +1, goal line conversion', { down: 4, distance: 1, fieldZone: 'goal-line', yardsToGoal: 1 }],
    ['3rd & 14, +45, long yardage passing down', { down: 3, distance: 14, fieldZone: 'midfield', yardsToGoal: 45 }],
  ])('reads %s', (text, expected) => {
    expect(readSituation(text)).toEqual(expected);
  });

  it('reads "from the 42" without a side as 42 yards from the goal, and says it did', () => {
    expect(readSituation('2nd & 8 from the 42, passing down')).toEqual({ down: 2, distance: 8, fieldZone: 'midfield', yardsToGoal: 42, sideNotStated: true });
  });

  it('reads nothing from text that does not start with a down', () => {
    expect(readSituation('Late in the half, base down')).toEqual({});
    expect(readSituation('TODO: down and distance, such as 1st & 10, +40, base down')).toEqual({});
  });

  it('puts the edges of each zone on the side nearer the goal', () => {
    expect(
      [61, 60, 40, 39, 21, 20, 6, 5, 1].map(fieldZoneAt),
    ).toEqual(['own-territory', 'midfield', 'midfield', 'opponent-territory', 'opponent-territory', 'red-zone', 'red-zone', 'goal-line', 'goal-line']);
  });
});

describe('coverage family', () => {
  it.each([
    ['Cover 3 Sky', 'cover-3'],
    ['Cover 3 Sky / Quarters Match', 'cover-3'],
    ['Cover 1 / Cover 3 Robber', 'cover-1'],
    ['Cover 3 Buzz (Disguised from Cover 0)', 'cover-3'],
    ['Cover 2 Man-Under (Press-Trail Corners)', 'two-man'],
    ['Nickel Cover 2 Man Match', 'two-man'],
    ['Cover 2 Zone', 'cover-2'],
    ['Cover 2 Roll to Cover 3 Sky', 'cover-3'],
    ['Cover 3 Fire Zone (Disguised Single-High)', 'fire-zone'],
    ['Hot Fire Zone (3-Under, 2-Deep with 6-Man Blitz)', 'fire-zone'],
    ['Drop 7 — Cover 3 Match with Simulated Edge Creeper', 'drop-8'],
    ['Cover 6 (Quarter-Quarter-Half / Bracket)', 'cover-6'],
    ['Cover 8 (Half-Quarter-Quarter / Inverted Boundary Trap)', 'cover-6'],
    ['Chameleon Bracket (High-Low Double on Star X Receiver)', 'bracket'],
    ['Man-Free, Press Corners, Walked WILL on Slot', 'cover-1'],
    ['Press-Man Zero (No Deep Safety)', 'cover-0'],
    ['Press Match, Safeties Near Box', 'cover-0'],
    ['Split-Field Quarters (Cover 4)', 'cover-4'],
    ['Single-High, Soft Corners vs Run', 'cover-3'],
  ])('reads %s as %s', (text, family) => {
    expect(coverageFamilyOf(text)).toBe(family);
  });

  it('leaves a spelling no rule reads for a person to classify', () => {
    expect(coverageFamilyOf('Tampa Box Special')).toBeUndefined();
  });

  it('describes every family it can return', () => {
    expect(Object.keys(COVERAGE_FAMILIES).sort()).toEqual([...CoverageFamily.options].sort());
  });
});

describe('personnel', () => {
  it('reads backs then tight ends from the tracks', () => {
    const { tracks } = fresh(offensePlay);
    expect(offensePersonnelOf(tracks)).toBe(`${tracks.offense.filter((p) => p.role === 'rb').length}${tracks.offense.filter((p) => p.role === 'te').length}`);
  });

  it('names the package from the defensive backs: 3 or fewer goal-line, 4 base, 5 nickel, 6 dime, 7 quarter', () => {
    expect(['6-2-3', '4-3-4', '4-2-5', '3-2-6', '2-2-7', '3-1-7'].map(defensePackageOf)).toEqual(['goal-line', 'base', 'nickel', 'dime', 'quarter', 'quarter']);
    expect([...DefensePackage.options]).toEqual(['goal-line', 'base', 'nickel', 'dime', 'quarter']);
  });
});

describe('the library', () => {
  const tagged = dataset.concepts.filter((c) => c.playType);

  it('gives every play every field it can read, and a play type', () => {
    for (const concept of dataset.concepts) {
      const derived = deriveTags(concept, tracksOf(concept.id));
      expect(stale(concept, derived), concept.id).toEqual([]);
      expect(concept.playType?.length, concept.id).toBeGreaterThan(0);
      expect(concept.coverageFamily, concept.id).toBeDefined();
    }
    expect(tagged.length).toBe(dataset.concepts.length);
  });

  it('has no tag findings that fail the build', () => {
    for (const concept of dataset.concepts) expect(tagFindings(concept, tracksOf(concept.id), sideOf(concept)).errors, concept.id).toEqual([]);
  });

  it('uses every family, zone and package value only as the lists define them', () => {
    for (const concept of dataset.concepts) {
      if (concept.coverageFamily) expect(CoverageFamily.options).toContain(concept.coverageFamily);
      if (concept.fieldZone) expect(FieldZone.options).toContain(concept.fieldZone);
      if (concept.defensePackage) expect(DefensePackage.options).toContain(concept.defensePackage);
    }
  });

  it('stores each concept with its structured fields beside the text they describe', () => {
    for (const concept of dataset.concepts) {
      expect(Object.keys(concept), concept.id).toEqual(CONCEPT_KEY_ORDER.filter((key) => key in concept));
    }
  });

  it('keeps an offensive play to offensive tags and a defensive play to defensive tags', () => {
    for (const concept of dataset.concepts) {
      const offense = sideOf(concept) === 'offense';
      for (const tag of concept.playType ?? []) expect(['run', 'pass', 'play-action', 'rpo', 'screen', 'option'].includes(tag), `${concept.id} ${tag}`).toBe(offense);
    }
  });
});

describe('a play whose fields disagree with what they are read from', () => {
  it('passes untouched', () => {
    const { concept, tracks, side } = fresh(offensePlay);
    expect(tagFindings(concept, tracks, side)).toEqual({ errors: [], warnings: [] });
  });

  it('is reported when the down no longer matches the situation', () => {
    const { concept, tracks, side } = fresh(offensePlay);
    concept.situation = concept.situation.replace(/^\d(st|nd|rd|th)/, concept.down === 1 ? '2nd' : '1st');
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/down is \d but the start of situation says \d/);
  });

  it('is reported when the coverage text moves to another family', () => {
    const { concept, tracks, side } = fresh(offensePlay);
    concept.coverage = concept.coverageFamily === 'cover-4' ? 'Cover 3 Sky' : 'Cover 4 Quarters';
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/coverageFamily is "[a-z0-9-]+" but coverage says/);
  });

  it('is reported when a field is missing, and not while the text is still a draft', () => {
    const { concept, tracks, side } = fresh(offensePlay);
    delete concept.fieldZone;
    delete concept.playType;
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/fieldZone is missing.*data:tag/);
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/playType is missing/);
    expect(tagFindings(concept, tracks, side, { draft: true }).errors).toEqual([]);
  });

  it('is reported when the drawing has another personnel group than the code', () => {
    const { concept, tracks, side } = fresh(offensePlay);
    const back = tracks.offense.find((p) => p.role === 'rb')!;
    back.role = 'wr';
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/offensePersonnel is "\d\d" but the offense the tracks draw says "\d\d"/);
  });

  it('warns, without failing, when a formation names a personnel group the tracks do not draw', () => {
    const { concept, tracks, side } = fresh(defensePlay);
    concept.formation = `Some Front vs ${offensePersonnelOf(tracks) === '99' ? '11' : '99'}P Gun 2x2`;
    const found = tagFindings(concept, tracks, side);
    expect(found.errors).toEqual([]);
    expect(found.warnings.join(' ')).toMatch(/personnel\) but the offense draws/);
  });
});

describe('playType', () => {
  it('rejects a defensive tag on an offensive play and the reverse', () => {
    const o = fresh(offensePlay);
    o.concept.playType = ['blitz'];
    expect(tagFindings(o.concept, o.tracks, o.side).errors.join(' ')).toMatch(/"blitz" is a defensive tag/);
    const d = fresh(defensePlay);
    d.concept.playType = ['run'];
    expect(tagFindings(d.concept, d.tracks, d.side).errors.join(' ')).toMatch(/"run" is an offensive tag/);
  });

  it('wants exactly one kind of offensive play, and option only on a run', () => {
    const { concept, tracks, side } = fresh(offensePlay);
    concept.playType = ['run', 'pass'];
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/exactly one of run, pass, play-action, rpo, screen, found run and pass/);
    concept.playType = ['pass', 'option'];
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/"option" goes with "run"/);
    concept.playType = ['option'];
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/found none/);
  });

  it('wants a carry on a run and an RPO', () => {
    const { concept, tracks, side } = fresh(offensePlay);
    for (const track of tracks.offense) if (track.trail === 'carry') track.trail = 'route';
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/no offensive player has a "carry" trail/);
  });

  it('wants the tag a name announces', () => {
    const { concept, tracks, side } = fresh(offensePlay);
    concept.name = 'Inside Zone RPO Glance';
    concept.playType = ['run'];
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/the name says RPO/);
    concept.name = 'Boot Play-Action Shot';
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/the name says play-action/);
  });

  it('keeps a blitz apart from simulated pressure', () => {
    const { concept, tracks, side } = fresh(defensePlay);
    concept.playType = ['blitz', 'simulated-pressure'];
    expect(tagFindings(concept, tracks, side).errors.join(' ')).toMatch(/cannot be both "blitz"/);
  });

  it('lets a defensive play carry two tags', () => {
    const { concept, tracks, side } = fresh(defensePlay);
    concept.playType = ['blitz', 'run-defense'];
    expect(tagFindings(concept, tracks, side).errors).toEqual([]);
  });
});

describe('ordering a record', () => {
  it('puts each structured field after the text it describes and keeps unknown keys last', () => {
    const shuffled = orderConcept({ provenance: {}, extra: 1, fieldZone: 'midfield', coverage: 'Cover 3', down: 1, situation: '1st & 10', id: 'x', playType: ['run'], coverageFamily: 'cover-3' });
    expect(Object.keys(shuffled)).toEqual(['id', 'playType', 'situation', 'down', 'fieldZone', 'coverage', 'coverageFamily', 'provenance', 'extra']);
  });
});
