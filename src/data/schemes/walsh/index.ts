import type { Play, SchemeFamily } from '../../../engine/types';
import { slantFlatCombo } from './slant-flat-combo';
import { sprintRightOption } from './sprint-right-option';
import { curlFlatFlood } from './curl-flat-flood';
import { playActionDeepCross } from './play-action-deep-cross';

export const WALSH_CLASSIC_WCO_PLAYS: Play[] = [
  slantFlatCombo,
  sprintRightOption,
  curlFlatFlood,
  playActionDeepCross,
];

export const WALSH_CLASSIC_WCO_FAMILY: SchemeFamily = {
  id: 'walsh-classic-wco',
  name: "Bill Walsh's Classic West Coast Offense",
  coach: 'Bill Walsh',
  coachId: 'bill-walsh',
  team: 'San Francisco 49ers (1979-88)',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  era: 'past-nfl',
  description:
    'The timing-and-leverage passing system that replaced the vertical bomb with surgical rhythm throws designed to run like the sweep. Every call answers a leverage question in under two seconds, and every answer sets up the next question through sequencing.',
  plays: WALSH_CLASSIC_WCO_PLAYS,
};
