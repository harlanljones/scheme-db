import { z } from 'zod';
import { Waypoint } from '../schema/schema';
import { BLOCKS, DROPS, MAN, ROUTES, RUSHES, ZONES, keysOf } from './vocabulary';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a kebab-case slug');
const text = z.string().min(1);

/** Enum whose JSON Schema carries one definition per term. */
const terms = <T extends Record<string, string>>(table: T) =>
  z.union(keysOf(table).map((term) => z.literal(term).describe(table[term])) as [z.ZodLiteral<string>, z.ZodLiteral<string>, ...z.ZodLiteral<string>[]]) as unknown as z.ZodType<keyof T & string>;

const Direction = z.enum(['left', 'right']);
const ZoneSide = z.enum(['left', 'middle', 'right']);
const assignment = text.describe('Text for the viewer. Defaults to a description of the term.').optional();

export const RouteAction = z.strictObject({
  route: terms(ROUTES),
  depth: z.number().positive().describe('Yards upfield at the break (or total depth for flat and shallow).').optional(),
  delay: z.number().min(0).describe('Seconds to wait after the snap before releasing.').optional(),
  side: Direction.describe('Direction to run for flat, shallow and swing. Defaults to outward (inward for shallow).').optional(),
  assignment,
});

export const BlockAction = z.strictObject({
  block: terms(BLOCKS),
  depth: z.number().min(0).describe('Yards of retreat for a pass set.').optional(),
  side: Direction.describe('Release direction for a check-release.').optional(),
  assignment,
});

export const DropAction = z.strictObject({
  drop: terms(DROPS),
  depth: z.number().positive().describe('Overrides the drop distance in yards.').optional(),
  assignment,
});

export const OffenseAction = z.union([RouteAction, BlockAction, DropAction]);

export const RushAction = z.strictObject({
  rush: terms(RUSHES),
  depth: z.number().positive().describe('Yards of penetration by the end of the play.').optional(),
  assignment,
});

export const ZoneAction = z.strictObject({
  zone: terms(ZONES),
  side: ZoneSide.optional(),
  assignment,
});

export const ManAction = z.strictObject({
  man: text.describe(MAN),
  cushion: z.number().min(0).describe('Yards behind the receiver once the defender has settled.').optional(),
  lag: z.number().min(0).describe('Seconds the defender trails the receiver.').optional(),
  assignment,
});

export const DefenseAction = z.union([RushAction, ZoneAction, ManAction]);

/** Hand-authored waypoints that replace or add points on one player's compiled path. */
export const Override = z.strictObject({
  path: z.array(Waypoint).min(1),
});

/**
 * A play spec: a formation preset plus one job per player, compiled into the timed waypoints of a Tracks record.
 * `OL` stands for every offensive lineman and `DL` for every defensive lineman in the formation.
 */
export const Spec = z.strictObject({
  $schema: z.string().optional(),
  conceptId: slug,
  duration: z.number().positive(),
  formation: slug.describe('Id of a record in data/formations/.'),
  offense: z.record(text, OffenseAction),
  defense: z.record(text, DefenseAction),
  overrides: z.record(text, Override).optional(),
});

export type Spec = z.infer<typeof Spec>;
export type OffenseAction = z.infer<typeof OffenseAction>;
export type DefenseAction = z.infer<typeof DefenseAction>;
