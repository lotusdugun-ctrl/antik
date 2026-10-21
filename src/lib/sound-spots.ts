/**
 * Where a model's sounds come from, found in the model itself: the middle of
 * the stage a theatre's actors speak from, the fire on the altar, the stalls
 * and fountains the scene sets down, the line a race runs along. The player
 * (src/lib/ambience.ts) makes each louder as the camera comes near it and
 * pans it towards where it is; a spot a model does not have is not placed,
 * and its sounds play as they always did.
 */
import type { Reconstruction } from "./reconstructions";
import { stadiumLayout, theatreLayout } from "./reconstruction-parts";
import { marketSpots, type SceneLife } from "./scene-life";
import type { Places, Point } from "./soundscapes";

/** Head height over a point on the ground: where a sound there is made. */
const MOUTH = 1.5;

export function spotsFor(item: Reconstruction, life: Pick<SceneLife, "flames">): Places {
  const spec = item.model;
  const out: Places = {};
  if (spec.kind === "roman-theatre") {
    const L = theatreLayout(spec);
    // An actor's voice from the middle of the stage, where the actors stand.
    out.stage = { points: [[0, L.stageTop + MOUTH, -spec.stageDepth * 0.45]], ref: 22 };
  }
  if (spec.kind === "stadium") {
    const L = stadiumLayout(spec);
    // The race runs up one side of the spina and down the other.
    out.track = {
      points: [
        [0, 1.2, L.trackMin],
        [0, 1.2, L.trackMax],
      ],
      line: true,
      ref: 16,
    };
  }
  // The altar: the biggest fire with smoke over it.
  const altar = life.flames.filter((f) => f.smoke).sort((a, b) => b.size - a.size)[0];
  if (altar) out.altar = { points: [[altar.at[0], altar.at[1] + 0.5, altar.at[2]]], ref: 14 };
  const market = marketSpots(item);
  const raised = (at: readonly number[]): Point => [at[0]!, (at[1] ?? 0) + MOUTH, at[2]!];
  if (market.stalls.length) out.stalls = { points: market.stalls.map(raised), ref: 9 };
  if (spec.kind === "nymphaeum") {
    // The water falling into the basin, all along the fountain's front.
    out.fountain = {
      points: [
        [-8, 1, -1.5],
        [0, 1, -1.5],
        [8, 1, -1.5],
      ],
      ref: 10,
    };
  } else if (spec.kind === "terrace-villa") {
    // The pool in the middle of the court.
    out.fountain = { points: [[0, spec.terraceHeight + 0.6, 0]], ref: 6 };
  } else if (spec.kind === "cliff-monastery") {
    // The holy spring at the back of the cave.
    out.fountain = { points: [[0.5, spec.courtLevel + 1, 11.2]], ref: 6 };
  } else if (spec.kind === "peristyle-house") {
    // The house's own fountain: the marble youth over the pool in the middle of the court.
    out.fountain = { points: [[0, 0.9, 0]], ref: 6 };
  } else if (market.fountains.length) {
    out.fountain = { points: market.fountains.map((at) => [at[0], 0.8, at[2]]), ref: 6 };
  }
  return out;
}
