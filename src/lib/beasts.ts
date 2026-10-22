/**
 * The animals of the statues — a horse of the Mausoleum's chariot team, the
 * lions of the Hittite gate, the lion heads of the spouts —
 * carved as masses merged into one surface (see `sculpt.ts`).
 *
 * Each builder works in the animal's own frame, `y` up from the ground or
 * the base it stands on, and returns masses in metres for a life-sized
 * beast (or for the `size` it is given). The proportions are a real
 * animal's, as the Greek and Anatolian sculptors observed them, and not a
 * toy's: a horse's head is two fifths of the length of its head and neck
 * together, its body as long as it is tall at the withers, its legs a
 * little longer than its chest is deep; a lion's head is broad and short in
 * the muzzle, its forelegs heavy, its mane a mass of locks.
 */
import type { Mass } from "./sculpt";
import type { Vec3 } from "./reconstruction-parts";

type Kit = {
  out: Mass[];
  rod: (a: Vec3, b: Vec3, ra: number, rb: number, k?: number) => void;
  egg: (c: Vec3, r: Vec3, dir?: Vec3, k?: number) => void;
  cutRod: (a: Vec3, b: Vec3, ra: number, rb: number, k?: number) => void;
  cutEgg: (c: Vec3, r: Vec3, dir?: Vec3, k?: number) => void;
};

/**
 * The builders' pencil: positions are written `[x, y, f]` with `f` forward,
 * the way the animal looks, and stored with the scene's convention.
 */
function kit(forward: 1 | -1, s = 1): Kit {
  const out: Mass[] = [];
  const P = (p: Vec3): Vec3 => [p[0] * s, p[1] * s, p[2] * s * forward];
  const D = (d?: Vec3): Vec3 | undefined => (d ? [d[0], d[1], d[2] * forward] : undefined);
  return {
    out,
    rod: (a, b, ra, rb, k = 0) => out.push({ rod: [P(a), P(b)], ra: ra * s, rb: rb * s, k: k * s }),
    egg: (c, r, dir, k = 0) => {
      const d = D(dir);
      out.push({
        egg: P(c),
        r: [r[0] * s, r[1] * s, r[2] * s],
        ...(d ? { dir: d } : {}),
        k: k * s,
      });
    },
    cutRod: (a, b, ra, rb, k = 0) =>
      out.push({ rod: [P(a), P(b)], ra: ra * s, rb: rb * s, k: k * s, cut: true }),
    cutEgg: (c, r, dir, k = 0) => {
      const d = D(dir);
      out.push({
        egg: P(c),
        r: [r[0] * s, r[1] * s, r[2] * s],
        ...(d ? { dir: d } : {}),
        k: k * s,
        cut: true,
      });
    },
  };
}

const mirror = (p: Vec3, side: number): Vec3 => [p[0] * side, p[1], p[2]];

/**
 * A horse's head, laid out from the poll: `H(u, v, x)` places a point `u`
 * metres down the face, `v` out in front of it and `x` across; `along` is
 * the direction down the face. The flat forehead, the long face narrowing
 * down the nasal bone to the soft muzzle, the great round plate of the
 * cheek, the eye proud under its lid, the flared nostrils, the mouth a
 * little open on the bit, and the ears pricked forward.
 */
function carveHead(
  { rod, egg, cutEgg }: Pick<Kit, "rod" | "egg" | "cutEgg">,
  H: (u: number, v: number, x?: number) => Vec3,
  along: Vec3,
) {
  // The skull between the ears, the broad flat forehead.
  egg(H(0.1, -0.01), [0.1, 0.1, 0.13], along, 0.06);
  // The face down the nasal bone to the muzzle.
  rod(H(0.14, 0.02), H(0.47, 0.0), 0.08, 0.06, 0.06);
  // The muzzle, soft and round, and the chin.
  egg(H(0.53, -0.03), [0.068, 0.09, 0.075], along, 0.06);
  egg(H(0.54, -0.1), [0.045, 0.045, 0.05], undefined, 0.04);
  for (const side of [-1, 1]) {
    const m = (p: Vec3) => mirror(p, side);
    // The great round plate of the cheek, and the jaw under it.
    egg(m(H(0.18, -0.1, 0.06)), [0.045, 0.12, 0.11], [0, 0.3, 1], 0.06);
    rod(m(H(0.22, -0.14, 0.04)), m(H(0.5, -0.09, 0.03)), 0.04, 0.03, 0.05);
    // The eye under its bony ridge, set out at the side: the ball proud,
    // the upper lid over it.
    egg(m(H(0.15, 0.02, 0.085)), [0.03, 0.025, 0.035], undefined, 0.025);
    egg(m(H(0.165, 0.012, 0.1)), [0.018, 0.026, 0.032], along, 0.01);
    rod(m(H(0.14, 0.035, 0.1)), m(H(0.175, 0.0, 0.1)), 0.009, 0.007, 0.008);
    // The flared nostril.
    egg(m(H(0.52, 0.04, 0.045)), [0.028, 0.045, 0.03], along, 0.02);
    cutEgg(m(H(0.53, 0.06, 0.05)), [0.014, 0.032, 0.02], along, 0.012);
    // The ears, pricked forward, the hollow of each turned out.
    rod(m(H(-0.02, 0.0, 0.055)), m(H(-0.16, 0.04, 0.085)), 0.034, 0.008, 0.03);
    cutEgg(m(H(-0.09, 0.03, 0.075)), [0.012, 0.012, 0.045], [0, 0.95, 0.25], 0.01);
  }
  // The mouth a little open on the bit.
  cutEgg(H(0.575, -0.085), [0.07, 0.01, 0.07], [0, -along[2], -along[1]], 0.012);
}

