import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_SCHEME_FAMILIES, ALL_PLAYS } from '../src/data/schemes/index';
import { COACH_PROFILES, COACHING_TREES } from '../src/data/coaches/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://schemedb.com';
const PUBLIC_DIR = path.resolve(__dirname, '../public');

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// -----------------------------------------------------------------------------
// 1. Generate robots.txt
// -----------------------------------------------------------------------------
export function generateRobotsTxt(): string {
  return `# robots.txt for SchemeDB (${BASE_URL})
# Standard August 2026 AI / LLM / Search Crawler Configuration

# -----------------------------------------------------------------------------
# Default Rule for all Web Crawlers & Indexers
# -----------------------------------------------------------------------------
User-agent: *
Allow: /
Disallow: /api/private/
Disallow: /admin/

# -----------------------------------------------------------------------------
# AI Search Engines, Answer Engines & Citation Retrieval Crawlers
# -----------------------------------------------------------------------------
# OpenAI GPTBot & SearchBot (ChatGPT Search & AI Citations)
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

# Anthropic Claude & Claude Search
User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

# Perplexity AI Search Engine
User-agent: PerplexityBot
Allow: /

# Google Gemini & Extended AI Crawler
User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

# Apple Intelligence & Web Indexer
User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Microsoft Copilot & Bingbot
User-agent: Bingbot
Allow: /

User-agent: Microsoft-Bing-Bot
Allow: /

# Meta AI & Llama Research Crawler
User-agent: Meta-ExternalAgent
Allow: /

User-agent: FacebookBot
Allow: /

# Amazon Bedrock & Alexa AI
User-agent: Amazonbot
Allow: /

# Cohere AI
User-agent: cohere-ai
Allow: /

# ByteDance / TikTok AI
User-agent: Bytespider
Allow: /

# Common Crawl (Foundational Open LLM Dataset)
User-agent: CCBot
Allow: /

# Diffbot Knowledge Graph Extractor
User-agent: Diffbot
Allow: /

# DuckDuckGo AI & Search
User-agent: DuckDuckBot
Allow: /

# -----------------------------------------------------------------------------
# Machine-Readable LLM Knowledge Base & Sitemap
# -----------------------------------------------------------------------------
# LLM Context Index: ${BASE_URL}/llms.txt
# Full LLM Knowledge Base: ${BASE_URL}/llms-full.txt
Sitemap: ${BASE_URL}/sitemap.xml
`;
}

