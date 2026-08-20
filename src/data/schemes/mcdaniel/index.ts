import type { Play, SchemeFamily } from '../../../engine/types';
import { cheatMotionToss } from './cheat-motion-toss';
import { cheatMotionWheel } from './cheat-motion-wheel';
import { insideZoneWham } from './inside-zone-wham';
import { pistolOptionPitch } from './pistol-option-pitch';

export const MCDANIEL_SPEED_PLAYS: Play[] = [
  cheatMotionToss,
  cheatMotionWheel,
  insideZoneWham,
  pistolOptionPitch,
];

export const MCDANIEL_SPEED_FAMILY: SchemeFamily = {
  id: 'mcdaniel-cheat-motion',
  name: "Mike McDaniel's Speed Cheat-Motion & Space Attack",
  coach: 'Mike McDaniel',
  coachId: 'mike-mcdaniel',
  team: 'Los Angeles Chargers',
  category: 'offense',
  treeBranch: 'shanahan-kubiak',
  description:
    "Mike McDaniel's revolutionary speed-in-space scheme that weaponizes pre-snap 'Cheat Motion' (sprint-speed motion at the snap). By giving explosive playmakers a running start to crack edge defenders on perimeter tosses, feigning cracks on devastating sideline wheel shots, punishing overpursuit with inside zone Wham traps, and running pistol speed options in the red zone, McDaniel creates mathematical dilemmas for any defense.",
  plays: MCDANIEL_SPEED_PLAYS,
};
