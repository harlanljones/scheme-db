import type { SchemeFamily, Play } from '../../../engine/types';
import { spagnuoloCorndogCornerBlitz } from './corndog-corner-blitz';
import { spagnuoloCrossCreeperDrop } from './cross-creeper-drop';
import { spagnuoloCover0MaxHeat } from './cover0-max-heat';
import { spagnuoloSplitSafetyInvert2 } from './split-safety-invert2';

export const SPAGNUOLO_BLITZ_PLAYS: Play[] = [
  spagnuoloCorndogCornerBlitz,
  spagnuoloCrossCreeperDrop,
  spagnuoloCover0MaxHeat,
  spagnuoloSplitSafetyInvert2,
];

export const SPAGNUOLO_BLITZ_FAMILY: SchemeFamily = {
  id: 'spagnuolo-exotic-blitz',
  name: 'Steve Spagnuolo Exotic Blitz & Sim Pressures',
  coach: 'Steve Spagnuolo',
  coachId: 'steve-spagnuolo',
  team: 'Kansas City Chiefs',
  category: 'defense',
  treeBranch: 'reid-west-coast',
  description:
    'Steve Spagnuolo’s championship-winning defensive scheme: aggressive situational blitzing, boundary corner overloads, 4-man creeper simulated pressures dropping interior linemen, 7-man Cover 0 house heat, and disguised inverted split-safety coverages that break standard quarterback protection reads.',
  plays: SPAGNUOLO_BLITZ_PLAYS,
};

export {
  spagnuoloCorndogCornerBlitz,
  spagnuoloCrossCreeperDrop,
  spagnuoloCover0MaxHeat,
  spagnuoloSplitSafetyInvert2,
};
