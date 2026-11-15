import { PlayType as PlayTypeEnum } from './schema';
import type { Concept, CoverageFamily as CoverageFamilyName, DefensePackage as DefensePackageName, FieldZone as FieldZoneName, Tracks } from './schema';

/**
 * The structured fields that sit beside a play's free text, and the checks that keep the two in step.
 *
 *  - `down`, `distance`, `fieldZone` are read from `situation`.
 *  - `coverageFamily` is read from `coverage`.
 *  - `offensePersonnel`, `defensePersonnel`, `defensePackage` are read from the drawn tracks, and checked against the words
 *    in `personnel`, `formation` and `frontName`.
 *  - `playType` is a person's judgement. It cannot be read from the text, so it is checked against the side of the scheme,
 *    the tracks and the play's name instead.
 *
 * Every reader here is a pure function, so `bun run data:tag` fills the fields from them and `data:validate` checks them with
 * the same code. A text no rule can read returns `undefined`, and the field is then free to hold whatever a person set.
 */

type Side = 'offense' | 'defense';

export const OFFENSE_PLAY_TYPES = ['run', 'pass', 'play-action', 'rpo', 'screen', 'option'] as const;
export const DEFENSE_PLAY_TYPES = ['blitz', 'simulated-pressure', 'pass-rush', 'coverage', 'run-defense'] as const;

/** An offensive play is exactly one of these; `option` is added to a run. */
const OFFENSE_KINDS: readonly string[] = ['run', 'pass', 'play-action', 'rpo', 'screen'];

/** What each coverage family means, for the docs and the mapping tables. */
export const COVERAGE_FAMILIES: Record<CoverageFamilyName, string> = {
  'cover-0': 'No deep safety: man across the board, or a press-match call with both safeties near the box',
  'cover-1': 'Man coverage with one deep safety (Cover 1, Man-Free, Robber, Lurk, Rat, Hole)',
  'cover-2': 'Two deep halves with zone underneath (Cover 2, Invert, Tub, Cloud, Palms)',
  'two-man': 'Two deep halves with man underneath (Cover 2 Man, 2-Man)',
  'cover-3': 'Three deep zones behind a single-high safety (Sky, Buzz, Cloud, Match)',
  'cover-4': 'Four deep zones (Quarters, Cover 4 Match)',
  'cover-6': 'Quarters to one side of the field and halves or quarters to the other (Cover 6, Cover 8)',
  'fire-zone': 'A zone blitz: three deep, three under, with a fifth rusher or more',
  'drop-8': 'Three or fewer rush and seven or eight drop (Drop 7, Drop 8)',
  bracket: 'Two or three defenders on one receiver, high and low',
};

export const DEFENSE_PACKAGE_DESCRIPTIONS: Record<DefensePackageName, string> = {
  'goal-line': 'Three defensive backs or fewer',
  base: 'Four defensive backs',
  nickel: 'Five defensive backs',
  dime: 'Six defensive backs',
  quarter: 'Seven defensive backs or more',
};

export const FIELD_ZONE_DESCRIPTIONS: Record<FieldZoneName, string> = {
  'own-territory': 'More than 60 yards from the goal the offense is attacking (inside its own 40)',
  midfield: '40 to 60 yards from that goal (between the 40s)',
  'opponent-territory': '20 to 40 yards from that goal',
  'red-zone': '5 to 20 yards from that goal',
  'goal-line': '5 yards or fewer from that goal',
};

// ---------------------------------------------------------------------------------------------------------------------
// Situation: "3rd & 6, +42, known passing down" -> down 3, distance 6, field zone opponent-territory
// ---------------------------------------------------------------------------------------------------------------------

export interface SituationReading {
  down?: 1 | 2 | 3 | 4;
  distance?: number;
  fieldZone?: FieldZoneName;
  /** Yards from the goal the offense is attacking, when the text gives a spot. */
  yardsToGoal?: number;
  /** The text says "from the 42" without saying whose 42; it is read as 42 yards from the goal the offense attacks. */
  sideNotStated?: boolean;
}

const DOWNS: Record<string, 1 | 2 | 3 | 4> = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4 };

/** Zone of a ball `yards` from the goal the offense is attacking. The edges are inclusive on the side nearer the goal. */
export function fieldZoneAt(yards: number): FieldZoneName {
  if (yards > 60) return 'own-territory';
  if (yards >= 40) return 'midfield';
  if (yards > 20) return 'opponent-territory';
  if (yards > 5) return 'red-zone';
  return 'goal-line';
}

