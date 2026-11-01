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
  rb: 'back',
  te: 'tight end',
  wr: 'receiver',
  dl: 'defensive lineman',
  lb: 'linebacker',
  db: 'defensive back',
};
