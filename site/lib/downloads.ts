/** The flat tables in the CSV download, with a line on each. A test keeps this list in step with `src/release/tables.ts`. */
export const CSV_TABLES: Array<[name: string, note: string]> = [
  ['schemes', 'One row per scheme'],
  ['concepts', 'One row per play: personnel, formation, situation, coverage and summary'],
  ['concept_beats', 'The coaching points of every play'],
  ['concept_relations', 'Which plays set up or play off which'],
  ['concept_sources', 'The sources a play cites (none yet for illustrative plays)'],
  ['players', 'One row per player per play, with role and assignment'],
  ['waypoints', 'The timed waypoints of every player'],
  ['frames', 'Every player of every play resampled to 10 frames a second'],
  ['formations', 'Named pre snap looks'],
  ['formation_players', 'Where each player lines up in a formation'],
  ['coaches', 'One row per coach'],
  ['coach_schemes', 'Which coach runs which scheme'],
  ['coach_disciples', 'Who learned from whom'],
  ['lineages', 'The coaching trees'],
  ['lineage_nodes', 'The coaches in each tree'],
  ['glossary', 'Football terms'],
  ['glossary_aliases', 'Other names for a term'],
  ['meta', 'Dataset name, version and licence'],
];

export const SCHEMA_FILES = ['scheme', 'concept', 'tracks', 'formation', 'coach', 'lineage', 'term'];
