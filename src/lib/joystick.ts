/**
 * How the walk's thumb stick (see `WalkJoystick`) turns a push into motion:
 * the angle is the direction, the distance from the centre the speed.
 */

/** Below this share of the radius the stick does nothing. */
export const JOYSTICK_DEAD = 0.18;
/** Dragged this far past the rim (as a share of the radius), it runs. */
export const JOYSTICK_RUN = 1.35;

/**
 * The walk a push of (x, y) asks for, measured in radii from the centre with
 * y pointing down the screen: `forward` and `right` from -1 to 1, rescaled so
 * the edge of the dead zone is a standstill rather than a jump to a crawl,
 * and the rim is full walking speed.
 */
export function joystickVector(x: number, y: number): { forward: number; right: number } {
  const reach = Math.hypot(x, y);
  if (reach < JOYSTICK_DEAD) return { forward: 0, right: 0 };
  const speed = Math.min(1, (reach - JOYSTICK_DEAD) / (1 - JOYSTICK_DEAD));
  // `|| 0` turns the -0 of a sideways push into a plain 0.
  return { forward: (-y / reach) * speed || 0, right: (x / reach) * speed || 0 };
}

/** Whether a push is far enough past the rim to run. */
export function joystickRuns(x: number, y: number): boolean {
  return Math.hypot(x, y) >= JOYSTICK_RUN;
}
