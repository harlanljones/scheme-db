import { describe, expect, it } from 'vitest';
import { comparisonsFor, library } from '../../site/lib/data';
import { sitePaths } from '../../site/lib/seo';
import worker from '../index';
import { LEGACY_DEFAULT_PLAY, legacyRedirect, type LegacyLinks } from '../legacy';
import links from '../legacy-links.json';

const go = (search: string, pathname = '/'): string | null => legacyRedirect(new URL(`https://schemedb.harlanljones.com${pathname}${search}`));

describe('legacy-links.json', () => {
  const lib = library();
  const paths = new Set(sitePaths(lib));

  it('keeps at least the 45 schemes and 180 plays the old site linked to', () => {
    expect(Object.keys(links.schemes).length).toBeGreaterThanOrEqual(45);
    expect(Object.keys(links.plays).length).toBeGreaterThanOrEqual(180);
  });

  it('points every old scheme and play at a page that is still built', () => {
    const missing = [...Object.entries(links.schemes), ...Object.entries(links.plays)].filter(([, to]) => !paths.has(to)).map(([id, to]) => `${id} -> ${to}`);
    expect(missing, 'Point the old id at the page the record lives on now; never delete the entry.').toEqual([]);
  });

  it('can add #compare to every play, because every play page has that section', () => {
    const noSection: string[] = [];
    for (const [id, to] of Object.entries(links.plays)) {
      const [, , schemeId, conceptId] = to.split('/');
      const concept = lib.conceptById.get(conceptId);
      if (!concept || concept.schemeId !== schemeId || comparisonsFor(concept).length === 0) noSection.push(id);
    }
    expect(noSection).toEqual([]);
  });

  it('knows the play the old app opened on', () => {
    expect(links.plays).toHaveProperty(LEGACY_DEFAULT_PLAY);
  });
});

