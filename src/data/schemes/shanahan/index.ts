import type { Play, SchemeFamily } from '../../../engine/types';
import { outsideZone } from './outside-zone';
import { playActionOver } from './play-action-over';
import { nakedBootleg } from './naked-bootleg';
import { jetMotionOz } from './jet-motion-oz';

export const SHANAHAN_WIDE_ZONE_PLAYS: Play[] = [
  outsideZone,
  playActionOver,
  nakedBootleg,
  jetMotionOz,
];

export const SHANAHAN_WIDE_ZONE_FAMILY: SchemeFamily = {
  id: 'shanahan-wide-zone',
  name: "Kyle Shanahan's Wide Zone Family",
  coach: 'Kyle Shanahan',
  coachId: 'kyle-shanahan',
  team: 'San Francisco 49ers',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  description:
    'The premier modern NFL offensive system built on horizontal stretch sequencing. The base Outside Zone run and its three constraint counters (Play-Action Deep Over, Naked Bootleg, and Jet Motion) present an identical visual picture to the defense for the first ~1.2 seconds, forcing defenders into impossible run-pass conflicts.',
  plays: SHANAHAN_WIDE_ZONE_PLAYS,
};

