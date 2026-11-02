/**
 * Machine readable indexes of the site: sitemap.xml, llms.txt and llms-full.txt. All three are built from `data/`
 * at build time, so they list the same pages and say the same things as the site.
 */
import { DISGUISE_HOLD_PERCENT, SITE, comparisonsFor, library, playHref, type Library } from './data';
import { tidy } from './format';

const abs = (path: string): string => new URL(path, SITE.url).toString();

/** Every page the site builds, as paths. */
export function sitePaths(lib: Library = library()): string[] {
  return [
    '/',
    '/schemes/',
    '/lineages/',
    '/about/',
    '/data/',
    ...lib.schemes.flatMap((scheme) => [scheme.href, ...scheme.plays.map((play) => play.href)]),
  ];
}

export function sitemapXml(date: string, lib: Library = library()): string {
  const priority = (path: string): string => (path === '/' ? '1.0' : path.split('/').filter(Boolean).length === 1 ? '0.9' : path.split('/').filter(Boolean).length === 2 ? '0.7' : '0.6');
  const urls = sitePaths(lib).map((path) => `  <url>\n    <loc>${abs(path)}</loc>\n    <lastmod>${date}</lastmod>\n    <priority>${priority(path)}</priority>\n  </url>`);
  const files = ['/llms.txt', '/llms-full.txt'].map((path) => `  <url>\n    <loc>${abs(path)}</loc>\n    <lastmod>${date}</lastmod>\n    <priority>0.5</priority>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls, ...files].join('\n')}\n</urlset>\n`;
}

const intro = (lib: Library): string =>
  `A free, open database of football scheme strategy: ${lib.counts.schemes} schemes, ${lib.counts.plays} plays, ${lib.counts.coaches} coaches and ${lib.counts.lineages} coaching lineages. ` +
  `Every play is an illustration drawn by hand to show how a scheme works. None is a record of a snap or comes from tracking data. ` +
  `The data is ${SITE.dataLicense} (credit SchemeDB) and the code is ${SITE.codeLicense}.`;

export function llmsTxt(lib: Library = library()): string {
  const lines: string[] = ['# SchemeDB', '', `> ${intro(lib)}`, ''];
  lines.push('## Start here', '');
  lines.push(`- [The schemes](${abs('/schemes/')}): all ${lib.counts.schemes}, by coach`);
  lines.push(`- [Lineages](${abs('/lineages/')}): who worked under whom, and how schemes passed on`);
  lines.push(`- [About and method](${abs('/about/')}): what illustrative means, how plays are drawn, how the similarity score works`);
  lines.push(`- [Data](${abs('/data/')}): downloads, schema and how to cite`);
  lines.push('', '## Downloads', '');
  lines.push(`- [Everything as JSON](${abs('/downloads/scheme-db.json')})`);
  lines.push(`- [SQLite database](${abs('/downloads/scheme-db.sqlite')})`);
  lines.push(`- [CSV tables](${abs('/data/#csv')})`);
  lines.push(`- [Full text version of this site](${abs('/llms-full.txt')})`);
  lines.push('', '## Schemes', '');
  for (const scheme of lib.schemes) {
    lines.push(`- [${scheme.nameDisplay}](${abs(scheme.href)}): ${scheme.coachName}, ${scheme.teamDisplay}. ${scheme.side === 'offense' ? 'Offense' : 'Defense'}, ${scheme.eraLabel.toLowerCase()}.`);
  }
  lines.push('', '## Credit', '', `Suggested credit: ${SITE.credit}`, '');
  return lines.join('\n');
}

export function llmsFullTxt(lib: Library = library()): string {
  const out: string[] = ['# SchemeDB, full text', '', `> ${intro(lib)}`, ''];
  out.push(
    '## How to read the scores',
    '',
    `Similarity compares where players stand in two plays at each tenth of a second from the snap to 1.2 s. A mean gap of 0 yards scores 100 and a gap of 6 yards or more scores 0. The ${DISGUISE_HOLD_PERCENT}% line is SchemeDB's own cutoff for plays that still look alike. It has not been tested against real defenders. Method: ${abs('/about/#similarity')}`,
    '',
  );
  for (const scheme of lib.schemes) {
    const coach = lib.coachById.get(scheme.coachId);
    out.push(`## ${scheme.nameDisplay}`, '');
    out.push(`- Page: ${abs(scheme.href)}`);
    out.push(`- Coach: ${scheme.coachName}${coach ? ` (${tidy(coach.role2026)})` : ''}`);
    out.push(`- Team: ${scheme.teamDisplay}`);
    out.push(`- Side and era: ${scheme.side === 'offense' ? 'Offense' : 'Defense'}, ${scheme.eraLabel}`);
    out.push('', tidy(scheme.description), '');
    for (const play of scheme.plays) {
      out.push(`### Sheet ${play.order}: ${play.nameDisplay}`, '');
      out.push(`- Page: ${abs(playHref(scheme.id, play.id))}`);
      out.push(`- Formation: ${tidy(play.formation)}. Personnel: ${play.personnel}. Front: ${play.frontName}. Coverage: ${play.coverage}.`);
      out.push(`- Situation: ${play.situation}`);
      out.push(`- Motive: ${play.summary.motive}`);
      out.push(`- Key defender: ${play.summary.keyDefender}`);
      out.push(`- Why it works: ${play.summary.whyItWorks}`);
      out.push(`- Failure mode: ${play.summary.failureMode}`);
      for (const comparison of comparisonsFor(play)) {
        out.push(
          `- Compared with sheet ${comparison.order}, ${comparison.name}: ${comparison.score}% alike on average over the first 1.2 s, ${comparison.atEnd}% at 1.2 s` +
            (comparison.breakSeconds === null ? `, above the ${DISGUISE_HOLD_PERCENT}% line throughout.` : `, below the ${DISGUISE_HOLD_PERCENT}% line from ${comparison.breakSeconds.toFixed(1)} s.`),
        );
      }
      out.push('', 'Coaching points:', '');
      for (const beat of play.beats) out.push(`${beat.t.toFixed(1)} s, ${beat.title.replace(/^\d+\.\s*/, '')}: ${beat.text}`);
      out.push('');
    }
  }
  out.push('## Credit', '', `Suggested credit: ${SITE.credit}`, '');
  return out.join('\n');
}
