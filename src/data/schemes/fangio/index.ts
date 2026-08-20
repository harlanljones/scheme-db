import type { Play, SchemeFamily } from '../../../engine/types';
import { fangioCover6QuarterQuarterHalf } from './cover6-quarter-quarter-half';
import { fangioPennyMatchQuarters } from './penny-match-quarters';
import { fangioTiteCreeperDrop8 } from './tite-creeper-drop8';
import { fangioCover8BoundaryTrap } from './cover8-boundary-trap';

export const FANGIO_TWO_HIGH_PLAYS: Play[] = [
  fangioCover6QuarterQuarterHalf,
  fangioPennyMatchQuarters,
  fangioTiteCreeperDrop8,
  fangioCover8BoundaryTrap,
];

export const FANGIO_TWO_HIGH_FAMILY: SchemeFamily = {
  id: 'fangio-two-high-shell',
  name: "Vic Fangio's Two-High Shell & Quarters Matching",
  coach: 'Vic Fangio',
  coachId: 'vic-fangio',
  team: 'Philadelphia Eagles / Denver Broncos',
  category: 'defense',
  treeBranch: 'fangio-two-high',
  description:
    'The defensive philosophy that reshaped modern NFL game-planning. Built on a static, impenetrable two-high safety shell pre-snap that disguises split-field Cover 6 (Quarter-Quarter-Half), Palms Match Quarters (2-Read), Drop-8 simulated creeper pressures, and lethal boundary corner traps. Paired with light-box 5-1-5 Penny fronts that suffocate explosive passing concepts while matching underneath crossing routes.',
  plays: FANGIO_TWO_HIGH_PLAYS,
};
