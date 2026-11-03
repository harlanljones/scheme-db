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

## Astro audit follow ups (2026-11-01)

An independent audit of the first Astro build (UI and UX, football accuracy, usability, motion) asked six questions. Harlan's answers, and what was done:

| # | Question | Decision | Done |
|---|---|---|---|
| 1 | What does "mentor" mean? | **Worked directly under, in any role.** Influence that passed on without a job link is a separate, dashed line. A network chart shows both. | Coach records corrected (11 coaches). A mentor or disciple link with no source was removed rather than kept (Chris Shula, Chip Kelly). New Lineages page and a chart on every scheme page. |
| 2 | Score both sides of the ball? | **Score only the side that sells the look.** Offense on offense schemes, defense on defense schemes. The other side is the one reading it. | Engine takes a `side`. Scores changed (average / at 1.2 s): Play Action Deep Over 95/89 (was 96/92), Naked Bootleg 95/89 (was 97/93), Jet Motion 71/48 (was 79/61). Jet Motion now drops below the 80% line at 0.4 s, not 0.6 s. About and the Compare panel say which side is counted. |
| 3 | Pre snap time (negative `t`)? | **Spec it, do not build it yet.** Later reversed: Harlan said "fix it" (2026-11-02), so phases 1 to 3 were built before launch. See "Pre snap time" below. | Spec in the Claude Docs list: "Pre-snap time: spec for negative t". Four phases, 30 to 40 hours. |
| 4 | Hash marks? | **Draw NFL and college hash marks and the ball spot.** | `data/` has an optional `ballSpot` (left, middle, right) on a concept. Fields draw the hash marks of the scheme's level and a ball marker. The release `concepts` table has `ball_spot` and `ball_x`. Five plays name a spot. |
| 5 | "Disguise" or "Same look" on offense? | **My call: "Same look" on offense pages, "Disguise" on defense pages.** Coaches say disguise for defense and "same look" for matching offensive plays. | Labels and section titles follow the side. |
| 6 | Per play share images? | **Yes, if sensible.** | `satori` and `@resvg/resvg-js` as build only dependencies. 180 play images and one site image, 1200 by 630, about 5 MB in all, drawn at build time. Each says the play is an illustration. |

Also done from the audit: comparison headings now say which sheets start alike and which do not, plays are searchable, the first Play press starts at the snap, the compare fields are larger, hash and ball legend, print styles, wrong role titles fixed (Greg Roman, Chip Kelly, Robert Saleh), "red zone" removed from five plays that sit in midfield, and the "identical" claim removed next to a score under 100%.

Still open from the audit (not done): a motion catalog (ghost overlay, routes inking in, beat focus, view transitions), a copy pass over data text (FB-13), a `comparisons.csv` download (UX-5), name only records for people who are named as mentors but have no coach page.

## Pre snap time (2026-11-02)

Harlan said "fix it" to the question of whether the pre snap motion problem could wait until after launch, so phases 1 to 3 of the spec were built on the mid-season branch. Four questions the spec left open were answered with its recommended defaults:

| Question | Default used |
|---|---|
| Where do negative frames go in the frames export? | Same `frames` table, with negative `frame` numbers. |
| What does the hero loop show? | It keeps looping from the snap. |
| When do the movement checks fail a build? | They warned first (phase 1) and now fail it (phase 3). |
| Phase 4 (a pre snap look score and a rotation shell for the defense)? | Left for later. |

What changed:

- **Time.** `t = 0` is the snap and a negative `t` is before it, to `-6` s. Every track has a waypoint at `t = 0`; `duration` stays the seconds after the snap; the lead in is derived and never stored. The viewer's scrubber starts at the lead in, with set, motion and snap bands and a Snap button. Releases carry `lead_in` on `concepts` and negative `frame` rows.
- **Speed.** No player in `data/` runs faster than 10.5 yd/s or speeds up faster than 12 yd/s² (over half a second) on the viewer's curve. The error lines are 12 yd/s and 16 yd/s²; they fail `data:validate`, and the warn lines (10.5 and 12) are reported. Why the curve matters: a short segment next to a long one is run too fast and the long one too slow, so fast runs are cut into quarter second pieces (`bun run retime`).
- **Motion at the snap.** One player may be in motion, not toward the line, and a shift must end a second before the snap. Thirteen plays (jet, orbit and cheat motion) now start the man set, then run so he reaches the snap at speed. The spec guessed about 25; the rest of the plays that name motion are a defensive shift, a slow slot motion or a post snap sweep, which have nothing to move.
- **Play checks (audit FB-3, FB-4, FB-12).** No offensive player past the line, seven on it, quarterback depth that matches Gun, Pistol or Under Center, and personnel and secondary labels that match the drawing. The library was fixed to pass and the checks fail the build.
- **Scores.** Re-scored with the same engine and window: 49 of 135 sheet rows changed, by 0.1 points on average. Jet Motion is the one that changes meaning (71% to 68% average, 48% to 59% at 1.2 s, break at 0.1 s, not 0.4 s). Three sheet rows cross the 80% line. The full table is in the pull request.

## Library pages (2026-11-02)

Harlan asked for the scheme, coaches and play libraries for the mid-season release. Built on top of decision 5 (schemes stay the main index):

