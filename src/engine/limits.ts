/**
 * The numbers the movement checks (`motion.ts`) hold every play to, in one place. Speeds are yards per second,
 * accelerations yards per second squared, times seconds.
 *
 * Each check has a `warn` line and an `error` line. A play over `warn` looks wrong to a football reader; a play over
 * `error` shows something a person cannot do. While `MOTION_ENFORCED` is false every finding is reported as a warning
 * and nothing fails CI; once the library is clean it is switched on and findings at the `error` line fail the build.
 *
 * Where the numbers come from:
 *  - Speed. NFL players top out at about 10 to 10.5 yd/s (23 mph). Over a 0.1 s step the warn line sits at that and
 *    the error line a yard and a half above it, which leaves room for the tracking data's own noise.
 *  - Acceleration. Measured over half a second (see `ACCELERATION_WINDOW_SECONDS`), because the spline changes speed
 *    at every waypoint and a 0.1 s difference reads 20 to 40 yd/s² on ordinary plays. The compiler's receivers, which
 *    are fitted to the rounded NFL Big Data Bowl constants in `src/spec/calibration.ts`, peak at 11.6 yd/s² on this
 *    measure (their start from rest), so the warn line is 12, the lowest value that does not flag them.
 *  - The football rules. One offensive player may be in motion at the snap, he may not be moving toward the line of
 *    scrimmage, and after a shift every offensive player must be set for a full second. The speed and time thresholds
 *    that turn those rules into numbers are this project's own and are not measured.
 */
export const LIMITS = {
  /** Speed over any 0.1 s step. */
  speed: { warn: 10.5, error: 12 },
  /** Speed change over half a second. */
  acceleration: { warn: 12, error: 16 },
  /** A player faster than this over the last 0.1 s before the snap counts as moving at the snap. */
  movingAtSnap: 1.5,
  /** A player in motion may drift this fast toward the line of scrimmage at the snap before it counts as moving toward it. */
  towardLineTolerance: 1,
  /** A player slower than this counts as set (still). The spline creeps a little after a stop, so zero is too strict. */
  still: 0.5,
  /** Seconds every offensive player must be set before the snap after a shift. */
  setSeconds: 1,
} as const;

/**
 * Whether findings at the `error` line fail validation. False reports every finding as a warning. It is switched on
 * with the same change that fixes the library, and a test then keeps the library under the error line.
 */
export const MOTION_ENFORCED = false;
