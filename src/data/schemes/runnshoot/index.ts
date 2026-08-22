import type { Play, SchemeFamily } from '../../../engine/types';
import { switchVerticalsVsMan } from './switch-verticals-vs-man';
import { meshReadRoute } from './mesh-read-route';
import { postWheelLeverageRead } from './post-wheel-leverage-read';
import { goRouteStabAdjustment } from './go-route-stab-adjustment';

export const RUN_AND_SHOOT_PLAYS: Play[] = [
  switchVerticalsVsMan,
  meshReadRoute,
  postWheelLeverageRead,
  goRouteStabAdjustment,
];

export const RUN_AND_SHOOT_FAMILY: SchemeFamily = {
  id: 'run-and-shoot',
  name: "June Jones's Run and Shoot",
  coach: 'June Jones',
  coachId: 'june-jones',
  team: 'Houston Oilers (1989-93) / Hawaii',
  category: 'offense',
  treeBranch: 'coryell-vertical',
  era: 'past-nfl',
  description:
    'Four-wide spread passing built on read routes instead of fixed breaks. Every receiver carries a conversion rule keyed to defender leverage, so the same four calls attack man, zone, and blitz differently. The Oilers\' run-and-shoot stretched single-high shells with switch releases, mesh traffic, and perimeter wheels — the direct ancestor of modern spacing-option passing games.',
  plays: RUN_AND_SHOOT_PLAYS,
};
