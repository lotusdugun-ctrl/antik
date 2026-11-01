import type { Vec3 } from "@/lib/reconstruction-parts";
import {
  lifeAside as aside,
  lifeBrazier as brazier,
  lifeDog as dog,
  lifeFinish as finish,
  lifeFire as fire,
  lifeLampstand as lampstand,
  lifeMake as make,
  lifeTorchStand as torchStand,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import { domedLayout, type DomedSpec } from "@/lib/models/kubbeli";
import { cisternLayout, type CisternSpec, type TowerSpec } from "@/lib/models/galata-yerebatan";
import * as trades from "@/lib/scene-trades";

const PI = Math.PI;

/**
 * A great domed sanctuary on a feast day. Hagia Sophia: the clergy in
 * procession with candles and incense to the doors, the faithful in the
 * atrium round the fountain. A mosque of Sinan: men washing at the fountain
 * in the court, rows at prayer before the doors, the learned talking under
 * the porticoes, sellers outside the gate.
 */
export function domedLife(spec: DomedSpec, era: Era): SceneLife {
  const L = domedLayout(spec);
  const b = make(era, Math.round(spec.domeDiameter * 100));
  const { cast, rand } = b;
  const zc = L.front - spec.courtLength / 2;
  const byz = spec.variant === "byzantine";

  if (spec.courtLength > 0) {
    // Round the fountain in the middle of the court.
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * PI * 2 + 0.2;
      cast.add({
        at: [Math.sin(a) * (byz ? 4.0 : 5.8), 0, zc + Math.cos(a) * (byz ? 4.0 : 5.8)],
        rotY: a + PI,
        action: byz ? (i % 2 ? "stand" : "talk") : i % 3 === 0 ? "stand" : "kneel",
        female: byz && i === 3,
      });
    }
    // People crossing the court to the doors and back.
    for (let i = 0; i < 10; i += 1) {
      // Along either side of the fountain, clear of it and of the portico.
      const x = (i % 2 ? 1 : -1) * (7 + rand() * (spec.courtWidth / 2 - 15));
      const route: Vec3[] = [
        [x, 0, L.courtFront + 7],
        [x, 0, L.front - 2.5],
      ];
      cast.walk(i % 3 === 0 ? [...route].reverse() : route, {
        role: i % 5 === 0 ? "priest" : "citizen",
        speed: 0.5 + rand() * 0.3,
        female: byz && i === 4,
      });
    }
    // Groups talking under the porticoes.
    for (const s of [-1, 1])
      cast.group([s * (spec.courtWidth / 2 - 3.5), 0, zc + s * 4], 3, 0.7, "official");
  }
  if (byz) {
    // The procession of the clergy, candles and incense, to the imperial door.
    for (let i = 0; i < 8; i += 1)
      cast.walk(
        [
          [-6 + (i % 2) * 1.4, 0, L.courtFront + 7 + i * 1.6],
          [-6 + (i % 2) * 1.4, 0, L.front - 2 + 0.01 * i],
        ],
        { role: "priest", carry: i % 3 === 0 ? "incense" : "torch", speed: 0.35 },
      );
    // Pilgrims kneeling before the doors, a deacon tending the lamps.
    for (let i = 0; i < 3; i += 1)
      cast.add({ at: [4 + i * 1.5, 0, L.front - 3.5], rotY: 0, action: "kneel", female: i === 1 });
    fire(b, lampstand([9, 0, L.front - 1.8], 1.6), 0.15, true);
    cast.add({ at: [9, 0, L.front - 2.8], rotY: 0, action: "tend", role: "priest" });
  } else {
    // Rows at prayer before the doors, on their mats.
    for (let r = 0; r < 2; r += 1)
      for (let i = 0; i < 9; i += 1)
        cast.add({
          at: [-8 + i * 2, 0, L.front - 5 - r * 1.8],
          rotY: 0,
          action: "pray",
          role: r === 0 && i === 4 ? "priest" : "citizen",
        });
  }
  // Outside the gate: sellers and passers-by, a beggar, children.
  const x = aside(b, Math.round(spec.hallWidth * 10));
  const gz = L.courtFront - 6;
  if (!byz) trades.hawker(x, [-9, 0, gz], 0);
  if (!byz) trades.beggar(x, [5.5, 0, L.courtFront - 2.2], PI);
  trades.ballGame(x, [12, 0, gz - 4], [15, 0, gz - 2]);
  if (!byz) trades.elders(x, [-15, 0, gz - 3], PI / 2, 2, true);
  for (let i = 0; i < 6; i += 1)
    cast.walk(
      [
        [-30, 0, gz - 6 - i * 0.6],
        [30, 0, gz - 6 - i * 0.6],
      ],
      { speed: 0.6 + rand() * 0.3, female: i === 2 },
    );
  for (const s of [-1, 1]) fire(b, torchStand([s * 4.2, 0, L.courtFront - 2], 2.2), 0.3, s > 0);
  fire(b, brazier([-6, 0, gz + 1.5], 0.8), 0.3, true, true);
  dog(b, [8, 0, gz - 1]);
  return finish(b);
}

