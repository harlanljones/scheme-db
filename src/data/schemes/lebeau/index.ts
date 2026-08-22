import type { Play, SchemeFamily } from '../../../engine/types';
import { lebeauTripleInsideFire } from './triple-inside-fire';
import { lebeauSafetyRotateFire } from './safety-rotate-fire';
import { lebeauNoseDropNasco } from './nose-drop-nasco';
import { lebeauSafetyBlitzSmoke } from './safety-blitz-smoke';

export const LEBEAU_FIRE_ZONE_PLAYS: Play[] = [
  lebeauTripleInsideFire,
  lebeauSafetyRotateFire,
  lebeauNoseDropNasco,
  lebeauSafetyBlitzSmoke,
];

export const LEBEAU_FIRE_ZONE_FAMILY: SchemeFamily = {
  id: 'lebeau-fire-zone',
  name: "Dick LeBeau's Zone Blitz Fire Zone Family",
  coach: 'Dick LeBeau',
  coachId: 'dick-lebeau',
  team: 'Pittsburgh Steelers (1995-2014)',
  category: 'defense',
  treeBranch: 'lebeau-zone-blitz',
  era: 'past-nfl',
  description:
    'The definitive zone-blitz system: true 5-man pressures where a defensive lineman or safety trades his rush lane for a rat/hook zone while replacement blitzers attack vacated gaps. Every call pairs 3-deep/3-under fire zone coverage behind disguised rotations from Cover 2 and single-high shells, forcing hot answers directly into dropped rushers.',
  plays: LEBEAU_FIRE_ZONE_PLAYS,
};
