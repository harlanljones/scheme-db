import type { Play, SchemeFamily } from '../../../engine/types';
import { midlineTripleOption } from './midline-triple-option';
import { rocketTossPitchSeries } from './rocket-toss-pitch-series';
import { insideVeerTriple } from './inside-veer-triple';
import { midlinePlayActionShot } from './midline-play-action-shot';

export const FLEXBONE_TRIPLE_OPTION_PLAYS: Play[] = [
  midlineTripleOption,
  rocketTossPitchSeries,
  insideVeerTriple,
  midlinePlayActionShot,
];

export const FLEXBONE_TRIPLE_OPTION_FAMILY: SchemeFamily = {
  id: 'flexbone-triple-option',
  name: "Paul Johnson's Flexbone Triple Option",
  coach: 'Paul Johnson',
  coachId: 'paul-johnson',
  team: 'Georgia Tech / Navy',
  category: 'offense',
  treeBranch: 'option-spread',
  era: 'current-college',
  description:
    'The modern flexbone: two slotbacks in pitch relationships, a fullback on the midline, and a quarterback who reads one unblocked defender per snap. Every call is a math problem — dive, keep, or pitch — and the defense must be right three times to stop it once. Paul Johnson\'s Georgia Tech and Navy teams turned this into college football\'s most efficient rushing attack.',
  plays: FLEXBONE_TRIPLE_OPTION_PLAYS,
};
