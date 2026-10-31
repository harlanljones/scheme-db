/**
 * Constants the compiler uses, fitted to NFL player tracking and rounded to one or two significant figures.
 *
 * Source: NFL Big Data Bowl 2025, NFL Next Gen Stats tracking for weeks 1 to 9 of the 2022 season (10 Hz, about 136
 * games), released by the NFL for the Big Data Bowl under CC BY-NC 4.0. Each value is a median or a least-squares fit
 * over thousands of plays, found with the analysis in the "Compiler v0 against real NFL data" report. This repository
 * holds the rounded constants only: no tracking rows, no per-play measurements. Where a value comes from coaching
 * sources instead, the comment says so. See specs/README.md.
 *
 * Distances are yards, times are seconds from the snap, and the field is LOS-relative (y negative = backfield).
 */

/**
 * Receivers start from rest: distance after `u` seconds of running is `V * (u - tau * (1 - e^(-u / tau)))`, where
 * `u` is the time since the player started moving. A wide receiver on a go route is about 0.7 yd downfield after 0.7 s,
 * 2.7 after 1.2 s, 7.6 after 2.0 s and 19.6 after 3.8 s. The exponential-sprint shape is standard sports science.
 */
export const RECEIVER = {
  /** Seconds between the snap and the first step. */
  delay: 0.4,
  tau: 0.5,
  /** Fitted top speed in yards per second on a go route, by position. */
  topSpeed: { wr: 7, te: 6.5, rb: 6 },
} as const;

/**
 * Pass rushers: yards into the backfield after `u` seconds of rushing is `reach * (1 - e^(-u / tau))`. Edge rushers
 * are about 6 yd deep at 2.0 s and interior rushers about 5 yd at 2.5 s, which matches the median time to pressure of
 * 2.5 s. Edge rushers also drift toward the quarterback, about 1.4 yd per second after 0.6 s, and the data covers
 * about 3 yd of it (by 2.5 s); the compiler stops there instead of extrapolating.
 */
export const RUSH = {
  edge: { delay: 0.4, reach: 14, tau: 3, drift: { delay: 0.6, rate: 1.4, max: 3 } },
  interior: { delay: 0.4, reach: 13, tau: 4.4, drift: null },
} as const;

/**
 * Offensive linemen in pass protection retreat at a steady pace once set, then stop about a yard in front of the
 * quarterback's set point. Tackles also open outward by about `spread` yards at 1.5 s and close again by 2.5 s.
 */
export const PASS_SET = {
  tackle: { delay: 0.4, speed: 2.6, spread: 0.6 },
  guard: { delay: 0.7, speed: 2, spread: 0.4 },
  center: { delay: 0.35, speed: 1.8, spread: 0 },
} as const;
/** Yards a pass blocker stops short of the quarterback's depth at the end of the play. */
export const POCKET_GAP = 1;

/**
 * Quarterback drops: yards back from the alignment after `u` seconds of dropping is `yards * (1 - e^(-u / tau))`.
 * The shotgun drop is measured: about 3 yd back at 2.0 s, set by 1.9 s. The step counts are coaching charting
 * (PFF, 2014): three steps land about 5 yd from the line, five steps about 7.5 and seven steps about 9.5.
 */
export const QB_DROP = {
  gun: { delay: 0.8, yards: 4, tau: 0.9 },
  '3-step': { delay: 0, yards: 3.5, tau: 0.5 },
  '5-step': { delay: 0, yards: 6, tau: 0.7 },
  '7-step': { delay: 0, yards: 8, tau: 0.9 },
} as const;

/**
 * Zone defenders wait, then close on the spot where the throw would land: the share of the way covered is
 * `1 - e^(-u / tau)`. Every zone type moves alike, at about 10% by 1.0 s, 30% by 1.5 s, 50% by 2.0 s and 70% by
 * 2.5 s. Deep halves read the quarterback and start 0.2 s earlier.
 */
export const ZONE_TIMING = { delay: 0.9, tau: 1.3, deepHalfEarly: 0.2 } as const;

/**
 * Man coverage: the defender copies the receiver's path `lag` seconds late, and closes the opening gap after `delay`
 * seconds with time constant `tau`. `finish` is how far deeper than the receiver the defender ends up: press and off
 * defenders end over the top, a trailing defender ends behind.
 */
export const MAN_COVERAGE = { lag: 0.4, delay: 0.5, tau: 1, finish: { press: 0.5, off: 0.5, trail: -0.5 } } as const;