// -----------------------------------------------------------------------------
// 2. Generate llms.txt (Standard Specification)
// -----------------------------------------------------------------------------
export function generateLlmsTxt(): string {
  const offensiveSchemes = ALL_SCHEME_FAMILIES.filter((f) => f.category === 'offense' || !f.category);
  const defensiveSchemes = ALL_SCHEME_FAMILIES.filter((f) => f.category === 'defense');

  let doc = `# SchemeDB — NFL Tactical Scheme & All-22 Playbook Visualizer

> SchemeDB is a high-fidelity football analytics and tactical engineering workstation containing 20 NFL scheme systems (10 Offensive, 10 Defensive), 80 hand-authored plays with Catmull-Rom spline trajectory waypoints, 0.0s–1.2s disguise mesh window telemetry, and 6 coaching lineage trees spanning 20 NFL head coaches and patriarchs.

## Overview & Architecture

- **Mathematical Engine**: 22-player waypoint interpolation using Catmull-Rom cubic splines with exact arc-length parameterization for realistic deceleration, plant steps, and break angles.
- **Coordinate System**: Field dimensions are LOS-relative yards where \`x\` represents cross-field position (\`0.0\` left sideline to \`53.33\` right sideline, hashes at \`23.36\` and \`29.97\`) and \`y\` represents depth relative to the Line of Scrimmage (\`y < 0\` backfield, \`y > 0\` downfield).
- **Disguise Mesh Window (0.0s – 1.2s)**: The critical pre-snap to early post-snap window where constraint plays mirror primary base runs/passes. Ghost overlays and conflict telemetry quantify defender commitment frames.
- **Play Sequencing Framework**: Every play defines explicit game-plan relationships:
  - \`setsUp\`: Plays unlocked or amplified by establishing this call.
  - \`playsOff\`: Complementary plays whose visual picture this call mimics.
  - \`tell\`: The singular visual cue distinguishing this play from its partner.

## Web Application Deep Links & Navigation

- **Film Room Visualizer**: \`${BASE_URL}/?tab=visualizer\`
- **Scheme Catalog**: \`${BASE_URL}/?tab=directory\`
- **Coaching Trees**: \`${BASE_URL}/?tab=trees\`
- **Sequence Matrix**: \`${BASE_URL}/?tab=sequence-map\`
- **Direct Play Links**: \`${BASE_URL}/?play={play-id}\` (e.g., \`${BASE_URL}/?play=outside-zone\`)
- **Direct Scheme Links**: \`${BASE_URL}/?scheme={scheme-id}\` (e.g., \`${BASE_URL}/?scheme=shanahan-wide-zone\`)

## Offensive Scheme Families (10 Systems / 40 Plays)

`;

  for (const fam of offensiveSchemes) {
    doc += `### ${fam.name} (\`${fam.id}\`)\n`;
    doc += `- **Architect / Head Coach**: ${fam.coach} (${fam.team})\n`;
    doc += `- **Philosophy**: ${fam.description}\n`;
    doc += `- **Plays**:\n`;
    for (const play of fam.plays) {
      doc += `  - [${play.name}](${BASE_URL}/?scheme=${fam.id}&play=${play.id}) (\`${play.id}\`): ${play.summary.motive}. Key conflict: ${play.summary.keyDefender}. Tell cue: ${play.sequence.tell}\n`;
    }
    doc += `\n`;
  }

  doc += `## Defensive Scheme Families (10 Systems / 40 Plays)\n\n`;

  for (const fam of defensiveSchemes) {
    doc += `### ${fam.name} (\`${fam.id}\`)\n`;
    doc += `- **Architect / Coordinator**: ${fam.coach} (${fam.team})\n`;
    doc += `- **Philosophy**: ${fam.description}\n`;
    doc += `- **Plays**:\n`;
    for (const play of fam.plays) {
      doc += `  - [${play.name}](${BASE_URL}/?scheme=${fam.id}&play=${play.id}) (\`${play.id}\`): ${play.summary.motive}. Key conflict: ${play.summary.keyDefender}. Tell cue: ${play.sequence.tell}\n`;
    }
    doc += `\n`;
  }

  doc += `## Coaching Lineage Trees (6 Trees / 20 Coaches)\n\n`;

  for (const tree of COACHING_TREES) {
    doc += `### ${tree.name} (\`${tree.id}\`)\n`;
    doc += `- **Patriarch / Lineage**: ${tree.patriarch} (${tree.category.toUpperCase()})\n`;
    doc += `- **Description**: ${tree.description}\n\n`;
  }

  doc += `## Coach Directory (20 Key Architects)\n\n`;

  for (const coach of Object.values(COACH_PROFILES)) {
    doc += `- **${coach.name}** (\`${coach.id}\`): ${coach.role2026} — ${coach.team}. Philosophy: ${coach.philosophy.slice(0, 150)}... Key Concepts: ${coach.keyConcepts.join(', ')}.\n`;
  }

  doc += `
## Full Knowledge Base & Machine Data

For the complete, unabridged play-by-play knowledge base including every waypoint beat, coaching note, and tactical breakdown, inspect:
- [Full LLM Knowledge Base](${BASE_URL}/llms-full.txt)
- [XML Sitemap](${BASE_URL}/sitemap.xml)
- [Robots Directives](${BASE_URL}/robots.txt)
`;

  return doc;
}

