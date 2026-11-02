/**
 * Start a new record.
 *
 *   bun run data:new concept --scheme <scheme id> --id <play id> --name "<Play name>" [--formation <id> | --like <play id>]
 *   bun run data:new scheme  --id <id> --name "<Name>" --coach <coach id> --team "<Team>" --era <era> [--side] [--lineage]
 *   bun run data:new coach   --id <id> --name "<Name>" --team "<Team>" --side <side> --lineage <branch> [--role] [--mentor]
 *   bun run data:new term    --id <id> --term "<Term>" --category "<Category>"
 *
 * Writes records that already parse against their schema, with `TODO:` where you have to write something.
 * `bun run data:validate` fails until every TODO is replaced, so it doubles as the checklist.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseArgs } from 'node:util';
import { formatFile } from '../src/schema/format';
import { DATA_DIR, loadDataset } from '../src/schema/load';
import { Era, LineageBranch, Side, TermCategory } from '../src/schema/schema';
import { ScaffoldError, newCoach, newConcept, newScheme, newTerm, type Scaffold } from '../src/schema/scaffold';
import { validateDataset } from '../src/schema/validate-dataset';

const USAGE = `Usage: bun run data:new <concept | scheme | coach | term> [options]

  concept  --scheme <id> --id <id> --name "<name>"  [--formation <id> | --like <play id>] [--duration <s>]
           [--confidence illustrative|reconstructed|verified] [--sets-up <id,id>] [--plays-off <id,id>]
  scheme   --id <id> --name "<name>" --coach <id> --team "<team>" --era <${Era.options.join('|')}> [--side] [--lineage]
  coach    --id <id> --name "<name>" --team "<team>" --side <${Side.options.join('|')}> --lineage <branch> [--role "<role>"] [--mentor <id>]
  term     --id <id> --term "<term>" --category "<${TermCategory.options.join('|')}>"

Lineage branches: ${LineageBranch.options.join(', ')}`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    scheme: { type: 'string' },
    id: { type: 'string' },
    name: { type: 'string' },
    formation: { type: 'string' },
    like: { type: 'string' },
    duration: { type: 'string' },
    confidence: { type: 'string' },
    'sets-up': { type: 'string' },
    'plays-off': { type: 'string' },
    coach: { type: 'string' },
    team: { type: 'string' },
    era: { type: 'string' },
    side: { type: 'string' },
    lineage: { type: 'string' },
    role: { type: 'string' },
    mentor: { type: 'string' },
    term: { type: 'string' },
    category: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});

const ids = (value: string | undefined): string[] | undefined => (value ? value.split(',').map((s) => s.trim()).filter(Boolean) : undefined);

function build(kind: string | undefined, ds: ReturnType<typeof loadDataset>['dataset']): Scaffold {
  switch (kind) {
    case 'concept': {
      const confidence = values.confidence;
      if (confidence && !['illustrative', 'reconstructed', 'verified'].includes(confidence)) {
        throw new ScaffoldError('--confidence must be illustrative, reconstructed or verified.');
      }
      const duration = values.duration === undefined ? undefined : Number(values.duration);
      if (duration !== undefined && !(duration > 0)) throw new ScaffoldError('--duration must be a number of seconds above 0.');
      return newConcept(ds, {
        scheme: values.scheme,
        id: values.id,
        name: values.name,
        formation: values.formation,
        like: values.like,
        duration,
        confidence: confidence as 'illustrative' | 'reconstructed' | 'verified' | undefined,
        setsUp: ids(values['sets-up']),
        playsOff: ids(values['plays-off']),
      });
    }
    case 'scheme':
      return newScheme(ds, { id: values.id, name: values.name, coach: values.coach, team: values.team, side: values.side, era: values.era, lineage: values.lineage });
    case 'coach':
      return newCoach(ds, { id: values.id, name: values.name, team: values.team, role: values.role, side: values.side, lineage: values.lineage, mentor: values.mentor });
    case 'term':
      return newTerm(ds, { id: values.id, term: values.term, category: values.category });
    default:
      throw new ScaffoldError(kind ? `Unknown kind "${kind}".\n\n${USAGE}` : USAGE);
  }
}

const [kind] = positionals;
if (values.help || !kind) {
  console.log(USAGE);
  process.exit(kind || values.help ? 0 : 1);
}

const { dataset, problems } = loadDataset();
if (problems.length > 0) {
  console.error(`data/ has ${problems.length} problems already; fix them before adding a record:\n${problems.slice(0, 10).map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}

let scaffold: Scaffold;
try {
  scaffold = build(kind, dataset);
} catch (err) {
  if (err instanceof ScaffoldError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}

for (const write of scaffold.writes) {
  const file = path.join(DATA_DIR, write.path);
  if (!write.update && fs.existsSync(file)) {
    console.error(`${path.relative(process.cwd(), file)} already exists; nothing written.`);
    process.exit(1);
  }
}
for (const write of scaffold.writes) {
  const file = path.join(DATA_DIR, write.path);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, formatFile(write.record));
  console.log(`${write.update ? 'Updated' : 'Wrote'}   data/${write.path}`);
}

console.log('\nNext:');
scaffold.next.forEach((step, i) => console.log(`  ${i + 1}. ${step}`));
console.log('  Then run `bun run data:validate` until it is clean, and `bun run check` before you open a pull request.');

// Show what is left to write, so the first run of validate is not a surprise.
const after = loadDataset();
const report = validateDataset(after.dataset, after.files);
const todo = [...after.problems, ...report.errors].filter((p) => p.includes('TODO placeholder'));
if (todo.length > 0) {
  console.log(`\n${todo.length} placeholders to replace:`);
  for (const line of todo.slice(0, 12)) console.log(`  - ${line}`);
  if (todo.length > 12) console.log(`  ... and ${todo.length - 12} more`);
}
