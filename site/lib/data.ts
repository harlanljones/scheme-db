/**
 * Build-time view of `data/`. Pages read the same files the downloads are built from, so every number on the
 * site can be traced to a record. Node only: islands import `field.ts` and `format.ts`, never this file.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadDataset } from '../../src/schema/load';
import { DISGUISE_HOLD_PERCENT, DISGUISE_WINDOW_FRAMES, summarizeDisguise } from '../../src/engine/disguise';
import { levelOfEra } from '../../src/engine/field';
import { FRAME_RATE_HZ } from '../../src/engine/frames';
import type { Coach, Concept, Dataset, Lineage, Scheme, Term, Tracks } from '../../src/schema/schema';
import type { PlayerTrack } from '../../src/engine/types';
import { fieldWindow, gapDistances, pairedCount, type FieldWindow, type LitePlay } from './field';
import type { SchemeRow } from '../islands/SchemeTable';
import { nameFromId, pad2, tidy } from './format';

export const SITE = {
  url: 'https://schemedb.harlanljones.com',
  repo: 'https://github.com/harlanljones/scheme-db',
  dataLicense: 'CC BY 4.0',
  codeLicense: 'MIT',
  credit: 'SchemeDB (https://schemedb.harlanljones.com), CC BY 4.0',
} as const;

/** The scheme and play the home page opens with, and the play it is compared against. */
export const FEATURED = { schemeId: 'shanahan-wide-zone', conceptId: 'outside-zone', againstId: 'play-action-over' } as const;

export const ERA_LABELS: Record<Scheme['era'], string> = {
  'modern-nfl': 'Modern NFL',
  'past-nfl': 'Past NFL',
  'current-college': 'Current college',
  'past-college': 'Past college',
};

export const ERA_ORDER: Scheme['era'][] = ['modern-nfl', 'past-nfl', 'current-college', 'past-college'];

export { DISGUISE_HOLD_PERCENT, DISGUISE_WINDOW_FRAMES };

/** The disguise window in seconds: the first 1.2 s after the snap. */
export const DISGUISE_SECONDS = DISGUISE_WINDOW_FRAMES / FRAME_RATE_HZ;

export interface SchemeView extends Scheme {
  /** Position in the contents, 1 to 45. */
  no: number;
  nameDisplay: string;
  coachName: string;
  teamDisplay: string;
  eraLabel: string;
  href: string;
  plays: PlayView[];
}

export interface PlayView extends Concept {
  nameDisplay: string;
  href: string;
  sheet: string;
}

export interface Comparison {
  id: string;
  order: number;
  name: string;
  href: string;
  sheet: string;
  /** Mean similarity over the first 1.2 s, 0 to 100. */
  score: number;
  /** Similarity at 1.2 s. */
  atEnd: number;
  /** Seconds at which the similarity first drops below the 80% line, or null if it never does. */
  breakSeconds: number | null;
  profile: number[];
  paired: number;
  total: number;
  /** Players more than 1 yard apart at 1.2 s, in track order. */
  gapsAtEnd: string[];
  /** The same players with their distance in yards, farthest first. */
  gapDetails: Array<{ id: string; yards: number }>;
  /** The side the score counts. */
  side: 'offense' | 'defense';
  /** The play whose tell separates the two, and its words. */
  tellName: string;
  tell: string;
}

export interface Library {
  dataset: Dataset;
  schemes: SchemeView[];
  schemeById: Map<string, SchemeView>;
  conceptById: Map<string, Concept>;
  tracksById: Map<string, Tracks>;
  coachById: Map<string, Coach>;
  lineageById: Map<string, Lineage>;
  counts: { schemes: number; plays: number; coaches: number; lineages: number; terms: number };
}

let cached: Library | undefined;

export function dataDir(): string {
  return path.join(process.cwd(), 'data');
}

export function library(): Library {
  if (cached) return cached;
  const { dataset, problems } = loadDataset(dataDir());
  if (problems.length > 0) {
    throw new Error(`data/ has ${problems.length} problems; run \`bun run data:validate\`.\n${problems.slice(0, 10).join('\n')}`);
  }
  const coachById = new Map(dataset.coaches.map((coach) => [coach.id, coach]));
  const conceptById = new Map(dataset.concepts.map((concept) => [concept.id, concept]));
  const tracksById = new Map(dataset.tracks.map((tracks) => [tracks.conceptId, tracks]));
  const lineageById = new Map(dataset.lineages.map((lineage) => [lineage.id as string, lineage]));

  const surname = (name: string): string => name.trim().split(/\s+/).pop()!.toLowerCase();
  const ordered = [...dataset.schemes].sort((a, b) => {
    const ca = coachById.get(a.coachId)?.name ?? a.coachId;
    const cb = coachById.get(b.coachId)?.name ?? b.coachId;
    return surname(ca).localeCompare(surname(cb)) || ca.localeCompare(cb) || a.id.localeCompare(b.id);
  });

  const schemes: SchemeView[] = ordered.map((scheme, index) => {
    const plays: PlayView[] = dataset.concepts
      .filter((concept) => concept.schemeId === scheme.id)
      .sort((a, b) => a.order - b.order)
      .map((concept) => ({
        ...concept,
        nameDisplay: tidy(concept.name),
        href: playHref(scheme.id, concept.id),
        sheet: `Sheet ${concept.order}`,
      }));
    return {
      ...scheme,
      no: index + 1,
      nameDisplay: tidy(scheme.name),
      coachName: coachById.get(scheme.coachId)?.name ?? scheme.coachId,
      teamDisplay: tidy(scheme.team),
      eraLabel: ERA_LABELS[scheme.era],
      href: schemeHref(scheme.id),
      plays,
    };
  });

  cached = {
    dataset,
    schemes,
    schemeById: new Map(schemes.map((scheme) => [scheme.id, scheme])),
    conceptById,
    tracksById,
    coachById,
    lineageById,
    counts: {
      schemes: dataset.schemes.length,
      plays: dataset.concepts.length,
      coaches: dataset.coaches.length,
      lineages: dataset.lineages.length,
      terms: dataset.glossary.length,
    },
  };
  return cached;
}

