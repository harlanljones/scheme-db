import type { Play, SchemeFamily } from '../../../engine/types';
import { slotChoiceShot } from './slot-choice-shot';
import { izReadChoiceDoublePost } from './iz-read-choice-double-post';
import { bubbleGoGlance } from './bubble-go-glance';
import { speedSweepConstraint } from './speed-sweep-constraint';

export const BAYLOR_CHOICE_PLAYS: Play[] = [
  slotChoiceShot,
  izReadChoiceDoublePost,
  bubbleGoGlance,
  speedSweepConstraint,
];

export const BAYLOR_CHOICE_FAMILY: SchemeFamily = {
  id: 'baylor-choice',
  name: "Art Briles' Baylor Vertical Choice Spread",
  coach: 'Art Briles',
  coachId: 'art-briles',
  team: 'Baylor Bears (2008-15)',
  category: 'offense',
  treeBranch: 'option-spread',
  era: 'past-college',
  description:
    'The Baylor vertical choice spread weaponized run action into touchdown shots. Every call starts with an inside-zone read, jet sweep, or screen picture that forces the second level to defend the box, then punishes whichever safety leans with single-word choice routes and doubled posts over the top. Defenses had to guard the entire deep field on every snap or concede six.',
  plays: BAYLOR_CHOICE_PLAYS,
};
