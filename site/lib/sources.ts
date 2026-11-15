/** How the site words a record's sources. No node imports: pages and tests share this file. */
import { list } from './format';
import type { Source, Supports } from '../../src/schema/schema';

/** The order the site names what a source backs, the same as the `supports` column in the downloads. */
const ORDER: readonly Supports[] = ['idea', 'drawing', 'claim'];

const BACKS: Record<Supports, string> = { idea: 'the idea', drawing: 'the drawing', claim: 'the claim' };

const MEANING: Record<Supports, string> = {
  idea: 'where the idea comes from',
  drawing: 'the paths and timings were rebuilt from it',
  claim: 'a fact in the text, such as a date, a number or a mentor link',
};

/** "Backs the idea and the claim.", or nothing when the source does not say what it backs. */
export function backsPhrase(supports: readonly Supports[] | undefined): string | undefined {
  const kinds = ORDER.filter((kind) => supports?.includes(kind));
  return kinds.length > 0 ? `Backs ${list(kinds.map((kind) => BACKS[kind]))}.` : undefined;
}

/** What each word in a list of sources means, for only the words it uses. Nothing when no source says what it backs. */
export function backsLegend(sources: readonly Source[]): string | undefined {
  const kinds = ORDER.filter((kind) => sources.some((source) => source.supports?.includes(kind)));
  return kinds.length > 0 ? kinds.map((kind) => `Backs ${BACKS[kind]}: ${MEANING[kind]}.`).join(' ') : undefined;
}

/** "film", "self authored": the type as the site shows it. */
export const sourceKind = (type: Source['type']): string => type.replace('-', ' ');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2027-01-15" as "Jan 15, 2027". Read from the text, so the viewer's time zone cannot move the day. */
export function dateLabel(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${MONTHS[month! - 1]} ${day}, ${year}`;
}
