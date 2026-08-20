import type { SchemeFamily, Play } from '../../../engine/types';
import { bowlesDualAGapCrossBlitz } from './dual-a-gap-cross-blitz';
import { bowlesOverloadBoundaryFire } from './overload-boundary-fire';
import { bowlesDrop8Tampa2Lurk } from './drop8-tampa2-lurk';
import { bowlesPeelZoneSimPressure } from './peel-zone-sim-pressure';

export const BOWLES_CREEPER_PLAYS: Play[] = [
  bowlesDualAGapCrossBlitz,
  bowlesOverloadBoundaryFire,
  bowlesDrop8Tampa2Lurk,
  bowlesPeelZoneSimPressure,
];

export const BOWLES_CREEPER_FAMILY: SchemeFamily = {
  id: 'bowles-creeper-blitz',
  name: 'Todd Bowles Creeper Blitz & Psycho Front',
  coach: 'Todd Bowles',
  coachId: 'todd-bowles',
  team: 'Tampa Bay Buccaneers',
  category: 'defense',
  treeBranch: 'belichick-flores',
  description:
    'Todd Bowles’ fearsome defensive scheme: Dual A-gap cross-dog interior stunts, boundary corner overloads attacking pass protection slides, Drop-8 Tampa 2 traps with the middle linebacker running the deep pole, and 4-man simulated pressures with edge peel rules.',
  plays: BOWLES_CREEPER_PLAYS,
};

export {
  bowlesDualAGapCrossBlitz,
  bowlesOverloadBoundaryFire,
  bowlesDrop8Tampa2Lurk,
  bowlesPeelZoneSimPressure,
};
