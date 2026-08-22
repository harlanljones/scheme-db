import type { Play, SchemeFamily } from '../../../engine/types';
import { seamPostDoubleStroke } from './seam-post-double-stroke';
import { deepOutComeback } from './deep-out-comeback';
import { crossCountryDrag } from './cross-country-drag';
import { zSnapMoveScreen } from './z-snap-move-screen';

export const AIR_CORYELL_VERTICAL_PLAYS: Play[] = [
  seamPostDoubleStroke,
  deepOutComeback,
  crossCountryDrag,
  zSnapMoveScreen,
];

export const AIR_CORYELL_VERTICAL_FAMILY: SchemeFamily = {
  id: 'coryell-vertical',
  name: "Don Coryell's Air Coryell Vertical Family",
  coach: 'Don Coryell',
  coachId: 'don-coryell',
  team: 'San Diego Chargers (1978-86)',
  category: 'offense',
  treeBranch: 'coryell-vertical',
  era: 'past-nfl',
  description:
    'The original vertical passing tree. Coryell stretched defenses with five-step drops, seam-post strokes, and layered deep crossers, forcing single-high safeties to defend the whole field while tight ends occupied the middle hole. Every modern timing-based passing game descends from these four calls.',
  plays: AIR_CORYELL_VERTICAL_PLAYS,
};
