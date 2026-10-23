import type { Vec3 } from "@/lib/reconstruction-parts";
import {
  lifeAnimal as animal,
  lifeBench as bench,
  lifeBrazier as brazier,
  lifeFinish as finish,
  lifeFire as fire,
  lifeFlock as flock,
  lifeJar as jar,
  lifeLampstand as lampstand,
  lifeMake as make,
  lifeAside as aside,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import { monasteryLayout, type CliffMonasterySpec } from "@/lib/models/sumela-manastiri";
import * as trades from "@/lib/scene-trades";

/**
 * The monastery on a feast day: monks in the court and on the balconies,
 * one at prayer before the painted church and one drawing water at the
 * spring, pilgrims coming along the path on the mountainside and climbing
 * the long stair with a loaded mule, goats grazing a shelf of the rock below
 * the ledge, and lamps at the church door.
 */
export function monasteryLife(spec: CliffMonasterySpec, era: Era): SceneLife {
  const b = make(era, 1860);
  const { cast } = b;
  const L = monasteryLayout(spec);
  const { C, caveLeft, caveRight, caveBack, courtFront, courtLeft, rangeFront } = L;
  const S = spec.storeyHeight;
  const churchL = caveLeft + 1;
  const churchR = caveRight - 7;
  const churchZ = caveBack - 4;
  const door = churchL + 4.15;
  const cx = (churchL + churchR) / 2;

  /* At the church: a monk at prayer before the door, lamps either side. */
  cast.add({ at: [door, C, churchZ - 2.2], rotY: 0, action: "pray", role: "priest" });
  for (const dx of [-1.1, 1.1]) fire(b, lampstand([door + dx, C, churchZ - 0.9], 1.4), 0.1, dx < 0);
  // Two talking in the court, a reader on the bench along the parapet.
  cast.group([cx + 2.5, C, courtFront + 4.5], 2, 0.7, "priest");
  b.props.push(...bench([cx - 3, C, courtFront + 1.1], 2.4, Math.PI));
  cast.add({
    at: [cx - 3.4, C + 0.42, courtFront + 1.1],
    rotY: Math.PI,
    action: "read",
    carry: "scroll",
    role: "priest",
  });
  // A lay brother at the spring with a jar.
  cast.add({
    at: [caveRight - 3.5, C, caveBack - 3.1],
    rotY: 0,
    action: "tend",
    carry: "jar",
    role: "worker",
  });
  b.props.push(...jar([caveRight - 2.1, C, caveBack - 2.9], 0.4));
  // A monk pacing the court.
  cast.walk(
    [
      [courtLeft + 7, C, courtFront + 3],
      [cx + 5, C, courtFront + 3],
    ],
    { role: "priest", speed: 0.5 },
  );
  // A brazier in the court for the cold of the mountain evening.
  fire(b, brazier([cx + 6, C, courtFront + 6.5], 0.9), 0.3, true);

  /* On the balconies of the range. */
  const range = spec.rangeLength;
  for (const [t, f, action] of [
    [0.18, 2, "read"],
    [0.3, 4, "stand"],
    [0.55, 3, "pray"],
    [0.85, 2, "stand"],
  ] as const) {
    const x = range * t;
    const back = t > 0.4 && t < 0.75 ? 1 : 0;
    cast.add({
      at: [x, C + f * S, rangeFront + back - 0.55],
      rotY: Math.PI,
      action,
      role: "priest",
      ...(action === "read" ? { carry: "scroll" as const } : {}),
    });
  }

  /* Pilgrims on the path and the stair, a mule with their load, goats on the rock. */
  const gateX = courtLeft - 4;
  const gateZ = courtFront + 2;
  const steps = Math.round((C + 1.2) / 0.2);
  const foot = gateX - 0.36 * steps;
  // A tenth over the treads, so the walk never dips below a step's front.
  const climb: Vec3[] = [
    [L.pathTurn + 8, 0, gateZ],
    [foot - 0.25, 0, gateZ],
    [foot, 0.1, gateZ],
    [gateX, C + 1.3, gateZ],
    [gateX + 1.2, C + 1.3, gateZ],
  ];
  cast.walk([...climb, climb[3]!, climb[2]!, climb[1]!], { speed: 0.45, carry: "staff" });
  cast.walk([climb[2]!, climb[3]!, climb[4]!, climb[3]!], { speed: 0.4, female: true });
  cast.walk([climb[0]!, climb[1]!, climb[2]!, climb[3]!, climb[2]!, climb[1]!], {
    speed: 0.42,
    carry: "basket",
  });
  animal(b, "donkey", [foot - 8, 0, gateZ - 1.6], Math.PI / 2, "stand", { load: true });
  cast.add({
    at: [foot - 9.6, 0, gateZ - 2.4],
    rotY: Math.PI / 2,
    action: "stand",
    role: "worker",
  });
  // On the grassy shelf east of the range, a storey below the ledge.
  flock(b, "goat", L.pasture, 5, 2.2);

  /*
   * The hours of the house: a monk beating the semantron, the wooden board
   * that called Orthodox monks to prayer; another carrying the Gospel book
   * to the church, one going before him with a candle; a brother hoeing the
   * vegetable beds, and one copying a manuscript in the court's light.
   */
  const x = aside(b, 1861);
  x.cast.add({
    at: [cx + 3, C, courtFront + 1.2],
    rotY: 0.3,
    action: "strike",
    role: "priest",
    carry: "mallet",
    carryLeft: "semantron",
  });
  const toChurch: Vec3[] = [
    [courtLeft + 6, C, courtFront + 4.6],
    [door - 1.8, C, churchZ - 4.2],
  ];
  const bearer = x.cast.walk(toChurch, { role: "priest", carry: "book", speed: 0.4 });
  const light = x.cast.walk(toChurch, { role: "priest", carry: "candle", speed: 0.4 });
  light.phase = bearer.phase + 1.2 / 7;
  trades.garden(x, [courtLeft + 4.5, C, courtFront + 4.4], Math.PI, { role: "priest" });
  trades.scribe(x, [cx + 6.5, C, courtFront + 2.0], Math.PI, { role: "priest" });
  return finish(b);
}
