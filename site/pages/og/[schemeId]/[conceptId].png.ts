import { library } from '../../../lib/data';
import { playImage } from '../../../lib/og';

export function getStaticPaths() {
  return library().schemes.flatMap((scheme) => scheme.plays.map((play) => ({ params: { schemeId: scheme.id, conceptId: play.id } })));
}

export async function GET({ params }: { params: { schemeId: string; conceptId: string } }) {
  return new Response(await playImage(params.schemeId, params.conceptId), { headers: { 'Content-Type': 'image/png' } });
}
