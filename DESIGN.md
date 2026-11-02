# Design System

<!-- impeccable:design-schema 1 -->

## Core Visual World: The Playbook

A coach's install binder. Warm paper and ink by default; in dark the same binder under a lamp. Pages are built from ruled tables, numbered play sheets and margin notes. It avoids the SaaS look: no gradient headline text, no band of large stats, no rows of equal feature cards, no paired pill buttons, no uniform rounded card grids.

Chosen by Harlan on 2026-11-01 after three directions were reviewed (the record is in `docs/redesign/DECISIONS.md`, decision 3). It replaced the earlier navy, Chivo and Inter "film room" look. The tokens below are the ones in `site/styles/global.css`; if the two ever disagree, the stylesheet wins and this file is wrong.

---

## 1. Color

Light (paper) is the default. Dark follows `prefers-color-scheme` and the header toggle sets `data-theme` on the root element. Marks and the line of scrimmage are 3:1 or better on both themes, and text is 4.5:1 or better.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f3ede0` | `#1b1814` | Page paper |
| `--s1` | `#ebe4d3` | `#25211b` | Sheet strips, the field |
| `--s2` | `#e2dac5` | `#2f2a22` | Raised or hovered surfaces |
| `--rule` | `#c7bca2` | `#4a4336` | Light table rules |
| `--rule2` | `#8e8471` | `#857b67` | Yard lines, field border, dashed lines |
| `--fg` | `#1b1812` | `#f2ebdb` | Ink: text, heavy rules, the line of scrimmage |
| `--fg2` | `#4b463c` | `#cfc6b2` | Secondary text |
| `--fg3` | `#69624f` | `#a89f8b` | Tertiary text, yard labels |
| `--off` / `--offt` | `#a84a05` / `#8a3e04` | `#f0a431` / `#f3b45a` | Offense: a filled amber mark / its text color |
| `--def` / `--deft` | `#1f5bb0` / `#174a93` | `#6aaef5` / `#8dc1f7` | Defense: a blue ring / its text color |
| `--conf` / `--conft` | `#c2322a` / `#9e1f1f` | `#f26d5f` / `#f59486` | Conflict: a red ring / its text color |
| `--hole` | `#d6ccb3` | `#110e0b` | Recessed areas |

Color is never the only carrier of meaning. Offense is a filled circle, defense is a ring, and a conflict is a second ring around the player. Do not add new accent colors; amber, blue and red each mean one thing.

---

## 2. Typography

* **Headings**: `'Zilla Slab', Georgia, serif`, weight 600 to 700, sentence case. Section dividers use 30px and 24px.
* **Text**: `'Libre Franklin', system-ui, sans-serif`, 15px to 16px body with a line height near 1.5.
* **Play calls, codes, readouts and labels**: `'Courier Prime', 'Courier New', monospace` with tabular numbers. Eyebrows and labels are 11 to 13px, uppercase, tracked 0.12 to 0.14em. Use it for sheet numbers (`39.2`), times, down and distance, personnel and ids.

All three are self hosted through `@fontsource`. Copy rules: sentence case, no hyphens inside words in running text (so "play action", not "play-action"), no em dashes, no orphaned last words. Data ids keep their hyphens.

---

## 3. Components

1. **Sheet**: a 1px ink border on paper with a `strip` across the top (a Courier line on `--s1`, with a ruled bottom border). A play is a numbered sheet. Cells inside are separated by `--rule` lines, not boxes.
2. **Divider**: a 3px ink rule over the section title with a 1px rule beneath, an eyebrow and an optional aside. This is how sections are separated, in place of cards.
3. **Margin note**: a top `--rule` border, a small uppercase label and 15px secondary text.
4. **Field**: a flat rectangle on `--s1` with `--rule2` yard lines, NFL or college hash marks for the scheme's level, a heavy `--fg` line of scrimmage, a gutter of yard labels and a ball marker. Offense is a filled `--off` dot, defense a `--def` ring, a conflicted player gets a `--conf` ring. Player tags are Courier on a `--s1` chip. Square corners everywhere except dots.
5. **Controls**: the play viewer has Previous beat, Play or Pause, Next beat, a scrubber and a speed group, as square outlined buttons (`ibtn`, with a solid variant). Every control has an accessible name, and the field has a text description that follows the playhead.
6. **Lists and tables**: ruled tables with search and filters that live in the address bar. Every row is visible without scripts; filters are a progressive enhancement.
7. **Network chart**: filled amber and ringed blue marks for the two sides, a solid line for "worked directly under" and a dashed `--rule2` line for influence without a job link.
8. **Trust notice**: a one line bar at the top of every page (`--rule2` bottom border, a Courier tag and a sentence). Its wording is built from the data and says how many plays are illustrative, so it is never typed.

---

## 4. Layout, Motion and Accessibility

* Phone first for the home page and lists, with 16px side gutters and a content width of 1176px at most. The layout changes at 860px (the header tabs tighten between 860 and 1099px so every tab and the toggle share one row).
* Motion is functional: the home field and the viewer animate, and nothing else loops. The home field respects `prefers-reduced-motion`; without scripts it is a still at 1.2 seconds.
* Focus is a 2px ink outline with a 2px offset. Text and marks keep their contrast in both themes.
* Print styles hide the navigation, filters and playback controls and keep the field's colors exact.
* Share images are drawn at build time (1200 by 630), one per play and one for the site, and each says the play is an illustration.
