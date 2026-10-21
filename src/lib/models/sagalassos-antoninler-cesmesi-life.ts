import type { Vec3 } from "@/lib/reconstruction-parts";
import {
  lifeAmphora as amphora,
  lifeAnimal as animal,
  lifeDog as dog,
  lifeFinish as finish,
  lifeFire as fire,
  lifeJar as jar,
  lifeMake as make,
  lifeStall as stall,
  lifeTorchStand as torchStand,
  lifeBench as bench,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import { nymphaeumLayout, type NymphaeumSpec } from "@/lib/models/sagalassos-antoninler-cesmesi";

/**
 * The Upper Agora on a summer morning: women and boys at the basin with their
 * jars, a water-carrier going off across the square, people talking in the
 * shade of the honorific columns, a donkey loaded for the market, and the
 * stalls along the square's edge.
 */
export function nymphaeumLife(spec: NymphaeumSpec, era: Era): SceneLife {
  const b = make(era, 16080);
  const { cast, rand } = b;
  const L = nymphaeumLayout(spec);
  const f = L.front;

  // At the parapet, filling jars from the basin.
  for (const [x, female] of [
    [-7.5, true],
    [-6.6, true],
    [4.8, false],
    [9.2, true],
  ] as const) {
    cast.add({
      at: [x, 0, f - 0.65],
      rotY: 0,
      action: "tend",
      carry: "jar",
      female,
      ...(female ? {} : { role: "worker" as const }),
    });
  }
  cast.add({ at: [1.5, 0, f - 0.6], rotY: 0.3, action: "play", role: "child" });
  cast.add({ at: [-2.6, 0, f - 1.1], rotY: -0.4, action: "play", role: "child" });
  // A water-carrier going off with a full amphora, and back for another.
  cast.walk(
    [
      [-4.2, 0, f - 1.2],
      [-15, 0, f - 13],
    ],
    { role: "worker", carry: "amphora", speed: 0.7 },
  );
  // The square's traffic.
  cast.walk(
    [
      [16, 0, f - 9],
      [-16, 0, f - 9],
      [-16, 0, f - 4],
      [16, 0, f - 4],
    ],
    { role: "official", speed: 0.9 },
  );
  cast.walk(
    [
      [-12, 0, f - 16],
      [12, 0, f - 16],
    ],
    { carry: "basket", female: true },
  );
  cast.group([7.5, 0, f - 11], 3);
  cast.group([-9, 0, f - 7.5], 2);
  // A reader on the bench before the fountain.
  b.props.push(...bench([-1.5, 0, f - 5.2], 2.2, 0));
  cast.add({ at: [-1.9, 0.42, f - 5.2], rotY: Math.PI, action: "read", carry: "scroll" });
  cast.add({ at: [-0.9, 0.42, f - 5.2], rotY: Math.PI, action: "sit" });

  // The market at the square's edge.
  const stalls: [Vec3, number, "fruit" | "pottery" | "baskets"][] = [
    [[-13, 0, f - 21], 0, "fruit"],
    [[-7, 0, f - 21], 0, "pottery"],
    [[5, 0, f - 21], 0, "baskets"],
  ];
  for (const [at, rotY, goods] of stalls) {
    b.props.push(...stall(at, rotY, rand, goods));
    cast.add({ at: [at[0], 0, at[2] - 0.85], rotY, action: "talk", role: "worker" });
  }
  b.props.push(...amphora([11.5, 0, f - 20.4]), ...amphora([12.1, 0, f - 20.6], 0.9));
  b.props.push(...jar([-10.6, 0, f - 1.0], 0.45));

  // A donkey with its panniers, led across the square.
  const route: Vec3[] = [
    [14, 0, f - 13],
    [-6, 0, f - 13],
  ];
  animal(b, "donkey", route[0]!, 0, "walk", { route, speed: 0.55, load: true });
  cast.walk(
    route.map((p): Vec3 => [p[0], 0, p[2] - 1.0]),
    { role: "worker", speed: 0.55 },
  );
  dog(b, [10.5, 0, f - 2.2]);

  // Torches by the fountain for the evening.
  for (const s of [-1, 1]) {
    const torch = torchStand([s * (L.half - 1.2), 0, f - 1.0], 2.0);
    fire(b, torch, 0.32, true);
  }
  return finish(b);
}
