import type { Play, SchemeFamily } from '../../../engine/types';
import { minterAmoebaFireZone3 } from './amoeba-fire-zone3';
import { minterSlotBlitzCreeper } from './slot-blitz-creeper';
import { minterCover1RobberLurk } from './cover1-robber-lurk';
import { minterDoubleMugPeel } from './double-mug-peel';

export const MINTER_AMOEBA_PLAYS: Play[] = [
  minterAmoebaFireZone3,
  minterSlotBlitzCreeper,
  minterCover1RobberLurk,
  minterDoubleMugPeel,
];

export const MINTER_AMOEBA_FAMILY: SchemeFamily = {
  id: 'minter-amoeba-creeper',
  name: "Jesse Minter's Amoeba Front & Simulated Creepers",
  coach: 'Jesse Minter',
  coachId: 'jesse-minter',
  team: 'Baltimore Ravens / Los Angeles Chargers',
  category: 'defense',
  treeBranch: 'macdonald-pressure',
  description:
    'A masterclass in pre-snap psychological warfare and simulated pressure architectures. Jesse Minter combines standing 6-up Amoeba fronts, slot corner simulated blitzes (Creepers) dropping athletic defensive ends, disguised Cover 1 Lurk rotations that bait quarterbacks into underneath robber traps, and lethal Double-A mug Cover 0 peel blitzes that neutralize hot reads.',
  plays: MINTER_AMOEBA_PLAYS,
};
