/**
 * Looking round by turning the phone: the device's orientation as a camera's
 * yaw and pitch, the way the walk keeps them (yaw 0 looks down -z, pitch up
 * positive).
 *
 * The DeviceOrientation angles (alpha round the vertical, beta forward tilt,
 * gamma sideways tilt, intrinsic Z-X'-Y'') describe the phone; the camera
 * looks out of the back of the screen, which is the phone turned -90° about
 * its x axis, and the screen may itself be turned (landscape). This is the
 * arithmetic three.js's old DeviceOrientationControls did, written out on
 * plain numbers so it can be tested and needs no import.
 */

type Quat = [number, number, number, number]; // x, y, z, w

const DEG = Math.PI / 180;

function multiply(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    ax * bw + aw * bx + ay * bz - az * by,
    ay * bw + aw * by + az * bx - ax * bz,
    az * bw + aw * bz + ax * by - ay * bx,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

/** Quaternion of an Euler rotation in YXZ order (x, y, z in radians). */
function fromEulerYXZ(x: number, y: number, z: number): Quat {
  const c1 = Math.cos(x / 2);
  const c2 = Math.cos(y / 2);
  const c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2);
  const s2 = Math.sin(y / 2);
  const s3 = Math.sin(z / 2);
  return [
    s1 * c2 * c3 + c1 * s2 * s3,
    c1 * s2 * c3 - s1 * c2 * s3,
    c1 * c2 * s3 - s1 * s2 * c3,
    c1 * c2 * c3 + s1 * s2 * s3,
  ];
}

/**
 * Yaw and pitch (radians) of a camera held as the phone is, given the event's
 * alpha, beta, gamma (degrees) and the screen's turn (degrees, 0/90/-90/180).
 */
export function orientationToLook(
  alpha: number,
  beta: number,
  gamma: number,
  screen = 0,
): { yaw: number; pitch: number } {
  let q = fromEulerYXZ(beta * DEG, alpha * DEG, -gamma * DEG);
  // The camera looks out of the back of the phone, not out of its top.
  const s = Math.SQRT1_2;
  q = multiply(q, [-s, 0, 0, s]);
  // A screen turned to landscape turns the picture back the other way.
  const half = (-screen * DEG) / 2;
  q = multiply(q, [0, 0, Math.sin(half), Math.cos(half)]);
  // Back to Euler YXZ: yaw about world y, then pitch about the camera's x.
  const [x, y, z, w] = q;
  const m13 = 2 * (x * z + w * y);
  const m23 = 2 * (y * z - w * x);
  const m33 = 1 - 2 * (x * x + y * y);
  const pitch = Math.asin(Math.max(-1, Math.min(1, -m23)));
  const yaw = Math.abs(m23) < 0.9999999 ? Math.atan2(m13, m33) : 0;
  return { yaw, pitch };
}

/** The shortest signed turn from angle `a` to angle `b`, in (-π, π]. */
export function angleDelta(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * One step of a low-pass filter on an angle: moves `current` a share `k`
 * of the way towards `target` along the short way round. The sensor jitters
 * by a degree or so; a filter at k ≈ 0.15 a frame turns that into a steady
 * view while still following a real turn within a fraction of a second.
 */
export function smoothAngle(current: number, target: number, k: number): number {
  return current + angleDelta(current, target) * Math.min(1, Math.max(0, k));
}
