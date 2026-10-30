/**
 * One-off migration: writes the legacy TypeScript library (src/data) to schema-validated
 * JSON under data/. Delete this script together with src/data once the app reads data/.
 *
 *   bun run data:migrate
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ALL_SCHEME_FAMILIES } from '../src/data/schemes/index';
import { COACH_PROFILES, COACHING_TREES } from '../src/data/coaches/index';
import { FOOTBALL_GLOSSARY } from '../src/data/glossary';
import type { CoachingTreeNode } from '../src/engine/types';
import { formatFile } from '../src/schema/format';
import { DATA_DIR } from '../src/schema/load';
import { Coach, Concept, Lineage, RECORD_KINDS, Scheme, Term, Tracks, type LineageNode, type RecordKind } from '../src/schema/schema';

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
  coaches: 'coach',
  lineages: 'lineage',
  glossary: 'term',
};

for (const kind of Object.keys(RECORD_KINDS) as RecordKind[]) {
  fs.rmSync(path.join(DATA_DIR, kind), { recursive: true, force: true });
}

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
      situation: play.situation,
      coverage: play.coverage,
      frontName: play.frontName,
      summary: play.summary,
      beats: play.beats,
      relations: play.sequence,
      provenance: { confidence: 'illustrative', sources: [] },
    }));

    write('tracks', [family.id, play.id], Tracks.parse({
      conceptId: play.id,
      duration: play.duration,
      offense: play.offense,
      defense: play.defense,
    }));
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
