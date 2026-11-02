import { alignmentOverrides } from './formations';
import { validatePlay } from '../engine/validate';
import type { Play } from '../engine/types';
import type { Concept, Dataset, Tracks } from './schema';
import type { RecordFiles } from './load';

/**
 * Adapts a Concept plus its Tracks to the legacy `Play` shape so the existing geometry
 * checks (player counts, waypoint ordering, bounds, beat focus ids) keep running unchanged.
 * `coach` and `family` are not read by `validatePlay`.
 */
const asPlay = (concept: Concept, tracks: Tracks): Play =>
  ({ ...concept, duration: tracks.duration, offense: tracks.offense, defense: tracks.defense, sequence: concept.relations }) as unknown as Play;

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) (seen.has(id) ? dupes : seen).add(id);
  return [...dupes];
}

/**
 * People named as a mentor or disciple who have no coach record yet. They are reported as warnings so the gap stays
 * visible. Any other unknown id is an error: it is almost always a typo, or a link to a coach whose record still has
 * to be added. Adding a record for one of these people makes its entry here harmless; remove it when convenient.
 */
export const UNRECORDED_PEOPLE: ReadonlySet<string> = new Set([
  'bill-parcells',
  'bobby-slowik',
  'bruce-arians',
  'dan-campbell',
  'frank-reich',
  'george-seifert',
  'gus-bradley',
  'jim-johnson',
  'jim-mora',
  'mike-holmgren',
  'monte-kiffin',
  'paul-brown',
]);

/** Text the scaffold writes where a contributor has to say something. `data:validate` fails until every one is replaced. */
export const PLACEHOLDER = /^TODO\b/;

function* placeholders(value: unknown, path = ''): Generator<string> {
  if (typeof value === 'string') {
    if (PLACEHOLDER.test(value)) yield path;
  } else if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) yield* placeholders(item, `${path}[${i}]`);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) yield* placeholders(item, path ? `${path}.${key}` : key);
  }
}

export interface ValidationReport {
  /** Violations that fail CI. */
  errors: string[];
  /** Known gaps that are reported but do not fail CI. */
  warnings: string[];
}

/**
 * Cross-record checks that a per-file schema cannot express: unique ids, every reference
 * resolves, files live where their ids say, and every concept's geometry is valid.
 * Mentor and disciple ids that point at people without a coach profile are warnings only for the
 * people listed in `UNRECORDED_PEOPLE` (see data/README.md); any other unknown id is an error.
 */