describe('legacyRedirect', () => {
  it('sends a play link to the play page', () => {
    expect(go('?play=outside-zone')).toBe('/schemes/shanahan-wide-zone/outside-zone/');
    expect(go('?scheme=kubiak-split-zone&play=split-zone-slice')).toBe('/schemes/kubiak-split-zone/split-zone-slice/');
  });

  it('sends every one of the 180 old play links, with and without the scheme, to its page', () => {
    for (const [id, to] of Object.entries(links.plays)) {
      expect(go(`?play=${id}`), id).toBe(to);
      expect(go(`?scheme=${to.split('/')[2]}&play=${id}`), id).toBe(to);
      expect(go(`?tab=visualizer&scheme=${to.split('/')[2]}&play=${id}`), id).toBe(to);
    }
  });

  it('sends every old scheme link to the scheme page', () => {
    for (const [id, to] of Object.entries(links.schemes)) expect(go(`?scheme=${id}`), id).toBe(to);
  });

  it('lets the play decide, as the old app did, even when the scheme disagrees', () => {
    expect(go('?scheme=air-raid&play=outside-zone')).toBe('/schemes/shanahan-wide-zone/outside-zone/');
  });

  it('falls back from an unknown play to the scheme, then to the home page', () => {
    expect(go('?scheme=kubiak-split-zone&play=no-such-play')).toBe('/schemes/kubiak-split-zone/');
    expect(go('?play=no-such-play')).toBe('/');
    expect(go('?scheme=no-such-scheme')).toBe('/');
    expect(go('?play=')).toBe('/');
    expect(go('?scheme=kubiak-split-zone&play=')).toBe('/schemes/kubiak-split-zone/');
  });

  it('treats an unknown tab as the visualizer', () => {
    expect(go('?tab=bogus&play=outside-zone')).toBe('/schemes/shanahan-wide-zone/outside-zone/');
    expect(go('?tab=Trees')).toBe('/');
    expect(go('?tab=')).toBe('/');
  });

  it('sends the list tabs to their lists, whatever else the URL says', () => {
    expect(go('?tab=directory')).toBe('/schemes/');
    expect(go('?tab=trees')).toBe('/lineages/');
    expect(go('?tab=directory&scheme=kubiak-split-zone&play=split-zone-slice')).toBe('/schemes/');
    expect(go('?tab=trees&scheme=kubiak-split-zone&play=split-zone-slice')).toBe('/lineages/');
  });

  it('sends the single-play tabs to the comparison on the play page', () => {
    expect(go('?tab=compare&scheme=kubiak-split-zone&play=split-zone-slice')).toBe('/schemes/kubiak-split-zone/split-zone-slice/#compare');
    expect(go('?tab=sequence-map&scheme=kubiak-split-zone&play=pa-dagger-shot')).toBe('/schemes/kubiak-split-zone/pa-dagger-shot/#compare');
    // Nothing chosen means the play the old app opened on.
    expect(go('?tab=sequence-map')).toBe('/schemes/shanahan-wide-zone/outside-zone/#compare');
    expect(go('?tab=compare')).toBe('/schemes/shanahan-wide-zone/outside-zone/#compare');
    // A scheme and no play lands on the scheme.
    expect(go('?tab=compare&scheme=kubiak-split-zone')).toBe('/schemes/kubiak-split-zone/');
  });

  it('keeps other parameters, and drops only the three old ones', () => {
    expect(go('?play=outside-zone&utm_source=linkedin&utm_medium=post')).toBe('/schemes/shanahan-wide-zone/outside-zone/?utm_source=linkedin&utm_medium=post');
    expect(go('?utm_source=linkedin&tab=trees&fbclid=abc')).toBe('/lineages/?utm_source=linkedin&fbclid=abc');
    expect(go('?tab=compare&play=outside-zone&ref=a')).toBe('/schemes/shanahan-wide-zone/outside-zone/?ref=a#compare');
  });

  it('uses the first value when a parameter repeats, like the old app', () => {
    expect(go('?play=outside-zone&play=play-action-over')).toBe('/schemes/shanahan-wide-zone/outside-zone/');
  });

  it('never sends a link to another old link, so it cannot loop', () => {
    const queries = ['?tab=visualizer', '?tab=trees&scheme=air-raid', '?play=bogus', '?tab=compare', '?scheme=x&play=y&tab=z&utm_source=a'];
    for (const query of queries) {
      const to = go(query)!;
      expect(legacyRedirect(new URL(to, 'https://schemedb.harlanljones.com')), query).toBeNull();
    }
    for (const id of Object.keys(links.plays)) {
      expect(legacyRedirect(new URL(go(`?tab=compare&play=${id}`)!, 'https://schemedb.harlanljones.com')), id).toBeNull();
    }
  });

  it('does not touch the home page without old parameters, or any other page', () => {
    expect(go('')).toBeNull();
    expect(go('?utm_source=linkedin')).toBeNull();
    expect(go('?play=outside-zone', '/schemes/')).toBeNull();
    expect(go('?tab=trees', '/about/')).toBeNull();
  });

  it('also answers /index.html', () => {
    expect(go('?play=outside-zone', '/index.html')).toBe('/schemes/shanahan-wide-zone/outside-zone/');
  });

  it('does not mistake names on Object.prototype for ids', () => {
    for (const name of ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf']) {
      expect(go(`?play=${name}`), name).toBe('/');
      expect(go(`?scheme=${name}`), name).toBe('/');
    }
  });

  it('uses the table it is given', () => {
    const table: LegacyLinks = { schemes: { a: '/schemes/a/' }, plays: { b: '/schemes/a/b/', [LEGACY_DEFAULT_PLAY]: '/schemes/a/b/' } };
    expect(legacyRedirect(new URL('https://x.test/?play=b'), table)).toBe('/schemes/a/b/');
    expect(legacyRedirect(new URL('https://x.test/?play=outside-zone'), table)).toBe('/schemes/a/b/');
    expect(legacyRedirect(new URL('https://x.test/?play=missing'), table)).toBe('/');
  });
});

describe('the Worker', () => {
  const asset = new Response('home page');
  const env = { ASSETS: { fetch: async () => asset } };
  const ask = (url: string, method = 'GET'): Promise<Response> => worker.fetch(new Request(url, { method }), env);

  it('answers an old link with a permanent redirect to an absolute URL', async () => {
    const response = await ask('https://schemedb.harlanljones.com/?scheme=kubiak-split-zone&play=split-zone-slice&utm_source=linkedin');
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe('https://schemedb.harlanljones.com/schemes/kubiak-split-zone/split-zone-slice/?utm_source=linkedin');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=86400');
  });

  it('redirects within the host it was asked on, so preview URLs stay on the preview', async () => {
    const response = await ask('https://scheme-db.example.workers.dev/?tab=trees');
    expect(response.headers.get('Location')).toBe('https://scheme-db.example.workers.dev/lineages/');
  });

  it('answers HEAD the same way', async () => {
    expect((await ask('https://schemedb.harlanljones.com/?play=outside-zone', 'HEAD')).status).toBe(301);
  });

  it('hands every other request to the static files untouched', async () => {
    expect(await ask('https://schemedb.harlanljones.com/')).toBe(asset);
    expect(await ask('https://schemedb.harlanljones.com/?utm_source=linkedin')).toBe(asset);
    expect(await ask('https://schemedb.harlanljones.com/?play=outside-zone', 'POST')).toBe(asset);
  });
});