/**
 * A horse standing, life-sized (withers at 1.55 m), facing `-z`.
 *
 * Built as the Greek sculptors of the fourth century saw a horse — the team
 * of the Mausoleum's chariot, the horse's head of which is in London: a
 * compact, deep-chested animal, the neck thick and arched, the mane hogged
 * to a stiff upright crest with a tuft over the forehead, the head short and
 * wedge-shaped with a broad flat cheek, flared nostrils and the mouth a
 * little open on the bit; legs dry and slender, with the bony knee and hock,
 * the round fetlock, the sloping pastern and the hoof.
 *
 * `raised` lifts a foreleg (−1 the left, +1 the right), knee bent, the hoof
 * hanging, as a horse pawing the ground stands. `scale` 1 is life-size.
 */
export function horse(raised: -1 | 0 | 1 = 0, scale = 1): Mass[] {
  const { out, rod, egg, cutEgg } = kit(-1, scale);

  /* The trunk: barrel, forehand and quarters, flowing into each other. */
  egg([0, 1.17, 0.04], [0.26, 0.31, 0.56], undefined, 0.2);
  egg([0, 1.21, 0.5], [0.22, 0.32, 0.3], undefined, 0.2);
  egg([0, 1.22, -0.47], [0.23, 0.29, 0.36], undefined, 0.2);
  // The belly, deepest behind the girth and tucked up to the flank.
  egg([0, 1.06, 0.1], [0.24, 0.2, 0.42], [0, 0.15, 1], 0.2);
  // The top line: withers, the back, the loin and the croup.
  rod([0, 1.45, 0.5], [0, 1.41, 0.14], 0.09, 0.12, 0.16);
  rod([0, 1.41, 0.14], [0, 1.44, -0.38], 0.12, 0.14, 0.14);
  egg([0, 1.4, -0.5], [0.2, 0.12, 0.3], undefined, 0.14);
  // The breast, two swells between the forelegs.
  for (const side of [-1, 1]) {
    egg(mirror([0.085, 1.1, 0.74], side), [0.1, 0.16, 0.09], undefined, 0.1);
  }

  for (const side of [-1, 1]) {
    const m = (p: Vec3) => mirror(p, side);
    // The shoulder: the blade sloping down and forward from the withers.
    egg(m([0.16, 1.24, 0.55]), [0.08, 0.13, 0.33], [0, -0.75, 0.55], 0.14);
    // The forearm muscle over the elbow.
    egg(m([0.145, 0.93, 0.63]), [0.075, 0.09, 0.15], [0, -1, 0.05], 0.1);
    // The haunch and the long muscles of the thigh down to the gaskin.
    egg(m([0.15, 1.2, -0.5]), [0.11, 0.24, 0.28], [0, -0.35, -1], 0.14);
    egg(m([0.14, 0.95, -0.55]), [0.095, 0.14, 0.2], [0, -1, -0.25], 0.12);
    // The stifle, at the front of the thigh, under the flank.
    egg(m([0.16, 0.98, -0.3]), [0.06, 0.09, 0.07], undefined, 0.12);
    // The point of the hip.
    egg(m([0.19, 1.34, -0.37]), [0.05, 0.05, 0.05], undefined, 0.1);
  }

  /* The legs. */
  const foreleg = (side: number, up: boolean) => {
    const x = 0.145 * side;
    if (!up) {
      rod([x, 0.97, 0.63], [x, 0.52, 0.645], 0.085, 0.045, 0.07);
      // The knee: flat in front, broad.
      egg([x, 0.49, 0.65], [0.048, 0.055, 0.05], undefined, 0.04);
      // The cannon and the tendon behind it.
      rod([x, 0.47, 0.655], [x, 0.2, 0.655], 0.036, 0.034, 0.03);
      rod([x, 0.44, 0.618], [x, 0.21, 0.622], 0.022, 0.024, 0.03);
      // The fetlock, the sloping pastern and the hoof.
      egg([x, 0.17, 0.648], [0.038, 0.042, 0.045], undefined, 0.04);
      rod([x, 0.16, 0.655], [x, 0.075, 0.69], 0.033, 0.036, 0.025);
      egg([x, 0.042, 0.705], [0.048, 0.045, 0.058], undefined, 0.02);
      rod([x, 0.07, 0.69], [x, 0.012, 0.715], 0.04, 0.054, 0.02);
    } else {
      // Lifted: the forearm forward, the knee bent, the cannon hanging back.
      rod([x, 0.97, 0.65], [x, 0.66, 0.84], 0.085, 0.045, 0.07);
      egg([x, 0.64, 0.86], [0.048, 0.055, 0.05], undefined, 0.04);
      rod([x, 0.62, 0.86], [x, 0.4, 0.78], 0.036, 0.034, 0.03);
      rod([x, 0.6, 0.83], [x, 0.4, 0.75], 0.022, 0.024, 0.03);
      egg([x, 0.38, 0.77], [0.038, 0.042, 0.045], undefined, 0.04);
      rod([x, 0.37, 0.77], [x, 0.3, 0.71], 0.033, 0.036, 0.025);
      rod([x, 0.31, 0.72], [x, 0.255, 0.66], 0.04, 0.054, 0.02);
    }
  };
  const hindleg = (side: number) => {
    const x = 0.14 * side;
    // The gaskin, sloping back from the stifle to the hock, and behind it
    // the hamstring running down from the point of the buttock.
    rod([x, 0.92, -0.46], [x, 0.56, -0.7], 0.085, 0.045, 0.08);
    rod([x * 0.9, 1.14, -0.8], [x, 0.6, -0.765], 0.075, 0.03, 0.08);
    // The hock, its point standing out behind.
    egg([x, 0.53, -0.7], [0.042, 0.06, 0.058], undefined, 0.05);
    egg([x, 0.575, -0.755], [0.025, 0.035, 0.03], undefined, 0.04);
    // The cannon, a little under the body, and the tendon.
    rod([x, 0.5, -0.69], [x, 0.2, -0.665], 0.036, 0.034, 0.03);
    rod([x, 0.5, -0.73], [x, 0.21, -0.7], 0.022, 0.022, 0.03);
    egg([x, 0.17, -0.668], [0.038, 0.042, 0.045], undefined, 0.04);
    rod([x, 0.16, -0.665], [x, 0.075, -0.635], 0.032, 0.035, 0.025);
    egg([x, 0.042, -0.62], [0.048, 0.045, 0.058], undefined, 0.02);
    rod([x, 0.07, -0.635], [x, 0.012, -0.615], 0.04, 0.054, 0.02);
  };
  for (const side of [-1, 1]) {
    foreleg(side, side === raised);
    hindleg(side);
  }
  // The hooves stand flat on the base.
  cutEgg([0, -0.5, 0], [3, 0.5, 3]);

  /*
   * The head, carried high and a little in. It is placed from the poll:
   * `u` runs down the face towards the muzzle, `v` out from it towards the
   * front, `x` across.
   */
  const poll: [number, number] = [2.13, 1.2];
  const hy = -0.82;
  const hf = 0.57;
  const H = (u: number, v: number, x = 0): Vec3 => [
    x,
    poll[0] + u * hy + v * hf,
    poll[1] + u * hf - v * hy,
  ];
  const along: Vec3 = [0, hy, hf];

  /* The neck, arched and deep, narrow across, from the withers to the poll. */
  egg([0, 1.42, 0.8], [0.16, 0.29, 0.3], [0, 0.62, 0.78], 0.18);
  egg([0, 1.68, 0.97], [0.125, 0.22, 0.28], [0, 0.8, 0.6], 0.14);
  egg([0, 1.92, 1.1], [0.095, 0.15, 0.17], [0, 0.88, 0.47], 0.1);
  // The crest along the top, thick in a stallion.
  rod([0, 1.52, 0.6], [0, 1.88, 0.9], 0.095, 0.08, 0.12);
  rod([0, 1.88, 0.9], [0, 2.08, 1.1], 0.08, 0.065, 0.1);
  // The windpipe under the throat.
  rod([0, 1.3, 1.0], [0, 1.82, 1.2], 0.055, 0.042, 0.1);

  /*
   * The mane, hogged: a stiff upright brush standing along the crest, its
   * top cut level and notched into tufts; and the forelock tied in a tuft
   * between the ears.
   */
  const tufts = 30;
  for (let i = 0; i < tufts; i += 1) {
    const t = i / (tufts - 1);
    const f = 0.6 + t * 0.54;
    const y = 1.67 + t * 0.56 - t * t * 0.07;
    // Each lock a thin blade, standing up and leaning a little forward.
    egg([0, y + 0.03, f], [0.03, 0.095, 0.022], [0, 0.35, 0.94], 0.012);
  }
  rod(H(-0.01, 0.05), H(-0.07, 0.12), 0.03, 0.014, 0.03);

  carveHead({ rod, egg, cutEgg }, H, along);

  /* The tail: the dock arching out, and the hair falling in heavy locks. */
  rod([0, 1.4, -0.76], [0, 1.33, -0.9], 0.07, 0.06, 0.08);
  rod([0, 1.33, -0.9], [0, 1.12, -0.98], 0.06, 0.065, 0.05);
  egg([0, 0.92, -0.99], [0.075, 0.07, 0.24], [0, -1, -0.08], 0.06);
  for (const k of [-1, -0.3, 0.4, 1]) {
    rod(
      [k * 0.03, 1.1, -0.99],
      [k * 0.055, 0.6 + Math.abs(k) * 0.05, -0.95 - Math.abs(k) * 0.03],
      0.035,
      0.018,
      0.03,
    );
  }
  return out;
}

