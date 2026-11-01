/** Small text helpers shared by pages and islands. No node imports: islands use this file too. */

/** Curly apostrophes in names such as Kyle Shanahan's, so the page reads like print. Data stays as written. */
export function tidy(text: string): string {
  return text.replace(/(\w)'(\w)/g, '$1’$2');
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** "X", "X and Z", "X, Z and LCB". */
export function list(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** Counts up to twelve as words, larger as digits. */
export function count(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** 45 becomes "forty five". No hyphens, per the copy rules. Falls back to digits from 100. */
export function spell(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return n % 10 === 0 ? TENS[n / 10] : `${TENS[Math.floor(n / 10)]} ${ONES[n % 10]}`;
  return String(n);
}

export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export function plural(n: number, one: string, many = `${one}s`): string {
  return n === 1 ? one : many;
}

export const ROLE_WORDS: Record<string, string> = {
  ol: 'offensive lineman',
  qb: 'quarterback',
  rb: 'running back',
  te: 'tight end',
  wr: 'receiver',
  dl: 'defensive lineman',
  lb: 'linebacker',
  db: 'defensive back',
};

/** What a coach calls a player, by the label on the sheet. Labels not listed here fall back to the role. */
const PLAYER_WORDS: Record<string, string> = {
  QB: 'quarterback',
  RB: 'running back',
  HB: 'halfback',
  TB: 'tailback',
  FB: 'fullback',
  TE: 'tight end',
  X: 'split end',
  Z: 'flanker',
  C: 'center',
  LG: 'left guard',
  RG: 'right guard',
  LT: 'left tackle',
  RT: 'right tackle',
  MIKE: 'middle linebacker',
  SAM: 'strongside linebacker',
  WILL: 'weakside linebacker',
  FS: 'free safety',
  SS: 'strong safety',
  LCB: 'left cornerback',
  RCB: 'right cornerback',
  NICKEL: 'nickel back',
  NT: 'nose tackle',
  NOSE: 'nose tackle',
};

/** "quarterback" for QB, and the role word for labels that mean different jobs in different plays. */
export function playerWord(id: string, role: string): string {
  return PLAYER_WORDS[id] ?? ROLE_WORDS[role] ?? 'player';
}

/** Coaches say an offense sells "the same look" and a defense "disguises". */
export const lookWord = (side: 'offense' | 'defense'): string => (side === 'offense' ? 'Same look' : 'Disguise');

/** "offensive" or "defensive", for sentences about the side that is scored. */
export const sideAdjective = (side: 'offense' | 'defense'): string => (side === 'offense' ? 'offensive' : 'defensive');

/** `jim-johnson` to `Jim Johnson`. Used only for people without a record, whose names the data gives as ids. */
export function nameFromId(id: string): string {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
