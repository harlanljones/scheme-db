import type { Point } from '../engine/interpolate';

export interface FormationAlignments {
  offense: Record<string, Point>;
  defense: Record<string, Point>;
}

/**
 * 21 Personnel Offset-I Wing Right vs 4-3 Over Front Cover 3 Sky
 */
export const SHANAHAN_21P_OFFSET_I_VS_OVER_C3: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    TE: { x: 31.8, y: -0.6 },
    QB: { x: 26.67, y: -1.8 },
    FB: { x: 28.2, y: -3.5 },
    RB: { x: 26.67, y: -5.8 },
    X: { x: 7.0, y: -0.5 },
    Z: { x: 46.0, y: -1.5 },
  },
  defense: {
    WDE: { x: 21.8, y: 0.9 },
    NT: { x: 25.8, y: 0.9 },
    '3T': { x: 29.2, y: 0.9 },
    SDE: { x: 33.0, y: 0.9 },
    WILL: { x: 21.0, y: 4.5 },
    MIKE: { x: 26.0, y: 4.8 },
    SAM: { x: 31.5, y: 3.8 },
    LCB: { x: 7.0, y: 7.0 },
    RCB: { x: 46.0, y: 7.0 },
    SS: { x: 34.0, y: 8.5 },
    FS: { x: 26.67, y: 14.0 },
  },
};


/**
 * 12 Personnel Condensed Wing Right vs 4-3 Over Front (Cover 3 Single-High)
 * Hallmark Klint Kubiak formation with tight WR splits and an H-Back (H) sniffer.
 */
export const KUBIAK_12P_CONDENSED_WING_VS_43: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    TE: { x: 31.8, y: -0.5 },
    H: { x: 29.5, y: -2.2 },
    QB: { x: 26.67, y: -1.8 },
    RB: { x: 26.67, y: -4.8 },
    X: { x: 13.5, y: -0.5 },
    Z: { x: 39.5, y: -0.8 },
  },
  defense: {
    WDE: { x: 21.8, y: 0.9 },
    NT: { x: 25.8, y: 0.9 },
    '3T': { x: 29.2, y: 0.9 },
    SDE: { x: 33.0, y: 0.9 },
    WILL: { x: 21.5, y: 4.5 },
    MIKE: { x: 26.0, y: 4.8 },
    SAM: { x: 31.0, y: 4.0 },
    LCB: { x: 13.5, y: 6.5 },
    RCB: { x: 39.5, y: 6.5 },
    SS: { x: 33.5, y: 8.0 },
    FS: { x: 26.67, y: 13.5 },
  },
};

/**
 * Robert Saleh 4-3 Over Wide-9 Defense vs 11 Personnel Gun 3x1 (Trips Right)
 */
export const SALEH_43_OVER_WIDE9_VS_11P: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 29.5, y: -4.5 },
    TE: { x: 31.8, y: -0.6 },
    X: { x: 7.0, y: -0.5 },
    H: { x: 37.0, y: -0.8 },
    Z: { x: 45.5, y: -0.8 },
  },
  defense: {
    WDE: { x: 20.5, y: 0.9 },
    NT: { x: 25.8, y: 0.9 },
    '3T': { x: 29.2, y: 0.9 },
    SDE: { x: 34.0, y: 0.9 },
    WILL: { x: 21.5, y: 4.5 },
    MIKE: { x: 26.0, y: 4.8 },
    SAM: { x: 33.0, y: 3.8 },
    LCB: { x: 7.0, y: 6.5 },
    RCB: { x: 45.5, y: 6.5 },
    SS: { x: 34.5, y: 8.5 },
    FS: { x: 26.67, y: 13.5 },
  },
};

/**
 * Mike Macdonald Hybrid Double-A Mug Front vs 11 Personnel Gun 2x2
 */
export const MACDONALD_MUG_AMOEBA_VS_11P: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 23.5, y: -4.5 },
    X: { x: 8.0, y: -0.5 },
    H: { x: 16.0, y: -0.8 },
    Y: { x: 36.5, y: -0.8 },
    Z: { x: 45.5, y: -0.5 },
  },
  defense: {
    WDE: { x: 20.5, y: 0.9 },
    NT: { x: 25.2, y: 0.9 },
    '3T': { x: 28.1, y: 0.9 },
    SDE: { x: 32.8, y: 0.9 },
    WILL: { x: 25.8, y: 0.8 },
    MIKE: { x: 27.5, y: 0.8 },
    NICKEL: { x: 16.0, y: 4.5 },
    LCB: { x: 8.0, y: 6.0 },
    RCB: { x: 45.5, y: 6.0 },
    SS: { x: 35.0, y: 10.5 },
    FS: { x: 19.5, y: 11.5 },
  },
};

