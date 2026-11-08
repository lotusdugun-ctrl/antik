import type { Vec3 } from "@/lib/reconstruction-parts";
import {
  lifeAnimal as animal,
  lifeAside as aside,
  lifeBrazier as brazier,
  lifeDog as dog,
  lifeFinish as finish,
  lifeFire as fire,
  lifeJar as jar,
  lifeMake as make,
  lifeTorchStand as torchStand,
  lifeAltar as altar,
  type Era,
  type SceneLife,
} from "@/lib/scene-life";
import type {
  SteppedPyramidSpec,
  AsianHallSpec,
  EgyptianPylonSpec,
  MegalithicPlatformSpec,
  ZigguratSpec,
  PersianApadanaSpec,
  KhmerTempleSpec,
  IndicMonumentSpec,
} from "@/lib/models/dunya-modelleri";
import * as trades from "@/lib/scene-trades";

/* ================================================================== *
 * 1. MAYA STEPPED PYRAMID LIFE
 * ================================================================== */

export function steppedPyramidLife(spec: SteppedPyramidSpec, era: Era): SceneLife {
  const b = make(era, 4919);
  const { cast, rand } = b;
  const frontZ = -spec.baseDepth / 2 - 2;

  // Ceremonial fire on a low stone altar in the front plaza:
  fire(b, altar([0, 0, frontZ - 10.5], 2.6, 1.4, 0.9), 0.9, true, true);

  // Maya priests tending incense at the plaza altar:
  cast.add({
    at: [0, 0, frontZ - 9.0],
    rotY: Math.PI,
    action: "tend",
    role: "priest",
    carry: "incense",
  });
  cast.add({
    at: [-1.8, 0, frontZ - 9.8],
    rotY: Math.PI * 0.75,
    action: "pray",
    role: "priest",
    carry: "offering",
  });
  cast.add({
    at: [1.8, 0, frontZ - 9.8],
    rotY: -Math.PI * 0.75,
    action: "play",
    role: "musician",
    carry: "aulos",
  });

  // Citizens and worshippers gathered across the wide plaza:
  cast.group([-spec.baseWidth * 0.35, 0, frontZ - 14], 3, 0.8);
  cast.group([spec.baseWidth * 0.35, 0, frontZ - 15], 2, 0.7);

  // Procession crossing the plaza before the stelae:
  const walkRoute: Vec3[] = [
    [-spec.baseWidth * 0.45, 0, frontZ - 17],
    [spec.baseWidth * 0.45, 0, frontZ - 17],
  ];
  cast.walk(walkRoute, { speed: 0.7, carry: "offering", role: "citizen" });

  const x = aside(b, 8831);
  trades.hawker(x, [-spec.baseWidth * 0.38, 0, frontZ - 19], Math.PI / 2);
  trades.cook(x, [spec.baseWidth * 0.38, 0, frontZ - 19], -Math.PI / 2);

  return finish(b);
}

/* ================================================================== *
 * 2. EAST ASIAN PALACE / PAGODA LIFE
 * ================================================================== */

export function asianHallLife(spec: AsianHallSpec, era: Era): SceneLife {
  const b = make(era, 7129);
  const { cast, rand } = b;
  const frontZ = -spec.depth / 2 - 4;

  // Twin bronze incense braziers flanking the imperial processional stairs:
  fire(b, brazier([-4.5, 0, frontZ - 5], 0.8), 0.4, true, true);
  fire(b, brazier([4.5, 0, frontZ - 5], 0.8), 0.4, true, true);

  // Imperial guards stationed in front of the terrace:
  cast.add({
    at: [-3.5, 0, frontZ - 2],
    rotY: Math.PI,
    action: "stand",
    role: "soldier",
    carry: "spear",
  });
  cast.add({
    at: [3.5, 0, frontZ - 2],
    rotY: Math.PI,
    action: "stand",
    role: "soldier",
    carry: "spear",
  });

  // Scholars, court scribes and officials in conversation:
  cast.group([-spec.width * 0.32, 0, frontZ - 10], 3, 0.75, "official");
  cast.group([spec.width * 0.32, 0, frontZ - 12], 2, 0.65, "citizen");

  // A court messenger crossing the wide flagged courtyard:
  const crossCourt: Vec3[] = [
    [-spec.width * 0.45, 0, frontZ - 15],
    [spec.width * 0.45, 0, frontZ - 15],
  ];
  cast.walk(crossCourt, { speed: 0.8, carry: "scroll", role: "official" });

  const x = aside(b, 5171);
  trades.weigher(x, [-spec.width * 0.35, 0, frontZ - 18], Math.PI / 2);
  trades.carpenter(x, [spec.width * 0.35, 0, frontZ - 18], -Math.PI / 2);

  return finish(b);
}

