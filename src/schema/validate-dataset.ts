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

export interface ValidationReport {
  /** Violations that fail CI. */
  errors: string[];
  /** Known gaps that are reported but do not fail CI. */
  warnings: string[];
}

/**
 * Cross-record checks that a per-file schema cannot express: unique ids, every reference
 * resolves, files live where their ids say, and every concept's geometry is valid.
 * Mentor and disciple ids that point at people without a coach profile are warnings, not
 * errors: the legacy library already contains nine of them (see data/README.md).
 */
export function validateDataset(ds: Dataset, files?: RecordFiles): ValidationReport {
  const problems: string[] = [];
  const warnings: string[] = [];

  for (const [kind, ids] of [
    ['scheme', ds.schemes.map((s) => s.id)],
    ['concept', ds.concepts.map((c) => c.id)],
    ['coach', ds.coaches.map((c) => c.id)],
    ['lineage', ds.lineages.map((l) => l.id)],
    ['term', ds.glossary.map((t) => t.id)],
  ] as const) {
    for (const id of duplicates([...ids])) problems.push(`Duplicate ${kind} id "${id}"`);
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

    const tracks = tracksByConcept.get(concept.id);
    if (!tracks) {
      problems.push(`Concept "${concept.id}" has no tracks record`);
      continue;
    }
    for (const problem of validatePlay(asPlay(concept, tracks))) problems.push(`Concept "${concept.id}": ${problem}`);
  }

  for (const [schemeId, orders] of ordersByScheme) {
    const sorted = [...orders].sort((a, b) => a - b);
    if (sorted.some((order, i) => order !== i + 1)) problems.push(`Scheme "${schemeId}" concept order must run 1..${orders.length}, found ${sorted.join(',')}`);
  }

  for (const tracks of ds.tracks) {
    if (!conceptIds.has(tracks.conceptId)) problems.push(`Tracks record references unknown concept "${tracks.conceptId}"`);
  }

  for (const coach of ds.coaches) {
    if (coach.mentorId && !coachIds.has(coach.mentorId)) warnings.push(`Coach "${coach.id}" mentor "${coach.mentorId}" has no coach record`);
    for (const disciple of coach.disciples ?? []) {
      if (!coachIds.has(disciple)) warnings.push(`Coach "${coach.id}" disciple "${disciple}" has no coach record`);
    }
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