/**
 * The forepart of a lion standing out of a block of stone, as the Hittite
 * masons cut the lions of the Lion Gate at Hattusa: the head and chest in
 * the round, the jaws open in a roar with the fangs bared and the tongue
 * behind them, the eyes deep sockets that held inlay, a heavy brow, the
 * muzzle creased; the mane a thick collar carved in rows of locks round the
 * face and down over the chest; the forelegs planted side by side, heavy,
 * the paws flat with the toes cut. Behind all of it the masses run on into
 * the stone, so the beast grows out of the block it was carved from.
 *
 * The frame is the foot of the lion on the face of the block: `+z` straight
 * out of the stone, `y` up; `size` is its height to the top of the mane.
 */
export function gateLion(size: number): Mass[] {
  const { out, rod, egg, cutEgg, cutRod } = kit(1, size);

  // The forelegs, planted side by side, and the paws with their four toes.
  for (const side of [-1, 1]) {
    const m = (p: Vec3) => mirror(p, side);
    // The shoulder and the great muscle of the forearm.
    egg(m([0.17, 0.5, 0.04]), [0.12, 0.16, 0.15], [0, -0.5, 0.85], 0.06);
    rod(m([0.17, 0.44, 0.12]), m([0.165, 0.2, 0.2]), 0.1, 0.07, 0.05);
    rod(m([0.165, 0.2, 0.2]), m([0.165, 0.08, 0.22]), 0.07, 0.068, 0.03);
    // The paw, broad and flat, and the four toes with the grooves between.
    egg(m([0.165, 0.05, 0.27]), [0.09, 0.05, 0.11], undefined, 0.04);
    for (let toe = 0; toe < 4; toe += 1) {
      const x = 0.165 + (toe - 1.5) * 0.043;
      egg(m([x, 0.038, 0.35 - Math.abs(toe - 1.5) * 0.018]), [0.025, 0.035, 0.04], undefined, 0.01);
    }
    for (let g = 0; g < 3; g += 1) {
      const x = 0.165 + (g - 1) * 0.043;
      cutRod(m([x, 0.03, 0.32]), m([x, 0.07, 0.4]), 0.005, 0.005, 0.006);
    }
  }
  // The chest between the legs, and the body running back into the block.
  egg([0, 0.47, 0.02], [0.22, 0.2, 0.17], undefined, 0.1);
  egg([0, 0.55, -0.3], [0.28, 0.33, 0.4], undefined, 0.1);

  /*
   * The mane: a deep collar round the face and down over the chest, and on
   * it the locks, carved in staggered rows like overlapping tongues, each
   * lying on the surface and pointing out and back from the face.
   */
  const C: Vec3 = [0, 0.8, 0.0];
  const R: Vec3 = [0.36, 0.32, 0.27];
  egg(C, R, undefined, 0.1);
  const surface = (x: number, y: number) => {
    const u = x / R[0];
    const v = (y - C[1]) / R[1];
    return C[2] + R[2] * Math.sqrt(Math.max(0, 1 - u * u - v * v));
  };
  const rows = [
    { r: 0.42, n: 16 },
    { r: 0.58, n: 20 },
    { r: 0.74, n: 24 },
    { r: 0.88, n: 28 },
  ];
  rows.forEach(({ r, n }, k) => {
    for (let i = 0; i < n; i += 1) {
      const a = ((i + (k % 2) * 0.5) / n) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      // Under the jaw the locks run down the chest instead.
      const down = sa < -0.3 ? 0.35 : 0;
      const x0 = ca * r * R[0];
      const y0 = C[1] + sa * r * R[1];
      const reach = Math.min(r + 0.19, 0.97);
      const x1 = ca * reach * R[0];
      const y1 = C[1] + (sa * reach - down * 0.1) * R[1];
      rod([x0, y0, surface(x0, y0) + 0.012], [x1, y1, surface(x1, y1) - 0.006], 0.032, 0.01, 0.016);
    }
  });

  /*
   * The head, large and thrust forward out of the mane: the broad skull, the
   * cheeks, the long muzzle with the whisker pads, the jaws open.
   */
  egg([0, 0.9, 0.3], [0.17, 0.15, 0.17], undefined, 0.06);
  for (const side of [-1, 1]) {
    const m = (p: Vec3) => mirror(p, side);
    // The cheek, running down into the angle of the open jaw.
    egg(m([0.1, 0.82, 0.38]), [0.08, 0.1, 0.13], [0, -0.3, 1], 0.06);
    // The whisker pad, full and round either side of the nose.
    egg(m([0.058, 0.83, 0.58]), [0.062, 0.055, 0.07], undefined, 0.04);
    // The brow ridge, and the eye socket under it that held the inlay.
    rod(m([0.025, 0.99, 0.44]), m([0.13, 0.975, 0.4]), 0.034, 0.028, 0.04);
    cutEgg(m([0.09, 0.935, 0.47]), [0.045, 0.026, 0.035], [0.6, 0, 1], 0.012);
    // The small round ear, set back in the mane.
    egg(m([0.14, 1.03, 0.24]), [0.05, 0.05, 0.03], [0.4, 0.2, 1], 0.03);
    cutEgg(m([0.145, 1.03, 0.265]), [0.026, 0.03, 0.02], [0.4, 0.2, 1], 0.01);
    // The fangs, two above and two below.
    rod(m([0.052, 0.78, 0.6]), m([0.05, 0.71, 0.6]), 0.019, 0.005, 0.006);
    rod(m([0.045, 0.63, 0.55]), m([0.045, 0.7, 0.56]), 0.016, 0.005, 0.006);
    // The corner of the mouth drawn back.
    cutRod(m([0.05, 0.73, 0.56]), m([0.1, 0.74, 0.44]), 0.02, 0.008, 0.02);
  }
  // The nose: the bridge, creased across, and the broad flat nose pad.
  rod([0, 0.98, 0.38], [0, 0.89, 0.6], 0.06, 0.05, 0.05);
  egg([0, 0.87, 0.625], [0.058, 0.034, 0.036], undefined, 0.03);
  for (const f of [0.45, 0.49, 0.53]) {
    const top = 0.98 - (f - 0.38) * 0.41 + 0.05;
    cutRod([-0.035, top - 0.008, f], [0.035, top - 0.008, f], 0.008, 0.008, 0.012);
  }
  // The upper jaw; then the mouth cut open, the lower jaw dropped below it
  // and joined to the cheeks, and the tongue lying in it.
  egg([0, 0.79, 0.5], [0.095, 0.055, 0.11], undefined, 0.04);
  egg([0, 0.645, 0.42], [0.095, 0.06, 0.13], [0, -0.35, 1], 0.07);
  for (const side of [-1, 1])
    rod(mirror([0.085, 0.74, 0.33], side), mirror([0.05, 0.64, 0.5], side), 0.05, 0.035, 0.05);
  cutEgg([0, 0.715, 0.54], [0.075, 0.05, 0.13], [0, -0.15, 1], 0.015);
  egg([0, 0.675, 0.48], [0.055, 0.02, 0.08], [0, -0.2, 1], 0.015);

  // Nothing behind the face of the block: the rest is still stone.
  cutEgg([0, 0.5, -2.0], [3, 3, 2.0]);
  return out;
}

