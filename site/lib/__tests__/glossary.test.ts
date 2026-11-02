import { describe, expect, it } from 'vitest';
import { library, playHref } from '../data';
import { TERM_LINKS, glossaryCategories, glossaryRows, mentionsAny, nameKey, namesOf } from '../glossary';
import { llmsFullTxt, llmsTxt, sitePaths } from '../seo';
import { NAV, activeKey } from '../nav';

const lib = library();
const rows = glossaryRows();
const row = (id: string) => rows.find((r) => r.id === id)!;

describe('names', () => {
  it('reads hyphens, ampersands and case as one name', () => {
    expect(nameKey('Wide-9')).toBe(nameKey('wide 9'));
    expect(nameKey('Pin & Pull')).toBe(nameKey('pin and pull'));
    expect(nameKey('  Cover   3 Sky ')).toBe('cover 3 sky');
    expect(nameKey('at the mesh point.')).toBe('at the mesh point');
    expect(nameKey('0.0s-1.2s window')).toBe('0.0s 1.2s window');
  });

  it('matches whole words only', () => {
    expect(mentionsAny('Cover 3 Sky', [nameKey('cover 3')])).toBe(true);
    expect(mentionsAny('Recover 3', [nameKey('cover 3')])).toBe(false);
    expect(mentionsAny('Counter Trey', [nameKey('counter')])).toBe(true);
    expect(mentionsAny('Encounter', [nameKey('counter')])).toBe(false);
  });

  it('keeps the first spelling of each name and drops the repeats', () => {
    const names = namesOf({ term: 'Wide-9', aliases: ['Wide-9 front', 'Wide 9', 'wide-9 alignment', 'Wide-9'] });
    expect(names.map((n) => n.label)).toEqual(['Wide-9', 'Wide-9 front', 'wide-9 alignment']);
  });
});

describe('the glossary rows', () => {
  it('has a row for every term in the data, A to Z', () => {
    expect(rows).toHaveLength(lib.counts.terms);
    expect(new Set(rows.map((r) => r.id))).toEqual(new Set(lib.dataset.glossary.map((t) => t.id)));
    const names = rows.map((r) => r.term);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('files each term under its first letter', () => {
    for (const r of rows) expect(r.letter, r.id).toBe(r.term.charAt(0).toUpperCase());
    const letters = rows.map((r) => r.letter);
    expect(letters).toEqual([...letters].sort());
  });

  it('puts every term in a kind the page lists', () => {
    const kinds = glossaryCategories();
    expect(kinds).toHaveLength(7);
    for (const r of rows) expect(kinds, r.id).toContain(r.category);
  });

  it('never lists a term under another spelling of its own name', () => {
    for (const r of rows) {
      const keys = [r.term, ...r.also].map(nameKey);
      expect(new Set(keys).size, `${r.id}: ${keys.join(' | ')}`).toBe(keys.length);
    }
    expect(row('cover-3-press').also).toEqual(['Cover 3 Sky', 'Cover 3 Buzz', 'Single-High Press', 'Cover 3']);
    expect(row('wide-9').also).toEqual(['Wide-9 front', '9-technique', 'wide-9 alignment']);
  });

  it('searches the term, its other names, its kind and its words, in lower case', () => {
    for (const r of rows) expect(r.hay, r.id).toBe(r.hay.toLowerCase());
    expect(row('wide-zone').hay).toContain('outside zone');
    expect(row('wide-zone').hay).toContain('run concept');
  });

  it('points each "see also" at a different term that exists', () => {
    for (const r of rows) {
      for (const other of r.seeAlso) {
        expect(other.id, r.id).not.toBe(r.id);
        expect(rows.some((x) => x.id === other.id && x.term === other.term), `${r.id} -> ${other.id}`).toBe(true);
      }
    }
    expect(row('zone-read').seeAlso.map((o) => o.id)).toEqual(['mesh-point']);
    expect(row('split-zone').seeAlso.map((o) => o.id)).toEqual(['wide-zone']);
    expect(row('rpo').seeAlso.map((o) => o.id)).toEqual(['conflict-defender']);
  });
});

describe('where the library uses a term', () => {
  it('lists schemes that exist, most plays first, and counts every play once per scheme', () => {
    for (const r of rows) {
      const total = r.schemes.reduce((sum, s) => sum + s.plays, 0);
      expect(total, r.id).toBe(r.plays);
      for (const [i, s] of r.schemes.entries()) {
        const scheme = lib.schemes.find((x) => x.href === s.href);
        expect(scheme, `${r.id} ${s.href}`).toBeDefined();
        expect(s.no).toBe(scheme!.no);
        expect(s.name).toBe(scheme!.nameDisplay);
        expect(s.plays).toBeGreaterThan(0);
        if (i > 0) expect(r.schemes[i - 1].plays).toBeGreaterThanOrEqual(s.plays);
      }
    }
  });

  it('only counts a play that names the term in its title, formation, front or coverage', () => {
    const wide = row('wide-zone');
    const named = lib.schemes.flatMap((s) => s.plays).filter((p) => /wide[ -]zone|outside[ -]zone|stretch run|lateral stretch/i.test(`${p.name} ${p.formation} ${p.frontName} ${p.coverage}`));
    expect(wide.plays).toBe(named.length);
    expect(wide.schemes.some((s) => s.href === '/schemes/shanahan-wide-zone/')).toBe(true);
  });

  it('finds coverages named by one of their other names', () => {
    const robber = row('robber-coverage');
    expect(robber.plays).toBeGreaterThan(0);
    const concept = lib.dataset.concepts.find((c) => /cover 1 robber/i.test(c.coverage))!;
    expect(robber.schemes.map((s) => s.href)).toContain(`/schemes/${concept.schemeId}/`);
    expect(playHref(concept.schemeId, concept.id)).toBeTruthy();
  });

  it('says nothing about terms no play names, and links the one that has a fuller page', () => {
    const unused = rows.filter((r) => r.plays === 0).map((r) => r.id);
    expect(unused).toContain('disguise-window');
    for (const id of unused) expect(row(id).schemes, id).toEqual([]);
    expect(row('disguise-window').link).toEqual({ label: 'How the similarity score works', href: '/about/#similarity' });
    expect(Object.keys(TERM_LINKS).every((id) => rows.some((r) => r.id === id))).toBe(true);
  });
});

describe('the glossary in the site', () => {
  it('has a header tab, a sitemap entry and a line in llms.txt', () => {
    expect(NAV.map((n) => n.key)).toContain('glossary');
    expect(activeKey('/glossary/')).toBe('glossary');
    expect(sitePaths()).toContain('/glossary/');
    expect(llmsTxt()).toContain('https://schemedb.harlanljones.com/glossary/');
  });

  it('puts every term in llms-full.txt with its page', () => {
    const text = llmsFullTxt();
    for (const r of rows) {
      expect(text).toContain(`### ${r.term}`);
      expect(text).toContain(`https://schemedb.harlanljones.com/glossary/#${r.id}`);
    }
  });
});