/**
 * Andy Reid 11 Personnel Gun Trips Right vs Nickel 4-2-5 Two-High (MOFO)
 */
export const REID_11P_GUN_TRIPS_VS_MOFO: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 23.5, y: -4.5 },
    X: { x: 7.0, y: -0.5 },
    H: { x: 36.0, y: -0.8 }, // Slot / Kelce alignment
    Y: { x: 41.5, y: -0.8 },
    Z: { x: 47.0, y: -0.5 },
  },
  defense: {
    WDE: { x: 21.0, y: 0.9 },
    NT: { x: 25.5, y: 0.9 },
    '3T': { x: 29.0, y: 0.9 },
    SDE: { x: 32.5, y: 0.9 },
    WILL: { x: 23.5, y: 4.5 },
    MIKE: { x: 28.0, y: 4.5 },
    NICKEL: { x: 36.0, y: 4.0 },
    LCB: { x: 7.0, y: 6.5 },
    RCB: { x: 47.0, y: 6.5 },
    SS: { x: 37.0, y: 12.0 },
    FS: { x: 21.0, y: 12.0 },
  },
};

/**
 * Vic Fangio Penny 5-1-5 / 3-4 Tite Front (2-High Quarters Shell) vs 11 Personnel 2x2
 */
export const FANGIO_PENNY_515_VS_11P: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 29.5, y: -4.5 },
    X: { x: 7.5, y: -0.5 },
    H: { x: 16.0, y: -0.8 },
    Y: { x: 37.0, y: -0.8 },
    Z: { x: 46.0, y: -0.5 },
  },
  defense: {
    LOLB: { x: 20.0, y: 0.9 }, // Stand-up Edge
    '4iL': { x: 24.2, y: 0.9 }, // 4i Tech DT
    NOSE: { x: 26.67, y: 0.9 }, // 0-Tech Nose
    '4iR': { x: 29.1, y: 0.9 }, // 4i Tech DT
    ROLB: { x: 33.3, y: 0.9 }, // Stand-up Edge
    MIKE: { x: 26.67, y: 4.5 }, // Lone interior ILB
    STAR: { x: 16.0, y: 4.5 }, // Nickel / Star DB
    LCB: { x: 7.5, y: 6.5 },
    RCB: { x: 46.0, y: 6.5 },
    BS: { x: 18.0, y: 12.0 }, // Boundary Safety (2-high)
    FS: { x: 35.0, y: 12.0 }, // Field Safety (2-high)
  },
};

/**
 * Brian Flores Psycho 7-Man Mug Front vs 11 Personnel Gun 3x1
 */
export const FLORES_PSYCHO_MUG_VS_11P: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 23.5, y: -4.5 },
    X: { x: 7.0, y: -0.5 },
    H: { x: 36.5, y: -0.8 },
    Y: { x: 41.5, y: -0.8 },
    Z: { x: 47.0, y: -0.5 },
  },
  defense: {
    EDGE_L: { x: 20.0, y: 0.8 },
    LB_A1: { x: 24.5, y: 0.8 }, // Mugging A-Gap
    LB_A2: { x: 26.0, y: 0.8 }, // Mugging A-Gap
    LB_B1: { x: 27.5, y: 0.8 }, // Mugging B-Gap
    LB_B2: { x: 29.0, y: 0.8 }, // Mugging B-Gap
    EDGE_R: { x: 33.0, y: 0.8 },
    LURKER: { x: 26.67, y: 3.5 }, // Central floating robber/spy
    LCB: { x: 7.0, y: 1.5 }, // Press man
    RCB: { x: 47.0, y: 1.5 }, // Press man
    SLOT_CB: { x: 36.5, y: 1.8 }, // Press slot
    FS: { x: 41.5, y: 2.2 }, // Overhang / deep safety
  },
};

/**
 * Sean McVay Condensed 11 Personnel Bunch Right vs Nickel 4-2-5 (Two-High / Single-High Match)
 * Tight WR splits and condensed alignments foundational to Duo, Sail, and Crosser concepts.
 */
