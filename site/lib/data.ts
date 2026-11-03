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
import type { PlayRow } from '../islands/PlayTable';
import type { CoachRow } from '../islands/CoachTable';
import { count, nameFromId, pad2, tidy } from './format';
import { searchKey } from './search';

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

/** How many plays sit at each confidence level. Everything the site says about trust is built from this. */
export interface ConfidenceCounts {
  illustrative: number;
  reconstructed: number;
  verified: number;
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
  confidence: ConfidenceCounts;
  /** The fewest and most plays any scheme has. Copy that names a number of plays per scheme reads these. */
  playsPerScheme: { min: number; max: number };
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

  const confidence: ConfidenceCounts = { illustrative: 0, reconstructed: 0, verified: 0 };
  for (const concept of dataset.concepts) confidence[concept.provenance.confidence] += 1;
  const perScheme = schemes.map((scheme) => scheme.plays.length);

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
    confidence,
    playsPerScheme: { min: Math.min(...perScheme), max: Math.max(...perScheme) },
  };
  return cached;
}

export type Confidence = Concept['provenance']['confidence'];

/** What each confidence level is called on the site and what it promises. The definitions match data/README.md. */
export const CONFIDENCE: Record<Confidence, { label: string; article: string; meaning: string }> = {
  illustrative: { label: 'Illustrative', article: 'an', meaning: 'Drawn by hand to teach the idea. Not checked against film.' },
  reconstructed: { label: 'Reconstructed', article: 'a', meaning: 'Rebuilt from the sources listed on the sheet. Not tracking data.' },
  verified: { label: 'Verified', article: 'a', meaning: 'Reconstructed from the sources listed on the sheet, then reviewed by a second person.' },
};

/** "an illustrative play", "a reconstructed play". */
export const playPhrase = (confidence: Confidence): string => `${CONFIDENCE[confidence].article} ${confidence} play`;

/** True while every play is labeled `illustrative`, as at launch. The site says so loudly; once that stops being true it says what is. */
export function allIllustrative(lib: Library = library()): boolean {
  return lib.confidence.reconstructed === 0 && lib.confidence.verified === 0;
}

/** "illustrative plays" while every play is illustrative, plain "plays" once some are not. */
export function playsNoun(lib: Library = library()): string {
  return allIllustrative(lib) ? 'illustrative plays' : 'plays';
}

/** The sentence the notice bar and the footer carry. */
export function trustNotice(lib: Library = library()): { lead: string; rest: string } {
  const base = 'They show how a scheme works, not what a team ran on one snap.';
  if (allIllustrative(lib)) return { lead: `All ${lib.counts.plays} plays are illustrative.`, rest: base };
  return {
    lead: `${lib.confidence.illustrative} of ${lib.counts.plays} plays are illustrative.`,
    rest: `${base} The others cite their sources, and each play sheet says how far to trust it.`,
  };
}

