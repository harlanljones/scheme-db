import type { Play, SchemeFamily } from '../../../engine/types';
import { b46BaseIForm } from './b46-base-i-form';
import { b46MadDogDoubleA } from './b46-mad-dog-double-a';
import { b46ExtStrongCombo } from './b46-ext-strong-combo';
import { b46FreeBladeWeakBlitz } from './b46-free-blade-weak-blitz';

export const BUDDY_46_DEFENSE_PLAYS: Play[] = [
  b46BaseIForm,
  b46MadDogDoubleA,
  b46ExtStrongCombo,
  b46FreeBladeWeakBlitz,
];

export const BUDDY_46_DEFENSE_FAMILY: SchemeFamily = {
  id: 'buddy-46-defense',
  name: "Buddy Ryan's 46 Defense",
  coach: 'Buddy Ryan',
  coachId: 'buddy-ryan',
  team: 'Chicago Bears (1982-85)',
  category: 'defense',
  treeBranch: 'buddy-46',
  era: 'past-nfl',
  description:
    'The most aggressive defense in NFL history. Ends aligned head-up at tight-end width, tackles shaded inside, three linebackers bunched at 2-3 yards, and BOTH safeties walked into an eight-man box with zero deep-middle help. Corners survive on islands in press-man. The base picture alone forces offenses to abandon their blocking rules; the mad-dog mug, E-X-T combo, and free blade blitzes turn that confusion into sacks.',
  plays: BUDDY_46_DEFENSE_PLAYS,
};