export const MCVAY_11P_CONDENSED_BUNCH_VS_NICKEL: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -1.8 },
    RB: { x: 26.67, y: -4.8 },
    TE: { x: 31.8, y: -0.6 },
    X: { x: 10.0, y: -0.5 },
    H: { x: 34.5, y: -1.2 }, // Condensed slot (Kupp role)
    Z: { x: 37.0, y: -0.5 }, // Condensed flanker point
  },
  defense: {
    WDE: { x: 21.0, y: 0.9 },
    NT: { x: 25.5, y: 0.9 },
    '3T': { x: 29.2, y: 0.9 },
    SDE: { x: 32.8, y: 0.9 },
    WILL: { x: 23.5, y: 4.5 },
    MIKE: { x: 27.5, y: 4.8 },
    NICKEL: { x: 35.0, y: 4.0 },
    LCB: { x: 10.0, y: 6.5 },
    RCB: { x: 38.0, y: 6.5 },
    SS: { x: 34.0, y: 9.5 },
    FS: { x: 25.0, y: 13.0 },
  },
};

/**
 * Mike McDaniel 21 Personnel Speed Pistol/Gun vs 4-3 Under Front
 * Features cheat-motion alignment for explosive perimeter leverage.
 */
export const MCDANIEL_21P_SPEED_VS_43: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 26.67, y: -6.8 },
    FB: { x: 28.8, y: -2.2 }, // Sniffer / H-back
    TE: { x: 31.8, y: -0.6 },
    X: { x: 8.0, y: -0.5 },
    Z: { x: 42.0, y: -1.5 }, // Speed cheat motion flanker
  },
  defense: {
    WDE: { x: 20.5, y: 0.9 },
    NT: { x: 25.2, y: 0.9 },
    '3T': { x: 29.0, y: 0.9 },
    SDE: { x: 33.2, y: 0.9 },
    WILL: { x: 22.5, y: 4.5 },
    MIKE: { x: 27.0, y: 4.8 },
    SAM: { x: 32.5, y: 3.8 },
    LCB: { x: 8.0, y: 6.5 },
    RCB: { x: 42.0, y: 6.5 },
    SS: { x: 35.0, y: 8.5 },
    FS: { x: 26.67, y: 14.0 },
  },
};



/**
 * Kevin Stefanski 13 Personnel Heavy Wing Right vs 4-3 Over Front (Cover 3 Sky)
 * Heavy condensed front with 3 tight ends (Inline Y, Wing F, Backside Inline U).
 */
export const STEFANSKI_13P_HEAVY_WING_VS_43: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    Y: { x: 31.8, y: -0.5 },
    F: { x: 33.6, y: -0.8 },
    U: { x: 21.6, y: -0.5 },
    QB: { x: 26.67, y: -1.8 },
    RB: { x: 26.67, y: -4.8 },
    X: { x: 9.0, y: -0.5 },
  },
  defense: {
    WDE: { x: 20.2, y: 0.9 },
    NT: { x: 25.8, y: 0.9 },
    '3T': { x: 29.2, y: 0.9 },
    SDE: { x: 34.8, y: 0.9 },
    WILL: { x: 21.5, y: 4.5 },
    MIKE: { x: 26.5, y: 4.8 },
    SAM: { x: 33.0, y: 4.0 },
    LCB: { x: 9.0, y: 6.5 },
    RCB: { x: 42.0, y: 7.5 },
    SS: { x: 35.0, y: 8.5 },
    FS: { x: 26.67, y: 13.5 },
  },
};

/**
 * Shane Steichen 11 Personnel Gun Spread / Trips vs Nickel 4-2-5 Over Front
 * Spread alignment with dual-threat QB, sidecar RB, slot WR H, and attached TE.
 */
export const STEICHEN_11P_GUN_SPREAD_VS_NICKEL: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 23.5, y: -4.5 },
    TE: { x: 32.0, y: -0.6 },
    X: { x: 7.5, y: -0.5 },
    H: { x: 37.0, y: -0.8 },
    Z: { x: 46.0, y: -0.5 },
  },
  defense: {
    WDE: { x: 21.0, y: 0.9 },
    NT: { x: 25.5, y: 0.9 },
    '3T': { x: 29.0, y: 0.9 },
    SDE: { x: 33.0, y: 0.9 },
    WILL: { x: 23.5, y: 4.5 },
    MIKE: { x: 28.0, y: 4.5 },
    NICKEL: { x: 36.5, y: 4.0 },
    LCB: { x: 7.5, y: 6.5 },
    RCB: { x: 46.0, y: 6.5 },
    SS: { x: 36.0, y: 11.5 },
    FS: { x: 20.0, y: 11.5 },
  },
};

