import {
  kitBox as box,
  kitCyl as cyl,
  kitWorn as worn,
  type Part,
  type WalkStart,
} from "@/lib/reconstruction-parts";
import { lifeFinish as finish, lifeMake as make, type Era, type SceneLife } from "@/lib/scene-life";

/* ================================================================== *
 * PAGODA: the Buddhist tower of China and Japan
 *
 * Two ways of building it. `brick`, as the Giant Wild Goose Pagoda of
 * Chang'an: a square brick tower narrowing storey by storey, each storey
 * marked by a thin corbelled cornice, on a high platform. `timber`, as the
 * pagodas of Nara and Kyoto: square timber storeys under wide eaves, a
 * bronze spire of rings on top; with `pentRoofs`, a smaller skirt roof
 * between each pair of eaves (Yakushi-ji's east pagoda).
 * ================================================================== */

export type PagodaSpec = {
  kind: "pagoda";
  /** Cited: storeys, and the height to the tip (with the base). */
  storeys: number;
  totalHeight: number;
  /** Modelled: the side of the lowest storey. */
  baseWidth: number;
  build: "brick" | "timber";
  /** Skirt roofs between the main eaves (Yakushi-ji). */
  pentRoofs?: boolean;
};

export function pagodaParts(spec: PagodaSpec): Part[] {
  const parts: Part[] = [];
  const N = spec.storeys;
  const W = spec.baseWidth;
  const H = spec.totalHeight;

  if (spec.build === "brick") {
    // The platform, a fifth of the height, with a stair up the south.
    const podH = H * 0.08;
    const podW = W * 1.9;
    parts.push(worn(box("limestone", [0, 0, 0], [podW, podH, podW]), 0.04));
    for (let s = 0; s < 10; s += 1) {
      parts.push(
        box("stone", [0, 0, -podW / 2 - 0.3 - s * 0.4], [5, ((10 - s) * podH) / 10, 0.45]),
      );
    }
    // The spire takes the last tenth.
    const spire = H * 0.07;
    const body = H - podH - spire;
    const storeyH = body / N;
    for (let i = 0; i < N; i += 1) {
      const w = W * (1 - (0.45 * i) / N);
      const y = podH + i * storeyH;
      parts.push(worn(box("limestone", [0, y, 0], [w, storeyH - 0.5, w]), 0.02));
      // The corbelled cornice: a thin brick ledge proud of the wall.
      parts.push(box("limestone", [0, y + storeyH - 0.5, 0], [w + 1.2, 0.5, w + 1.2]));
      // An arched window in the middle of each face.
      for (const [dx, dz, rot] of [
        [0, -1, 0],
        [0, 1, 0],
        [-1, 0, Math.PI / 2],
        [1, 0, Math.PI / 2],
      ] as const) {
        parts.push(
          box(
            "shadow",
            [dx * (w / 2 + 0.03), y + storeyH * 0.3, dz * (w / 2 + 0.03)],
            [1.4, storeyH * 0.38, 0.06],
            rot,
          ),
        );
      }
    }
    const topY = podH + body;
    parts.push(cyl("limestone", [0, topY, 0], 1.6, 0.3, spire, 12));
    return parts;
  }

  // Timber: a stone plinth, then storeys of red posts and white walls under deep eaves.
  const plinthH = 1.4;
  parts.push(worn(box("stone", [0, 0, 0], [W + 4, plinthH, W + 4]), 0.03));
  const spire = H * 0.3;
  const body = H - plinthH - spire;
  const storeyH = body / N;
  for (let i = 0; i < N; i += 1) {
    const w = W * (1 - (0.32 * i) / N);
    const y = plinthH + i * storeyH;
    const wallH = storeyH * 0.55;
    parts.push(box("linen", [0, y, 0], [w, wallH, w]));
    // Red corner posts.
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        parts.push(box("paintRed", [(sx * w) / 2, y, (sz * w) / 2], [0.5, wallH, 0.5]));
    // The bracket course, then the wide eaves of dark tile, stepped so they read as a slope.
    parts.push(box("paintRed", [0, y + wallH, 0], [w + 0.8, storeyH * 0.12, w + 0.8]));
    const eaveY = y + wallH + storeyH * 0.12;
    const eave = w + 6.5 - i * 0.4;
    parts.push(box("andesite", [0, eaveY, 0], [eave, storeyH * 0.1, eave]));
    parts.push(
      box("andesite", [0, eaveY + storeyH * 0.1, 0], [eave - 2.2, storeyH * 0.1, eave - 2.2]),
    );
    parts.push(
      box("andesite", [0, eaveY + storeyH * 0.2, 0], [eave - 4.4, storeyH * 0.13, eave - 4.4]),
    );
    if (spec.pentRoofs) {
      // The skirt roof halfway up the storey, smaller than the main eave.
      parts.push(box("andesite", [0, y + wallH * 0.45, 0], [w + 3, 0.35, w + 3]));
    }
  }
  // The spire: a bronze mast with nine rings.
  const topY = plinthH + body;
  parts.push(box("stoneDark", [0, topY, 0], [3.2, 0.8, 3.2]));
  parts.push(cyl("bronze", [0, topY + 0.8, 0], 0.22, 0.18, spire - 0.8, 10));
  for (let r = 0; r < 9; r += 1) {
    parts.push(cyl("bronze", [0, topY + 1.6 + r * ((spire - 4) / 9), 0], 0.95, 0.95, 0.18, 14));
  }
  return parts;
}

export function pagodaWalkStart(spec: PagodaSpec): WalkStart {
  return {
    at: [0, -spec.baseWidth * 2 - 10],
    floor: 0,
    look: [0, spec.totalHeight * 0.45, 0],
  };
}

export function pagodaLife(spec: PagodaSpec, era: Era): SceneLife {
  const b = make(era, 6121);
  const { cast } = b;
  const front = -spec.baseWidth * 1.4 - 8;
  cast.add({ at: [-2, 0, front], rotY: 0, action: "pray", role: "priest" });
  cast.add({ at: [2, 0, front - 1], rotY: 0, action: "pray" });
  cast.group([-6, 0, front - 6], 3, 0.8);
  cast.walk(
    [
      [-spec.baseWidth * 1.4 - 6, 0, front - 3],
      [spec.baseWidth * 1.4 + 6, 0, front - 3],
    ],
    { speed: 0.8 },
  );
  return finish(b);
}