/* ================================================================== *
 * 3. EGYPTIAN PYLON & DROMOS LIFE
 * ================================================================== */

export function egyptianPylonLife(spec: EgyptianPylonSpec, era: Era): SceneLife {
  const b = make(era, 1341);
  const { cast, rand } = b;
  const frontZ = -spec.pylonDepth / 2 - 3;

  // Sacred temple fire burning in a stone altar basin before the portal:
  fire(b, altar([0, 0, frontZ - 6], 3.5, 2.0, 1.2), 1.0, true, true);

  // High priests performing libation and incense offerings:
  cast.add({
    at: [0, 0, frontZ - 4.5],
    rotY: Math.PI,
    action: "tend",
    role: "priest",
    carry: "incense",
  });
  cast.add({
    at: [-2.2, 0, frontZ - 5.5],
    rotY: Math.PI * 0.75,
    action: "pray",
    role: "priest",
    carry: "offering",
  });
  cast.add({
    at: [2.2, 0, frontZ - 5.5],
    rotY: -Math.PI * 0.75,
    action: "play",
    role: "musician",
    carry: "aulos",
  });

  // Priestly procession proceeding along the Avenue of Sphinxes:
  for (let i = 0; i < 5; i += 1) {
    const x = (i % 2 === 0 ? -1 : 1) * 1.5;
    const z0 = frontZ - 12 - i * 4;
    cast.walk(
      [
        [x, 0, z0],
        [x, 0, frontZ - 7],
      ],
      { speed: 0.7, role: i === 0 ? "official" : "priest", carry: "offering" },
    );
  }

  // Citizens and water carriers resting near the entrance:
  cast.group([-spec.facadeWidth * 0.35, 0, frontZ - 14], 3, 0.8);
  cast.group([spec.facadeWidth * 0.35, 0, frontZ - 16], 2, 0.7);

  const x = aside(b, 6203);
  trades.potter(x, [-spec.facadeWidth * 0.38, 0, frontZ - 20], Math.PI / 2);
  trades.butcher(x, [spec.facadeWidth * 0.38, 0, frontZ - 20], -Math.PI / 2);

  return finish(b);
}

/* ================================================================== *
 * 4. ANDEAN MEGALITHIC PLATFORM LIFE
 * ================================================================== */

export function megalithicPlatformLife(spec: MegalithicPlatformSpec, era: Era): SceneLife {
  const b = make(era, 5917);
  const { cast, rand } = b;
  const frontZ = -spec.platformLength / 2 - 3;

  // Sacred solar ritual fire in stone brazier before the stairway:
  fire(b, brazier([0, 0, frontZ - 5], 0.8), 0.4, true, true);

  // Tiwanaku sun priests performing the solstice ceremony:
  cast.add({
    at: [0, 0, frontZ - 3.5],
    rotY: Math.PI,
    action: "tend",
    role: "priest",
    carry: "incense",
  });
  cast.add({
    at: [-2, 0, frontZ - 4.5],
    rotY: Math.PI * 0.75,
    action: "pray",
    role: "priest",
    carry: "offering",
  });
  cast.add({
    at: [2, 0, frontZ - 4.5],
    rotY: -Math.PI * 0.75,
    action: "play",
    role: "musician",
    carry: "aulos",
  });

  // Andean llamas / pack animals crossing the lower ceremonial esplanade:
  animal(b, "donkey", [-15, 0, frontZ - 12], Math.PI / 2, "walk", {
    route: [
      [-15, 0, frontZ - 12],
      [15, 0, frontZ - 12],
    ],
    speed: 0.75,
  });

  // Worshippers in highland woven dress standing in the open plaza:
  cast.group([-spec.platformWidth * 0.3, 0, frontZ - 14], 3, 0.75);
  cast.group([spec.platformWidth * 0.3, 0, frontZ - 16], 2, 0.65);

  const x = aside(b, 4421);
  trades.cook(x, [-spec.platformWidth * 0.35, 0, frontZ - 18], Math.PI / 2);
  trades.hawker(x, [spec.platformWidth * 0.35, 0, frontZ - 18], -Math.PI / 2);

  return finish(b);
}