/**
 * Ben Johnson 11 Personnel Gun Trips Left vs Nickel 4-2-5 Under Front
 * Detroit-style spread with motion-heavy pre-snap and dual-threat misdirection packaging.
 */
export const JOHNSON_11P_GUN_TRIPS_VS_NICKEL: FormationAlignments = {
  offense: {
    C: { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 30.0, y: -4.5 },
    TE: { x: 21.0, y: -0.6 },
    X:  { x: 46.0, y: -0.5 },
    H:  { x: 12.0, y: -1.0 },
    Z:  { x:  7.5, y: -0.5 },
  },
  defense: {
    WDE:    { x: 22.0, y: 0.9 },
    NT:     { x: 26.0, y: 0.9 },
    '3T':   { x: 29.5, y: 0.9 },
    SDE:    { x: 32.5, y: 0.9 },
    WILL:   { x: 24.5, y: 4.5 },
    MIKE:   { x: 28.5, y: 4.5 },
    NICKEL: { x: 18.0, y: 3.8 },
    LCB:    { x: 46.0, y: 6.5 },
    RCB:    { x:  7.5, y: 6.5 },
    SS:     { x: 14.0, y: 11.5 },
    FS:     { x: 35.0, y: 11.5 },
  },
};

/**
 * Sean Payton 11 Personnel Gun Spread 2x2 vs Nickel 4-2-5
 * Balanced 2x2 quick-game framework: wide X/Z outside, H slot right,
 * attached TE — built for slant-flat rhythm throws and fast screens.
 */
export const PAYTON_11P_GUN_SPREAD_VS_NICKEL: FormationAlignments = {
  offense: {
    C:  { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 23.5, y: -4.8 },
    TE: { x: 32.0, y: -0.6 },
    X:  { x: 7.0, y: -0.5 },
    H:  { x: 37.5, y: -1.0 },
    Z:  { x: 46.0, y: -0.5 },
  },
  defense: {
    WDE:    { x: 21.0, y: 0.9 },
    NT:     { x: 25.5, y: 0.9 },
    '3T':   { x: 29.0, y: 0.9 },
    SDE:    { x: 33.0, y: 0.9 },
    WILL:   { x: 23.0, y: 4.5 },
    MIKE:   { x: 28.5, y: 4.5 },
    NICKEL: { x: 37.5, y: 4.0 },
    LCB:    { x: 7.0, y: 6.5 },
    RCB:    { x: 46.0, y: 6.5 },
    SS:     { x: 34.0, y: 11.5 },
    FS:     { x: 20.0, y: 12.0 },
  },
};

/**
 * Greg Roman 22 Personnel Heavy Wing Right (Under Center) vs 4-3 Over Front
 * Downhill gap-scheme foundation: double TE with a fullback kick-out lead,
 * single detached X, QB under center — pure power-read/QB-run environment.
 */
