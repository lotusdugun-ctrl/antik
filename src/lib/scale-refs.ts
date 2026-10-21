/**
 * Scale comparison: modern things everybody has stood next to, set down on
 * open ground beside a model so its size reads at a glance.
 *
 * What is shown depends on how big the model is. A tomb or a house is met
 * by a person, a city bus and a ten-storey block; a theatre or a stadium,
 * whose footprint the block would only dot, by a football pitch laid out on
 * the ground beside it — and the block, for height. All sizes are the usual
 * ones: a 1.75 m adult, a 12 m single-deck bus, a ten-storey residential
 * block at about 3 m a floor, a 105 × 68 m FIFA pitch.
 */

export type ScaleRef = "person" | "bus" | "block" | "pitch";

export const REF_SIZE: Record<ScaleRef, { w: number; d: number; h: number }> = {
  person: { w: 0.5, d: 0.3, h: 1.75 },
  bus: { w: 12, d: 2.55, h: 3.2 },
  block: { w: 24, d: 12, h: 30 },
  pitch: { w: 105, d: 68, h: 0 },
};

/** Footprint in plan (x by z) and height of a model's bounding box, in metres. */
export type Extent = { width: number; depth: number; height: number };

/** Which references suit a model of this size, nearest first. */
export function chooseScaleRefs(extent: Extent): ScaleRef[] {
  const long = Math.max(extent.width, extent.depth);
  if (long >= 90) return ["pitch", "block", "person"];
  if (long >= 45) return ["block", "bus", "person"];
  return ["person", "bus", "block"];
}

export type Placed = { ref: ScaleRef; x: number; z: number; rotY: number };

/**
 * Lays the references out in a row beside the model, along its side: on the
 * side to the right of the opening view (`side`, a unit vector in plan from
 * the model's centre), clear of the footprint by a gap, each one clear of the
 * last. Positions are in plan; the caller sets them on the ground.
 */
export function layoutScaleRefs(
  refs: ScaleRef[],
  centre: [number, number],
  halfExtent: [number, number],
  side: [number, number],
): Placed[] {
  const [sx, sz] = side;
  const length = Math.hypot(sx, sz) || 1;
  const ux = sx / length;
  const uz = sz / length;
  // Along the row: perpendicular to `side`.
  const ax = -uz;
  const az = ux;
  // How far the model reaches towards that side.
  const reach = Math.abs(ux) * halfExtent[0] + Math.abs(uz) * halfExtent[1];
  const gap = Math.max(4, reach * 0.08);
  // three.js turns local +x to (cos θ, -sin θ) in plan; local +x runs along the row.
  const rotY = Math.atan2(-az, ax);
  const placed: Placed[] = [];
  // The row is centred on the model's middle.
  const total = refs.reduce((sum, ref) => sum + REF_SIZE[ref].w, 0) + (refs.length - 1) * 4;
  let along = -total / 2;
  for (const ref of refs) {
    const size = REF_SIZE[ref];
    // Each one stands with its long side along the row.
    const out = reach + gap + size.d / 2;
    const at = along + size.w / 2;
    placed.push({
      ref,
      x: centre[0] + ux * out + ax * at,
      z: centre[1] + uz * out + az * at,
      rotY,
    });
    along += size.w + 4;
  }
  return placed;
}
