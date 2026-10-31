/**
 * Builds the downloadable releases of the dataset.
 *
 *   bun run data:release [--version v0.1.0] [--out dist/release]
 *
 * Writes, for one version:
 *   scheme-db.json      every record nested as in data/, plus meta
 *   csv/<table>.csv    one flat table per file, including the 10 Hz frames
 *   scheme-db.sqlite    the same tables with primary keys
 *   SHA256SUMS          checksums of the files above
 *   LICENSE.md          the data license (CC BY 4.0)
 */
import { Database } from 'bun:sqlite';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DATA_DIR, loadDataset } from '../src/schema/load';
import { validateDataset } from '../src/schema/validate-dataset';
import { bundle, buildTables, createStatement, tableToCsv } from '../src/release/tables';

const args = process.argv.slice(2);
const option = (name: string, fallback: string): string => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const version = option('version', 'dev');
const out = path.resolve(option('out', 'dist/release'));

const { dataset, files, problems } = loadDataset();
problems.push(...validateDataset(dataset, files).errors);
if (problems.length > 0) {
  console.error(`${problems.length} data problems; run \`bun run data:validate\` first.`);
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'csv'), { recursive: true });

const tables = buildTables(dataset, version);

fs.writeFileSync(path.join(out, 'scheme-db.json'), `${JSON.stringify(bundle(dataset, version), null, 2)}\n`);
for (const table of tables) fs.writeFileSync(path.join(out, 'csv', `${table.name}.csv`), tableToCsv(table));
fs.copyFileSync(path.join(DATA_DIR, 'LICENSE.md'), path.join(out, 'LICENSE.md'));

const sqlitePath = path.join(out, 'scheme-db.sqlite');
const db = new Database(sqlitePath, { create: true });
db.run('PRAGMA journal_mode = DELETE');
for (const table of tables) {
  db.run(createStatement(table));
  const insert = db.prepare(`INSERT INTO ${table.name} VALUES (${table.columns.map(() => '?').join(', ')})`);
  db.transaction(() => {
    for (const row of table.rows) insert.run(...row);
  })();
}
db.run('VACUUM');

for (const table of tables) {
  const row = db.query(`SELECT COUNT(*) AS n FROM ${table.name}`).get() as { n: number };
  if (row.n !== table.rows.length) {
    console.error(`SQLite ${table.name} has ${row.n} rows, expected ${table.rows.length}.`);
    process.exit(1);
  }
}
const foreignKeyProblems = db.query('PRAGMA foreign_key_check').all();
db.close();
if (foreignKeyProblems.length > 0) {
  console.error('SQLite foreign key check failed.');
  process.exit(1);
}

const sums: string[] = [];
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
for (const file of walk(out).sort()) {
  sums.push(`${createHash('sha256').update(fs.readFileSync(file)).digest('hex')}  ${path.relative(out, file).split(path.sep).join('/')}`);
}
fs.writeFileSync(path.join(out, 'SHA256SUMS'), `${sums.join('\n')}\n`);

const size = (file: string): string => `${(fs.statSync(path.join(out, file)).size / 1024 / 1024).toFixed(1)} MB`;
console.log(`Release ${version} written to ${path.relative(process.cwd(), out)}:`);
console.log(`  scheme-db.json    ${size('scheme-db.json')}`);
console.log(`  scheme-db.sqlite  ${size('scheme-db.sqlite')}`);
console.log(`  csv/              ${tables.length} tables, ${tables.find((t) => t.name === 'frames')!.rows.length} frame rows`);
