import type { Play, SchemeFamily } from '../../../engine/types';
import { stack335SlantExchange } from './stack335-slant-exchange';
import { stack335DoubleEdgeStorm } from './stack335-double-edge-storm';
import { stack335CrossDogFireZone } from './stack335-cross-dog-fire-zone';
import { stack335ZeroEmpty } from './stack335-zero-empty';

export const RLONG_335_STACK_PLAYS: Play[] = [
  stack335SlantExchange,
  stack335DoubleEdgeStorm,
  stack335CrossDogFireZone,
  stack335ZeroEmpty,
];

export const RLONG_335_STACK_FAMILY: SchemeFamily = {
  id: 'rlong-335-stack',
  name: "Rocky Long's 3-3-5 Stack",
  coach: 'Rocky Long',
  coachId: 'rocky-long',
  team: 'San Diego State (2011-19) / New Mexico',
  category: 'defense',
  treeBranch: 'college-defensive-fronts',
  era: 'current-college',
  description:
    'Three down linemen with all three linebackers stacked directly behind them at identical depth, so no offense can read gap responsibility pre-snap. Five defensive backs play every down against any formation. The call is pressure-by-committee: slant-exchange games move all six box defenders one gap at a time, edge storms fire from both C-gaps, safeties and corners cross-dog through vacated lanes, and empty sets meet an all-out zero with straight man coverage behind.',
  plays: RLONG_335_STACK_PLAYS,
};
