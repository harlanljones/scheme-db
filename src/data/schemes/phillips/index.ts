import type { Play, SchemeFamily } from '../../../engine/types';
import { b34BaseTwoGapFits } from './b34-base-two-gap-fits';
import { b34DualEdgeInteriorAnchor } from './b34-dual-edge-interior-anchor';
import { b34StackSlantShift } from './b34-stack-slant-shift';
import { b34WildcatWalkUpEdge } from './b34-wildcat-walk-up-edge';

export const PHILLIPS_TWO_GAP_34_PLAYS: Play[] = [
  b34BaseTwoGapFits,
  b34DualEdgeInteriorAnchor,
  b34StackSlantShift,
  b34WildcatWalkUpEdge,
];

export const PHILLIPS_TWO_GAP_34_FAMILY: SchemeFamily = {
  id: 'phillips-two-gap-34',
  name: "Bum Phillips' Two-Gap 3-4",
  coach: 'Bum Phillips',
  coachId: 'bum-phillips',
  team: 'Houston Oilers (1975-80)',
  category: 'defense',
  treeBranch: 'phillips-two-gap',
  era: 'past-nfl',
  description:
    "The original two-gap 3-4 that Bum Phillips brought to the Houston Oilers: a zero-tech nose and twin 5-tech ends who ENGAGE and hold two gaps apiece rather than penetrate, occupying all five blockers so both inside linebackers can flow untouched over the tops of engaged bodies. The stand-up outside linebacker duo serves as the front's rush weapons — walking wide on passing downs, stemming across tackles' faces, and attacking rims the anchored interior keeps bare.",
  plays: PHILLIPS_TWO_GAP_34_PLAYS,
};