export const ROMAN_22P_HEAVY_WING_VS_43: FormationAlignments = {
  offense: {
    C:  { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    TE: { x: 31.8, y: -0.6 },
    U:  { x: 33.8, y: -1.2 }, // Wing TE
    QB: { x: 26.67, y: -1.8 }, // Under center
    RB: { x: 26.67, y: -5.5 },
    F:  { x: 28.4, y: -3.4 }, // Fullback
    X:  { x: 7.5, y: -0.5 },
  },
  defense: {
    WDE:  { x: 21.8, y: 0.9 },
    NT:   { x: 25.8, y: 0.9 },
    '3T': { x: 29.2, y: 0.9 },
    SDE:  { x: 33.4, y: 0.9 },
    WILL: { x: 21.5, y: 4.5 },
    MIKE: { x: 26.0, y: 4.8 },
    SAM:  { x: 32.5, y: 3.8 },
    LCB:  { x: 7.5, y: 7.0 },
    RCB:  { x: 43.5, y: 7.0 },
    SS:   { x: 34.5, y: 9.0 },
    FS:   { x: 26.67, y: 14.0 },
  },
};

/**
 * Kevin O'Connell 11 Personnel Condensed Gun Right vs 4-3 Over (Cover 3 Shell)
 * McVay-tree condensed splits in gun: tight H/Z to the right with an inline TE,
 * engineered for boot flood rollouts and Dagger seam/curl-flat shots.
 */
export const OCONNELL_11P_CONDENSED_GUN_VS_43: FormationAlignments = {
  offense: {
    C:  { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 29.8, y: -4.8 },
    TE: { x: 31.8, y: -0.6 },
    X:  { x: 9.5, y: -0.5 },
    H:  { x: 34.5, y: -1.2 }, // Condensed slot
    Z:  { x: 37.5, y: -0.8 }, // Condensed flanker
  },
  defense: {
    WDE:  { x: 21.0, y: 0.9 },
    NT:   { x: 25.5, y: 0.9 },
    '3T': { x: 29.2, y: 0.9 },
    SDE:  { x: 33.0, y: 0.9 },
    WILL: { x: 23.0, y: 4.5 },
    MIKE: { x: 27.5, y: 4.8 },
    SAM:  { x: 32.5, y: 3.8 },
    LCB:  { x: 9.5, y: 6.5 },
    RCB:  { x: 40.0, y: 6.5 },
    SS:   { x: 34.0, y: 9.5 },
    FS:   { x: 25.0, y: 13.5 },
  },
};

/**
 * Liam Coen 11 Personnel Gun Wide-Zone Strong 2x1 Right vs Nickel 4-2-5
 * Modern wide-zone-RPO packaging alignment: RB aligned to the zone direction,
 * TE attached right, single X backside, H slot + Z stacked strong.
 */
export const COEN_11P_GUN_WIDEZONE_VS_NICKEL: FormationAlignments = {
  offense: {
    C:  { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -4.5 },
    RB: { x: 30.0, y: -4.8 },
    TE: { x: 31.8, y: -0.6 },
    X:  { x: 7.5, y: -0.5 },
    H:  { x: 36.5, y: -1.0 },
    Z:  { x: 45.5, y: -1.2 },
  },
  defense: {
    WDE:    { x: 21.0, y: 0.9 },
    NT:     { x: 25.5, y: 0.9 },
    '3T':   { x: 29.0, y: 0.9 },
    SDE:    { x: 33.2, y: 0.9 },
    WILL:   { x: 23.0, y: 4.5 },
    MIKE:   { x: 28.0, y: 4.5 },
    NICKEL: { x: 36.5, y: 4.0 },
    LCB:    { x: 7.5, y: 6.5 },
    RCB:    { x: 45.5, y: 6.5 },
    SS:     { x: 36.0, y: 11.5 },
    FS:     { x: 20.0, y: 11.5 },
  },
};

/**
 * Chip Kelly 10 Personnel Tempo Gun Spread 2x2 vs Nickel 4-2-5 Two-High
 * Air Raid spacing at snap-rate tempo: no tight ends, four receivers in a
 * balanced 2x2 (X/H left, Y/Z right) for Mesh, Spot, and Four-Verts takes.
 */
export const KELLY_10P_TEMPO_SPREAD_VS_NICKEL: FormationAlignments = {
  offense: {
    C:  { x: 26.67, y: -0.4 },
    LG: { x: 25.0, y: -0.4 },
    LT: { x: 23.3, y: -0.4 },
    RG: { x: 28.3, y: -0.4 },
    RT: { x: 30.0, y: -0.4 },
    QB: { x: 26.67, y: -5.0 },
    RB: { x: 23.5, y: -5.0 },
    X:  { x: 7.0, y: -0.5 },
    H:  { x: 16.5, y: -1.0 },
    Y:  { x: 37.0, y: -1.0 },
    Z:  { x: 46.5, y: -0.5 },
  },
  defense: {
    WDE:    { x: 21.0, y: 0.9 },
    NT:     { x: 25.5, y: 0.9 },
    '3T':   { x: 29.0, y: 0.9 },
    SDE:    { x: 32.8, y: 0.9 },
    WILL:   { x: 23.5, y: 4.5 },
    MIKE:   { x: 28.0, y: 4.5 },
    NICKEL: { x: 16.5, y: 4.0 },
    LCB:    { x: 7.0, y: 6.5 },
    RCB:    { x: 46.5, y: 6.5 },
    SS:     { x: 34.0, y: 12.0 },
    FS:     { x: 19.5, y: 12.0 },
  },
};


