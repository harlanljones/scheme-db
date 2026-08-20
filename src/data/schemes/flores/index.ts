import type { Play, SchemeFamily } from '../../../engine/types';
import { floresCover0AllOutHouse } from './cover0-all-out-house';
import { floresDrop8PsychoLurk } from './drop8-psycho-lurk';
import { floresCrossDogFireHot } from './cross-dog-fire-hot';
import { floresBracketDoublesStar } from './bracket-doubles-star';

export const FLORES_PSYCHO_PLAYS: Play[] = [
  floresCover0AllOutHouse,
  floresDrop8PsychoLurk,
  floresCrossDogFireHot,
  floresBracketDoublesStar,
];

export const FLORES_PSYCHO_FAMILY: SchemeFamily = {
  id: 'belichick-flores-psycho',
  name: "Brian Flores' Psycho Front & Cover 0 Pressure",
  coach: 'Brian Flores',
  coachId: 'brian-flores',
  team: 'Minnesota Vikings / New England Patriots',
  category: 'defense',
  treeBranch: 'belichick-flores',
  description:
    'An extreme binary pressure system rooted in Bill Belichick chameleon football and weaponized by Brian Flores into the NFL’s most terrifying pre-snap presentation. By crowding the line of scrimmage with 6 to 7 mugged rushers in the Psycho Front, the defense creates identical pre-snap chaos before either sending an unblockable 7-man Cover 0 house blitz, bluffing and dropping 8 into muddy coverage traps, executing interior A-gap cross-dog twists, or bracketing the offense’s #1 star wide receiver.',
  plays: FLORES_PSYCHO_PLAYS,
};
