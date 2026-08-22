import type { Play, SchemeFamily } from '../../../engine/types';
import { romanPowerReadPull } from './power-read-pull';
import { romanQbPowerRun } from './qb-power-run';
import { romanPinPullLeverage } from './pin-pull-leverage';
import { romanPaPostShot } from './pa-post-shot';

export const ROMAN_POWER_READ_PLAYS: Play[] = [
  romanPowerReadPull,
  romanQbPowerRun,
  romanPinPullLeverage,
  romanPaPostShot,
];

export const ROMAN_POWER_READ_FAMILY: SchemeFamily = {
  id: 'roman-power-read',
  name: "Greg Roman's Power Read & QB Run Attack",
  coach: 'Greg Roman',
  coachId: 'greg-roman',
  team: 'Los Angeles Chargers',
  category: 'offense',
  treeBranch: 'power-gap-duo',
  description:
    "The most quarterback-centric gap-scheme system in modern football, built on heavy 22 personnel and the unblocked-read-key geometry that made Lamar Jackson an MVP. Greg Roman packages power read pulls, designed QB power keepers, pin-and-pull perimeter leverage, and identical-picture play-action shots so that every defensive run fit is simultaneously a pass-fit decision — and heavy personnel becomes an offensive weapon instead of a tell.",
  plays: ROMAN_POWER_READ_PLAYS,
};