export const schemeHref = (schemeId: string): string => `/schemes/${schemeId}/`;
export const playHref = (schemeId: string, conceptId: string): string => `/schemes/${schemeId}/${conceptId}/`;

/** A play's tracks reduced to what a figure needs. */
export function litePlay(concept: Concept, tracks: Tracks): LitePlay {
  const scheme = library().schemeById.get(concept.schemeId)!;
  const lite = (track: Tracks['offense'][number]) => ({
    id: track.id,
    side: track.side,
    role: track.role,
    w: track.waypoints.map((w) => [w.t, w.x, w.y] as [number, number, number]),
  });
  return {
    id: concept.id,
    name: tidy(concept.name),
    duration: tracks.duration,
    level: levelOfEra(scheme.era),
    spot: concept.ballSpot ?? 'middle',
    scored: scheme.side,
    tracks: [...tracks.offense, ...tracks.defense].map(lite),
  };
}

export function litePlayById(id: string): LitePlay {
  const lib = library();
  const concept = lib.conceptById.get(id);
  const tracks = lib.tracksById.get(id);
  if (!concept || !tracks) throw new Error(`No play ${id}`);
  return litePlay(concept, tracks);
}

function engineTracks(tracks: Tracks): PlayerTrack[] {
  return [...tracks.offense, ...tracks.defense];
}

/** Which of two related plays carries the tell: the one that plays off the other. */
function counterOf(a: Concept, b: Concept): Concept {
  if (b.relations.playsOff.includes(a.id) || a.relations.setsUp.includes(b.id)) return b;
  if (a.relations.playsOff.includes(b.id) || b.relations.setsUp.includes(a.id)) return a;
  return a.order > b.order ? a : b;
}

/** The plays in the same scheme that a play sets up or plays off, in sheet order. */
export function relatedPlays(concept: Concept): Concept[] {
  const lib = library();
  const ids = new Set([...concept.relations.setsUp, ...concept.relations.playsOff]);
  return [...ids]
    .map((id) => lib.conceptById.get(id))
    .filter((other): other is Concept => !!other && other.schemeId === concept.schemeId && other.id !== concept.id)
    .sort((a, b) => a.order - b.order);
}

export function compare(base: Concept, other: Concept): Comparison {
  const lib = library();
  const a = lib.tracksById.get(base.id)!;
  const b = lib.tracksById.get(other.id)!;
  // A scheme sells its look with its own players, so only that side is scored. The other side is reading the look.
  const side = lib.schemeById.get(base.schemeId)!.side;
  const summary = summarizeDisguise(engineTracks(a), engineTracks(b), side);
  const la = litePlay(base, a);
  const lb = litePlay(other, b);
  const { paired, total } = pairedCount(la, lb, side);
  const counter = counterOf(base, other);
  const gaps = gapDistances(la, lb, DISGUISE_SECONDS, 1, side);
  return {
    id: other.id,
    order: other.order,
    name: tidy(other.name),
    href: playHref(other.schemeId, other.id),
    sheet: `Sheet ${other.order}`,
    score: summary.score,
    atEnd: summary.profile[DISGUISE_WINDOW_FRAMES],
    breakSeconds: summary.breakFrame === null ? null : summary.breakFrame / FRAME_RATE_HZ,
    profile: summary.profile,
    paired,
    total,
    side,
    gapsAtEnd: gaps.map((gap) => gap.id),
    gapDetails: [...gaps].sort((x, y) => y.yards - x.yards),
    tellName: tidy(counter.name),
    tell: counter.relations.tell,
  };
}

export function comparisonsFor(concept: Concept): Comparison[] {
  return relatedPlays(concept).map((other) => compare(concept, other));
}

/** The vertical window every figure of a play (and its comparisons) shares. */
export function windowFor(plays: LitePlay[], tMax: number): FieldWindow {
  return fieldWindow(plays, tMax);
}