/**
 * A lion's head as a waterspout: the mask Greek and Roman builders set along
 * the sima of a temple and on the face of a fountain, the water running out
 * of the open mouth through a short pipe. The face is a lion's — broad skull,
 * heavy brow, the nose creased, full whisker pads — framed by a ring of mane
 * in two rows of locks.
 *
 * The frame is the middle of the back of the mask, on the face of the wall:
 * `+z` out of the wall, `y` up; `size` is the height of the mane ring.
 * `plain` carves it for a row seen from far below: fewer and bigger locks,
 * and no creases too fine to be seen.
 */
export function lionMask(size: number, plain = false): Mass[] {
  const { out, rod, egg, cutEgg, cutRod } = kit(1, size);
  // The mane: a ring standing proud of the wall, and its locks lying on it,
  // pointing out from the face.
  egg([0, 0.02, 0.06], [0.5, 0.5, 0.17], undefined, 0.06);
  const surface = (r: number) => 0.06 + 0.17 * Math.sqrt(Math.max(0, 1 - (r / 0.5) ** 2));
  const rows: (readonly [number, number, number])[] = plain
    ? [
        [0.27, 9, 0],
        [0.37, 11, 0.3],
      ]
    : [
        [0.26, 13, 0],
        [0.34, 15, 0.2],
        [0.41, 17, 0],
      ];
  const w = plain ? 0.075 : 0.05;
  for (const [r, n, twist] of rows) {
    for (let i = 0; i < n; i += 1) {
      const a = twist + (i / n) * Math.PI * 2;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      const r1 = Math.min(r + 0.1, 0.48);
      rod(
        [c * r, 0.02 + sn * r, surface(r) + 0.01],
        [c * r1, 0.02 + sn * r1, surface(r1) - 0.01],
        w,
        w * 0.32,
        0.02,
      );
    }
  }
  // Where the face begins: plain, it stands further out of the mane.
  const face = out.length;
  // The skull and the cheeks.
  egg([0, 0.06, 0.2], [0.26, 0.24, 0.2], undefined, 0.06);
  for (const side of [-1, 1]) {
    const m = (p: Vec3) => mirror(p, side);
    egg(m([0.15, -0.06, 0.28]), [0.12, 0.14, 0.14], undefined, 0.06);
    egg(m([0.075, -0.09, 0.47]), [0.08, 0.07, 0.07], undefined, 0.04);
    rod(m([0.03, 0.2, 0.36]), m([0.19, 0.18, 0.3]), 0.05, 0.04, 0.04);
    cutEgg(m([0.12, 0.12, 0.37]), [0.05, 0.03, 0.03], [0.5, 0, 1], 0.015);
    egg(m([0.26, 0.29, 0.14]), [0.07, 0.07, 0.04], [0.5, 0.3, 1], 0.03);
  }
  // The nose, creased across, and the nose pad.
  rod([0, 0.2, 0.34], [0, 0.0, 0.5], 0.08, 0.065, 0.05);
  egg([0, -0.01, 0.53], [0.075, 0.045, 0.045], undefined, 0.03);
  if (!plain)
    for (const y of [0.13, 0.08])
      cutRod([-0.05, y, 0.48 - y * 0.6], [0.05, y, 0.48 - y * 0.6], 0.01, 0.01, 0.015);
  // The open mouth, the lower jaw below it, and the pipe the water runs from.
  egg([0, -0.24, 0.34], [0.13, 0.075, 0.13], [0, -0.25, 1], 0.07);
  cutEgg([0, -0.17, 0.46], [0.1, 0.06, 0.14], undefined, 0.02);
  rod([0, -0.17, 0.3], [0, -0.18, 0.6], 0.04, 0.04, 0.01);
  cutRod([0, -0.18, 0.45], [0, -0.18, 0.7], 0.022, 0.022);
  if (plain) {
    const lift = 0.1 * size;
    for (const mass of out.slice(face)) {
      if ("rod" in mass) for (const end of mass.rod) end[2] += lift;
      else mass.egg[2] += lift;
    }
  }
  // Flat against the wall behind.
  cutEgg([0, 0, -2.0], [3, 3, 2.0]);
  return out;
}
