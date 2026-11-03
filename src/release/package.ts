import type { Dataset } from '../schema/schema';

/** The files attached to a GitHub release, named for one version. */
export function releaseFileNames(version: string): { json: string; sqlite: string; csvZip: string; license: string; checksums: string } {
  return {
    json: `scheme-db-${version}.json`,
    sqlite: `scheme-db-${version}.sqlite`,
    csvZip: `scheme-db-${version}-csv.zip`,
    license: 'LICENSE.md',
    checksums: 'SHA256SUMS',
  };
}

/** The suggested credit line from the data license, so release notes and the license cannot disagree. */
export function parseCredit(licenseText: string): string {
  const match = licenseText.match(/Suggested credit: "([^"]+)"/);
  if (!match) throw new Error('data/LICENSE.md has no `Suggested credit: "..."` line.');
  return match[1];
}

/** `sha256sum` format: the digest, two spaces, the file name. Verifies with `sha256sum -c` next to the files. */
export function checksumLines(entries: { name: string; sha256: string }[]): string {
  return `${[...entries].sort((a, b) => (a.name < b.name ? -1 : 1)).map((e) => `${e.sha256}  ${e.name}`).join('\n')}\n`;
}

const plural = (n: number, one: string, many: string = `${one}s`): string => `${n} ${n === 1 ? one : many}`;

/** What the plays can be trusted for, in the same words the site uses. */
function confidenceSentence(dataset: Dataset): string {
  const total = dataset.concepts.length;
  const count = (level: string): number => dataset.concepts.filter((c) => c.provenance.confidence === level).length;
  const illustrative = count('illustrative');
  if (illustrative === total) return `All ${total} plays are labeled illustrative: drawn by hand to show how a scheme works, not tracking data.`;
  return `${illustrative} of ${total} plays are labeled illustrative (drawn by hand, not tracking data). The other ${total - illustrative} cite their sources: ${count('reconstructed')} reconstructed and ${count('verified')} verified.`;
}

/** The body of a GitHub release, built from the data being released so it cannot go stale. */
export function releaseNotes(dataset: Dataset, version: string, credit: string, csvTables: number): string {
  const files = releaseFileNames(version);
  return `${[
    `# Scheme DB data ${version}`,
    '',
    `${plural(dataset.schemes.length, 'scheme')}, ${plural(dataset.concepts.length, 'play')}, ${plural(dataset.coaches.length, 'coach', 'coaches')}, ${plural(dataset.lineages.length, 'coaching lineage')} and ${plural(dataset.glossary.length, 'glossary term')}.`,
    '',
    confidenceSentence(dataset),
    '',
    '## Files',
    '',
    `- \`${files.json}\`: every record, nested as in the repository's \`data/\` folder.`,
    `- \`${files.sqlite}\`: the same tables with primary keys, ready to query.`,
    `- \`${files.csvZip}\`: ${plural(csvTables, 'flat CSV table')}, including every player's position at 10 frames a second.`,
    `- \`${files.license}\`: the data license.`,
    `- \`${files.checksums}\`: SHA-256 checksums of the four files above.`,
    '',
    'To check a download, put the files in one folder and run `sha256sum -c SHA256SUMS` (on macOS, `shasum -a 256 -c SHA256SUMS`).',
    '',
    '## License',
    '',
    `The data is CC BY 4.0. Credit: ${credit}. If you changed the data, say so.`,
  ].join('\n')}\n`;
}
