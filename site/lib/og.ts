/**
 * Share images: one 1200 by 630 PNG per play and one for the site, drawn at build time.
 *
 * Satori lays the image out and turns the text into outlines from the same fonts the site uses; resvg draws the
 * PNG. Both run only while the site builds. Nothing here ships to the browser, and the images are plain files.
 * Each play's image shows the field at 1.2 s after the snap, the moment the disguise score ends, and says in
 * words that the play is an illustration.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { HASHES, ballX, spotOffset } from '../../src/engine/field';
import { FIELD_WIDTH_YARDS, fieldWindow, pos, type LitePlay } from './field';
import { FEATURED, SITE, library, litePlayById } from './data';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** The paper palette of the light theme. Share images are always light. */
const C = {
  bg: '#f3ede0',
  s1: '#ebe4d3',
  rule: '#c7bca2',
  rule2: '#8e8471',
  fg: '#1b1812',
  fg2: '#4b463c',
  off: '#a84a05',
  def: '#1f5bb0',
};

const FIELD_W = 520;
const PAD = 56;
/** Height inside the padding and the 2 px frame. */
const INNER_H = OG_HEIGHT - 2 * PAD - 4;
const SNAP_T = 1.2;

const fontDir = (pkg: string): string => path.join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files');
const font = (pkg: string, file: string): Buffer => fs.readFileSync(path.join(fontDir(pkg), file));

let fonts: Array<{ name: string; data: Buffer; weight: 400 | 500 | 600 | 700; style: 'normal' }> | undefined;
function loadFonts() {
  fonts ??= [
    { name: 'Zilla Slab', data: font('zilla-slab', 'zilla-slab-latin-700-normal.woff'), weight: 700, style: 'normal' },
    { name: 'Zilla Slab', data: font('zilla-slab', 'zilla-slab-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Libre Franklin', data: font('libre-franklin', 'libre-franklin-latin-500-normal.woff'), weight: 500, style: 'normal' },
    { name: 'Courier Prime', data: font('courier-prime', 'courier-prime-latin-400-normal.woff'), weight: 400, style: 'normal' },
  ];
  return fonts;
}

type Style = Record<string, string | number>;
interface El {
  type: string;
  props: { style: Style; children?: unknown };
}
const h = (style: Style, ...children: unknown[]): El => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
});

/** The field at 1.2 s: yard lines, the line of scrimmage, hash marks, the ball and every player. */
function field(play: LitePlay, t: number): El {
  const win = fieldWindow([play], t);
  const height = win.yHi - win.yLo;
  const H = Math.round((FIELD_W * height) / FIELD_WIDTH_YARDS);
  const px = (x: number): number => (x / FIELD_WIDTH_YARDS) * FIELD_W;
  const py = (y: number): number => ((win.yHi - y) / height) * H;
  const ox = spotOffset(play.level, play.spot);
  const parts: El[] = [];

  for (let y = Math.ceil(win.yLo / 5) * 5; y <= win.yHi; y += 5) {
    parts.push(h({ position: 'absolute', left: 0, top: py(y) - (y === 0 ? 1.5 : 0.5), width: FIELD_W, height: y === 0 ? 3 : 1, background: y === 0 ? C.fg : C.rule }));
  }
  const hashes = HASHES[play.level];
  for (const x of [hashes.left, hashes.right]) {
    for (let y = Math.ceil(win.yLo); y <= win.yHi; y += 1) {
      parts.push(h({ position: 'absolute', left: px(x) - 3, top: py(y), width: 6, height: 1, background: C.rule2 }));
    }
  }
  // The ball sits on the line of scrimmage at its spot.
  parts.push(h({ position: 'absolute', left: px(ballX(play.level, play.spot)) - 7, top: py(0) - 4, width: 14, height: 8, borderRadius: 4, background: C.fg }));

  const R = 9;
  for (const track of play.tracks) {
    const p = pos(track, t);
    const left = px(p.x + ox) - R;
    const top = py(p.y) - R;
    parts.push(
      track.side === 'offense'
        ? h({ position: 'absolute', left, top, width: R * 2, height: R * 2, borderRadius: R, background: C.off })
        : // A ring is a blue disc with a paper disc inside it, which draws round in every renderer.
          h({ position: 'absolute', left, top, width: R * 2, height: R * 2, borderRadius: R, background: C.def }, h({ position: 'absolute', left: 3, top: 3, width: R * 2 - 6, height: R * 2 - 6, borderRadius: R - 3, background: C.s1 })),
    );
  }
  return h({ position: 'relative', width: FIELD_W, height: H, background: C.s1, border: `1px solid ${C.rule}`, overflow: 'hidden' }, ...parts);
}

