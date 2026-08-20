# Design System

<!-- impeccable:design-schema 1 -->

## Core Visual World: Tactical Film Room & Coaching Command Station

The interface is built as a high-density, professional film-study workstation for football analysts, coaches, and serious fans. It rejects generic SaaS dashboard tropes (soft gradients, playful emojis, arbitrary rounded cards, and side-tab borders) in favor of authentic All-22 diagramming, high-contrast turf geometry, and precision telemetry.

---

## 1. Color Palette & Tactical Accents

| Token | Hex / Value | Usage |
|---|---|---|
| `--bg-canvas` | `#060911` | Deep command night root canvas background |
| `--bg-surface` | `#0b1120` | Primary panel surface & container background |
| `--bg-surface-elevated` | `#111a2e` | Elevated cards, active items, hover states |
| `--border-subtle` | `#1a2744` | Structural containment dividers |
| `--border-medium` | `#2a3b60` | Interactive card outlines & subtle focus rings |
| `--text-primary` | `#f8fafc` | High-contrast headings and active telemetry values |
| `--text-secondary` | `#94a3b8` | Subtitles, secondary metrics, labels |
| `--text-muted` | `#64748b` | Timestamps, micro-labels, metadata markers |
| `--accent-offense` | `#f59e0b` | Offensive tracks, ball-carrier paths, Amber QB halo |
| `--accent-defense` | `#38bdf8` | Defensive shell, coverage vectors, Cyan LOS glow |
| `--accent-conflict` | `#ef4444` | Key conflict read defender, divergence alert ping |
| `--accent-firstdown` | `#eab308` | First down marker & line |
| `--turf-dark` | `#07140e` / `#0a1f15` | Dark mower band turf tone |
| `--turf-light` | `#0d281c` / `#112c20` | Light mower band turf tone |
| `--turf-chalk` | `rgba(255, 255, 255, 0.45)` | Crisp yardlines, hash marks, yard numbers |

---

## 2. Typography

* **Display Headings**: `'Chivo', 'Inter', -apple-system, sans-serif` (uppercase, tracked `-0.02em`, bold weight 800–900).
* **UI & Body**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (neutral, high legibility).
* **Technical Telemetry & Notation**: `'JetBrains Mono', 'SF Mono', Consolas, monospace` (tabular numbers for timecode `00:01.20`, down & distance `1st & 10`, speed indicators `0.5x`, personnel tags `21 PERS`).

---

## 3. Component Design Language

1. **All-22 Field & Player Tokens**:
   - Vector SVG with official NFL hash spacing (70'9" from sidelines, 18.5' hash width).
   - Offense in dark titanium tokens with Amber-gold rims and orientation heading notches.
   - Defense in midnight slate-navy with Sky-Cyan rims.
   - Primary conflict defender pulsates with an active animated Crimson radar reticle and `READ KEY` badge.
   - Motion paths categorized by role: routes (Cyan), blocks (Amber with T-bar cap), carries (Rose/Crimson), and drops (Dashed blue).

2. **Playback Deck**:
   - Formatted timecode display (`00:01.20`).
   - Frame stepping (`⏮ -0.1s`, `+0.1s ⏭`), playhead needle with diamond cap, speed toggles (`0.25x` to `1.5x`), and clickable timeline beat flags.

3. **Analysis Console**:
   - Structured four-tier hierarchy: Blueprint & Personnel, Tactical Objective, Live Synchronized Beat Tracker with real-time highlight pulses, and Coaching Takeaways.

4. **Sequencing Matrix & Coaching Tree**:
   - Disguise mesh comparison analyzer highlighting the `0.0s – 1.2s` mirror window.
   - Interactive zoom/pan hierarchical tree tracing Walsh → Shanahan / Carroll / Belichick → 2026 modern coaching descendants.

5. **Contextual Football Glossary & Popovers**:
   - Inline tactical term detection with dotted underline accent (`--accent-offense` / `--accent-defense`).
   - Popover card with Category badge, concise technical definition, and Tactical Scheme Note in elevated surface container (`--bg-surface-elevated`) with subtle drop shadow.

6. **Accessibility & Resilience**:
   - Full keyboard navigation and ARIA labeling on player tokens, play selectors, tree nodes, and timeline controls.
   - Crash-resilient Error Boundary with diagnostic trace and instant recovery action buttons.

