import type { Play, SchemeFamily } from '../../../engine/types';
import { shulaTiteBGapPinch } from './tite-b-gap-pinch';
import { shulaPennyBracketBunch } from './penny-bracket-bunch';
import { shulaCover8FieldQuarter } from './cover8-field-quarter';
import { shulaBoundaryCreoperDrop7 } from './boundary-creeper-drop7';

export const SHULA_MATCH_PLAYS: Play[] = [
  shulaTiteBGapPinch,
  shulaPennyBracketBunch,
  shulaCover8FieldQuarter,
  shulaBoundaryCreoperDrop7,
];

export const SHULA_MATCH_FAMILY: SchemeFamily = {
  id: 'shula-match-quarters',
  name: "Chris Shula's Match Quarters & Penny Front Shell",
  coach: 'Chris Shula',
  coachId: 'chris-shula',
  team: 'Los Angeles Rams',
  category: 'defense',
  treeBranch: 'fangio-two-high',
  description:
    'A Fangio-lineage two-high quarters system refined for the modern spread era. Chris Shula employs light Tite (4i-0-4i) and Penny (5-1-5) fronts to maintain interior gap integrity with fewer bodies in the box, while presenting a perpetual two-safety shell that disguises Cover 6, Cover 8, and split-field quarters match calls. Creeper blitzes — defenders who simulate pressure but drop into coverage — are the signature deception weapon that renders pre-snap hot-read systems unreliable.',
  plays: SHULA_MATCH_PLAYS,
};
