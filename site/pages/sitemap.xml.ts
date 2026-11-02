import { sitemapXml } from '../lib/seo';

export function GET() {
  return new Response(sitemapXml(new Date().toISOString().slice(0, 10)), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
