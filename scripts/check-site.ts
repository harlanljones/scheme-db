/**
 * Checks the built site in dist/ (run after `bun run build`):
 *
 *   bun run site:check
 *
 * Every page has a title, a description, one h1 and a canonical link; no page prints a stray "undefined", "NaN" or
 * "[object"; every internal link and every referenced file exists; the page count matches the data.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadDataset } from '../src/schema/load';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ does not exist. Run `bun run build` first.');
  process.exit(1);
}

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const files = walk(dist);
const pages = files.filter((f) => f.endsWith('.html'));

const { dataset } = loadDataset();
const expectedPages = 5 + dataset.schemes.length + dataset.concepts.length + 1; // home, schemes, lineages, about, data, schemes, plays, 404

const problems: string[] = [];
const rel = (file: string): string => path.relative(dist, file);

if (pages.length !== expectedPages) problems.push(`Expected ${expectedPages} pages, found ${pages.length}.`);

const exists = (urlPath: string): boolean => {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  const target = path.join(dist, clean);
  if (!target.startsWith(dist)) return false;
  if (clean.endsWith('/')) return fs.existsSync(path.join(target, 'index.html'));
  return fs.existsSync(target) && fs.statSync(target).isFile();
};

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf-8');
  const name = rel(file);
  const is404 = name === '404.html';
  if (!/<title>[^<]{3,}<\/title>/.test(html)) problems.push(`${name}: missing title`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) problems.push(`${name}: missing description`);
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) problems.push(`${name}: expected exactly one h1`);
  if (!is404 && !/<link rel="canonical" href="https:\/\/schemedb\.harlanljones\.com\//.test(html)) problems.push(`${name}: missing canonical link`);
  const share = html.match(/<meta property="og:image" content="https:\/\/schemedb\.harlanljones\.com(\/[^"]+)"/);
  if (!share) problems.push(`${name}: missing og:image`);
  else if (!exists(share[1])) problems.push(`${name}: og:image ${share[1]} does not exist`);
  if (!/<meta name="twitter:card" content="summary_large_image"/.test(html)) problems.push(`${name}: twitter:card is not summary_large_image`);
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  for (const bad of ['undefined', 'NaN', '[object', 'null%']) {
    // Props for islands are serialized into attributes; only look at text outside tags.
    const text = visible.replace(/<[^>]*>/g, ' ');
    if (text.includes(bad)) problems.push(`${name}: page text contains "${bad}"`);
  }
  for (const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const url = match[1];
    if (url.startsWith('//')) continue;
    if (!exists(url)) problems.push(`${name}: broken link ${url}`);
  }
  // In-page anchors must exist on the page they point at.
  for (const match of html.matchAll(/href="(#[^"]+)"/g)) {
    const id = match[1].slice(1);
    if (!html.includes(`id="${id}"`)) problems.push(`${name}: anchor #${id} has no target`);
  }
  for (const match of html.matchAll(/href="(\/[^"#]*)#([^"]+)"/g)) {
    const [, url, id] = match;
    if (!exists(url) || !url.endsWith('/')) continue;
    const target = fs.readFileSync(path.join(dist, url, 'index.html'), 'utf-8');
    if (!target.includes(`id="${id}"`)) problems.push(`${name}: ${url}#${id} has no target`);
  }
}

for (const required of ['robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'favicon.svg', 'downloads/scheme-db.json', 'downloads/scheme-db.sqlite', 'downloads/SHA256SUMS']) {
  if (!fs.existsSync(path.join(dist, required))) problems.push(`Missing ${required}`);
}

const sizes = files.map((f) => ({ f, size: fs.statSync(f).size })).sort((a, b) => b.size - a.size);
const limit = 25 * 1024 * 1024; // Workers static assets: 25 MiB per file
for (const { f, size } of sizes) if (size > limit) problems.push(`${rel(f)} is ${(size / 1024 / 1024).toFixed(1)} MB, over the 25 MiB asset limit`);
if (files.length > 20000) problems.push(`${files.length} files, over the 20,000 asset limit`);

if (problems.length > 0) {
  console.error(`${problems.length} problems in dist/:`);
  for (const p of problems.slice(0, 40)) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`dist/ ok: ${pages.length} pages, ${files.length} files, largest ${rel(sizes[0].f)} (${(sizes[0].size / 1024 / 1024).toFixed(1)} MB).`);
