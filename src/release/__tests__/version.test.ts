import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DATA_DIR } from '../../schema/load';
import { VERSION_PATTERN, parseDataVersion, readDataVersion, siteDataVersion, tagMatchesVersion } from '../version';

describe('data/VERSION', () => {
  it('holds one version, so the site never ships a download that says "dev"', () => {
    const version = readDataVersion();
    expect(version).toMatch(VERSION_PATTERN);
    expect(fs.readFileSync(path.join(DATA_DIR, 'VERSION'), 'utf-8')).toBe(`${version}\n`);
  });

  it('is what a site build stamps on its downloads unless DATA_VERSION overrides it', () => {
    expect(siteDataVersion({})).toBe(readDataVersion());
    expect(siteDataVersion({ DATA_VERSION: '' })).toBe(readDataVersion());
    expect(siteDataVersion({ DATA_VERSION: 'v9.9.9-try' })).toBe('v9.9.9-try');
  });

  it('reads a version from the folder it is given', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scheme-db-version-'));
    fs.writeFileSync(path.join(dir, 'VERSION'), ' v2.3.4 \n');
    expect(readDataVersion(dir)).toBe('v2.3.4');
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('parseDataVersion', () => {
  it('takes vMAJOR.MINOR.PATCH and nothing else', () => {
    expect(parseDataVersion('v1.0.0\n')).toBe('v1.0.0');
    for (const bad of ['dev', '1.0.0', 'v1.0', 'v1.0.0-rc.1', '', 'v1.0.0 v1.0.1']) expect(() => parseDataVersion(bad)).toThrow(/data\/VERSION/);
  });
});

describe('tagMatchesVersion', () => {
  it('matches the same version, with or without a pre-release suffix', () => {
    expect(tagMatchesVersion('data-v1.0.0', 'v1.0.0')).toBe(true);
    expect(tagMatchesVersion('data-v1.0.0-rc.1', 'v1.0.0')).toBe(true);
  });

  it('refuses another version, or a tag that is not a data tag', () => {
    expect(tagMatchesVersion('data-v1.0.1', 'v1.0.0')).toBe(false);
    expect(tagMatchesVersion('data-v0.0.1-rc.1', 'v1.0.0')).toBe(false);
    expect(tagMatchesVersion('v1.0.0', 'v1.0.0')).toBe(false);
    expect(tagMatchesVersion('data-v1.0', 'v1.0.0')).toBe(false);
  });
});
