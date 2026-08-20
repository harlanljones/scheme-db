import type { Play, SchemeFamily } from '../../engine/types';

// ===================== ORIGINAL 7 SCHEMES =====================
import { SHANAHAN_WIDE_ZONE_FAMILY, SHANAHAN_WIDE_ZONE_PLAYS } from './shanahan/index';
import { KUBIAK_SPLIT_ZONE_FAMILY, KUBIAK_SPLIT_ZONE_PLAYS } from './kubiak/index';
import { SALEH_WIDE9_FAMILY, SALEH_WIDE9_PLAYS } from './saleh/index';
import { MACDONALD_HYBRID_FAMILY, MACDONALD_HYBRID_PLAYS } from './macdonald/index';
import { FLORES_PSYCHO_FAMILY, FLORES_PSYCHO_PLAYS } from './flores/index';
import { REID_SPREAD_RPO_FAMILY, REID_SPREAD_RPO_PLAYS } from './reid/index';
import { FANGIO_TWO_HIGH_FAMILY, FANGIO_TWO_HIGH_PLAYS } from './fangio/index';

// ===================== NEW OFFENSE SCHEMES =====================
import { MCVAY_DUO_FAMILY, MCVAY_DUO_PLAYS } from './mcvay/index';
import { MCDANIEL_SPEED_FAMILY, MCDANIEL_SPEED_PLAYS } from './mcdaniel/index';
import { STEFANSKI_GAP_FAMILY, STEFANSKI_GAP_PLAYS } from './stefanski/index';
import { STEICHEN_RPO_FAMILY, STEICHEN_RPO_PLAYS } from './steichen/index';
import { LAFLEUR_ILLUSION_FAMILY, LAFLEUR_ILLUSION_PLAYS } from './lafleur/index';
import { SIRIANNI_POWER_FAMILY, SIRIANNI_POWER_PLAYS } from './sirianni/index';
import { JOHNSON_DECEPTION_FAMILY, JOHNSON_DECEPTION_PLAYS } from './johnson/index';

// ===================== NEW DEFENSE SCHEMES =====================
import { MINTER_AMOEBA_FAMILY, MINTER_AMOEBA_PLAYS } from './minter/index';
import { RYANS_ATTACK_FAMILY, RYANS_ATTACK_PLAYS } from './ryans/index';
import { SHULA_MATCH_FAMILY, SHULA_MATCH_PLAYS } from './shula/index';
import { SPAGNUOLO_BLITZ_FAMILY, SPAGNUOLO_BLITZ_PLAYS } from './spagnuolo/index';
import { QUINN_PRESS_FAMILY, QUINN_PRESS_PLAYS } from './quinn/index';
import { BOWLES_CREEPER_FAMILY, BOWLES_CREEPER_PLAYS } from './bowles/index';

// ===================== AGGREGATED EXPORTS =====================

export const ALL_SCHEME_FAMILIES: SchemeFamily[] = [
  // 10 Offensive Schemes
  SHANAHAN_WIDE_ZONE_FAMILY,
  KUBIAK_SPLIT_ZONE_FAMILY,
  REID_SPREAD_RPO_FAMILY,
  MCVAY_DUO_FAMILY,
  MCDANIEL_SPEED_FAMILY,
  STEFANSKI_GAP_FAMILY,
  STEICHEN_RPO_FAMILY,
  LAFLEUR_ILLUSION_FAMILY,
  SIRIANNI_POWER_FAMILY,
  JOHNSON_DECEPTION_FAMILY,
  // 10 Defensive Schemes
  SALEH_WIDE9_FAMILY,
  MACDONALD_HYBRID_FAMILY,
  FLORES_PSYCHO_FAMILY,
  FANGIO_TWO_HIGH_FAMILY,
  MINTER_AMOEBA_FAMILY,
  RYANS_ATTACK_FAMILY,
  SHULA_MATCH_FAMILY,
  SPAGNUOLO_BLITZ_FAMILY,
  QUINN_PRESS_FAMILY,
  BOWLES_CREEPER_FAMILY,
];

export const ALL_PLAYS: Play[] = [
  // 10 Offensive Schemes × 4 plays = 40
  ...SHANAHAN_WIDE_ZONE_PLAYS,
  ...KUBIAK_SPLIT_ZONE_PLAYS,
  ...REID_SPREAD_RPO_PLAYS,
  ...MCVAY_DUO_PLAYS,
  ...MCDANIEL_SPEED_PLAYS,
  ...STEFANSKI_GAP_PLAYS,
  ...STEICHEN_RPO_PLAYS,
  ...LAFLEUR_ILLUSION_PLAYS,
  ...SIRIANNI_POWER_PLAYS,
  ...JOHNSON_DECEPTION_PLAYS,
  // 10 Defensive Schemes × 4 plays = 40
  ...SALEH_WIDE9_PLAYS,
  ...MACDONALD_HYBRID_PLAYS,
  ...FLORES_PSYCHO_PLAYS,
  ...FANGIO_TWO_HIGH_PLAYS,
  ...MINTER_AMOEBA_PLAYS,
  ...RYANS_ATTACK_PLAYS,
  ...SHULA_MATCH_PLAYS,
  ...SPAGNUOLO_BLITZ_PLAYS,
  ...QUINN_PRESS_PLAYS,
  ...BOWLES_CREEPER_PLAYS,
];

export function getSchemeFamilyById(id: string): SchemeFamily {
  const found = ALL_SCHEME_FAMILIES.find((f) => f.id === id);
  return found || ALL_SCHEME_FAMILIES[0];
}

export function getPlayById(id: string): Play | undefined {
  return ALL_PLAYS.find((p) => p.id === id);
}
