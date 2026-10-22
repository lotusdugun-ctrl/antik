import type * as THREE_NS from "three";
import { compactAttribute, remapIndex, weldVertices } from "@/lib/geometry-weld";
import { detailed } from "@/lib/render-budget";
import { batchMeshes } from "./batch";
import type {
  Action,
  Animal,
  Carry,
  Chariot,
  Flame,
  Headwear,
  Look,
  Person,
  SceneLife,
  Seat,
  Species,
} from "@/lib/scene-life";
import {
  FORE,
  HIP,
  LAP,
  NECK,
  SEATED,
  SHIN,
  SHOULDER,
  THIGH,
  UPPER,
  figureKit,
  lookHash,
} from "./figure";

type Vec3Tuple = [number, number, number];

/** Gold for earrings and necklaces. */
const GOLD = 0xc9a43c;

type ThreeModule = typeof import("three");

/**
 * The life of a scene, drawn: the people walking and talking, the fires and
 * their smoke, and the seated crowd in a theatre or a stadium.
 *
 * People are built at one metre tall and scaled, from a handful of meshes
 * each — a body, two arms, two legs — whose pieces are coloured per vertex so
 * the whole cast shares one material. That is what keeps a hundred people to
 * a few hundred draw calls. A crowd of thousands is three instanced meshes.
 *
 * Fires are sprites rather than geometry: a flame has no surface, only light,
 * and a sprite always turns its brightest face to the camera.
 */

export type LifeHandle = {
  group: THREE_NS.Group;
  /** `glow` runs from 0 at noon to 1 at night: how much the fires light. */
  update: (now: number, dt: number, glow: number, camera: THREE_NS.Camera) => void;
  dispose: () => void;
};

type Pivot = THREE_NS.Object3D;

type Actor = {
  person: Person;
  root: THREE_NS.Group;
  body: THREE_NS.Group;
  armR: Pivot;
  elbowR: Pivot;
  armL: Pivot;
  elbowL: Pivot;
  legR: Pivot;
  kneeR: Pivot;
  legL: Pivot;
  kneeL: Pivot;
  head: Pivot;
  /** The loop the walker follows, closed, with the length of each side. */
  path?: { points: THREE_NS.Vector3[]; lengths: number[]; total: number };
  heading: number;
  robed: boolean;
  /** The skirt of the close figure, hung from the hips so its hem can swing. */
  hem: Pivot | null;
  /** The close, detailed figure and the plain far one: one shows at a time. */
  near: THREE_NS.Object3D[];
  far: THREE_NS.Object3D[];
  close: boolean;
  /** A juggler's balls, moved every frame. */
  balls?: THREE_NS.Object3D[];
  /** Somebody this one does something with: a ball between them, a pole. */
  link?: ActorLink;
};

type ActorLink = { other: Actor; first: boolean; kind: "pole" | "ball"; phase: number };

/** Where a ball is in its flight, 0 to 1, the same for both of a pair. */
const ballClock = (link: ActorLink, now: number) => {
  const k = (now + link.phase) / BALL_PERIOD;
  return k - Math.floor(k);
};

/** Collects the close and the far versions of somebody as they are built. */
type Lod = {
  near: <T extends THREE_NS.Object3D>(o: T) => T;
  far: <T extends THREE_NS.Object3D>(o: T) => T;
};

/**
 * Within this distance (in metres, with a margin so nobody flickers at the
 * edge) somebody is drawn in full; beyond it, as the plain figure.
 */
const NEAR_IN = 24;
const NEAR_OUT = 28;

type Fire = {
  flame: Flame;
  core: THREE_NS.Sprite;
  outer: THREE_NS.Sprite;
  halo: THREE_NS.Sprite;
  light: THREE_NS.PointLight | null;
  phase: number;
  /** Set for a flame carried by somebody: its position follows the torch. */
  holder?: THREE_NS.Object3D;
};

type Puff = {
  sprite: THREE_NS.Sprite;
  age: number;
  life: number;
  source: THREE_NS.Vector3;
  drift: number;
  size: number;
};

const LONG: ReadonlySet<Look["garment"]> = new Set([
  "chiton",
  "peplos",
  "himation",
  "toga",
  "robe",
]);

type Arm = readonly [rx: number, re: number, rz: number];

/**
 * How each trade holds its arms, before the work moves them: the shoulder's
 * pitch (negative is forward and up), the elbow's bend and the arm's swing
 * out from the side, right and left, and how far the body leans into it.
 * The hand items that hang or stand upright are turned by the same angles,
 * so a balance hangs plumb from the hand that holds it up.
 */
const HOLD: Partial<Record<Action, { r?: Arm; l?: Arm; lean?: number }>> = {
  pot: { r: [-0.5, -0.25, 0.22], l: [-0.5, -0.25, -0.22], lean: 0.38 },
  weave: { r: [-1.3, -0.45, -0.05], l: [-1.15, -0.55, 0.05] },
  spin: { r: [-0.3, -0.65, 0.1], l: [-0.35, -1.45, -0.2] },
  write: { r: [-0.5, -0.95, 0.32], l: [-0.45, -1.05, -0.4], lean: 0.12 },
  count: { r: [-0.55, -0.8, 0.18], l: [-0.55, -0.8, -0.18], lean: 0.15 },
  weigh: { r: [-1.05, -0.85, 0.05], l: [-0.35, -1.0, 0.1] },
  haggle: { r: [-0.45, -1.2, -0.25], l: [-0.45, -1.2, 0.25] },
  call: { r: [-0.85, -2.35, 0.3], l: [-2.6, -0.35, 0.35] },
  knead: { r: [-0.75, -0.45, 0.15], l: [-0.75, -0.45, -0.15], lean: 0.32 },
  grind: { r: [-0.85, -0.15, 0.12], l: [-0.85, -0.15, -0.12], lean: 0.62 },
  chop: { r: [-1.5, -0.55, 0.05], l: [-0.8, -0.5, -0.1], lean: 0.2 },
  stir: { r: [-0.7, -0.5, 0.1], l: [0.25, -1.5, 0.55], lean: 0.22 },
  carve: { r: [-1.25, -1.05, 0.15], l: [-0.85, -0.7, -0.15], lean: 0.32 },
  saw: { r: [-0.85, -0.85, 0.05], l: [-0.9, -0.45, -0.2], lean: 0.3 },
  paint: { r: [-2.3, -0.35, 0.1], l: [-0.3, -0.5, 0.1] },
  sweep: { r: [-0.75, -0.35, 0.25], l: [-0.55, -0.9, -0.35], lean: 0.3 },
  hoe: { r: [-1.0, -0.35, 0.1], l: [-0.95, -0.55, -0.1], lean: 0.3 },
  beg: { r: [-1.0, -0.45, 0.1], l: [-0.3, -0.4, 0.1], lean: -0.05 },
  pour: { r: [-1.2, -0.45, 0.05], l: [-1.7, -0.35, 0.25] },
  dance: { r: [-2.3, -0.4, -0.45], l: [-2.0, -0.5, 0.5] },
  juggle: { r: [-0.45, -1.05, 0.12], l: [-0.45, -1.05, -0.12] },
  stretch: { r: [-2.95, -0.1, 0.18], l: [-2.95, -0.1, -0.18] },
  wrestle: { r: [-1.45, -0.55, 0.25], l: [-1.45, -0.55, -0.25], lean: 0.5 },
  throw: { r: [0.85, -0.2, -0.55], l: [-1.0, -0.3, -0.4], lean: 0.4 },
  toss: { r: [-0.9, -0.6, 0.2], l: [-0.9, -0.6, -0.2] },
  crouch: { r: [-0.65, -0.55, 0.1], l: [-0.55, -0.6, -0.1], lean: 0.35 },
  lean: { r: [-0.55, -1.95, 0.6], l: [-0.5, -1.9, -0.6], lean: -0.1 },
  point: { r: [-1.85, -0.1, -0.12], l: [0.05, -0.15, 0.08] },
  gaze: { r: [-0.25, -0.95, 0.42], l: [-0.25, -0.95, -0.42] },
  lecture: { r: [-1.4, -0.7, -0.2], l: [-0.5, -1.15, -0.1] },
  plough: { r: [-0.6, -0.3, 0.12], l: [-0.6, -0.3, -0.12], lean: 0.35 },
  strike: { r: [-1.35, -0.45, 0.3], l: [-0.35, -2.1, 0.1] },
};

/** How long a ball takes there and back between two children. */
const BALL_PERIOD = 2.6;

