import type { Play, SchemeFamily } from '../../../engine/types';
import { bearGoalLineHeavy } from './bear-goal-line-heavy';
import { bearDoubleAMug } from './bear-double-a-mug';
import { bearSlantStrong } from './bear-slant-strong';
import { bearTo46StemDisguise } from './bear-to-46-stem-disguise';

export const BELICHICK_OKIE_BEAR_PLAYS: Play[] = [
  bearGoalLineHeavy,
  bearDoubleAMug,
  bearSlantStrong,
  bearTo46StemDisguise,
];

export const BELICHICK_OKIE_BEAR_FAMILY: SchemeFamily = {
  id: 'belichick-okie-bear',
  name: "Bill Belichick's Okie/Bear Package",
  coach: 'Bill Belichick',
  coachId: 'bill-belichick',
  team: 'New England Patriots (2003-19)',
  category: 'defense',
  treeBranch: 'belichick-flores',
  era: 'modern-nfl',
  description:
    "The compressed odd-front situational package Belichick deployed to bury Peyton Manning-era Colts offenses. A zero-tech nose flanked by double 4i tackles and stacked 5-tech ends gives New England five interior bodies against five interior blockers, while both inside linebackers mug over the A-gaps and the safeties crowd the box. Zero-nose geometry plus double-A mug threats stress every hot answer, bridging old goal-line fronts to modern mug-pressure packages.",
  plays: BELICHICK_OKIE_BEAR_PLAYS,
};