/** How many plays each scheme has, for copy: "four", or "four to six" when schemes differ. */
export function playsPerSchemeWords(lib: Library = library()): string {
  const { min, max } = lib.playsPerScheme;
  return min === max ? count(min) : `${count(min)} to ${count(max)}`;
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
      hay: searchKey(`${play.name} ${play.formation} ${play.frontName} ${play.coverage} ${play.personnel}`),
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

/** Every coach in the data has a page. */
export const coachHref = (coach: Coach | string): string => `/coaches/${typeof coach === 'string' ? coach : coach.id}/`;

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

const surnameOf = (name: string): string => name.trim().split(/\s+/).pop()!.toLowerCase();

export interface CoachView extends Coach {
  /** Position in the coaches list, 1 to 53, by surname. */
  no: number;
  href: string;
  roleDisplay: string;
  teamDisplay: string;
  lineageName: string;
  /** Schemes credited to the coach, in contents order. */
  schemes: SchemeView[];
  /** Other coaches' schemes the coach record links to (`schemeIds`): one they shaped, ran or passed on. */
  linked: SchemeView[];
  /** Eras of the coach's own schemes, or of the linked ones when there are none, in the usual era order. */
  eras: Scheme['era'][];
}

let cachedCoaches: CoachView[] | undefined;

/** Every coach, by surname, with the schemes they are credited with. */
export function coachViews(): CoachView[] {
  if (cachedCoaches) return cachedCoaches;
  const lib = library();
  const ordered = [...lib.dataset.coaches].sort((a, b) => surnameOf(a.name).localeCompare(surnameOf(b.name)) || a.name.localeCompare(b.name));
  cachedCoaches = ordered.map((coach, index) => {
    const schemes = lib.schemes.filter((scheme) => scheme.coachId === coach.id);
    const linked = lib.schemes.filter((scheme) => scheme.coachId !== coach.id && coach.schemeIds.includes(scheme.id));
    const eraSource = schemes.length > 0 ? schemes : linked;
    return {
      ...coach,
      no: index + 1,
      href: coachHref(coach),
      roleDisplay: tidy(coach.role2026),
      teamDisplay: tidy(coach.team),
      lineageName: tidy(lib.lineageById.get(coach.lineage)?.name ?? nameFromId(coach.lineage)),
      schemes,
      linked,
      eras: ERA_ORDER.filter((era) => eraSource.some((scheme) => scheme.era === era)),
    };
  });
  return cachedCoaches;
}

/** One row per coach for the coaches list, with the text a search looks through. */
export function coachRows(): CoachRow[] {
  return coachViews().map((coach) => ({
    id: coach.id,
    no: pad2(coach.no),
    name: coach.name,
    role: coach.roleDisplay,
    side: coach.side,
    lineage: coach.lineage,
    lineageName: coach.lineageName,
    eras: coach.eras,
    eraLabel: coach.eras.length > 0 ? coach.eras.map((era) => ERA_LABELS[era]).join(', ') : 'Lineage only',
    href: coach.href,
    hay: searchKey([coach.name, coach.role2026, coach.team, ...coach.keyConcepts, ...[...coach.schemes, ...coach.linked].map((scheme) => scheme.name)].join(' ')),
  }));
}

/** People named as a mentor or disciple who have no coach record, with the coaches who name them. */
export function namedOnly(): Array<Person & { namedBy: CoachView[] }> {
  const lib = library();
  const named = new Map<string, Set<string>>();
  for (const coach of lib.dataset.coaches) {
    for (const id of [coach.mentorId, ...(coach.disciples ?? [])]) {
      if (!id || lib.coachById.has(id)) continue;
      if (!named.has(id)) named.set(id, new Set());
      named.get(id)!.add(coach.id);
    }
  }
  const views = new Map(coachViews().map((coach) => [coach.id, coach]));
  return [...named.entries()]
    .map(([id, by]) => ({ ...personOf(id), namedBy: [...by].map((coachId) => views.get(coachId)!).sort((a, b) => a.no - b.no) }))
    .sort((a, b) => surnameOf(a.name).localeCompare(surnameOf(b.name)) || a.name.localeCompare(b.name));
}

/** The down a situation starts with ("3rd & 6, +42" is 3rd), or `other`. */
export function downOf(situation: string): '1st' | '2nd' | '3rd' | '4th' | 'other' {
  const match = /^(1st|2nd|3rd|4th)\b/i.exec(situation.trim());
  return match ? (match[1].toLowerCase() as '1st' | '2nd' | '3rd' | '4th') : 'other';
}

/** The down and distance of a situation, without the field position and notes. */
export const situationShort = (situation: string): string => tidy(situation.split(',')[0]!.trim());

/** A personnel group without the explanation in brackets: "Okie/Bear Package (5 DL, 2 LB, 4 DB)" is "Okie/Bear Package". */
export const personnelShort = (personnel: string): string => personnel.replace(/\s*\([^)]*\)/g, '').trim();

/** One row per play for the plays list, in contents order, with the text a search looks through. */
export function playRows(): PlayRow[] {
  const lib = library();
  return lib.schemes.flatMap((scheme) =>
    scheme.plays.map((play) => ({
      id: play.id,
      key: `${pad2(scheme.no)}.${play.order}`,
      name: play.nameDisplay,
      href: play.href,
      schemeName: scheme.nameDisplay,
      schemeHref: scheme.href,
      coach: scheme.coachName,
      sheet: play.sheet,
      side: scheme.side,
      era: scheme.era,
      down: downOf(play.situation),
      situation: situationShort(play.situation),
      personnel: personnelShort(play.personnel),
      formation: tidy(play.formation),
      hay: searchKey([play.name, scheme.name, scheme.coachName, scheme.team, play.formation, play.personnel, play.frontName, play.coverage, play.situation].join(' ')),
    })),
  );
}