export function buildLife(THREE: ThreeModule, life: SceneLife): LifeHandle {
  const group = new THREE.Group();
  group.name = "life";
  const geometries: THREE_NS.BufferGeometry[] = [];
  const materials: THREE_NS.Material[] = [];
  const textures: THREE_NS.Texture[] = [];

  /* ---------------- shared material, and colouring ---------------- */

  const cloth = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.82,
    metalness: 0,
  });
  materials.push(cloth);

  const tmp = new THREE.Color();
  /** Paint every vertex of a geometry one colour, and flatten it for merging. */
  const paint = (geometry: THREE_NS.BufferGeometry, hex: number) => {
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    flat.deleteAttribute("uv");
    // `set` reads the hex as sRGB and stores it linear, which vertex colours want.
    tmp.set(hex);
    const count = flat.attributes["position"]!.count;
    const colours = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      colours[i * 3] = tmp.r;
      colours[i * 3 + 1] = tmp.g;
      colours[i * 3 + 2] = tmp.b;
    }
    flat.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    return flat;
  };

  /** Merge painted pieces into one geometry, without the addons import. */
  const merge = (pieces: THREE_NS.BufferGeometry[]) => {
    let count = 0;
    for (const piece of pieces) count += piece.attributes["position"]!.count;
    const position = new Float32Array(count * 3);
    const normal = new Float32Array(count * 3);
    const color = new Float32Array(count * 3);
    let offset = 0;
    for (const piece of pieces) {
      if (!piece.attributes["normal"]) piece.computeVertexNormals();
      const n = piece.attributes["position"]!.count;
      position.set(piece.attributes["position"]!.array as Float32Array, offset * 3);
      normal.set(piece.attributes["normal"]!.array as Float32Array, offset * 3);
      color.set(piece.attributes["color"]!.array as Float32Array, offset * 3);
      offset += n;
      piece.dispose();
    }
    /*
     * The pieces arrive flattened, one vertex per triangle corner; welding
     * the exact copies back together (see `geometry-weld.ts`) leaves each
     * figure looking exactly as it did with a third of the vertices. The
     * colours are dye colours between 0 and 1, which sixteen bits a channel
     * hold without a visible step, at half the memory of floats.
     */
    const weld = weldVertices(
      [
        { array: position, itemSize: 3 },
        { array: normal, itemSize: 3 },
        { array: color, itemSize: 3 },
      ],
      count,
    );
    const shade = compactAttribute(color, 3, weld.source);
    const packed = new Uint16Array(shade.length);
    for (let i = 0; i < shade.length; i += 1)
      packed[i] = Math.round(Math.min(1, Math.max(0, shade[i]!)) * 65535);
    const merged = new THREE.BufferGeometry();
    merged.setAttribute(
      "position",
      new THREE.BufferAttribute(compactAttribute(position, 3, weld.source), 3),
    );
    merged.setAttribute(
      "normal",
      new THREE.BufferAttribute(compactAttribute(normal, 3, weld.source), 3),
    );
    merged.setAttribute("color", new THREE.BufferAttribute(packed, 3, true));
    merged.setIndex(new THREE.BufferAttribute(remapIndex(weld, null), 1));
    merged.computeBoundingSphere();
    geometries.push(merged);
    return merged;
  };

  const meshOf = (pieces: THREE_NS.BufferGeometry[]) => {
    const mesh = new THREE.Mesh(merge(pieces), cloth);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  /* ---------------- primitives, at one metre tall ---------------- */

  type S = { y: number; z?: number; x?: number; rx: number; rz: number };
  /** A skin over horizontal ellipses stacked up a (possibly bent) axis. */
  const stack = (sections: S[], around = 14) => {
    const positions: number[] = [];
    for (const s of sections) {
      for (let j = 0; j < around; j += 1) {
        const a = (j / around) * Math.PI * 2;
        positions.push((s.x ?? 0) + Math.cos(a) * s.rx, s.y, (s.z ?? 0) + Math.sin(a) * s.rz);
      }
    }
    const index: number[] = [];
    for (let i = 0; i < sections.length - 1; i += 1) {
      for (let j = 0; j < around; j += 1) {
        const a = i * around + j;
        const b = i * around + ((j + 1) % around);
        const c = (i + 1) * around + j;
        const d = (i + 1) * around + ((j + 1) % around);
        index.push(a, c, b, b, c, d);
      }
    }
    // Caps.
    const bottom = positions.length / 3;
    const first = sections[0]!;
    positions.push(first.x ?? 0, first.y, first.z ?? 0);
    const top = bottom + 1;
    const last = sections[sections.length - 1]!;
    positions.push(last.x ?? 0, last.y, last.z ?? 0);
    const lastRing = (sections.length - 1) * around;
    for (let j = 0; j < around; j += 1) {
      index.push(bottom, j, (j + 1) % around);
      index.push(top, lastRing + ((j + 1) % around), lastRing + j);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(index);
    geometry.computeVertexNormals();
    return geometry;
  };

  /** A tube along a curve: a rolled mantle edge, a cloak's hem, a lyre's arm. */
  const tube = (points: [number, number, number][], radius: number, segments = 16) => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, segments, radius, 7, false);
  };

  const cylinder = (
    rTop: number,
    rBottom: number,
    height: number,
    at: [number, number, number],
    segments = 9,
  ) => {
    const g = new THREE.CylinderGeometry(rTop, rBottom, height, segments);
    g.translate(at[0], at[1], at[2]);
    return g;
  };

  const sphere = (
    r: number,
    at: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    w = 12,
    h = 9,
  ) => {
    const g = new THREE.SphereGeometry(r, w, h);
    g.scale(...scale);
    g.translate(...at);
    return g;
  };

  /* ---------------- the body ---------------- */

  const figure = figureKit(
    THREE,
    {
      paint,
      carried: (look, action, carry, carryLeft) => carried(look, action, carry, carryLeft),
      hairdo: (look) => hairdo(look),
      headwear: (look) => headwear(look.headwear, look),
      handItems: (carry, action, left) => handItems(carry, action, left),
      menHair: (look, near) => menHair(look, near),
      beard: (look, near) => beard(look, near),
      accessories: (look, action, near) => accessories(look, action, near),
    },
    life.era,
  );

  /** The parts of somebody that do not move against each other. */
  const bodyPieces = (look: Look, action: Person["action"], carry?: Carry, carryLeft?: Carry) => {
    const out: THREE_NS.BufferGeometry[] = [];
    const female = look.female;
    const long = LONG.has(look.garment);
    const seated = SEATED.has(action);
    const w = female ? 0.92 : 1;
    // Torso: waist, chest, shoulders, neck root.
    const torsoColour =
      look.garment === "armour" ? look.main : look.garment === "hide" ? look.main : look.main;
    out.push(
      paint(
        stack([
          { y: HIP - 0.02, rx: 0.105 * (female ? 1.08 : 1), rz: 0.08 },
          { y: 0.6, rx: 0.1 * w, rz: 0.075 },
          { y: 0.7, rx: 0.12 * w, rz: 0.085, z: female ? 0.006 : 0 },
          { y: 0.78, rx: 0.135 * w, rz: 0.075 },
          { y: 0.825, rx: 0.06, rz: 0.05 },
        ]),
        torsoColour,
      ),
    );
    if (female) {
      for (const side of [-1, 1])
        out.push(paint(sphere(0.034, [side * 0.045, 0.69, 0.07], [1, 0.85, 0.9], 8, 6), look.main));
    }
    // The skirt of the garment, or the hem of a short one.
    if (long && !seated) {
      out.push(
        paint(
          stack(
            [
              { y: 0.035, rx: 0.155, rz: 0.125 },
              { y: 0.2, rx: 0.14, rz: 0.11 },
              { y: 0.4, rx: 0.125, rz: 0.098 },
              { y: HIP + 0.04, rx: 0.11 * (female ? 1.08 : 1), rz: 0.085 },
            ],
            16,
          ),
          look.main,
        ),
      );
    } else if (look.garment !== "persian") {
      const hem = look.garment === "armour" ? 0.4 : 0.37;
      out.push(
        paint(
          stack(
            [
              { y: hem, rx: 0.135, rz: 0.11 },
              { y: HIP + 0.04, rx: 0.11, rz: 0.085 },
            ],
            14,
          ),
          look.garment === "armour" ? look.trim : look.main,
        ),
      );
    }
    // A belt.
    if (look.garment !== "toga" && look.garment !== "himation") {
      out.push(
        paint(
          cylinder(0.108, 0.108, 0.025, [0, 0.59, 0], 14),
          look.garment === "hide" ? look.trim : darker(look.trim),
        ),
      );
    }
    switch (look.garment) {
      case "himation":
      case "toga": {
        // The mantle: over the left shoulder, across the chest to the right
        // hip and round the back, and a fall straight down the left side.
        const r = look.garment === "toga" ? 0.042 : 0.036;
        out.push(
          paint(
            tube(
              [
                [0.13, 0.81, 0],
                [0.07, 0.72, 0.09],
                [-0.03, 0.62, 0.105],
                [-0.11, 0.52, 0.08],
                [-0.13, 0.47, 0],
                [-0.06, 0.48, -0.1],
                [0.08, 0.6, -0.09],
                [0.13, 0.78, -0.03],
              ],
              r,
              20,
            ),
            look.trim,
          ),
        );
        out.push(
          paint(
            stack(
              [
                { y: seated ? 0.45 : 0.12, x: 0.145, rx: 0.04, rz: 0.06 },
                { y: 0.5, x: 0.15, rx: 0.035, rz: 0.055 },
                { y: 0.8, x: 0.13, rx: 0.03, rz: 0.05 },
              ],
              8,
            ),
            look.trim,
          ),
        );
        if (look.garment === "toga" && look.trim !== look.main) {
          // The purple border of a magistrate's toga.
          out.push(
            paint(
              tube(
                [
                  [0.12, 0.82, 0.03],
                  [0.05, 0.72, 0.11],
                  [-0.05, 0.6, 0.125],
                  [-0.13, 0.5, 0.09],
                ],
                0.012,
                12,
              ),
              0x6a2f5d,
            ),
          );
        }
        break;
      }
      case "peplos": {
        // The overfold turned down from the shoulders to the hips.
        out.push(
          paint(
            stack(
              [
                { y: 0.52, rx: 0.13, rz: 0.1 },
                { y: 0.62, rx: 0.125, rz: 0.095 },
                { y: 0.72, rx: 0.13, rz: 0.092 },
              ],
              14,
            ),
            look.main,
          ),
        );
        out.push(paint(cylinder(0.131, 0.131, 0.02, [0, 0.52, 0], 14), look.trim));
        break;
      }
      case "chiton": {
        // A thin mantle across the shoulders.
        out.push(
          paint(
            tube(
              [
                [0.13, 0.8, -0.03],
                [0, 0.82, -0.08],
                [-0.13, 0.8, -0.03],
                [-0.15, 0.6, 0.02],
              ],
              0.025,
              12,
            ),
            look.trim,
          ),
        );
        break;
      }
      case "robe": {
        // A stole hung round the neck, both ends falling in front.
        for (const side of [-1, 1]) {
          out.push(
            paint(
              stack(
                [
                  { y: 0.25, x: side * 0.06, z: 0.11, rx: 0.025, rz: 0.008 },
                  { y: 0.55, x: side * 0.07, z: 0.1, rx: 0.025, rz: 0.008 },
                  { y: 0.8, x: side * 0.06, z: 0.06, rx: 0.025, rz: 0.008 },
                ],
                6,
              ),
              look.trim,
            ),
          );
        }
        break;
      }
      case "persian": {
        // The sleeved coat to the knee, open over the trousers, and the
        // cloak hanging from the shoulders behind.
        out.push(
          paint(
            stack(
              [
                { y: 0.36, rx: 0.14, rz: 0.115 },
                { y: HIP + 0.04, rx: 0.115, rz: 0.088 },
              ],
              14,
            ),
            look.main,
          ),
        );
        out.push(
          paint(
            tube(
              [
                [-0.02, 0.37, 0.115],
                [0, 0.6, 0.1],
                [0.02, 0.8, 0.06],
              ],
              0.012,
              8,
            ),
            look.trim,
          ),
        );
        out.push(
          paint(
            stack(
              [
                { y: 0.2, z: -0.13, rx: 0.17, rz: 0.03 },
                { y: 0.5, z: -0.11, rx: 0.16, rz: 0.03 },
                { y: 0.8, z: -0.06, rx: 0.14, rz: 0.03 },
              ],
              10,
            ),
            look.trim,
          ),
        );
        break;
      }
      case "armour": {
        // A bronze cuirass, the leather strips of the kilt, a red cloak.
        out.push(
          paint(
            stack(
              [
                { y: 0.56, rx: 0.112, rz: 0.088 },
                { y: 0.7, rx: 0.13, rz: 0.098 },
                { y: 0.79, rx: 0.14, rz: 0.085 },
              ],
              14,
            ),
            look.main,
          ),
        );
        out.push(
          paint(
            stack(
              [
                { y: 0.15, z: -0.12, rx: 0.15, rz: 0.025 },
                { y: 0.5, z: -0.11, rx: 0.15, rz: 0.03 },
                { y: 0.8, z: -0.07, rx: 0.14, rz: 0.03 },
              ],
              10,
            ),
            look.trim,
          ),
        );
        break;
      }
      case "hide": {
        // A skin over one shoulder, and a fox pelt hanging from the belt.
        out.push(
          paint(
            tube(
              [
                [0.12, 0.8, 0],
                [0.04, 0.74, 0.09],
                [-0.08, 0.62, 0.09],
                [-0.11, 0.6, 0],
              ],
              0.03,
              10,
            ),
            look.main,
          ),
        );
        out.push(
          paint(
            stack(
              [
                { y: 0.3, x: -0.02, z: 0.12, rx: 0.02, rz: 0.015 },
                { y: 0.46, x: -0.01, z: 0.11, rx: 0.045, rz: 0.02 },
                { y: 0.58, x: 0, z: 0.11, rx: 0.03, rz: 0.015 },
              ],
              7,
            ),
            look.trim,
          ),
        );
        break;
      }
      case "exomis": {
        // Pinned on the left shoulder: the right shoulder and chest bare.
        out.push(paint(sphere(0.06, [-0.07, 0.76, 0.02], [1.1, 0.8, 0.9], 8, 6), look.skin));
        break;
      }
      default:
        break;
    }

    /* The head, on its own so it can turn. */
    const head: THREE_NS.BufferGeometry[] = [];
    head.push(paint(cylinder(0.028, 0.032, 0.05, [0, 0.855, 0], 8), look.skin));
    head.push(paint(sphere(0.062, [0, 0.925, 0.005], [0.9, 1.06, 1], 10, 7), look.skin));
    head.push(paint(sphere(0.012, [0, 0.918, 0.066], [0.8, 1.3, 1], 4, 3), look.skin));
    for (const side of [-1, 1])
      head.push(paint(sphere(0.012, [side * 0.056, 0.925, 0.0], [0.6, 1, 0.8], 4, 3), look.skin));
    const masked = look.headwear === "mask";
    if (!masked) {
      // Hair: a cap over the crown, longer for a woman, with a bun or a fall;
      // a man's cropped, curled, long or tied, or gone from the crown.
      if (look.bald && !female) {
        head.push(
          paint(
            new THREE.SphereGeometry(
              0.067,
              12,
              4,
              Math.PI * 0.85,
              Math.PI * 1.3,
              Math.PI * 0.36,
              Math.PI * 0.24,
            )
              .rotateX(-0.15)
              .translate(0, 0.925, -0.004),
            look.hair,
          ),
        );
      } else {
        head.push(
          paint(
            sphere(0.066, [0, 0.945, -0.006], [0.94, female ? 0.78 : 0.68, 1.02], 10, 6),
            look.hair,
          ),
        );
      }
      if (female) {
        if (look.headwear !== "veil") head.push(...hairdo(look));
        else
          head.push(
            paint(
              stack(
                [
                  { y: 0.84, z: -0.05, rx: 0.06, rz: 0.03 },
                  { y: 0.93, z: -0.045, rx: 0.06, rz: 0.035 },
                ],
                8,
              ),
              look.hair,
            ),
          );
      } else head.push(...menHair(look, false));
      if (look.beard) head.push(...beard(look, false));
    }
    const hw = headwear(look.headwear, look);
    head.push(...hw);
    if (female && look.jewels && !masked) {
      // Gold drops at the ears and a thin collar of beads at the neck.
      for (const side of [-1, 1])
        head.push(paint(sphere(0.009, [side * 0.058, 0.9, 0.004], [1, 1.4, 1], 6, 5), GOLD));
      out.push(
        paint(
          new THREE.TorusGeometry(0.04, 0.0055, 5, 16)
            .rotateX(Math.PI / 2 - 0.25)
            .translate(0, 0.835, 0.012),
          GOLD,
        ),
      );
    }

    out.push(...accessories(look, action, false));
    out.push(...carried(look, action, carry, carryLeft));
    return { body: out, head };
  };

  /** Things carried on the body rather than in a hand. */
  const carried = (
    look: Look,
    action: Person["action"],
    carry?: Carry,
    carryLeft?: Carry,
  ): THREE_NS.BufferGeometry[] => {
    const out: THREE_NS.BufferGeometry[] = [];
    const items = (c: Carry | undefined) => {
      switch (c) {
        case "amphora":
          out.push(...amphoraPieces([-0.17, 0.84, -0.02], 0.55, 0.9));
          break;
        case "basket":
          out.push(paint(cylinder(0.11, 0.08, 0.1, [0, 1.03, 0], 12), 0xa8844e));
          out.push(paint(sphere(0.08, [0, 1.08, 0], [1, 0.4, 1], 10, 6), 0xb5452f));
          break;
        case "jar":
          out.push(...jarPieces([0, 0.99, 0], 0.32));
          break;
        case "scroll":
          if (action === "read" || action === "sit") {
            out.push(
              paint(
                cylinder(0.018, 0.018, 0.26, [0, 0, 0], 8)
                  .rotateZ(Math.PI / 2)
                  .translate(0, 0.64, 0.2),
                0xd9c591,
              ),
            );
          }
          break;
        case "offering":
          out.push(paint(cylinder(0.11, 0.06, 0.04, [0, 0.7, 0.26], 14), 0xa65f3c));
          for (let i = 0; i < 5; i += 1) {
            const a = (i / 5) * Math.PI * 2;
            out.push(
              paint(
                sphere(
                  0.03,
                  [Math.cos(a) * 0.05, 0.74, 0.26 + Math.sin(a) * 0.05],
                  [1, 1, 1],
                  7,
                  5,
                ),
                i % 2 ? 0xc79a3a : 0x8a3a2a,
              ),
            );
          }
          break;
        case "lyre": {
          const at: [number, number, number] = [-0.05, 0.62, 0.17];
          out.push(paint(sphere(0.06, at, [1, 1, 0.4], 10, 7), 0x6f4426));
          for (const side of [-1, 1])
            out.push(
              paint(
                tube(
                  [
                    [at[0] + side * 0.04, at[1], at[2]],
                    [at[0] + side * 0.08, at[1] + 0.12, at[2]],
                    [at[0] + side * 0.06, at[1] + 0.22, at[2]],
                  ],
                  0.008,
                  8,
                ),
                0x8a5a2c,
              ),
            );
          out.push(
            paint(
              cylinder(0.007, 0.007, 0.16, [0, 0, 0], 6)
                .rotateZ(Math.PI / 2)
                .translate(at[0], at[1] + 0.21, at[2]),
              0x8a5a2c,
            ),
          );
          break;
        }
        case "aulos":
          for (const side of [-1, 1])
            out.push(
              paint(
                tube(
                  [
                    [side * 0.012, 0.9, 0.07],
                    [side * 0.04, 0.81, 0.18],
                    [side * 0.07, 0.74, 0.27],
                  ],
                  0.006,
                  6,
                ),
                0xd8c49a,
              ),
            );
          break;
        case "staff":
          out.push(paint(cylinder(0.012, 0.014, 1.15, [-0.2, 0.575, 0.12], 7), 0x6f4426));
          break;
        case "crook":
          // A shepherd's staff with its hook, taller than the man's shoulder.
          out.push(paint(cylinder(0.011, 0.013, 1.2, [-0.2, 0.6, 0.12], 7), 0x7a5a3c));
          out.push(
            paint(
              new THREE.TorusGeometry(0.035, 0.009, 5, 10, Math.PI * 1.3)
                .rotateY(Math.PI / 2)
                .translate(-0.2, 1.225, 0.155),
              0x7a5a3c,
            ),
          );
          break;
        case "hoop": {
          // Bowled along in front, and kept going with a stick.
          out.push(
            paint(
              new THREE.TorusGeometry(0.17, 0.01, 5, 20)
                .rotateY(Math.PI / 2)
                .translate(-0.16, 0.2, 0.5),
              0x8a6a48,
            ),
          );
          out.push(
            paint(
              tube(
                [
                  [-0.15, 0.53, 0.24],
                  [-0.155, 0.45, 0.31],
                  [-0.16, 0.36, 0.37],
                ],
                0.006,
                4,
              ),
              0x6f4426,
            ),
          );
          break;
        }
        case "reeds":
          // A long bundle of reeds over the right shoulder, tied in two places.
          for (let i = 0; i < 5; i += 1) {
            out.push(
              paint(
                cylinder(0.012, 0.01, 1.1, [0, 0, 0], 4)
                  .rotateX(Math.PI / 2 - 0.25)
                  .translate(-0.13 + (i % 3) * 0.016, 0.86 + Math.floor(i / 3) * 0.018, 0.0),
                i % 2 ? 0xb59a62 : 0xc4ae74,
              ),
            );
          }
          break;
        case "sack":
          out.push(paint(sphere(0.12, [0.12, 0.86, -0.02], [0.8, 0.75, 1.3], 9, 7), 0xc4b08a));
          break;
        case "plough": {
          // The ard: its two handles in the hands, the share in the earth, and
          // the beam running forward to the yoke on the oxen's necks.
          const share: [number, number, number] = [0, 0.27, 0.7];
          const yoke: [number, number, number] = [0, 1.36, 1.53];
          for (const side of [-1, 1])
            out.push(
              paint(
                tube([[side * 0.14, 0.53, 0.25], [side * 0.07, 0.4, 0.48], share], 0.012, 5),
                0x6f4426,
              ),
            );
          out.push(paint(tube([share, [0, 0.62, 1.0], yoke], 0.018, 8), 0x6f4426));
          out.push(
            paint(
              new THREE.ConeGeometry(0.03, 0.12, 6).rotateX(Math.PI * 0.6).translate(0, 0.25, 0.76),
              0x7d776c,
            ),
          );
          out.push(
            paint(
              cylinder(0.022, 0.022, 0.75, [0, 0, 0], 6)
                .rotateZ(Math.PI / 2)
                .translate(0, yoke[1], yoke[2]),
              0x6f4426,
            ),
          );
          break;
        }
        case "semantron":
          // The long board balanced on the left shoulder.
          out.push(
            paint(
              new THREE.BoxGeometry(0.06, 0.03, 0.95).rotateX(0.18).translate(0.15, 0.84, 0.18),
              0x8a6a48,
            ),
          );
          break;
        case "spear":
          out.push(paint(cylinder(0.009, 0.011, 1.45, [-0.21, 0.72, 0.13], 7), 0x6f4426));
          out.push(
            paint(new THREE.ConeGeometry(0.02, 0.1, 6).translate(-0.21, 1.49, 0.13), 0x9a8a5a),
          );
          break;
        case "shield":
          // A hoplite's round shield held out on the forearm, its rim bronze
          // and a device painted in the middle.
          out.push(
            paint(
              cylinder(0.2, 0.2, 0.025, [0, 0, 0], 22)
                .rotateX(Math.PI / 2)
                .rotateY(0.35)
                .translate(0.19, 0.62, 0.25),
              look.trim,
            ),
          );
          out.push(
            paint(
              new THREE.TorusGeometry(0.2, 0.013, 5, 22).rotateY(0.35).translate(0.19, 0.62, 0.25),
              0xa8843e,
            ),
          );
          out.push(
            paint(
              cylinder(0.075, 0.075, 0.004, [0, 0, 0], 12)
                .rotateX(Math.PI / 2)
                .translate(0, 0, 0.014)
                .rotateY(0.35)
                .translate(0.19, 0.62, 0.25),
              0xd8c49a,
            ),
          );
          break;
        default:
          break;
      }
    };
    items(carry);
    items(carryLeft);
    return out;
  };

  const darker = (hex: number) => {
    const c = new THREE.Color(hex);
    c.multiplyScalar(0.7);
    return c.getHex();
  };

  const amphoraPieces = (at: [number, number, number], s: number, tilt: number) => {
    const g = stack(
      [
        { y: 0, rx: 0.02, rz: 0.02 },
        { y: 0.12, rx: 0.07, rz: 0.07 },
        { y: 0.35, rx: 0.17, rz: 0.17 },
        { y: 0.52, rx: 0.18, rz: 0.18 },
        { y: 0.68, rx: 0.1, rz: 0.1 },
        { y: 0.88, rx: 0.05, rz: 0.05 },
      ],
      12,
    );
    g.translate(0, -0.45, 0);
    g.scale(s, s, s);
    g.rotateZ(tilt);
    g.translate(...at);
    return [paint(g, 0xa65f3c)];
  };

  const jarPieces = (at: [number, number, number], s: number) => {
    const g = stack(
      [
        { y: 0, rx: 0.12, rz: 0.12 },
        { y: 0.12, rx: 0.24, rz: 0.24 },
        { y: 0.4, rx: 0.3, rz: 0.3 },
        { y: 0.66, rx: 0.2, rz: 0.2 },
        { y: 0.8, rx: 0.15, rz: 0.15 },
      ],
      12,
    );
    g.scale(s, s, s);
    g.translate(...at);
    return [paint(g, 0xb06a44)];
  };

  /**
   * A man's hair over the cap: curls in rows over the crown and brow, long
   * hair to the shoulders, or long hair knotted up behind. Short hair is the
   * cap alone. `near` draws it finer, for the close figure.
   */
  const menHair = (look: Look, near: boolean): THREE_NS.BufferGeometry[] => {
    const out: THREE_NS.BufferGeometry[] = [];
    const seg = near ? 7 : 5;
    switch (look.hairStyle) {
      case "curls":
        if (look.bald) break;
        for (let i = 0; i < (near ? 11 : 7); i += 1) {
          const a = -Math.PI / 2 + (i / (near ? 10 : 6)) * Math.PI * 2;
          const y = i % 2 ? 0.975 : 0.955;
          out.push(
            paint(
              sphere(
                near ? 0.018 : 0.022,
                [Math.cos(a) * 0.052, y, Math.sin(a) * 0.052 - 0.006],
                [1, 0.9, 1],
                seg,
                seg - 2,
              ),
              look.hair,
            ),
          );
        }
        out.push(paint(sphere(0.03, [0, 0.99, -0.01], [1.3, 0.7, 1.3], seg + 2, seg), look.hair));
        break;
      case "long":
        out.push(
          paint(
            stack(
              [
                { y: 0.82, z: -0.045, rx: 0.06, rz: 0.022 },
                { y: 0.87, z: -0.055, rx: 0.064, rz: 0.03 },
                { y: 0.935, z: -0.05, rx: 0.062, rz: 0.04 },
              ],
              near ? 10 : 8,
            ),
            look.hair,
          ),
        );
        break;
      case "tied":
        out.push(paint(sphere(0.026, [0, 0.95, -0.07], [1, 0.9, 1], seg + 1, seg), look.hair));
        break;
      default:
        break;
    }
    return out;
  };

  /** A beard as it is cut: stubble, short, long down the chest, or pointed. */
  const beard = (look: Look, near: boolean): THREE_NS.BufferGeometry[] => {
    const w = near ? 10 : 8;
    const h = near ? 7 : 6;
    switch (look.beardStyle) {
      case "stubble":
        return [
          paint(
            sphere(0.047, [0, 0.897, 0.018], [1.12, 0.78, 0.86], w, h),
            new THREE.Color(look.skin).lerp(new THREE.Color(look.hair), 0.42).getHex(),
          ),
        ];
      case "long":
        return [
          paint(sphere(0.044, [0, 0.885, 0.026], [1.08, 0.95, 0.86], w, h), look.hair),
          paint(
            stack(
              [
                { y: 0.79, z: 0.05, rx: 0.012, rz: 0.01 },
                { y: 0.82, z: 0.052, rx: 0.03, rz: 0.022 },
                { y: 0.865, z: 0.045, rx: 0.042, rz: 0.03 },
              ],
              w,
            ),
            look.hair,
          ),
        ];
      case "pointed":
        return [
          paint(sphere(0.043, [0, 0.888, 0.026], [1.05, 0.88, 0.85], w, h), look.hair),
          paint(
            new THREE.ConeGeometry(0.026, 0.06, w)
              .rotateX(Math.PI)
              .rotateX(-0.35)
              .translate(0, 0.835, 0.05),
            look.hair,
          ),
        ];
      default:
        return [paint(sphere(0.045, [0, 0.885, 0.03], [1.05, 0.9, 0.85], w, h), look.hair)];
    }
  };

  /**
   * What is worn besides the dress: a craftsman's apron, a bag slung across
   * the body, a purse at the belt, a shawl round a woman's shoulders.
   */
  const accessories = (look: Look, action: Person["action"], near: boolean) => {
    const out: THREE_NS.BufferGeometry[] = [];
    const seated =
      LAP.has(action) || action === "kneel" || action === "grind" || action === "crouch";
    const around = near ? 10 : 6;
    if (look.apron !== undefined) {
      if (!seated) {
        out.push(
          paint(
            new THREE.CylinderGeometry(0.128, 0.165, 0.3, around, 1, true, -0.75, 1.5).translate(
              0,
              0.455,
              0.004,
            ),
            look.apron,
          ),
        );
      }
      // The bib and its strap round the neck.
      out.push(
        paint(
          new THREE.CylinderGeometry(0.112, 0.118, 0.12, around, 1, true, -0.55, 1.1).translate(
            0,
            0.66,
            0.006,
          ),
          look.apron,
        ),
      );
    }
    if (look.bag !== undefined) {
      // Slung from the right shoulder to the left hip.
      out.push(
        paint(
          tube(
            [
              [-0.1, 0.8, 0.02],
              [-0.03, 0.72, 0.095],
              [0.08, 0.58, 0.09],
              [0.13, 0.5, 0.03],
            ],
            0.007,
            near ? 10 : 6,
          ),
          look.bag,
        ),
      );
      out.push(
        paint(new THREE.BoxGeometry(0.035, 0.1, 0.12).translate(0.135, 0.45, 0.0), look.bag),
      );
    }
    if (look.purse) {
      out.push(paint(sphere(0.022, [-0.06, 0.565, 0.095], [1, 1.3, 0.7], around, 5), 0x6b4a30));
    }
    if (look.shawl !== undefined) {
      out.push(
        paint(
          stack(
            [
              { y: 0.64, z: -0.035, rx: 0.13, rz: 0.06 },
              { y: 0.72, z: -0.02, rx: 0.145, rz: 0.088 },
              { y: 0.8, z: -0.012, rx: 0.13, rz: 0.08 },
            ],
            near ? 16 : 10,
          ),
          look.shawl,
        ),
      );
    }
    return out;
  };

  /** A woman's dressed hair, as `look.hairStyle` says; a knot at the nape by default. */
  const hairdo = (look: Look) => {
    const out: THREE_NS.BufferGeometry[] = [];
    switch (look.hairStyle) {
      case "crown":
        // A braid wound round the head above the brow.
        out.push(
          paint(
            new THREE.TorusGeometry(0.058, 0.014, 6, 20)
              .rotateX(Math.PI / 2 - 0.18)
              .translate(0, 0.962, -0.008),
            look.hair,
          ),
        );
        break;
      case "nodus":
        // The roll of hair over the forehead, and the knot behind.
        out.push(paint(sphere(0.022, [0, 0.99, 0.045], [1.2, 0.9, 0.9], 8, 6), look.hair));
        out.push(paint(sphere(0.028, [0, 0.965, -0.066], [1, 0.9, 1], 8, 7), look.hair));
        break;
      case "fall":
        // Tied at the nape and falling down the back.
        out.push(
          paint(
            stack(
              [
                { y: 0.79, z: -0.05, rx: 0.03, rz: 0.015 },
                { y: 0.86, z: -0.055, rx: 0.04, rz: 0.02 },
                { y: 0.92, z: -0.058, rx: 0.045, rz: 0.025 },
              ],
              8,
            ),
            look.hair,
          ),
        );
        break;
      default:
        out.push(paint(sphere(0.032, [0, 0.95, -0.065], [1, 1, 1], 8, 7), look.hair));
    }
    return out;
  };

  const headwear = (kind: Headwear | undefined, look: Look) => {
    const out: THREE_NS.BufferGeometry[] = [];
    switch (kind) {
      case "veil":
        out.push(
          paint(
            stack(
              [
                // Drawn over the head and down the back to the shoulder
                // blades, open at the front so the face shows.
                { y: 0.68, z: -0.07, rx: 0.13, rz: 0.035 },
                { y: 0.8, z: -0.05, rx: 0.135, rz: 0.06 },
                { y: 0.88, z: -0.025, rx: 0.08, rz: 0.07 },
                { y: 0.975, z: -0.005, rx: 0.068, rz: 0.07 },
                { y: 1.0, z: -0.005, rx: 0.02, rz: 0.02 },
              ],
              14,
            ),
            look.trim,
          ),
        );
        break;
      case "wreath":
        out.push(
          paint(
            new THREE.TorusGeometry(0.064, 0.011, 6, 18)
              .rotateX(Math.PI / 2)
              .translate(0, 0.955, 0),
            0x5f7a3a,
          ),
        );
        break;
      case "fillet":
        out.push(
          paint(
            new THREE.TorusGeometry(0.064, 0.006, 5, 18)
              .rotateX(Math.PI / 2)
              .translate(0, 0.958, 0),
            look.trim,
          ),
        );
        break;
      case "petasos":
        out.push(paint(cylinder(0.13, 0.13, 0.01, [0, 0.975, 0], 16), 0xb59a62));
        out.push(paint(sphere(0.06, [0, 0.985, 0], [1, 0.6, 1], 10, 6), 0xb59a62));
        break;
      case "phrygian":
        out.push(
          paint(
            stack(
              [
                { y: 0.9, rx: 0.068, rz: 0.07 },
                { y: 0.97, rx: 0.064, rz: 0.066 },
                { y: 1.02, z: 0.01, rx: 0.045, rz: 0.045 },
                { y: 1.045, z: 0.045, rx: 0.025, rz: 0.022 },
              ],
              12,
            ),
            look.trim,
          ),
        );
        for (const side of [-1, 1])
          out.push(
            paint(
              new THREE.BoxGeometry(0.018, 0.08, 0.035).translate(side * 0.064, 0.87, 0),
              look.trim,
            ),
          );
        break;
      case "tiara":
        out.push(paint(cylinder(0.055, 0.068, 0.13, [0, 1.0, 0], 14), look.main));
        out.push(paint(cylinder(0.069, 0.069, 0.02, [0, 0.945, 0], 14), look.trim));
        for (const side of [-1, 1])
          out.push(
            paint(
              new THREE.BoxGeometry(0.018, 0.1, 0.04).translate(side * 0.066, 0.87, 0),
              look.trim,
            ),
          );
        break;
      case "helmet":
        out.push(paint(sphere(0.074, [0, 0.94, -0.005], [1, 0.95, 1.1], 14, 9), 0xa8843e));
        out.push(
          paint(
            stack(
              [
                { y: 0.99, z: 0.07, rx: 0.008, rz: 0.01 },
                { y: 1.06, z: 0.0, rx: 0.012, rz: 0.05 },
                { y: 1.0, z: -0.1, rx: 0.008, rz: 0.03 },
              ],
              6,
            ),
            look.trim,
          ),
        );
        break;
      case "polos":
        out.push(paint(cylinder(0.062, 0.058, 0.05, [0, 0.99, 0], 14), look.trim));
        break;
      case "mask":
        // A tragic mask: the pale face over the real one, its open mouth and
        // dark eyes, and the high crown of hair above it.
        out.push(paint(sphere(0.07, [0, 0.93, 0.03], [0.95, 1.15, 0.85], 14, 10), 0xe8dcc6));
        out.push(paint(sphere(0.016, [0, 0.895, 0.085], [1.2, 1.1, 0.5], 6, 5), 0x2a1d14));
        for (const side of [-1, 1])
          out.push(
            paint(sphere(0.012, [side * 0.026, 0.94, 0.082], [1.2, 0.9, 0.5], 6, 5), 0x2a1d14),
          );
        out.push(paint(sphere(0.075, [0, 1.0, -0.005], [1, 0.9, 1], 12, 8), look.hair));
        break;
      case "conical":
        // The tall pointed cap of Hittite gods, kings and priests, and the
        // pointed helmet of a Bronze Age or medieval soldier: the brim on
        // the brow, the point leaning a little back.
        out.push(
          paint(
            stack(
              [
                { y: 0.932, z: -0.004, rx: 0.07, rz: 0.075 },
                { y: 0.972, z: -0.008, rx: 0.065, rz: 0.07 },
                { y: 1.03, z: -0.016, rx: 0.046, rz: 0.05 },
                { y: 1.09, z: -0.024, rx: 0.024, rz: 0.026 },
                { y: 1.135, z: -0.03, rx: 0.004, rz: 0.004 },
              ],
              14,
            ),
            look.trim,
          ),
        );
        break;
      case "turban":
        // Cloth wound round a cap, as the men of eleventh-century Ani wore it.
        out.push(
          paint(
            stack(
              [
                { y: 0.925, rx: 0.073, rz: 0.077 },
                { y: 0.95, rx: 0.084, rz: 0.088 },
                { y: 0.988, rx: 0.086, rz: 0.09 },
                { y: 1.016, rx: 0.07, rz: 0.074 },
                { y: 1.032, rx: 0.026, rz: 0.028 },
              ],
              14,
            ),
            look.trim,
          ),
        );
        for (const [y, tilt] of [
          [0.955, 0.22],
          [0.985, -0.18],
        ] as const)
          out.push(
            paint(
              new THREE.TorusGeometry(0.083, 0.008, 4, 18)
                .rotateX(Math.PI / 2 + tilt)
                .translate(0, y, 0),
              darker(look.trim),
            ),
          );
        break;
      case "hood":
        // A monk's or priest's pointed hood, down over the shoulders behind.
        out.push(
          paint(
            stack(
              [
                { y: 0.68, z: -0.07, rx: 0.14, rz: 0.04 },
                { y: 0.8, z: -0.05, rx: 0.14, rz: 0.065 },
                { y: 0.88, z: -0.025, rx: 0.082, rz: 0.074 },
                { y: 0.972, z: -0.01, rx: 0.071, rz: 0.075 },
                { y: 1.035, z: -0.03, rx: 0.038, rz: 0.042 },
                { y: 1.095, z: -0.055, rx: 0.004, rz: 0.004 },
              ],
              14,
            ),
            look.main,
          ),
        );
        break;
      default:
        break;
    }
    return out;
  };

  /**
   * Something that hangs, or stands upright, whatever the arm is doing: built
   * the way up it is in the world, with the hand at the origin, and turned
   * back by the pitch `pitch` the forearm has in the pose that holds it.
   */
  const level = (g: THREE_NS.BufferGeometry, pitch: number) =>
    g.rotateX(-pitch).translate(0, -FORE - 0.02, 0.01);

  /** What a hand holds, in the forearm's frame. */
  const handItems = (
    carry?: Carry,
    action?: Person["action"],
    left = false,
  ): THREE_NS.BufferGeometry[] => {
    const out: THREE_NS.BufferGeometry[] = [];
    const held = action ? HOLD[action] : undefined;
    const arm = held ? (left ? held.l : held.r) : undefined;
    const pitch = arm ? arm[0] + arm[1] + (held?.lean ?? 0) : -1.2;
    const wood = 0x6f4426;
    const iron = 0x7d776c;
    if (action === "spin" && !left) {
      // The spindle turning below the hand on its thread, the whorl at its foot.
      out.push(
        paint(level(cylinder(0.0015, 0.0015, 0.08, [0, -0.04, 0.02], 3), pitch), 0xece4d4),
        paint(level(cylinder(0.004, 0.005, 0.15, [0, -0.15, 0.02], 4), pitch), wood),
        paint(level(cylinder(0.022, 0.018, 0.016, [0, -0.2, 0.02], 8), pitch), 0xa65f3c),
      );
    }
    switch (carry) {
      case "torch":
        // Held across the fist, so it stands up when the forearm is raised.
        out.push(
          paint(
            cylinder(0.018, 0.014, 0.42, [0, 0, 0], 7)
              .rotateX(Math.PI / 2)
              .translate(0, -FORE - 0.02, 0.17),
            0x5a3a1e,
          ),
        );
        break;
      case "tablet":
        if (action === "write")
          // Lying in the palm, the wax face up.
          out.push(
            paint(
              level(new THREE.BoxGeometry(0.13, 0.012, 0.1).translate(0, 0.012, 0.0), pitch),
              0x8a6a3a,
            ),
            paint(
              level(new THREE.BoxGeometry(0.11, 0.004, 0.08).translate(0, 0.02, 0.0), pitch),
              0x3a2e24,
            ),
          );
        else
          out.push(
            paint(
              new THREE.BoxGeometry(0.1, 0.012, 0.13).translate(0, -FORE - 0.03, 0.06),
              0x8a6a3a,
            ),
          );
        break;
      case "chisel":
        if (action === "carve")
          // Held point forward, against the stone.
          out.push(paint(cylinder(0.007, 0.009, 0.13, [0, -FORE - 0.09, 0.012], 6), iron));
        else
          out.push(
            paint(
              cylinder(0.008, 0.008, 0.12, [0, 0, 0], 6)
                .rotateX(Math.PI / 2)
                .translate(0, -FORE - 0.03, 0.05),
              iron,
            ),
          );
        break;
      case "incense":
        out.push(paint(cylinder(0.04, 0.025, 0.04, [0, -FORE - 0.06, 0.02], 10), 0xa8843e));
        break;
      case "barsom":
        for (let i = 0; i < 5; i += 1) {
          out.push(
            paint(
              cylinder(0.004, 0.004, 0.32, [0, 0, 0], 4)
                .rotateX(Math.PI / 2 - 0.2)
                .translate((i - 2) * 0.007, -FORE - 0.02, 0.12),
              0xb59a62,
            ),
          );
        }
        break;
      case "scroll":
        out.push(
          paint(
            cylinder(0.017, 0.017, 0.2, [0, 0, 0], 7)
              .rotateZ(Math.PI / 2)
              .translate(0, -FORE - 0.03, 0.02),
            0xd9c591,
          ),
        );
        break;
      case "stylus":
        out.push(
          paint(
            cylinder(0.003, 0.004, 0.09, [0, 0, 0], 4)
              .rotateX(Math.PI / 2 + 0.5)
              .translate(0, -FORE - 0.03, 0.03),
            0xb59a62,
          ),
        );
        break;
      case "distaff":
        // The rod held up, the wool wound round its head.
        out.push(
          paint(level(cylinder(0.006, 0.008, 0.3, [0, 0.08, 0], 5).rotateX(-0.5), pitch), wood),
          paint(level(sphere(0.036, [0, 0.19, -0.1], [1, 1.5, 1], 8, 6), pitch), 0xece4d4),
        );
        break;
      case "balance": {
        // The beam hanging from the hand by its cord, a pan at each end.
        const g: THREE_NS.BufferGeometry[] = [
          cylinder(0.003, 0.003, 0.08, [0, -0.04, 0], 4),
          cylinder(0.006, 0.006, 0.36, [0, 0, 0], 5)
            .rotateZ(Math.PI / 2)
            .translate(0, -0.08, 0),
        ];
        for (const side of [-1, 1]) {
          g.push(cylinder(0.002, 0.002, 0.16, [side * 0.17, -0.16, 0], 3));
          g.push(cylinder(0.06, 0.045, 0.02, [side * 0.17, -0.25, 0], 10));
        }
        for (const piece of g) out.push(paint(level(piece, pitch), 0xa8843e));
        break;
      }
      case "cleaver":
        out.push(
          paint(
            cylinder(0.012, 0.012, 0.1, [0, 0, 0], 6)
              .rotateX(Math.PI / 2)
              .translate(0, -FORE - 0.02, 0.05),
            wood,
          ),
          paint(
            new THREE.BoxGeometry(0.006, 0.09, 0.14).translate(0, -FORE - 0.05, 0.16),
            0x9a968c,
          ),
        );
        break;
      case "ladle":
        // Down into the pot, whatever the arm: built plumb from the hand.
        out.push(
          paint(level(cylinder(0.006, 0.006, 0.34, [0, -0.15, 0.02], 5), pitch), wood),
          paint(level(sphere(0.035, [0, -0.32, 0.03], [1, 0.6, 1], 8, 5), pitch), 0xa8843e),
        );
        break;
      case "mallet":
        out.push(
          paint(
            cylinder(0.01, 0.01, 0.14, [0, 0, 0], 6)
              .rotateX(Math.PI / 2)
              .translate(0, -FORE - 0.02, 0.06),
            wood,
          ),
          paint(
            cylinder(0.035, 0.035, 0.11, [0, 0, 0], 8).translate(0, -FORE - 0.02, 0.15),
            0x8a6a48,
          ),
        );
        break;
      case "saw":
        out.push(
          paint(new THREE.BoxGeometry(0.03, 0.09, 0.05).translate(0, -FORE - 0.04, 0.01), wood),
          paint(
            new THREE.BoxGeometry(0.004, 0.52, 0.08).translate(0, -FORE - 0.34, 0.01),
            0x9a968c,
          ),
        );
        break;
      case "brush":
        out.push(
          paint(cylinder(0.006, 0.006, 0.2, [0, -FORE - 0.1, 0.012], 5), wood),
          paint(cylinder(0.014, 0.01, 0.05, [0, -FORE - 0.22, 0.012], 6), 0x3a2e24),
        );
        break;
      case "trowel":
        out.push(
          paint(
            new THREE.BoxGeometry(0.11, 0.006, 0.16).translate(0, -FORE - 0.06, 0.03),
            0x8a7a62,
          ),
        );
        break;
      case "broom":
        out.push(
          paint(cylinder(0.011, 0.011, 1.0, [0, -FORE - 0.42, 0.02], 6), wood),
          paint(cylinder(0.05, 0.02, 0.24, [0, -FORE - 1.02, 0.02], 7), 0xb59a62),
        );
        break;
      case "hoe":
        out.push(
          paint(cylinder(0.011, 0.011, 0.7, [0, -FORE - 0.28, 0.02], 6), wood),
          paint(new THREE.BoxGeometry(0.12, 0.04, 0.16).translate(0, -FORE - 0.64, 0.09), iron),
        );
        break;
      case "bowl":
        out.push(paint(level(cylinder(0.065, 0.035, 0.045, [0, 0.03, 0.03], 10), pitch), 0xa65f3c));
        break;
      case "phiale":
        // The dish tipped to pour, a thin stream of wine falling from its lip.
        out.push(
          paint(
            level(cylinder(0.08, 0.05, 0.02, [0, 0.02, 0.03], 12).rotateX(0.55), pitch),
            0xc9a43c,
          ),
          paint(level(cylinder(0.005, 0.003, 0.42, [0, -0.2, 0.12], 4), pitch), 0x6a2430),
        );
        break;
      case "drum":
        // The frame drum held up flat to the side, struck with the other hand.
        out.push(
          paint(
            cylinder(0.15, 0.15, 0.04, [0, 0, 0], 16)
              .rotateZ(Math.PI / 2)
              .translate(0.0, -FORE - 0.03, 0.08),
            0xd9c9a6,
          ),
          paint(
            new THREE.TorusGeometry(0.15, 0.012, 5, 18)
              .rotateY(Math.PI / 2)
              .translate(0.0, -FORE - 0.03, 0.08),
            0x8a5a2c,
          ),
        );
        break;
      case "book":
        out.push(
          paint(
            new THREE.BoxGeometry(0.11, 0.035, 0.15).translate(0, -FORE - 0.04, 0.05),
            0x6a2a22,
          ),
          paint(
            new THREE.BoxGeometry(0.1, 0.028, 0.145).translate(0.004, -FORE - 0.04, 0.05),
            0xe8dfca,
          ),
        );
        break;
      case "candle":
        out.push(
          paint(
            cylinder(0.011, 0.011, 0.2, [0, 0, 0], 6)
              .rotateX(Math.PI / 2)
              .translate(0, -FORE - 0.02, 0.1),
            0xeadfb8,
          ),
        );
        break;
      case "fish":
        out.push(
          paint(
            level(
              stack(
                [
                  { y: -0.02, rx: 0.006, rz: 0.004 },
                  { y: -0.12, rx: 0.03, rz: 0.012 },
                  { y: -0.26, rx: 0.012, rz: 0.008 },
                ],
                6,
              ),
              pitch,
            ),
            0x9aa4a8,
          ),
          paint(
            level(new THREE.BoxGeometry(0.05, 0.03, 0.004).translate(0, -0.005, 0), pitch),
            0x7d8790,
          ),
        );
        break;
      default:
        break;
    }
    return out;
  };

  /** One arm, hanging from the shoulder, with its elbow joint. */
  const buildArm = (
    look: Look,
    side: -1 | 1,
    carry: Carry | undefined,
    lod: Lod,
    action: Person["action"],
  ) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * (look.female ? 0.135 : 0.148), SHOULDER, 0);
    const sleeve =
      look.garment === "persian"
        ? look.main
        : look.garment === "chiton" ||
            look.garment === "peplos" ||
            look.garment === "robe" ||
            look.garment === "toga"
          ? look.main
          : look.skin;
    // An exomis leaves the right arm bare; everything else has a short sleeve.
    const upperColour = look.garment === "exomis" && side < 0 ? look.skin : sleeve;
    const upper = [
      paint(sphere(0.04, [0, 0, 0], [1, 1, 1], 6, 4), upperColour),
      paint(cylinder(0.033, 0.027, UPPER, [0, -UPPER / 2, 0], 8), upperColour),
    ];
    const detail = figure.armPieces(look, side, carry, action);
    pivot.add(lod.far(meshOf(upper)), lod.near(meshOf(detail.upper)));
    const elbow = new THREE.Group();
    elbow.position.set(0, -UPPER, 0);
    pivot.add(elbow);
    const foreColour = look.garment === "persian" ? look.main : look.skin;
    const fore = [
      paint(cylinder(0.026, 0.021, FORE, [0, -FORE / 2, 0], 8), foreColour),
      paint(sphere(0.026, [0, -FORE - 0.02, 0.005], [0.8, 1.1, 0.6], 6, 4), look.skin),
    ];
    fore.push(...handItems(carry, action, side > 0));
    elbow.add(lod.far(meshOf(fore)), lod.near(meshOf(detail.fore)));
    return { pivot, elbow };
  };

  /** One leg, from the hip, with a knee. */
  /**
   * One leg, from the hip, with a knee. Under a long robe the plain figure
   * has no legs at all and the close one only its feet, which show at the
   * hem as it walks.
   */
  const buildLeg = (look: Look, side: -1 | 1, robed: boolean, hidden: boolean, lod: Lod) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.06, HIP, 0);
    const knee = new THREE.Group();
    knee.position.set(0, -THIGH, 0);
    pivot.add(knee);
    const detail = figure.legPieces(look, robed, hidden);
    if (detail.thigh.length > 0) pivot.add(lod.near(meshOf(detail.thigh)));
    knee.add(lod.near(meshOf(detail.shin)));
    if (hidden) return { pivot, knee };
    const trousers = look.garment === "persian";
    const colour = trousers ? darker(look.main) : robed ? look.main : look.skin;
    const thigh = [paint(cylinder(0.05, 0.04, THIGH, [0, -THIGH / 2, 0], 8), colour)];
    pivot.add(lod.far(meshOf(thigh)));
    const shin = [
      paint(cylinder(0.038, 0.03, SHIN, [0, -SHIN / 2, 0], 8), colour),
      paint(
        new THREE.BoxGeometry(0.06, 0.035, 0.12).translate(0, -SHIN - 0.02, 0.03),
        trousers ? 0x5a4030 : 0x7a5a3c,
      ),
    ];
    knee.add(lod.far(meshOf(shin)));
    return { pivot, knee };
  };

  /* ---------------- the cast ---------------- */

  const actors: Actor[] = [];
  const fires: Fire[] = [];

  /* Flame and smoke textures, painted once. */
  const flameTexture = (() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 96, 2, 32, 84, 60);
    g.addColorStop(0, "rgba(255,250,220,1)");
    g.addColorStop(0.25, "rgba(255,200,90,0.95)");
    g.addColorStop(0.55, "rgba(255,110,30,0.6)");
    g.addColorStop(1, "rgba(200,40,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(32, 2);
    ctx.bezierCurveTo(58, 50, 62, 92, 32, 126);
    ctx.bezierCurveTo(2, 92, 6, 50, 32, 2);
    ctx.fill();
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    textures.push(t);
    return t;
  })();
  const softTexture = (inner: string, outer: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    textures.push(t);
    return t;
  };
  const glowTexture = softTexture("rgba(255,190,110,0.9)", "rgba(255,120,40,0)");
  // Pale, not grey: under the scene's tone mapping a mid-grey puff against a
  // bright sky came out nearly black, which reads as a rendering fault.
  const smokeTexture = softTexture("rgba(226,222,216,0.5)", "rgba(226,222,216,0)");

  const flameMaterial = new THREE.SpriteMaterial({
    map: flameTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.4,
  });
  const outerMaterial = flameMaterial.clone();
  outerMaterial.opacity = 0.55;
  materials.push(flameMaterial, outerMaterial, glowMaterial);

  const addFire = (flame: Flame, parent: THREE_NS.Object3D, local?: THREE_NS.Vector3) => {
    const holder = new THREE.Group();
    if (local) holder.position.copy(local);
    else holder.position.set(...flame.at);
    parent.add(holder);
    const core = new THREE.Sprite(flameMaterial);
    core.center.set(0.5, 0.06);
    const outer = new THREE.Sprite(outerMaterial);
    outer.center.set(0.5, 0.06);
    const halo = new THREE.Sprite(glowMaterial.clone());
    materials.push(halo.material);
    holder.add(core, outer, halo);
    const fire: Fire = {
      flame,
      core,
      outer,
      halo,
      light: null,
      phase: Math.random() * Math.PI * 2,
      holder,
    };
    fires.push(fire);
    return fire;
  };

  for (const flame of life.flames) addFire(flame, group);
  // The lights: only those asked for, strongest first, and never more than six.
  const lit = fires
    .filter((f) => f.flame.light)
    .sort((a, b) => b.flame.size - a.flame.size)
    .slice(0, 6);
  for (const fire of lit) {
    const light = new THREE.PointLight(0xff9a48, 0, Math.max(10, fire.flame.size * 22), 1.6);
    light.position.set(0, fire.flame.size * 0.5, 0);
    fire.holder!.add(light);
    fire.light = light;
  }

  /* Smoke over the altars. */
  const puffs: Puff[] = [];
  for (const flame of life.flames) {
    if (!flame.smoke) continue;
    const source = new THREE.Vector3(flame.at[0], flame.at[1] + flame.size * 0.8, flame.at[2]);
    for (let i = 0; i < 10; i += 1) {
      const material = new THREE.SpriteMaterial({
        map: smokeTexture,
        depthWrite: false,
        transparent: true,
        opacity: 0,
        toneMapped: false,
        fog: false,
      });
      materials.push(material);
      const sprite = new THREE.Sprite(material);
      group.add(sprite);
      puffs.push({
        sprite,
        age: (i / 10) * 7,
        life: 7,
        source,
        drift: Math.random() * Math.PI * 2,
        size: flame.size,
      });
    }
  }

  /** Somebody, built and put in `parent`; walkers are moved by `update`. */
  /**
   * Cloth is never quite the colour of the dye: a little lighter or darker
   * from one person to the next, taken from the colours already chosen.
   */
  const weathered = (look: Look): Look => {
    const k = 0.95 + ((lookHash(look) >>> 6) % 11) * 0.01;
    const vary = (hex: number) => new THREE.Color(hex).multiplyScalar(k).getHex();
    return { ...look, main: vary(look.main), trim: vary(look.trim) };
  };

  /** Somebody, built and put in `parent`; walkers are moved by `update`. */
  function makeActor(person: Person, parent: THREE_NS.Object3D): Actor {
    const look = weathered(person.look);
    const robed = LONG.has(look.garment);
    const root = new THREE.Group();
    root.position.set(...person.at);
    root.rotation.y = person.rotY;
    root.scale.setScalar(person.height);
    parent.add(root);
    const near: THREE_NS.Object3D[] = [];
    const far: THREE_NS.Object3D[] = [];
    const lod: Lod = {
      near: (o) => {
        o.visible = false;
        near.push(o);
        return o;
      },
      far: (o) => {
        far.push(o);
        return o;
      },
    };
    const seated = SEATED.has(person.action);
    const body = new THREE.Group();
    root.add(body);
    const plain = bodyPieces(look, person.action, person.carry, person.carryLeft);
    body.add(lod.far(meshOf(plain.body)));
    const detail = figure.bodyPieces(look, person.action, person.carry, person.carryLeft, seated);
    body.add(lod.near(meshOf(detail.body)));
    let hem: Pivot | null = null;
    if (detail.hem.length > 0) {
      hem = new THREE.Group();
      hem.position.y = HIP;
      for (const g of detail.hem) g.translate(0, -HIP, 0);
      hem.add(meshOf(detail.hem));
      body.add(lod.near(hem));
    }
    // The head on its own pivot at the neck, so it can bow, turn and look about.
    const head = new THREE.Group();
    head.position.set(0, NECK, 0);
    body.add(head);
    for (const [pieces, put] of [
      [plain.head, lod.far],
      [detail.head, lod.near],
    ] as const) {
      for (const g of pieces) g.translate(0, -NECK, 0);
      head.add(put(meshOf(pieces)));
    }
    // A child's head is bigger for its body than a grown person's.
    if (person.height < 1.35) head.scale.setScalar(1.13);
    // Built broad or slight: the body, and the legs under it.
    const girth =
      look.build === "heavy" ? [1.14, 1.16] : look.build === "slim" ? [0.9, 0.92] : null;
    if (girth) {
      body.scale.set(girth[0]!, 1, girth[1]!);
      head.scale.set(head.scale.x / girth[0]!, head.scale.y, head.scale.z / girth[1]!);
    }
    const r = buildArm(look, -1, person.carry, lod, person.action);
    const l = buildArm(
      look,
      1,
      person.carryLeft === "shield" || person.carryLeft === "semantron"
        ? undefined
        : person.carryLeft,
      lod,
      person.action,
    );
    body.add(r.pivot, l.pivot);
    const hidden = robed && !seated;
    const legR = buildLeg(look, -1, robed && seated, hidden, lod);
    const legL = buildLeg(look, 1, robed && seated, hidden, lod);
    root.add(legR.pivot, legL.pivot);
    if (girth) {
      for (const leg of [legR.pivot, legL.pivot]) {
        leg.scale.set(girth[0]! * 0.96, 1, girth[1]! * 0.96);
        leg.position.x *= girth[0]!;
      }
    }
    const actor: Actor = {
      person,
      root,
      body,
      armR: r.pivot,
      elbowR: r.elbow,
      armL: l.pivot,
      elbowL: l.elbow,
      legR: legR.pivot,
      kneeR: legR.knee,
      legL: legL.pivot,
      kneeL: legL.knee,
      head,
      heading: person.rotY,
      robed,
      hem,
      near,
      far,
      close: false,
    };
    if (person.route && person.route.length > 1) {
      const points = person.route.map((p) => new THREE.Vector3(...p));
      const lengths = points.map((p, i) => p.distanceTo(points[(i + 1) % points.length]!));
      const total = lengths.reduce((a, b) => a + b, 0);
      if (total > 0.01) actor.path = { points, lengths, total };
    }
    if (person.carry === "torch") {
      // The flame rides at the head of the torch, in the hand's own frame.
      addFire({ at: person.at, size: 0.28 }, r.elbow, new THREE.Vector3(0, -FORE - 0.02, 0.39));
    }
    if (person.carry === "candle") {
      addFire({ at: person.at, size: 0.07 }, r.elbow, new THREE.Vector3(0, -FORE - 0.02, 0.21));
    }
    if (person.carry === "balls") {
      actor.balls = [0xb5452f, 0xcfa548, 0x4b6a8f].map((hex) => {
        const ball = meshOf([paint(sphere(0.028, [0, 0, 0], [1, 1, 1], 8, 6), hex)]);
        body.add(ball);
        return ball;
      });
    }
    actors.push(actor);
    return actor;
  }
  for (const person of life.people) makeActor(person, group);

  /*
   * Pairs: two porters under one pole, two children with one ball. The pole
   * and the ball belong to neither, so they are moved between the two of
   * them every frame.
   */
  type Shared = {
    link: ActorLink;
    a: Actor;
    b: Actor;
    thing: THREE_NS.Object3D;
    load?: THREE_NS.Object3D;
  };
  const shared: Shared[] = [];
  for (const l of life.links ?? []) {
    const a = actors[l.a];
    const b = actors[l.b];
    if (!a || !b) continue;
    const phase = a.person.phase;
    a.link = { other: b, first: true, kind: l.kind, phase };
    b.link = { other: a, first: false, kind: l.kind, phase };
    if (l.kind === "ball") {
      const ball = meshOf([paint(sphere(0.06, [0, 0, 0], [1, 1, 1], 10, 7), 0xb5452f)]);
      group.add(ball);
      shared.push({ link: a.link, a, b, thing: ball });
    } else {
      const pole = meshOf([paint(cylinder(0.022, 0.022, 1, [0, 0, 0], 6), 0x6f4426)]);
      group.add(pole);
      // The amphora slung from the middle of the pole on a rope.
      const load = new THREE.Group();
      load.add(
        meshOf([
          paint(cylinder(0.006, 0.006, 0.3, [0, -0.15, 0], 4), 0xb59a62),
          ...amphoraPieces([0, -0.62, 0], 0.62, 0),
        ]),
      );
      group.add(load);
      shared.push({ link: a.link, a, b, thing: pole, load });
    }
  }
  const upY = new THREE.Vector3(0, 1, 0);
  const endA = new THREE.Vector3();
  const endB = new THREE.Vector3();
  const span = new THREE.Vector3();
  /** A point in somebody's own frame (at one metre tall), in the scene. */
  const onActor = (actor: Actor, x: number, y: number, z: number, out: THREE_NS.Vector3) => {
    const h = actor.person.height;
    const r = actor.root.rotation.y;
    return out.set(
      actor.root.position.x + (x * Math.cos(r) + z * Math.sin(r)) * h,
      actor.root.position.y + y * h,
      actor.root.position.z + (-x * Math.sin(r) + z * Math.cos(r)) * h,
    );
  };
  const updateShared = (now: number) => {
    for (const s of shared) {
      if (s.link.kind === "ball") {
        onActor(s.a, 0, 0.98, 0.3, endA);
        onActor(s.b, 0, 0.98, 0.3, endB);
        const u = ballClock(s.link, now);
        const k = u < 0.5 ? u / 0.5 : (u - 0.5) / 0.5;
        const [from, to] = u < 0.5 ? [endA, endB] : [endB, endA];
        s.thing.position.lerpVectors(from, to, k);
        s.thing.position.y += 4 * k * (1 - k) * 1.1;
        continue;
      }
      // The pole from shoulder to shoulder, a hand's breadth past each.
      onActor(s.a, -0.11, 0.835, 0, endA);
      onActor(s.b, -0.11, 0.835, 0, endB);
      span.subVectors(endA, endB);
      const length = span.length();
      if (length < 0.01) continue;
      s.thing.position.addVectors(endA, endB).multiplyScalar(0.5);
      s.thing.quaternion.setFromUnitVectors(upY, span.normalize());
      s.thing.scale.set(1, length + 0.4, 1);
      s.load!.position.copy(s.thing.position);
      s.load!.rotation.y = Math.atan2(span.x, span.z);
    }
  };

  /* ---------------- animals ---------------- */

  type Beast = {
    animal: Animal | null;
    root: THREE_NS.Group;
    body: THREE_NS.Group;
    neck: THREE_NS.Group;
    tail: THREE_NS.Group;
    legs: { hip: THREE_NS.Group; knee: THREE_NS.Group; front: boolean; side: number }[];
    legLength: number;
    path?: { points: THREE_NS.Vector3[]; lengths: number[]; total: number };
    heading: number;
    gait: "stand" | "walk" | "gallop" | "graze" | "lie";
    speed: number;
    phase: number;
  };
  const beasts: Beast[] = [];

  type Build = {
    withers: number;
    len: number;
    rx: number;
    ry: number;
    neckLen: number;
    neckRise: number;
    neckR: number;
    headLen: number;
    headR: number;
    headDrop: number;
    legR: number;
    legX: number;
    ears: "pointed" | "long" | "floppy" | "small";
    horns?: "ox" | "goat" | "gazelle";
    tail: "horse" | "tuft" | "curl" | "stub";
    wool?: boolean;
    mane?: boolean;
    dewlap?: boolean;
    humps?: number;
    hoof: number;
  };
  const BUILD: Record<Species, Build> = {
    // The two-humped Bactrian of the Silk Road caravans, shaggy and long-necked.
    camel: {
      withers: 1.85,
      len: 1.55,
      rx: 0.3,
      ry: 0.36,
      neckLen: 0.95,
      neckRise: 0.55,
      neckR: 0.12,
      headLen: 0.48,
      headR: 0.1,
      headDrop: 0.25,
      legR: 0.055,
      legX: 0.17,
      ears: "small",
      tail: "tuft",
      humps: 2,
      hoof: 0x4a3e34,
    },
    horse: {
      withers: 1.55,
      len: 1.65,
      rx: 0.3,
      ry: 0.36,
      neckLen: 0.8,
      neckRise: 0.9,
      neckR: 0.17,
      headLen: 0.6,
      headR: 0.11,
      headDrop: 1.1,
      legR: 0.055,
      legX: 0.17,
      ears: "pointed",
      tail: "horse",
      mane: true,
      hoof: 0x2a2420,
    },
    ox: {
      withers: 1.42,
      len: 1.85,
      rx: 0.38,
      ry: 0.42,
      neckLen: 0.55,
      neckRise: 0.25,
      neckR: 0.24,
      headLen: 0.5,
      headR: 0.14,
      headDrop: 0.6,
      legR: 0.07,
      legX: 0.22,
      ears: "small",
      horns: "ox",
      tail: "tuft",
      dewlap: true,
      hoof: 0x2a2420,
    },
    dog: {
      withers: 0.55,
      len: 0.68,
      rx: 0.12,
      ry: 0.15,
      neckLen: 0.24,
      neckRise: 0.8,
      neckR: 0.07,
      headLen: 0.22,
      headR: 0.065,
      headDrop: 0.2,
      legR: 0.025,
      legX: 0.07,
      ears: "pointed",
      tail: "curl",
      hoof: 0x3a2e24,
    },
    goat: {
      withers: 0.72,
      len: 0.82,
      rx: 0.16,
      ry: 0.2,
      neckLen: 0.3,
      neckRise: 0.85,
      neckR: 0.07,
      headLen: 0.24,
      headR: 0.06,
      headDrop: 0.8,
      legR: 0.028,
      legX: 0.09,
      ears: "floppy",
      horns: "goat",
      tail: "stub",
      hoof: 0x2a2420,
    },
    sheep: {
      withers: 0.7,
      len: 0.92,
      rx: 0.25,
      ry: 0.27,
      neckLen: 0.22,
      neckRise: 0.6,
      neckR: 0.1,
      headLen: 0.24,
      headR: 0.065,
      headDrop: 0.7,
      legR: 0.026,
      legX: 0.11,
      ears: "floppy",
      tail: "stub",
      wool: true,
      hoof: 0x2a2420,
    },
    donkey: {
      withers: 1.15,
      len: 1.2,
      rx: 0.24,
      ry: 0.28,
      neckLen: 0.5,
      neckRise: 0.6,
      neckR: 0.13,
      headLen: 0.5,
      headR: 0.1,
      headDrop: 0.9,
      legR: 0.045,
      legX: 0.13,
      ears: "long",
      tail: "tuft",
      mane: true,
      hoof: 0x2a2420,
    },
    gazelle: {
      withers: 0.72,
      len: 0.82,
      rx: 0.13,
      ry: 0.17,
      neckLen: 0.4,
      neckRise: 1.0,
      neckR: 0.055,
      headLen: 0.22,
      headR: 0.05,
      headDrop: 0.5,
      legR: 0.018,
      legX: 0.07,
      ears: "pointed",
      horns: "gazelle",
      tail: "stub",
      hoof: 0x2a2420,
    },
  };

  /** A smooth skin through `points`, each with its own girth, like a limb. */
  const pathSkin = (points: [number, number, number][], radii: [number, number][], around = 12) => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const rings = (points.length - 1) * 4;
    const positions: number[] = [];
    const side = new THREE.Vector3();
    const up = new THREE.Vector3();
    let previous: THREE_NS.Vector3 | null = null;
    for (let i = 0; i <= rings; i += 1) {
      const t = i / rings;
      const k = Math.min(points.length - 2, Math.floor(t * (points.length - 1)));
      const f = t * (points.length - 1) - k;
      const rx = radii[k]![0] + (radii[k + 1]![0] - radii[k]![0]) * f;
      const ry = radii[k]![1] + (radii[k + 1]![1] - radii[k]![1]) * f;
      const c = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const reference =
        Math.abs(tangent.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      side.crossVectors(reference, tangent).normalize();
      if (previous && side.dot(previous) < 0) side.negate();
      previous = side.clone();
      up.crossVectors(tangent, side).normalize();
      for (let j = 0; j < around; j += 1) {
        const a = (j / around) * Math.PI * 2;
        positions.push(
          c.x + side.x * Math.cos(a) * rx + up.x * Math.sin(a) * ry,
          c.y + side.y * Math.cos(a) * rx + up.y * Math.sin(a) * ry,
          c.z + side.z * Math.cos(a) * rx + up.z * Math.sin(a) * ry,
        );
      }
    }
    const index: number[] = [];
    for (let i = 0; i < rings; i += 1) {
      for (let j = 0; j < around; j += 1) {
        const a = i * around + j;
        const b = i * around + ((j + 1) % around);
        const c = (i + 1) * around + j;
        const d = (i + 1) * around + ((j + 1) % around);
        index.push(a, b, c, b, d, c);
      }
    }
    const first = points[0]!;
    const last = points[points.length - 1]!;
    const s0 = positions.length / 3;
    positions.push(...first);
    positions.push(...last);
    const lastRing = rings * around;
    for (let j = 0; j < around; j += 1) {
      index.push(s0, (j + 1) % around, j);
      index.push(s0 + 1, lastRing + j, lastRing + ((j + 1) % around));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(index);
    geometry.computeVertexNormals();
    return geometry;
  };

  /**
   * One animal, built from its kind's proportions, facing +z: a body lofted
   * from rump to breast, a neck and head on a pivot so it can graze, a tail
   * on a pivot so it can swish, and four legs, each jointed at the knee.
   */
  function makeBeast(
    species: Species,
    colour: number,
    parent: THREE_NS.Object3D,
    extra: { dressed?: number; load?: boolean } = {},
  ) {
    const B = BUILD[species];
    const root = new THREE.Group();
    parent.add(root);
    const body = new THREE.Group();
    root.add(body);
    const cy = B.withers - B.ry;
    const half = B.len / 2;
    const belly = darker(colour);
    const pieces: THREE_NS.BufferGeometry[] = [
      paint(
        pathSkin(
          [
            [0, cy + B.ry * 0.12, -half - B.rx * 0.2],
            [0, cy + B.ry * 0.08, -half * 0.7],
            [0, cy, -half * 0.25],
            [0, cy - B.ry * 0.05, half * 0.2],
            [0, cy + B.ry * 0.05, half * 0.65],
            [0, cy + B.ry * 0.1, half + B.rx * 0.15],
          ],
          [
            [B.rx * 0.35, B.ry * 0.4],
            [B.rx * 0.95, B.ry * 0.92],
            [B.rx * 1.02, B.ry * 1.02],
            [B.rx, B.ry * 1.04],
            [B.rx * 0.9, B.ry * 0.98],
            [B.rx * 0.4, B.ry * 0.5],
          ],
          16,
        ),
        colour,
      ),
    ];
    if (B.wool) {
      // A fleece: lumps over the whole back.
      for (let i = 0; i < 14; i += 1) {
        const z = -half * 0.8 + ((i % 7) * (half * 1.6)) / 6;
        const x = (i < 7 ? -1 : 1) * B.rx * 0.45;
        pieces.push(
          paint(sphere(B.rx * 0.55, [x, cy + B.ry * 0.25, z], [1, 0.9, 1], 8, 6), colour),
        );
      }
    }
    for (let i = 0; i < (B.humps ?? 0); i += 1) {
      // The humps on the back, the long winter hair standing up on them.
      const z = (B.humps === 1 ? 0 : i === 0 ? -0.28 : 0.22) * half;
      pieces.push(
        paint(sphere(B.rx * 0.62, [0, cy + B.ry * 0.8, z], [0.9, 1.15, 1.1], 10, 7), colour),
      );
    }
    if (B.dewlap) {
      pieces.push(
        paint(
          pathSkin(
            [
              [0, cy - B.ry * 0.4, half * 0.6],
              [0, cy - B.ry * 0.95, half * 0.85],
              [0, cy - B.ry * 0.6, half * 1.0],
            ],
            [
              [0.04, 0.1],
              [0.05, 0.14],
              [0.03, 0.06],
            ],
            8,
          ),
          colour,
        ),
      );
    }
    if (extra.dressed !== undefined && species !== "ox") {
      // A saddle cloth.
      pieces.push(
        paint(
          cylinder(B.rx * 1.06, B.rx * 1.06, 0.4, [0, 0, 0], 16)
            .scale(1, 1, B.ry / B.rx)
            .rotateX(Math.PI / 2)
            .translate(0, cy + B.ry * 0.2, 0.15),
          extra.dressed,
        ),
      );
    }
    if (extra.load) {
      for (const side of [-1, 1]) {
        pieces.push(
          paint(
            new THREE.BoxGeometry(0.22, 0.32, 0.42).translate(side * (B.rx + 0.1), cy + 0.02, 0),
            0xa8844e,
          ),
        );
      }
      pieces.push(
        paint(
          new THREE.BoxGeometry(B.rx * 2 + 0.2, 0.05, 0.36).translate(0, cy + B.ry + 0.02, 0),
          0x7a5a3a,
        ),
      );
    }
    body.add(meshOf(pieces));
    void belly;

    /* Neck and head, on a pivot at the withers. */
    const neck = new THREE.Group();
    neck.position.set(0, cy + B.ry * 0.35, half * 0.75);
    body.add(neck);
    const nTop: [number, number, number] = [
      0,
      Math.sin(B.neckRise) * B.neckLen,
      Math.cos(B.neckRise) * B.neckLen,
    ];
    const headTip: [number, number, number] = [
      0,
      nTop[1] - Math.sin(B.headDrop) * B.headLen,
      nTop[2] + Math.cos(B.headDrop) * B.headLen,
    ];
    const headPieces: THREE_NS.BufferGeometry[] = [
      paint(
        pathSkin(
          [[0, -B.ry * 0.25, -0.05], [0, nTop[1] * 0.5, nTop[2] * 0.5], nTop],
          [
            [B.neckR * 1.3, B.neckR * 1.6],
            [B.neckR, B.neckR * 1.2],
            [B.neckR * 0.8, B.neckR * 0.9],
          ],
          12,
        ),
        colour,
      ),
      paint(
        pathSkin(
          [nTop, [0, (nTop[1] * 2 + headTip[1]) / 3, (nTop[2] * 2 + headTip[2]) / 3], headTip],
          [
            [B.headR * 0.95, B.headR * 1.15],
            [B.headR * 0.9, B.headR * 1.0],
            [B.headR * 0.65, B.headR * 0.7],
          ],
          12,
        ),
        colour,
      ),
      // The muzzle, darker.
      paint(sphere(B.headR * 0.62, headTip, [1, 0.95, 0.9], 10, 7), darker(colour)),
    ];
    for (const side of [-1, 1]) {
      // Eyes.
      headPieces.push(
        paint(
          sphere(
            B.headR * 0.17,
            [side * B.headR * 0.85, nTop[1] - B.headLen * 0.12, nTop[2] + B.headLen * 0.18],
            [1, 1, 1],
            6,
            5,
          ),
          0x1a1410,
        ),
      );
      // Ears.
      const base: [number, number, number] = [
        side * B.headR * 0.6,
        nTop[1] + B.headR * 0.55,
        nTop[2] - B.headR * 0.1,
      ];
      const tip: [number, number, number] =
        B.ears === "long"
          ? [base[0] + side * 0.06, base[1] + 0.26, base[2] - 0.04]
          : B.ears === "floppy"
            ? [base[0] + side * 0.12, base[1] - 0.04, base[2] + 0.02]
            : B.ears === "small"
              ? [base[0] + side * 0.1, base[1] + 0.02, base[2]]
              : [base[0] + side * 0.02, base[1] + B.headR * 1.4, base[2] + 0.01];
      headPieces.push(
        paint(
          pathSkin(
            [base, tip],
            [
              [B.headR * 0.28, B.headR * 0.16],
              [B.headR * 0.05, B.headR * 0.04],
            ],
            6,
          ),
          colour,
        ),
      );
      // Horns.
      if (B.horns) {
        const hb: [number, number, number] = [
          side * B.headR * 0.5,
          nTop[1] + B.headR * 0.75,
          nTop[2] + B.headR * 0.1,
        ];
        const path: [number, number, number][] =
          B.horns === "ox"
            ? [
                hb,
                [hb[0] + side * 0.18, hb[1] + 0.04, hb[2] + 0.02],
                [hb[0] + side * 0.3, hb[1] + 0.18, hb[2] + 0.1],
              ]
            : B.horns === "goat"
              ? [
                  hb,
                  [hb[0] + side * 0.03, hb[1] + 0.12, hb[2] - 0.06],
                  [hb[0] + side * 0.06, hb[1] + 0.14, hb[2] - 0.18],
                ]
              : [
                  hb,
                  [hb[0] + side * 0.05, hb[1] + 0.14, hb[2] - 0.04],
                  [hb[0] + side * 0.03, hb[1] + 0.28, hb[2] + 0.02],
                ];
        headPieces.push(
          paint(
            pathSkin(
              path,
              [
                [B.headR * 0.28, B.headR * 0.28],
                [B.headR * 0.2, B.headR * 0.2],
                [B.headR * 0.04, B.headR * 0.04],
              ],
              7,
            ),
            0xd8ccb0,
          ),
        );
        if (extra.dressed !== undefined && species === "ox") {
          // The ribbons of a victim, tied round the horns.
          headPieces.push(
            paint(
              new THREE.TorusGeometry(0.06, 0.018, 5, 10)
                .rotateY(Math.PI / 2)
                .translate(hb[0] + side * 0.12, hb[1] + 0.03, hb[2] + 0.02),
              extra.dressed,
            ),
          );
        }
      }
    }
    if (extra.dressed !== undefined && species === "ox") {
      // A garland across the brow, and the fillet hanging from it.
      headPieces.push(
        paint(
          new THREE.TorusGeometry(B.headR * 1.05, 0.02, 5, 14).translate(
            0,
            nTop[1] + B.headR * 0.4,
            nTop[2] + B.headR * 0.3,
          ),
          extra.dressed,
        ),
      );
    }
    if (B.mane) {
      headPieces.push(
        paint(
          pathSkin(
            [
              [0, B.neckR * 0.9, 0.0],
              [0, nTop[1] * 0.55 + B.neckR, nTop[2] * 0.45],
              [0, nTop[1] + B.neckR * 0.5, nTop[2] - 0.02],
            ],
            [
              [0.025, 0.08],
              [0.03, 0.09],
              [0.02, 0.05],
            ],
            6,
          ),
          darker(darker(colour)),
        ),
      );
    }
    neck.add(meshOf(headPieces));

    /* Tail, on its own pivot. */
    const tail = new THREE.Group();
    tail.position.set(0, cy + B.ry * 0.4, -half - B.rx * 0.1);
    body.add(tail);
    const tailPath: [number, number, number][] =
      B.tail === "horse"
        ? [
            [0, 0, 0],
            [0, -0.15, -0.14],
            [0, -0.55, -0.2],
            [0, -0.85, -0.16],
          ]
        : B.tail === "tuft"
          ? [
              [0, 0, 0],
              [0, -0.3, -0.06],
              [0, -0.75, -0.05],
            ]
          : B.tail === "curl"
            ? [
                [0, 0, 0],
                [0, 0.12, -0.08],
                [0, 0.18, 0.0],
              ]
            : [
                [0, 0, 0],
                [0, 0.03, -0.06],
              ];
    const tailR: [number, number][] =
      B.tail === "horse"
        ? [
            [0.05, 0.05],
            [0.07, 0.06],
            [0.08, 0.05],
            [0.03, 0.02],
          ]
        : B.tail === "tuft"
          ? [
              [0.03, 0.03],
              [0.02, 0.02],
              [0.05, 0.05],
            ]
          : B.tail === "curl"
            ? [
                [0.025, 0.025],
                [0.022, 0.022],
                [0.01, 0.01],
              ]
            : [
                [0.03, 0.03],
                [0.015, 0.015],
              ];
    tail.add(
      meshOf([
        paint(pathSkin(tailPath, tailR, 7), B.tail === "horse" ? darker(darker(colour)) : colour),
      ]),
    );

    /* Legs, each from a pivot at the shoulder or hip, jointed halfway down. */
    const hipY = cy - B.ry * 0.45;
    const upper = hipY * 0.5;
    const lower = hipY * 0.5;
    const legs: Beast["legs"] = [];
    for (const front of [true, false]) {
      for (const side of [-1, 1]) {
        const hip = new THREE.Group();
        hip.position.set(side * B.legX, hipY, (front ? 1 : -1) * half * 0.62);
        body.add(hip);
        const thick = front ? 1 : 1.25;
        hip.add(
          meshOf([
            paint(
              pathSkin(
                [
                  [0, B.ry * 0.3, 0],
                  [0, -upper * 0.5, front ? 0.01 : -0.03],
                  [0, -upper, 0],
                ],
                [
                  [B.legR * 2.3 * thick, B.legR * 2.6 * thick],
                  [B.legR * 1.4, B.legR * 1.6],
                  [B.legR * 1.05, B.legR * 1.1],
                ],
                9,
              ),
              colour,
            ),
          ]),
        );
        const knee = new THREE.Group();
        knee.position.set(0, -upper, 0);
        hip.add(knee);
        knee.add(
          meshOf([
            paint(
              pathSkin(
                [
                  [0, 0, 0],
                  [0, -lower * 0.6, 0],
                  [0, -lower + 0.03, 0.01],
                ],
                [
                  [B.legR * 1.05, B.legR * 1.1],
                  [B.legR * 0.8, B.legR * 0.85],
                  [B.legR * 0.95, B.legR],
                ],
                8,
              ),
              colour,
            ),
            paint(
              cylinder(B.legR * 0.95, B.legR * 1.15, 0.05, [0, -lower + 0.025, 0.01], 8),
              B.hoof,
            ),
          ]),
        );
        legs.push({ hip, knee, front, side });
      }
    }
    return { root, body, neck, tail, legs, legLength: hipY };
  }

  const pathOf = (route?: Vec3Tuple[]) => {
    if (!route || route.length < 2) return undefined;
    const points = route.map((p) => new THREE.Vector3(...p));
    const lengths = points.map((p, i) => p.distanceTo(points[(i + 1) % points.length]!));
    const total = lengths.reduce((a, b) => a + b, 0);
    return total > 0.01 ? { points, lengths, total } : undefined;
  };

  for (const a of life.animals) {
    const made = makeBeast(a.species, a.colour, group, {
      ...(a.dressed !== undefined ? { dressed: a.dressed } : {}),
      ...(a.load ? { load: true } : {}),
    });
    made.root.position.set(...a.at);
    made.root.rotation.y = a.rotY;
    const path = pathOf(a.route);
    const beast: Beast = {
      animal: a,
      ...made,
      ...(path ? { path } : {}),
      heading: a.rotY,
      gait: a.action,
      speed: a.speed ?? 1,
      phase: a.phase,
    };
    beasts.push(beast);
    if (a.rider) {
      const B = BUILD[a.species];
      const h = 1.72;
      makeActor(
        {
          at: [0, B.withers - 0.02 - HIP * h, 0.05],
          rotY: 0,
          height: h,
          look: a.rider,
          action: "ride",
          phase: a.phase,
        },
        made.body,
      );
    }
  }

  /* ---------------- chariots ---------------- */

  type Car = {
    chariot: Chariot;
    root: THREE_NS.Group;
    wheels: THREE_NS.Object3D[];
    team: Beast[];
    path: NonNullable<ReturnType<typeof pathOf>>;
    heading: number;
  };
  const cars: Car[] = [];
  for (const chariot of life.chariots) {
    const path = pathOf(chariot.route);
    if (!path) continue;
    const root = new THREE.Group();
    group.add(root);
    // The car: a floor on the axle, a breastwork curved round the front.
    root.add(
      meshOf([
        paint(new THREE.BoxGeometry(1.0, 0.06, 0.7).translate(0, 0.62, 0), 0x6f4426),
        paint(
          cylinder(0.52, 0.52, 0.55, [0, 0, 0], 16).scale(1, 1, 0.7).translate(0, 0.92, 0.0),
          chariot.colour,
        ),
        paint(
          cylinder(0.025, 0.025, 1.5, [0, 0, 0], 6)
            .rotateZ(Math.PI / 2)
            .translate(0, 0.5, -0.1),
          0x5a3a1e,
        ),
        paint(
          cylinder(0.03, 0.03, 2.4, [0, 0, 0], 6)
            .rotateX(Math.PI / 2 - 0.12)
            .translate(0, 0.75, 1.4),
          0x5a3a1e,
        ),
        paint(
          new THREE.BoxGeometry(chariot.team === 4 ? 2.6 : 1.4, 0.05, 0.05).translate(0, 1.0, 2.6),
          0x5a3a1e,
        ),
      ]),
    );
    const wheels: THREE_NS.Object3D[] = [];
    for (const side of [-1, 1]) {
      const wheel = new THREE.Group();
      wheel.position.set(side * 0.72, 0.5, -0.1);
      root.add(wheel);
      const spokes: THREE_NS.BufferGeometry[] = [
        paint(new THREE.TorusGeometry(0.48, 0.03, 6, 20).rotateY(Math.PI / 2), 0x5a3a1e),
      ];
      for (let k = 0; k < 6; k += 1) {
        spokes.push(
          paint(cylinder(0.014, 0.014, 0.94, [0, 0, 0], 5).rotateX((k / 6) * Math.PI), 0x6f4426),
        );
      }
      spokes.push(paint(cylinder(0.06, 0.06, 0.16, [0, 0, 0], 8).rotateZ(Math.PI / 2), 0x5a3a1e));
      wheel.add(meshOf(spokes));
      wheels.push(wheel);
    }
    // The driver, leaning back against the reins.
    const driver = makeActor(
      {
        at: [0, 0.65, -0.05],
        rotY: 0,
        height: 1.72,
        look: chariot.driver,
        action: "drive",
        phase: chariot.phase,
      },
      root,
    );
    void driver;
    const team: Beast[] = [];
    for (let i = 0; i < chariot.team; i += 1) {
      const made = makeBeast("horse", chariot.horses[i % chariot.horses.length]!, root);
      made.root.position.set((i - (chariot.team - 1) / 2) * 0.68, 0, 3.2);
      team.push({
        animal: null,
        ...made,
        heading: 0,
        gait: "gallop",
        speed: chariot.speed,
        phase: chariot.phase + i * 0.4,
      });
    }
    beasts.push(...team);
    cars.push({ chariot, root, wheels, team, path, heading: 0 });
  }

  /* ---------------- the crowd ---------------- */

  const crowdMeshes: THREE_NS.InstancedMesh[] = [];
  let cheerArms: THREE_NS.InstancedMesh | null = null;
  if (life.crowd.length > 0) {
    const n = life.crowd.length;
    const torso = stack(
      [
        { y: 0.0, z: 0.0, rx: 0.15, rz: 0.12 },
        { y: 0.16, z: 0.0, rx: 0.115, rz: 0.085 },
        { y: 0.28, z: 0.0, rx: 0.135, rz: 0.08 },
        { y: 0.34, z: 0.0, rx: 0.12, rz: 0.07 },
        { y: 0.39, z: 0.0, rx: 0.045, rz: 0.04 },
      ],
      12,
    );
    // Forearms resting on the knees.
    const arms = new THREE.BoxGeometry(0.3, 0.07, 0.24).translate(0, 0.12, 0.12);
    const lap = new THREE.BoxGeometry(0.26, 0.11, 0.3).translate(0, 0.02, 0.14);
    const shins = new THREE.BoxGeometry(0.22, 0.4, 0.1).translate(0, -0.2, 0.27);
    const bodyGeo = mergePlain([torso, lap, shins, arms]);
    const headGeo = new THREE.SphereGeometry(0.07, 10, 8)
      .scale(0.92, 1.08, 1)
      .translate(0, 0.47, 0.01);
    const hairGeo = new THREE.SphereGeometry(
      0.08,
      8,
      5,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.55,
    ).translate(0, 0.485, -0.005);
    geometries.push(bodyGeo, headGeo, hairGeo);
    const crowdMaterial = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
    materials.push(crowdMaterial);
    const make = (geometry: THREE_NS.BufferGeometry, colour: (seat: Seat) => number) => {
      const mesh = new THREE.InstancedMesh(geometry, crowdMaterial, n);
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      const position = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      life.crowd.forEach((seat, i) => {
        const s = 0.92 + (((i * 7919) % 100) / 100) * 0.18;
        q.setFromAxisAngle(up, seat.rotY + (((i * 31) % 20) - 10) * 0.02);
        position.set(...seat.at);
        scale.set(s, s, s);
        m.compose(position, q, scale);
        mesh.setMatrixAt(i, m);
        mesh.setColorAt(i, tmp.set(colour(seat)));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      group.add(mesh);
      crowdMeshes.push(mesh);
    };
    make(bodyGeo, (seat) => seat.cloth);
    make(headGeo, (seat) => seat.skin);
    make(hairGeo, (seat) => seat.hair);
    /*
     * Arms raised to clap, one instance per seat, folded away to nothing
     * until that spectator gets excited. Updating a few thousand matrices a
     * frame is cheap; a skinned crowd would not be.
     */
    const armsUp = mergePlain([
      new THREE.CylinderGeometry(0.025, 0.03, 0.34, 6).rotateZ(0.25).translate(-0.12, 0.47, 0.06),
      new THREE.CylinderGeometry(0.025, 0.03, 0.34, 6).rotateZ(-0.25).translate(0.12, 0.47, 0.06),
      new THREE.SphereGeometry(0.035, 6, 5).translate(-0.06, 0.64, 0.07),
      new THREE.SphereGeometry(0.035, 6, 5).translate(0.06, 0.64, 0.07),
    ]);
    geometries.push(armsUp);
    make(armsUp, (seat) => seat.skin);
    cheerArms = crowdMeshes[crowdMeshes.length - 1]!;
  }

  function mergePlain(list: THREE_NS.BufferGeometry[]) {
    const flats = list.map((g) => {
      const f = g.index ? g.toNonIndexed() : g;
      if (f !== g) g.dispose();
      f.deleteAttribute("uv");
      if (!f.attributes["normal"]) f.computeVertexNormals();
      return f;
    });
    let count = 0;
    for (const f of flats) count += f.attributes["position"]!.count;
    const position = new Float32Array(count * 3);
    const normal = new Float32Array(count * 3);
    let offset = 0;
    for (const f of flats) {
      position.set(f.attributes["position"]!.array as Float32Array, offset * 3);
      normal.set(f.attributes["normal"]!.array as Float32Array, offset * 3);
      offset += f.attributes["position"]!.count;
      f.dispose();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(position, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
    return g;
  }

  /* ---------------- animation ---------------- */

  const lerpAngle = (a: number, b: number, t: number) => {
    let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  };

  /** 0 outside [a, b], rising to 1 and back inside it: a gesture's envelope. */
  const window01 = (u: number, a: number, b: number) => {
    if (u <= a || u >= b) return 0;
    const k = (u - a) / (b - a);
    return Math.sin(k * Math.PI) ** 0.6;
  };

  /** Still actions that are only standing about, where the idle fidgets show. */
  const IDLE: ReadonlySet<Person["action"]> = new Set<Person["action"]>([
    "stand",
    "gaze",
    "lean",
    "talk",
  ]);

  const pose = (a: Actor, now: number, stride: number, moving: boolean) => {
    const p = a.person;
    const look = p.look;
    const t = now + p.phase;
    const swing = Math.sin(stride);
    // A walker who has stopped stands about like anybody else.
    const act: Action =
      !moving && p.route && (p.action === "walk" || p.action === "run") ? "stand" : p.action;
    const base = HOLD[act];
    // Defaults: arms hanging, a little out from the sides.
    let rx = base?.r?.[0] ?? 0.05;
    let lx = base?.l?.[0] ?? 0.05;
    let rz = base?.r?.[2] ?? -0.08;
    let lz = base?.l?.[2] ?? 0.08;
    let re = base?.r?.[1] ?? -0.15;
    let le = base?.l?.[1] ?? -0.15;
    let legR = 0;
    let legL = 0;
    let kneeR = 0;
    let kneeL = 0;
    let legRz = 0;
    let legLz = 0;
    let lean = base?.lean ?? 0;
    let headX = 0;
    let headY = 0;
    let bob = 0;
    let drop = 0;
    let sway = 0;
    let bend = 0;
    let yaw = 0;

    let twist = 0;
    let hemZ = 0;
    let hemX = 0;
    let hemFlare = 1;
    const old = look.old === true;
    const heavy = look.build === "heavy";
    const child = p.height < 1.35;
    if (moving) {
      const run = act === "run";
      const march = act === "march";
      const slow = act === "sweep" || act === "plough";
      let amp = run ? 1.0 : march ? 0.5 : slow ? 0.3 : 0.42;
      if (old) amp *= 0.7;
      const armAmp = old ? 0.45 : march ? 0.5 : 1;
      rx = -swing * amp * 0.8 * armAmp;
      lx = swing * amp * 0.8 * armAmp;
      // The arm bends more as it swings forward than as it swings back.
      re = run ? -1.5 : -0.16 - Math.max(0, swing) * 0.32 * armAmp;
      le = run ? -1.5 : -0.16 - Math.max(0, -swing) * 0.32 * armAmp;
      // The shoulders turn against the hips, the hem swings from leg to leg
      // and spreads as the stride opens.
      twist = swing * (run ? 0.1 : 0.05) * (heavy ? 1.5 : 1);
      const give = a.robed ? 1 : 0.6;
      hemZ = Math.sin(stride) * 0.035 * give;
      hemX = Math.cos(stride * 2) * 0.02 * give;
      hemFlare = 1 + Math.abs(swing) * (a.robed ? 0.14 : 0.1);
      legR = swing * amp;
      legL = -swing * amp;
      const lift = run ? 1.3 : march ? 0.25 : 0.5;
      kneeR = Math.max(0, -Math.cos(stride)) * lift;
      kneeL = Math.max(0, Math.cos(stride)) * lift;
      bob = Math.abs(Math.cos(stride)) * (run ? 0.03 : 0.012) * (child ? 1.6 : old ? 0.6 : 1);
      lean = run ? 0.18 : march ? 0 : 0.03;
      // A heavy walker rolls a little from foot to foot.
      if (heavy) bend = Math.sin(stride) * 0.035;
      switch (act) {
        case "sweep": {
          const s2 = Math.sin(now * 2.2 + p.phase);
          rx = -0.75;
          re = -0.35;
          rz = 0.25 + s2 * 0.3;
          lx = -0.55;
          le = -0.9;
          lz = -0.35 + s2 * 0.3;
          lean = 0.3;
          headX = 0.25;
          break;
        }
        case "plough":
          rx = -0.6;
          re = -0.3;
          rz = 0.12;
          lx = -0.6;
          le = -0.3;
          lz = -0.12;
          lean = 0.35;
          break;
        case "spin":
          ({ rx, re, rz, lx, le, lz } = spinArms(t, rx, re, rz, lx, le, lz));
          break;
        default:
          break;
      }
    } else {
      // Breathing, and the weight shifting from foot to foot.
      bob = Math.sin(t * 1.3) * 0.002;
      switch (act) {
        case "talk": {
          const g = Math.max(0, Math.sin(t * 0.9));
          rx = -0.4 - g * 0.6;
          re = -0.9 - g * 0.5;
          rz = -0.15 - g * 0.2;
          headX = Math.sin(t * 2.1) * 0.06;
          break;
        }
        case "read":
          rx = -0.55;
          lx = -0.55;
          re = -1.25;
          le = -1.25;
          rz = 0.12;
          lz = -0.12;
          headX = 0.35;
          break;
        case "pray":
          rx = -2.3 + Math.sin(t * 0.5) * 0.08;
          lx = -2.3 + Math.sin(t * 0.5) * 0.08;
          re = -0.25;
          le = -0.25;
          rz = -0.35;
          lz = 0.35;
          headX = -0.25;
          break;
        case "perform":
          rx = -1.6 + Math.sin(t * 1.4) * 0.6;
          rz = -0.6 + Math.sin(t * 0.9) * 0.3;
          re = -0.3;
          lx = -0.6 + Math.sin(t * 1.1 + 1) * 0.3;
          lz = 0.5;
          le = -0.9;
          lean = Math.sin(t * 0.7) * 0.08;
          break;
        case "tend":
          rx = -0.9 + Math.sin(t * 1.6) * 0.15;
          lx = -0.8;
          re = -0.7;
          le = -0.9;
          lean = 0.22;
          headX = 0.25;
          break;
        case "play":
          if (p.carry === "aulos") {
            rx = -0.95;
            lx = -0.95;
            re = -1.5;
            le = -1.5;
            rz = 0.18;
            lz = -0.18;
          } else if (p.carry === "lyre") {
            lx = -0.35;
            lz = -0.25;
            le = -1.7;
            rx = -0.6 + Math.sin(t * 6) * 0.12;
            re = -1.2;
          } else if (p.carryLeft === "drum") {
            // The drum held up to the side, the other hand beating it.
            lx = -1.25;
            lz = 0.55;
            le = -0.75;
            rx = -1.05 + Math.max(0, Math.sin(t * 7)) * 0.3;
            re = -1.15;
            rz = 0.35;
            bob = Math.abs(Math.sin(t * 3.5)) * 0.01;
          } else {
            // A child at play: arms flung about, hopping.
            rx = Math.sin(t * 4) * 1.2;
            lx = -Math.sin(t * 4) * 1.2;
            bob = Math.abs(Math.sin(t * 4)) * 0.04;
          }
          break;
        case "sit":
        case "chat":
        case "write":
        case "count":
          legR = -1.5;
          legL = -1.45;
          kneeR = 1.5;
          kneeL = 1.45;
          drop = HIP;
          if (act === "write") {
            // The tablet on the knee, the stylus moving over it.
            headX = 0.45;
            re += Math.sin(t * 5) * 0.06;
            rz += Math.sin(t * 2.3) * 0.08;
            lean = 0.12;
          } else if (act === "count") {
            rx += Math.max(0, Math.sin(t * 2.2)) * 0.18;
            lx += Math.max(0, -Math.sin(t * 2.2)) * 0.18;
            headX = 0.4;
            lean = 0.15;
          } else if (act === "chat") {
            const g = Math.max(0, Math.sin(t * 0.8));
            rx = -0.6 - g * 0.55;
            re = -0.9 - g * 0.6;
            rz = -0.12 - g * 0.25;
            lx = -0.35;
            le = -0.6;
            headX = Math.sin(t * 1.7) * 0.06;
            headY = Math.sin(t * 0.4) * 0.3;
            lean = old ? 0.12 : 0;
          } else if (p.carry === "scroll") {
            rx = -0.55;
            lx = -0.55;
            re = -1.15;
            le = -1.15;
            headX = 0.3;
          } else {
            rx = -0.35;
            lx = -0.35;
            re = -0.6;
            le = -0.6;
            headY = Math.sin(t * 0.3) * 0.35;
          }
          break;
        case "pot":
          // Low on the stool, knees up either side of the wheel.
          legR = -1.95;
          legL = -1.95;
          kneeR = 1.95;
          kneeL = 1.95;
          legRz = -0.28;
          legLz = 0.28;
          drop = HIP;
          headX = 0.45;
          rx += Math.sin(t * 2.6) * 0.05;
          lx += Math.sin(t * 2.6 + 0.8) * 0.05;
          re += Math.sin(t * 3.1) * 0.08;
          break;
        case "ride":
          // Astride: thighs spread round the barrel, lower legs hanging,
          // both hands forward on the reins, swaying with the horse.
          legR = -0.55;
          legL = -0.55;
          legRz = -0.5;
          legLz = 0.5;
          kneeR = 0.75;
          kneeL = 0.75;
          rx = -0.75;
          lx = -0.75;
          re = -0.7;
          le = -0.7;
          rz = 0.15;
          lz = -0.15;
          lean = 0.12 + Math.sin(t * 9) * 0.04;
          bob = Math.abs(Math.sin(t * 4.5)) * 0.02;
          break;
        case "drive":
          rx = -1.15;
          lx = -1.15;
          re = -0.35;
          le = -0.35;
          rz = 0.12;
          lz = -0.12;
          lean = -0.14 + Math.sin(t * 6) * 0.03;
          legR = 0.15;
          legL = -0.2;
          kneeR = 0.2;
          kneeL = 0.25;
          break;
        case "cheer": {
          // Clapping over the head, bouncing on the toes.
          const clap = Math.sin(t * 14);
          rx = -2.7;
          lx = -2.7;
          rz = 0.25 + clap * 0.15;
          lz = -0.25 - clap * 0.15;
          re = -0.3;
          le = -0.3;
          bob = Math.abs(Math.sin(t * 7)) * 0.02;
          break;
        }
        case "kneel":
          legR = -1.45;
          kneeR = 1.5;
          legL = 0.1;
          kneeL = 1.55;
          drop = SHIN + 0.02;
          lean = 0.15;
          rx = -0.9 + (p.carry === "chisel" ? Math.sin(t * 7) * 0.2 : 0);
          re = -0.6;
          lx = -0.7;
          le = -0.8;
          break;
        case "grind": {
          // On both knees, sitting back, pushing the stone to and fro.
          legR = 0.12;
          legL = 0.12;
          kneeR = 1.62;
          kneeL = 1.62;
          drop = SHIN + 0.03;
          const push = Math.sin(t * 2.4);
          rx += push * 0.22;
          lx += push * 0.22;
          re -= push * 0.12;
          le -= push * 0.12;
          lean += push * 0.06;
          headX = 0.3;
          break;
        }
        case "crouch": {
          // On the heels, knees up, reaching for the bones on the ground.
          legR = -1.95;
          legL = -1.85;
          kneeR = 2.45;
          kneeL = 2.4;
          legRz = -0.2;
          legLz = 0.2;
          drop = 0.33;
          headX = 0.4;
          const toss = Math.max(0, Math.sin(t * 1.7)) ** 2;
          rx -= toss * 0.9;
          re -= toss * 0.4;
          break;
        }
        case "beg":
          // On the ground, legs out in front, the bowl held out.
          legR = -1.45;
          legL = -1.4;
          kneeR = 0.35;
          kneeL = 0.5;
          legRz = -0.12;
          legLz = 0.18;
          drop = HIP - 0.035;
          headX = 0.2 + Math.sin(t * 0.3) * 0.08;
          headY = Math.sin(t * 0.21) * 0.4;
          rx += Math.sin(t * 0.6) * 0.06;
          break;
        case "weave": {
          // Passing the weft across, then beating it up.
          const k = Math.sin(t * 1.1);
          rx += k * 0.2;
          rz += k * 0.35;
          lx -= k * 0.2;
          lz += k * 0.35;
          headY = k * 0.25;
          headX = -0.1;
          break;
        }
        case "spin":
          ({ rx, re, rz, lx, le, lz } = spinArms(t, rx, re, rz, lx, le, lz));
          headX = 0.15;
          break;
        case "weigh":
          headX = -0.1;
          lx += Math.sin(t * 0.9) * 0.1;
          re += Math.sin(t * 0.7) * 0.04;
          break;
        case "haggle": {
          const g = Math.max(0, Math.sin(t * 1.3));
          rx -= g * 0.3;
          lx -= g * 0.3;
          rz -= g * 0.2;
          lz += g * 0.2;
          headY = Math.sin(t * 3) * 0.25 * Math.max(0, Math.sin(t * 0.5));
          lean = -0.04 + g * 0.05;
          break;
        }
        case "call": {
          const w = Math.sin(t * 3.2);
          lz += w * 0.18;
          headX = -0.15;
          headY = Math.sin(t * 0.5) * 0.35;
          bob = Math.abs(w) * 0.005;
          break;
        }
        case "knead": {
          const k = Math.sin(t * 2.6);
          rx += k * 0.16;
          lx -= k * 0.16;
          lean += Math.abs(k) * 0.05;
          headX = 0.3;
          break;
        }
        case "chop": {
          const k = Math.max(0, Math.sin(t * 2.8));
          rx -= k * 1.0;
          re -= k * 0.25;
          headX = 0.35;
          break;
        }
        case "stir": {
          rx += Math.sin(t * 2) * 0.12;
          rz += Math.cos(t * 2) * 0.16;
          headX = 0.35;
          break;
        }
        case "carve": {
          // The mallet comes down on the chisel, again and again.
          const k = Math.max(0, Math.sin(t * 4.2)) ** 1.5;
          rx -= k * 0.65;
          re += k * 0.35;
          headX = 0.35;
          break;
        }
        case "saw": {
          const k = Math.sin(t * 3.4);
          rx += k * 0.3;
          re -= k * 0.38;
          lean += k * 0.03;
          headX = 0.4;
          break;
        }
        case "paint":
          rx += Math.sin(t * 1.7) * 0.28;
          rz += Math.sin(t * 0.8) * 0.18;
          headX = -0.25;
          headY = Math.sin(t * 0.8) * 0.15;
          break;
        case "hoe": {
          const k = Math.max(0, Math.sin(t * 1.8)) ** 1.5;
          rx -= k * 0.7;
          lx -= k * 0.7;
          re += k * 0.2;
          le += k * 0.2;
          lean += k * 0.08;
          headX = 0.3;
          break;
        }
        case "pour":
          headX = 0.28;
          lx += Math.sin(t * 0.6) * 0.08;
          break;
        case "dance": {
          // Turning, stepping, the arms raised and curving.
          const k = Math.sin(t * 2.4);
          rx += k * 0.35;
          lx -= Math.cos(t * 2.4) * 0.35;
          rz += k * 0.2;
          lz += Math.cos(t * 2.4) * 0.2;
          legR = Math.max(0, k) * 0.45;
          legL = Math.max(0, -k) * 0.45;
          kneeR = Math.max(0, k) * 0.8;
          kneeL = Math.max(0, -k) * 0.8;
          bob = Math.abs(k) * 0.025;
          twist = Math.sin(t * 1.2) * 0.4;
          yaw = Math.sin(t * 0.55) * 1.4;
          hemFlare = 1.12 + Math.abs(Math.sin(t * 1.2)) * 0.12;
          hemZ = Math.sin(t * 1.2) * 0.04;
          headY = -twist * 0.6;
          break;
        }
        case "juggle": {
          re += Math.sin(t * 6.3) * 0.22;
          le += Math.sin(t * 6.3 + Math.PI) * 0.22;
          headX = -0.3;
          break;
        }
        case "stretch": {
          // Arms over the head, bending to one side and then the other.
          bend = Math.sin(t * 0.8) * 0.32;
          legRz = -0.16;
          legLz = 0.16;
          headX = 0.05;
          break;
        }
        case "wrestle": {
          const k = Math.sin(t * 1.3);
          lean += k * 0.08;
          legR = -0.3 + k * 0.1;
          legL = 0.4 - k * 0.1;
          kneeR = 0.45;
          kneeL = 0.35;
          twist = Math.sin(t * 0.9) * 0.15;
          drop = 0.02;
          break;
        }
        case "throw": {
          const k = Math.sin(t * 1.1);
          twist = -0.55 + k * 0.35;
          rx += k * 0.4;
          legR = -0.25;
          legL = 0.25;
          kneeR = 0.55;
          kneeL = 0.3;
          drop = 0.03;
          break;
        }
        case "toss":
          ({ rx, re, rz, lx, le, lz } = tossArms(a, now, rx, re, rz, lx, le, lz));
          headX = -0.15;
          break;
        case "lean":
          // Back against the wall, one foot crossed over the other.
          legL = 0.12;
          legLz = -0.2;
          kneeL = 0.25;
          break;
        case "point":
          headX = -0.25;
          rx += Math.sin(t * 0.7) * 0.08;
          break;
        case "gaze":
          headX = -0.4;
          headY = Math.sin(t * 0.25) * 0.45;
          break;
        case "lecture": {
          const g = Math.max(0, Math.sin(t * 0.7));
          rx -= g * 0.5;
          re += g * 0.3;
          headY = Math.sin(t * 0.33) * 0.4;
          headX = -0.05;
          break;
        }
        case "strike": {
          const k = Math.max(0, Math.sin(t * 6)) ** 2;
          rx -= k * 0.5;
          re += k * 0.3;
          headX = 0.1;
          break;
        }
        default:
          break;
      }
      /*
       * Somebody only standing about does not stand still: they shift their
       * weight, look about them, now and then scratch their head or fold
       * their arms — each on a cycle of their own.
       */
      if (IDLE.has(act)) {
        const clock = (now + p.phase * 9) / 13;
        const u = clock - Math.floor(clock);
        const which = Math.floor(clock + p.phase * 3) % 4;
        sway = Math.sin(t * 0.31) * 0.012;
        legRz = -Math.max(0, Math.sin(t * 0.31)) * 0.05;
        legLz = Math.max(0, -Math.sin(t * 0.31)) * 0.05;
        if (which === 1) headY += Math.sin(u * Math.PI * 2) * 0.55 * window01(u, 0.1, 0.9);
        else if (which === 2 && act === "stand" && !p.carry) {
          const e = window01(u, 0.35, 0.6);
          rx = rx + (-2.65 - rx) * e;
          re = re + (-2.2 - re) * e;
          rz = rz + (0.45 - rz) * e;
          headX += 0.15 * e;
          headY -= 0.2 * e;
        } else if (which === 3 && act === "stand" && !p.carry && !p.carryLeft) {
          // The arms folded for a while.
          const e = window01(u, 0.2, 0.8);
          rx = rx + (-0.55 - rx) * e;
          re = re + (-1.95 - re) * e;
          rz = rz + (0.6 - rz) * e;
          lx = lx + (-0.5 - lx) * e;
          le = le + (-1.9 - le) * e;
          lz = lz + (-0.6 - lz) * e;
        }
      }
    }
    // The old stoop, and lift their heads to see where they go.
    if (old && !SEATED.has(act)) {
      lean += 0.16;
      headX -= 0.12;
    }
    // Carried things that fix the arms whatever else is going on.
    switch (p.carry) {
      case "amphora":
      case "reeds":
        rx = -2.6;
        rz = -0.25;
        re = -2.0;
        break;
      case "pole":
        rx = -2.45;
        rz = -0.1;
        re = -2.15;
        break;
      case "sack":
        lx = -2.6;
        lz = 0.25;
        le = -2.0;
        break;
      case "basket":
      case "jar":
        if (act === "tend") break;
        rx = -2.85;
        rz = -0.3;
        re = -0.45;
        break;
      case "torch":
        rx = -0.9;
        re = -0.75;
        break;
      case "spear":
      case "staff":
      case "crook":
        if (act === "drive" || act === "ride") break;
        rx = -0.35;
        re = -1.2;
        rz = -0.1;
        break;
      case "offering":
        rx = -0.75;
        lx = -0.75;
        re = -1.05;
        le = -1.05;
        rz = 0.05;
        lz = -0.05;
        break;
      case "incense":
      case "barsom":
      case "tablet":
      case "book":
        if (act !== "pray" && act !== "kneel") {
          rx = -0.7;
          re = -0.9;
        }
        break;
      case "candle":
        rx = -0.55;
        re = -0.95;
        break;
      case "hoop":
        rx = -0.6;
        re = -0.2;
        rz = 0.02;
        break;
      default:
        break;
    }
    if (p.carryLeft === "shield") {
      lx = -0.5;
      le = -1.4;
      lz = 0.15;
    }
    if (p.carryLeft === "semantron") {
      lx = -0.35;
      le = -2.1;
      lz = 0.1;
    }
    // A hand held out to someone walking alongside.
    if (p.holds) {
      const reach = child ? 1.0 : 0.38;
      if (p.holds < 0) {
        rx = 0.02 + swing * 0.08;
        rz = -reach;
        re = -0.12;
      } else {
        lx = 0.02 - swing * 0.08;
        lz = reach;
        le = -0.12;
      }
    }
    a.armR.rotation.set(rx, 0, rz);
    a.armL.rotation.set(lx, 0, lz);
    a.elbowR.rotation.set(re, 0, 0);
    a.elbowL.rotation.set(le, 0, 0);
    a.legR.rotation.set(legR, 0, legRz);
    a.legL.rotation.set(legL, 0, legLz);
    a.kneeR.rotation.set(kneeR, 0, 0);
    a.kneeL.rotation.set(kneeL, 0, 0);
    a.body.rotation.set(lean, twist, bend);
    a.body.position.set(sway, bob - drop, 0);
    if (yaw !== 0) a.root.rotation.y = p.rotY + yaw;
    if (a.hem && a.close) {
      // Hanging straight down whatever the lean, then swinging.
      a.hem.rotation.set(-lean * 0.6 + hemX, -twist * 0.8, hemZ);
      a.hem.scale.set(1, 1, hemFlare);
    }
    a.legR.position.y = HIP + bob - drop;
    a.legL.position.y = HIP + bob - drop;
    a.head.rotation.set(headX, headY, 0);
    if (a.balls) {
      // Three balls in the air, round and round over the hands.
      a.balls.forEach((ball, i) => {
        const ph = now * 4.2 + (i * Math.PI * 2) / 3;
        ball.position.set(Math.cos(ph) * 0.13, 0.86 + Math.max(0, Math.sin(ph)) * 0.24, 0.27);
      });
    }
  };

  /** A spinner's arms: the distaff held up in the left, the right drawing the thread down. */
  const spinArms = (
    t: number,
    rx: number,
    re: number,
    rz: number,
    lx: number,
    le: number,
    lz: number,
  ) => {
    const s = HOLD.spin!;
    void rx;
    void re;
    void rz;
    void lx;
    void le;
    void lz;
    return {
      rx: s.r![0] + Math.sin(t * 2.2) * 0.12,
      re: s.r![1] + Math.sin(t * 2.2) * 0.1,
      rz: s.r![2],
      lx: s.l![0],
      le: s.l![1],
      lz: s.l![2],
    };
  };

  /** Throwing and catching: the arms follow where the ball is between the two. */
  const tossArms = (
    a: Actor,
    now: number,
    rx: number,
    re: number,
    rz: number,
    lx: number,
    le: number,
    lz: number,
  ) => {
    const link = a.link;
    if (!link) return { rx, re, rz, lx, le, lz };
    const u = ballClock(link, now);
    // u in [0, 0.5): the first throws to the second; [0.5, 1): back again.
    const mine = link.first ? u : (u + 0.5) % 1;
    const throwing = window01(mine, -0.08, 0.12) + window01(mine, 0.92, 1.12);
    const catching = window01(mine, 0.36, 0.56);
    return {
      rx: -0.9 - throwing * 1.4 - catching * 0.5,
      re: -0.6 + throwing * 0.4,
      rz: 0.2,
      lx: -0.9 - catching * 0.5,
      le: -0.6,
      lz: -0.2,
    };
  };

  /** Where a distance along a looped path lands, and which way it faces. */
  const travelPoint = new THREE.Vector3();
  const travel = (
    path: { points: THREE_NS.Vector3[]; lengths: number[]; total: number },
    distance: number,
  ) => {
    let d = ((distance % path.total) + path.total) % path.total;
    let i = 0;
    while (d > path.lengths[i]! && i < path.lengths.length - 1) {
      d -= path.lengths[i]!;
      i += 1;
    }
    const from = path.points[i]!;
    const to = path.points[(i + 1) % path.points.length]!;
    const f = path.lengths[i]! > 0 ? d / path.lengths[i]! : 0;
    travelPoint.lerpVectors(from, to, f);
    return { point: travelPoint, heading: Math.atan2(to.x - from.x, to.z - from.z) };
  };

  /**
   * The gaits. A walk sets the feet down one at a time — hind, fore, the
   * other hind, the other fore; a gallop gathers the hind pair and throws
   * the fore pair, with the body rocking over them. Grazing drops the neck,
   * lying folds the legs under, and anything standing still flicks its tail.
   */
  const animateBeast = (b: Beast, now: number, distance: number) => {
    const t = now + b.phase;
    const B = BUILD[b.animal?.species ?? "horse"];
    let bodyY = 0;
    let pitch = 0;
    let neckX = 0;
    if (b.gait === "walk" || b.gait === "gallop") {
      const gallop = b.gait === "gallop";
      const cycle = (distance / (gallop ? B.len * 2.2 : B.len * 0.9)) * Math.PI * 2;
      const phases = gallop ? [0.5, 0.6, 0, 0.1] : [0.25, 0.75, 0, 0.5];
      b.legs.forEach((leg, i) => {
        const p = cycle + phases[i]! * Math.PI * 2;
        const swing = Math.sin(p) * (gallop ? 0.75 : 0.32);
        leg.hip.rotation.x = swing;
        const lift = Math.max(0, Math.cos(p)) * (gallop ? 1.3 : 0.6);
        leg.knee.rotation.x = leg.front ? -lift : lift;
      });
      if (gallop) {
        pitch = Math.sin(cycle) * 0.08;
        bodyY = Math.abs(Math.sin(cycle)) * B.withers * 0.06;
        neckX = Math.sin(cycle + 1) * 0.12;
      } else {
        bodyY = Math.abs(Math.sin(cycle * 2)) * B.withers * 0.012;
        neckX = Math.sin(cycle * 2) * 0.05;
      }
    } else if (b.gait === "lie") {
      b.legs.forEach((leg) => {
        leg.hip.rotation.x = leg.front ? -1.4 : 1.3;
        leg.knee.rotation.x = leg.front ? 2.6 : -2.6;
      });
      bodyY = -b.legLength * 0.85;
      neckX = 0.15 + Math.sin(t * 0.3) * 0.05;
    } else {
      b.legs.forEach((leg) => {
        leg.hip.rotation.x = 0;
        leg.knee.rotation.x = 0;
      });
      neckX = b.gait === "graze" ? 0.95 + Math.sin(t * 0.8) * 0.08 : Math.sin(t * 0.4) * 0.08;
    }
    b.body.position.y = bodyY;
    b.body.rotation.x = pitch;
    b.neck.rotation.x = neckX;
    b.tail.rotation.z = Math.sin(t * 2.3) * 0.25;
    b.tail.rotation.x = b.gait === "gallop" ? -0.6 : 0;
  };

  /* Who the crowd watches, and how hard each seat is cheering. */
  const racers: THREE_NS.Vector3[] = [];
  const armMatrix = new THREE.Matrix4();
  const armQ = new THREE.Quaternion();
  const armPos = new THREE.Vector3();
  const armScale = new THREE.Vector3();
  const upAxis = new THREE.Vector3(0, 1, 0);
  const updateCheer = (now: number) => {
    const mesh = cheerArms!;
    const crowd = life.crowd;
    for (let i = 0; i < crowd.length; i += 1) {
      const seat = crowd[i]!;
      const seed = ((i * 2654435761) % 1000) / 1000;
      let excite: number;
      if (life.cheerFor === "racers" && racers.length > 0) {
        let near = Infinity;
        for (const r of racers) near = Math.min(near, Math.abs(r.z - seat.at[2]));
        excite = Math.max(0, 1 - near / 28) * (0.55 + seed * 0.6);
      } else {
        // A theatre: a few on their feet at any moment, and every so often the
        // whole house breaks into applause.
        const house = Math.max(0, Math.sin(now * 0.22 + 1.3)) ** 6;
        excite = Math.max(house, Math.max(0, Math.sin(now * 0.7 + seed * 40)) ** 12);
      }
      const on = excite > 0.45 ? 1 : 0.0001;
      const clap = on > 0.5 ? Math.sin(now * 13 + seed * 20) * 0.12 : 0;
      armQ.setFromAxisAngle(upAxis, seat.rotY);
      armPos.set(seat.at[0], seat.at[1] + (on > 0.5 ? Math.abs(clap) * 0.1 : 0), seat.at[2]);
      armScale.set(1 + clap, on, 1);
      armMatrix.compose(armPos, armQ, armScale);
      mesh.setMatrixAt(i, armMatrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  const along = new THREE.Vector3();
  const seen = new THREE.Vector3();
  const update = (now: number, dt: number, glow: number, camera: THREE_NS.Camera) => {
    if (!group.visible) return;
    for (const a of actors) {
      const p = a.person;
      a.root.getWorldPosition(seen);
      const d = seen.distanceToSquared(camera.position);
      const close = detailed(a.close, d, NEAR_IN, NEAR_OUT);
      if (close !== a.close) {
        a.close = close;
        for (const o of a.near) o.visible = close;
        for (const o of a.far) o.visible = !close;
      }
      if (a.path) {
        const speed = p.speed ?? 1.1;
        /*
         * Somebody who stops now and then: of every few seconds, the last
         * share they stand still, and only the time they walk moves them on.
         */
        let walked = now;
        let still = false;
        if (p.pause) {
          const period = 9 + (p.phase % 1) * 6;
          const stop = period * p.pause;
          const clock = now + p.phase * 3;
          const laps = Math.floor(clock / period);
          const into = clock - laps * period;
          walked = laps * (period - stop) + Math.min(into, period - stop) - p.phase * 3;
          still = into > period - stop;
        }
        const total = a.path.total;
        let d = (((walked * speed + p.phase * 7) % total) + total) % total;
        let i = 0;
        while (d > a.path.lengths[i]! && i < a.path.lengths.length - 1) {
          d -= a.path.lengths[i]!;
          i += 1;
        }
        const from = a.path.points[i]!;
        const to = a.path.points[(i + 1) % a.path.points.length]!;
        const f = a.path.lengths[i]! > 0 ? d / a.path.lengths[i]! : 0;
        along.lerpVectors(from, to, f);
        a.root.position.copy(along);
        const target = Math.atan2(to.x - from.x, to.z - from.z);
        a.heading = lerpAngle(a.heading, target, Math.min(1, dt * 6));
        a.root.rotation.y = a.heading;
        const strideLength = (p.action === "run" ? 1.6 : 0.75) * (p.look.old ? 0.72 : 1);
        if (still) pose(a, now, 0, false);
        else
          pose(
            a,
            now,
            ((walked * speed + p.phase * 7) / (strideLength * p.height)) * Math.PI,
            true,
          );
      } else {
        pose(a, now, 0, false);
      }
    }

    updateShared(now);

    // Animals: walk their loops, gallop, graze, or lie still.
    for (const b of beasts) {
      const a = b.animal;
      let stride = 0;
      if (a && b.path) {
        const d0 = now * b.speed + b.phase * 5;
        const at = travel(b.path, d0);
        b.root.position.copy(at.point);
        b.heading = lerpAngle(b.heading, at.heading, Math.min(1, dt * 5));
        b.root.rotation.y = b.heading;
        stride = d0;
      } else {
        stride = now * b.speed + b.phase;
      }
      animateBeast(b, now, stride);
    }
    // Chariots: the car along its track, wheels turning, the team galloping.
    for (const car of cars) {
      const d0 = now * car.chariot.speed + car.chariot.phase * 20;
      const at = travel(car.path, d0);
      car.root.position.copy(at.point);
      car.heading = lerpAngle(car.heading, at.heading, Math.min(1, dt * 4));
      car.root.rotation.y = car.heading;
      for (const wheel of car.wheels) wheel.rotation.x = d0 / 0.5;
    }
    racers.length = 0;
    for (const car of cars) racers.push(car.root.position);
    for (const b of beasts) if (b.animal && b.gait === "gallop") racers.push(b.root.position);
    if (cheerArms) updateCheer(now);

    // Fires: each flickers on its own, and glows more as the light goes.
    for (const fire of fires) {
      const s = fire.flame.size;
      const t = now * 9 + fire.phase;
      const flicker =
        0.85 + Math.sin(t) * 0.08 + Math.sin(t * 2.7 + 1.3) * 0.06 + Math.sin(t * 5.3) * 0.04;
      fire.core.scale.set(s * 0.42, s * flicker, 1);
      fire.outer.scale.set(s * 0.7, s * (1.25 - (flicker - 0.85)), 1);
      fire.outer.position.x = Math.sin(t * 0.7) * s * 0.04;
      const halo = s * (2.4 + glow * 3.2);
      fire.halo.scale.set(halo, halo, 1);
      fire.halo.position.y = s * 0.45;
      (fire.halo.material as THREE_NS.SpriteMaterial).opacity = (0.12 + glow * 0.5) * flicker;
      if (fire.light) fire.light.intensity = glow * (6 + s * 30) * flicker;
    }

    // Smoke: puffs rise, swell and thin out, then start again at the fire.
    for (const puff of puffs) {
      puff.age += dt;
      if (puff.age > puff.life) puff.age -= puff.life;
      const k = puff.age / puff.life;
      const rise = k * puff.size * 9;
      puff.sprite.position.set(
        puff.source.x + Math.sin(puff.drift + k * 3) * k * puff.size * 1.5 + k * puff.size * 2,
        puff.source.y + rise,
        puff.source.z + Math.cos(puff.drift + k * 2) * k * puff.size,
      );
      const size = puff.size * (0.8 + k * 4);
      puff.sprite.scale.set(size, size, 1);
      (puff.sprite.material as THREE_NS.SpriteMaterial).opacity =
        Math.sin(k * Math.PI) * (1 - k) * (0.4 - glow * 0.15);
    }
    for (const batch of batches) batch.sync();
  };

  /*
   * Everybody drawn in one call (see `batch.ts`): their pivots go on
   * animating, and `update` copies where each piece has got to into the batch.
   */
  const batches = batchMeshes(THREE, group, cloth, { name: "people" });

  const dispose = () => {
    for (const batch of batches) batch.dispose();
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    crowdMeshes.forEach((m) => m.dispose());
  };

  return { group, update, dispose };
}
