# Redesign decisions

Decision record for the SchemeDB redesign (stage 3 of the relaunch plan). Settled decisions come from Harlan's answers in the design review on 2026-10-31. On 2026-11-01 Harlan asked for a look that is less like a SaaS site, reviewed three directions and chose **The Playbook**; that changes decision 3 and the visual assumptions below. Assumptions are proposals that have not been confirmed yet; they change the moment a mockup review says so.

## Context

SchemeDB is being relaunched as a free, open source, data first database of football scheme strategy. The data model is merged (`data/`, schemas, downloads), and the animated play viewer becomes one reader of that data instead of the whole product. Visitors arrive mostly from LinkedIn and GitHub.

Hard constraints:

- The live site (`main`) is untouched. All redesign work lands on `release/mid-season-2026`.
- Stack: Astro with React islands, hosted as today on Cloudflare Workers.
- Data is CC BY 4.0, code is MIT. All 180 plays are labeled `illustrative` in the data.
- About 8 hours a week, so every screen has to earn its place.
- The visual direction is The Playbook (decision 3). The `ai-design-skills` landing page rules no longer apply to the site's look.

## Settled decisions

| # | Decision | Chosen | What follows |
|---|---|---|---|
| 1 | Primary action on the home page | **Explore the plays** | The hero is an animated play. The main button opens the scheme index. Downloads are a secondary link. |
| 2 | The one audience | **Football fans and analysts** | Copy is about schemes and sequencing. Developers are served by a Data page and the repository, not by the home page. |
| 3 | Visual direction | **The Playbook** (chosen 2026-11-01, replacing ai-design-skills) | A coach's install binder: warm paper and ink, slab serif headings (Zilla Slab), Courier Prime for play calls and codes, Libre Franklin for text. Ruled tables, numbered play sheets and margin notes instead of cards, stat bands and feature rows. Offense is an amber (burnt orange) filled mark, defense a blue ring, conflict a red ring, tuned for 3:1 on paper and on the dark binder. `DESIGN.md` (navy, Chivo, Inter) is superseded. |
| 4 | The "illustrative" label | **Site wide notice only** | One clear notice on the site (home, footer, Data page, About). No badge on each play. Per record `confidence` stays in the data and the downloads. Revisit when plays gain sources. |
| 5 | Main index lists first | **Schemes** | A ruled contents table of 45 schemes (coach, team, side, era, with search and filters), each opening its plays. A play is reached through its scheme. Plays are also reachable by search and by coach. |
| 6 | Disguise comparison (first 1.2 seconds) | **Inside each play page** | Every play page gets a section comparing it with the play it mirrors. The home page features one example. No top level Compare page. |
| 7 | Themes | **Dark and light at alpha** | Light (paper) is the default and dark is the same binder under a lamp. Field and track colors work on both and are contrast checked in both. A toggle plus system preference. |
| 8 | Phones | **Phone first for home and lists** | Home and scheme index are designed for phones first. The play viewer works on phones in a stacked layout (field, scrubber, beats). The full analysis console is for larger screens. |

## Design direction review (2026-11-01)

Harlan found the first mockups too much like a SaaS product page. Three directions were built with the same content, the same verified numbers and both themes, and reviewed on the mockup canvas:

- **A, The Playbook** (chosen): coach's install binder. Home is the binder cover and a contents table; the play page is a call sheet.
- **B, The Almanac** (not chosen): editorial long read with a masthead, serif and a dot leader index.
- **C, The Film Room** (not chosen): all 22 tape tool with a call list rail, transport bar and sortable table, dark first.
- The earlier ai-design-skills look (Geist on near black, cards, stat band, three steps, FAQ) is retired.

What every direction avoided: gradient headline text, a band of large stats, three equal feature cards, a three step row, an FAQ list, paired pill buttons and uniform rounded card grids.

## Alternatives that were considered

- Home action: download the data (developer first), or contribute on GitHub. Rejected because a moving play shows both the craft and the data in seconds.
- Audience: developers and data people, or coaches and students. Rejected for the home page; developers still get the Data page.
- Visual system: one system everywhere. The ai-design-skills look was chosen on 2026-10-31 and replaced by The Playbook on 2026-11-01 after the three direction review above.
- Label: a badge on every play (recommended by Claude), or only in the play header. Harlan chose the lightest option, accepting that individual plays look more authoritative than they are. The site wide notice therefore has to be hard to miss.
- Index: plays first, or coaches first. Plays stay reachable through filters and search.
- Comparison: a top level Compare page, or both. Rejected to save design and build work.
- Theme: dark only was recommended and costs less. Harlan chose both, which roughly doubles color design and contrast testing.
- Phones: everything phone first, or desktop first.

## Assumptions to confirm

These follow from the decisions above and are not settled yet.

**Pages**

- Home, Schemes (index), Scheme (its plays, coach, lineage, formations), Play (viewer, beats, analysis, comparison, record download), Coaches and lineage trees, Glossary, Data (downloads, schema, license, how to cite), About (methodology, what illustrative means, credits).
- Home is the binder cover: headline, a short typed inventory (45 schemes, 180 plays, 53 coaches, 17 lineages, CC BY 4.0), a framed play sheet with the animated field and a pause control, the contents table of all 45 schemes with search and filters, one featured disguise comparison, and a data and licence section. No stat band, three steps, FAQ or tagline reveal section.
- A static page for every scheme, play and coach, with client side search.

**Build**

- The viewer is a React island, loaded when a play page needs it. Everything else is static Astro.
- Pages read `data/` directly, which makes `data/` canonical and ends the parity test against `src/data`.

**Visual**

- Type: Zilla Slab for headings, Courier Prime for play calls, codes and readouts, Libre Franklin for text. All three are Google Fonts and need self hosting at build time.
- Copy keeps the earlier rules: sentence case, no hyphens inside text (so "play action", not "play-action"), no em dashes, no orphaned words. Data ids keep their hyphens.
- Paper and dark binder palettes are checked for contrast: marks and the line of scrimmage at 3:1 or better, text at 4.5:1 or better, in both themes.

**Launch**

- A launch film or showreel (`design-to-motion`, `motion-reel`) comes after the alpha site exists.

## Open questions

- Headline voice: the Playbook mockup uses "Forty five schemes, drawn up." The earlier tagline candidates are retired with the tagline reveal section.
- Name on the page: "SchemeDB" as in the README, or "Scheme DB".
- Whether the glossary becomes a section or stays inline popovers plus a Data page table.
- When to make `data/` canonical (needed for the glossary, coach records and the contributor path).
