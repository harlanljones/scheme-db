import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ALL_SCHEME_FAMILIES } from '../../data/schemes/index';
import { COACH_PROFILES, COACHING_TREES } from '../../data/coaches/index';
import { FOOTBALL_GLOSSARY } from '../../data/glossary';
import type { CoachingTreeNode } from '../../engine/types';
import { formatFile } from '../format';
import { DATA_DIR, loadDataset, RECORD_KIND_NAMES } from '../load';
import { Coach, Concept, Lineage, Scheme, Term, Tracks, type Dataset, type LineageNode } from '../schema';
import { validateDataset } from '../validate-dataset';

const { dataset, files, problems } = loadDataset();

/** Plain-JSON copy, so `undefined` optional fields compare equal to absent ones. */
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value));

describe('data/ library', () => {
  it('parses every record against its schema', () => {
    expect(problems).toEqual([]);
  });

  it('passes the cross-record checks', () => {
    expect(validateDataset(dataset, files).errors).toEqual([]);
  });

  it('reports only the nine known people who are referenced as mentors or disciples but have no coach record', () => {
    const missing = new Set(
      validateDataset(dataset, files).warnings.map((w) => /(?:mentor|disciple) "([^"]+)"/.exec(w)?.[1]),
    );
    expect([...missing].sort()).toEqual([
      'bill-parcells',
      'bobby-slowik',
      'george-seifert',
      'gus-bradley',
      'jack-elway',
      'jim-mora',
      'mike-holmgren',
      'monte-kiffin',
      'paul-brown',
    ]);
  });

  it('keeps every data file in canonical formatting', () => {
    const dirty: string[] = [];
    for (const kind of RECORD_KIND_NAMES) {
      for (const rel of files[kind]) {
        const raw = fs.readFileSync(path.join(DATA_DIR, rel), 'utf-8');
        if (formatFile(JSON.parse(raw)) !== raw) dirty.push(rel);
      }
    }
    expect(dirty).toEqual([]);
  });

  it('keeps data/schema/*.schema.json in sync with the Zod schemas', () => {
    const schemas = { scheme: Scheme, concept: Concept, tracks: Tracks, coach: Coach, lineage: Lineage, term: Term };
    for (const [name, schema] of Object.entries(schemas)) {
      const onDisk = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'schema', `${name}.schema.json`), 'utf-8'));
      expect(onDisk, `${name}.schema.json is stale; run bun run data:schema`).toEqual(plain(z.toJSONSchema(schema)));
    }
  });
});

