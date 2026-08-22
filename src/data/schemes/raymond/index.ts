import type { Play, SchemeFamily } from '../../../engine/types';
import { buckSweepGuardPull } from './buck-sweep-guard-pull';
import { wagglePassFlood } from './waggle-pass-off-sweep-fake';
import { counterCrisscross } from './counter-crisscross';
import { wingbackTrapGut } from './wingback-trap-gut';

export const DELAWARE_WING_T_PLAYS: Play[] = [
  buckSweepGuardPull,
  wagglePassFlood,
  counterCrisscross,
  wingbackTrapGut,
];

export const DELAWARE_WING_T_FAMILY: SchemeFamily = {
  id: 'delaware-wing-t',
  name: "Tubby Raymond's Delaware Wing-T",
  coach: 'Harold "Tubby" Raymond',
  coachId: 'tubby-raymond',
  team: 'Delaware (1966-2001)',
  category: 'offense',
  treeBranch: 'delaware-wing-t',
  era: 'past-college',
  description:
    'The Delaware Wing-T is a series-based system where every play looks identical for the first two steps. Guard-pull Buck Sweep forces the perimeter to defend numbers it does not have, and Waggle, Counter Crisscross, and the Wingback Trap all feed off that single picture. Tubby Raymond ran this offense at Delaware for thirty-five years, winning three national championships.',
  plays: DELAWARE_WING_T_PLAYS,
};
