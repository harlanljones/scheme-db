import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DATA_DIR, loadDataset } from '../../schema/load';
import { checksumLines, parseCredit, releaseFileNames, releaseNotes } from '../package';

const { dataset } = loadDataset();

describe('release files', () => {
  it('names the files for one version', () => {
    expect(releaseFileNames('v0.1.0')).toEqual({
      json: 'scheme-db-v0.1.0.json',
      sqlite: 'scheme-db-v0.1.0.sqlite',
      csvZip: 'scheme-db-v0.1.0-csv.zip',
      license: 'LICENSE.md',
      checksums: 'SHA256SUMS',
    });
  });

  it('writes checksums that sha256sum -c can read, sorted by file name', () => {
    const digest = (c: string) => c.repeat(64);
    const text = checksumLines([
      { name: 'scheme-db-v1.json', sha256: digest('b') },
      { name: 'LICENSE.md', sha256: digest('a') },
    ]);
    expect(text).toBe(`${digest('a')}  LICENSE.md\n${digest('b')}  scheme-db-v1.json\n`);
  });
});

describe('release notes', () => {
  const credit = parseCredit(fs.readFileSync(path.join(DATA_DIR, 'LICENSE.md'), 'utf-8'));

  it('reads the credit line from the data license', () => {
    expect(credit).toContain('CC BY 4.0');
    expect(credit).toMatch(/^SchemeDB \(https:\/\//);
    expect(() => parseCredit('# No credit here')).toThrow(/Suggested credit/);
  });

  it('counts what is in the dataset and names every attached file', () => {
    const notes = releaseNotes(dataset, 'v0.2.0', credit, 18);
    expect(notes).toContain('# Scheme DB data v0.2.0');
    expect(notes).toContain(`${dataset.schemes.length} schemes, ${dataset.concepts.length} plays, ${dataset.coaches.length} coaches`);
    expect(notes).toContain('18 flat CSV tables');
    expect(notes).toContain(credit);
    for (const name of Object.values(releaseFileNames('v0.2.0'))) expect(notes, name).toContain(`\`${name}\``);
  });

  it('says every play is illustrative only while that is true', () => {
    const total = dataset.concepts.length;
    const all = structuredClone(dataset);
    for (const concept of all.concepts) concept.provenance.confidence = 'illustrative';
    expect(releaseNotes(all, 'v1.0.0', credit, 18)).toContain(`All ${total} plays are labeled illustrative`);

    const mixed = structuredClone(dataset);
    mixed.concepts[0].provenance.confidence = 'verified';
    mixed.concepts[1].provenance.confidence = 'reconstructed';
    const mixedNotes = releaseNotes(mixed, 'v1.0.0', credit, 18);
    expect(mixedNotes).not.toContain('All ');
    expect(mixedNotes).toContain(`${total - 2} of ${total} plays are labeled illustrative`);
    expect(mixedNotes).toContain('The other 2 cite their sources: 1 reconstructed and 1 verified.');
  });
});
