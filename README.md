<div align="center">

# SchemeDB

### Modern NFL Scheme & Disguise Interactive Workstation

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite 8](https://img.shields.io/badge/Vite-8.x_(Rolldown)-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Bun](https://img.shields.io/badge/Bun-1.x-fbf0df?style=flat-square&logo=bun&logoColor=black)](https://bun.sh)
[![Vitest](https://img.shields.io/badge/Tests-71%20Passing%20(100%25)-44CA41?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

*An interactive engineering workstation animating 20 NFL scheme families (80 plays), 6 coaching lineage trees (20 coaches), with 0.0s–1.2s disguise mesh window analysis, Catmull-Rom spline path interpolation, interactive tactical glossary, and real-time conflict telemetry.*

[⚡ Live Demo](#-live-demo) • [🏈 Scheme Catalog](#-scheme-catalog-20-systems--80-plays) • [🌳 Coaching Trees](#-coaching-lineage-trees-6-lineage-trees--20-coaches) • [🔬 Engine Architecture](#-mathematical--engine-architecture) • [⌨️ Shortcuts](#️-keyboard-shortcuts)

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
- **Master Matrix**: Zero-scroll, high-density matrix comparing all 20 systems across offensive and defensive families.
- **Split Playbook Inspector**: Master-detail playbook inspection with instant film-room launching.
- **Tactical Scheme Cards**: Card grid with system tags, conflict keys, and personnel summaries.

### 3. 🌳 Coaching Lineage Tree Explorer (`Key: 3`)
- **Interactive Lineage Graph**: Vector-rendered coaching trees with pan, zoom, pinch-to-zoom, and mini-map navigation.
- **20 Coach Profiles & 6 Lineages**: Detailed scheme philosophies, career milestones, 2026 roles, and direct cross-links into playable systems.
- **Lineage Tree Clustering**: Grouped scheme pickers organized by coaching heritage (*Shanahan/Kubiak, Reid West Coast, Carroll/Saleh Wide-9, Macdonald Pressure, Fangio Two-High, Belichick/Flores*).
- **Global Search**: Filter by coach, schematic philosophy, or NFL franchise.

### 4. 🧬 Disguise Sequence Matrix (`Key: 4`)
- **0.0s – 1.2s Disguise Window Analyzer**: Quantitative comparison of base vs constraint looks during defender read keys.
- **Ghost Overlay Mode**: Renders base and constraint trajectories simultaneously on a unified SVG canvas with translucent ghost paths.
- **Side-by-Side Mode**: Synchronized dual-field playback with locked scrubbers.
- **Live Conflict Telemetry HUD**: Real-time visual similarity score (%) and conflict defender displacement calculation.

---

## 🏈 Scheme Catalog (20 Systems • 80 Plays)

The library contains **80 hand-authored, mathematically validated plays** across 20 systems (4 plays per system):

### ⚡ Offensive Systems (10 Systems • 40 Plays)
1. **Kyle Shanahan — Wide Zone & Bootleg Sequencing** (`SF`): *Outside Zone Left, PA Deep Over, Naked Bootleg Flood, Jet Motion Wide Zone*
2. **Klint Kubiak — Split-Zone & Y-Leak Constraint** (`LV/SF`): *Split-Zone Slice, PA Dagger Shot, Boot Throwback Y-Leak, Orbit Toss*
3. **Andy Reid — West Coast Spread-RPO & Spacing** (`KC`): *Mesh Shallow Cross, Power Shovel Option, RPO Glance Post, Sprintout Smash-Wheel*
4. **Sean McVay — Condensed Duo & Play-Action Attack** (`LAR`): *11P Duo Lead Inside Power, PA 3-Level Sail Flood, Condensed PA Deep Crosser, Duo Glance RPO Orbit Screen*
5. **Mike McDaniel — Speed Cheat-Motion & Space Attack** (`LAC/MIA`): *21P Cheat-Motion Toss Crack, Cheat-Motion Wheel Shot, Inside Zone Wham Trap, Pistol Speed Option Pitch*
6. **Kevin Stefanski — Multi-TE Gap & Under-Center PA** (`ATL/CLE`): *13P Heavy Pin & Pull Sweep, PA Seam Shot, Naked Bootleg Slide, Counter Gap Lead*
7. **Shane Steichen — QB Mesh & Spread RPO System** (`IND/PHI`): *Gun QB Power Read, Gun Mesh Rail Wheel, Gun Zone-Read Bubble RPO, Gun 4-Verticals Switch*
8. **Matt LaFleur — Illusion of Complexity & Deep Shots** (`GB`): *12P Wide Zone Cutback, PA Cross-Country Post, Pony 21P Bubble Wheel, PA Dagger Dig*
9. **Nick Sirianni — Power RPO & Brotherly Shove** (`PHI`): *11P Power Duo Inside, 11P RPO Glance Isolation, 11P Slot Fade Out, Brotherly Shove QB Sneak*
10. **Ben Johnson — Counter Deception & Gadget Offense** (`CHI/DET`): *11P Counter Trey Lead, PA TE Throwback Leak, Hook-Ladder Mesh TE Stack, Orbit Reverse Screen Wheel*

### 🛡 Defensive Systems (10 Systems • 40 Plays)
11. **Robert Saleh — 4-3 Wide-9 & Cover 3 Match** (`SF/NYJ`): *Cover 3 Rip/Liz Match, Cover 6 Split-Field Bracket, Cross-Dog Fire Zone 3, NASCAR Package Cover 1 Robber*
12. **Mike Macdonald — Sim-Pressure & Disguise** (`SEA/BAL`): *Double-A Mug Cover 2 Buzz, Simulated Creeper Overload, Split-Field Quarters Trap, Amoeba Front Cover 0 Peel*
13. **Brian Flores — Psycho Front & Binary Blitz** (`MIN`): *Cover 0 All-Out House Blitz, Drop-8 Psycho Lurk Bluff, Cross-Dog Fire Zone Hot, Bracket Doubles Star Match*
14. **Vic Fangio — Two-High Shell & Quarters Family** (`PHI/DEN`): *Cover 6 Quarter-Quarter-Half, Penny Front Match Quarters, Cover 8 Boundary Trap, Tite Front 4-Man Sim Creeper*
15. **Jesse Minter — Amoeba Front & Creepers** (`BAL/LAC`): *Amoeba 6-Up Fire Zone 3, Nickel Slot Blitz Creeper, Cover 1 Robber Lurk, Double-A Mug Cover 0 Peel Blitz*
16. **DeMeco Ryans — Wide-9 Attack & Match Coverage** (`HOU`): *Wide-9 Under Front Tackle Wrap, Cover 2 Palms Match Split-Field, Double-A Mug Cover 1 Hole Robber, Overload Boundary Edge Fire Zone*
17. **Chris Shula — Match Quarters & Penny Front** (`LAR`): *Tite Front B-Gap Pinch Match Quarters, Penny 5-1-5 Bracket vs Condensed Bunch, Split-Field Cover 8, Boundary Creeper Drop-7*
18. **Steve Spagnuolo — Exotic Blitz & Sim Pressures** (`KC`): *Corndog Corner Blitz Fire Zone, Cross Creeper Drop-8 Sim, Cover 0 Max Heat House Blitz, Split Safety Invert Cover 2 Trap*
19. **Dan Quinn — Cover 3 Press-Bail & Under Front** (`WAS/SEA`): *Cover 3 Press-Bail Single-High, 4-3 Under Front Overload Rush, Cover 1 Rat-in-the-Hole Lurk, Safety Sky Fire Zone 3*
20. **Todd Bowles — Creeper Blitz & Psycho Front** (`TB`): *Dual A-Gap Cross Blitz Hot 2-3, Overload Boundary Fire Zone, Drop-8 Tampa 2 Lurk Coverage, Peel-Zone Simulated Pressure*

---

## 🌳 Coaching Lineage Trees (6 Lineage Trees • 20 Coaches)

- **Shanahan / Kubiak Wide-Zone Tree**: Bill Walsh → Mike Shanahan & Gary Kubiak → Kyle Shanahan, Sean McVay, Klint Kubiak, Matt LaFleur, Kevin Stefanski, Mike McDaniel, Mike LaFleur, Ben Johnson.
- **Andy Reid West Coast / Spread RPO Tree**: Bill Walsh → Andy Reid → John Harbaugh, Shane Steichen, Nick Sirianni.
- **Pete Carroll / Robert Saleh Wide-9 Tree**: Pete Carroll → Robert Saleh, Dan Quinn → DeMeco Ryans.
- **Mike Macdonald Pressure & Hybrid Disguise Tree**: John Harbaugh → Mike Macdonald → Jesse Minter.
- **Vic Fangio Two-High Shell & Quarters Tree**: Vic Fangio → Chris Shula.
- **Bill Belichick / Brian Flores Psycho Blitz Tree**: Bill Belichick → Brian Flores, Steve Spagnuolo, Todd Bowles.

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
│   80 Play Definitions  •  20 Systems  •  20 Coaches    │
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
| **Language** | **TypeScript 5.x** | Full type safety (`strict: true`) across 80 play data modules |
| **Test Suite** | **Vitest** | 71 unit & integration tests sweeping whole-library validation & SEO |
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
