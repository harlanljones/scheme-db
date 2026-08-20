import type { Play, SchemeFamily } from '../../../engine/types';
import { macdonaldDoubleMugBuzz } from './double-mug-buzz';
import { macdonaldCreeperOverload } from './creeper-overload';
import { macdonaldSplitFieldTrap } from './split-field-trap';
import { macdonaldAmoebaCover0Peel } from './amoeba-cover0-peel';

export const MACDONALD_HYBRID_PLAYS: Play[] = [
  macdonaldDoubleMugBuzz,
  macdonaldCreeperOverload,
  macdonaldSplitFieldTrap,
  macdonaldAmoebaCover0Peel,
];

export const MACDONALD_HYBRID_FAMILY: SchemeFamily = {
  id: 'macdonald-hybrid-disguise',
  name: "Mike Macdonald's Hybrid Disguise & Sim Pressures",
  coach: 'Mike Macdonald',
  coachId: 'mike-macdonald',
  team: 'Baltimore Ravens / Seattle Seahawks',
  category: 'defense',
  treeBranch: 'macdonald-pressure',
  description:
    'The cutting edge of NFL defensive design. Built on pre-snap ambiguity, Amoeba and Double-A mug presentations, 4-man simulated pressures (Creepers) that drop interior linemen into passing windows, post-snap safety spins into corner traps, and lethal 6-man Cover 0 peel blitzes that force quarterbacks into impossible post-snap calculations.',
  plays: MACDONALD_HYBRID_PLAYS,
};
