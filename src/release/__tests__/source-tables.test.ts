import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../schema/load';
import type { Dataset } from '../../schema/schema';
import { buildTables, createStatement, tableToCsv } from '../tables';

const { dataset } = loadDataset();

/** The dataset with sources on a scheme, a coach, a lineage and a play, and a date on the coach. */
function withSources(): Dataset {
  const ds = structuredClone(dataset);
  ds.schemes[0].sources = [
    { type: 'article', citation: 'Piece, with a comma', url: 'https://example.com/a', accessed: '2026-11-15', supports: ['claim', 'idea'] },
    { type: 'book', citation: 'A book' },
  ];
  ds.coaches[0].sources = [{ type: 'clinic', citation: 'A clinic', supports: ['claim'] }];
  ds.coaches[0].asOf = '2027-01-15';
  ds.lineages[0].sources = [{ type: 'film', citation: 'Film', supports: ['idea'] }];
  ds.concepts[0].provenance = { confidence: 'illustrative', sources: [{ type: 'article', citation: 'About the play', supports: ['idea'] }] };
  return ds;
}

const byName = (tables: ReturnType<typeof buildTables>, name: string) => tables.find((t) => t.name === name)!;

describe('the source tables of the release', () => {
  const tables = buildTables(withSources(), 'test');
  const empty = buildTables(dataset, 'test');

  it('give a scheme, a coach and a lineage a table of sources, one row per source in the order listed', () => {
    const column = (table: string, name: string) => byName(tables, table).columns.findIndex((c) => c.name === name);
    const scheme = byName(tables, 'scheme_sources');
    expect(scheme.columns.map((c) => c.name)).toEqual(['scheme_id', 'seq', 'type', 'citation', 'url', 'accessed', 'supports']);
    expect(scheme.key).toEqual(['scheme_id', 'seq']);
    expect(scheme.rows).toEqual([
      [dataset.schemes[0].id, 0, 'article', 'Piece, with a comma', 'https://example.com/a', '2026-11-15', '["idea","claim"]'],
      [dataset.schemes[0].id, 1, 'book', 'A book', null, null, null],
    ]);
    expect(byName(tables, 'coach_sources').rows).toEqual([[dataset.coaches[0].id, 0, 'clinic', 'A clinic', null, null, '["claim"]']]);
    expect(byName(tables, 'lineage_sources').rows).toEqual([[dataset.lineages[0].id, 0, 'film', 'Film', null, null, '["idea"]']]);
    expect(column('coach_sources', 'supports')).toBe(6);
  });

  it('write the supports of a play source in the same canonical order', () => {
    const concept = byName(tables, 'concept_sources');
    expect(concept.rows).toEqual([[dataset.concepts[0].id, 0, 'article', 'About the play', null, null, '["idea"]']]);
  });

  it('are empty, not missing, while no record cites a source', () => {
    for (const name of ['scheme_sources', 'coach_sources', 'lineage_sources']) expect(byName(empty, name).rows, name).toEqual([]);
  });

  it('carry a coach asOf date in a new last column of coaches', () => {
    const coaches = byName(tables, 'coaches');
    const asOf = coaches.columns.length - 1;
    expect(coaches.columns[asOf].name).toBe('as_of');
    expect(coaches.rows[0][asOf]).toBe('2027-01-15');
    expect(coaches.rows[1][asOf]).toBeNull();
  });

  it('quote a citation with a comma in the CSV and give the table a primary key in SQLite', () => {
    expect(tableToCsv(byName(tables, 'scheme_sources'))).toContain('"Piece, with a comma"');
    expect(createStatement(byName(tables, 'scheme_sources'))).toBe(
      'CREATE TABLE scheme_sources (scheme_id TEXT, seq INTEGER, type TEXT, citation TEXT, url TEXT, accessed TEXT, supports TEXT, PRIMARY KEY (scheme_id, seq))',
    );
  });

  it('only ever add to the tables of the first release: the old columns keep their names, types and order', () => {
    // The release is a download people build queries and notebooks on. A column may be added at the end, never moved, renamed or dropped.
    const first: Record<string, string[]> = {
      schemes: ['id', 'name', 'coach_id', 'team', 'side', 'era', 'lineage', 'description'],
      coaches: ['id', 'name', 'role_2026', 'team', 'lineage', 'mentor_id', 'side', 'philosophy', 'key_concepts', 'is_head_coach_2026', 'notable_achievements'],
      concept_sources: ['concept_id', 'seq', 'type', 'citation', 'url', 'accessed'],
      lineages: ['id', 'name', 'patriarch', 'side', 'description'],
      lineage_nodes: ['lineage_id', 'coach_id', 'parent_coach_id', 'seq'],
    };
    for (const [name, columns] of Object.entries(first)) {
      expect(byName(empty, name).columns.slice(0, columns.length).map((c) => c.name), name).toEqual(columns);
    }
  });
});
