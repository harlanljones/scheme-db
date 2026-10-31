# Redesign decisions

Decision record for the SchemeDB redesign (stage 3 of the relaunch plan). Settled decisions come from Harlan's answers in the design review on 2026-10-31. Assumptions are proposals that have not been confirmed yet; they change the moment a mockup review says so.

## Context

SchemeDB is being relaunched as a free, open source, data first database of football scheme strategy. The data model is merged (`data/`, schemas, downloads), and the animated play viewer becomes one reader of that data instead of the whole product. Visitors arrive mostly from LinkedIn and GitHub.

Hard constraints:

- The live site (`main`) is untouched. All redesign work lands on `release/mid-season-2026`.
- Stack: Astro with React islands, hosted as today on Cloudflare Workers.
- Data is CC BY 4.0, code is MIT. All 180 plays are labeled `illustrative` in the data.
- About 8 hours a week, so every screen has to earn its place.
- Visual rules come from `ai-design-skills` (`landing-page-design`, Part B).

## Settled decisions

| # | Decision | Chosen | What follows |
|---|---|---|---|
| 1 | Primary action on the home page | **Explore the plays** | The hero is an animated play. The main button opens the scheme index. Downloads are a secondary link. |
| 2 | The one audience | **Football fans and analysts** | Copy is about schemes and sequencing. Developers are served by a Data page and the repository, not by the home page. |
| 3 | Visual system | **ai-design-skills, keep data colors** | Type, spacing, radius, backgrounds and motion follow the skill. Offense amber, defense cyan and conflict red stay as data colors. `DESIGN.md` (navy, Chivo, Inter) is superseded. |
| 4 | The "illustrative" label | **Site wide notice only** | One clear notice on the site (home, footer, Data page, About). No badge on each play. Per record `confidence` stays in the data and the downloads. Revisit when plays gain sources. |
| 5 | Main index lists first | **Schemes** | 45 scheme cards, each opening its plays. A play is reached through its scheme. Plays are also reachable by search and by coach. |
| 6 | Disguise comparison (first 1.2 seconds) | **Inside each play page** | Every play page gets a section comparing it with the play it mirrors. The home page features one example. No top level Compare page. |
| 7 | Themes | **Dark and light at alpha** | Needs light neutrals (the skill defines dark backgrounds only), field and track colors that work on both, and contrast checks in both. A toggle plus system preference. |
| 8 | Phones | **Phone first for home and lists** | Home and scheme index are designed for phones first. The play viewer works on phones in a stacked layout (field, scrubber, beats). The full analysis console is for larger screens. |

## Alternatives that were considered

- Home action: download the data (developer first), or contribute on GitHub. Rejected because a moving play shows both the craft and the data in seconds.
- Audience: developers and data people, or coaches and students. Rejected for the home page; developers still get the Data page.
- Visual system: keep the film room look, or blend per screen. Rejected in favor of one system everywhere.
- Label: a badge on every play (recommended by Claude), or only in the play header. Harlan chose the lightest option, accepting that individual plays look more authoritative than they are. The site wide notice therefore has to be hard to miss.
- Index: plays first, or coaches first. Plays stay reachable through filters and search.
- Comparison: a top level Compare page, or both. Rejected to save design and build work.
- Theme: dark only was recommended and costs less. Harlan chose both, which roughly doubles color design and contrast testing.
- Phones: everything phone first, or desktop first.

## Assumptions to confirm

These follow from the decisions above and are not settled yet.

**Pages**

- Home, Schemes (index), Scheme (its plays, coach, lineage, formations), Play (viewer, beats, analysis, comparison, record download), Coaches and lineage trees, Glossary, Data (downloads, schema, license, how to cite), About (methodology, what illustrative means, credits).
- Home layout is type A, classic hero plus sections: hero with an animated play, proof from data counts (45 schemes, 180 plays, 53 coaches, 17 lineages, CC BY 4.0), how it works in three steps, one featured comparison, FAQ, final call to action, and the tagline reveal section the skill requires.
- A static page for every scheme, play and coach, with client side search.

**Build**

- The viewer is a React island, loaded when a play page needs it. Everything else is static Astro.
- Pages read `data/` directly, which makes `data/` canonical and ends the parity test against `src/data`.

**Visual**

- One typeface: Geist, with Geist Mono for telemetry and numbers. No italics. Icons from Phosphor.
- Copy follows the skill: sentence case, no hyphens inside text (so "play action", not "play-action"), no orphaned words, none of its banned words. Data ids keep their hyphens.
- Light theme neutrals are derived from the skill's dark palette and checked for contrast.

**Launch**

- A launch film or showreel (`design-to-motion`, `motion-reel`) comes after the alpha site exists.

## Open questions

- Tagline and headline voice: three candidates will go into the first mockup for Harlan to react to.
- Name on the page: "SchemeDB" as in the README, or "Scheme DB".
- Whether the glossary becomes a section or stays inline popovers plus a Data page table.
- When to make `data/` canonical (needed for the glossary, coach records and the contributor path).
