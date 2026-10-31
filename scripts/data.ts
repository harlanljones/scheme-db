/**
 * Data tooling.
 *
 *   bun run data:validate        parse every record and run the cross-record checks
 *   bun run data:format          rewrite every record in canonical JSON formatting
 *   bun run data:format --check  fail if any record is not canonically formatted
 *   bun run data:schema          regenerate data/schema/*.schema.json from the Zod schemas
 *   bun run data:frames [file]   write the 10 Hz frames export as CSV (default dist/data/frames.csv)
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';
import { framesFor, framesToCsv } from '../src/engine/frames';
import { formatFile } from '../src/schema/format';
import { DATA_DIR, loadDataset, RECORD_KIND_NAMES } from '../src/schema/load';
import { Coach, Concept, Formation, Lineage, Scheme, Term, Tracks } from '../src/schema/schema';
import { Spec } from '../src/spec/schema';
import { validateDataset } from '../src/schema/validate-dataset';

const SCHEMAS = { scheme: Scheme, concept: Concept, tracks: Tracks, formation: Formation, coach: Coach, lineage: Lineage, term: Term, spec: Spec };

function recordFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.json')) out.push(full);
    }
  };
  for (const kind of RECORD_KIND_NAMES) walk(path.join(DATA_DIR, kind));
  return out.sort();
}

const [command, ...flags] = process.argv.slice(2);

if (command === 'validate') {
  const { dataset, files, problems } = loadDataset();
  const report = validateDataset(dataset, files);
  problems.push(...report.errors);
  const counts = Object.entries(dataset).map(([kind, records]) => `${records.length} ${kind}`).join(', ');
  if (report.warnings.length > 0) {
    console.warn(`${report.warnings.length} warnings:`);
    for (const warning of report.warnings) console.warn(`  - ${warning}`);
  }
  if (problems.length > 0) {
    console.error(`${problems.length} data problems:`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }
  console.log(`Data valid: ${counts}.`);
} else if (command === 'format') {
  const check = flags.includes('--check');
  const dirty: string[] = [];
  for (const file of recordFiles()) {
    const raw = fs.readFileSync(file, 'utf-8');
    const canonical = formatFile(JSON.parse(raw));
    if (raw === canonical) continue;
    dirty.push(path.relative(DATA_DIR, file));
    if (!check) fs.writeFileSync(file, canonical);
  }
  if (check && dirty.length > 0) {
    console.error(`${dirty.length} files are not canonically formatted (run \`bun run data:format\`):`);
    for (const file of dirty) console.error(`  - ${file}`);
    process.exit(1);
  }
  console.log(check ? 'All data files are canonically formatted.' : `Reformatted ${dirty.length} files.`);
} else if (command === 'schema') {
  const dir = path.join(DATA_DIR, 'schema');
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, schema] of Object.entries(SCHEMAS)) {
    fs.writeFileSync(path.join(dir, `${name}.schema.json`), `${JSON.stringify(z.toJSONSchema(schema), null, 2)}\n`);
  }
  console.log(`Wrote ${Object.keys(SCHEMAS).length} JSON Schemas to data/schema/.`);
} else if (command === 'frames') {
  const out = path.resolve(flags[0] ?? 'dist/data/frames.csv');
  const { dataset, problems } = loadDataset();
  if (problems.length > 0) {
    console.error(`${problems.length} data problems; run \`bun run data:validate\` first.`);
    process.exit(1);
  }
  const rows = dataset.tracks.flatMap((tracks) => framesFor(tracks));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, framesToCsv(rows));
  console.log(`Wrote ${rows.length} frames for ${dataset.tracks.length} concepts to ${path.relative(process.cwd(), out)}.`);
} else {
  console.error('Usage: bun run scripts/data.ts <validate | format [--check] | schema | frames [file]>');
  process.exit(1);
}