/* ================================================================== *
 * 5. MESOPOTAMIAN ZIGGURAT LIFE (BABYLON & UR)
 * ================================================================== */

export function zigguratLife(spec: ZigguratSpec, era: Era): SceneLife {
  const b = make(era, 4129);
  const { cast, rand } = b;
  const frontZ = -(spec.baseDepth / 2) - 14;

  // Bronze brazier fire burning before the central staircase:
  fire(b, brazier([-3.5, 0, frontZ - 2]), 0.85, true, true);
  fire(b, brazier([3.5, 0, frontZ - 2]), 0.85, true, true);

  // Babylonian high priest in kaunakes fringed wool robe offering incense:
  cast.add({
    at: [0, 0, frontZ - 2.5],
    rotY: Math.PI,
    action: "tend",
    role: "priest",
    carry: "incense",
  });
  cast.add({
    at: [-2.0, 0, frontZ - 3.2],
    rotY: Math.PI * 0.8,
    action: "pray",
    role: "priest",
    carry: "offering",
  });
  cast.add({
    at: [2.0, 0, frontZ - 3.2],
    rotY: -Math.PI * 0.8,
    action: "play",
    role: "musician",
    carry: "lyre",
  });

  // Temple guards with bronze spears guarding the staircase landing:
  cast.add({
    at: [-spec.stairWidth / 2 - 1.2, 0, frontZ],
    rotY: 0,
    action: "stand",
    role: "soldier",
    carry: "spear",
  });
  cast.add({
    at: [spec.stairWidth / 2 + 1.2, 0, frontZ],
    rotY: 0,
    action: "stand",
    role: "soldier",
    carry: "spear",
  });

  // Sumerian / Babylonian scribes and citizens in the forecourt:
  cast.group([-spec.baseWidth * 0.28, 0, frontZ - 8], 3, 0.7);
  cast.group([spec.baseWidth * 0.28, 0, frontZ - 10], 2, 0.65);

  const x = aside(b, 5119);
  trades.hawker(x, [-spec.baseWidth * 0.32, 0, frontZ - 14], Math.PI / 2);
  trades.cook(x, [spec.baseWidth * 0.32, 0, frontZ - 14], -Math.PI / 2);

  return finish(b);
}

/* ================================================================== *
 * 6. PERSIAN APADANA LIFE (PERSEPOLIS & PASARGADAE)
 * ================================================================== */

export function persianApadanaLife(spec: PersianApadanaSpec, era: Era): SceneLife {
  const b = make(era, 6219);
  const { cast, rand } = b;
  const frontZ = -(spec.platformDepth / 2) - 12;

  // Achaemenid Immortals (Royal Guard) in pleated robes with golden spears:
  cast.add({
    at: [-4.5, 0, frontZ],
    rotY: 0,
    action: "stand",
    role: "soldier",
    carry: "spear",
  });
  cast.add({
    at: [4.5, 0, frontZ],
    rotY: 0,
    action: "stand",
    role: "soldier",
    carry: "spear",
  });

  // Persian and Median court dignitaries gathered at the stairway approach:
  cast.group([-spec.platformWidth * 0.25, 0, frontZ - 6], 3, 0.85);
  cast.group([spec.platformWidth * 0.25, 0, frontZ - 8], 2, 0.75);

  // Zoroastrian sacred fire altar on the ceremonial esplanade:
  fire(b, altar([0, 0, frontZ - 8], 2.2, 1.4, 0.9), 0.9, true, true);
  cast.add({
    at: [0, 0, frontZ - 6.5],
    rotY: Math.PI,
    action: "tend",
    role: "priest",
    carry: "incense",
  });

  // Tribute bearers carrying offerings towards the grand staircase:
  cast.add({
    at: [-8, 0, frontZ - 10],
    rotY: Math.PI * 0.25,
    action: "walk",
    role: "citizen",
    carry: "offering",
  });

  const x = aside(b, 7319);
  trades.hawker(x, [-spec.platformWidth * 0.35, 0, frontZ - 14], Math.PI / 2);

  return finish(b);
}

