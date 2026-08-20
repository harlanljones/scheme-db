import type { Play, SchemeFamily } from '../../../engine/types';
import { salehCover3Match } from './cover3-match';
import { salehCover6Bracket } from './cover6-bracket';
import { salehCrossDogFire3 } from './cross-dog-fire3';
import { salehNascarCover1Robber } from './nascar-cover1-robber';

export const SALEH_WIDE9_PLAYS: Play[] = [
  salehCover3Match,
  salehCover6Bracket,
  salehCrossDogFire3,
  salehNascarCover1Robber,
];

export const SALEH_WIDE9_FAMILY: SchemeFamily = {
  id: 'saleh-43-wide9',
  name: "Robert Saleh's 4-3 Wide-9 & Cover 3 Match",
  coach: 'Robert Saleh',
  coachId: 'robert-saleh',
  team: 'San Francisco 49ers / NY Jets',
  category: 'defense',
  treeBranch: 'carroll-saleh-wide9',
  description:
    'A masterclass in modern defensive front geometry and disciplined coverage matching. Built around aggressive Wide-9 defensive end splits and penetrating 3-techniques that generate elite 4-man pressure, complemented by pattern-matching Cover 3 Rip/Liz, split-field Cover 6 brackets, and timed A-gap cross-dog blitzes.',
  plays: SALEH_WIDE9_PLAYS,
};