const related = (a: Concept, b: Concept): boolean =>
  a.relations.setsUp.includes(b.id) || a.relations.playsOff.includes(b.id) || b.relations.setsUp.includes(a.id) || b.relations.playsOff.includes(a.id);

export interface SchemePlayRow {
  play: PlayView;
  /** The sheet this one is scored against, with the numbers. */
  comparison?: Comparison & { refSheet: string; refName: string };
  /** Sheets scored against this one, when it is the reference. */
  referenceFor: string[];
}

/**
 * Each sheet is scored against sheet 1 when the two are related, otherwise against its first related sheet.
 * Sheet 1 is the reference for the sheets that point at it, and is scored against its first related sheet only
 * when nothing points at it.
 */
export function schemePlayRows(scheme: SchemeView): SchemePlayRow[] {
  const plays = scheme.plays;
  const refs = new Map<string, PlayView | undefined>();
  for (const play of plays.slice(1)) {
    refs.set(play.id, related(play, plays[0]) ? plays[0] : plays.find((other) => other.id !== play.id && related(play, other)));
  }
  const pointedAtFirst = plays.filter((play) => refs.get(play.id)?.id === plays[0]?.id);
  if (plays[0] && pointedAtFirst.length === 0) refs.set(plays[0].id, plays.find((other) => other.id !== plays[0].id && related(plays[0], other)));
  return plays.map((play) => {
    const ref = refs.get(play.id);
    return {
      play,
      comparison: ref ? { ...compare(ref, play), refSheet: ref.sheet, refName: ref.nameDisplay } : undefined,
      referenceFor: plays.filter((other) => refs.get(other.id)?.id === play.id).map((other) => other.sheet),
    };
  });
}

/** One row per scheme for the contents table, with the text a search looks through. */
export function schemeRows(): SchemeRow[] {
  return library().schemes.map((scheme) => ({
    id: scheme.id,
    no: pad2(scheme.no),
    name: scheme.nameDisplay,
    coach: scheme.coachName,
    team: scheme.teamDisplay,
    side: scheme.side,
    era: scheme.era,
    eraLabel: scheme.eraLabel,
    href: scheme.href,
    plays: scheme.plays.map((play) => ({
      id: play.id,
      name: play.nameDisplay,
      sheet: play.sheet,
      hay: `${play.name} ${play.formation} ${play.frontName} ${play.coverage} ${play.personnel}`.toLowerCase(),
    })),
  }));
}

export function prevNext(scheme: SchemeView, concept: Concept): { prev?: PlayView; next?: PlayView } {
  const i = scheme.plays.findIndex((play) => play.id === concept.id);
  return { prev: scheme.plays[i - 1], next: scheme.plays[i + 1] };
}

/** A person named as a mentor or disciple. `known` is false when the data has no coach record for them, so there is no page to link to. */
export interface Person {
  id: string;
  name: string;
  known: boolean;
  href?: string;
}

/** The page of the coach's first scheme, if the coach has one. */
export function coachHref(coach: Coach): string | undefined {
  const lib = library();
  const schemeId = coach.schemeIds.find((id) => lib.schemeById.has(id));
  return schemeId ? lib.schemeById.get(schemeId)!.href : undefined;
}

function personOf(id: string): Person {
  const coach = library().coachById.get(id);
  return coach ? { id, name: coach.name, known: true, href: coachHref(coach) } : { id, name: nameFromId(id), known: false };
}

/** The chain of people above a coach by `mentorId` (worked directly under), oldest first. A person with no record ends the chain. */
export function mentorChain(coachId: string): Person[] {
  const lib = library();
  const chain: Person[] = [];
  const seen = new Set<string>([coachId]);
  let current = lib.coachById.get(coachId);
  while (current?.mentorId && !seen.has(current.mentorId)) {
    seen.add(current.mentorId);
    chain.unshift(personOf(current.mentorId));
    current = lib.coachById.get(current.mentorId);
  }
  return chain;
}

/** The people who worked directly under a coach, as the coach's record lists them. */
export function disciplesOf(coach: Coach): Person[] {
  return (coach.disciples ?? []).map(personOf);
}

export function recordPath(kind: 'concepts' | 'tracks', schemeId: string, conceptId: string): string {
  return `/records/${kind}/${schemeId}/${conceptId}.json`;
}

export interface DownloadFile {
  label: string;
  note: string;
  href: string;
  format: string;
  bytes?: number;
}

/** Size of a published file, when the downloads have been built (`bun run site:assets`). */
export function publishedBytes(href: string): number | undefined {
  const file = path.join(process.cwd(), 'public', href);
  return fs.existsSync(file) ? fs.statSync(file).size : undefined;
}

export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function termList(): Term[] {
  return [...library().dataset.glossary].sort((a, b) => a.term.localeCompare(b.term));
}

export { pad2 };

/** Where the share images are published. They are drawn at build time by `og.ts`. */
export const siteImagePath = '/og/default.png';
export const playImagePath = (schemeId: string, conceptId: string): string => `/og/${schemeId}/${conceptId}.png`;
