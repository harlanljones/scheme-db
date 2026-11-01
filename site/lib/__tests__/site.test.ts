import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTables } from '../../../src/release/tables';
import { fieldWindow, pos, type LitePlay } from '../field';
import { capitalize, spell, tidy } from '../format';
import { FEATURED, comparisonsFor, disciplesOf, library, litePlay, mentorChain, playHref, relatedPlays, schemePlayRows, schemeRows } from '../data';
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
      ['play-action-over', 95, 89, null],
      ['naked-bootleg', 95, 89, null],
      ['jet-motion-oz', 71, 48, 0.4],
    ]);
  });

  it('names the offensive players more than a yard from outside zone at 1.2 s against play action', () => {
    const pa = comparisons.find((c) => c.id === 'play-action-over')!;
    // Only the offense is scored, so the cornerback who also stands 1.3 yd apart does not count.
    expect(pa.gapDetails.map((g) => g.id)).toEqual(['Z', 'X']);
    expect(pa.gapDetails.map((g) => Math.round(g.yards * 10) / 10)).toEqual([4.6, 2.9]);
    expect(comparisons.find((c) => c.id === 'jet-motion-oz')!.gapsAtEnd).toHaveLength(2);
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
    // One assertion at the end: thousands of expect() calls take long enough to time out on a CI runner.
    const problems: string[] = [];
    for (const concept of lib.dataset.concepts) {
      const p = play(concept.id);
      const win = fieldWindow([p], p.duration);
      if (win.yLo % 5 !== 0 || win.yHi % 5 !== 0) problems.push(`${concept.id}: window ${win.yLo} to ${win.yHi} is not on a five yard line`);
      if (win.yHi - win.yLo < 25) problems.push(`${concept.id}: window is only ${win.yHi - win.yLo} yd tall`);
      for (const track of p.tracks) {
        for (let t = 0; t <= p.duration + 1e-9; t += 0.1) {
          const { x, y } = pos(track, t);
          if (y < win.yLo || y > win.yHi) problems.push(`${concept.id} ${track.id} at ${t.toFixed(1)} s: y ${y.toFixed(1)} is outside the window`);
          if (x < 0 || x > 53.34) problems.push(`${concept.id} ${track.id} at ${t.toFixed(1)} s: x ${x.toFixed(1)} is off the field`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('downloads and indexes', () => {
  it('lists exactly the CSV tables the release builds', () => {
    const built = buildTables(lib.dataset, 'test').map((table) => table.name);
    expect(CSV_TABLES.map(([name]) => name).sort()).toEqual([...built].sort());
  });

  it('lists every page in the sitemap and every scheme in llms.txt', () => {
    expect(sitePaths()).toHaveLength(5 + 45 + 180);
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
    expect(text).toContain('Compared with sheet 4, Jet Motion Outside Zone Left: 71% alike on average');
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

describe('where each play stands on the field', () => {
  const level = (conceptId: string) => play(conceptId).level;
  it('draws college schemes on college hash marks and the rest on NFL hash marks', () => {
    for (const scheme of lib.schemes) {
      const expected = scheme.era === 'current-college' || scheme.era === 'past-college' ? 'college' : 'nfl';
      for (const p of scheme.plays) expect(level(p.id), p.id).toBe(expected);
    }
  });

  it('spots the ball on the hash a concept names and in the middle otherwise', () => {
    expect(play('t2-cloud-boundary').spot).toBe('left');
    expect(play('shula-boundary-creeper-drop7').spot).toBe('right');
    expect(play('outside-zone').spot).toBe('middle');
    const named = lib.dataset.concepts.filter((c) => c.ballSpot).map((c) => c.id);
    expect(named).toHaveLength(5);
  });

  it('scores the side the scheme belongs to', () => {
    for (const scheme of lib.schemes) for (const p of scheme.plays) expect(play(p.id).scored, p.id).toBe(scheme.side);
  });
});

describe('scheme search rows', () => {
  const rows = schemeRows();
  it('carries every play of every scheme with text a search can look through', () => {
    expect(rows).toHaveLength(45);
    for (const row of rows) {
      expect(row.plays, row.id).toHaveLength(4);
      for (const p of row.plays) expect(p.hay, p.id).toBe(p.hay.toLowerCase());
    }
  });

  it('finds a scheme by a play name that the scheme and coach names do not hold', () => {
    const hits = rows.filter((row) => row.plays.some((p) => p.hay.includes('bootleg')));
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((row) => !`${row.name} ${row.coach} ${row.team}`.toLowerCase().includes('bootleg'))).toBe(true);
  });
});

describe('who worked under whom', () => {
  it('follows mentor ids up the chain, oldest first, and ends at a person with no record', () => {
    const chain = mentorChain('sean-mcvay');
    expect(chain.map((p) => p.id)).toEqual(['george-seifert', 'mike-shanahan']);
    // George Seifert has no coach record, so the chain ends with his name and no page.
    expect(chain.map((p) => p.known)).toEqual([false, true]);
  });

  it('names people without a record from their id and gives them no page', () => {
    const bowles = mentorChain('todd-bowles');
    expect(bowles).toHaveLength(1);
    expect(bowles[0]).toMatchObject({ id: 'bruce-arians', name: 'Bruce Arians', known: false });
    expect(bowles[0]!.href).toBeUndefined();
  });

  it('links people who have a record to their first scheme', () => {
    const reid = lib.coachById.get('andy-reid')!;
    const harbaugh = disciplesOf(reid).find((p) => p.id === 'john-harbaugh')!;
    expect(harbaugh.known).toBe(true);
    expect(harbaugh.href).toMatch(/^\/schemes\//);
  });

  it('keeps the corrected mentors', () => {
    expect(lib.coachById.get('andy-reid')!.mentorId).toBe('mike-holmgren');
    expect(lib.coachById.get('mike-shanahan')!.mentorId).toBe('george-seifert');
    expect(lib.coachById.get('ben-johnson')!.mentorId).toBe('dan-campbell');
    expect(lib.coachById.get('steve-spagnuolo')!.mentorId).toBe('jim-johnson');
    expect(lib.coachById.get('chris-shula')!.mentorId).toBeUndefined();
    expect(lib.coachById.get('chip-kelly')!.mentorId).toBeUndefined();
  });
});
