import type { Play, SchemeFamily } from '../../../engine/types';
import { pistolInsideZoneRead } from './pistol-inside-zone-read';
import { pistolPowerORead } from './pistol-power-o-read';
import { pistolPaDeepShot } from './pa-deep-shot';
import { pistolSpeedOption } from './speed-option';

export const PISTOL_READ_OPTION_PLAYS: Play[] = [
  pistolInsideZoneRead,
  pistolPowerORead,
  pistolPaDeepShot,
  pistolSpeedOption,
];

export const PISTOL_READ_OPTION_FAMILY: SchemeFamily = {
  id: 'pistol-read-option',
  name: "Chris Ault's Pistol Read-Option",
  coach: 'Chris Ault',
  coachId: 'chris-ault',
  team: 'Nevada Wolf Pack',
  category: 'offense',
  treeBranch: 'option-spread',
  era: 'past-college',
  description:
    'The Pistol marries gun spacing with under-center run physics: the quarterback lines up four yards deep with the back directly behind him, so every zone and gap run hits downhill at full pad level while still carrying a quarterback keep threat. Chris Ault invented the formation at Nevada, where Colin Kaepernick turned it into a 2,000-yard rushing attack.',
  plays: PISTOL_READ_OPTION_PLAYS,
};
