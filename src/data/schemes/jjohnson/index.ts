import type { Play, SchemeFamily } from '../../../engine/types';
import { jjManFreeWillDog } from './man-free-will-dog';
import { jjMiamiChaseRulePursuit } from './miami-chase-rule-pursuit';
import { jjPenetrationSlantLoop } from './penetration-slant-loop';
import { jjGoalLineHaleyEdgeRush } from './goal-line-haley-edge-rush';

export const JJ_SPEED_43_PLAYS: Play[] = [
  jjPenetrationSlantLoop,
  jjManFreeWillDog,
  jjMiamiChaseRulePursuit,
  jjGoalLineHaleyEdgeRush,
];

export const JJ_SPEED_43_FAMILY: SchemeFamily = {
  id: 'jj-speed-43',
  name: "Jimmy Johnson's Speed 4-3",
  coach: 'Jimmy Johnson',
  coachId: 'jimmy-johnson',
  team: 'Dallas Cowboys (1989-93) / Miami Hurricanes',
  category: 'defense',
  treeBranch: 'landry-dallas',
  era: 'past-nfl',
  description:
    'Undersized hyper-fast linemen who fire upfield at the snap instead of reading blocks, trading two-gap size for one-gap penetration chaos that wrecks blocking rules before they form. Behind the slanting front sits man-free or single-high coverage with pressed corners on islands, so every pressured throw has nowhere soft to land. The scheme finishes plays with the Miami chase rule: relentless, assigned pursuit angles that swallow ballcarriers from sideline to sideline.',
  plays: JJ_SPEED_43_PLAYS,
};
