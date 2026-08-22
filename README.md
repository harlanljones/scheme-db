<div align="center">

# SchemeDB

### Modern NFL Scheme & Disguise Interactive Workstation

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite 8](https://img.shields.io/badge/Vite-8.x_(Rolldown)-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Bun](https://img.shields.io/badge/Bun-1.x-fbf0df?style=flat-square&logo=bun&logoColor=black)](https://bun.sh)
[![Vitest](https://img.shields.io/badge/Tests-72%20Passing%20(100%25)-44CA41?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

*An interactive engineering workstation animating 45 scheme families (180 plays) spanning modern NFL, historical NFL, and college football, 17 coaching lineage trees (53 coaches), with 0.0s–1.2s disguise mesh window analysis, Catmull-Rom spline path interpolation, interactive tactical glossary, and real-time conflict telemetry.*

[⚡ Live Demo](#-live-demo) • [🏈 Scheme Catalog](#-scheme-catalog-45-systems--180-plays) • [🌳 Coaching Trees](#-coaching-lineage-trees-17-lineage-trees--53-coaches) • [🔬 Engine Architecture](#-mathematical--engine-architecture) • [⌨️ Shortcuts](#️-keyboard-shortcuts)

---

</div>

## ⚡ Overview

Modern NFL play design is predicated on **sequencing and disguise**. Constraint plays (play-action, bootlegs, screens, leaks, simulated pressures, creeper blitzes) look virtually identical to base foundation looks for the first `0.0s – 1.2s` after the snap. This false key triggers defender run/pass conflicts before the true intent unfolds.

**SchemeDB** bridges the divide between static chalkboard diagrams (which hide sequencing and temporal velocity) and All-22 game film (which shows the outcome but obscures underlying geometry and reads).

```
  Base Play (e.g. Outside Zone)  ──┐
                                   ├── 0.0s – 1.2s Disguise Mesh (96%+ Spatial Overlap) ──► False Key / Conflict
  Constraint (e.g. Boot Y-Leak)   ──┘
```

---

## 🚀 Live Demo

> 🌐 **Explore the live workstation**: [https://schemedb.harlanljones.com/](https://schemedb.harlanljones.com/) *(or deploy locally below)*

---

## 🖥 Application Workspaces

### 1. 🎬 Film Room Visualizer (`Key: 1`)
- **Continuous Catmull-Rom Spline Animation**: Smooth parametric path interpolation ($\alpha = 0.5$) preventing unnatural directional snapping.
- **Interactive Scrub Timeline**: Variable playback speeds (`0.25x`, `0.5x`, `1.0x`, `1.5x`), loop toggle, millisecond scrubber, and frame stepping (`-0.1s`, `+0.1s`).
- **Synchronized Tactical Console**: Live Beat Spotlight, 4-Dimension Scheme Breakdown (Personnel, Scheme Type, Coverage/Front, Run/Pass Track), and multi-pane play blueprint.
- **Interactive Football Glossary**: Contextual inline term detection and hover cards explaining advanced NFL concepts (*Apex Defender, Sim Pressure, Tite Front, Wham Block, Duo*).
- **Dynamic Player Markers & Accessibility**: Clear position badges, motion trails (route, block, carry, drop), ball-carrier indicators, read-key conflict defender badges, and full ARIA screen-reader labels.

### 2. 📚 Scheme Catalog (`Key: 2`)
- **Master Matrix**: Zero-scroll, high-density matrix comparing all 45 systems across offensive and defensive families.
- **Split Playbook Inspector**: Master-detail playbook inspection with instant film-room launching.
- **Tactical Scheme Cards**: Card grid with system tags, conflict keys, and personnel summaries.

### 3. 🌳 Coaching Lineage Tree Explorer (`Key: 3`)
- **Interactive Lineage Graph**: Vector-rendered coaching trees with pan, zoom, pinch-to-zoom, and mini-map navigation.
- **53 Coach Profiles & 17 Lineages**: Detailed scheme philosophies, career milestones, 2026 roles, and direct cross-links into playable systems — from Vince Lombardi's power sweep and Tom Landry's Flex to Dave Aranda's tite front and the modern NFL coaching ranks.
- **Lineage Tree Clustering**: Grouped scheme pickers organized by all 17 coaching branches (*Shanahan/Kubiak, Reid West Coast, Air Coryell/Run and Shoot, Air Raid, Option & Spread Revolution, Buddy Ryan 46, LeBeau Zone Blitz, Landry/Doomsday, Two-Deep Shell/Tampa 2, College Hybrid Fronts*, and more).
- **Global Search**: Filter by coach, schematic philosophy, or NFL franchise.

### 4. 🧬 Disguise Sequence Matrix (`Key: 4`)
- **0.0s – 1.2s Disguise Window Analyzer**: Quantitative comparison of base vs constraint looks during defender read keys.
- **Ghost Overlay Mode**: Renders base and constraint trajectories simultaneously on a unified SVG canvas with translucent ghost paths.
- **Side-by-Side Mode**: Synchronized dual-field playback with locked scrubbers.
- **Live Conflict Telemetry HUD**: Real-time visual similarity score (%) and conflict defender displacement calculation.

---

## 🏈 Scheme Catalog (45 Systems • 180 Plays)

The library contains **180 hand-authored, mathematically validated plays** across 45 systems (4 plays per system), spanning three eras via the `SchemeEra` tag on every expansion family (`past-nfl`, `past-college`, `current-college`, `modern-nfl`):

### ⚡ Modern NFL Offensive Systems (15 Systems • 60 Plays)
1. **Kyle Shanahan — Wide Zone & Bootleg Sequencing** (`SF`): *Outside Zone Left, PA Deep Over, Naked Bootleg Flood, Jet Motion Wide Zone*
2. **Klint Kubiak — Split-Zone & Y-Leak Constraint** (`LV`): *Split-Zone Slice, PA Dagger Shot, Boot Throwback Y-Leak, Orbit Toss*
3. **Andy Reid — West Coast Spread-RPO & Spacing** (`KC`): *Mesh Shallow Cross, IZ RPO Glance, Power Shovel Option, Sprintout Smash-Wheel*
4. **Sean McVay — Condensed Duo & Play-Action Attack** (`LAR`): *11P Duo Lead Inside Power, PA Sail 3-Level Flood, PA Deep Over/Crosser, Glance RPO Orbit Return*
5. **Mike McDaniel — Speed Cheat-Motion & Space Attack** (`LAC/MIA`): *Cheat-Motion Crack Toss, Cheat-Motion Wheel Shot, IZ Wham Cheat Decoy, Pistol Speed Option Pitch*
6. **Kevin Stefanski — Multi-TE Gap & Under-Center PA** (`ATL/CLE`): *13P Pin & Pull Sweep, PA Seam Shot, Naked Bootleg Slide, Counter Gap GT Lead*
7. **Shane Steichen — QB Mesh & Spread RPO System** (`IND/PHI`): *Gun QB Power Read, Mesh Rail/Wheel, IZ Bubble RPO, 4-Verticals Switch*
8. **Matt LaFleur — Illusion of Complexity & Deep Shots** (`GB`): *Wide Zone Cutback, PA Cross-Country Post, Pony Screen-Wheel, PA Dagger Seam-Dig*
9. **Nick Sirianni — Power RPO & Brotherly Shove** (`PHI`): *Inside Power Duo, Backside Glance ISO RPO, Slot Fade Out Isolation, Brotherly Shove*
10. **Ben Johnson — Counter Deception & Gadget Offense** (`DET/CHI`): *Counter Trey Lead, PA TE Throwback Leak, Hook-Ladder Mesh TE Stack, Orbit Reverse Screen Wheel*
11. **Sean Payton — Quick Game & Screen Package** (`DEN`): *Slant-Flat Rhythm, Fast Screen Convoy, Tunnel Screen Shovel, Jet Sweep PA Deep Post*
12. **Greg Roman — Power Read & QB Run Attack** (`LAC/BAL`): *Power Read Pull, QB Power Keeper, Pin & Pull Sweep, Heavy PA Deep Post*
13. **Kevin O'Connell — Boot & Dagger Play-Action System** (`MIN`): *Condensed Wide-Zone Stretch, Wide-Zone Boot Flood, PA Dagger Seam-Curl, Duo PA Boundary Crosser*
14. **Liam Coen — Hybrid Wide-Zone RPO System** (`JAX`): *Wide-Zone Glance RPO, Bubble-Slant-Flat Triangle RPO, Crack-Toss Perimeter, Motion-Declared Zone Cutback*
15. **Chip Kelly — Tempo Spread & Air Raid System** (`LV/ORE/PHI`): *Mesh at Tempo, Three-Level Spot Stress, Zone-Read RB Draw, Four Verts Takeover*

### 🛡 Modern NFL Defensive Systems (10 Systems • 40 Plays)
16. **Robert Saleh — 4-3 Wide-9 & Cover 3 Match** (`SF/NYJ`): *Cover 3 Rip/Liz Match, Cover 6 Split-Field Bracket, Cross-Dog Fire Zone 3, NASCAR Cover 1 Robber*
17. **Mike Macdonald — Sim-Pressure & Disguise** (`SEA/BAL`): *Double-A Mug Cover 3 Buzz, Simulated Creeper Overload, Split-Field Quarters Trap, Amoeba House Blitz Cover 0 Peel*
18. **Brian Flores — Psycho Front & Binary Blitz** (`MIN/NE`): *Psycho 7-Man House Blitz Cover 0, Bluff Drop-8 Lurk, 6-Man Cross-Dog Fire Hot, Chameleon Bracket Double #1*
19. **Vic Fangio — Two-High Shell & Quarters Family** (`PHI/DEN`): *Cover 6 Q-Q-Half, Penny 5-1-5 Match Quarters, Tite Creeper Drop-8 Trap, Cover 8 Boundary Trap*
20. **Jesse Minter — Amoeba Front & Creepers** (`LAC/BAL`): *Amoeba 5-Man Fire Zone 3, Nickel Slot Blitz Creeper, Cover 1 Robber Lurk, Double-A Mug Cover 0 Peel*
21. **DeMeco Ryans — Wide-9 Attack & Match Coverage** (`HOU`): *Wide-9 Tackle-Wrap Stunt, Split-Safety Palms Match, Cover 1 Hole A-Gap Mug, Overload Edge Fire Zone*
22. **Chris Shula — Match Quarters & Penny Front** (`LAR`): *Tite Front B-Gap Pinch Quarters, Penny Bracket vs Bunch, Split-Field Cover 8, Boundary Creeper Drop-7*
23. **Steve Spagnuolo — Exotic Blitz & Sim Pressures** (`KC`): *Boundary Corner Blitz Heat, Cross-Dog Creeper Sim, Cover 0 Max All-Out Blitz, Split-Safety Invert Cover 2 Trap*
24. **Dan Quinn — Cover 3 Press-Bail & Under Front** (`WAS/SEA`): *Cover 3 Press-Bail Single-High, Under Front Overload Collapse, Cover 1 Rat-in-the-Hole, Safety Sky Fire Zone*
25. **Todd Bowles — Creeper Blitz & Psycho Front** (`TB`): *Dual A-Gap Cross-Dog Blitz, Boundary Overload Fire Blitz, Drop-8 Tampa 2 Lurk Trap, Peel-Zone Sim Pressure*

### 📜 Historical NFL Offensive Systems (5 Systems • 20 Plays) — era: `past-nfl`
26. **Don Coryell — Air Coryell Vertical Passing** (`SD 1978-86`): *Seam-Post Double Stroke, Deep Out & Comeback, Cross-Country Drag Series, Z-Snap Move Screen*
27. **Bill Walsh — Classic West Coast Offense** (`SF 1979-88`): *Slant-Flat Combo, Sprint Right Option, Curl-Flat Flood, PA Deep Cross*
28. **June Jones — Run and Shoot** (`HOU 1989-93 / Hawaii`): *Switch Verticals vs Man, Mesh Read-Route, Post-Wheel Leverage Read, Go-Route Stab Adjustment*
29. **Vince Lombardi — T-Formation Power Sweep** (`GB 1959-67`): *Power Sweep Left, Power Sweep Right w/ Boot Fake, Fullback Blast, Sweep-Pass Bootleg*

### 🎓 Historical College Offensive Systems (4 Systems • 16 Plays) — era: `past-college`
30. **Harold "Tubby" Raymond — Delaware Wing-T** (`Delaware 1966-2001`): *Buck Sweep w/ Guard Pull, Waggle Pass Off Sweep Fake, Counter Crisscross, Wingback Trap-Gut*
31. **Chris Ault — Pistol Read-Option** (`Nevada`): *Pistol Inside Zone Read, Pistol Power-O Read, Pistol PA Deep Shot, Pistol Speed Option*
32. **Art Briles — Baylor Vertical Choice Spread** (`Baylor 2008-15`): *Slot Choice Shot, IZ Read + Choice Double-Post, Bubble-Go Glance, Speed Sweep Constraint*
33. **Urban Meyer — Spread-Option** (`Florida / Ohio State 2001-18`): *Inside Zone Read Give, Inverted Veer Power Read, Snag Triangle Spacing, Speed Option w/ Reverse Constraint*

### 🎓 Current College Offensive Systems (2 Systems • 8 Plays) — era: `current-college`
34. **Paul Johnson — Flexbone Triple Option** (`Georgia Tech / Navy`): *Midline Triple Option, Rocket Toss Pitch Series, Inside Veer Triple, Midline Play-Action Shot*
35. **Mike Leach — Air Raid** (`TTU / WSU / MSST`): *Mesh Concept, Y-Cross, Stick-Naked Constraint, Shallow Distribution Drive*

### 📜 Historical NFL Defensive Systems (7 Systems • 28 Plays) — era: `past-nfl`
36. **Buddy Ryan — 46 Defense** (`CHI 1982-85`): *Base 46 vs Pro I-Form, Double A-Gap Mad Dog Overload, Strong-Side E-X-T Combo Blitz, Weak Free Blade Safety Blitz*
37. **Dick LeBeau — Fire Zone Zone Blitz** (`PIT 1995-2014`): *Triple Inside Fire Zone, Safety Rotate Fire Zone, Nose Drop Nasco, Safety Blitz Smoke*
38. **Tony Dungy — Tampa 2** (`TB 1996-2001`): *Base Tampa 2 vs 2x2, SLB Edge Blitz Variant, Cover 2 Roll to Cover 3 Sky vs Trips, Cloud Boundary Call*
39. **Tom Landry — Flex Defense** (`DAL 1960-88`): *Weak-Tackle Flex vs Power Sweep, Tackle-Tackle Flex vs Two-Back, LB Strength Shift vs Motion, Flex Line Game Pass Rush*
40. **Bum Phillips — Two-Gap 3-4** (`HOU 1975-80`): *Base Two-Gap Fits vs 21 Personnel, Dual Edge Rush w/ Interior Anchor, Stack Slant Shift, Wildcat Walk-Up Edge*
41. **Jimmy Johnson — Speed 4-3** (`DAL 1989-93 / Miami`): *Penetration Slant Loop, Man-Free Will Dog, Miami Chase Rule Pursuit, Goal-Line Haley Edge Rush*
42. **Marvin Lewis — Cover 2 Man-Under** (`BAL DC 1996-2001`): *Red-Zone 2-Man vs Compressed Twins, Fade Beater Demo, 2-Man Edge Blitz, Goal-Line Double Robber*

### 🛡 Modern NFL Situational Package (1 System • 4 Plays) — era: `modern-nfl`
43. **Bill Belichick — Okie/Bear Package** (`NE 2003-19`): *Goal-Line Bear vs Heavy Personnel, Third-and-1 Double-A Mug Blitz, Bear Slant Strong, Bear-to-46 Stem Disguise*

### 🎓 Current College Defensive Systems (2 Systems • 8 Plays) — era: `current-college`
44. **Dave Aranda — Tite Front / Peso Package** (`LSU DC / Baylor HC`): *Base Tite vs 11P Zone Read, Tite 4 Simulated Pressure, Quarters Apex Adjustment vs 2x2, Bear Adjustment vs Condensed Twins*
45. **Rocky Long — 3-3-5 Stack** (`SDSU / New Mexico`): *Base Stack Slant Exchange, Double-Edge Storm Dog, Safety-Corner Cross-Dog Fire Zone, All-Out Zero Pressure vs Empty*

---

## 🌳 Coaching Lineage Trees (17 Lineage Trees • 53 Coaches)

**Modern NFL lineages:**
- **Shanahan / Kubiak Wide-Zone Tree**: Bill Walsh → Mike Shanahan → Kyle Shanahan → Sean McVay, Klint Kubiak, Matt LaFleur, Mike McDaniel, Ben Johnson, Kevin O'Connell, Liam Coen, Kevin Stefanski.
- **Andy Reid West Coast / Spread RPO Tree**: Bill Walsh → Andy Reid → John Harbaugh, Shane Steichen, Nick Sirianni, Sean Payton, Chip Kelly.
- **Power Gap & Duo / QB Run Tree**: Vince Lombardi (power sweep patriarch) & Greg Roman.
- **Pete Carroll / Robert Saleh Wide-9 Tree**: Pete Carroll → Robert Saleh, Dan Quinn → DeMeco Ryans.
- **Mike Macdonald Pressure & Hybrid Disguise Tree**: John Harbaugh → Mike Macdonald → Jesse Minter.
- **Vic Fangio Two-High Shell & Quarters Tree**: Vic Fangio → Chris Shula.
- **Bill Belichick / Brian Flores Psycho Blitz Tree**: Bill Belichick → Brian Flores, Steve Spagnuolo, Todd Bowles.

**Historical NFL offense:**
- **Air Coryell / Run and Shoot Vertical Passing Tree**: Don Coryell → June Jones.

**College offense revolutions:**
- **Air Raid Spacing Tree**: Hal Mumme → Mike Leach.
- **Option & Spread Revolution Tree**: Paul Johnson (flexbone), Urban Meyer (spread-option), Chris Ault (pistol), Art Briles (vertical choice).
- **Delaware Wing-T Deception Tree**: Tubby Raymond.

**Historical NFL defense:**
- **Buddy Ryan 46 Pressure Tree**: Buddy Ryan — the eight-man box with zero deep-middle help.
- **LeBeau Zone Blitz Fire Zone Tree**: Dick LeBeau → Dom Capers — send five, drop a lineman.
- **Landry / Doomsday Front Tree**: Tom Landry (Flex) → Jimmy Johnson (speed 4-3).
- **Phillips Two-Gap 3-4 Tree**: Bum Phillips.
- **Two-Deep Shell / Tampa 2 Tree**: Tony Dungy → Lovie Smith; Marvin Lewis (Cover 2 Man-Under).

**Current college defense:**
- **Modern College Hybrid Front Tree**: Dave Aranda (tite/peso) & Rocky Long (3-3-5 stack).

---

## 🔬 Mathematical & Engine Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 View Layer                  │
│   <Field />   <Timeline />   <TelemetryHUD />   <TreeGraph />  │
└───────────────────────────▲────────────────────────────┘
                            │ (Interpolated Frame at timestamp t)
┌───────────────────────────┴────────────────────────────┐
│                    SchemeDB Core Engine                │
│  - interpolatePlay() -> Catmull-Rom Centripetal Spline │
│  - calculateConflictTelemetry() -> Vector Displacement  │
│  - getActiveBeat() -> Chronological Stage Lookup       │
│  - validatePlay() / validateLibrary()                  │
└───────────────────────────▲────────────────────────────┘
                            │ (Strictly Typed Play Data)
┌───────────────────────────┴────────────────────────────┐
│                    Data Layer (.ts)                    │
│  180 Play Definitions  •  45 Systems  •  53 Coaches    │
│        Era-Tagged: past-nfl / past-college /           │
│        current-college / modern-nfl                    │
└────────────────────────────────────────────────────────┘
```

1. **Centripetal Catmull-Rom Spline Interpolation**:
   Paths are interpolated using centripetal parameterization ($\alpha = 0.5$) across keyframes $(P_0, P_1, P_2, P_3)$, eliminating cusp self-intersections and preserving realistic momentum through sharp cuts:
   $$t_{i+1} = t_i + ||P_{i+1} - P_i||^\alpha$$

2. **LOS-Relative Coordinate Space**:
   All 22 player positions are authored in football-native yard coordinates:
   - $X \in [0.0, 53.33]$ (sideline to sideline; $26.67$ = center hash midpoint)
   - $Y = 0.0$ at the Line of Scrimmage (LOS)
   - $Y < 0$: Offensive backfield
   - $Y > 0$: Defensive backfield / downfield routes

3. **Disguise Conflict Metric**:
   Measures Euclidean distance displacement $\Delta d$ of key conflict defenders (e.g. Mike LB, backside Edge) between base and counter concepts at critical keyframe intervals ($t = 0.0\text{s} \to 1.2\text{s}$):
   $$\text{Displacement} = \sqrt{(x_{\text{base}}(t) - x_{\text{counter}}(t))^2 + (y_{\text{base}}(t) - y_{\text{counter}}(t))^2}$$

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` / `K` | Play / Pause animation |
| `←` / `→` (or `J` / `L`) | Step backward / forward by 0.1 seconds |
| `B` / `N` | Step to Previous / Next key tactical beat |
| `R` | Reset playback to snap (`t = 0.0s`) |
| `[` / `]` | Previous / Next play in active scheme |
| `Shift+[` / `Shift+]` | Previous / Next scheme system |
| `1` | Switch to **Film Room Visualizer** view |
| `2` | Switch to **Scheme Catalog** view |
| `3` | Switch to **Coaching Trees** view |
| `4` | Switch to **Sequence Matrix** view |
| `?` | Toggle Workstation Guide & Shortcuts modal |
| `Esc` | Dismiss open modals / popovers |

---

## 🛠 Tech Stack

| Layer | Technology | Key Details |
|---|---|---|
| **Runtime & PM** | **Bun** | High-performance JS/TS runtime & dependency resolution |
| **Bundler** | **Vite 8** (Rolldown engine) | Sub-100ms HMR and tree-shaken ESM builds |
| **UI Framework** | **React 19** | Zero external component bloat; pure state & SVG primitives |
| **Language** | **TypeScript 5.x** | Full type safety (`strict: true`) across 180 play data modules |
| **Test Suite** | **Vitest** | 72 unit & integration tests sweeping whole-library validation & SEO |
| **Styling** | **Custom Dark Turf CSS** | High-contrast All-22 coaching terminal aesthetic |

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.0 or higher)

### Setup & Run
```bash
# Clone the repository
git clone https://github.com/harlanljones/scheme-db.git
cd scheme-db

# Install dependencies with Bun
bun install

# Start development server
bun run dev

# Run Vitest test suite
bun run test

# Typecheck & production build
bun run build && bun run typecheck
```

---

## 🤝 Contributing

Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for our coordinate standards, validation rules, and PR guide.

---

## 📄 License

Distributed under the [MIT License](LICENSE). Copyright © 2026 Harlan Jones.
