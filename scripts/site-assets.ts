/**
 * Writes the files the site serves next to its pages, into public/ (git ignored):
 *
 *   public/downloads/    the JSON, CSV and SQLite releases (scripts/release.ts)
 *   public/records/      the raw records, the derived per-scheme bundles and per-play 10 Hz frames
 *
 *   bun run site:assets [--version dev]
 *
 * `bun run build` runs this before `astro build`, so the Data page and every "Download" link has a file behind it.
 */
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { framesFor, framesToCsv } from '../src/engine/frames';
import { DATA_DIR, loadDataset } from '../src/schema/load';

const args = process.argv.slice(2);
const versionIndex = args.indexOf('--version');
const version = versionIndex >= 0 && args[versionIndex + 1] ? args[versionIndex + 1] : (process.env.DATA_VERSION ?? 'dev');
const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'public');

const release = spawnSync('bun', ['run', 'scripts/release.ts', '--version', version, '--out', path.join(publicDir, 'downloads')], {
  cwd: root,
  stdio: 'inherit',
});
if (release.status !== 0) process.exit(release.status ?? 1);

const { dataset, problems } = loadDataset();
if (problems.length > 0) {
  console.error(`${problems.length} data problems; run \`bun run data:validate\` first.`);
  process.exit(1);
}

const records = path.join(publicDir, 'records');
fs.rmSync(records, { recursive: true, force: true });

const write = (rel: string, content: string): void => {
  const file = path.join(records, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const copy = (rel: string): void => write(rel, fs.readFileSync(path.join(DATA_DIR, rel), 'utf-8'));

// Raw records, as they are in data/.
for (const scheme of dataset.schemes) copy(`schemes/${scheme.id}.json`);
for (const concept of dataset.concepts) {
  copy(`concepts/${concept.schemeId}/${concept.id}.json`);
  copy(`tracks/${concept.schemeId}/${concept.id}.json`);
}
for (const file of fs.readdirSync(path.join(DATA_DIR, 'schema'))) copy(`schema/${file}`);

// Derived: one bundle per scheme, and the 10 Hz frames of every play.
const tracksById = new Map(dataset.tracks.map((tracks) => [tracks.conceptId, tracks]));
for (const scheme of dataset.schemes) {
  const concepts = dataset.concepts.filter((c) => c.schemeId === scheme.id).sort((a, b) => a.order - b.order);
  write(
    `bundles/${scheme.id}.json`,
    `${JSON.stringify({ meta: { dataset: 'Scheme DB', version, license: 'CC BY 4.0 (data), MIT (code)' }, scheme, concepts, tracks: concepts.map((c) => tracksById.get(c.id)) }, null, 2)}\n`,
  );
}
for (const concept of dataset.concepts) {
  write(`frames/${concept.schemeId}/${concept.id}.csv`, framesToCsv(framesFor(tracksById.get(concept.id)!)));
}

const count = (dir: string): number => fs.readdirSync(path.join(records, dir), { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).length;
console.log(`Records written to public/records: ${count('schemes')} schemes, ${count('concepts')} concepts, ${count('tracks')} tracks, ${count('bundles')} bundles, ${count('frames')} frame files.`);