/**
 * The square at the foot of the Galata Tower: the watch at its door, a
 * Genoese merchant and his clerk, porters bringing goods up from the harbour,
 * women at the fountain, children.
 */
export function towerLife(spec: TowerSpec, era: Era): SceneLife {
  const b = make(era, 1348);
  const { cast, rand } = b;
  const R = spec.outerDiameter / 2;
  cast.add({ at: [-1.8, 0, -R - 1.4], rotY: PI, action: "stand", role: "worker" });
  cast.add({ at: [1.8, 0, -R - 1.4], rotY: PI, action: "talk", role: "worker" });
  cast.add({ at: [4, 0, -R - 5], rotY: -0.6, action: "talk", role: "official" });
  cast.add({ at: [5, 0, -R - 4.4], rotY: -2.4, action: "talk", role: "worker" });
  // Up on the gallery, people looking out over the Horn.
  cast.add({ at: [0, spec.galleryHeight, -R - 0.7], rotY: PI, action: "gaze", role: "worker" });
  cast.add({ at: [R + 0.7, spec.galleryHeight, 0], rotY: PI / 2, action: "point" });
  const x = aside(b, 1349);
  for (let i = 0; i < 3; i += 1)
    cast.walk(
      [
        [-9 + i * 0.7, 0, -11 - i * 0.4],
        [-3, 0, -R - 3 - i * 0.6],
      ],
      { carry: "basket", role: "worker", speed: 0.55 },
    );
  for (let i = 0; i < 8; i += 1) {
    const a = rand() * PI * 2;
    const r = R + 2.5 + rand() * 3;
    cast.walk(
      [
        [Math.sin(a) * r, 0, Math.cos(a) * r],
        [Math.sin(a + 1.4) * r, 0, Math.cos(a + 1.4) * r],
      ],
      { speed: 0.5 + rand() * 0.3, female: i % 4 === 1 },
    );
  }
  trades.knucklebones(x, [-6, 0, R + 4], 0.4);
  trades.fishmonger(x, [6, 0, -12.5], 2.6);
  fire(b, torchStand([-2.6, 0, -R - 0.8], 2.2), 0.3, true);
  fire(b, torchStand([2.6, 0, -R - 0.8], 2.2), 0.3, false);
  dog(b, [-6, 0, -R - 6]);
  return finish(b);
}

/**
 * The cistern as visitors walk it: people along the walkways under the
 * lamps, a few stopped at the Medusa heads and the weeping column, the
 * cistern-keeper with his torch.
 */
export function cisternLife(spec: CisternSpec, era: Era): SceneLife {
  const b = make(era, 336);
  const { cast, rand } = b;
  const L = cisternLayout(spec);
  const wz = [-L.sz * 2, L.sz * 1];
  for (let i = 0; i < 12; i += 1) {
    const z = wz[i % 2]! + (rand() - 0.5) * 0.8;
    const route: Vec3[] = [
      [-spec.length / 2 + 6, L.walk, z],
      [spec.length / 2 - 4, L.walk, z],
    ];
    cast.walk(i % 3 === 0 ? [...route].reverse() : route, {
      speed: 0.35 + rand() * 0.25,
      female: i % 6 === 1,
    });
  }
  cast.add({
    at: [-spec.length / 2 + 4, L.walk, wz[1]! - 0.5],
    rotY: PI / 2,
    action: "stand",
    role: "worker",
    carry: "torch",
  });
  cast.group([-spec.length / 2 + 4, L.walk, (wz[0]! + wz[1]!) / 2], 3, 0.6);
  // Visitors pointing out the Medusa heads and the weeping column, a man sweeping the walk.
  const x = aside(b, 337);
  trades.gazer(
    x,
    [-spec.length / 2 + 2.4, L.walk, wz[1]! + 0.5],
    [-spec.length / 2 + L.sx * 0.5, 1, spec.width / 2 - L.sz * 0.5],
    {},
    true,
  );
  trades.gazer(
    x,
    [-spec.length / 2 + L.sx * 3.5, L.walk, wz[1]! - 0.6],
    [-spec.length / 2 + L.sx * 3.5, 3, -spec.width / 2 + L.sz * 1.5],
    { female: true },
    true,
  );
  trades.gazer(x, [10, L.walk, wz[0]! + 0.6], [10, spec.columnHeight, wz[0]! + 6]);
  for (let i = 0; i < 10; i += 1) {
    const x = -spec.length / 2 + 8 + i * ((spec.length - 14) / 9);
    for (const z of wz) fire(b, lampstand([x, L.walk, z + 1.0], 1.2), 0.12, i % 3 === 0);
  }
  return finish(b);
}