describe('parity with the legacy TypeScript library (temporary, removed with src/data)', () => {
  const legacyPlays = ALL_SCHEME_FAMILIES.flatMap((f) => f.plays);

  it('has the same number of records', () => {
    expect(dataset.schemes).toHaveLength(ALL_SCHEME_FAMILIES.length);
    expect(dataset.concepts).toHaveLength(legacyPlays.length);
    expect(dataset.tracks).toHaveLength(legacyPlays.length);
    expect(dataset.coaches).toHaveLength(Object.keys(COACH_PROFILES).length);
    expect(dataset.lineages).toHaveLength(COACHING_TREES.length);
    expect(dataset.glossary).toHaveLength(FOOTBALL_GLOSSARY.length);
  });

  it('reproduces every scheme in the same order, with concepts in the same play order', () => {
    expect(dataset.schemes.map((s) => s.id).sort()).toEqual(ALL_SCHEME_FAMILIES.map((f) => f.id).sort());
    for (const family of ALL_SCHEME_FAMILIES) {
      const scheme = dataset.schemes.find((s) => s.id === family.id)!;
      expect(scheme).toMatchObject({
        name: family.name,
        coachId: family.coachId,
        team: family.team,
        side: family.category,
        lineage: family.treeBranch,
        description: family.description,
      });
      if (family.era) expect(scheme.era).toBe(family.era);

      const ordered = dataset.concepts.filter((c) => c.schemeId === family.id).sort((a, b) => a.order - b.order);
      expect(ordered.map((c) => c.id)).toEqual(family.plays.map((p) => p.id));
    }
  });

  it('reproduces every play from its concept and tracks records, field for field', () => {
    const tracksById = new Map(dataset.tracks.map((t) => [t.conceptId, t]));
    for (const play of legacyPlays) {
      const concept = dataset.concepts.find((c) => c.id === play.id)!;
      const tracks = tracksById.get(play.id)!;
      const rebuilt = {
        id: concept.id,
        name: concept.name,
        personnel: concept.personnel,
        formation: concept.formation,
        situation: concept.situation,
        coverage: concept.coverage,
        frontName: concept.frontName,
        duration: tracks.duration,
        offense: tracks.offense,
        defense: tracks.defense,
        beats: concept.beats,
        summary: concept.summary,
        sequence: concept.relations,
      };
      // `coach` and `family` are derived from the scheme in the new model.
      const { coach: _coach, family: _family, ...legacy } = play;
      void _coach;
      void _family;
      expect(plain(rebuilt), play.id).toEqual(plain(legacy));
    }
  });

  it('labels all legacy concepts illustrative with no sources', () => {
    for (const concept of dataset.concepts) {
      expect(concept.provenance).toEqual({ confidence: 'illustrative', sources: [] });
    }
  });

  it('reproduces every coach profile', () => {
    for (const profile of Object.values(COACH_PROFILES)) {
      const coach = dataset.coaches.find((c) => c.id === profile.id)!;
      const { treeBranch, category, schemeFamilyIds, ...rest } = profile;
      expect(plain(coach), profile.id).toMatchObject(plain({ ...rest, lineage: treeBranch, side: category, schemeIds: schemeFamilyIds }));
    }
  });

  it('reproduces every coaching tree', () => {
    const toNode = (node: CoachingTreeNode): LineageNode => ({ coachId: node.coach.id, children: node.children.map(toNode) });
    for (const tree of COACHING_TREES) {
      const lineage = dataset.lineages.find((l) => l.id === tree.id)!;
      expect(plain(lineage.rootNodes), tree.id).toEqual(plain(tree.rootNodes.map(toNode)));
      expect(lineage).toMatchObject({ name: tree.name, patriarch: tree.patriarch, side: tree.category, description: tree.description });
    }
  });

  it('reproduces the glossary (record order is by id; the matcher sorts by alias length)', () => {
    const byId = <T extends { id: string }>(list: T[]): T[] => [...list].sort((a, b) => a.id.localeCompare(b.id));
    const rebuilt = dataset.glossary.map((term) => {
      const { $schema, ...rest } = term;
      void $schema;
      return rest;
    });
    expect(plain(byId(rebuilt))).toEqual(plain(byId(FOOTBALL_GLOSSARY)));
  });
});

describe('validateDataset', () => {
  const clone = (): Dataset => structuredClone(dataset);
  const errorsOf = (ds: Dataset): string[] => validateDataset(ds).errors;

  it('flags a concept that points at an unknown scheme', () => {
    const ds = clone();
    ds.concepts[0].schemeId = 'no-such-scheme';
    expect(errorsOf(ds).join('\n')).toContain('unknown scheme "no-such-scheme"');
  });

  it('flags a relation to an unknown concept', () => {
    const ds = clone();
    ds.concepts[0].relations.setsUp.push('no-such-concept');
    expect(errorsOf(ds).join('\n')).toContain('relations.setsUp references unknown concept "no-such-concept"');
  });

  it('flags a concept without a tracks record', () => {
    const ds = clone();
    ds.tracks.shift();
    expect(errorsOf(ds).join('\n')).toContain('has no tracks record');
  });

  it('flags duplicate player ids through the geometry checks', () => {
    const ds = clone();
    ds.tracks[0].defense[0].id = ds.tracks[0].offense[0].id;
    expect(errorsOf(ds).join('\n')).toContain('Duplicate player id');
  });

  it('requires sources once a concept is no longer illustrative', () => {
    const ds = clone();
    ds.concepts[0].provenance = { confidence: 'reconstructed', sources: [] };
    expect(errorsOf(ds).join('\n')).toContain('lists no sources');
  });

  it('flags a lineage that references an unknown coach', () => {
    const ds = clone();
    ds.lineages[0].rootNodes[0].coachId = 'nobody';
    expect(errorsOf(ds).join('\n')).toContain('unknown coach "nobody"');
  });

  it('flags a record stored at the wrong path', () => {
    const wrong = { ...files, concepts: files.concepts.map((f, i) => (i === 0 ? 'concepts/elsewhere/x.json' : f)) };
    expect(validateDataset(dataset, wrong).errors.join('\n')).toContain('expected to live at');
  });
});
