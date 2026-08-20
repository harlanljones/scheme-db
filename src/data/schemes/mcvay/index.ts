import type { Play, SchemeFamily } from '../../../engine/types';
import { duoLeadRun } from './duo-lead-run';
import { paSailFlood } from './pa-sail-flood';
import { paDeepCrosser } from './pa-deep-crosser';
import { glanceRpoOrbit } from './glance-rpo-orbit';

export const MCVAY_DUO_PLAYS: Play[] = [
  duoLeadRun,
  paSailFlood,
  paDeepCrosser,
  glanceRpoOrbit,
];

export const MCVAY_DUO_FAMILY: SchemeFamily = {
  id: 'mcvay-duo-playaction',
  name: "Sean McVay's Condensed Duo & Play-Action Attack",
  coach: 'Sean McVay',
  coachId: 'sean-mcvay',
  team: 'Los Angeles Rams',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  description:
    "Sean McVay's championship offensive system engineered around condensed 11-personnel formations with tight receiver splits. By pairing physical 'Power without a puller' Duo double-teams with identical play-action 3-level Sail floods, explosive deep crossing over-routes, and rapid Glance RPOs, McVay keeps defensive front sevens in permanent schematic conflict.",
  plays: MCVAY_DUO_PLAYS,
};