// -----------------------------------------------------------------------------
// 3. Generate llms-full.txt (Comprehensive Knowledge Base for LLM Ingestion)
// -----------------------------------------------------------------------------
export function generateLlmsFullTxt(): string {
  let doc = `# SchemeDB — Complete NFL Scheme & All-22 Tactical Knowledge Base
Version: August 2026
Base URL: ${BASE_URL}
Total Schemes: ${ALL_SCHEME_FAMILIES.length} (10 Offense, 10 Defense)
Total Plays: ${ALL_PLAYS.length} hand-authored All-22 tactical plays
Total Coaches: ${Object.keys(COACH_PROFILES).length}

================================================================================
PART 1: SCHEME FAMILIES & PLAY-BY-PLAY TACTICAL BREAKDOWNS
================================================================================

`;

  for (const fam of ALL_SCHEME_FAMILIES) {
    doc += `--------------------------------------------------------------------------------
SCHEME FAMILY: ${fam.name.toUpperCase()} [ID: ${fam.id}]
--------------------------------------------------------------------------------
Architect / Coach: ${fam.coach}
Organization / Team: ${fam.team}
Category: ${(fam.category || 'offense').toUpperCase()}
Tree Branch: ${fam.treeBranch || 'Independent'}
Core Philosophy: ${fam.description}

PLAYS IN THIS SCHEME:
`;

    for (const play of fam.plays) {
      doc += `
>>> PLAY: ${play.name} (ID: ${play.id})
    Personnel: ${play.personnel}
    Formation: ${play.formation}
    Situation: ${play.situation}
    Defensive Look: ${play.coverage} (${play.frontName})
    Animation Duration: ${play.duration}s
    Direct URL: ${BASE_URL}/?scheme=${fam.id}&play=${play.id}

    [SUMMARY & TACTICAL PURPOSE]
    - Motive: ${play.summary.motive}
    - Key Defender Put In Conflict: ${play.summary.keyDefender}
    - Why It Works: ${play.summary.whyItWorks}
    - Failure Mode / Defensive Counter: ${play.summary.failureMode}

    [SEQUENCING & GAME-PLAN LOGIC]
    - Sets Up: ${play.sequence.setsUp.length > 0 ? play.sequence.setsUp.join(', ') : 'None'}
    - Plays Off: ${play.sequence.playsOff.length > 0 ? play.sequence.playsOff.join(', ') : 'None'}
    - Visual Tell Cue: ${play.sequence.tell}

    [TIMELINE COACHING BEATS]
`;
      for (const beat of play.beats) {
        doc += `      * [T=${beat.t.toFixed(1)}s] ${beat.title}: ${beat.text}\n`;
      }
    }
    doc += `\n`;
  }

  doc += `================================================================================
PART 2: COACHING LINEAGE TREES & COACH PROFILES
================================================================================

`;

  for (const tree of COACHING_TREES) {
    doc += `--------------------------------------------------------------------------------
COACHING TREE: ${tree.name.toUpperCase()} [ID: ${tree.id}]
--------------------------------------------------------------------------------
Patriarch: ${tree.patriarch}
Category: ${tree.category.toUpperCase()}
System Summary: ${tree.description}
\n`;
  }

  doc += `--------------------------------------------------------------------------------
COACH PROFILES (20 ARCHITECTS)
--------------------------------------------------------------------------------\n\n`;

  for (const coach of Object.values(COACH_PROFILES)) {
    doc += `>>> COACH: ${coach.name} [ID: ${coach.id}]
    Role (2026): ${coach.role2026}
    Team / Institution: ${coach.team}
    Category: ${coach.category.toUpperCase()}
    Tree Branch: ${coach.treeBranch}
    Mentor: ${coach.mentorId || 'None'}
    Disciples: ${coach.disciples && coach.disciples.length > 0 ? coach.disciples.join(', ') : 'None'}
    Key Schemes: ${coach.schemeFamilyIds.join(', ')}
    Philosophy: ${coach.philosophy}
    Key Concepts: ${coach.keyConcepts.join(', ')}
    Notable Achievements: ${coach.notableAchievements ? coach.notableAchievements.join(' | ') : 'N/A'}
\n`;
  }

  return doc;
}

// -----------------------------------------------------------------------------
// 4. Generate sitemap.xml
// -----------------------------------------------------------------------------
export function generateSitemapXml(): string {
  const lastmod = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Views -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/?tab=visualizer</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/?tab=directory</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/?tab=trees</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/?tab=sequence-map</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Machine-Readable LLM Discovery Files -->
  <url>
    <loc>${BASE_URL}/llms.txt</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/llms-full.txt</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/robots.txt</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

  // All 20 Scheme Families
  xml += `  <!-- Scheme Family URLs -->\n`;
  for (const fam of ALL_SCHEME_FAMILIES) {
    xml += `  <url>
    <loc>${BASE_URL}/?scheme=${fam.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n`;
  }

  // All 80 Plays
  xml += `  <!-- Individual Play URLs -->\n`;
  for (const play of ALL_PLAYS) {
    xml += `  <url>
    <loc>${BASE_URL}/?scheme=${play.family}&amp;play=${play.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

// -----------------------------------------------------------------------------
// Execution when invoked directly
// -----------------------------------------------------------------------------
export function buildAllAssets(): void {
  console.log('Generating LLM SEO & Discoverability assets in public/ ...');

  const robots = generateRobotsTxt();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots, 'utf-8');
  console.log('✓ Wrote public/robots.txt');

  const llms = generateLlmsTxt();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), llms, 'utf-8');
  console.log('✓ Wrote public/llms.txt');

  const llmsFull = generateLlmsFullTxt();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-full.txt'), llmsFull, 'utf-8');
  console.log('✓ Wrote public/llms-full.txt');

  const sitemap = generateSitemapXml();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf-8');
  console.log('✓ Wrote public/sitemap.xml');

  console.log('All LLM SEO & Discoverability assets successfully built!');
}

buildAllAssets();