/**
 * Reads the down, the distance and the field zone out of a situation line. A spot is read from, in this order:
 * "Goal from the 6", "+45" or "opponent +38" (45 yards from the goal the offense attacks), "-45" or "own 40" (that far from
 * its own goal), "from the 38" (side not stated), then the words "midfield" and "red zone". A number wins over a word, so
 * "+32, red zone edge" is opponent territory. On a goal-to-go the distance is the yards to the goal.
 */
export function readSituation(text: string): SituationReading {
  const reading: SituationReading = {};
  const head = /^\s*(1st|2nd|3rd|4th)\s*&\s*(goal|\d+)/i.exec(text);
  if (!head) return reading;
  reading.down = DOWNS[head[1]!.toLowerCase()];
  const rest = text.slice(head[0].length);
  const goalToGo = head[2]!.toLowerCase() === 'goal';
  if (!goalToGo) reading.distance = Number(head[2]);

  let toGoal: number | undefined;
  let match: RegExpExecArray | null;
  if ((match = /\bgoal from the (\d{1,2})\b/i.exec(text))) toGoal = Number(match[1]);
  else if ((match = /(?:^|[\s,(])\+(\d{1,2})\b/.exec(rest))) toGoal = Number(match[1]);
  else if ((match = /(?:^|[\s,(])-(\d{1,2})\b/.exec(rest))) toGoal = 100 - Number(match[1]);
  else if ((match = /\bown\s+(\d{1,2})\b/i.exec(rest))) toGoal = 100 - Number(match[1]);
  else if ((match = /\bfrom the (\d{1,2})\b/i.exec(rest))) {
    toGoal = Number(match[1]);
    reading.sideNotStated = true;
  } else if (/\bmidfield\b/i.test(rest)) toGoal = 50;

  if (toGoal !== undefined) {
    reading.yardsToGoal = toGoal;
    reading.fieldZone = fieldZoneAt(toGoal);
  } else if (/\bred zone\b/i.test(rest)) reading.fieldZone = 'red-zone';

  if (goalToGo && toGoal !== undefined) reading.distance = toGoal;
  return reading;
}

// ---------------------------------------------------------------------------------------------------------------------
// Coverage: 121 spellings -> 10 families
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Families a spelling can name. The one named first wins ("Cover 1 / Cover 3 Robber" is Cover 1), ties go to the entry listed
 * first so "Cover 2 Man" is `two-man` rather than `cover-2`. `fire-zone`, `drop-8` and "roll to Cover 3" outrank the rest,
 * because "Cover 3 Fire Zone" is a zone blitz and "Cover 2 Roll to Cover 3 Sky" ends in Cover 3.
 */
const OUTRANKING: Array<[RegExp, CoverageFamilyName]> = [
  [/\bdrop[- ]?[78]\b/i, 'drop-8'],
  [/\bfire zone\b/i, 'fire-zone'],
  [/\broll to cover 3\b/i, 'cover-3'],
];

const NAMED: Array<[RegExp, CoverageFamilyName]> = [
  [/\bcover 0\b|\bzero\b|\bpress match\b|\bgoal line 6-2 man\b/i, 'cover-0'],
  [/\bcover 2 man\b|\b2-man\b/i, 'two-man'],
  [/\bcover 2\b/i, 'cover-2'],
  [/\bcover 1\b|\bman-free\b|\bman under with single-high\b/i, 'cover-1'],
  [/\bcover 3\b|\bsingle-high, soft corners\b/i, 'cover-3'],
  [/\bcover 4\b|\bquarters\b/i, 'cover-4'],
  [/\bcover [68]\b/i, 'cover-6'],
  [/\bbracket\b/i, 'bracket'],
];

/** The family a coverage spelling names, or `undefined` when no rule reads it (a new spelling a person has to classify). */
export function coverageFamilyOf(text: string): CoverageFamilyName | undefined {
  for (const [pattern, family] of OUTRANKING) if (pattern.test(text)) return family;
  let best: { index: number; family: CoverageFamilyName } | undefined;
  for (const [pattern, family] of NAMED) {
    const index = pattern.exec(text)?.index;
    if (index !== undefined && (!best || index < best.index)) best = { index, family };
  }
  return best?.family;
}

// ---------------------------------------------------------------------------------------------------------------------
// Personnel: read from the tracks
// ---------------------------------------------------------------------------------------------------------------------

const count = (players: Tracks['offense'], role: string): number => players.filter((player) => player.role === role).length;

/** Backs then tight ends, as drawn: "11" is one back and one tight end, "00" is empty. */
export const offensePersonnelOf = (tracks: Tracks): string => `${count(tracks.offense, 'rb')}${count(tracks.offense, 'te')}`;

/** Linemen, linebackers and defensive backs, as drawn: "4-2-5". */
export const defensePersonnelOf = (tracks: Tracks): string =>
  `${count(tracks.defense, 'dl')}-${count(tracks.defense, 'lb')}-${count(tracks.defense, 'db')}`;

/** The package a defense is in, from its defensive backs: 4 is base, 5 nickel, 6 dime. */
export function defensePackageOf(defensePersonnel: string): DefensePackageName {
  const backs = Number(defensePersonnel.split('-')[2]);
  if (backs <= 3) return 'goal-line';
  if (backs === 4) return 'base';
  if (backs === 5) return 'nickel';
  if (backs === 6) return 'dime';
  return 'quarter';
}

// ---------------------------------------------------------------------------------------------------------------------
// Reading every derivable field of a concept, and checking them
// ---------------------------------------------------------------------------------------------------------------------

/** The fields `bun run data:tag` can read. `playType` is not among them. */
export type DerivedTags = Pick<Concept, 'offensePersonnel' | 'defensePersonnel' | 'defensePackage' | 'down' | 'distance' | 'fieldZone' | 'coverageFamily'>;

/** A scaffolded play leaves "TODO: ..." in the text it has not written yet; those fields cannot be read yet. */
const unwritten = (text: string): boolean => /^\s*TODO\b/i.test(text);

export function deriveTags(concept: Concept, tracks: Tracks | undefined): DerivedTags {
  const out: DerivedTags = {};
  if (tracks) {
    out.offensePersonnel = offensePersonnelOf(tracks);
    out.defensePersonnel = defensePersonnelOf(tracks);
    out.defensePackage = defensePackageOf(out.defensePersonnel);
  }
  if (!unwritten(concept.situation)) {
    const reading = readSituation(concept.situation);
    if (reading.down) out.down = reading.down;
    if (reading.distance !== undefined) out.distance = reading.distance;
    if (reading.fieldZone) out.fieldZone = reading.fieldZone;
  }
  if (!unwritten(concept.coverage)) {
    const family = coverageFamilyOf(concept.coverage);
    if (family) out.coverageFamily = family;
  }
  return out;
}

const FIELDS = ['offensePersonnel', 'defensePersonnel', 'defensePackage', 'down', 'distance', 'fieldZone', 'coverageFamily'] as const;

const SOURCE: Record<(typeof FIELDS)[number], string> = {
  offensePersonnel: 'the offense the tracks draw',
  defensePersonnel: 'the defense the tracks draw',
  defensePackage: 'the defensive backs the tracks draw',
  down: 'the start of situation',
  distance: 'situation',
  fieldZone: 'situation',
  coverageFamily: 'coverage',
};

/** Text of a concept that names a personnel group, like "vs 11P Gun 3x1" or "Gun 12 Personnel Solo Left". */
const FORMATION_PERSONNEL = /\b(\d{2})\s*(?:P\b|personnel\b)/i;

export interface TagFindings {
  /** The structured fields disagree with the text or tracks they are read from: fails the build. */
  errors: string[];
  /** A formation names an offensive personnel group the tracks do not draw. Reported, not failed: only the text or the tracks can be corrected, and neither is part of a tagging change. */
  warnings: string[];
}

/**
 * Everything about a play's structured fields that disagrees with its text or its tracks. One sentence per problem, with no
 * concept id: the caller adds it. A field that is missing is an error too (`bun run data:tag --write` fills it), so a play
 * cannot ship half-tagged. A `draft` still has `TODO` text to write: its missing fields are not reported yet, because the
 * text they are read from is not there, but a field that is present is still checked.
 */
export function tagFindings(concept: Concept, tracks: Tracks | undefined, side: Side, options: { draft?: boolean } = {}): TagFindings {
  const draft = options.draft ?? false;
  const errors: string[] = [];
  const warnings: string[] = [];
  const derived = deriveTags(concept, tracks);

  for (const field of FIELDS) {
    const expected = derived[field];
    const actual = concept[field];
    if (expected === undefined) continue;
    if (actual === undefined) {
      if (!draft) errors.push(`${field} is missing; it is read from ${SOURCE[field]} (run \`bun run data:tag --write\`)`);
    } else if (actual !== expected) errors.push(`${field} is ${JSON.stringify(actual)} but ${SOURCE[field]} says ${JSON.stringify(expected)}`);
  }
  if (!draft && concept.coverageFamily === undefined && derived.coverageFamily === undefined && !unwritten(concept.coverage)) {
    errors.push(`coverageFamily is missing and no rule reads "${concept.coverage}"; choose one of the families in data/README.md`);
  }

  if (tracks) {
    // A formation that says "vs 11P Gun 2x2" names the offense the defense faces.
    const formation = unwritten(concept.formation) ? null : FORMATION_PERSONNEL.exec(concept.formation);
    if (formation && formation[1] !== offensePersonnelOf(tracks)) {
      warnings.push(`formation says "${concept.formation}" (${formation[1]} personnel) but the offense draws ${offensePersonnelOf(tracks)}`);
    }
  }

  if (concept.playType || !draft) errors.push(...playTypeProblems(concept, tracks, side));
  return { errors, warnings };
}

/** `playType` against the side of the scheme, the tracks and the name. */
export function playTypeProblems(concept: Concept, tracks: Tracks | undefined, side: Side): string[] {
  const tags = concept.playType;
  if (!tags) return [`playType is missing; choose from ${(side === 'offense' ? OFFENSE_PLAY_TYPES : DEFENSE_PLAY_TYPES).join(', ')}`];
  const problems: string[] = [];
  const allowed: readonly string[] = side === 'offense' ? OFFENSE_PLAY_TYPES : DEFENSE_PLAY_TYPES;
  for (const tag of tags) {
    if (!PlayTypeEnum.options.includes(tag)) problems.push(`playType "${tag}" is not a play type`);
    else if (!allowed.includes(tag)) {
      problems.push(`playType "${tag}" is ${side === 'offense' ? 'a defensive' : 'an offensive'} tag, but the play belongs to ${side === 'offense' ? 'an offensive' : 'a defensive'} scheme`);
    }
  }
  if (new Set(tags).size !== tags.length) problems.push(`playType lists a tag twice: ${tags.join(', ')}`);

  if (side === 'offense') {
    const kinds = tags.filter((tag) => OFFENSE_KINDS.includes(tag));
    if (kinds.length !== 1) problems.push(`playType needs exactly one of ${OFFENSE_KINDS.join(', ')}, found ${kinds.length === 0 ? 'none' : kinds.join(' and ')}`);
    if (tags.includes('option') && !tags.includes('run')) problems.push('playType "option" goes with "run" (a read play that is a pass is a "rpo" or a "pass")');
    const carries = tracks?.offense.some((track) => track.trail === 'carry') ?? true;
    if (!carries && (tags.includes('run') || tags.includes('rpo'))) problems.push(`playType says "${tags.join(', ')}" but no offensive player has a "carry" trail`);
    if (/\bRPO\b/i.test(concept.name) && !tags.includes('rpo')) problems.push(`the name says RPO but playType is ${tags.join(', ')}`);
    if (/\bplay[- ]action\b|\bPA\b/i.test(concept.name) && !tags.includes('play-action')) problems.push(`the name says play-action but playType is ${tags.join(', ')}`);
  } else if (tags.includes('blitz') && tags.includes('simulated-pressure')) {
    problems.push('playType cannot be both "blitz" (five rushers or more) and "simulated-pressure" (a look of pressure with four or fewer)');
  }
  return problems;
}

/**
 * Order of a concept's keys in its file: each structured field sits right after the free text it describes, so a person
 * editing `situation` sees `down`, `distance` and `fieldZone` beside it. Keys not listed keep their place at the end.
 */
export const CONCEPT_KEY_ORDER = [
  '$schema',
  'id',
  'schemeId',
  'order',
  'name',
  'playType',
  'personnel',
  'offensePersonnel',
  'defensePersonnel',
  'defensePackage',
  'formation',
  'formationId',
  'ballSpot',
  'situation',
  'down',
  'distance',
  'fieldZone',
  'coverage',
  'coverageFamily',
  'frontName',
  'summary',
  'beats',
  'relations',
  'provenance',
] as const;

/** A copy of a concept record with its keys in `CONCEPT_KEY_ORDER`. */
export function orderConcept(record: Record<string, unknown>): Record<string, unknown> {
  const rank = (key: string): number => {
    const i = (CONCEPT_KEY_ORDER as readonly string[]).indexOf(key);
    return i === -1 ? CONCEPT_KEY_ORDER.length : i;
  };
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => rank(a) - rank(b)));
}

/** The derived fields of `tags` that a concept lacks or holds differently, as the names to write. */
export function stale(concept: Concept, derived: DerivedTags): Array<keyof DerivedTags> {
  return (FIELDS as readonly (keyof DerivedTags)[]).filter((field) => derived[field] !== undefined && concept[field] !== derived[field]);
}
