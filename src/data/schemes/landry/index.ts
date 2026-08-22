import type { Play, SchemeFamily } from '../../../engine/types';
import { landryWeakTacklePowerSweep } from './power-sweep-convergence';
import { landryTackleTackleTwoBack } from './tackle-tackle-two-back';
import { landryLbStrengthShiftMotion } from './lb-strength-shift-motion';
import { landryFlexLineGameRush } from './flex-line-game';

export const LANDRY_FLEX_PLAYS: Play[] = [
  landryWeakTacklePowerSweep,
  landryTackleTackleTwoBack,
  landryLbStrengthShiftMotion,
  landryFlexLineGameRush,
];

export const LANDRY_FLEX_FAMILY: SchemeFamily = {
  id: 'landry-flex',
  name: "Tom Landry's Flex Defense",
  coach: 'Tom Landry',
  coachId: 'tom-landry',
  team: 'Dallas Cowboys (1960-88)',
  category: 'defense',
  treeBranch: 'landry-dallas',
  era: 'past-nfl',
  description:
    'The original positional-defense blueprint that ran in Dallas for three decades. Both tackles align one yard off the ball in a staggered flex, trading penetration for patient gap-zone occupation: linemen hold their lanes, linebackers shift strength with motion, and a guaranteed three-defender convergence swallows every point of attack before it develops.',
  plays: LANDRY_FLEX_PLAYS,
};
