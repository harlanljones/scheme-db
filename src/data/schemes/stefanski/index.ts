import type { Play, SchemeFamily } from '../../../engine/types';
import { pinPullSweep } from './pin-pull-sweep';
import { paSeamShot } from './pa-seam-shot';
import { nakedBootSlide } from './naked-boot-slide';
import { counterGapLead } from './counter-gap-lead';

export const STEFANSKI_GAP_PLAYS: Play[] = [
  pinPullSweep,
  paSeamShot,
  nakedBootSlide,
  counterGapLead,
];

export const STEFANSKI_GAP_FAMILY: SchemeFamily = {
  id: 'stefanski-multi-te-gap',
  name: "Kevin Stefanski's Multi-TE Gap & Under-Center Play-Action Family",
  coach: 'Kevin Stefanski',
  coachId: 'kevin-stefanski',
  team: 'Atlanta Falcons',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  description:
    'Master of condensed multi-tight end structures, violent pin-and-pull gap schemes, GT counter lead concepts, and deep play-action seam/bootleg shots. Kevin Stefanski builds an overpowering offensive machine founded on angle blocking, devastating complementary under-center fakes, and high-efficiency vertical passing off run action.',
  plays: STEFANSKI_GAP_PLAYS,
};
