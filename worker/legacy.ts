/**
 * Redirects for the links the first version of SchemeDB handed out.
 *
 * That version was one page whose state lived in the query string of `/`:
 *
 *   /?play=outside-zone                         a play
 *   /?scheme=kubiak-split-zone                  a scheme (it opened on the scheme's first play)
 *   /?scheme=kubiak-split-zone&play=split-zone-slice
 *   /?tab=directory | trees | sequence-map | compare | visualizer
 *
 * Those URLs were shared on LinkedIn and GitHub and listed in the old sitemap.xml and llms.txt, so they keep
 * working: each answers with a 301 to the matching page of the Astro site. The rules follow what the old app did
 * with the same URL, so a link opens on the same thing it used to:
 *
 *  - `play` wins over `scheme` (the old app took the scheme from the play), and an unknown `play` falls back to
 *    the scheme, then to the home page, which opens on the same play the old app defaulted to.
 *  - An unknown `tab` meant the visualizer.
 *  - `directory` is the schemes list and `trees` is Lineages, whatever `scheme` and `play` say: the old app wrote
 *    those two into the URL as leftover state when you changed tab.
 *  - `compare` and `sequence-map` were views of one play against its partner, which is the "This play against"
 *    section of a play page. Without a play they opened on the default play; with only a scheme they land on the
 *    scheme page.
 *  - Any other parameter (utm_source, fbclid) rides along on the redirect.
 *
 * `legacy-links.json` is frozen: the 45 scheme ids and 180 play ids the old site could link to, taken from
 * `main` at 66abd8f on 2026-11-02, each with the path of its page now. Plays added since never had an old link,
 * so they are not in it. A test checks that every path still exists; if you rename or move a play, point its old
 * id at the new page here, and never delete an entry.
 */
import links from './legacy-links.json';

export interface LegacyLinks {
  /** Old scheme id to the path of the scheme page. */
  schemes: Record<string, string>;
  /** Old play id to the path of the play page. */
  plays: Record<string, string>;
}

/** The three query parameters the old app read. */
export const LEGACY_PARAMS = ['tab', 'scheme', 'play'] as const;

/** The play the old app opened on when the URL named none. */
export const LEGACY_DEFAULT_PLAY = 'outside-zone';

const TABS = ['visualizer', 'directory', 'trees', 'sequence-map', 'compare'] as const;
type Tab = (typeof TABS)[number];

/** A path on the old site that served the app. Everything else on the old site was a plain file. */
const APP_PATHS = new Set(['/', '/index.html']);

const lookup = (table: Record<string, string>, key: string | null): string | undefined => (key && Object.hasOwn(table, key) ? table[key] : undefined);

/**
 * Where a request for an old link should go, as a path with its query and fragment, or null if the URL is not an
 * old link and the site should answer it as it is.
 */
export function legacyRedirect(url: URL, table: LegacyLinks = links): string | null {
  if (!APP_PATHS.has(url.pathname)) return null;
  const params = url.searchParams;
  if (!LEGACY_PARAMS.some((name) => params.has(name))) return null;

  const requestedTab = params.get('tab');
  const tab: Tab = TABS.find((name) => name === requestedTab) ?? 'visualizer';
  const play = lookup(table.plays, params.get('play'));
  const scheme = lookup(table.schemes, params.get('scheme'));

  let target: string;
  switch (tab) {
    case 'directory':
      target = '/schemes/';
      break;
    case 'trees':
      target = '/lineages/';
      break;
    case 'compare':
    case 'sequence-map':
      target = play ? `${play}#compare` : (scheme ?? `${table.plays[LEGACY_DEFAULT_PLAY]}#compare`);
      break;
    case 'visualizer':
      target = play ?? scheme ?? '/';
      break;
  }

  const [path, hash = ''] = target.split('#');
  const rest = new URLSearchParams();
  for (const [name, value] of params) {
    if (!(LEGACY_PARAMS as readonly string[]).includes(name)) rest.append(name, value);
  }
  const query = rest.size > 0 ? `?${rest}` : '';
  return `${path}${query}${hash ? `#${hash}` : ''}`;
}
