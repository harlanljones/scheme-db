import type { Play, SchemeFamily } from '../../../engine/types';
import { oconnellWideZoneStretchBase } from './wide-zone-stretch-base';
import { oconnellBootFloodRollout } from './boot-flood-rollout';
import { oconnellPaDaggerShot } from './pa-dagger-shot';
import { oconnellDuoPaCrosser } from './duo-pa-crosser';

export const OCONNELL_BOOT_DAGGER_PLAYS: Play[] = [
  oconnellWideZoneStretchBase,
  oconnellBootFloodRollout,
  oconnellPaDaggerShot,
  oconnellDuoPaCrosser,
];

export const OCONNELL_BOOT_DAGGER_FAMILY: SchemeFamily = {
  id: 'oconnell-boot-dagger',
  name: "Kevin O'Connell's Boot & Dagger Play-Action System",
  coach: "Kevin O'Connell",
  coachId: 'kevin-oconnell',
  team: 'Minnesota Vikings',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  description:
    "A play-action ecosystem where every call wears the same uniform: a condensed gun formation that produces an identical wide-zone reach wash and mesh point for the first full second of every snap. The stretch base establishes the picture, the boot flood punishes flow-away defenders, the Dagger seam-curl attacks the dropping Mike, and the duo PA crosser exploits downhill triggers — four answers off one visual lie.",
  plays: OCONNELL_BOOT_DAGGER_PLAYS,
};
