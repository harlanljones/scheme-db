import type { Play, SchemeFamily } from '../../../engine/types';
import { powerSweepLeft } from './power-sweep-left';
import { powerSweepRightBootFake } from './power-sweep-right-boot-fake';
import { fullbackBlast } from './fullback-blast';
import { sweepPassBootleg } from './sweep-pass-bootleg';

export const T_FORMATION_POWER_SWEEP_PLAYS: Play[] = [
  powerSweepLeft,
  powerSweepRightBootFake,
  fullbackBlast,
  sweepPassBootleg,
];

export const T_FORMATION_POWER_SWEEP_FAMILY: SchemeFamily = {
  id: 't-formation-power-sweep',
  name: "Vince Lombardi's T-Formation Power Sweep",
  coach: 'Vince Lombardi',
  coachId: 'vince-lombardi',
  team: 'Green Bay Packers (1959-67)',
  category: 'offense',
  treeBranch: 'power-gap-duo',
  era: 'past-nfl',
  description:
    'The most sequenced run system in football history. The double-pull sweep ran dozens of times a game, and every companion play — counter-boot, fullback blast, and flood bootleg — borrowed its exact picture so defenses could never trust what they saw.',
  plays: T_FORMATION_POWER_SWEEP_PLAYS,
};
