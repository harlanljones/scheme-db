import type { Play, SchemeFamily } from '../../../engine/types';
import { meshShallowCross } from './mesh-shallow-cross';
import { rpoGlancePost } from './rpo-glance-post';
import { powerShovelOption } from './power-shovel-option';
import { sprintoutSmashWheel } from './sprintout-smash-wheel';

export const REID_SPREAD_RPO_PLAYS: Play[] = [
  meshShallowCross,
  rpoGlancePost,
  powerShovelOption,
  sprintoutSmashWheel,
];

export const REID_SPREAD_RPO_FAMILY: SchemeFamily = {
  id: 'reid-spread-rpo',
  name: "Andy Reid's Spread-RPO & Mesh Passing Family",
  coach: 'Andy Reid',
  coachId: 'andy-reid',
  team: 'Kansas City Chiefs',
  category: 'offense',
  treeBranch: 'reid-west-coast',
  description:
    'The pinnacle of modern hybrid football. Andy Reid synthesizes classic West Coast horizontal passing and timed rhythm with modern spread RPO tags, Mesh shallow crossing rub combinations, misdirection power shovel passes, and perimeter sprintout smash-wheel concepts. Operating out of 11-personnel Gun Trips alignments, Reid stresses second-level conflict defenders with identical pre-snap looks before unleashing lethal horizontal and vertical route combinations.',
  plays: REID_SPREAD_RPO_PLAYS,
};
