import type { Play, SchemeFamily } from '../../../engine/types';
import { t2BaseVs2x2 } from './t2-base-vs-2x2';
import { t2SlbEdgeBlitz } from './t2-slb-edge-blitz';
import { t2RollCover3Trips } from './t2-roll-cover3-trips';
import { t2CloudBoundary } from './t2-cloud-boundary';

export const TAMPA_TWO_PLAYS: Play[] = [
  t2BaseVs2x2,
  t2SlbEdgeBlitz,
  t2RollCover3Trips,
  t2CloudBoundary,
];

export const TAMPA_TWO_FAMILY: SchemeFamily = {
  id: 'tampa-2',
  name: "Tony Dungy's Tampa 2",
  coach: 'Tony Dungy',
  coachId: 'tony-dungy',
  team: 'Tampa Bay Buccaneers (1996-2001)',
  category: 'defense',
  treeBranch: 'two-deep-shell',
  era: 'past-nfl',
  description:
    'The defining middle-of-field-closed Cover 2 of its era: a penetrating four-man rush behind corners who squat in the deep halves with underneath-first eyes, and safeties splitting the field. The signature wrinkle is the Mike linebacker converting his hook-curl drop into a full sprint to the deep-middle hole, erasing the seams that normally kill Cover 2. Quick perimeter answers are contested instantly, forcing quarterbacks to hold for seam throws that sail straight into the sprinting Mike.',
  plays: TAMPA_TWO_PLAYS,
};
