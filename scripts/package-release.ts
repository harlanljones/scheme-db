/**
 * Packages the output of `bun run data:release` as the files a GitHub release carries.
 *
 *   bun run data:package --version v0.1.0 [--in dist/release] [--out dist/release-assets] [--notes dist/release-notes.md]
 *
 * Writes, into --out, exactly the files to attach to the release:
 *   scheme-db-<version>.json, scheme-db-<version>.sqlite, scheme-db-<version>-csv.zip, LICENSE.md, SHA256SUMS
 * SHA256SUMS lists those files by their final names, so `sha256sum -c SHA256SUMS` works in the folder a person
 * downloads them into. The zip is reproducible: fixed timestamps, sorted entries, no extra file attributes.
 * The release notes go to --notes, outside --out, so they are not attached as a file.
 *
 * Needs the `zip` command, which GitHub's ubuntu runners have. CI runs this on every push so the release path
 * is exercised before anyone tags a release.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DATA_DIR, loadDataset } from '../src/schema/load';
import { checksumLines, parseCredit, releaseFileNames, releaseNotes } from '../src/release/package';

const args = process.argv.slice(2);
const option = (name: string): string | undefined => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : undefined;
};
const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const version = option('version') ?? fail('Usage: bun run data:package --version v0.1.0 [--in dist/release] [--out dist/release-assets] [--notes dist/release-notes.md]');
if (!/^[0-9A-Za-z][0-9A-Za-z._-]*$/.test(version)) fail(`"${version}" is not a usable version name.`);
const input = path.resolve(option('in') ?? 'dist/release');
const out = path.resolve(option('out') ?? 'dist/release-assets');
const notesPath = path.resolve(option('notes') ?? 'dist/release-notes.md');
const files = releaseFileNames(version);

for (const required of ['scheme-db.json', 'scheme-db.sqlite', 'LICENSE.md', 'csv']) {
  if (!fs.existsSync(path.join(input, required))) fail(`${path.join(input, required)} is missing. Run \`bun run data:release --version ${version}\` first.`);
}
const built = JSON.parse(fs.readFileSync(path.join(input, 'scheme-db.json'), 'utf-8')) as { meta?: { version?: string } };
if (built.meta?.version !== version) fail(`${input} was built for version "${built.meta?.version}", not "${version}". Run \`bun run data:release --version ${version}\` first.`);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.copyFileSync(path.join(input, 'scheme-db.json'), path.join(out, files.json));
fs.copyFileSync(path.join(input, 'scheme-db.sqlite'), path.join(out, files.sqlite));
fs.copyFileSync(path.join(input, 'LICENSE.md'), path.join(out, files.license));

// Zip a staged copy with fixed timestamps; zip stores local time, so pin the time zone too.
const stage = fs.mkdtempSync(path.join(out, '.stage-'));
const csvNames = fs.readdirSync(path.join(input, 'csv')).filter((name) => name.endsWith('.csv')).sort();
fs.mkdirSync(path.join(stage, 'csv'));
const FIXED = new Date('2026-01-01T00:00:00Z');
const entries = ['LICENSE.md', ...csvNames.map((name) => `csv/${name}`)];
for (const entry of entries) {
  const target = path.join(stage, entry);
  fs.copyFileSync(path.join(input, entry), target);
  fs.utimesSync(target, FIXED, FIXED);
}
const zip = spawnSync('zip', ['-X', '-D', '-q', path.join(out, files.csvZip), ...entries], { cwd: stage, env: { ...process.env, TZ: 'UTC' }, encoding: 'utf-8' });
if (zip.error || zip.status !== 0) fail(`zip failed: ${zip.error?.message ?? zip.stderr}`);
fs.rmSync(stage, { recursive: true, force: true });

const hashed = [files.json, files.sqlite, files.csvZip, files.license];
const sha256 = (file: string): string => createHash('sha256').update(fs.readFileSync(path.join(out, file))).digest('hex');
fs.writeFileSync(path.join(out, files.checksums), checksumLines(hashed.map((name) => ({ name, sha256: sha256(name) }))));

// What is in --out is exactly what gets attached, and every file but SHA256SUMS is listed in it.
const present = fs.readdirSync(out).sort();
const expected = [...hashed, files.checksums].sort();
if (JSON.stringify(present) !== JSON.stringify(expected)) fail(`Expected ${expected.join(', ')} in ${out}, found ${present.join(', ')}.`);

const { dataset } = loadDataset();
const notes = releaseNotes(dataset, version, parseCredit(fs.readFileSync(path.join(DATA_DIR, 'LICENSE.md'), 'utf-8')), csvNames.length);
fs.mkdirSync(path.dirname(notesPath), { recursive: true });
fs.writeFileSync(notesPath, notes);

const size = (file: string): string => `${(fs.statSync(path.join(out, file)).size / 1024 / 1024).toFixed(1)} MB`;
console.log(`Release files for ${version} written to ${path.relative(process.cwd(), out)}:`);
for (const name of [...hashed, files.checksums]) console.log(`  ${name.padEnd(36)} ${size(name)}`);
console.log(`Release notes: ${path.relative(process.cwd(), notesPath)}`);