const mono = (size: number, extra: Style = {}): Style => ({ fontFamily: 'Courier Prime', fontSize: size, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.fg2, whiteSpace: 'nowrap', ...extra });

function card(opts: { eyebrow: string; title: string; sub: string; foot: string; play: LitePlay }): El {
  const long = opts.title.length > 34;
  const left = h(
    { flexDirection: 'column', justifyContent: 'space-between', width: 544, height: INNER_H },
    h({ flexDirection: 'column', gap: 22 }, h(mono(20), opts.eyebrow), h({ fontFamily: 'Zilla Slab', fontWeight: 700, fontSize: long ? 50 : 62, lineHeight: 1.08, color: C.fg }, opts.title), h({ fontFamily: 'Libre Franklin', fontWeight: 500, fontSize: 26, lineHeight: 1.35, color: C.fg2 }, opts.sub)),
    h({ flexDirection: 'column', gap: 10 }, h({ fontFamily: 'Libre Franklin', fontWeight: 500, fontSize: 21, lineHeight: 1.4, color: C.fg2 }, opts.foot), h(mono(18, { color: C.fg }), new URL(SITE.url).host)),
  );
  const right = h(
    { flexDirection: 'column', gap: 14, justifyContent: 'center', height: INNER_H },
    field(opts.play, SNAP_T),
    h({ justifyContent: 'space-between', width: FIELD_W }, h(mono(14), `${SNAP_T.toFixed(1)} s after the snap`), h(mono(14), 'Filled offense, ringed defense')),
  );
  return h({ width: OG_WIDTH, height: OG_HEIGHT, background: C.bg, padding: PAD, gap: 40, alignItems: 'stretch', border: `2px solid ${C.fg}` }, left, right);
}

async function png(root: El): Promise<Uint8Array> {
  const svg = await satori(root as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts: loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
}

/** The share image of one play. */
export async function playImage(schemeId: string, conceptId: string): Promise<Uint8Array> {
  const lib = library();
  const scheme = lib.schemeById.get(schemeId)!;
  const play = lib.conceptById.get(conceptId)!;
  const lite = litePlayById(conceptId);
  return png(
    card({
      eyebrow: `Sheet ${play.order} of ${scheme.plays.length} · ${scheme.side === 'offense' ? 'Offense' : 'Defense'}`,
      title: lite.name,
      sub: `${scheme.nameDisplay}. ${scheme.coachName}, ${scheme.teamDisplay}.`,
      foot: 'An illustration drawn by hand to show how the scheme works. Not tracking data.',
      play: lite,
    }),
  );
}

/** The share image of every page that is not a play. */
export async function siteImage(): Promise<Uint8Array> {
  const lib = library();
  return png(
    card({
      eyebrow: 'SchemeDB · Free and open',
      title: 'The football scheme database',
      sub: `${lib.counts.schemes} schemes and ${lib.counts.plays} illustrative plays, with the data to download.`,
      foot: `Data ${SITE.dataLicense}. Every play is an illustration, not tracking data.`,
      play: litePlayById(FEATURED.conceptId),
    }),
  );
}
