import type { Play, SchemeFamily } from '../../../engine/types';
import { twoManRedZoneCompressedTwins } from './twoman-red-zone-compressed-twins';
import { twoManFadeBeaterDemo } from './twoman-fade-beater-demo';
import { twoManEdgeBlitz } from './twoman-edge-blitz';
import { twoManGoalLineDoubleRobber } from './twoman-goal-line-double-robber';

export const COVER2_MAN_UNDER_PLAYS: Play[] = [
  twoManRedZoneCompressedTwins,
  twoManFadeBeaterDemo,
  twoManEdgeBlitz,
  twoManGoalLineDoubleRobber,
];

export const COVER2_MAN_UNDER_FAMILY: SchemeFamily = {
  id: 'cover2-man-under',
  name: "Marvin Lewis' Cover 2 Man-Under",
  coach: 'Marvin Lewis',
  coachId: 'marvin-lewis',
  team: 'Baltimore Ravens DC (1996-2001)',
  category: 'defense',
  treeBranch: 'two-deep-shell',
  era: 'past-nfl',
  description:
    "The red-zone answer of Lewis' Baltimore defenses: two safeties splitting the deep halves at full depth while five defenders play straight man underneath. Press-trail corner leverage turns every compressed release and every fade attempt into a contested footrace, with the deep halves standing as pure insurance behind the trails. When the structure needs teeth, a walked safety converts it into max pressure with one man swallowing the entire deep zone.",
  plays: COVER2_MAN_UNDER_PLAYS,
};
