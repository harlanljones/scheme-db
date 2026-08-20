import type { Play, SchemeFamily } from '../../../engine/types';
import { qbPowerRead } from './qb-power-read';
import { meshRailWheel } from './mesh-rail-wheel';
import { zoneBubbleRpo } from './zone-bubble-rpo';
import { verticalsSwitch } from './verticals-switch';

export const STEICHEN_RPO_PLAYS: Play[] = [
  qbPowerRead,
  meshRailWheel,
  zoneBubbleRpo,
  verticalsSwitch,
];

export const STEICHEN_RPO_FAMILY: SchemeFamily = {
  id: 'steichen-qb-mesh-rpo',
  name: "Shane Steichen's QB Mesh & Spread RPO System",
  coach: 'Shane Steichen',
  coachId: 'shane-steichen',
  team: 'Indianapolis Colts',
  category: 'offense',
  treeBranch: 'reid-west-coast',
  description:
    'A dual-threat quarterback maximization system rooted in Andy Reid\'s West Coast principles with modern college Spread DNA. Shane Steichen pairs zone-read power runs with RPO bubble/glance perimeter reads, Mesh shallow crosses that create natural rubs against man coverage, and vertical switch releases that exploit deep zone voids. The system demands a mobile signal-caller who threatens the edge on every designed run, compressing defensive end responsibilities into an impossible choice.',
  plays: STEICHEN_RPO_PLAYS,
};
