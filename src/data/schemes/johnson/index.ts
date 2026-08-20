import type { Play, SchemeFamily } from '../../../engine/types';
import { johnsonCounterTreyLead } from './counter-trey-lead';
import { johnsonPaTeThrowback } from './pa-te-throwback';
import { johnsonHookLadderMesh } from './hook-ladder-mesh';
import { johnsonOrbitReverseScreen } from './orbit-reverse-screen';

export const JOHNSON_DECEPTION_PLAYS: Play[] = [
  johnsonCounterTreyLead,
  johnsonPaTeThrowback,
  johnsonHookLadderMesh,
  johnsonOrbitReverseScreen,
];

export const JOHNSON_DECEPTION_FAMILY: SchemeFamily = {
  id: 'johnson-counter-deception',
  name: "Ben Johnson's Counter Deception & Gadget Offense",
  coach: 'Ben Johnson',
  coachId: 'ben-johnson',
  team: 'Detroit Lions',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  description:
    'A brilliantly layered offensive system built on counter run misdirection, pre-snap orbit motion, and seamless play-action packaging. Ben Johnson weaponizes dual-pull counters, hook-ladder mesh rubs, TE throwback leaks off counter PA, and orbit-driven RB screen convoys to create a complete deception ecosystem where every play looks identical from the defensive perspective until it\'s too late.',
  plays: JOHNSON_DECEPTION_PLAYS,
};
