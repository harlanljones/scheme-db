import { z } from 'zod';
import { PRESNAP_MAX_SECONDS } from '../engine/presnap';

/**
 * SchemeDB data model. Every record under `data/` is parsed against one of these schemas.
 * Entities: Scheme, Concept (descriptive record), Tracks (geometry), Coach, Lineage, Term.
 * Field names follow the TypeScript model this data was first written in where the meaning is
 * unchanged; the structural moves are documented in `data/README.md`.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a kebab-case slug');
const text = z.string().min(1);
const schemaRef = z.string().optional();

export const Side = z.enum(['offense', 'defense']);
export const Role = z.enum(['ol', 'qb', 'rb', 'te', 'wr', 'dl', 'lb', 'db']);
export const Trail = z.enum(['route', 'block', 'carry', 'drop', 'none']);
export const BallSpot = z.enum(['left', 'middle', 'right']);
export const Era = z.enum(['past-nfl', 'past-college', 'current-college', 'modern-nfl']);
export const LineageBranch = z.enum([
  'shanahan-kubiak',
  'reid-west-coast',
  'power-gap-duo',
  'macdonald-pressure',
  'fangio-two-high',
  'carroll-saleh-wide9',
  'belichick-flores',
  'coryell-vertical',
  'air-raid',
  'option-spread',
  'delaware-wing-t',
  'buddy-46',
  'lebeau-zone-blitz',
  'landry-dallas',
  'phillips-two-gap',
  'two-deep-shell',
  'college-defensive-fronts',
]);

/** How much a reader should trust a record. All 180 launch concepts are `illustrative`. */
export const Confidence = z.enum(['illustrative', 'reconstructed', 'verified']);

export const SourceType = z.enum(['film', 'book', 'clinic', 'article', 'video', 'self-authored']);

/**
 * What a source backs. `idea` is where the concept or scheme comes from. `drawing` is the paths and timings of a play,
 * rebuilt from it; only a play has a drawing. `claim` is a fact stated in the text, such as a date, a number or a mentor
 * link. A source never raises a play's confidence by itself: see `Confidence`.
 */
export const Supports = z.enum(['idea', 'drawing', 'claim']);

export const Source = z.strictObject({
  type: SourceType,
  citation: text,
  /** Pages are linked from the site, so only web links are allowed. */
  url: z.url({ protocol: /^https?$/ }).optional(),
  accessed: z.iso.date().optional(),
  /** Which of the idea, the drawing and the claim the source backs. Absent when the source does not say. */
  supports: z
    .array(Supports)
    .min(1)
    .superRefine((list, ctx) => {
      if (new Set(list).size !== list.length) ctx.addIssue({ code: 'custom', message: 'list each of idea, drawing and claim at most once' });
    })
    .optional(),
});

/** Optional on a scheme, a coach and a lineage. Absent means no sources yet; an empty list says nothing more, so it is not allowed. */
const RecordSources = z.array(Source).min(1).optional();

export const Provenance = z.strictObject({
  confidence: Confidence,
  sources: z.array(Source),
  notes: text.optional(),
});

/** `t` is seconds from the snap: `0` is the snap and a negative value is before it, down to `-PRESNAP_MAX_SECONDS`. */
export const Waypoint = z.strictObject({
  t: z.number().min(-PRESNAP_MAX_SECONDS),
  x: z.number(),
  y: z.number(),
  note: text.optional(),
});

/** A player's path: strictly ascending in time, with a waypoint at exactly the snap (`t = 0`). */
const Waypoints = z
  .array(Waypoint)
  .min(1)
  .superRefine((waypoints, ctx) => {
    waypoints.forEach((waypoint, i) => {
      if (i > 0 && waypoint.t <= waypoints[i - 1].t) {
        ctx.addIssue({ code: 'custom', path: [i, 't'], message: `waypoint times must ascend, found ${waypoint.t} after ${waypoints[i - 1].t}` });
      }
    });
    if (!waypoints.some((waypoint) => waypoint.t === 0)) {
      ctx.addIssue({ code: 'custom', message: 'a track needs a waypoint at the snap (t = 0)' });
    }
  });

/** How a player's waypoints came to be. Absent means `authored`. */
export const Origin = z.enum(['compiled', 'authored']);

export const PlayerTrack = z.strictObject({
  id: text,
  label: text,
  side: Side,
  role: Role,
  trail: Trail,
  assignment: text.optional(),
  origin: Origin.optional(),
  waypoints: Waypoints,
});

export const Beat = z.strictObject({
  t: z.number().min(0),
  title: text,
  text,
  focus: z.array(text).optional(),
});

export const ConceptSummary = z.strictObject({
  motive: text,
  keyDefender: text,
  whyItWorks: text,
  failureMode: text,
});

export const Relations = z.strictObject({
  setsUp: z.array(slug),
  playsOff: z.array(slug),
  tell: text,
});

