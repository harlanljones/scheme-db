import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_SCHEME_FAMILIES, ALL_PLAYS } from '../../data/schemes/index';
import { COACH_PROFILES, COACHING_TREES } from '../../data/coaches/index';
import {
  generateRobotsTxt,
  generateLlmsTxt,
  generateLlmsFullTxt,
  generateSitemapXml,
} from '../../../scripts/generate-llm-assets';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('LLM SEO & Discoverability Conventions (August 2026)', () => {
  const publicDir = path.resolve(__dirname, '../../../public');
  const indexHtmlPath = path.resolve(__dirname, '../../../index.html');

  describe('1. robots.txt (AI Crawlers & Indexing Directives)', () => {
    it('generates valid robots.txt content with all required AI and search user agents', () => {
      const robots = generateRobotsTxt();

      // General crawlers
      expect(robots).toContain('User-agent: *');
      expect(robots).toContain('Allow: /');

      // AI Crawlers & Search Agents
      const requiredAiBots = [
        'GPTBot',
        'OAI-SearchBot',
        'ChatGPT-User',
        'ClaudeBot',
        'Claude-Web',
        'anthropic-ai',
        'PerplexityBot',
        'Google-Extended',
        'Googlebot',
        'Applebot',
        'Applebot-Extended',
        'Bingbot',
        'Meta-ExternalAgent',
        'FacebookBot',
        'Amazonbot',
        'cohere-ai',
        'Bytespider',
        'CCBot',
        'Diffbot',
        'DuckDuckBot',
      ];

      for (const bot of requiredAiBots) {
        expect(robots).toContain(`User-agent: ${bot}`);
      }

      // Sitemap and LLM pointers
      expect(robots).toContain('Sitemap: https://schemedb.harlanljones.com/sitemap.xml');
      expect(robots).toContain('llms.txt');
    });

    it('ensures public/robots.txt file exists on disk', () => {
      const filePath = path.join(publicDir, 'robots.txt');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('User-agent: GPTBot');
      expect(content).toContain('User-agent: ClaudeBot');
      expect(content).toContain('User-agent: PerplexityBot');
    });
  });

  describe('2. llms.txt (Standard Specification)', () => {
    it('generates llms.txt compliant with the markdown standard', () => {
      const llms = generateLlmsTxt();

      expect(llms.startsWith('# SchemeDB')).toBe(true);
      expect(llms).toContain('> SchemeDB is a high-fidelity football analytics');

      // Verify every scheme family is listed
      for (const fam of ALL_SCHEME_FAMILIES) {
        expect(llms).toContain(fam.name);
        expect(llms).toContain(fam.id);
      }

      // Verify every play is indexed
      for (const play of ALL_PLAYS) {
        expect(llms).toContain(play.name);
        expect(llms).toContain(play.id);
        expect(llms).toContain(play.summary.keyDefender);
      }

      // Verify coaching trees and coaches
      for (const tree of COACHING_TREES) {
        expect(llms).toContain(tree.name);
      }
      for (const coach of Object.values(COACH_PROFILES)) {
        expect(llms).toContain(coach.name);
      }

      // Pointer to full knowledge base
      expect(llms).toContain('llms-full.txt');
    });

    it('ensures public/llms.txt file exists on disk', () => {
      const filePath = path.join(publicDir, 'llms.txt');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('# SchemeDB');
      expect(content).toContain('shanahan-wide-zone');
      expect(content).toContain('macdonald-hybrid-disguise');
    });
  });

  describe('3. llms-full.txt (Comprehensive Knowledge Base)', () => {
    it('generates full context for all plays with timeline beats and coach profiles', () => {
      const full = generateLlmsFullTxt();

      expect(full).toContain('SCHEME FAMILY:');
      expect(full).toContain('TIMELINE COACHING BEATS');
      expect(full).toContain('COACH PROFILES');

      // Check key play beats exist
      for (const play of ALL_PLAYS) {
        expect(full).toContain(`PLAY: ${play.name} (ID: ${play.id})`);
        expect(full).toContain(play.summary.motive);
        expect(full).toContain(play.summary.whyItWorks);
        expect(full).toContain(play.summary.failureMode);
        expect(full).toContain(play.sequence.tell);
      }

      // Check all coaches exist
      for (const coach of Object.values(COACH_PROFILES)) {
        expect(full).toContain(`COACH: ${coach.name} [ID: ${coach.id}]`);
        expect(full).toContain(coach.philosophy);
      }
    });

    it('ensures public/llms-full.txt exists on disk', () => {
      const filePath = path.join(publicDir, 'llms-full.txt');
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(50000);
    });
  });

  describe('4. sitemap.xml', () => {
    it('generates valid sitemap XML with core tabs, LLM text files, schemes, and plays', () => {
      const xml = generateSitemapXml();

      expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

      // Core pages
      expect(xml).toContain('<loc>https://schemedb.harlanljones.com/</loc>');
      expect(xml).toContain('<loc>https://schemedb.harlanljones.com/?tab=visualizer</loc>');
      expect(xml).toContain('<loc>https://schemedb.harlanljones.com/?tab=directory</loc>');
      expect(xml).toContain('<loc>https://schemedb.harlanljones.com/?tab=trees</loc>');
      expect(xml).toContain('<loc>https://schemedb.harlanljones.com/?tab=sequence-map</loc>');

      // LLM discovery files
      expect(xml).toContain('<loc>https://schemedb.harlanljones.com/llms.txt</loc>');
      expect(xml).toContain('<loc>https://schemedb.harlanljones.com/llms-full.txt</loc>');
      expect(xml).toContain('<loc>https://schemedb.harlanljones.com/robots.txt</loc>');

      // Every scheme family
      for (const fam of ALL_SCHEME_FAMILIES) {
        expect(xml).toContain(`<loc>https://schemedb.harlanljones.com/?scheme=${fam.id}</loc>`);
      }

      // Every play
      for (const play of ALL_PLAYS) {
        expect(xml).toContain(`play=${play.id}`);
      }

      expect(xml).toContain('</urlset>');
    });

    it('ensures public/sitemap.xml exists on disk', () => {
      const filePath = path.join(publicDir, 'sitemap.xml');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('5. SPA Routing & index.html Metadata', () => {
    it('configures single-page routing via wrangler.jsonc', () => {
      const wranglerPath = path.resolve(__dirname, '../../../wrangler.jsonc');
      expect(fs.existsSync(wranglerPath)).toBe(true);
      const wrangler = JSON.parse(fs.readFileSync(wranglerPath, 'utf-8'));
      expect(wrangler.assets?.not_found_handling).toBe('single-page-application');
    });

    it('contains comprehensive SEO, LLM discovery, and Schema.org JSON-LD in index.html', () => {
      const html = fs.readFileSync(indexHtmlPath, 'utf-8');

      // Meta and link tags
      expect(html).toContain('name="description"');
      expect(html).toContain('name="keywords"');
      expect(html).toContain('name="robots"');
      expect(html).toContain('name="googlebot"');
      expect(html).toContain('name="bingbot"');
      expect(html).toContain('rel="canonical"');
      expect(html).toContain('href="/llms.txt"');
      expect(html).toContain('href="/llms-full.txt"');

      // OpenGraph & Twitter
      expect(html).toContain('property="og:title"');
      expect(html).toContain('property="og:description"');
      expect(html).toContain('name="twitter:card"');

      // Schema.org JSON-LD
      expect(html).toContain('<script type="application/ld+json">');
      expect(html).toContain('"@type": "WebApplication"');
      expect(html).toContain('"@type": "Dataset"');
      expect(html).toContain('https://schemedb.harlanljones.com/llms.txt');

      // Non-JS semantic fallback
      expect(html).toContain('<noscript>');
      expect(html).toContain('Kyle Shanahan Wide Zone');
      expect(html).toContain('Mike Macdonald Sim-Pressure');
      expect(html).toContain('Vic Fangio Two-High Shell');
    });
  });
});
