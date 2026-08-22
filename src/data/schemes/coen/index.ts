import type { Play, SchemeFamily } from '../../../engine/types';
import { coenWideZoneGlanceRpo } from './wide-zone-glance-rpo';
import { coenBubbleTriangleRpo } from './bubble-triangle-rpo';
import { coenCrackTossPerimeter } from './crack-toss-perimeter';
import { coenMotionZoneCutback } from './motion-zone-cutback';

export const COEN_WIDE_ZONE_RPO_PLAYS: Play[] = [
  coenWideZoneGlanceRpo,
  coenBubbleTriangleRpo,
  coenCrackTossPerimeter,
  coenMotionZoneCutback,
];

export const COEN_WIDE_ZONE_RPO_FAMILY: SchemeFamily = {
  id: 'coen-wide-zone-rpo',
  name: "Liam Coen's Hybrid Wide-Zone RPO System",
  coach: 'Liam Coen',
  coachId: 'liam-coen',
  team: 'Jacksonville Jaguars',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  description:
    "The modern evolution of the Shanahan-McVay tree: Liam Coen packages genuine wide-zone run mechanics directly with post-snap RPOs, turning every zone-stretch call into a triple-option math problem for the defense. Glance shots off box-number reads, three-level bubble-slant-flat triangles, cross-field crack tosses, and orbit-motion cutbacks all grow from the same identical run picture — the defense can never be right against both halves of any call.",
  plays: COEN_WIDE_ZONE_RPO_PLAYS,
};
