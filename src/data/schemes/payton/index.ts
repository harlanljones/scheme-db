import type { Play, SchemeFamily } from '../../../engine/types';
import { paytonSlantFlatRhythm } from './slant-flat-rhythm';
import { paytonFastScreenConvoy } from './fast-screen-convoy';
import { paytonTunnelShovelPackage } from './tunnel-shovel-package';
import { paytonJetSweepPaPost } from './jet-sweep-pa-post';

export const PAYTON_QUICK_GAME_PLAYS: Play[] = [
  paytonSlantFlatRhythm,
  paytonFastScreenConvoy,
  paytonTunnelShovelPackage,
  paytonJetSweepPaPost,
];

export const PAYTON_QUICK_GAME_FAMILY: SchemeFamily = {
  id: 'payton-quick-game-screens',
  name: "Sean Payton's Quick Game & Screen Package",
  coach: 'Sean Payton',
  coachId: 'sean-payton',
  team: 'Denver Broncos',
  category: 'offense',
  treeBranch: 'reid-west-coast',
  description:
    "A rhythm-first quick game built to beat man-match leverage and punish over-aggressive fronts before pressure can develop. Payton layers slant-flat rhythm throws, convoy fast screens, and interior shovel tunnels beneath jet-sweep play action — every call attacks the defender who triggers first, and every screen looks like protection until the geometry springs.",
  plays: PAYTON_QUICK_GAME_PLAYS,
};
