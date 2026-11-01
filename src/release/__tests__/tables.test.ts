import { describe, expect, it } from 'vitest';
import { loadDataset } from '../../schema/load';
import { frameCount } from '../../engine/frames';
import { buildTables, createStatement, tableToCsv } from '../tables';

const { dataset } = loadDataset();
const tables = buildTables(dataset, 'test');
const table = (name: string) => tables.find((t) => t.name === name)!;

describe('release tables', () => {
  it('has one row per record in the top-level tables', () => {
    expect(table('schemes').rows).toHaveLength(dataset.schemes.length);
    expect(table('concepts').rows).toHaveLength(dataset.concepts.length);
    expect(table('coaches').rows).toHaveLength(dataset.coaches.length);
    expect(table('formations').rows).toHaveLength(dataset.formations.length);
    expect(table('glossary').rows).toHaveLength(dataset.glossary.length);
    expect(table('lineages').rows).toHaveLength(dataset.lineages.length);
  });

  it('flattens every player, waypoint and frame', () => {
    const players = dataset.tracks.flatMap((t) => [...t.offense, ...t.defense]);
    expect(table('players').rows).toHaveLength(players.length);
    expect(table('waypoints').rows).toHaveLength(players.reduce((n, p) => n + p.waypoints.length, 0));
    expect(table('frames').rows).toHaveLength(dataset.tracks.reduce((n, t) => n + 22 * frameCount(t.duration), 0));
  });

  it('gives every row exactly as many cells as the table has columns', () => {
    // One assertion per table: 160,000 frame rows make a per-row expect() slow enough to time out on CI.
    const ragged = tables.filter((t) => t.rows.some((row) => row.length !== t.columns.length)).map((t) => t.name);
    expect(ragged).toEqual([]);
  });

  it('has unique primary keys in every table', () => {
    for (const t of tables) {
      const indexes = t.key.map((name) => t.columns.findIndex((c) => c.name === name));
      expect(indexes.every((i) => i >= 0), t.name).toBe(true);
      const keys = t.rows.map((row) => JSON.stringify(indexes.map((i) => row[i])));
      expect(new Set(keys).size, t.name).toBe(keys.length);
    }
  });

  it('only references ids that exist', () => {
    const ids = (name: string, column = 'id') => new Set(table(name).rows.map((r) => r[table(name).columns.findIndex((c) => c.name === column)]));
    const refs: [string, string, Set<unknown>][] = [
      ['concepts', 'scheme_id', ids('schemes')],
      ['concepts', 'formation_id', ids('formations')],
      ['concept_beats', 'concept_id', ids('concepts')],
      ['concept_relations', 'related_concept_id', ids('concepts')],
      ['players', 'concept_id', ids('concepts')],
      ['waypoints', 'concept_id', ids('concepts')],
      ['frames', 'concept_id', ids('concepts')],
      ['formation_players', 'formation_id', ids('formations')],
      ['schemes', 'coach_id', ids('coaches')],
      ['coach_schemes', 'scheme_id', ids('schemes')],
      ['glossary_aliases', 'term_id', ids('glossary')],
      ['lineage_nodes', 'lineage_id', ids('lineages')],
    ];
    for (const [name, column, valid] of refs) {
      const t = table(name);
      const index = t.columns.findIndex((c) => c.name === column);
      const dangling = t.rows.filter((row) => row[index] !== null && !valid.has(row[index])).map((row) => row[index]);
      expect(dangling, `${name}.${column}`).toEqual([]);
    }
  });

  it('writes CSV that quotes commas, quotes and newlines and leaves null empty', () => {
    const csv = tableToCsv({
      name: 'x',
      key: ['a'],
      columns: [{ name: 'a', type: 'text' }, { name: 'b', type: 'text' }, { name: 'c', type: 'integer' }],
      rows: [['plain', 'has, comma', null], ['say "hi"', 'two\nlines', 1]],
    });
    expect(csv).toBe('a,b,c\nplain,"has, comma",\n"say ""hi""","two\nlines",1\n');
  });

  it('writes a CREATE TABLE with the primary key', () => {
    expect(createStatement(table('waypoints'))).toBe(
      'CREATE TABLE waypoints (concept_id TEXT, player_id TEXT, seq INTEGER, t REAL, x REAL, y REAL, note TEXT, PRIMARY KEY (concept_id, player_id, seq))',
    );
  });

  it('records the version and row counts in meta', () => {
    const meta = Object.fromEntries(table('meta').rows.map((r) => [r[0], r[1]]));
    expect(meta.version).toBe('test');
    expect(JSON.parse(meta.row_counts as string).concepts).toBe(dataset.concepts.length);
  });

  it('records where the ball is spotted and its x on the field', () => {
    const concepts = table('concepts');
    const col = (name: string) => concepts.columns.findIndex((c) => c.name === name);
    expect(col('ball_spot')).toBeGreaterThan(-1);
    expect(col('ball_x')).toBeGreaterThan(-1);
    const row = (id: string) => concepts.rows.find((r) => r[col('id')] === id)!;
    // An NFL scheme on the left hash, and a middle spot, which the data leaves unnamed.
    expect(row('t2-cloud-boundary')[col('ball_spot')]).toBe('left');
    expect(row('t2-cloud-boundary')[col('ball_x')]).toBe(23.58);
    expect(row('outside-zone')[col('ball_spot')]).toBe('middle');
    expect(row('outside-zone')[col('ball_x')]).toBe(26.67);
    // A college scheme is spotted against the college hash marks.
    const college = dataset.concepts.find((c) => c.ballSpot && dataset.schemes.find((s) => s.id === c.schemeId)?.era.endsWith('college'));
    if (college) expect([20, 33.33]).toContain(row(college.id)[col('ball_x')]);
  });
});
