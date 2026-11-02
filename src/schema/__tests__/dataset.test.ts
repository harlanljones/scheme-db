import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { formatFile } from '../format';
import { DATA_DIR, loadDataset, RECORD_KIND_NAMES } from '../load';
import { Coach, Concept, Formation, Lineage, Scheme, Term, Tracks, type Dataset } from '../schema';
import { UNRECORDED_PEOPLE, validateDataset } from '../validate-dataset';

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

  it('reports only listed people as mentors or disciples without a coach record, and nothing else as a warning about people', () => {
    const missing = validateDataset(dataset, files)
      .warnings.filter((w) => /(?:mentor|disciple) "/.test(w))
      .map((w) => /(?:mentor|disciple) "([^"]+)"/.exec(w)![1]);
    for (const id of missing) expect(UNRECORDED_PEOPLE.has(id), id).toBe(true);
  });

  it('names a stray off-formation start in a warning, not an error', () => {
    const report = validateDataset(dataset, files);
    expect(report.errors).toEqual([]);
    for (const warning of report.warnings.filter((w) => w.includes('off formation'))) expect(warning).toMatch(/^Concept "[^"]+" starts /);
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
    const schemas = { scheme: Scheme, concept: Concept, tracks: Tracks, formation: Formation, coach: Coach, lineage: Lineage, term: Term };
    for (const [name, schema] of Object.entries(schemas)) {
      const onDisk = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'schema', `${name}.schema.json`), 'utf-8'));
      expect(onDisk, `${name}.schema.json is stale; run bun run data:schema`).toEqual(plain(z.toJSONSchema(schema)));
    }
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

  it('requires generatedFrom once a player is marked compiled', () => {
    const ds = clone();
    ds.tracks[0].offense[0].origin = 'compiled';
    expect(errorsOf(ds).join('\n')).toContain('has compiled players');
    ds.tracks[0].generatedFrom = { spec: 'a'.repeat(64), compiler: '0.1.0' };
    expect(errorsOf(ds).join('\n')).not.toContain('has compiled players');
  });

  it('accepts only a sha256 spec hash and a semver compiler in generatedFrom', () => {
    const base = structuredClone(dataset.tracks[0]);
    expect(Tracks.safeParse({ ...base, generatedFrom: { spec: 'a'.repeat(64), compiler: '0.1.0' } }).success).toBe(true);
    expect(Tracks.safeParse({ ...base, generatedFrom: { spec: 'abc', compiler: '0.1.0' } }).success).toBe(false);
    expect(Tracks.safeParse({ ...base, generatedFrom: { spec: 'a'.repeat(64), compiler: 'latest' } }).success).toBe(false);
    expect(Tracks.safeParse({ ...base, generatedFrom: { spec: 'a'.repeat(64), compiler: '0.1.0', extra: 1 } }).success).toBe(false);
  });

  it('accepts origin "compiled" or "authored" on a player and nothing else', () => {
    const base = structuredClone(dataset.tracks[0]);
    for (const [origin, ok] of [['compiled', true], ['authored', true], ['hand-drawn', false]] as const) {
      const offense = [{ ...base.offense[0], origin }, ...base.offense.slice(1)];
      expect(Tracks.safeParse({ ...base, offense }).success, origin).toBe(ok);
    }
  });

  it('flags a concept that points at an unknown formation', () => {
    const ds = clone();
    const concept = ds.concepts.find((c) => c.formationId)!;
    concept.formationId = 'no-such-formation';
    expect(errorsOf(ds).join('\n')).toContain('unknown formation "no-such-formation"');
  });

  it('flags a concept whose tracks lack a player the formation places', () => {
    const ds = clone();
    const concept = ds.concepts.find((c) => c.formationId)!;
    const tracks = ds.tracks.find((t) => t.conceptId === concept.id)!;
    const formation = ds.formations.find((f) => f.id === concept.formationId)!;
    formation.offense['QB2'] = { x: 20, y: -5, role: 'qb' };
    delete formation.offense['C'];
    expect(errorsOf(ds).join('\n')).toContain('has no offense track for formation');
    expect(tracks.offense.some((p) => p.id === 'QB2')).toBe(false);
  });

  it('requires 11 players on each side of a formation', () => {
    const ds = clone();
    delete ds.formations[0].defense['FS'];
    expect(errorsOf(ds).join('\n')).toContain('has 10 defense players, expected 11');
  });

  it('rejects a formation with an alignment off the field', () => {
    const base = structuredClone(dataset.formations[0]);
    expect(Formation.safeParse({ ...base, offense: { ...base.offense, C: { x: 60, y: 0 } } }).success).toBe(false);
  });

  it('flags a mentor or disciple with no coach record unless the person is on the known list', () => {
    const ds = clone();
    const coach = ds.coaches.find((c) => c.mentorId)!;
    coach.mentorId = 'kyle-shanhan';
    expect(errorsOf(ds).join('\n')).toContain('mentor "kyle-shanhan" has no coach record');
    coach.mentorId = [...UNRECORDED_PEOPLE][0];
    expect(errorsOf(ds).join('\n')).not.toContain('has no coach record');
    const typo = clone();
    typo.coaches[0].disciples = [...(typo.coaches[0].disciples ?? []), 'nobody-here'];
    expect(errorsOf(typo).join('\n')).toContain('disciple "nobody-here" has no coach record');
  });

  it('flags a play that relates to no other play in its scheme', () => {
    const ds = clone();
    const concept = ds.concepts.find((c) => ds.concepts.filter((o) => o.schemeId === c.schemeId).length > 1)!;
    concept.relations.setsUp = [];
    concept.relations.playsOff = [];
    expect(errorsOf(ds).join('\n')).toContain(`Concept "${concept.id}" relates to no other play in scheme`);
  });

  it('lets a scheme with a single play stand without relations', () => {
    const ds = clone();
    const concept = ds.concepts[0];
    ds.concepts = [concept, ...ds.concepts.filter((c) => c.schemeId !== concept.schemeId)];
    concept.order = 1;
    concept.relations.setsUp = [];
    concept.relations.playsOff = [];
    expect(errorsOf(ds).join('\n')).not.toContain('relates to no other play');
  });

  it('rejects text that is still a TODO placeholder from the scaffold', () => {
    const ds = clone();
    ds.concepts[0].summary.motive = 'TODO: say what the play is for';
    ds.coaches[0].keyConcepts = ['TODO: name a concept'];
    ds.tracks[0].offense[0].assignment = 'TODO: assignment';
    const errors = errorsOf(ds).join('\n');
    expect(errors).toContain(`Concept "${ds.concepts[0].id}": summary.motive is still a TODO placeholder`);
    expect(errors).toContain(`Coach "${ds.coaches[0].id}": keyConcepts[0] is still a TODO placeholder`);
    expect(errors).toContain(`Tracks "${ds.tracks[0].conceptId}": offense[0].assignment is still a TODO placeholder`);
  });

  it('requires a situation to start with the down', () => {
    const ds = clone();
    ds.concepts[0].situation = 'Two minute drill';
    expect(errorsOf(ds).join('\n')).toContain('situation must start with the down');
    ds.concepts[0].situation = '3rd & 6, +42, shot play';
    expect(errorsOf(ds).join('\n')).not.toContain('situation must start with the down');
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