/** Descriptive record of one play concept. Geometry lives in the matching `Tracks` record. */
export const Concept = z.strictObject({
  $schema: schemaRef,
  id: slug,
  schemeId: slug,
  order: z.number().int().min(1),
  name: text,
  personnel: text,
  formation: text,
  /** The pre-snap alignment preset this concept starts from. Its tracks may move individual players off it. */
  formationId: slug.optional(),
  /**
   * Where the ball is spotted: on the left hash, in the middle (the default) or on the right hash. Published tracks are
   * always drawn with the ball at midfield; see `src/engine/field.ts` for the offset that places a play on the field.
   */
  ballSpot: BallSpot.optional(),
  situation: text,
  coverage: text,
  frontName: text,
  summary: ConceptSummary,
  beats: z.array(Beat),
  relations: Relations,
  provenance: Provenance,
});

/** Where compiled geometry came from: the sha256 of the play spec file and the compiler version that ran on it. */
export const GeneratedFrom = z.strictObject({
  spec: z.string().regex(/^[0-9a-f]{64}$/, 'must be a lowercase sha256 hex digest'),
  compiler: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'must be a semver version'),
});

/** Player geometry for one concept, in LOS-relative yards (x 0..53.33, y negative = backfield). */
export const Tracks = z.strictObject({
  $schema: schemaRef,
  conceptId: slug,
  duration: z.number().positive(),
  generatedFrom: GeneratedFrom.optional(),
  offense: z.array(PlayerTrack),
  defense: z.array(PlayerTrack),
});

/** Where a player lines up before the snap, in the same LOS-relative yards as waypoints. */
export const Alignment = z.strictObject({
  x: z.number().min(0).max(53.33),
  y: z.number(),
  role: Role,
});

/** Pre-snap alignment preset: the 11 offensive and 11 defensive players, keyed by their track id. */
export const Formation = z.strictObject({
  $schema: schemaRef,
  id: slug,
  name: text,
  description: text.optional(),
  offense: z.record(text, Alignment),
  defense: z.record(text, Alignment),
});

export const Scheme = z.strictObject({
  $schema: schemaRef,
  id: slug,
  name: text,
  coachId: slug,
  team: text,
  side: Side,
  era: Era,
  lineage: LineageBranch,
  description: text,
  sources: RecordSources,
});

export const Coach = z.strictObject({
  $schema: schemaRef,
  id: slug,
  name: text,
  role2026: text,
  team: text,
  lineage: LineageBranch,
  mentorId: slug.optional(),
  disciples: z.array(slug).optional(),
  side: Side,
  philosophy: text,
  keyConcepts: z.array(text),
  schemeIds: z.array(slug),
  isHeadCoach2026: z.boolean().optional(),
  notableAchievements: z.array(text).optional(),
  /** The day `role2026`, `team` and `isHeadCoach2026` were last checked. Absent means they have no date. */
  asOf: z.iso.date().optional(),
  sources: RecordSources,
});

export const LineageNode = z.strictObject({
  coachId: slug,
  get children() {
    return z.array(LineageNode);
  },
});

export const Lineage = z.strictObject({
  $schema: schemaRef,
  id: LineageBranch,
  name: text,
  patriarch: text,
  side: Side,
  description: text,
  rootNodes: z.array(LineageNode),
  sources: RecordSources,
});

export const TermCategory = z.enum([
  'Blocking Scheme',
  'Run Concept',
  'Pass Concept',
  'Defensive Front',
  'Coverage & Shell',
  'Read & Assignment',
  'Scheme & Concept',
]);

export const Term = z.strictObject({
  $schema: schemaRef,
  id: slug,
  term: text,
  aliases: z.array(text),
  category: TermCategory,
  shortDef: text,
  tacticalNote: text,
});

export type Source = z.infer<typeof Source>;
export type Supports = z.infer<typeof Supports>;
export type Concept = z.infer<typeof Concept>;
export type Tracks = z.infer<typeof Tracks>;
export type Formation = z.infer<typeof Formation>;
export type Alignment = z.infer<typeof Alignment>;
export type Scheme = z.infer<typeof Scheme>;
export type Coach = z.infer<typeof Coach>;
export type Lineage = z.infer<typeof Lineage>;
export type LineageNode = z.infer<typeof LineageNode>;
export type Term = z.infer<typeof Term>;

/** Directory under `data/` and Zod schema for every record kind. */
export const RECORD_KINDS = {
  schemes: Scheme,
  concepts: Concept,
  tracks: Tracks,
  formations: Formation,
  coaches: Coach,
  lineages: Lineage,
  glossary: Term,
} as const;

export type RecordKind = keyof typeof RECORD_KINDS;

export interface Dataset {
  schemes: Scheme[];
  concepts: Concept[];
  tracks: Tracks[];
  formations: Formation[];
  coaches: Coach[];
  lineages: Lineage[];
  glossary: Term[];
}
