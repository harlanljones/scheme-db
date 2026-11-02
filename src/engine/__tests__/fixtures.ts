import { loadDataset } from '../../schema/load';
import type { Play } from '../types';

const { dataset, problems } = loadDataset();
if (problems.length > 0) throw new Error(`data/ has problems; run bun run data:validate.\n${problems.slice(0, 5).join('\n')}`);

/** A play for engine tests, built from a concept and its tracks in `data/` the way the engine expects it. */
export function playById(id: string): Play {
  const concept = dataset.concepts.find((c) => c.id === id);
  const tracks = dataset.tracks.find((t) => t.conceptId === id);
  if (!concept || !tracks) throw new Error(`No play "${id}" in data/`);
  const scheme = dataset.schemes.find((s) => s.id === concept.schemeId)!;
  return {
    id: concept.id,
    name: concept.name,
    coach: scheme.coachId,
    family: scheme.id,
    personnel: concept.personnel,
    formation: concept.formation,
    situation: concept.situation,
    coverage: concept.coverage,
    frontName: concept.frontName,
    duration: tracks.duration,
    offense: tracks.offense,
    defense: tracks.defense,
    beats: concept.beats,
    summary: concept.summary,
    sequence: concept.relations,
  };
}

/** The plays of one scheme in sheet order. */
export function playsOfScheme(schemeId: string): Play[] {
  return dataset.concepts
    .filter((c) => c.schemeId === schemeId)
    .sort((a, b) => a.order - b.order)
    .map((c) => playById(c.id));
}