- **Plays** (`/plays/`): all 180 sheets in one ruled list, numbered by scheme and sheet (39.2), with search over play, formation, coverage, front and coach, filters for side, era and down, and a contents or A to Z order. Filters live in the address like the scheme index. This adds a second way in without changing the contents table as the main index.
- **Coaches** (`/coaches/` and a page for each of the 53): a staff list by surname with role, side, lineage tree and era, filters for side, era and tree. Each coach page has the coach's own schemes with their four sheets, schemes the record links them to (`schemeIds` that belong to another coach, such as Bill Walsh and Kyle Shanahan's wide zone), concepts, career notes, who they worked under, the lineage chart and the coach record download. The 12 people named as mentors or disciples without a record are listed at the bottom of the coaches page, still without pages.
- Coach names across the site (Lineages, the network charts, scheme pages) now open the coach page rather than the coach's first scheme. Lovie Smith and Dom Capers, who have no scheme, now have pages too.
- The header has six tabs: Schemes, Plays, Coaches, Lineages, Data, About. (The Glossary page added a seventh; see below.)

## Glossary page (2026-11-02)

The last unbuilt page. It settles the open question about the glossary: it is a page (`/glossary/`), not inline popovers, and the Data page keeps the CSV files.

- One list, A to Z, of the 30 terms in `data/glossary/`, under letter headings with a letter row to jump to. Each entry has the meaning, the tactical note, the other names (aliases, with repeats and case variants removed), the terms it mentions ("See also"), and the schemes that use it. An entry has an anchor, so `/glossary/#wide-zone` opens on it.
- Search covers a term, its other names, its kind and its words. Filters are the seven term kinds. Both live in the address like the other lists, and the page works without scripts (the filters are hidden and every entry shows).
- "In the library" lists a scheme when one of its plays names the term, or another name for it, in its title, formation, front or coverage. Prose is left out because words like "counter" and "mesh" mean other things in a sentence. Three terms (Conflict Defender, Disguise Window, Spill and Lever) are not named that way, and say so. Disguise Window links to the similarity method on the About page.
- Seven header tabs: Glossary sits after Lineages. The tabs tighten between 860 and 1099 px so seven tabs and the lamp still share one row.
- The entries show the data text as written. That text still has hyphens, en dashes and "vs." in it, so the glossary joins the open copy pass over data text (FB-13).

## Contributor path (2026-11-02)

The site reads `data/` since the Astro build, which is the point at which `data/` became canonical (it ends the parity test against `src/data`, and the open question below about when to make it canonical). Opening the contributor path then meant removing what still assumed the launch library was closed:

- The parity test and `scripts/migrate-legacy.ts` are gone. `src/data` and the previous single page app were frozen here and then removed (see "Not done" below).
- Tests assert floors and invariants (at least the launch counts, play orders running 1 to N, every id resolving) instead of exact counts, so adding a record no longer fails ten tests.
- The validator now errors on a mentor or disciple with no coach record unless the person is on the known list of twelve, on a play that relates to no other play in its scheme (the site compares plays with the plays they relate to), on a `situation` that does not start with a down (the plays list filters by it), and on any `TODO:` text. The last one lets the scaffold hand out records that already parse while still failing CI until a person has written them.
- Trust copy follows the data. The notice bar, footer, home, About, Data, `llms.txt` and share image say "All N plays are illustrative" only while that is true, and otherwise say how many are. A play that is `reconstructed` or `verified` shows its confidence in the sheet strip and a Sources section; an illustrative play looks exactly as before, which keeps decision 4's lightest label.
- The way in: `bun run data:new` (concept, scheme, coach, term) writes a valid skeleton; `bun run check` is what CI runs; issue forms cover suggesting a play, reporting a mistake and suggesting a coach, scheme or term; a pull request template carries the checklist; `CONTRIBUTING.md` walks through each.
- Confidence: contributors set `illustrative` or `reconstructed` (with at least one source). `verified` is set by the maintainer after a second person has checked the sources.
- Contributions are published under CC BY 4.0 for data and MIT for code, and credit is the git history. No tracking data or copied diagrams.

Removed afterwards (same pull request, on Harlan's go ahead): the previous single page app (`src/App.tsx`, `src/components/`, its styles, `index.html`, `vite.config.ts`), its TypeScript copy of the library (`src/data/`), `ROADMAP.md`, the `dev:legacy` scripts and the dependencies only it used. Its last commit on the release branch is `134ac94`. The engine tests that read `src/data` now read `data/` through `src/engine/__tests__/fixtures.ts`. The coverage variant switcher is the one feature the Astro site does not have: its logic stays in `src/engine/coverage.ts`, unused by the site, and the component is in git history (`git show 134ac94:src/components/CoverageSwitcher.tsx`).

Not done, and why: a `contributors` field on a record (git history credits people for now) and a hosted form that opens a pull request.

## Alternatives that were considered

- Home action: download the data (developer first), or contribute on GitHub. Rejected because a moving play shows both the craft and the data in seconds.
- Audience: developers and data people, or coaches and students. Rejected for the home page; developers still get the Data page.
- Visual system: one system everywhere. The ai-design-skills look was chosen on 2026-10-31 and replaced by The Playbook on 2026-11-01 after the three direction review above.
- Label: a badge on every play (recommended by Claude), or only in the play header. Harlan chose the lightest option, accepting that individual plays look more authoritative than they are. The site wide notice therefore has to be hard to miss.
- Index: plays first, or coaches first. Schemes stay first; since 2026-11-02 plays and coaches also have their own lists.
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
- Inline glossary popovers on scheme and play pages. The glossary is a page now (see above); popovers would link the terms where they are used and are not built.
- ~~When to make `data/` canonical~~ Settled 2026-11-02: it is canonical; see Contributor path.