/* ================================================================== *
 * 7. KHMER TEMPLE LIFE (ANGKOR WAT & BAYON)
 * ================================================================== */

export function khmerTempleLife(spec: KhmerTempleSpec, era: Era): SceneLife {
  const b = make(era, 7129);
  const { cast, rand } = b;
  const moatZ = -spec.baseDepth / 2 - spec.causewayLength / 2 - 4;
  const bridgeHeadZ = moatZ - 15;

  // Buddhist monks in saffron robes along the ceremonial causeway:
  cast.add({
    at: [-1.5, 0.81, moatZ + 4],
    rotY: 0,
    action: "walk",
    role: "priest",
    carry: "incense",
  });
  cast.add({
    at: [1.5, 0.81, moatZ - 2],
    rotY: 0,
    action: "pray",
    role: "priest",
    carry: "offering",
  });

  // Devout worshippers placing lotus flowers and lighting incense:
  fire(b, brazier([0, 0.81, moatZ + 8]), 0.75, true, true);
  cast.add({
    at: [0, 0.81, moatZ + 6.5],
    rotY: Math.PI,
    action: "tend",
    role: "citizen",
    carry: "incense",
  });

  // Khmer citizens outside the causeway plaza:
  const plazaZ = bridgeHeadZ - 6;
  cast.group([-12, 0, plazaZ], 2, 0.75);
  cast.group([12, 0, plazaZ - 2], 3, 0.7);

  const x = aside(b, 8419);
  trades.hawker(x, [-16, 0, plazaZ - 4], Math.PI / 2);
  trades.cook(x, [16, 0, plazaZ - 4], -Math.PI / 2);

  return finish(b);
}

/* ================================================================== *
 * 8. INDIC MONUMENT LIFE (HAMPI & MOHENJO-DARO)
 * ================================================================== */

export function indicMonumentLife(spec: IndicMonumentSpec, era: Era): SceneLife {
  const b = make(era, 9119);
  const { cast, rand } = b;
  const frontZ = -(spec.baseDepth / 2) - 8;

  if (spec.monumentType === "great-bath") {
    // Mohenjo-daro: Indus Valley citizens at the Great Bath:
    cast.add({
      at: [-4, 0.6, 0],
      rotY: Math.PI / 2,
      action: "stand",
      role: "citizen",
    });
    cast.add({
      at: [4, 0.6, 0],
      rotY: -Math.PI / 2,
      action: "stand",
      role: "citizen",
    });
    cast.group([0, 0, frontZ - 2], 3, 0.75);

    const x = aside(b, 9219);
    trades.potter(x, [-spec.baseWidth * 0.35, 0, frontZ - 6], Math.PI / 2);
    trades.hawker(x, [spec.baseWidth * 0.35, 0, frontZ - 6], -Math.PI / 2);

    return finish(b);
  }

  // Hampi: Virupaksha Gopuram temple courtyard with priests, musicians and devotees:
  fire(b, brazier([-3, 0, frontZ]), 0.8, true, true);
  fire(b, brazier([3, 0, frontZ]), 0.8, true, true);

  cast.add({
    at: [0, 0, frontZ - 2],
    rotY: Math.PI,
    action: "pray",
    role: "priest",
    carry: "incense",
  });
  cast.add({
    at: [-2, 0, frontZ - 3],
    rotY: Math.PI * 0.75,
    action: "play",
    role: "musician",
    carry: "aulos",
  });
  cast.add({
    at: [2, 0, frontZ - 3],
    rotY: -Math.PI * 0.75,
    action: "pray",
    role: "citizen",
    carry: "offering",
  });

  // Devotees gathered near the Vittala Stone Chariot:
  cast.group([-spec.baseWidth * 0.25, 0, frontZ - 6], 3, 0.8);
  cast.group([spec.baseWidth * 0.25, 0, frontZ - 8], 2, 0.7);

  const x = aside(b, 9319);
  trades.hawker(x, [-spec.baseWidth * 0.32, 0, frontZ - 10], Math.PI / 2);
  trades.cook(x, [spec.baseWidth * 0.32, 0, frontZ - 10], -Math.PI / 2);

  return finish(b);
}
