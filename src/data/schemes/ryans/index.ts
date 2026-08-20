import type { Play, SchemeFamily } from '../../../engine/types';
import { ryansWide9UnderTackleWrap } from './wide9-under-tackle-wrap';
import { ryansCover2PalmsRead } from './cover2-palms-read';
import { ryansCover1HoleMug } from './cover1-hole-mug';
import { ryansOverloadEdgeFire } from './overload-edge-fire';

export const RYANS_ATTACK_PLAYS: Play[] = [
  ryansWide9UnderTackleWrap,
  ryansCover2PalmsRead,
  ryansCover1HoleMug,
  ryansOverloadEdgeFire,
];

export const RYANS_ATTACK_FAMILY: SchemeFamily = {
  id: 'ryans-wide9-attack',
  name: "DeMeco Ryans' Wide-9 Attack & Match Coverage",
  coach: 'DeMeco Ryans',
  coachId: 'demeco-ryans',
  team: 'Houston Texans',
  category: 'defense',
  treeBranch: 'carroll-saleh-wide9',
  description:
    'An aggressive, downhill defensive system engineered around pure physical dominance and geometric leverage. Features extreme Wide-9 defensive end alignments and Tackle-Wrap stunt games that crush pass protections with 4 rushers, backed by split-field Cover 2 Palms (2-Read) cloud traps, Cover 1 Low-Hole mug looks, and field-overload 5-man fire zones.',
  plays: RYANS_ATTACK_PLAYS,
};
