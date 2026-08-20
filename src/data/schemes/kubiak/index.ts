import type { Play, SchemeFamily } from '../../../engine/types';
import { splitZoneSlice } from './split-zone-slice';
import { paDaggerShot } from './pa-dagger-shot';
import { bootThrowbackLeak } from './boot-throwback-leak';
import { orbitMotionToss } from './orbit-motion-toss';

export const KUBIAK_SPLIT_ZONE_PLAYS: Play[] = [
  splitZoneSlice,
  paDaggerShot,
  bootThrowbackLeak,
  orbitMotionToss,
];

export const KUBIAK_SPLIT_ZONE_FAMILY: SchemeFamily = {
  id: 'kubiak-split-zone',
  name: "Klint Kubiak's Motion & Split-Zone / Leak Family",
  coach: 'Klint Kubiak',
  coachId: 'klint-kubiak',
  team: 'Las Vegas Raiders',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  description:
    'A masterclass in modern Shanahan-Kubiak sequencing. By marrying heavy 12-personnel condensed formations, pre-snap glide/orbit motion, and under-center split-zone run mechanics, Kubiak presents an identical visual picture before unleashing devastating intermediate Dagger shots, explosive backside Y-Leaks, and rapid perimeter tosses.',
  plays: KUBIAK_SPLIT_ZONE_PLAYS,
};
