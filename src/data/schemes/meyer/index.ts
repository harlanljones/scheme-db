import type { Play, SchemeFamily } from '../../../engine/types';
import { insideZoneReadGive } from './inside-zone-read-give';
import { invertedVeerPowerRead } from './inverted-veer-power-read';
import { snagTriangleSpacing } from './snag-triangle-spacing';
import { speedOptionReverseConstraint } from './speed-option-reverse-constraint';

export const MEYER_SPREAD_OPTION_PLAYS: Play[] = [
  insideZoneReadGive,
  invertedVeerPowerRead,
  snagTriangleSpacing,
  speedOptionReverseConstraint,
];

export const MEYER_SPREAD_OPTION_FAMILY: SchemeFamily = {
  id: 'meyer-spread-option',
  name: "Urban Meyer's Spread Option",
  coach: 'Urban Meyer',
  coachId: 'urban-meyer',
  team: 'Florida / Ohio State (2001-18)',
  category: 'offense',
  treeBranch: 'option-spread',
  era: 'past-college',
  description:
    'The Meyer spread option pairs zone-read runs and inverted veer with snag-triangle passing, all built on one principle: make the defense defend the quarterback as a runner on every snap. Perimeter jet motion and reverse constraints stretch the field horizontally while the read game attacks it vertically. Two national championships were built on this foundation.',
  plays: MEYER_SPREAD_OPTION_PLAYS,
};
