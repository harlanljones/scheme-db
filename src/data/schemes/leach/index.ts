import type { Play, SchemeFamily } from '../../../engine/types';
import { meshConcept } from './mesh-concept';
import { yCrossConcept } from './y-cross';
import { stickNakedConstraint } from './stick-naked-constraint';
import { shallowDistributionDrive } from './shallow-distribution-drive';

export const AIR_RAID_PLAYS: Play[] = [
  meshConcept,
  yCrossConcept,
  stickNakedConstraint,
  shallowDistributionDrive,
];

export const AIR_RAID_FAMILY: SchemeFamily = {
  id: 'air-raid',
  name: "Mike Leach's Air Raid Family",
  coach: 'Mike Leach',
  coachId: 'mike-leach',
  team: 'Texas Tech / Washington State / Mississippi State',
  category: 'offense',
  treeBranch: 'air-raid',
  era: 'current-college',
  description:
    'The purest expression of spread passing: a handful of simple, repeatable concepts thrown from gun at high volume. Every play answers one leverage question, and the quarterback is taught to throw the open receiver rather than force landmarks.',
  plays: AIR_RAID_PLAYS,
};
