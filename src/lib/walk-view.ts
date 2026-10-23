/**
 * The field of view when walking. The orbit camera's 45° (vertical) frames a
 * building well from outside, but standing in it, on a phone held upright, it
 * shows a slot of about 22° across — like looking through a tube. A walker
 * should see roughly what eyes take in: about 90° across, so the vertical
 * angle is worked out from the screen's shape and kept within limits that do
 * not bend straight lines at the edges.
 */
export const ORBIT_FOV = 45;
const WALK_ACROSS = 90;
const MIN_VERTICAL = 55;
const MAX_VERTICAL = 85;

export function walkFov(aspect: number): number {
  const across = (WALK_ACROSS * Math.PI) / 180;
  const vertical = (2 * Math.atan(Math.tan(across / 2) / Math.max(0.2, aspect)) * 180) / Math.PI;
  return Math.min(MAX_VERTICAL, Math.max(MIN_VERTICAL, vertical));
}
