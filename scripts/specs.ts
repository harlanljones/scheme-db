/**
 * Play spec tooling.
 *
 *   bun run specs:check            parse, compile and validate every spec in specs/
 *   bun run specs:compile [dir]    write the compiled Tracks records (default dist/specs)
 *   bun run specs:diff             compare each compiled spec with the hand-made tracks it would replace
 */
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'yaml';
import { formatFile } from '../src/schema/format';
import { loadDataset } from '../src/schema/load';
import type { Dataset, Tracks } from '../src/schema/schema';
import { validateDataset } from '../src/schema/validate-dataset';
import { compileSpec } from '../src/spec/compile';
import { compareTracks } from '../src/spec/diff';
import { Spec } from '../src/spec/schema';

const SPEC_DIR = path.resolve(import.meta.dirname, '../specs');

function specFiles(dir: string = SPEC_DIR): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? specFiles(path.join(dir, entry.name)) : entry.name.endsWith('.yaml') ? [path.join(dir, entry.name)] : []))
    .sort();
}

const { dataset, problems } = loadDataset();
if (problems.length > 0) {
  console.error(`${problems.length} data problems; run \`bun run data:validate\` first.`);
  process.exit(1);
}

interface Compiled {
  rel: string;
  spec: Spec;
  tracks: Tracks;
}

const failures: string[] = [];
const compiled: Compiled[] = [];

for (const file of specFiles()) {
  const rel = path.relative(SPEC_DIR, file).split(path.sep).join('/');
  const text = fs.readFileSync(file, 'utf-8');
  const parsed = Spec.safeParse(parse(text));
  if (!parsed.success) {
    for (const issue of parsed.error.issues) failures.push(`${rel}: ${issue.path.join('.') || '(root)'}: ${issue.message}`);
    continue;
  }
  const spec = parsed.data;
  const concept = dataset.concepts.find((c) => c.id === spec.conceptId);
  const formation = dataset.formations.find((f) => f.id === spec.formation);
  if (!concept) { failures.push(`${rel}: unknown concept "${spec.conceptId}"`); continue; }
  if (!formation) { failures.push(`${rel}: unknown formation "${spec.formation}"`); continue; }
  if (concept.formationId !== spec.formation) failures.push(`${rel}: concept "${concept.id}" starts from formation "${concept.formationId}", not "${spec.formation}"`);
  if (rel !== `${concept.schemeId}/${concept.id}.yaml`) failures.push(`${rel}: expected to live at ${concept.schemeId}/${concept.id}.yaml`);
  try {
    compiled.push({ rel, spec, tracks: compileSpec(spec, formation, createHash('sha256').update(text).digest('hex')) });
  } catch (err) {
    failures.push(`${rel}: ${(err as Error).message}`);
  }
}

// The compiled geometry must pass the same checks as the hand-made records it stands in for.
if (compiled.length > 0) {
  const swapped: Dataset = { ...dataset, tracks: dataset.tracks.map((t) => compiled.find((c) => c.spec.conceptId === t.conceptId)?.tracks ?? t) };
  for (const error of validateDataset(swapped).errors) failures.push(`compiled: ${error}`);
}

const [command, arg] = process.argv.slice(2);

if (failures.length > 0) {
  console.error(`${failures.length} spec problems:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

if (command === 'check') {
  console.log(`Specs valid: ${compiled.length} compiled to valid tracks.`);
} else if (command === 'compile') {
  const out = path.resolve(arg ?? 'dist/specs');
  for (const { tracks } of compiled) {
    const file = path.join(out, `${tracks.conceptId}.json`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, formatFile(JSON.parse(JSON.stringify(tracks))));
  }
  console.log(`Wrote ${compiled.length} compiled tracks to ${path.relative(process.cwd(), out)}.`);
} else if (command === 'diff') {
  let within = 0;
  let total = 0;
  for (const { tracks } of compiled) {
    const authored = dataset.tracks.find((t) => t.conceptId === tracks.conceptId)!;
    const fit = compareTracks(tracks, authored);
    within += fit.within;
    total += fit.total;
    console.log(`\n${fit.conceptId}: ${fit.within} of ${fit.total} players stay within 1 yard of the hand-made track for the first 1.2 s`);
    for (const p of [...fit.players].sort((a, b) => b.maxGapEarly - a.maxGapEarly)) {
      const flag = p.maxGapEarly > 1 ? '  <-- over 1 yard' : '';
      console.log(`  ${p.side[0]}:${p.id.padEnd(7)} early max ${p.maxGapEarly.toFixed(2).padStart(5)} yd   whole-play mean ${p.meanGap.toFixed(2).padStart(5)} yd${flag}`);
    }
  }
  console.log(`\nAll specs: ${within} of ${total} players within 1 yard.`);
} else {
  console.error('Usage: bun run scripts/specs.ts <check | compile [dir] | diff>');
  process.exit(1);
}
