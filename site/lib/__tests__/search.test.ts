import { describe, expect, it } from 'vitest';
import { coachRows, playRows, schemeRows } from '../data';
import { glossaryRows } from '../glossary';
import { llmsTxt } from '../seo';
import { searchKey } from '../search';

const hits = (rows: Array<{ hay: string }>, query: string) => rows.filter((row) => row.hay.includes(searchKey(query))).length;

describe('searchKey', () => {
  it('reads hyphens, slashes, ampersands, apostrophes, accents and case as plain words', () => {
    expect(searchKey('Play-Action Deep Over')).toBe('play action deep over');
    expect(searchKey('Cover-2')).toBe(searchKey('cover 2'));
    expect(searchKey('Wide-9 & Match')).toBe('wide 9 and match');
    expect(searchKey('Okie/Bear')).toBe('okie bear');
    expect(searchKey('Kevin O’Connell')).toBe(searchKey("kevin o'connell"));
    expect(searchKey("Briles' Baylor")).toBe('briles baylor');
    expect(searchKey('Café')).toBe('cafe');
    expect(searchKey('  1st   &  10, +40 ')).toBe('1st and 10 40');
  });

  it('keeps a decimal point and drops a full stop', () => {
    expect(searchKey('first 1.2 seconds.')).toBe('first 1.2 seconds');
  });

  it('is empty for a query of only punctuation, which the tables read as no search', () => {
    expect(searchKey(' - / ? ')).toBe('');
  });
});

describe('what people type finds the plays the data spells with a hyphen', () => {
  const plays = playRows();

  it('"play action" finds what "play-action" finds', () => {
    expect(hits(plays, 'play-action')).toBeGreaterThan(0);
    expect(hits(plays, 'play action')).toBe(hits(plays, 'play-action'));
  });

  it('"cover-2" finds what "cover 2" finds', () => {
    expect(hits(plays, 'cover 2')).toBeGreaterThan(0);
    expect(hits(plays, 'cover-2')).toBe(hits(plays, 'cover 2'));
  });

  it('works the same on the home table, the coaches and the glossary', () => {
    const schemePlays = schemeRows().flatMap((scheme) => scheme.plays);
    expect(hits(schemePlays, 'play action')).toBeGreaterThan(0);
    expect(hits(schemePlays, 'play action')).toBe(hits(schemePlays, 'play-action'));
    expect(hits(coachRows(), "o'connell")).toBeGreaterThan(0);
    expect(hits(glossaryRows(), 'wide 9')).toBeGreaterThan(0);
  });
});

describe('llms.txt', () => {
  it('writes the era the way the site does, not in lower case', () => {
    const text = llmsTxt();
    expect(text).toMatch(/Defense, (Modern|Past|Current) (NFL|college)\./);
    expect(text).not.toMatch(/, (modern|past|current) (nfl|college)\./);
  });
});
