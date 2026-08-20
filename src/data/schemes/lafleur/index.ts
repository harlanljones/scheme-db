import type { Play, SchemeFamily } from '../../../engine/types';
import { lafleurWideZoneCutback } from './wide-zone-cutback';
import { lafleurCrossCountryPost } from './cross-country-post';
import { lafleurPonyScreenWheel } from './pony-screen-wheel';
import { lafleurPaDaggerDig } from './pa-dagger-dig';

export const LAFLEUR_ILLUSION_PLAYS: Play[] = [
  lafleurWideZoneCutback,
  lafleurCrossCountryPost,
  lafleurPonyScreenWheel,
  lafleurPaDaggerDig,
];

export const LAFLEUR_ILLUSION_FAMILY: SchemeFamily = {
  id: 'lafleur-illusion-packers',
  name: "Matt LaFleur's Illusion of Complexity & Deep Shot Family",
  coach: 'Matt LaFleur',
  coachId: 'matt-lafleur',
  team: 'Green Bay Packers',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  description:
    'A masterclass in schematic deception and visual illusion. Matt LaFleur marries condensed 12-personnel and dual-back Pony sets with identical under-center wide-zone run mechanics to lull defenses into overpursuing, before unlocking catastrophic deep Cross-Country Posts, Dagger intermediate concepts, and perimeter constraint wheels.',
  plays: LAFLEUR_ILLUSION_PLAYS,
};
