import { z } from 'zod';

/**
 * SchemeDB data model. Every record under `data/` is parsed against one of these schemas.
 * Entities: Scheme, Concept (descriptive record), Tracks (geometry), Coach, Lineage, Term.
 * Field names follow the legacy TypeScript model where the meaning is unchanged; the
 * structural moves are documented in `data/README.md`.
 */

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a kebab-case slug');
const text = z.string().min(1);
const schemaRef = z.string().optional();

export const Side = z.enum(['offense', 'defense']);
export const Role = z.enum(['ol', 'qb', 'rb', 'te', 'wr', 'dl', 'lb', 'db']);
export const Trail = z.enum(['route', 'block', 'carry', 'drop', 'none']);
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

export const Source = z.strictObject({
  type: SourceType,
  citation: text,
  url: z.url().optional(),
  accessed: z.iso.date().optional(),
});

export const Provenance = z.strictObject({
  confidence: Confidence,
  sources: z.array(Source),
  notes: text.optional(),
});

export const Waypoint = z.strictObject({
  t: z.number().min(0),
  x: z.number(),
  y: z.number(),
  note: text.optional(),
});

export const PlayerTrack = z.strictObject({
  id: text,
  label: text,
  side: Side,
  role: Role,
  trail: Trail,
  assignment: text.optional(),
  waypoints: z.array(Waypoint).min(1),
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
  situation: text,
  coverage: text,
  frontName: text,
  summary: ConceptSummary,
  beats: z.array(Beat),
  relations: Relations,
  provenance: Provenance,
});

/** Player geometry for one concept, in LOS-relative yards (x 0..53.33, y negative = backfield). */
export const Tracks = z.strictObject({
  $schema: schemaRef,
  conceptId: slug,
  duration: z.number().positive(),
  offense: z.array(PlayerTrack),
  defense: z.array(PlayerTrack),
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

export type Concept = z.infer<typeof Concept>;
export type Tracks = z.infer<typeof Tracks>;
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
  coaches: Coach,
  lineages: Lineage,
  glossary: Term,
} as const;

export type RecordKind = keyof typeof RECORD_KINDS;

export interface Dataset {
  schemes: Scheme[];
  concepts: Concept[];
  tracks: Tracks[];
  coaches: Coach[];
  lineages: Lineage[];
  glossary: Term[];
}
