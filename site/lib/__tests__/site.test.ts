import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTables } from '../../../src/release/tables';
import { fieldWindow, pos, type LitePlay } from '../field';
import { capitalize, spell, tidy } from '../format';
import { FEATURED, comparisonsFor, library, litePlay, playHref, relatedPlays, schemePlayRows } from '../data';
import { CSV_TABLES } from '../downloads';
import { llmsFullTxt, llmsTxt, sitePaths, sitemapXml } from '../seo';

const lib = library();
const play = (id: string): LitePlay => litePlay(lib.conceptById.get(id)!, lib.tracksById.get(id)!);

describe('the library the pages read', () => {
  it('counts what the home page says', () => {
    expect(lib.counts).toEqual({ schemes: 45, plays: 180, coaches: 53, lineages: 17, terms: 30 });
  });

  it('numbers the contents 1 to 45 in coach surname order', () => {
    expect(lib.schemes.map((s) => s.no)).toEqual(Array.from({ length: 45 }, (_, i) => i + 1));
    const surnames = lib.schemes.map((s) => s.coachName.split(' ').pop()!.toLowerCase());
    expect(surnames).toEqual([...surnames].sort((a, b) => a.localeCompare(b)));
  });

  it('gives every scheme four plays with a page each', () => {
    for (const scheme of lib.schemes) {
      expect(scheme.plays.map((p) => p.order)).toEqual([1, 2, 3, 4]);
      for (const p of scheme.plays) expect(p.href).toBe(playHref(scheme.id, p.id));
    }
  });

  it('resolves the featured plays the home page opens with', () => {
    expect(lib.conceptById.get(FEATURED.conceptId)?.schemeId).toBe(FEATURED.schemeId);
    expect(lib.conceptById.get(FEATURED.againstId)?.schemeId).toBe(FEATURED.schemeId);
  });
});

describe('comparisons', () => {
  const comparisons = comparisonsFor(lib.conceptById.get('outside-zone')!);

  it('scores the wide zone family as the About page and the home page state', () => {
    expect(comparisons.map((c) => [c.id, c.score, c.atEnd, c.breakSeconds])).toEqual([
      ['play-action-over', 96, 92, null],
      ['naked-bootleg', 97, 93, null],
      ['jet-motion-oz', 79, 61, 0.6],
    ]);
  });

  it('names the three players more than a yard from outside zone at 1.2 s against play action', () => {
    const pa = comparisons.find((c) => c.id === 'play-action-over')!;
    expect(pa.gapDetails.map((g) => g.id)).toEqual(['Z', 'X', 'LCB']);
    expect(pa.gapDetails.map((g) => Math.round(g.yards * 10) / 10)).toEqual([4.6, 2.9, 1.3]);
    expect(comparisons.find((c) => c.id === 'jet-motion-oz')!.gapsAtEnd).toHaveLength(8);
  });

  it('attributes the tell to the play that plays off the other', () => {
    const pa = comparisons.find((c) => c.id === 'play-action-over')!;
    expect(pa.tellName).toBe('Wide Zone Play-Action Deep Over');
    expect(pa.tell).toMatch(/Backside WR/);
  });

  it('gives every one of the 180 plays at least one comparison inside its own scheme', () => {
    for (const concept of lib.dataset.concepts) {
      const related = relatedPlays(concept);
      expect(related.length, concept.id).toBeGreaterThan(0);
      for (const other of related) expect(other.schemeId).toBe(concept.schemeId);
    }
  });

  it('scores every comparison between 0 and 100 on 13 frames', () => {
    for (const concept of lib.dataset.concepts) {
      for (const c of comparisonsFor(concept)) {
        expect(c.profile).toHaveLength(13);
        expect(c.score).toBeGreaterThanOrEqual(0);
        expect(c.score).toBeLessThanOrEqual(100);
        expect(c.paired).toBeGreaterThan(0);
      }
    }
  });

  it('gives each scheme page a reference sheet or a score for every row', () => {
    for (const scheme of lib.schemes) {
      const rows = schemePlayRows(scheme);
      expect(rows).toHaveLength(4);
      expect(rows.some((row) => row.referenceFor.length > 0), scheme.id).toBe(true);
    }
  });
});

describe('field windows', () => {
  it('keeps every player of every play in view for the whole play', () => {
    for (const concept of lib.dataset.concepts) {
      const p = play(concept.id);
      const win = fieldWindow([p], p.duration);
      expect(Math.abs(win.yLo % 5)).toBe(0);
      expect(Math.abs(win.yHi % 5)).toBe(0);
      expect(win.yHi - win.yLo).toBeGreaterThanOrEqual(25);
      for (const track of p.tracks) {
        for (let t = 0; t <= p.duration + 1e-9; t += 0.1) {
          const { x, y } = pos(track, t);
          expect(y, `${concept.id} ${track.id} at ${t.toFixed(1)} s`).toBeGreaterThanOrEqual(win.yLo);
          expect(y, `${concept.id} ${track.id} at ${t.toFixed(1)} s`).toBeLessThanOrEqual(win.yHi);
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(53.34);
        }
      }
    }
  });
});

describe('downloads and indexes', () => {
  it('lists exactly the CSV tables the release builds', () => {
    const built = buildTables(lib.dataset, 'test').map((table) => table.name);
    expect(CSV_TABLES.map(([name]) => name).sort()).toEqual([...built].sort());
  });

  it('lists every page in the sitemap and every scheme in llms.txt', () => {
    expect(sitePaths()).toHaveLength(4 + 45 + 180);
    const xml = sitemapXml('2026-11-01');
    for (const path of sitePaths()) expect(xml).toContain(`<loc>https://schemedb.harlanljones.com${path}</loc>`);
    const text = llmsTxt();
    for (const scheme of lib.schemes) expect(text).toContain(`https://schemedb.harlanljones.com/schemes/${scheme.id}/`);
    expect(text).toMatch(/hand/);
    expect(text).toMatch(/CC BY 4\.0/);
  });

  it('puts every play and its comparisons in llms-full.txt', () => {
    const text = llmsFullTxt();
    for (const concept of lib.dataset.concepts) expect(text).toContain(`/schemes/${concept.schemeId}/${concept.id}/`);
    expect(text).toContain('Compared with sheet 4, Jet Motion Outside Zone Left: 79% alike on average');
  });
});

describe('text helpers', () => {
  it('spells numbers without hyphens', () => {
    expect([spell(45), spell(8), spell(20), spell(100)]).toEqual(['forty five', 'eight', 'twenty', '100']);
    expect(capitalize(spell(45))).toBe('Forty five');
  });

  it('curls apostrophes inside words only', () => {
    expect(tidy("Kyle Shanahan's Wide Zone")).toBe('Kyle Shanahan’s Wide Zone');
  });
});

describe('robots.txt', () => {
  const robots = fs.readFileSync(path.join(process.cwd(), 'public/robots.txt'), 'utf-8');

  it('welcomes search and AI crawlers and points at the sitemap and llms files', () => {
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Googlebot', 'Bingbot', 'CCBot']) {
      expect(robots).toContain(`User-agent: ${bot}`);
    }
    expect(robots).toContain('Sitemap: https://schemedb.harlanljones.com/sitemap.xml');
    expect(robots).toContain('llms.txt');
  });
});
