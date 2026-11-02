import { describe, expect, it } from 'vitest';
import { loadDataset } from '../load';
import { ScaffoldError, newCoach, newConcept, newScheme, newTerm, type Scaffold } from '../scaffold';
import { Coach, Concept, Scheme, Term, Tracks, type Dataset } from '../schema';
import { validateDataset } from '../validate-dataset';

const { dataset } = loadDataset();

/** The dataset with a scaffold's records added or replaced, as the files would be after `data:new`. */
function apply(scaffold: Scaffold, from: Dataset = dataset): Dataset {
  const ds = structuredClone(from);
  for (const { path, record } of scaffold.writes) {
    const list = ds[path.split('/')[0] as keyof Dataset] as unknown[];
    const id = (record as { id?: string; conceptId?: string }).id ?? (record as { conceptId?: string }).conceptId;
    const at = list.findIndex((r) => ((r as { id?: string }).id ?? (r as { conceptId?: string }).conceptId) === id);
    if (at >= 0) list[at] = record;
    else list.push(record);
  }
  return ds;
}

const errors = (ds: Dataset): string[] => validateDataset(ds).errors;
const onlyPlaceholders = (list: string[]): boolean => list.every((e) => e.includes('TODO placeholder'));

describe('newConcept', () => {
  const base = { scheme: 'shanahan-wide-zone', id: 'shanahan-new-play', name: 'New Play' };

  it('starts all 22 players still on the formation the scheme already uses, and numbers the play after the last', () => {
    const { writes } = newConcept(dataset, base);
    const concept = Concept.parse(writes[0].record);
    const tracks = Tracks.parse(writes[1].record);
    const inScheme = dataset.concepts.filter((c) => c.schemeId === base.scheme);
    expect(writes.map((w) => w.path)).toEqual(['concepts/shanahan-wide-zone/shanahan-new-play.json', 'tracks/shanahan-wide-zone/shanahan-new-play.json']);
    expect(concept.order).toBe(inScheme.length + 1);
    expect(concept.formationId).toBe(inScheme.find((c) => c.formationId)!.formationId);
    expect(tracks.offense).toHaveLength(11);
    expect(tracks.defense).toHaveLength(11);
    for (const player of [...tracks.offense, ...tracks.defense]) {
      expect(player.waypoints).toHaveLength(2);
      expect(player.waypoints[1]).toMatchObject({ x: player.waypoints[0].x, y: player.waypoints[0].y });
    }
  });

  it('relates the new play to the first play of its scheme so the site has something to compare', () => {
    const { writes } = newConcept(dataset, base);
    expect(Concept.parse(writes[0].record).relations.playsOff).toEqual([dataset.concepts.find((c) => c.schemeId === base.scheme && c.order === 1)!.id]);
  });

  it('adds only TODO placeholders to what validate reports', () => {
    const ds = apply(newConcept(dataset, base));
    expect(ds.concepts.length).toBe(dataset.concepts.length + 1);
    const found = errors(ds);
    expect(found.length).toBeGreaterThan(0);
    expect(onlyPlaceholders(found), found.join('\n')).toBe(true);
  });

  it('copies the framing and tracks of another play with --like, minus how the original was made', () => {
    const source = dataset.concepts.find((c) => c.id === 'outside-zone')!;
    const sourceTracks = structuredClone(dataset.tracks.find((t) => t.conceptId === source.id)!);
    sourceTracks.offense[0].origin = 'compiled';
    const ds = structuredClone(dataset);
    ds.tracks[ds.tracks.findIndex((t) => t.conceptId === source.id)] = sourceTracks;
    const { writes } = newConcept(ds, { ...base, like: source.id });
    const concept = Concept.parse(writes[0].record);
    const tracks = Tracks.parse(writes[1].record);
    expect(concept).toMatchObject({ personnel: source.personnel, formation: source.formation, coverage: source.coverage, frontName: source.frontName });
    expect(concept.relations.playsOff).toEqual([source.id]);
    expect(tracks.conceptId).toBe(base.id);
    expect(tracks.generatedFrom).toBeUndefined();
    expect(tracks.offense.every((p) => p.origin === undefined)).toBe(true);
    expect(tracks.offense[1].waypoints).toEqual(sourceTracks.offense[1].waypoints);
  });

  it('asks for a source on a play that claims more than illustrative', () => {
    const { writes } = newConcept(dataset, { ...base, confidence: 'reconstructed' });
    const concept = Concept.parse(writes[0].record);
    expect(concept.provenance.confidence).toBe('reconstructed');
    expect(concept.provenance.sources).toHaveLength(1);
    expect(concept.provenance.sources[0].citation).toMatch(/^TODO/);
  });

  it('says what is wrong instead of writing a bad record', () => {
    const fail = (options: Partial<Parameters<typeof newConcept>[1]>): string => {
      try {
        newConcept(dataset, { ...base, ...options });
      } catch (err) {
        expect(err).toBeInstanceOf(ScaffoldError);
        return (err as Error).message;
      }
      throw new Error('expected a ScaffoldError');
    };
    expect(fail({ id: 'Not A Slug' })).toContain('not a valid play id');
    expect(fail({ id: undefined })).toContain('--id');
    expect(fail({ name: ' ' })).toContain('--name');
    expect(fail({ scheme: 'no-such-scheme' })).toContain('No scheme "no-such-scheme"');
    expect(fail({ id: 'outside-zone' })).toContain('already exists');
    expect(fail({ like: 'no-such-play' })).toContain('No play "no-such-play"');
    expect(fail({ formation: 'no-such-formation' })).toContain('No formation "no-such-formation"');
  });
});

