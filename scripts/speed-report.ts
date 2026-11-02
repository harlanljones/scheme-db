/**
 * Lists every place a play asks a player to move faster, or change speed faster, than a person can, plus the football
 * rules about motion (see src/engine/limits.ts for the numbers). Reads data/ and prints a report; it never fails.
 *
 *   bun run speed:report                  every finding, grouped by concept
 *   bun run speed:report --error          only findings past the error line
 *   bun run speed:report --scheme <id>    one scheme
 *   bun run speed:report --concept <id>   one concept
 *   bun run speed:report --summary        counts only
 *   bun run speed:report --json           machine-readable
 *
 * For each player over the speed limit it also lists the waypoint segments whose average speed is over the warn line,
 * because those are the numbers an author edits. A segment is classified so the work can be split:
 *   motion  an offensive player is at speed in his first segment and the note or assignment talks about motion; he starts
 *           running before the snap in real football, so his start moves to a negative time
 *   burst   too fast soon after the snap on any other player; the same path needs a believable time
 *   slip    barely over the line; a waypoint a yard or two off
 *   late    over the line later than two seconds after the snap
 */
import { LIMITS } from '../src/engine/limits';
import { motionFindings, type MotionFinding } from '../src/engine/motion';
import type { PlayerTrack } from '../src/engine/types';
import { loadDataset } from '../src/schema/load';

type Kind = 'motion' | 'burst' | 'slip' | 'late';

interface Segment {
  from: number;
  to: number;
  yards: number;
  speed: number;
  fromNote?: string;
  toNote?: string;
}

interface Row extends MotionFinding {
  conceptId: string;
  schemeId: string;
  side: 'offense' | 'defense';
  kind?: Kind;
  segments?: Segment[];
}

const MOTION_WORDS = /motion|jet|orbit|shift|fly|cheat|sweep|reverse/i;

function segmentsOver(track: PlayerTrack, line: number): Segment[] {
  const out: Segment[] = [];
  const { waypoints } = track;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const yards = Math.hypot(b.x - a.x, b.y - a.y);
    const speed = yards / (b.t - a.t);
    if (speed > line) out.push({ from: a.t, to: b.t, yards, speed, fromNote: a.note, toNote: b.note });
  }
  return out;
}

function classify(track: PlayerTrack, finding: MotionFinding, segments: Segment[]): Kind {
  const text = `${track.assignment ?? ''} ${track.waypoints.map((w) => w.note ?? '').join(' ')}`;
  const firstSegmentFast = segments.some((segment) => segment.from === track.waypoints[0].t);
  if (track.side === 'offense' && firstSegmentFast && MOTION_WORDS.test(text)) return 'motion';
  if (finding.t > 2) return 'late';
  if (finding.t >= 0 && finding.t <= 2 && finding.message.includes('yd/s') && peakOf(finding) < 14 && !MOTION_WORDS.test(text)) return 'slip';
  return 'burst';
}

const peakOf = (finding: MotionFinding): number => Number(/runs ([\d.]+) yd\/s/.exec(finding.message)?.[1] ?? 0);

const args = process.argv.slice(2);
const flag = (name: string): boolean => args.includes(`--${name}`);
const option = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};

const { dataset, problems } = loadDataset();
if (problems.length > 0) {
  console.error(`${problems.length} data problems; run \`bun run data:validate\` first.`);
  process.exit(1);
}

const schemeOf = new Map(dataset.concepts.map((concept) => [concept.id, concept.schemeId]));
const rows: Row[] = [];
for (const tracks of dataset.tracks) {
  const scheme = schemeOf.get(tracks.conceptId) ?? '?';
  if (option('scheme') && option('scheme') !== scheme) continue;
  if (option('concept') && option('concept') !== tracks.conceptId) continue;
  const byId = new Map([...tracks.offense, ...tracks.defense].map((track) => [track.id, track]));
  for (const finding of motionFindings(tracks)) {
    if (flag('error') && finding.level !== 'error') continue;
    const track = byId.get(finding.playerId);
    const row: Row = { ...finding, conceptId: tracks.conceptId, schemeId: scheme, side: track?.side ?? 'offense' };
    if (track && finding.check === 'speed') {
      row.segments = segmentsOver(track, LIMITS.speed.warn);
      row.kind = classify(track, finding, row.segments);
    }
    rows.push(row);
  }
}

if (flag('json')) {
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

const count = <T>(items: T[], key: (item: T) => string): [string, number][] => {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
};

const concepts = new Set(rows.map((row) => row.conceptId));
const speedRows = rows.filter((row) => row.check === 'speed');
const speedConcepts = new Set(speedRows.map((row) => row.conceptId));

if (!flag('summary')) {
  const byConcept = new Map<string, Row[]>();
  for (const row of rows) byConcept.set(row.conceptId, [...(byConcept.get(row.conceptId) ?? []), row]);
  for (const [conceptId, list] of byConcept) {
    console.log(`${conceptId}  (${schemeOf.get(conceptId)})`);
    for (const row of list) {
      console.log(`  [${row.level}] ${row.check}${row.kind ? `/${row.kind}` : ''}: ${row.message}`);
      for (const segment of row.segments ?? []) {
        const note = segment.fromNote || segment.toNote ? `   "${segment.fromNote ?? ''}" -> "${segment.toNote ?? ''}"` : '';
        console.log(`      ${segment.from.toFixed(1)} -> ${segment.to.toFixed(1)} s  ${segment.yards.toFixed(1)} yd  ${segment.speed.toFixed(1)} yd/s${note}`);
      }
    }
  }
  console.log('');
}

const levels = count(rows, (row) => `${row.check} ${row.level}`);
console.log(`${rows.length} findings in ${concepts.size} concepts.`);
for (const [label, n] of levels.sort()) console.log(`  ${label}: ${n}`);
console.log(`Speed: ${speedConcepts.size} concepts have a player over ${LIMITS.speed.warn} yd/s (${new Set(speedRows.filter((r) => r.level === 'error').map((r) => r.conceptId)).size} over ${LIMITS.speed.error}).`);
for (const [kind, n] of count(speedRows, (row) => row.kind ?? '?')) console.log(`  ${kind}: ${n} players`);
