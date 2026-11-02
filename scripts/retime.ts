/**
 * Moves a player's waypoint times so the same path takes a time a person can run. The tool for a speed or acceleration
 * error from `bun run data:validate`, and for a play that needs a player in motion at the snap. Positions and notes are
 * kept; only times change, plus the in between waypoints that keep a fast run at an even speed (see src/engine/retime.ts).
 *
 *   bun run retime <concept-id>                      show what each player over a speed or acceleration line would become
 *   bun run retime <concept-id> --write              ... and write it to data/tracks
 *   bun run retime <concept-id> --player Z           one player, with or without a finding
 *   bun run retime <concept-id> --player Z --lead-in start Z running before the snap: a set position, then a run that reaches
 *                                                    the snap at speed. The first segment of the track is the run.
 *
 * Beats and the `duration` are not rewritten except that `duration` grows to cover the last waypoint. A later arrival can
 * make a beat's time wrong; read the beats after a write.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { motionFindings } from '../src/engine/motion';
import { easeTrack, peakSpeed, retimeTrack, startEarlier } from '../src/engine/retime';
import type { PlayerTrack, Waypoint } from '../src/engine/types';
import { formatFile } from '../src/schema/format';
import { DATA_DIR, loadDataset } from '../src/schema/load';
import type { Tracks } from '../src/schema/schema';

const args = process.argv.slice(2);
const flag = (name: string): boolean => args.includes(`--${name}`);
const option = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const conceptId = args.find((arg, i) => !arg.startsWith('--') && !(i > 0 && args[i - 1] === '--player'));
if (!conceptId) {
  console.error('usage: bun run retime <concept-id> [--player <id>] [--lead-in] [--write]');
  process.exit(1);
}

const { dataset, problems } = loadDataset();
if (problems.length > 0) {
  console.error(`${problems.length} data problems; run \`bun run data:validate\` first.`);
  process.exit(1);
}
const concept = dataset.concepts.find((c) => c.id === conceptId);
const tracks: Tracks | undefined = dataset.tracks.find((record) => record.conceptId === conceptId);
if (!concept || !tracks) {
  console.error(`No concept "${conceptId}" with tracks.`);
  process.exit(1);
}

const all: PlayerTrack[] = [...tracks.offense, ...tracks.defense] as PlayerTrack[];
const wanted = option('player');
const flagged = new Set(motionFindings(tracks).filter((finding) => finding.check === 'speed' || finding.check === 'acceleration').map((finding) => finding.playerId));
const chosen = all.filter((track) => (wanted ? track.id === wanted : flagged.has(track.id)));
if (wanted && chosen.length === 0) {
  console.error(`No player "${wanted}" in ${conceptId}.`);
  process.exit(1);
}
if (chosen.length === 0) {
  console.log(`${conceptId}: no player is over a speed or acceleration line. Nothing to do.`);
  process.exit(0);
}

let changed = 0;
for (const track of chosen) {
  let next: Waypoint[] | undefined;
  if (flag('lead-in')) {
    next = startEarlier(track);
  } else {
    next = retimeTrack(track);
    if (next) next = easeTrack({ ...track, waypoints: next }) ?? next;
  }
  if (!next) {
    console.log(`${track.id}: no retiming under the speed line was found${flag('lead-in') ? ' (no lead in either; the first segment may already be slow enough)' : ''}. Edit the waypoints by hand.`);
    continue;
  }
  const before = peakSpeed(track);
  const after = peakSpeed({ ...track, waypoints: next });
  const start = next[0].t;
  console.log(`${track.id}: ${before.toFixed(1)} -> ${after.toFixed(1)} yd/s peak, ${track.waypoints.length} -> ${next.length} waypoints, starts at ${start.toFixed(2)} s, last at ${next[next.length - 1].t.toFixed(2)} s`);
  if (flag('write')) {
    track.waypoints = next;
    changed++;
  }
}

if (flag('write') && changed > 0) {
  const end = Math.max(...all.flatMap((track) => track.waypoints.map((waypoint) => waypoint.t)));
  tracks.duration = Math.max(tracks.duration, Math.ceil(end * 10 - 1e-9) / 10);
  const file = path.join(DATA_DIR, 'tracks', concept.schemeId, `${concept.id}.json`);
  fs.writeFileSync(file, formatFile(tracks));
  console.log(`Wrote ${path.relative(process.cwd(), file)} (${changed} player${changed === 1 ? '' : 's'}). Run \`bun run data:validate\` next, and read the beats: a later arrival can move them.`);
} else if (!flag('write')) {
  console.log('Dry run. Add --write to write the changes.');
}
