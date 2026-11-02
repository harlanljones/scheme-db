/**
 * The site is static files served by Cloudflare; this Worker exists for one job. Links from the first version of
 * SchemeDB (`/?play=outside-zone`) differ from the home page only by their query string, which a static redirects
 * file cannot match, so `wrangler.jsonc` runs the Worker first for `/` and it sends those links to their new page
 * with a 301. Everything else, including `/` with no old parameters, goes straight on to the static files.
 * The rules are in `legacy.ts`.
 */
import { legacyRedirect } from './legacy';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'GET' || request.method === 'HEAD') {
      const url = new URL(request.url);
      const to = legacyRedirect(url);
      if (to) {
        // A day is long enough to spare the Worker repeat visits and short enough to correct a mistake.
        return new Response(null, { status: 301, headers: { Location: new URL(to, url).href, 'Cache-Control': 'public, max-age=86400' } });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
