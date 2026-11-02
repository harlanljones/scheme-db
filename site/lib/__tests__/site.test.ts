import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTables } from '../../../src/release/tables';
import { fieldWindow, pos, type LitePlay } from '../field';
import { capitalize, nameFromId, spell, tidy } from '../format';
import {
  FEATURED,
  allIllustrative,
  coachRows,
  coachViews,
  comparisonsFor,
  disciplesOf,
  downOf,
  library,
  litePlay,
  mentorChain,
  namedOnly,
  personnelShort,
  playHref,
  playPhrase,
  playRows,
  playsNoun,
  playsPerSchemeWords,
  relatedPlays,
  schemePlayRows,
  schemeRows,
  situationShort,
  trustNotice,
  type Library,
} from '../data';
import { CSV_TABLES } from '../downloads';
import { llmsFullTxt, llmsTxt, sitePaths, sitemapXml } from '../seo';

const lib = library();
const play = (id: string): LitePlay => litePlay(lib.conceptById.get(id)!, lib.tracksById.get(id)!);

describe('the library the pages read', () => {
  it('counts what the home page says, and the library only grows from its launch size', () => {
    const { dataset } = lib;
    expect(lib.counts).toEqual({
      schemes: dataset.schemes.length,
      plays: dataset.concepts.length,
      coaches: dataset.coaches.length,
      lineages: dataset.lineages.length,
      terms: dataset.glossary.length,
    });
    // Launch: 45 schemes, 180 plays, 53 coaches, 17 lineages, 30 terms. A drop means records went missing.
    expect(lib.counts.schemes).toBeGreaterThanOrEqual(45);
    expect(lib.counts.plays).toBeGreaterThanOrEqual(180);
    expect(lib.counts.coaches).toBeGreaterThanOrEqual(53);
    expect(lib.counts.lineages).toBeGreaterThanOrEqual(17);
    expect(lib.counts.terms).toBeGreaterThanOrEqual(30);
  });

  it('counts plays by confidence', () => {
    const { illustrative, reconstructed, verified } = lib.confidence;
    expect(illustrative + reconstructed + verified).toBe(lib.counts.plays);
    expect(lib.playsPerScheme.min).toBeGreaterThanOrEqual(1);
    expect(lib.playsPerScheme.max).toBeGreaterThanOrEqual(lib.playsPerScheme.min);
  });

  it('numbers the contents in coach surname order', () => {
    expect(lib.schemes.map((s) => s.no)).toEqual(Array.from({ length: lib.counts.schemes }, (_, i) => i + 1));
    const surnames = lib.schemes.map((s) => s.coachName.split(' ').pop()!.toLowerCase());
    expect(surnames).toEqual([...surnames].sort((a, b) => a.localeCompare(b)));
  });

  it('gives every scheme its plays in order from 1, with a page each', () => {
    for (const scheme of lib.schemes) {
      expect(scheme.plays.map((p) => p.order)).toEqual(scheme.plays.map((_, i) => i + 1));
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

  it('gives every play at least one comparison inside its own scheme', () => {
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
      expect(rows).toHaveLength(scheme.plays.length);
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
    const paths = sitePaths();
    const under = (pattern: RegExp): number => paths.filter((path) => pattern.test(path)).length;
    expect(under(/^\/schemes\/[^/]+\/$/)).toBe(lib.counts.schemes);
    expect(under(/^\/schemes\/[^/]+\/[^/]+\/$/)).toBe(lib.counts.plays);
    expect(under(/^\/coaches\/[^/]+\/$/)).toBe(lib.counts.coaches);
    expect(new Set(paths).size).toBe(paths.length);
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

describe('what the site says about trust', () => {
  const withConfidence = (confidence: Library['confidence'], perScheme = lib.playsPerScheme): Library => ({ ...lib, confidence, playsPerScheme: perScheme });
  const launch = withConfidence({ illustrative: lib.counts.plays, reconstructed: 0, verified: 0 });
  const mixed = withConfidence({ illustrative: lib.counts.plays - 3, reconstructed: 2, verified: 1 });

  it('says all plays are illustrative while they are', () => {
    expect(allIllustrative(launch)).toBe(true);
    expect(playsNoun(launch)).toBe('illustrative plays');
    expect(trustNotice(launch).lead).toBe(`All ${lib.counts.plays} plays are illustrative.`);
  });

  it('counts the illustrative plays once others cite sources, and stops calling every play illustrative', () => {
    expect(allIllustrative(mixed)).toBe(false);
    expect(playsNoun(mixed)).toBe('plays');
    const notice = trustNotice(mixed);
    expect(notice.lead).toBe(`${lib.counts.plays - 3} of ${lib.counts.plays} plays are illustrative.`);
    expect(notice.rest).toMatch(/cite their sources/);
  });

  it('names how many plays a scheme has only as far as the data supports', () => {
    expect(playsPerSchemeWords(withConfidence(lib.confidence, { min: 4, max: 4 }))).toBe('four');
    expect(playsPerSchemeWords(withConfidence(lib.confidence, { min: 4, max: 6 }))).toBe('four to six');
  });

  it('puts the right article before each confidence level', () => {
    expect(playPhrase('illustrative')).toBe('an illustrative play');
    expect(playPhrase('reconstructed')).toBe('a reconstructed play');
    expect(playPhrase('verified')).toBe('a verified play');
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
    for (const concept of lib.dataset.concepts.filter((c) => c.ballSpot)) expect(play(concept.id).spot, concept.id).toBe(concept.ballSpot);
  });

  it('scores the side the scheme belongs to', () => {
    for (const scheme of lib.schemes) for (const p of scheme.plays) expect(play(p.id).scored, p.id).toBe(scheme.side);
  });
});

describe('scheme search rows', () => {
  const rows = schemeRows();
  it('carries every play of every scheme with text a search can look through', () => {
    expect(rows).toHaveLength(lib.counts.schemes);
    for (const row of rows) {
      expect(row.plays, row.id).toHaveLength(lib.schemeById.get(row.id)!.plays.length);
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
  it('follows mentor ids up the chain, oldest first, and ends at a person with no record or no mentor', () => {
    for (const coach of lib.dataset.coaches) {
      const chain = mentorChain(coach.id);
      expect(chain.length > 0, coach.id).toBe(!!coach.mentorId);
      if (coach.mentorId) expect(chain.at(-1)!.id, coach.id).toBe(coach.mentorId);
      expect(new Set(chain.map((p) => p.id)).size, coach.id).toBe(chain.length);
      // Only the oldest person in a chain can lack a record, because a person with no record has no mentor to follow.
      for (const person of chain.slice(1)) expect(person.known, `${coach.id} via ${person.id}`).toBe(true);
    }
  });

  it('names people without a record from their id and gives them no page', () => {
    // Empty once every mentor has a record, which is the goal.
    const missing = lib.dataset.coaches.filter((c) => c.mentorId && !lib.coachById.has(c.mentorId));
    for (const coach of missing) {
      const oldest = mentorChain(coach.id)[0];
      expect(oldest).toMatchObject({ id: coach.mentorId, name: nameFromId(coach.mentorId!), known: false });
      expect(oldest.href).toBeUndefined();
    }
  });

  it('links people who have a record to their coach page', () => {
    const reid = lib.coachById.get('andy-reid')!;
    const harbaugh = disciplesOf(reid).find((p) => p.id === 'john-harbaugh')!;
    expect(harbaugh.known).toBe(true);
    expect(harbaugh.href).toBe('/coaches/john-harbaugh/');
  });
});

describe('the plays list', () => {
  const rows = playRows();
  it('lists every play once, in contents order, linking to its page', () => {
    expect(rows).toHaveLength(lib.counts.plays);
    expect(new Set(rows.map((r) => r.id)).size).toBe(lib.counts.plays);
    expect(rows.map((r) => r.key)).toEqual([...rows.map((r) => r.key)].sort());
    for (const row of rows) {
      const concept = lib.conceptById.get(row.id)!;
      expect(row.href).toBe(playHref(concept.schemeId, concept.id));
      expect(row.hay).toBe(row.hay.toLowerCase());
    }
  });

  it('reads the down from every situation', () => {
    expect(rows.filter((r) => r.down === 'other')).toEqual([]);
    expect(downOf('3rd & Goal from the 6, red zone')).toBe('3rd');
    expect(downOf('Two minute drill')).toBe('other');
    expect(situationShort('2nd & 2, +45, play action shot down')).toBe('2nd & 2');
  });

  it('drops the explanation in brackets from a personnel group', () => {
    expect(personnelShort('Okie/Bear Package (5 DL, 2 LB, 4 DB)')).toBe('Okie/Bear Package');
    expect(personnelShort('11')).toBe('11');
  });
});

describe('the coaches list', () => {
  const coaches = coachViews();
  it('gives every coach a page, numbered by surname', () => {
    expect(coaches).toHaveLength(lib.counts.coaches);
    expect(coaches.map((c) => c.no)).toEqual(Array.from({ length: lib.counts.coaches }, (_, i) => i + 1));
    for (const coach of coaches) expect(coach.href).toBe(`/coaches/${coach.id}/`);
  });

  it('links each coach to the schemes the data credits them with', () => {
    for (const scheme of lib.schemes) {
      expect(coaches.find((c) => c.id === scheme.coachId)?.schemes.map((s) => s.id), scheme.id).toContain(scheme.id);
    }
    for (const coach of coaches) {
      for (const scheme of coach.schemes) expect(scheme.coachId).toBe(coach.id);
      for (const scheme of coach.linked) expect(scheme.coachId).not.toBe(coach.id);
    }
    for (const coach of coaches.filter((c) => c.schemes.length === 0 && c.linked.length === 0)) {
      expect(coachRows().find((r) => r.id === coach.id)?.eraLabel, coach.id).toBe('Lineage only');
    }
    // Bill Walsh runs his own scheme and is linked to Kyle Shanahan's; his era comes from his own.
    const walsh = coaches.find((c) => c.id === 'bill-walsh')!;
    expect(walsh.schemes.map((s) => s.id)).toEqual(['walsh-classic-wco']);
    expect(walsh.linked.map((s) => s.id)).toEqual(['shanahan-wide-zone']);
    expect(walsh.eras).toEqual(['past-nfl']);
  });

  it('names the people mentioned in coach records who have no record', () => {
    // Empty once every named person has a record, which is the goal.
    const named = namedOnly();
    for (const person of named) {
      expect(person.known).toBe(false);
      expect(lib.coachById.has(person.id)).toBe(false);
      expect(person.namedBy.length).toBeGreaterThan(0);
    }
  });
});
