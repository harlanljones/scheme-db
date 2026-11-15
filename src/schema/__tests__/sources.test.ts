import { describe, expect, it } from 'vitest';
import { loadDataset } from '../load';
import { ScaffoldError, newCoach, newConcept, newScheme, type Scaffold } from '../scaffold';
import { Coach, Lineage, Scheme, Source, type Dataset } from '../schema';
import { validateDataset } from '../validate-dataset';

const { dataset } = loadDataset();

const clone = (): Dataset => structuredClone(dataset);
const errorsOf = (ds: Dataset): string => validateDataset(ds).errors.join('\n');
/** A source that parses, with whatever the test overrides. A test that needs an invalid one passes it to `safeParse`, which takes anything. */
const cite = (extra: Record<string, unknown> = {}): Source => ({ type: 'article', citation: 'Example Outlet, Jan 12, 2026', url: 'https://example.com/a', ...extra }) as Source;

describe('supports on a source', () => {
  it('accepts idea, drawing and claim, once each, in any order', () => {
    for (const supports of [['idea'], ['drawing'], ['claim'], ['idea', 'drawing'], ['claim', 'idea'], ['idea', 'drawing', 'claim']]) {
      expect(Source.safeParse(cite({ supports })).success, supports.join()).toBe(true);
    }
  });

  it('stays optional, so every source written before it still parses', () => {
    expect(Source.safeParse(cite()).success).toBe(true);
  });

  it('rejects an empty list, a repeated word and a word it does not know', () => {
    for (const supports of [[], ['idea', 'idea'], ['proof'], 'idea']) {
      expect(Source.safeParse(cite({ supports })).success, JSON.stringify(supports)).toBe(false);
    }
  });

  it('allows only web links, because the site links them', () => {
    expect(Source.safeParse(cite({ url: 'http://example.com/a' })).success).toBe(true);
    for (const url of ['javascript:alert(1)', 'data:text/html,x', 'ftp://example.com/a', 'not a link']) {
      expect(Source.safeParse(cite({ url })).success, url).toBe(false);
    }
  });
});

describe('sources on schemes, coaches and lineages', () => {
  const scheme = dataset.schemes[0];
  const coach = dataset.coaches[0];
  const lineage = dataset.lineages[0];

  it('stay optional: a record with none still parses', () => {
    expect(Scheme.safeParse({ ...scheme, sources: undefined }).success).toBe(true);
    expect(Coach.safeParse({ ...coach, sources: undefined, asOf: undefined }).success).toBe(true);
    expect(Lineage.safeParse({ ...lineage, sources: undefined }).success).toBe(true);
  });

  it('take a list of sources, and refuse an empty one so there is one way to say none', () => {
    const sources = [cite({ supports: ['idea'] }), cite({ type: 'book', citation: 'A book', url: undefined })];
    expect(Scheme.safeParse({ ...scheme, sources }).success).toBe(true);
    expect(Coach.safeParse({ ...coach, sources }).success).toBe(true);
    expect(Lineage.safeParse({ ...lineage, sources }).success).toBe(true);
    for (const record of [Scheme.safeParse({ ...scheme, sources: [] }), Coach.safeParse({ ...coach, sources: [] }), Lineage.safeParse({ ...lineage, sources: [] })]) {
      expect(record.success).toBe(false);
    }
  });

  it('give a coach an asOf date, a real calendar day', () => {
    expect(Coach.safeParse({ ...coach, asOf: '2027-01-15' }).success).toBe(true);
    for (const asOf of ['January 2027', '2027-02-30', '2027-1-5', '']) expect(Coach.safeParse({ ...coach, asOf }).success, asOf).toBe(false);
  });

  it('are checked by the validator too: no drawing support, no source twice, no TODO left', () => {
    const ds = clone();
    ds.schemes[0].sources = [cite({ supports: ['idea', 'drawing'] })];
    ds.coaches[0].sources = [cite({ citation: 'Same page' }), cite({ citation: 'Same page', url: undefined }), cite({ citation: 'Same page', url: undefined })];
    ds.lineages[0].sources = [cite({ citation: 'TODO: a source' })];
    const errors = errorsOf(ds);
    expect(errors).toContain(`Scheme "${ds.schemes[0].id}": the source "Example Outlet, Jan 12, 2026" says it supports the drawing, but only a play has a drawing`);
    expect(errors).toContain(`Coach "${ds.coaches[0].id}" lists the source "Same page" more than once`);
    expect(errors).toContain(`Lineage "${ds.lineages[0].id}": sources[0].citation is still a TODO placeholder`);
  });

  it('treat two sources with the same link as one, however they are worded', () => {
    const ds = clone();
    ds.schemes[0].sources = [cite({ citation: 'First wording' }), cite({ citation: 'Second wording' })];
    expect(errorsOf(ds)).toContain(`Scheme "${ds.schemes[0].id}" lists the source "Second wording" more than once`);
  });

  it('pass the validator when they are well formed', () => {
    const ds = clone();
    ds.schemes[0].sources = [cite({ supports: ['idea'] })];
    ds.coaches[0].sources = [cite({ supports: ['idea', 'claim'] })];
    ds.coaches[0].asOf = '2027-01-15';
    ds.lineages[0].sources = [cite({ supports: ['claim'] })];
    expect(validateDataset(ds).errors).toEqual([]);
  });
});

