import { framesFor } from '../engine/frames';
import type { Coach, Dataset, LineageNode } from '../schema/schema';

export type Cell = string | number | boolean | null;
export type ColumnType = 'text' | 'integer' | 'real';

export interface Column {
  name: string;
  type: ColumnType;
}

/** One flat table of the release: the same rows go to a CSV file and to a SQLite table. */
export interface Table {
  name: string;
  columns: Column[];
  /** Column names that identify a row; becomes the SQLite primary key. */
  key: string[];
  rows: Cell[][];
}

const text = (name: string): Column => ({ name, type: 'text' });
const int = (name: string): Column => ({ name, type: 'integer' });
const real = (name: string): Column => ({ name, type: 'real' });

const json = (value: unknown): string => JSON.stringify(value);

/**
 * Flattens the dataset into relational tables. Lists of ids become junction tables; lists of free text are stored
 * as JSON arrays in one column. Booleans are 0 or 1.
 */
export function buildTables(dataset: Dataset, version: string): Table[] {
  const tables: Table[] = [];
  const add = (name: string, columns: Column[], key: string[], rows: Cell[][]): void => {
    tables.push({ name, columns, key, rows });
  };

  add(
    'schemes',
    [text('id'), text('name'), text('coach_id'), text('team'), text('side'), text('era'), text('lineage'), text('description')],
    ['id'],
    dataset.schemes.map((s) => [s.id, s.name, s.coachId, s.team, s.side, s.era, s.lineage, s.description]),
  );

  const hasMentor = (coach: Coach): Cell => coach.mentorId ?? null;
  add(
    'coaches',
    [text('id'), text('name'), text('role_2026'), text('team'), text('lineage'), text('mentor_id'), text('side'), text('philosophy'), text('key_concepts'), int('is_head_coach_2026'), text('notable_achievements')],
    ['id'],
    dataset.coaches.map((c) => [c.id, c.name, c.role2026, c.team, c.lineage, hasMentor(c), c.side, c.philosophy, json(c.keyConcepts), c.isHeadCoach2026 ? 1 : 0, c.notableAchievements ? json(c.notableAchievements) : null]),
  );
  add(
    'coach_schemes',
    [text('coach_id'), text('scheme_id')],
    ['coach_id', 'scheme_id'],
    dataset.coaches.flatMap((c) => c.schemeIds.map((schemeId) => [c.id, schemeId])),
  );
  add(
    'coach_disciples',
    [text('coach_id'), text('disciple_id')],
    ['coach_id', 'disciple_id'],
    dataset.coaches.flatMap((c) => (c.disciples ?? []).map((disciple) => [c.id, disciple])),
  );

  const durations = new Map(dataset.tracks.map((t) => [t.conceptId, t]));
  add(
    'concepts',
    [
      text('id'), text('scheme_id'), int('ord'), text('name'), text('personnel'), text('formation'), text('formation_id'), text('situation'), text('coverage'), text('front_name'),
      text('motive'), text('key_defender'), text('why_it_works'), text('failure_mode'), text('tell'), text('confidence'), text('provenance_notes'),
      real('duration'), text('spec_sha256'), text('compiler_version'),
    ],
    ['id'],
    dataset.concepts.map((c) => {
      const tracks = durations.get(c.id);
      return [
        c.id, c.schemeId, c.order, c.name, c.personnel, c.formation, c.formationId ?? null, c.situation, c.coverage, c.frontName,
        c.summary.motive, c.summary.keyDefender, c.summary.whyItWorks, c.summary.failureMode, c.relations.tell, c.provenance.confidence, c.provenance.notes ?? null,
        tracks?.duration ?? null, tracks?.generatedFrom?.spec ?? null, tracks?.generatedFrom?.compiler ?? null,
      ];
    }),
  );
  add(
    'concept_beats',
    [text('concept_id'), int('seq'), real('t'), text('title'), text('text'), text('focus')],
    ['concept_id', 'seq'],
    dataset.concepts.flatMap((c) => c.beats.map((b, seq) => [c.id, seq, b.t, b.title, b.text, b.focus ? json(b.focus) : null])),
  );
  add(
    'concept_relations',
    [text('concept_id'), text('kind'), text('related_concept_id')],
    ['concept_id', 'kind', 'related_concept_id'],
    dataset.concepts.flatMap((c) => [
      ...c.relations.setsUp.map((id) => [c.id, 'sets-up', id]),
      ...c.relations.playsOff.map((id) => [c.id, 'plays-off', id]),
    ]),
  );
  add(
    'concept_sources',
    [text('concept_id'), int('seq'), text('type'), text('citation'), text('url'), text('accessed')],
    ['concept_id', 'seq'],
    dataset.concepts.flatMap((c) => c.provenance.sources.map((s, seq) => [c.id, seq, s.type, s.citation, s.url ?? null, s.accessed ?? null])),
  );

  add(
    'players',
    [text('concept_id'), text('player_id'), text('label'), text('side'), text('role'), text('trail'), text('assignment'), text('origin')],
    ['concept_id', 'player_id'],
    dataset.tracks.flatMap((t) => [...t.offense, ...t.defense].map((p) => [t.conceptId, p.id, p.label, p.side, p.role, p.trail, p.assignment ?? null, p.origin ?? 'authored'])),
  );
  add(
    'waypoints',
    [text('concept_id'), text('player_id'), int('seq'), real('t'), real('x'), real('y'), text('note')],
    ['concept_id', 'player_id', 'seq'],
    dataset.tracks.flatMap((t) =>
      [...t.offense, ...t.defense].flatMap((p) => p.waypoints.map((w, seq) => [t.conceptId, p.id, seq, w.t, w.x, w.y, w.note ?? null])),
    ),
  );
  add(
    'frames',
    [text('concept_id'), text('player_id'), int('frame'), real('t'), real('x'), real('y')],
    ['concept_id', 'player_id', 'frame'],
    dataset.tracks.flatMap((t) => framesFor(t).map((f) => [f.conceptId, f.playerId, f.frame, f.t, f.x, f.y])),
  );

  add(
    'formations',
    [text('id'), text('name'), text('description')],
    ['id'],
    dataset.formations.map((f) => [f.id, f.name, f.description ?? null]),
  );
  add(
    'formation_players',
    [text('formation_id'), text('side'), text('player_id'), text('role'), real('x'), real('y')],
    ['formation_id', 'side', 'player_id'],
    dataset.formations.flatMap((f) =>
      (['offense', 'defense'] as const).flatMap((side) => Object.entries(f[side]).map(([id, a]) => [f.id, side, id, a.role, a.x, a.y])),
    ),
  );

  add(
    'lineages',
    [text('id'), text('name'), text('patriarch'), text('side'), text('description')],
    ['id'],
    dataset.lineages.map((l) => [l.id, l.name, l.patriarch, l.side, l.description]),
  );
  const nodes = (lineageId: string, list: LineageNode[], parent: string | null): Cell[][] =>
    list.flatMap((node, seq) => [[lineageId, node.coachId, parent, seq], ...nodes(lineageId, node.children, node.coachId)]);
  add(
    'lineage_nodes',
    [text('lineage_id'), text('coach_id'), text('parent_coach_id'), int('seq')],
    ['lineage_id', 'coach_id'],
    dataset.lineages.flatMap((l) => nodes(l.id, l.rootNodes, null)),
  );

  add(
    'glossary',
    [text('id'), text('term'), text('category'), text('short_def'), text('tactical_note')],
    ['id'],
    dataset.glossary.map((g) => [g.id, g.term, g.category, g.shortDef, g.tacticalNote]),
  );
  add(
    'glossary_aliases',
    [text('term_id'), text('alias')],
    ['term_id', 'alias'],
    dataset.glossary.flatMap((g) => g.aliases.map((alias) => [g.id, alias])),
  );

  const counts = Object.fromEntries(tables.map((t) => [t.name, t.rows.length]));
  add(
    'meta',
    [text('key'), text('value')],
    ['key'],
    [
      ['dataset', 'Scheme DB'],
      ['version', version],
      ['license', 'CC BY 4.0 (data), MIT (code)'],
      ['coordinates', 'yards, x across the field 0..53.33, y relative to the line of scrimmage with negative = backfield'],
      ['frame_rate_hz', '10'],
      ['row_counts', json(counts)],
    ],
  );

  return tables;
}

const needsQuotes = /[",\r\n]/;

/** RFC 4180 CSV: header row, comma separators, fields quoted when they hold a comma, quote or newline. Null is empty. */
export function tableToCsv(table: Table): string {
  const field = (cell: Cell): string => {
    if (cell === null) return '';
    const value = typeof cell === 'boolean' ? (cell ? '1' : '0') : String(cell);
    return needsQuotes.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
  };
  const lines = [table.columns.map((c) => c.name).join(','), ...table.rows.map((row) => row.map(field).join(','))];
  return `${lines.join('\n')}\n`;
}

/** CREATE TABLE statement for the SQLite build. */
export function createStatement(table: Table): string {
  const columns = table.columns.map((c) => `${c.name} ${c.type.toUpperCase()}`);
  return `CREATE TABLE ${table.name} (${columns.join(', ')}, PRIMARY KEY (${table.key.join(', ')}))`;
}

/** The nested JSON bundle: every record exactly as in `data/`, plus metadata. */
export function bundle(dataset: Dataset, version: string): Record<string, unknown> {
  return { meta: { dataset: 'Scheme DB', version, license: 'CC BY 4.0 (data), MIT (code)' }, ...dataset };
}
