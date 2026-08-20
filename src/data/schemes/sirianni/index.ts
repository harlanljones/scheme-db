import type { Play, SchemeFamily } from '../../../engine/types';
import { sirianniPowerDuoInside } from './power-duo-inside';
import { sirianniRpoGlanceIso } from './rpo-glance-iso';
import { sirianniSlotFadeOut } from './slot-fade-out';
import { sirianniQbSneakPush } from './qb-sneak-push';

export const SIRIANNI_POWER_PLAYS: Play[] = [
  sirianniPowerDuoInside,
  sirianniRpoGlanceIso,
  sirianniSlotFadeOut,
  sirianniQbSneakPush,
];

export const SIRIANNI_POWER_FAMILY: SchemeFamily = {
  id: 'sirianni-power-rpo',
  name: "Nick Sirianni's Power RPO & Brotherly Shove System",
  coach: 'Nick Sirianni',
  coachId: 'nick-sirianni',
  team: 'Philadelphia Eagles',
  category: 'offense',
  treeBranch: 'reid-west-coast',
  description:
    'A physical, identity-driven offense built on gap power football paired with perimeter RPO access. Nick Sirianni\'s Eagles combine power duo runs that rely on vertical double-teams, RPO glance and slant reads that punish aggressive linebackers, boundary isolation for elite wide receivers, and the most famous short-yardage play in the NFL — the Brotherly Shove quarterback sneak.',
  plays: SIRIANNI_POWER_PLAYS,
};
