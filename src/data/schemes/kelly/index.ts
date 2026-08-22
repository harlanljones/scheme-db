import type { Play, SchemeFamily } from '../../../engine/types';
import { kellyMeshSpacingConcept } from './mesh-spacing-concept';
import { kellySpotTempoStress } from './spot-tempo-stress';
import { kellyZoneReadRbDraw } from './zone-read-rb-draw';
import { kellyFourVertsTakeover } from './four-verts-takeover';

export const KELLY_TEMPO_SPREAD_PLAYS: Play[] = [
  kellyMeshSpacingConcept,
  kellySpotTempoStress,
  kellyZoneReadRbDraw,
  kellyFourVertsTakeover,
];

export const KELLY_TEMPO_SPREAD_FAMILY: SchemeFamily = {
  id: 'kelly-tempo-spread',
  name: "Chip Kelly's Tempo Spread & Air Raid System",
  coach: 'Chip Kelly',
  coachId: 'chip-kelly',
  team: 'Las Vegas Raiders',
  category: 'offense',
  treeBranch: 'reid-west-coast',
  description:
    "A snap-rate offense built to make defensive communication the first conflict on every play: Kelly snaps within seconds of the previous whistle, denying substitutions and rotations before the ball is even live. The system layers classic Air Raid spacing — Mesh rubs and Spot stress — over a spread-option run game whose zone-read/draw geometry breaks box math, then punishes two-high shells with four-verts takeoffs off a simple pre-snap MOFO read.",
  plays: KELLY_TEMPO_SPREAD_PLAYS,
};