export function validateDataset(ds: Dataset, files?: RecordFiles): ValidationReport {
  const problems: string[] = [];
  const warnings: string[] = [];

  for (const [kind, ids] of [
    ['scheme', ds.schemes.map((s) => s.id)],
    ['concept', ds.concepts.map((c) => c.id)],
    ['formation', ds.formations.map((f) => f.id)],
    ['coach', ds.coaches.map((c) => c.id)],
    ['lineage', ds.lineages.map((l) => l.id)],
    ['term', ds.glossary.map((t) => t.id)],
  ] as const) {
    for (const id of duplicates([...ids])) problems.push(`Duplicate ${kind} id "${id}"`);
  }

  for (const [label, records] of [
    ['Scheme', ds.schemes],
    ['Concept', ds.concepts],
    ['Coach', ds.coaches],
    ['Lineage', ds.lineages],
    ['Term', ds.glossary],
  ] as const) {
    for (const record of records) {
      for (const path of placeholders(record)) problems.push(`${label} "${record.id}": ${path} is still a TODO placeholder; replace it`);
    }
  }
  for (const tracks of ds.tracks) {
    for (const path of placeholders(tracks)) problems.push(`Tracks "${tracks.conceptId}": ${path} is still a TODO placeholder; replace it`);
  }

  const schemeIds = new Set(ds.schemes.map((s) => s.id));
  const conceptIds = new Set(ds.concepts.map((c) => c.id));
  const coachIds = new Set(ds.coaches.map((c) => c.id));
  const tracksByConcept = new Map(ds.tracks.map((t) => [t.conceptId, t]));

  for (const id of duplicates(ds.tracks.map((t) => t.conceptId))) problems.push(`More than one tracks record for concept "${id}"`);

  for (const scheme of ds.schemes) {
    if (!coachIds.has(scheme.coachId)) problems.push(`Scheme "${scheme.id}" references unknown coach "${scheme.coachId}"`);
    if (!ds.concepts.some((c) => c.schemeId === scheme.id)) problems.push(`Scheme "${scheme.id}" has no concepts`);
  }

  const formationsById = new Map(ds.formations.map((f) => [f.id, f]));
  for (const formation of ds.formations) {
    for (const side of ['offense', 'defense'] as const) {
      const count = Object.keys(formation[side]).length;
      if (count !== 11) problems.push(`Formation "${formation.id}" has ${count} ${side} players, expected 11`);
    }
  }

  const ordersByScheme = new Map<string, number[]>();
  for (const concept of ds.concepts) {
    if (!schemeIds.has(concept.schemeId)) problems.push(`Concept "${concept.id}" references unknown scheme "${concept.schemeId}"`);
    ordersByScheme.set(concept.schemeId, [...(ordersByScheme.get(concept.schemeId) ?? []), concept.order]);

    for (const [field, targets] of [
      ['setsUp', concept.relations.setsUp],
      ['playsOff', concept.relations.playsOff],
    ] as const) {
      for (const target of targets) {
        if (!conceptIds.has(target)) problems.push(`Concept "${concept.id}" relations.${field} references unknown concept "${target}"`);
      }
    }

    if (concept.provenance.confidence !== 'illustrative' && concept.provenance.sources.length === 0) {
      problems.push(`Concept "${concept.id}" is "${concept.provenance.confidence}" but lists no sources`);
    }

    // The plays list filters by down, which it reads from the start of the situation.
    if (!PLACEHOLDER.test(concept.situation) && !/^(1st|2nd|3rd|4th)\b/i.test(concept.situation.trim())) {
      problems.push(`Concept "${concept.id}": situation must start with the down, like "1st & 10, +40, base down" (the plays list filters by it); found "${concept.situation}"`);
    }

    const sameScheme = ds.concepts.filter((c) => c.schemeId === concept.schemeId);
    const linksWithinScheme = [...concept.relations.setsUp, ...concept.relations.playsOff].some(
      (target) => target !== concept.id && sameScheme.some((c) => c.id === target),
    );
    if (sameScheme.length > 1 && !linksWithinScheme) {
      problems.push(
        `Concept "${concept.id}" relates to no other play in scheme "${concept.schemeId}"; list at least one of its plays in relations.setsUp or relations.playsOff (the site compares a play with the plays it relates to)`,
      );
    }

    const tracks = tracksByConcept.get(concept.id);
    if (!tracks) {
      problems.push(`Concept "${concept.id}" has no tracks record`);
      continue;
    }
    if (concept.formationId) {
      const formation = formationsById.get(concept.formationId);
      if (!formation) {
        problems.push(`Concept "${concept.id}" references unknown formation "${concept.formationId}"`);
      } else {
        for (const side of ['offense', 'defense'] as const) {
          const trackIds = new Set(tracks[side].map((player) => player.id));
          const missing = Object.keys(formation[side]).filter((label) => !trackIds.has(label));
          if (missing.length > 0) problems.push(`Concept "${concept.id}" has no ${side} track for formation "${formation.id}" players ${missing.join(', ')}`);
        }
        const drift = alignmentOverrides(formation, tracks);
        if (drift.length > 0) warnings.push(`Concept "${concept.id}" starts ${drift.map((d) => d.id).join(', ')} off formation "${formation.id}"`);
      }
    }
    for (const problem of validatePlay(asPlay(concept, tracks))) problems.push(`Concept "${concept.id}": ${problem}`);
  }

  for (const [schemeId, orders] of ordersByScheme) {
    const sorted = [...orders].sort((a, b) => a - b);
    if (sorted.some((order, i) => order !== i + 1)) problems.push(`Scheme "${schemeId}" concept order must run 1..${orders.length}, found ${sorted.join(',')}`);
  }

  for (const tracks of ds.tracks) {
    if (!conceptIds.has(tracks.conceptId)) problems.push(`Tracks record references unknown concept "${tracks.conceptId}"`);
    const compiled = [...tracks.offense, ...tracks.defense].filter((player) => player.origin === 'compiled');
    if (compiled.length > 0 && !tracks.generatedFrom) {
      problems.push(`Tracks "${tracks.conceptId}" has compiled players (${compiled.map((p) => p.id).join(', ')}) but no generatedFrom`);
    }
  }

  const unrecorded = (coachId: string, role: 'mentor' | 'disciple', person: string): void => {
    if (coachIds.has(person)) return;
    if (UNRECORDED_PEOPLE.has(person)) {
      warnings.push(`Coach "${coachId}" ${role} "${person}" has no coach record`);
    } else {
      problems.push(`Coach "${coachId}" ${role} "${person}" has no coach record; add data/coaches/${person}.json or fix the id`);
    }
  };
  for (const coach of ds.coaches) {
    if (coach.mentorId) unrecorded(coach.id, 'mentor', coach.mentorId);
    for (const disciple of coach.disciples ?? []) unrecorded(coach.id, 'disciple', disciple);
    for (const schemeId of coach.schemeIds) {
      if (!schemeIds.has(schemeId)) problems.push(`Coach "${coach.id}" references unknown scheme "${schemeId}"`);
    }
  }

  const checkNodes = (lineageId: string, nodes: { coachId: string; children: unknown[] }[]): void => {
    for (const node of nodes) {
      if (!coachIds.has(node.coachId)) problems.push(`Lineage "${lineageId}" references unknown coach "${node.coachId}"`);
      checkNodes(lineageId, node.children as typeof nodes);
    }
  };
  for (const lineage of ds.lineages) checkNodes(lineage.id, lineage.rootNodes);

  if (files) {
    const expected = (kind: keyof RecordFiles, i: number, rel: string): void => {
      if (files[kind][i] !== rel) problems.push(`${files[kind][i]}: expected to live at ${rel}`);
    };
    ds.schemes.forEach((r, i) => expected('schemes', i, `schemes/${r.id}.json`));
    ds.concepts.forEach((r, i) => expected('concepts', i, `concepts/${r.schemeId}/${r.id}.json`));
    ds.formations.forEach((r, i) => expected('formations', i, `formations/${r.id}.json`));
    ds.tracks.forEach((r, i) => {
      const scheme = ds.concepts.find((c) => c.id === r.conceptId)?.schemeId;
      if (scheme) expected('tracks', i, `tracks/${scheme}/${r.conceptId}.json`);
    });
    ds.coaches.forEach((r, i) => expected('coaches', i, `coaches/${r.id}.json`));
    ds.lineages.forEach((r, i) => expected('lineages', i, `lineages/${r.id}.json`));
    ds.glossary.forEach((r, i) => expected('glossary', i, `glossary/${r.id}.json`));
  }

  return { errors: problems, warnings };
}
