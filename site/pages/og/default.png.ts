import { siteImage } from '../../lib/og';

export async function GET() {
  return new Response(await siteImage(), { headers: { 'Content-Type': 'image/png' } });
}
