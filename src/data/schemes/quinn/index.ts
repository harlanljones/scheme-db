import type { SchemeFamily, Play } from '../../../engine/types';
import { quinnCover3PressBail } from './cover3-press-bail';
import { quinnUnderFrontOverload } from './under-front-overload';
import { quinnCover1RatInHole } from './cover1-rat-in-hole';
import { quinnSafetySkyFireZone } from './safety-sky-fire-zone';

export const QUINN_PRESS_PLAYS: Play[] = [
  quinnCover3PressBail,
  quinnUnderFrontOverload,
  quinnCover1RatInHole,
  quinnSafetySkyFireZone,
];

export const QUINN_PRESS_FAMILY: SchemeFamily = {
  id: 'quinn-cover3-press',
  name: 'Dan Quinn Cover 3 Press-Bail & Under Front',
  coach: 'Dan Quinn',
  coachId: 'dan-quinn',
  team: 'Washington Commanders / Seattle Seahawks',
  category: 'defense',
  treeBranch: 'carroll-saleh-wide9',
  description:
    'Dan Quinn’s definitive single-high defensive system: physical press-bail cornerback mechanics, 4-3 Under front overloads generating organic 4-man speed rush with the LEO defensive end, Cover 1 Rat-in-the-Hole lurking underneath crossers, and lethal safety Sky fire zone pressures.',
  plays: QUINN_PRESS_PLAYS,
};

export {
  quinnCover3PressBail,
  quinnUnderFrontOverload,
  quinnCover1RatInHole,
  quinnSafetySkyFireZone,
};
