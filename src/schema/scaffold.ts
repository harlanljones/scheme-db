import type { ZodType } from 'zod';
import { Coach, Concept, Era, LineageBranch, Scheme, Side, Term, TermCategory, Tracks, type Dataset, type Formation } from './schema';

type PlayerTrackRecord = Tracks['offense'][number];

/**
 * Starting points for new records. Every builder returns complete records that already parse against their schema,
 * with `TODO:` wherever a person has to say something. `data:validate` rejects `TODO:` text, so running it lists
 * exactly what is left to write. The builders are pure; `scripts/new.ts` writes the files.
 */

export class ScaffoldError extends Error {}

/** A file to write, relative to `data/`. */
export interface ScaffoldWrite {
  path: string;
  record: unknown;
  /** True when the file already exists and is being updated rather than created. */
  update?: boolean;
}

export interface Scaffold {
  writes: ScaffoldWrite[];
  /** What to do next, in order. */
  next: string[];
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slug(kind: string, value: string | undefined): string {
  if (!value) throw new ScaffoldError(`Give the ${kind} an id with --id (lowercase words joined by hyphens, like "wide-zone").`);
  if (!SLUG.test(value)) throw new ScaffoldError(`"${value}" is not a valid ${kind} id: use lowercase letters, digits and single hyphens, like "wide-zone".`);
  return value;
}

function required(flag: string, value: string | undefined): string {
  if (!value?.trim()) throw new ScaffoldError(`Missing --${flag}.`);
  return value.trim();
}

function choice<T extends string>(flag: string, value: string | undefined, allowed: readonly T[]): T {
  const v = required(flag, value);
  if (!(allowed as readonly string[]).includes(v)) throw new ScaffoldError(`--${flag} must be one of: ${allowed.join(', ')} (got "${v}").`);
  return v as T;
}

function check<T>(schema: ZodType<T>, record: unknown, label: string): T {
  const parsed = schema.safeParse(record);
  if (!parsed.success) {
    throw new ScaffoldError(`The ${label} record is invalid:\n${parsed.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n')}`);
  }
  return parsed.data;
}

const TODO = (what: string): string => `TODO: ${what}`;

export interface ConceptOptions {
  scheme?: string;
  id?: string;
  name?: string;
  /** A formation preset to start the 22 players on. Defaults to the one the scheme's first play uses. */
  formation?: string;
  /** Copy the framing and the tracks of an existing play as a starting point. */
  like?: string;
  duration?: number;
  confidence?: 'illustrative' | 'reconstructed' | 'verified';
  setsUp?: string[];
  playsOff?: string[];
}

function withoutOrigin(player: PlayerTrackRecord): PlayerTrackRecord {
  const copy = { ...player };
  delete copy.origin;
  return copy;
}

function tracksFromFormation(formation: Formation, conceptId: string, duration: number) {
  const players = (side: 'offense' | 'defense'): PlayerTrackRecord[] =>
    Object.entries(formation[side]).map(([label, spot]) => ({
      id: label,
      label,
      side,
      role: spot.role,
      trail: 'none',
      waypoints: [
        { t: 0, x: spot.x, y: spot.y },
        { t: duration, x: spot.x, y: spot.y },
      ],
    }));
  return { $schema: '../../schema/tracks.schema.json', conceptId, duration, offense: players('offense'), defense: players('defense') };
}

export function newConcept(ds: Dataset, options: ConceptOptions): Scaffold {
  const id = slug('play', options.id);
  const name = required('name', options.name);
  const schemeId = required('scheme', options.scheme);
  const scheme = ds.schemes.find((s) => s.id === schemeId);
  if (!scheme) throw new ScaffoldError(`No scheme "${schemeId}". Schemes are the files in data/schemes/; to start one, run \`bun run data:new scheme\`.`);
  if (ds.concepts.some((c) => c.id === id)) throw new ScaffoldError(`A play with the id "${id}" already exists. Play ids are unique across all schemes; prefix yours with the scheme's name.`);

  const inScheme = ds.concepts.filter((c) => c.schemeId === schemeId).sort((a, b) => a.order - b.order);
  const like = options.like ? ds.concepts.find((c) => c.id === options.like) : undefined;
  if (options.like && !like) throw new ScaffoldError(`No play "${options.like}" to copy from.`);
  const likeTracks = like ? ds.tracks.find((t) => t.conceptId === like.id) : undefined;

  const formationId = options.formation ?? like?.formationId ?? inScheme.find((c) => c.formationId)?.formationId;
  const formation = formationId ? ds.formations.find((f) => f.id === formationId) : undefined;
  if (!like) {
    if (!formationId) throw new ScaffoldError(`Say where the 22 players start with --formation <id>. Formations are the files in data/formations/.`);
    if (!formation) throw new ScaffoldError(`No formation "${formationId}". Formations are the files in data/formations/.`);
  }

  const duration = options.duration ?? likeTracks?.duration ?? 4;
  const tracks = likeTracks
    ? {
        $schema: '../../schema/tracks.schema.json',
        conceptId: id,
        duration: likeTracks.duration,
        // The copy is edited by hand from here, so it no longer matches the spec it may have been compiled from.
        offense: likeTracks.offense.map(withoutOrigin),
        defense: likeTracks.defense.map(withoutOrigin),
      }
    : tracksFromFormation(formation!, id, duration);

  const focus = tracks.offense.find((p) => p.id === 'QB')?.id ?? tracks.offense[0]?.id;
  const confidence = options.confidence ?? 'illustrative';
  const base = inScheme[0]?.id;
  const playsOff = options.playsOff ?? (like && like.schemeId === schemeId ? [like.id] : base ? [base] : []);

  const concept = check(
    Concept,
    {
      $schema: '../../schema/concept.schema.json',
      id,
      schemeId,
      order: (inScheme.at(-1)?.order ?? 0) + 1,
      name,
      personnel: like?.personnel ?? TODO('personnel group, such as 11 or 21'),
      formation: like?.formation ?? TODO('the look in a few words, such as Offset I, Wing Right'),
      ...(formationId ? { formationId } : {}),
      ...(like?.ballSpot ? { ballSpot: like.ballSpot } : {}),
      situation: like?.situation ?? TODO('down and distance, such as 1st & 10, +40, base down'),
      coverage: like?.coverage ?? TODO('the coverage it is drawn against, such as Cover 3'),
      frontName: like?.frontName ?? TODO('the front it is drawn against, such as 4-3 Over front'),
      summary: {
        motive: TODO('what the play is for, in one sentence'),
        keyDefender: TODO('the defender it puts in conflict'),
        whyItWorks: TODO('why it works against that defender'),
        failureMode: TODO('what the defense does to beat it'),
      },
      beats: [{ t: 0.5, title: TODO('name the first moment worth stopping on'), text: TODO('what happens, and what to watch'), focus: focus ? [focus] : [] }],
      relations: {
        setsUp: options.setsUp ?? [],
        playsOff,
        tell: TODO('what looks the same as the plays it relates to, and when it shows'),
      },
      provenance: {
        confidence,
        sources:
          confidence === 'illustrative'
            ? []
            : [{ type: 'film', citation: TODO('the film, book, clinic or article this play is rebuilt from') }],
      },
    },
    'play',
  );
  const checkedTracks = check(Tracks, tracks, 'tracks');

  return {
    writes: [
      { path: `concepts/${schemeId}/${id}.json`, record: concept },
      { path: `tracks/${schemeId}/${id}.json`, record: checkedTracks },
    ],
    next: [
      `Edit data/tracks/${schemeId}/${id}.json: ${like ? `the players are copied from "${like.id}"; move them to draw this play` : 'every player stands still; add waypoints (t, x, y in yards from the line of scrimmage) to move them'}.`,
      `Replace every TODO in data/concepts/${schemeId}/${id}.json, and list the plays it sets up or plays off in "relations" (at least one play in ${schemeId}).`,
      ...(like ? [] : ['Give each moving player a "trail" (route, block, carry or drop) and an "assignment".']),
    ],
  };
}

export interface SchemeOptions {
  id?: string;
  name?: string;
  coach?: string;
  team?: string;
  side?: string;
  era?: string;
  lineage?: string;
}

export function newScheme(ds: Dataset, options: SchemeOptions): Scaffold {
  const id = slug('scheme', options.id);
  if (ds.schemes.some((s) => s.id === id)) throw new ScaffoldError(`A scheme with the id "${id}" already exists.`);
  const coachId = required('coach', options.coach);
  const coach = ds.coaches.find((c) => c.id === coachId);
  if (!coach) throw new ScaffoldError(`No coach "${coachId}". Coaches are the files in data/coaches/; to add one, run \`bun run data:new coach\`.`);

  const scheme = check(
    Scheme,
    {
      $schema: '../schema/scheme.schema.json',
      id,
      name: required('name', options.name),
      coachId,
      team: required('team', options.team),
      side: choice('side', options.side ?? coach.side, Side.options),
      era: choice('era', options.era, Era.options),
      lineage: choice('lineage', options.lineage ?? coach.lineage, LineageBranch.options),
      description: TODO('what the scheme is, in two or three sentences'),
    },
    'scheme',
  );

  const writes: ScaffoldWrite[] = [{ path: `schemes/${id}.json`, record: scheme }];
  if (!coach.schemeIds.includes(id)) {
    writes.push({ path: `coaches/${coach.id}.json`, record: { ...coach, schemeIds: [...coach.schemeIds, id] }, update: true });
  }
  return {
    writes,
    next: [
      `Replace the TODO in data/schemes/${id}.json.`,
      `A scheme needs at least one play: run \`bun run data:new concept --scheme ${id} --id ${id}-<play> --name "<Play name>" --formation <formation id>\`.`,
    ],
  };
}

export interface CoachOptions {
  id?: string;
  name?: string;
  team?: string;
  role?: string;
  side?: string;
  lineage?: string;
  mentor?: string;
}

export function newCoach(ds: Dataset, options: CoachOptions): Scaffold {
  const id = slug('coach', options.id);
  if (ds.coaches.some((c) => c.id === id)) throw new ScaffoldError(`A coach with the id "${id}" already exists.`);
  const coach = check(
    Coach,
    {
      $schema: '../schema/coach.schema.json',
      id,
      name: required('name', options.name),
      role2026: options.role?.trim() || TODO('current role, such as Offensive coordinator'),
      team: required('team', options.team),
      lineage: choice('lineage', options.lineage, LineageBranch.options),
      ...(options.mentor ? { mentorId: slug('mentor', options.mentor) } : {}),
      side: choice('side', options.side, Side.options),
      philosophy: TODO('how the coach builds an offense or defense, in two or three sentences'),
      keyConcepts: [TODO('a concept the coach is known for')],
      schemeIds: [],
    },
    'coach',
  );
  return {
    writes: [{ path: `coaches/${id}.json`, record: coach }],
    next: [
      `Replace every TODO in data/coaches/${id}.json.`,
      `To put the coach on the lineage chart, add a node with "coachId": "${id}" to data/lineages/${coach.lineage}.json.`,
      `If the coach has a scheme to add, run \`bun run data:new scheme --coach ${id} ...\`.`,
    ],
  };
}

export interface TermOptions {
  id?: string;
  term?: string;
  category?: string;
}

export function newTerm(ds: Dataset, options: TermOptions): Scaffold {
  const id = slug('term', options.id);
  if (ds.glossary.some((t) => t.id === id)) throw new ScaffoldError(`A glossary term with the id "${id}" already exists.`);
  const term = check(
    Term,
    {
      $schema: '../schema/term.schema.json',
      id,
      term: required('term', options.term),
      aliases: [],
      category: choice('category', options.category, TermCategory.options),
      shortDef: TODO('a one sentence definition a fan could follow'),
      tacticalNote: TODO('why a coach cares, in one sentence'),
    },
    'term',
  );
  return { writes: [{ path: `glossary/${id}.json`, record: term }], next: [`Replace the TODOs in data/glossary/${id}.json.`] };
}
