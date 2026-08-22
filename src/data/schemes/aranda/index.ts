import type { Play, SchemeFamily } from '../../../engine/types';
import { titeBaseZoneRead } from './tite-base-zone-read';
import { titeSimPressure } from './tite-sim-pressure';
import { titeQuartersApex } from './tite-quarters-apex';
import { titeBearCondensed } from './tite-bear-condensed';

export const ARANDA_TITE_PESO_PLAYS: Play[] = [
  titeBaseZoneRead,
  titeSimPressure,
  titeQuartersApex,
  titeBearCondensed,
];

export const ARANDA_TITE_PESO_FAMILY: SchemeFamily = {
  id: 'aranda-tite-peso',
  name: "Dave Aranda's Tite Front & Peso Package",
  coach: 'Dave Aranda',
  coachId: 'dave-aranda',
  team: 'LSU DC (2016-19) / Baylor HC',
  category: 'defense',
  treeBranch: 'college-defensive-fronts',
  era: 'current-college',
  description:
    'A 4i-0-4i box that eliminates both B-gaps before the snap, forcing spread runs to bounce into walked-down hybrid defenders. Peso nickel/dime personnel blur the line between back-end and box — apex linebackers split the #2-receiver-to-tackle lines, split-field quarters pattern-matches every slot, and three-man simulated pressures occupy the quarterback’s escape lanes with defenders who were never rushing at all.',
  plays: ARANDA_TITE_PESO_PLAYS,
};
