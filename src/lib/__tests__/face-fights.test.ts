import { describe, expect, test } from "bun:test";
import { partsFor } from "@/lib/reconstruction-parts";
import { reconstructions } from "@/lib/reconstructions";
import { lifeFor } from "@/lib/scene-life";
import { faceFights, type Fight } from "./face-fights";

/*
 * No two faces of a model lie within three centimetres of each other over
 * more than a tenth of a square metre unless one is paint laid on the other
 * on purpose. A phone's depth buffer cannot part them, and the owner saw the
 * stage front of Aspendos striped with the timber floor behind it.
 */
const AREA = 0.1;

const describeFight = (f: Fight) =>
  `${f.front.kind}:${f.front.material} over ${f.back.kind}:${f.back.material}, ` +
  `${(f.gap * 100).toFixed(1)} cm apart, ${f.area.toFixed(2)} m² at ` +
  f.at.map((v) => v.toFixed(1)).join(", ");

describe("faces that would fight in the depth buffer", () => {
  for (const item of reconstructions) {
    test(`${item.id}: the building has none`, () => {
      expect(faceFights(partsFor(item.model), { area: AREA }).map(describeFight)).toEqual([]);
    });
    test(`${item.id}: its life has none`, () => {
      const props = lifeFor(item).props;
      expect(faceFights(props, { area: AREA, scatter: false }).map(describeFight)).toEqual([]);
    });
  }

  test("the check finds the fight it was written for", () => {
    // The stage front as it was: timber floor and stone front 2 cm apart.
    const found = faceFights([
      { kind: "box", material: "timber", at: [0, 0, -3.5], size: [60, 1.5, 7], rotY: 0 },
      { kind: "box", material: "marbleWorn", at: [0, 0, -0.18], size: [59.96, 1.45, 0.4], rotY: 0 },
    ]);
    expect(found.length).toBeGreaterThan(0);
    expect(found[0]!.gap).toBeCloseTo(0.02, 3);
  });
});