describe('newScheme', () => {
  const options = { id: 'test-air', name: "Test's Air Raid", coach: 'mike-leach', team: 'Test State', era: 'current-college' };

  it('defaults the side and lineage to the coach, and adds the scheme to the coach record', () => {
    const { writes } = newScheme(dataset, options);
    const leach = dataset.coaches.find((c) => c.id === 'mike-leach')!;
    expect(Scheme.parse(writes[0].record)).toMatchObject({ id: 'test-air', coachId: 'mike-leach', side: leach.side, lineage: leach.lineage });
    expect(writes[1]).toMatchObject({ path: 'coaches/mike-leach.json', update: true });
    expect(Coach.parse(writes[1].record).schemeIds).toEqual([...leach.schemeIds, 'test-air']);
  });

  it('rejects an unknown coach, a duplicate id and an era that does not exist', () => {
    expect(() => newScheme(dataset, { ...options, coach: 'nobody' })).toThrow(/No coach "nobody"/);
    expect(() => newScheme(dataset, { ...options, id: 'shanahan-wide-zone' })).toThrow(/already exists/);
    expect(() => newScheme(dataset, { ...options, era: 'last-week' })).toThrow(/--era must be one of/);
  });

  it('leaves only TODOs to write once its first play is added', () => {
    const withScheme = apply(newScheme(dataset, options));
    expect(errors(withScheme).join('\n')).toContain('Scheme "test-air" has no concepts');
    const withPlay = apply(newConcept(withScheme, { scheme: 'test-air', id: 'test-air-mesh', name: 'Mesh', formation: dataset.formations[0].id }), withScheme);
    expect(onlyPlaceholders(errors(withPlay)), errors(withPlay).join('\n')).toBe(true);
  });
});

describe('newCoach', () => {
  it('writes a coach with placeholders for the prose and no schemes', () => {
    const { writes } = newCoach(dataset, { id: 'test-coach', name: 'Test Coach', team: 'Test Team', side: 'defense', lineage: 'buddy-46', mentor: 'buddy-ryan' });
    const coach = Coach.parse(writes[0].record);
    expect(coach).toMatchObject({ id: 'test-coach', side: 'defense', lineage: 'buddy-46', mentorId: 'buddy-ryan', schemeIds: [] });
    expect(coach.philosophy).toMatch(/^TODO/);
    expect(onlyPlaceholders(errors(apply({ writes, next: [] })))).toBe(true);
  });

  it('rejects a duplicate coach, a bad lineage and a mentor that is not a slug', () => {
    const base = { id: 'test-coach', name: 'Test Coach', team: 'Test Team', side: 'defense', lineage: 'buddy-46' };
    expect(() => newCoach(dataset, { ...base, id: 'kyle-shanahan' })).toThrow(/already exists/);
    expect(() => newCoach(dataset, { ...base, lineage: 'new-tree' })).toThrow(/--lineage must be one of/);
    expect(() => newCoach(dataset, { ...base, mentor: 'Some One' })).toThrow(/not a valid mentor id/);
  });
});

describe('newTerm', () => {
  it('writes a glossary term in its category', () => {
    const { writes } = newTerm(dataset, { id: 'test-term', term: 'Test term', category: 'Run Concept' });
    expect(Term.parse(writes[0].record)).toMatchObject({ id: 'test-term', category: 'Run Concept', aliases: [] });
  });

  it('rejects an unknown category', () => {
    expect(() => newTerm(dataset, { id: 'test-term', term: 'Test term', category: 'Trick Play' })).toThrow(/--category must be one of/);
  });
});
