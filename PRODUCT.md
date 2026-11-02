# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Football fans and analysts who already know the basics (personnel groupings, route concepts, coverages) and want to see why a scheme works: who a play puts in conflict, and how it looks like the play it is built from. Coaches and students use it the same way. Developers and data people are a second audience, served by the Data page and the repository, not by the home page.

## Product Purpose
A free, open, data first database of football scheme strategy. Schemes, plays, coaches, lineages and a glossary are published as JSON, CSV and SQLite under CC BY 4.0, and an animated static site reads the same files. The viewer shows 22 players moving through time and compares a play with the play it mirrors over the first 1.2 seconds after the snap.

## Positioning
Static chalkboard diagrams freeze the geometry and hide timing. All-22 film shows the outcome and explains nothing. SchemeDB sits between them: hand drawn plays with timing, labeled for what they are, and open data anyone can query, correct and extend.

## Operating Context
A reference that people reach from LinkedIn, GitHub and search, mostly on a phone first and a laptop second. Visits are short: find a scheme, press play, read the beats, maybe download the data. A smaller group works in the repository and sends pull requests. The author maintains it alone in about 8 hours a week, so every page has to earn its place and contributing has to be possible without the author's help.

## Capabilities and Constraints
- Static pages built from `data/` (Astro with React islands), hosted on Cloudflare Workers. Islands add the play viewer, the comparison and the list filters; the pages read without scripts.
- Field coordinates are yards, relative to the line of scrimmage (`x: 0..53.33`, `y` negative is the backfield). Paths are timed waypoints drawn as splines.
- Light and dark themes, both checked for contrast. Phone first for the home page and lists; the play viewer stacks on a phone (field, scrubber, beats).
- Data is CC BY 4.0 and code is MIT. No player tracking data (the Big Data Bowl data is non-commercial) and no copied diagrams.
- Strict stack: Bun, Astro, React islands, TypeScript, Zod, Vitest.

## Brand Commitments
The Playbook: a coach's install binder. Warm paper and ink, ruled tables, numbered play sheets and margin notes instead of cards, stat bands and feature rows. It avoids the look of a SaaS product page. Plain words, sentence case, no hype.

## Evidence on Hand
- The launch library: 45 schemes (25 offense, 20 defense) with 180 plays, 53 coaches, 17 lineage trees and 30 glossary terms, in `data/`. Every play is `illustrative`. Counts on the site are computed from the data, so they change as records are added.
- A schema and cross record validator that fails on unresolved ids, broken geometry, missing sources and unfinished `TODO:` text, plus a scaffold (`bun run data:new`), issue forms and a contributing guide, so an outside person can add a play with a pull request.
- A deterministic release build (JSON, 18 CSV tables, SQLite) and a similarity score that is documented on the About page, with its limits stated.
- A decision record (`docs/redesign/DECISIONS.md`) with Harlan's answers to the design, audit and contributor path questions, and a test suite that asserts floors and invariants rather than counts.

## Product Principles
1. **Say what a play is.** Plays are illustrations until they cite sources. The notice is hard to miss, and it follows the data: it changes the day a play is reconstructed or verified.
2. **Sequencing is the scheme.** The first second after the snap, where a constraint play and its base play look alike, is the idea the product exists to show.
3. **The data is the product.** Pages are readers of the files. Anything the site says about the library (a count, a claim) is built from the data, never typed.
4. **Earn every screen.** One page per scheme, play and coach; a list and a search for each; no top level pages that repeat each other.
5. **Open to correction.** A mistake should be easy to report and a fix easy to send. Credit goes to contributors through the git history.
