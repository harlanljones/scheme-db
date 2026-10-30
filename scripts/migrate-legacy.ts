/**
 * One-off migration: writes the legacy TypeScript library (src/data) to schema-validated
 * JSON under data/. Delete this script together with src/data once the app reads data/.
 *
 *   bun run data:migrate
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as LEGACY_FORMATIONS from '../src/data/formations';
import { ALL_SCHEME_FAMILIES } from '../src/data/schemes/index';
import { COACH_PROFILES, COACHING_TREES } from '../src/data/coaches/index';
import { FOOTBALL_GLOSSARY } from '../src/data/glossary';
import type { CoachingTreeNode } from '../src/engine/types';
import { formatFile } from '../src/schema/format';
import { DATA_DIR } from '../src/schema/load';
import { alignmentOverrides } from '../src/schema/formations';
import { Coach, Concept, Formation, Lineage, RECORD_KINDS, Scheme, Term, Tracks, type LineageNode, type RecordKind } from '../src/schema/schema';

const written: Record<string, number> = {};
const notes: string[] = [];

function write(kind: RecordKind, parts: string[], record: object): void {
  const rel = path.join(kind, ...parts) + '.json';
  const full = path.join(DATA_DIR, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const schemaUrl = path.relative(path.dirname(full), path.join(DATA_DIR, 'schema', `${SCHEMA_FILE[kind]}.schema.json`)).split(path.sep).join('/');
  const json = JSON.parse(JSON.stringify({ $schema: schemaUrl, ...record }));
  fs.writeFileSync(full, formatFile(json));
  written[kind] = (written[kind] ?? 0) + 1;
}

const SCHEMA_FILE: Record<RecordKind, string> = {
  schemes: 'scheme',
  concepts: 'concept',
  tracks: 'tracks',
  formations: 'formation',
  coaches: 'coach',
  lineages: 'lineage',
  glossary: 'term',
};

for (const kind of Object.keys(RECORD_KINDS) as RecordKind[]) {
  fs.rmSync(path.join(DATA_DIR, kind), { recursive: true, force: true });
}

/** `src/data/formations.ts` exports `SHANAHAN_21P_OFFSET_I_VS_OVER_C3`; the data id is `shanahan-21p-offset-i-vs-over-c3`. */
const formationIdOf = (constName: string): string => constName.toLowerCase().replace(/_/g, '-');

// Names and descriptions live in the doc comment above each preset.
const formationRecords = new Map<string, Formation>();
const formationDocs = new Map<string, { name: string; description?: string }>();
const formationsSource = fs.readFileSync(path.resolve(import.meta.dirname, '../src/data/formations.ts'), 'utf-8');
for (const match of formationsSource.matchAll(/\/\*\*\n((?: \*[^\n]*\n)+) \*\/\nexport const (\w+)/g)) {
  const [first, ...rest] = match[1].split('\n').filter(Boolean).map((line) => line.replace(/^ \* ?/, '').trim());
  formationDocs.set(match[2], { name: first, description: rest.length > 0 ? rest.join(' ') : undefined });
}

for (const [constName, preset] of Object.entries(LEGACY_FORMATIONS)) {
  const docs = formationDocs.get(constName);
  if (!docs) throw new Error(`No doc comment for formation ${constName}`);
  const record = Formation.parse({ id: formationIdOf(constName), ...docs, offense: preset.offense, defense: preset.defense });
  formationRecords.set(record.id, record);
  write('formations', [record.id], record);
}

// Plays name their preset only through an import, so find it in the source.
const presetOfPlay = new Map<string, string>();
const scanSchemes = (dir: string): void => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { scanSchemes(full); continue; }
    const source = fs.readFileSync(full, 'utf-8');
    const constName = /import \{ (\w+) \} from '\.\.\/\.\.\/formations'/.exec(source)?.[1];
    const playId = /\bid: '([^']+)',\s*\n\s*name:/.exec(source)?.[1];
    if (constName && playId) presetOfPlay.set(playId, formationIdOf(constName));
  }
};
scanSchemes(path.resolve(import.meta.dirname, '../src/data/schemes'));

for (const family of ALL_SCHEME_FAMILIES) {
  if (!family.era) notes.push(`${family.id}: no era in legacy data, defaulted to "modern-nfl"`);
  const profile = COACH_PROFILES[family.coachId!];
  if (profile && profile.name !== family.coach) notes.push(`${family.id}: legacy coach display "${family.coach}" differs from profile name "${profile.name}"; the profile name is now the only one`);

  write('schemes', [family.id], Scheme.parse({
    id: family.id,
    name: family.name,
    coachId: family.coachId,
    team: family.team,
    side: family.category,
    era: family.era ?? 'modern-nfl',
    lineage: family.treeBranch,
    description: family.description,
  }));

  family.plays.forEach((play, index) => {
    if (play.family !== family.id) notes.push(`${play.id}: legacy play.family "${play.family}" differs from its scheme "${family.id}"; dropped`);

    write('concepts', [family.id, play.id], Concept.parse({
      id: play.id,
      schemeId: family.id,
      order: index + 1,
      name: play.name,
      personnel: play.personnel,
      formation: play.formation,
      formationId: presetOfPlay.get(play.id),
      situation: play.situation,
      coverage: play.coverage,
      frontName: play.frontName,
      summary: play.summary,
      beats: play.beats,
      relations: play.sequence,
      provenance: { confidence: 'illustrative', sources: [] },
    }));

    const tracks = Tracks.parse({
      conceptId: play.id,
      duration: play.duration,
      offense: play.offense,
      defense: play.defense,
    });
    write('tracks', [family.id, play.id], tracks);

    const preset = formationRecords.get(presetOfPlay.get(play.id) ?? '');
    const overrides = preset ? alignmentOverrides(preset, tracks) : [];
    if (preset && overrides.length > 0) {
      notes.push(`${play.id}: starts ${overrides.map((o) => o.id).join(', ')} off the "${preset.id}" preset`);
    }
  });
}

for (const profile of Object.values(COACH_PROFILES)) {
  write('coaches', [profile.id], Coach.parse({
    id: profile.id,
    name: profile.name,
    role2026: profile.role2026,
    team: profile.team,
    lineage: profile.treeBranch,
    mentorId: profile.mentorId,
    disciples: profile.disciples,
    side: profile.category,
    philosophy: profile.philosophy,
    keyConcepts: profile.keyConcepts,
    schemeIds: profile.schemeFamilyIds,
    isHeadCoach2026: profile.isHeadCoach2026,
    notableAchievements: profile.notableAchievements,
  }));
}

const toNode = (node: CoachingTreeNode): LineageNode => ({ coachId: node.coach.id, children: node.children.map(toNode) });
for (const tree of COACHING_TREES) {
  write('lineages', [tree.id], Lineage.parse({
    id: tree.id,
    name: tree.name,
    patriarch: tree.patriarch,
    side: tree.category,
    description: tree.description,
    rootNodes: tree.rootNodes.map(toNode),
  }));
}

for (const entry of FOOTBALL_GLOSSARY) {
  write('glossary', [entry.id], Term.parse(entry));
}

console.log('Wrote', written);
if (notes.length) {
  console.log(`\n${notes.length} migration notes:`);
  for (const note of notes) console.log(`  - ${note}`);
}
