import { describe, expect, it } from 'vitest';
import { consistencyProblems } from '../consistency';
import { loadDataset } from '../load';
import type { Concept, Tracks } from '../schema';

const { dataset } = loadDataset();

/** A play from the library that says "Gun" and "11" and draws them, copied so each test can break one thing. */
const base = (() => {
  for (const concept of dataset.concepts) {
    const tracks = dataset.tracks.find((record) => record.conceptId === concept.id);
    if (!tracks) continue;
    if (/\bgun\b/i.test(concept.formation) && /^11(?!\d)/.test(concept.personnel) && consistencyProblems(concept, tracks).length === 0) {
      return { concept, tracks };
    }
  }
  throw new Error('no clean 11-personnel gun play in the library');
})();

const fresh = (): { concept: Concept; tracks: Tracks } => structuredClone(base);

describe('a play that says what it draws', () => {
  it('has no problems', () => {
    expect(consistencyProblems(base.concept, base.tracks)).toEqual([]);
  });

  it('is reported when an offensive player stands past the line', () => {
    const { concept, tracks } = fresh();
    tracks.offense[0].waypoints[0].y = 0.4;
    expect(consistencyProblems(concept, tracks).join(' ')).toMatch(/past the line of scrimmage/);
  });

  it('is reported when the quarterback is under center but the formation says gun', () => {
    const { concept, tracks } = fresh();
    const qb = tracks.offense.find((track) => track.role === 'qb')!;
    for (const waypoint of qb.waypoints) if (waypoint.t <= 0) waypoint.y = -1.2;
    expect(consistencyProblems(concept, tracks).join(' ')).toMatch(/under center/);
  });

  it('is reported when the personnel names a back the play does not draw', () => {
    const { concept, tracks } = fresh();
    concept.personnel = '21 Pony';
    expect(consistencyProblems(concept, tracks).join(' ')).toMatch(/personnel says "21 Pony"/);
  });

  it('is reported when a front names a different secondary than the one drawn', () => {
    const { concept, tracks } = fresh();
    concept.frontName = 'Dime 3-2-6';
    expect(consistencyProblems(concept, tracks).join(' ')).toMatch(/defensive backs/);
  });
});

describe('a scaffolded play that has not written its text yet', () => {
  it('is left to the TODO check: no depth or label problems for text that starts with TODO', () => {
    const { concept, tracks } = fresh();
    concept.formation = 'TODO: write the formation';
    concept.personnel = 'TODO: personnel';
    concept.frontName = 'TODO: front';
    const qb = tracks.offense.find((track) => track.role === 'qb')!;
    for (const waypoint of qb.waypoints) if (waypoint.t <= 0) waypoint.y = -1.2;
    expect(consistencyProblems(concept, tracks)).toEqual([]);
  });
});
