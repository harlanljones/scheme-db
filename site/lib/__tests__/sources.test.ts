import { describe, expect, it } from 'vitest';
import { library, type Library } from '../data';
import { llmsFullTxt } from '../seo';
import { backsLegend, backsPhrase, dateLabel, sourceKind } from '../sources';

describe('how the site words sources', () => {
  it('says what a source backs, in one order whatever the record lists', () => {
    expect(backsPhrase(['idea'])).toBe('Backs the idea.');
    expect(backsPhrase(['claim', 'idea'])).toBe('Backs the idea and the claim.');
    expect(backsPhrase(['claim', 'drawing', 'idea'])).toBe('Backs the idea, the drawing and the claim.');
  });

  it('says nothing for a source that does not say', () => {
    expect(backsPhrase(undefined)).toBeUndefined();
    expect(backsPhrase([])).toBeUndefined();
  });

  it('explains only the words the list of sources uses', () => {
    const base = { type: 'article', citation: 'x' } as const;
    expect(backsLegend([base])).toBeUndefined();
    expect(backsLegend([{ ...base, supports: ['idea'] }])).toBe('Backs the idea: where the idea comes from.');
    const both = backsLegend([{ ...base, supports: ['claim'] }, { ...base, supports: ['idea'] }])!;
    expect(both).toBe('Backs the idea: where the idea comes from. Backs the claim: a fact in the text, such as a date, a number or a mentor link.');
    expect(backsLegend([{ ...base, supports: ['drawing'] }])).toContain('rebuilt from it');
  });

  it('names a source type the way a sheet shows it', () => {
    expect(sourceKind('self-authored')).toBe('self authored');
    expect(sourceKind('film')).toBe('film');
  });

  it('writes a date from its text, so the time zone cannot move the day', () => {
    expect(dateLabel('2027-01-15')).toBe('Jan 15, 2027');
    expect(dateLabel('2026-12-01')).toBe('Dec 1, 2026');
  });
});

describe('sources in llms-full.txt', () => {
  const lib = library();

  it('lists a scheme source with its link and what it backs, and dates the coach role, only when the data has them', () => {
    const plain = llmsFullTxt(lib);
    expect(plain).not.toContain('- Source (');
    expect(plain).not.toContain(', as of ');

    const scheme = lib.schemes[0];
    const coach = lib.coachById.get(scheme.coachId)!;
    const withData: Library = {
      ...lib,
      schemes: lib.schemes.map((s) => (s.id === scheme.id ? { ...s, sources: [{ type: 'article', citation: 'A piece', url: 'https://example.com/a', supports: ['idea', 'claim'] }] } : s)),
      coachById: new Map(lib.coachById).set(coach.id, { ...coach, asOf: '2027-01-15' }),
    };
    const text = llmsFullTxt(withData);
    expect(text).toContain('- Source (article): A piece https://example.com/a Backs the idea and the claim.');
    expect(text).toContain(', as of Jan 15, 2027)');
  });
});
