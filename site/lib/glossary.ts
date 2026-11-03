/**
 * The glossary as the page reads it: one row per term, with the other names it goes by, the terms its entry mentions
 * and the schemes whose plays name it. Node only (it reads the library); the island gets plain rows.
 */
import { TermCategory } from '../../src/schema/schema';
import type { TermRow } from '../islands/GlossaryList';
import { library, schemeHref, termList } from './data';
import { tidy } from './format';
import { searchKey } from './search';

/**
 * A name as a comparison key: lower case, with hyphens, slashes and other marks read as spaces, so "Wide-9", "Wide 9"
 * and "wide 9" are one name and "Pin & Pull" and "Pin and Pull" are one name. Decimal points stay ("0.0s 1.2s window").
 */
export const nameKey = (text: string): string =>
  text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/(?<!\d)\.|\.(?!\d)/g, ' ') // a full stop ends a word, a decimal point (1.2) does not
    .replace(/[^a-z0-9.]+/g, ' ')
    .trim();

/** True when `text` contains one of the names as whole words. */
export function mentionsAny(text: string, keys: string[]): boolean {
  const padded = ` ${nameKey(text)} `;
  return keys.some((key) => padded.includes(` ${key} `));
}

/** Pages that explain more than a glossary entry can. Keyed by term id. */
export const TERM_LINKS: Record<string, { label: string; href: string }> = {
  'disguise-window': { label: 'How the similarity score works', href: '/about/#similarity' },
};

/** The first letter an entry is filed under; anything that is not a letter goes under "#". */
const letterOf = (term: string): string => {
  const first = term.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
};

/** The term's own name and every other name in its record, without repeats. */
export function namesOf(term: { term: string; aliases: string[] }): { key: string; label: string }[] {
  const seen = new Set<string>();
  const out: { key: string; label: string }[] = [];
  for (const label of [term.term, ...term.aliases]) {
    const key = nameKey(label);
    if (key.length < 3 || seen.has(key)) continue;
    seen.add(key);
    out.push({ key, label });
  }
  return out;
}

let cached: TermRow[] | undefined;

/** Every term, A to Z. */
export function glossaryRows(): TermRow[] {
  if (cached) return cached;
  const lib = library();
  const terms = termList();

  const rows = terms.map((term): TermRow => {
    const names = namesOf(term);
    const keys = names.map((name) => name.key);

    // A scheme is listed when one of its plays names the term, or another name for it, in the title, formation,
    // front or coverage. Prose is left out: "counter" and "mesh" mean other things in a sentence.
    const used = new Map<string, number>();
    let plays = 0;
    for (const scheme of lib.schemes) {
      const hits = scheme.plays.filter((play) => mentionsAny(`${play.name} ${play.formation} ${play.frontName} ${play.coverage}`, keys)).length;
      if (hits > 0) {
        used.set(scheme.id, hits);
        plays += hits;
      }
    }
    const schemes = lib.schemes
      .filter((scheme) => used.has(scheme.id))
      .map((scheme) => ({ name: scheme.nameDisplay, href: schemeHref(scheme.id), no: scheme.no, plays: used.get(scheme.id)! }))
      .sort((a, b) => b.plays - a.plays || a.no - b.no);

    // Other terms whose own name appears in this entry's words.
    const seeAlso = terms
      .filter((other) => other.id !== term.id && mentionsAny(`${term.shortDef} ${term.tacticalNote}`, [nameKey(other.term)]))
      .map((other) => ({ id: other.id, term: other.term }));

    return {
      id: term.id,
      term: tidy(term.term),
      category: term.category,
      letter: letterOf(term.term),
      def: tidy(term.shortDef),
      note: tidy(term.tacticalNote),
      also: names.slice(1).map((name) => tidy(name.label)),
      seeAlso,
      link: TERM_LINKS[term.id],
      schemes,
      plays,
      hay: searchKey([term.term, ...term.aliases, term.category, term.shortDef, term.tacticalNote].join(' ')),
    };
  });

  cached = rows;
  return rows;
}

/** The categories in the order the schema lists them. */
export const glossaryCategories = (): string[] => [...TermCategory.options];