describe('a source on its own never raises a play above illustrative', () => {
  const reconstruct = (supports?: string[]): Dataset => {
    const ds = clone();
    ds.concepts[0].provenance = { confidence: 'reconstructed', sources: [cite(supports ? { supports } : {})] };
    return ds;
  };

  it('asks a reconstructed play for a source that backs the drawing', () => {
    expect(errorsOf(reconstruct(['idea']))).toContain(`Concept "${dataset.concepts[0].id}" is "reconstructed" but no source says it supports the drawing`);
    expect(errorsOf(reconstruct(['claim']))).toContain('supports the drawing');
    expect(errorsOf(reconstruct())).toContain('supports the drawing');
  });

  it('accepts it once one source says it does', () => {
    expect(validateDataset(reconstruct(['idea', 'drawing'])).errors).toEqual([]);
    expect(validateDataset(reconstruct(['drawing'])).errors).toEqual([]);
  });

  it('asks a verified play for the same thing, and an illustrative play for nothing', () => {
    const verified = clone();
    verified.concepts[0].provenance = { confidence: 'verified', sources: [cite({ supports: ['idea'] })] };
    expect(errorsOf(verified)).toContain('is "verified" but no source says it supports the drawing');
    const illustrative = clone();
    illustrative.concepts[0].provenance = { confidence: 'illustrative', sources: [cite({ supports: ['idea'] })] };
    expect(validateDataset(illustrative).errors).toEqual([]);
  });
});

describe('the scaffold and sources', () => {
  const schemeOptions = { id: 'test-air', name: "Test's Air Raid", coach: 'mike-leach', team: 'Test State', era: 'current-college' };
  const coachOptions = { id: 'test-coach', name: 'Test Coach', team: 'Test Team', side: 'defense', lineage: 'buddy-46' };
  const apply = (scaffold: Scaffold): Dataset => {
    const ds = clone();
    for (const { path, record } of scaffold.writes) {
      const list = ds[path.split('/')[0] as keyof Dataset] as unknown[];
      const idOf = (r: unknown): string | undefined => (r as { id?: string }).id ?? (r as { conceptId?: string }).conceptId;
      const at = list.findIndex((r) => idOf(r) === idOf(record));
      if (at >= 0) list[at] = record;
      else list.push(record);
    }
    return ds;
  };

  it('writes a scheme with one source when asked, and tells the contributor how when not', () => {
    const cited = newScheme(dataset, { ...schemeOptions, source: { citation: ' A clinic talk ', url: 'https://example.com/talk', type: 'video', supports: ['idea'], today: '2026-11-15' } });
    expect(Scheme.parse(cited.writes[0].record).sources).toEqual([
      { type: 'video', citation: 'A clinic talk', url: 'https://example.com/talk', accessed: '2026-11-15', supports: ['idea'] },
    ]);
    expect(cited.next.join('\n')).not.toContain('--source');
    const plain = newScheme(dataset, schemeOptions);
    expect(Scheme.parse(plain.writes[0].record).sources).toBeUndefined();
    expect(plain.next.join('\n')).toContain('--source');
  });

  it('writes a coach with one source, an article unless the type says otherwise, and no accessed date without a link', () => {
    const { writes } = newCoach(dataset, { ...coachOptions, source: { citation: 'Team site profile', supports: ['claim', 'idea'], today: '2026-11-15' } });
    expect(Coach.parse(writes[0].record).sources).toEqual([{ type: 'article', citation: 'Team site profile', supports: ['claim', 'idea'] }]);
  });

  it('adds nothing to what validate reports beyond the TODOs it already wrote', () => {
    const ds = apply(newCoach(dataset, { ...coachOptions, source: { citation: 'Team site profile', url: 'https://example.com/c', supports: ['claim'], today: '2026-11-15' } }));
    const found = validateDataset(ds).errors;
    expect(found.every((e) => e.includes('TODO placeholder')), found.join('\n')).toBe(true);
  });

  it('refuses a drawing support, an unknown type, and source details without a citation', () => {
    const fail = (source: Parameters<typeof newScheme>[1]['source']): string => {
      try {
        newScheme(dataset, { ...schemeOptions, source });
      } catch (err) {
        expect(err).toBeInstanceOf(ScaffoldError);
        return (err as Error).message;
      }
      throw new Error('expected a ScaffoldError');
    };
    expect(fail({ citation: 'x', supports: ['drawing'] })).toContain('--supports must be one of: idea, claim');
    expect(fail({ citation: 'x', type: 'tweet' })).toContain('--source-type must be one of');
    expect(fail({ citation: 'x', url: 'javascript:alert(1)' })).toContain('The source record is invalid');
    expect(fail({ url: 'https://example.com' })).toContain('go with --source');
  });

  it('starts a reconstructed play with a source that says it backs the idea and the drawing', () => {
    const { writes } = newConcept(dataset, { scheme: 'shanahan-wide-zone', id: 'shanahan-new-play', name: 'New Play', confidence: 'reconstructed' });
    const found = validateDataset(apply({ writes, next: [] })).errors;
    expect(found.some((e) => e.includes('supports the drawing'))).toBe(false);
    expect(found.every((e) => e.includes('TODO placeholder')), found.join('\n')).toBe(true);
  });
});
