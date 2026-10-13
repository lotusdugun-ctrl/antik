import { useEffect, useRef, useState } from "react";
import { SCANS } from "@/lib/scans";
import { buildLandscape, type Biome } from "./scene/landscape";
import type { LifeHandle } from "./scene/life";
import type { SceneLife } from "@/lib/scene-life";
import type * as THREE_NS from "three";
import {
  boundsOf,
  type Dress,
  type FaceShape,
  type Gesture,
  type Headgear,
  type Held,
  type Hair,
  type LoftSection,
  type Material,
  type Part,
} from "@/lib/reconstruction-parts";
import type { ModelSpec } from "@/lib/reconstructions";

/**
 * The translator from `reconstruction-parts.ts` into a lit, orbitable scene.
 *
 * Everything three.js knows about this app lives in this file, and it is
 * loaded only when someone actually opens a reconstruction — the library is
 * larger than the rest of the client bundle put together, and 189 sites can be
 * browsed without ever needing it.
 *
 * Parts are merged into one mesh per material before they reach the GPU. The
 * theatre alone is some six hundred pieces, four hundred of them the little
 * treads of its radial stairs, and drawing them one at a time costs more than
 * drawing them all costs together.
 */

/** A part of the building, named, with the point on the model it names. */
export type SceneLabel = { text: string; at: [number, number, number] };

/** A time of day the scene can be lit as. */
export type AtmosMode = "day" | "golden" | "night";

type SkyPalette = { top: string; horizon: string };

type AtmosPalette = {
  sky: SkyPalette;
  fog: number;
  ground: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  sunColor: number;
  sunIntensity: number;
  fillColor: number;
  fillIntensity: number;
  starOpacity: number;
  cloudOpacity: number;
  cloudColor: number;
  birdOpacity: number;
  exposure: number;
};

/**
 * The whole scene, held as mutable numbers and colours that ease towards
 * `target` every frame, so switching light actually has a dusk to pass through
 * instead of a hard cut.
 */
type LiveAtmos = {
  skyTop: THREE_NS.Color;
  skyHorizon: THREE_NS.Color;
  fog: THREE_NS.Color;
  ground: THREE_NS.Color;
  hemiSky: THREE_NS.Color;
  hemiGround: THREE_NS.Color;
  hemiIntensity: number;
  sunColor: THREE_NS.Color;
  sunIntensity: number;
  fillColor: THREE_NS.Color;
  fillIntensity: number;
  starOpacity: number;
  cloudOpacity: number;
  cloudColor: THREE_NS.Color;
  birdOpacity: number;
  exposure: number;
};

type Props = {
  parts: Part[];
  kind: ModelSpec["kind"];
  theme: "light" | "dark";
  atmos: AtmosMode;
  autoRotate: boolean;
  /** Bumped by the caller to send the camera home. */
  resetToken: number;
  label: string;
  height: string;
  labels: SceneLabel[];
  showLabels: boolean;
  /** Index of the label the caller wants highlighted, or `null`. */
  activeLabel: number | null;
  onPickLabel: (index: number) => void;
  /** Bumped by the caller to swing the camera to a named viewpoint. */
  view: { name: "front" | "above" | "corner"; token: number } | null;
  /** Bumped by the caller to hand back the model as a .glb file. */
  exportToken: number;
  onExported: (data: ArrayBuffer) => void;
  /** What grows round the building; see `landscape.ts`. */
  biome?: Biome | undefined;
  /** Ambient occlusion on top of the shadows, for devices that can afford it. */
  quality?: boolean | undefined;
  /** Bumped by the caller to get a still of the current view. */
  captureToken?: number | undefined;
  onCaptured?: ((dataUrl: string) => void) | undefined;
  /** Leave the ground disc out of the export (AR stands the model on a real floor). */
  exportWithoutGround?: boolean | undefined;
  /** The people, fires and furniture of the place; see `scene-life.ts`. */
  life?: SceneLife | undefined;
  /** Whether that life is shown. Toggling it does not rebuild the scene. */
  showLife?: boolean | undefined;
};

type Palette = {
  color: number;
  roughness: number;
  metalness: number;
  sheen?: number;
  sheenRoughness?: number;
  sheenColor?: number;
  /**
   * The layer of polish on top of the stone — how Imperial marble was finished.
   *
   * Roman architectural marble was not left matte like a soaped worktop; the
   * visible faces were ground down and polished to a warm gloss that lets the
   * grain glow through. `clearcoat` puts that thin lacquer back on the polished
   * faces, and `clearcoatRoughness` keeps the reflection just off a mirror so a
   * carved panel still reads as carved rather than as a sheet of glass.
   */
  clearcoat?: number;
  clearcoatRoughness?: number;
};

const MATERIALS: Record<Material, Palette> = {
  /*
   * Marble: a crystalline stone that glows from within. The `sheen` layer
   * simulates the soft subsurface scatter that makes marble look alive
   * rather than like painted plaster — the light enters, bounces around
   * inside the crystals, and comes back out slightly shifted.
   */
  marble: {
    color: 0xeee8dc,
    roughness: 0.68,
    metalness: 0,
    sheen: 0.35,
    sheenRoughness: 0.38,
    sheenColor: 0xfff8f0,
    /*
     * Roman façade marble was ground down and polished to a warm gloss; the
     * `clearcoat` here is that polish. Without it the renderer keeps its
     * regular mesh, and a façade the size of Celsus reads as unglazed plaster —
     * which is why this is set rather than left to the sheen to hint at.
     */
    clearcoat: 0.5,
    clearcoatRoughness: 0.24,
  },
  marbleWorn: {
    color: 0xded5c2,
    roughness: 0.78,
    metalness: 0,
    sheen: 0.18,
    sheenRoughness: 0.5,
    sheenColor: 0xf5ede0,
    // Still in from the same year it was laid, so it keeps a trace of polish.
    clearcoat: 0.22,
    clearcoatRoughness: 0.45,
  },
  limestone: { color: 0xcabd9f, roughness: 0.88, metalness: 0 },
  stone: { color: 0xc3b79c, roughness: 0.86, metalness: 0 },
  stoneDark: { color: 0x9c927b, roughness: 0.9, metalness: 0 },
  terrazzo: { color: 0xd0c2a4, roughness: 0.83, metalness: 0 },
  shadow: { color: 0x2f2a22, roughness: 1, metalness: 0 },
  // Deliberately not a stone colour: the figure is a ruler, not a find.
  human: { color: 0x2f6f8f, roughness: 0.6, metalness: 0 },
  // Southeastern Anatolia in summer: the grass is straw, the soil is dust.
  grass: { color: 0xa8965f, roughness: 1, metalness: 0 },
  ground: { color: 0xa9977a, roughness: 1, metalness: 0 },
  // The painted half of a Roman façade: cinnabar red on the panels, Egyptian
  // blue in the mouldings, gilding on the ornament.
  paintRed: { color: 0x9c3a2c, roughness: 0.62, metalness: 0 },
  paintBlue: { color: 0x2f5b86, roughness: 0.62, metalness: 0 },
  paintGold: { color: 0xc19a3e, roughness: 0.38, metalness: 0.48 },
  timber: { color: 0x6f4426, roughness: 0.76, metalness: 0 },
  // The coloured stones Roman builders shipped across the empire for their
  // showpiece columns: grey-pink granite from the Troad, yellow giallo
  // antico from Numidia, purple-veined pavonazzetto from Phrygia.
  granite: {
    color: 0x9a8a86,
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
  },
  gialloAntico: {
    color: 0xdcc58e,
    roughness: 0.4,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
  },
  pavonazzetto: {
    color: 0xe4d6d6,
    roughness: 0.4,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
  },
  conglomerate: { color: 0xcfa57c, roughness: 0.92, metalness: 0 },
  water: { color: 0x3f7088, roughness: 0.18, metalness: 0.05, clearcoat: 0.6 },
  /*
   * Weathered bronze, kept well off full metalness on purpose. A physically
   * correct metal has almost no diffuse colour — it is only a mirror — so at
   * 0.85 these horsemen rendered as black cut-outs against the sky. Statues
   * that have stood outdoors are dulled and part-patinated anyway, and this is
   * what that looks like.
   */
  bronze: {
    color: 0x7d6a3f,
    roughness: 0.48,
    metalness: 0.32,
    sheen: 0.08,
    sheenRoughness: 0.6,
    sheenColor: 0xb8a878,
  },
  // The life of the scene: fired clay, linen, leaves, papyrus, hide.
  terracotta: { color: 0xa65f3c, roughness: 0.82, metalness: 0 },
  linen: {
    color: 0xe6dcc6,
    roughness: 0.9,
    metalness: 0,
    sheen: 0.4,
    sheenRoughness: 0.7,
    sheenColor: 0xffffff,
  },
  foliage: { color: 0x56683a, roughness: 0.9, metalness: 0 },
  papyrus: { color: 0xd9c591, roughness: 0.8, metalness: 0 },
  hide: { color: 0x8a6a48, roughness: 0.95, metalness: 0 },
};

/*
 * One lighting opinion per time of day. None of this is measured — the model
 * is the measured thing — but the light has to be something the building
 * plausibly stood in: high white sun, low warm sun, or moon. The dark theme
 * keeps the same moods, tuned down and towards blue, so a night model in dark
 * mode still reads at night.
 */
const paletteFor = (theme: "light" | "dark", atmos: AtmosMode): AtmosPalette => {
  const dark = theme === "dark";
  switch (atmos) {
    case "golden": {
      return {
        sky: dark ? { top: "#151b25", horizon: "#5c3f22" } : { top: "#5d86a8", horizon: "#f3a45c" },
        fog: dark ? 0x3a2b20 : 0xefc493,
        ground: dark ? 0x4a3c2d : 0xaa8b5e,
        hemiSky: 0xffd9a6,
        hemiGround: 0x9a7b4f,
        hemiIntensity: dark ? 0.72 : 1.05,
        sunColor: 0xff9d4d,
        sunIntensity: dark ? 1.4 : 2.2,
        fillColor: 0xf6c58b,
        fillIntensity: 0.55,
        starOpacity: 0,
        cloudOpacity: dark ? 0.22 : 0.5,
        cloudColor: 0xffd9b0,
        birdOpacity: 1,
        exposure: 1.08,
      };
    }
    case "night": {
      return {
        sky: dark ? { top: "#05080f", horizon: "#101724" } : { top: "#0a1220", horizon: "#2b3a52" },
        fog: dark ? 0x0a1118 : 0x17222f,
        ground: dark ? 0x1e242e : 0x3c4556,
        hemiSky: 0x4a5b7d,
        hemiGround: 0x22262f,
        hemiIntensity: dark ? 0.45 : 0.55,
        sunColor: 0xaeb9d8,
        sunIntensity: dark ? 0.5 : 0.62,
        fillColor: 0x2e3f63,
        fillIntensity: 0.35,
        starOpacity: 1,
        cloudOpacity: 0,
        cloudColor: 0x33405a,
        birdOpacity: 0,
        exposure: 1.18,
      };
    }
    default: {
      return {
        sky: dark ? { top: "#0d1218", horizon: "#2b3440" } : { top: "#7fa6cc", horizon: "#dfe6ec" },
        fog: dark ? 0x141a20 : 0xdfe6ec,
        ground: dark ? 0x4a4436 : 0xb5a487,
        hemiSky: 0xffffff,
        hemiGround: 0x8d8264,
        hemiIntensity: dark ? 0.75 : 1.05,
        sunColor: 0xfff3e0,
        sunIntensity: dark ? 1.5 : 2.4,
        fillColor: 0xdce8ff,
        fillIntensity: 0.5,
        starOpacity: 0,
        cloudOpacity: dark ? 0.25 : 0.6,
        cloudColor: 0xffffff,
        birdOpacity: 1,
        exposure: 1.05,
      };
    }
  }
};

/**
 * Where the camera starts, per kind of building — chosen, not computed. Each
 * one is kept low enough to be a view someone standing there could have had;
 * a plan view from overhead reads as a diagram, not a building.
 */
const VIEWPOINT: Record<ModelSpec["kind"], [number, number, number]> = {
  // Head-on and a little above: a façade is meant to be met from the front.
  "roman-facade": [0.32, 0.3, -1],
  // Over the rim of the seating, the way an audience arriving late sees it.
  "roman-theatre": [0.24, 0.44, 1],
  // Three-quarters from the corner, which is how a colonnade shows its depth.
  "ionic-dipteros": [0.72, 0.3, -0.85],
  "neolithic-enclosure": [0.6, 0.4, 0.7],
  // Facing the stair, a little to one side: the altar was climbed, not circled.
  "great-altar": [0.45, 0.34, -1],
  // Across the long side and towards the closed end: the whole length of the
  // banks, and what each stadium has along its flank — Perge's shops, the
  // curve of Aphrodisias' sides.
  stadium: [1, 0.42, 0.55],
  // Low and close, from the open side: this one is a room, not a monument.
  "peristyle-house": [0.5, 0.32, -1],
  // Three-quarters and a little above: the pyramid and the podium both show.
  mausoleum: [0.75, 0.4, -0.8],
  // From the court, looking west at the row of gods with the mound behind.
  "tumulus-sanctuary": [1, 0.32, 0.55],
};

export default function Reconstruction3DInner({
  parts,
  kind,
  theme,
  atmos,
  autoRotate,
  resetToken,
  label,
  height,
  labels,
  showLabels,
  activeLabel,
  onPickLabel,
  view,
  exportToken,
  onExported,
  biome = "mediterranean",
  quality = false,
  captureToken = 0,
  onCaptured,
  exportWithoutGround = false,
  life,
  showLife = true,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{
    setAtmos: (t: "light" | "dark", a: AtmosMode) => void;
    setAutoRotate: (on: boolean) => void;
    reset: () => void;
    setLabels: (labels: SceneLabel[], visible: boolean, active: number | null) => void;
    setView: (view: "front" | "above" | "corner") => void;
    focus: (at: [number, number, number]) => void;
    exportGLB: (withGround: boolean) => Promise<ArrayBuffer>;
    setQuality: (on: boolean) => void;
    capture: () => string;
    setLife: (on: boolean) => void;
  } | null>(null);
  const showLifeRef = useRef(showLife);
  showLifeRef.current = showLife;
  const captureRef = useRef(onCaptured);
  captureRef.current = onCaptured;
  const groundRef = useRef(!exportWithoutGround);
  groundRef.current = !exportWithoutGround;
  const qualityRef = useRef(quality);
  qualityRef.current = quality;
  // The scene reads these through the ref rather than through its own closure,
  // so a label toggle does not tear down and rebuild the whole model.
  const pickRef = useRef(onPickLabel);
  const exportRef = useRef(onExported);
  exportRef.current = onExported;
  pickRef.current = onPickLabel;
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    void (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      const { mergeGeometries } = await import("three/addons/utils/BufferGeometryUtils.js");
      const { buildLife } = await import("./scene/life");
      /*
       * The face the statues are carved from: a real human head, scanned
       * (Infinite, by Lee Perry-Smith, CC BY 3.0), cropped to the head and a
       * stub of neck and reduced for the web. Each statue reshapes it to its
       * own face. If it cannot be fetched the sculpted sphere stands in.
       */
      let headTemplate: THREE_NS.BufferGeometry | null = null;
      try {
        const response = await Promise.race([
          fetch("/scans/statue-head.bin"),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
        ]);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const view = new DataView(buffer);
          const vertices = view.getUint32(0, true);
          const indices = view.getUint32(4, true);
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(buffer, 8, vertices * 3).slice(), 3),
          );
          geometry.setIndex(
            new THREE.BufferAttribute(
              new Uint16Array(buffer, 8 + vertices * 12, indices).slice(),
              1,
            ),
          );
          // Every piece of a figure has to carry the same attributes to merge.
          geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(vertices * 2), 2));
          headTemplate = geometry;
        }
      } catch {
        headTemplate = null;
      }
      if (disposed) return;

      let renderer: THREE_NS.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          powerPreference: "high-performance",
        });
      } catch {
        setFailed(true);
        return;
      }

      const scene = new THREE.Scene();
      const bounds = boundsOf(parts);
      const centre = new THREE.Vector3(
        (bounds.min[0] + bounds.max[0]) / 2,
        (bounds.min[1] + bounds.max[1]) / 2,
        (bounds.min[2] + bounds.max[2]) / 2,
      );
      const span = Math.max(
        bounds.max[0] - bounds.min[0],
        bounds.max[1] - bounds.min[1],
        bounds.max[2] - bounds.min[2],
      );

      /* ---- geometry ---- */

      const shapeFor = (part: Extract<Part, { kind: "ring" }>) => {
        const shape = new THREE.Shape();
        const full = part.thetaLength >= Math.PI * 2 - 1e-6;
        // The shape is drawn with the angle negated, because extruding along
        // +z and then tipping the result up maps the shape's +y onto -z.
        if (full) {
          shape.absarc(0, 0, part.outer, 0, Math.PI * 2, false);
          if (part.inner > 0) {
            const hole = new THREE.Path();
            hole.absarc(0, 0, part.inner, 0, Math.PI * 2, true);
            shape.holes.push(hole);
          }
        } else {
          const from = -part.thetaStart;
          const to = -(part.thetaStart + part.thetaLength);
          shape.absarc(0, 0, part.outer, from, to, true);
          shape.absarc(0, 0, Math.max(part.inner, 0.001), to, from, false);
          shape.closePath();
        }
        const arc = full ? Math.PI * 2 : part.thetaLength;
        const segments = Math.min(96, Math.max(3, Math.ceil((arc / (Math.PI * 2)) * 128)));
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: part.height,
          bevelEnabled: false,
          curveSegments: segments,
        });
        geometry.rotateX(-Math.PI / 2);
        return geometry;
      };

      /**
       * A skin lofted over elliptical cross-sections along a smooth path
       * through their centres — the one primitive that turns a list of
       * measured girths into an animal or a body. Each section is an ellipse
       * `rx` wide across the path and `ry` tall; the path is a Catmull-Rom
       * spline, so the skin bends smoothly through a neck or a raised knee,
       * and the radii ease from one section to the next. Both ends are
       * capped. The frame each ring is drawn in keeps world-up as its up
       * where it can, and carries the previous ring's frame through the
       * places it cannot, so a neck that rises from horizontal to nearly
       * vertical never twists.
       */
      const loftGeometry = (sections: LoftSection[], around = 20, along = 6) => {
        const centres = sections.map((s) => new THREE.Vector3(s.c[0], s.c[1], s.c[2]));
        const curve = new THREE.CatmullRomCurve3(centres, false, "centripetal");
        const rings = Math.max(1, (sections.length - 1) * along);
        const positions: number[] = [];
        const ease = (t: number) => t * t * (3 - 2 * t);
        const side = new THREE.Vector3();
        const up = new THREE.Vector3();
        let previous: THREE_NS.Vector3 | null = null;
        for (let i = 0; i <= rings; i += 1) {
          const t = i / rings;
          const s = Math.min(sections.length - 1 - 1e-6, t * (sections.length - 1));
          const k = Math.floor(s);
          const f = ease(s - k);
          const a = sections[k]!;
          const b = sections[Math.min(k + 1, sections.length - 1)]!;
          const rx = a.rx + (b.rx - a.rx) * f;
          const ry = a.ry + (b.ry - a.ry) * f;
          const c = curve.getPoint(t);
          const tangent = curve.getTangent(t).normalize();
          const reference =
            Math.abs(tangent.y) < 0.85 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
          side.crossVectors(reference, tangent);
          if (previous && side.lengthSq() < 0.05) {
            side.copy(previous).addScaledVector(tangent, -previous.dot(tangent));
          }
          if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
          side.normalize();
          if (previous && side.dot(previous) < 0) side.negate();
          up.crossVectors(tangent, side).normalize();
          previous = side.clone();
          for (let j = 0; j < around; j += 1) {
            const angle = (j / around) * Math.PI * 2;
            const cx = Math.cos(angle) * rx;
            const cy = Math.sin(angle) * ry;
            positions.push(
              c.x + side.x * cx + up.x * cy,
              c.y + side.y * cx + up.y * cy,
              c.z + side.z * cx + up.z * cy,
            );
          }
        }
        const indices: number[] = [];
        for (let i = 0; i < rings; i += 1) {
          for (let j = 0; j < around; j += 1) {
            const a = i * around + j;
            const b = i * around + ((j + 1) % around);
            const c = (i + 1) * around + j;
            const d = (i + 1) * around + ((j + 1) % around);
            indices.push(a, b, c, b, d, c);
          }
        }
        const first = centres[0]!;
        const last = centres[centres.length - 1]!;
        const startCentre = positions.length / 3;
        positions.push(first.x, first.y, first.z);
        const endCentre = startCentre + 1;
        positions.push(last.x, last.y, last.z);
        const lastRing = rings * around;
        for (let j = 0; j < around; j += 1) {
          const next = (j + 1) % around;
          indices.push(startCentre, next, j);
          indices.push(endCentre, lastRing + j, lastRing + next);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        // Texture coordinates are re-cut from world position later; the merge
        // only needs every geometry to carry the same attributes.
        geometry.setAttribute(
          "uv",
          new THREE.Float32BufferAttribute(new Float32Array((positions.length / 3) * 2), 2),
        );
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
      };

      /**
       * Two figures, told apart by their material.
       *
       * The blue one is the ruler — a person standing there for scale, and
       * deliberately schematic so nobody mistakes them for a find. A marble or
       * bronze one is a statue, and gets what a statue has: a stepped pedestal,
       * feet, a body lofted from real girths standing in contrapposto with the
       * weight on one leg, a peplos whose folds are pushed into the cloth and
       * whose overfold breaks at the hips, the rolled edge of a mantle across
       * the chest, two arms from shoulder to fingertip, and a head with a face
       * carved into it — because these are reconstructions, not the broken
       * originals. Marble figures are the draped personifications of the
       * Celsus façade; bronze ones are the warriors of the Pergamon court and
       * wear the beard the cavalry wore. A rider sits astride instead, tunic
       * spread over the horse's back, cloak down behind, one arm out.
       */
      const figureGeometry = (part: Extract<Part, { kind: "figure" }>) => {
        const h = part.height;
        const id = part.identity;
        const seed = hashString(
          `${JSON.stringify(part.at)}|${part.material}|${id?.name ?? ""}|fig`,
        );
        const rand = mulberry(seed);
        const n1 = valueNoise(seed);
        const pieces: THREE_NS.BufferGeometry[] = [];
        /*
         * Which piece is what, for the paint. Each mark says "from this piece
         * on, it is cloth" (or skin, or hair…), so the builders below only
         * have to announce a change of role, not tag every primitive.
         */
        type PaintRole = "plain" | "skin" | "cloth" | "mantle" | "hair" | "accent";
        const marks: [number, PaintRole][] = [[0, "plain"]];
        const mark = (role: PaintRole) => marks.push([pieces.length, role]);
        const statue = part.material !== "human";
        const riding = part.pose === "riding";
        const seated = part.pose === "seated";
        /*
         * What tells this figure from the next. Without an identity the old
         * reading stands: bronze is a bearded warrior, marble a draped woman,
         * a scroll in the left hand and — when enthroned — a Persian tiara.
         */
        const bearded = id?.bearded ?? part.bearded ?? part.material === "bronze";
        const male = id?.sex ? id.sex === "male" : bearded;
        const hair: Hair = id?.hair ?? (male ? "short" : "bun");
        const headgear: Headgear | undefined =
          id?.headgear ?? (seated ? "persianTiara" : undefined);
        const dress: Dress = id?.dress ?? (male ? "himation" : "peplos");
        const left: Held | undefined = id ? id.left : "scroll";
        const right: Held | undefined = id?.right;
        const gesture: Gesture = id?.gesture ?? "rest";
        type P = [number, number, number];
        const section = (c: P, rx: number, ry: number): LoftSection => ({ c, rx, ry });
        const skin = (sections: LoftSection[], around = 24, along = 6) => {
          const geometry = loftGeometry(sections, around, along);
          pieces.push(geometry);
          return geometry;
        };

        /** A tapered limb from point A to point B, a humerus, radius or finger. */
        const limb = (a: P, b: P, r1: number, r2: number) => {
          const dx = b[0] - a[0];
          const dy = b[1] - a[1];
          const dz = b[2] - a[2];
          const len = Math.hypot(dx, dy, dz);
          const geo = new THREE.CylinderGeometry(r1, r2, len, 9);
          const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(dx, dy, dz).normalize(),
          );
          geo.applyQuaternion(quat);
          geo.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
          return geo;
        };
        const joint = (p: P, r: number) => {
          const ball = new THREE.SphereGeometry(r, 10, 8);
          ball.translate(...p);
          return ball;
        };
        const ball = (p: P, r: number, scale: P = [1, 1, 1]) => {
          const geo = new THREE.SphereGeometry(r, 12, 9);
          geo.scale(...scale);
          geo.translate(...p);
          pieces.push(geo);
          return geo;
        };

        /** A hand: a shaped palm, four fingers and a thumb, hung from a wrist. */
        const hand = (p: P, r: number, spread = 1): THREE_NS.BufferGeometry[] => {
          const palm = new THREE.SphereGeometry(r, 10, 8);
          palm.scale(1, 0.8, 1.2);
          palm.translate(p[0], p[1], p[2]);
          const out: THREE_NS.BufferGeometry[] = [palm];
          for (let f = 0; f < 4; f += 1) {
            const splay = ((f - 1.5) * 0.1 + (rand() - 0.5) * 0.05) * spread;
            out.push(
              limb(
                [p[0] + splay * r, p[1] - r * 0.7, p[2] + r * 0.4],
                [p[0] + splay * r * 1.3, p[1] - r * 2.2, p[2] + r * 0.55],
                r * 0.24,
                r * 0.16,
              ),
            );
          }
          out.push(
            limb(
              [p[0] - r * 0.85, p[1] - r * 0.3, p[2] + r * 0.15],
              [p[0] - r * 1.2, p[1] - r * 0.8, p[2] + r * 0.55],
              r * 0.22,
              r * 0.15,
            ),
          );
          return out;
        };

        /** An arm in three joints, and the hand at the end of it. */
        /**
         * A limb as one smooth skin through its joints, swelling where the
         * muscle is and narrowing at the joint: what turns a jointed doll into
         * an arm. `radii` gives the girth at each point.
         */
        const limbSkin = (points: P[], radii: number[], around = 16) => {
          const sections: LoftSection[] = [];
          for (let i = 0; i < points.length; i += 1) {
            sections.push(section(points[i]!, radii[i]!, radii[i]! * 0.92));
          }
          const geometry = loftGeometry(sections, around, 5);
          pieces.push(geometry);
          return geometry;
        };
        const lerpP = (a: P, b: P, t: number, push: P = [0, 0, 0]): P => [
          a[0] + (b[0] - a[0]) * t + push[0],
          a[1] + (b[1] - a[1]) * t + push[1],
          a[2] + (b[2] - a[2]) * t + push[2],
        ];

        const arm = (shoulder: P, elbow: P, wrist: P, spread = 1) => {
          mark("skin");
          // Deltoid, biceps, the elbow, the swell of the forearm, the wrist.
          limbSkin(
            [
              shoulder,
              lerpP(shoulder, elbow, 0.35, [0, 0, h * 0.006]),
              lerpP(shoulder, elbow, 0.75),
              elbow,
              lerpP(elbow, wrist, 0.3, [0, 0, h * 0.004]),
              lerpP(elbow, wrist, 0.85),
              wrist,
            ],
            [h * 0.044, h * 0.04, h * 0.034, h * 0.029, h * 0.03, h * 0.022, h * 0.019],
          );
          pieces.push(...hand(wrist, h * 0.026, spread));
          // Whatever the hand is given next is an object, not the hand.
          mark("accent");
        };

        /**
         * Sculpt a face into a plain sphere: nose, brow, sockets, cheeks, lips,
         * chin, jaw and ears, each a soft gaussian push along the surface normal
         * — the way a sculptor adds clay and takes it away. Recomputed normals
         * afterwards make it read as carved marble, not as a mask stuck on.
         */
        /*
         * The face this statue gets. A named figure can carry its own; every
         * other one is dealt a face from a seed, within the range of what a
         * Greek sculptor cut — so the five gods of Nemrut, or twenty
         * Hekatomnids, are five or twenty people rather than one face cloned.
         */
        const faceRand = mulberry(hashString(`${id?.name ?? ""}|${JSON.stringify(part.at)}|face`));
        const vary = (base: number, spread: number) => base + (faceRand() - 0.5) * 2 * spread;
        const face: Required<FaceShape> = {
          nose: id?.face?.nose ?? vary(1, 0.18),
          noseWidth: id?.face?.noseWidth ?? vary(male ? 1.05 : 0.9, 0.15),
          brow: id?.face?.brow ?? vary(male ? 1.1 : 0.75, 0.2),
          jaw: id?.face?.jaw ?? vary(male ? 1.1 : 0.85, 0.15),
          chin: id?.face?.chin ?? vary(1, 0.2),
          lips: id?.face?.lips ?? vary(male ? 0.95 : 1.15, 0.15),
          cheek: id?.face?.cheek ?? vary(1, 0.2),
          eye: id?.face?.eye ?? vary(1, 0.15),
          length: id?.face?.length ?? vary(male ? 1.06 : 1.02, 0.04),
          age: id?.face?.age ?? (bearded ? vary(0.7, 0.3) : vary(0.2, 0.2)),
        };

        /**
         * Sculpt a head out of a sphere, the way clay is worked: first the
         * mass — narrower than it is deep, the jaw tapering to the chin, the
         * back of the skull swelling, the face a flattened plane — then the
         * features pushed and cut into it along the surface normal: brow and
         * glabella, sockets with the eyeball and its upper lid inside them,
         * the bridge and wings of the nose, the two lips and the line between,
         * the chin, the cheekbones, the hollow of the temples, the angle of the
         * jaw, the folds an older face carries, and the ears. Each feature is
         * scaled by this statue's own `face`.
         */
        const sculptHead = (geo: THREE_NS.BufferGeometry, r0: number) => {
          const pos = geo.attributes["position"]!;
          const f = face;
          for (let i = 0; i < pos.count; i += 1) {
            let a = pos.getX(i) / r0;
            let b = pos.getY(i) / r0;
            let c = pos.getZ(i) / r0;
            // The mass of the head.
            a *= 0.84;
            if (b < 0) {
              const down = Math.pow(-b, 1.3);
              a *= 1 - 0.3 * down * (2 - f.jaw);
              if (c > 0) c += 0.1 * -b * c * f.chin;
            }
            if (c < -0.3 && b > -0.3) c *= 1.06;
            if (c > 0.62) c -= (c - 0.62) * 0.3;
            b *= f.length;
            const rr = Math.hypot(a, b, c) || 1;
            const ux = a / rr;
            const uy = b / rr;
            const uz = c / rr;
            const bump = (
              cx: number,
              cy: number,
              cz: number,
              sx: number,
              sy: number,
              sz: number,
              strength: number,
            ) => {
              const dx = a - cx;
              const dy = b - cy;
              const dz = c - cz;
              return (
                Math.exp(-(dx * dx) / (sx * sx) - (dy * dy) / (sy * sy) - (dz * dz) / (sz * sz)) *
                strength
              );
            };
            let disp = 0;
            const front = c > 0;
            if (front) {
              // Brow ridge and glabella.
              for (const side of [-1, 1]) {
                disp += bump(side * 0.16, 0.22 * f.length, 0.74, 0.16, 0.07, 0.22, 0.11 * f.brow);
              }
              disp += bump(0, 0.2 * f.length, 0.8, 0.07, 0.08, 0.2, 0.05 * f.brow);
              for (const side of [-1, 1]) {
                const ex = side * 0.15;
                const ey = 0.08 * f.length;
                // The socket, cut back under the brow.
                disp += bump(ex, ey, 0.72, 0.12 * f.eye, 0.085 * f.eye, 0.2, -0.17);
                // The eyeball, bulging inside it, and the upper lid over it.
                disp += bump(ex, ey - 0.005, 0.74, 0.075 * f.eye, 0.05 * f.eye, 0.15, 0.1);
                disp += bump(ex, ey + 0.045, 0.75, 0.085 * f.eye, 0.022, 0.15, 0.035);
                disp += bump(ex, ey - 0.06, 0.75, 0.07 * f.eye, 0.018, 0.15, 0.015);
                // The hollow of the temple.
                disp += bump(side * 0.6, 0.22, 0.45, 0.12, 0.14, 0.2, -0.05);
                // The cheekbone.
                disp += bump(side * 0.38, -0.03, 0.56, 0.17, 0.11, 0.2, 0.07 * f.cheek);
                // The angle of the jaw.
                disp += bump(side * 0.56, -0.42 * f.length, 0.2, 0.14, 0.12, 0.25, 0.045 * f.jaw);
                // The wing of the nostril.
                disp += bump(
                  side * 0.06 * f.noseWidth,
                  -0.19 * f.length,
                  0.86,
                  0.045,
                  0.035,
                  0.1,
                  0.06,
                );
                // The fold from nose to mouth that age deepens.
                disp += bump(side * 0.14, -0.24 * f.length, 0.8, 0.03, 0.1, 0.1, -0.035 * f.age);
                // The corner of the mouth.
                disp += bump(side * 0.13, -0.33 * f.length, 0.79, 0.04, 0.03, 0.12, -0.04);
              }
              // The nose: bridge, the length of it, the tip.
              const n = f.nose;
              disp += bump(0, 0.06 * f.length, 0.86, 0.045 * f.noseWidth, 0.12, 0.15, 0.06 * n);
              disp += bump(0, -0.08 * f.length, 0.9, 0.055 * f.noseWidth, 0.13 * n, 0.2, 0.2 * n);
              disp += bump(0, -0.17 * f.length, 0.95, 0.05 * f.noseWidth, 0.05, 0.12, 0.09 * n);
              // The groove under it, the two lips and the line between them.
              disp += bump(0, -0.24 * f.length, 0.9, 0.05, 0.03, 0.1, -0.025);
              disp += bump(0, -0.285 * f.length, 0.86, 0.11, 0.032, 0.12, 0.05 * f.lips);
              disp += bump(0, -0.37 * f.length, 0.84, 0.09, 0.035, 0.12, 0.06 * f.lips);
              disp += bump(0, -0.325 * f.length, 0.87, 0.11, 0.008, 0.08, -0.04);
              // Under the lower lip, and the chin.
              disp += bump(0, -0.44 * f.length, 0.83, 0.1, 0.03, 0.12, -0.03);
              disp += bump(0, -0.55 * f.length, 0.74, 0.13, 0.08, 0.22, 0.08 * f.chin);
            }
            // The ears.
            for (const side of [-1, 1]) {
              disp += bump(side * 0.84, 0, -0.02, 0.07, 0.2, 0.14, 0.18);
              disp += bump(side * 0.86, 0.02, 0.0, 0.03, 0.12, 0.06, -0.06);
            }
            if (bearded) {
              // The beard, massed under the jaw and round the chin in curls.
              disp += bump(0, -0.5, 0.42, 0.42, 0.42, 0.5, 0.26);
              disp += bump(0, -0.68, 0.5, 0.24, 0.24, 0.3, 0.16);
              if (b < -0.18 || (b < 0.05 && Math.abs(a) > 0.5)) {
                disp += (n1(a * 16, b * 16, c * 16) - 0.5) * 0.16;
              }
              // The moustache over the upper lip.
              disp += bump(0, -0.25, 0.86, 0.15, 0.03, 0.1, 0.03);
            }
            if (hair === "bun" || hair === "long") {
              if (b > 0.32) disp += 0.12 + (n1(a * 14, b * 14, c * 14) - 0.5) * 0.12;
            }
            disp *= 1;
            a += ux * disp;
            b += uy * disp;
            c += uz * disp;
            pos.setXYZ(i, a * r0, b * r0, c * r0);
          }
          pos.needsUpdate = true;
        };

        /**
         * The scanned head, made this statue's own: the jaw widened or drawn
         * in, the face lengthened, the nose, brow, lips, chin and cheekbones
         * pushed out or back by the statue's `face`, a woman's features
         * softened — and for a bearded man the beard built up over the jaw
         * and cheeks in curls, with the moustache over the lip.
         */
        const scanHead = (r0: number) => {
          const geometry = headTemplate!.clone();
          const pos = geometry.attributes["position"]!;
          const f = face;
          const female = !male;
          const g = (
            x: number,
            y: number,
            z: number,
            cx: number,
            cy: number,
            cz: number,
            sx: number,
            sy: number,
            sz: number,
          ) =>
            Math.exp(
              -((x - cx) ** 2) / (sx * sx) - (y - cy) ** 2 / (sy * sy) - (z - cz) ** 2 / (sz * sz),
            );
          for (let i = 0; i < pos.count; i += 1) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);
            const lower = Math.max(0, -y);
            x *= (female ? 0.95 : 1) * (1 + (f.jaw - 1) * 0.5 * Math.min(1, lower * 1.2));
            if (female) x *= 1 - 0.05 * Math.min(1, lower * 1.4);
            const ax = Math.abs(x);
            z += (f.nose - 1) * 0.22 * g(x, y, z, 0, -0.05, 0.95, 0.12, 0.25, 0.3);
            x *= 1 + (f.noseWidth - 1) * 0.35 * g(x, y, z, 0, -0.18, 0.9, 0.16, 0.12, 0.25);
            z +=
              (f.brow - 1 - (female ? 0.25 : 0)) *
              0.07 *
              g(x, y, z, 0, 0.25, 0.85, 0.42, 0.1, 0.25);
            z += (f.chin - 1) * 0.12 * g(x, y, z, 0, -0.88, 0.6, 0.25, 0.15, 0.35);
            z += (f.lips - 1) * 0.05 * g(x, y, z, 0, -0.45, 0.85, 0.2, 0.08, 0.2);
            x +=
              Math.sign(x) *
              (f.cheek - 1) *
              0.05 *
              g(ax, y, z, 0.42, -0.05, 0.55, 0.15, 0.14, 0.25);
            y *= f.length / 1.05;
            pos.setXYZ(i, x, y, z);
          }
          geometry.computeVertexNormals();
          if (bearded) {
            const normal = geometry.attributes["normal"]!;
            for (let i = 0; i < pos.count; i += 1) {
              const x = pos.getX(i);
              const y = pos.getY(i);
              const z = pos.getZ(i);
              const ax = Math.abs(x);
              // Jaw, chin and the sides of the face below the cheekbones.
              let w = 0;
              if (z > -0.35 && y < -0.28) w = Math.min(1, (-0.28 - y) * 3 + 0.4);
              if (z > -0.25 && y < 0.05 && ax > 0.52) w = Math.max(w, Math.min(1, (ax - 0.52) * 6));
              // Leave the lips clear, and add the moustache over them.
              const lips = g(x, y, z, 0, -0.45, 0.85, 0.2, 0.06, 0.2);
              w *= 1 - lips * 0.9;
              const moustache = g(x, y, z, 0, -0.33, 0.9, 0.2, 0.04, 0.15) * 0.06;
              const curl = (n1(x * 18, y * 18, z * 18) - 0.5) * 0.09;
              const d = w * (0.16 + curl) + moustache + (y < -0.75 ? w * (-0.75 - y) * 0.4 : 0);
              if (d <= 0) continue;
              pos.setXYZ(i, x + normal.getX(i) * d, y + normal.getY(i) * d, z + normal.getZ(i) * d);
            }
            geometry.computeVertexNormals();
          }
          geometry.scale(r0, r0, r0);
          return geometry;
        };

        /**
         * Cloth. Folds are pushed into a lofted skin after it is built: a
         * primary set of ridges round the body, a finer set that drifts as
         * it climbs, and a seeded wander so the pleats are never regular —
         * then the normals are recomputed, so every fold catches the light.
         * `amplitude` says how deep the folds go at each height: deepest at a
         * hem, nothing at a belt.
         */
        const drape = (
          geo: THREE_NS.BufferGeometry,
          amplitude: (y: number) => number,
          folds: number,
          phase: number,
        ) => {
          const pos = geo.attributes["position"]!;
          for (let i = 0; i < pos.count; i += 1) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const r = Math.hypot(x, z);
            if (r < 1e-4) continue;
            const angle = Math.atan2(z, x);
            const primary = 0.5 + 0.5 * Math.cos(folds * angle + phase);
            const finer = 0.5 + 0.5 * Math.cos(folds * 2.3 * angle + phase * 1.7 + y * 6);
            const wander = n1(angle * 2.2, y * 3.1, seed * 0.01) - 0.5;
            const depth = amplitude(y) * (0.45 * primary + 0.3 * finer + 0.5 * wander);
            const scale = Math.max(0.2, 1 - depth / r);
            pos.setX(i, x * scale);
            pos.setZ(i, z * scale);
          }
          pos.needsUpdate = true;
          geo.computeVertexNormals();
        };

        /** A cap of hair over the skull, flattened, and roughened if asked. */
        const hairCap = (headY: number, rough: boolean) => {
          // Only the crown: a cap open below the brow line, tipped so it sits
          // high on the forehead and low at the nape — a full sphere here
          // used to come down over the eyes like a pair of goggles.
          const cap = new THREE.SphereGeometry(h * 0.106, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
          if (rough) {
            const pos = cap.attributes["position"]!;
            for (let i = 0; i < pos.count; i += 1) {
              const x = pos.getX(i);
              const y = pos.getY(i);
              const z = pos.getZ(i);
              const len = Math.hypot(x, y, z) || 1;
              const push = (n1((x / h) * 60, (y / h) * 60, (z / h) * 60) - 0.5) * 0.03 * h;
              pos.setXYZ(i, x + (x / len) * push, y + (y / len) * push, z + (z / len) * push);
            }
            pos.needsUpdate = true;
            cap.computeVertexNormals();
          }
          cap.scale(0.9, rough ? 0.95 : 0.88, 1.02);
          cap.rotateX(-0.42);
          cap.translate(0, headY + h * 0.012, -h * 0.008);
          pieces.push(cap);
        };

        /** The hair, in the style the identity names. */
        const hairAt = (headY: number) => {
          switch (hair) {
            case "bun":
              // Hair waved back from the brow, and the bun at the back.
              hairCap(headY, true);
              ball([0, headY + h * 0.075, -h * 0.083], h * 0.055);
              break;
            case "short":
              hairCap(headY, false);
              break;
            case "curls": {
              hairCap(headY, true);
              // A row of curls round the hairline, sparing the face.
              for (let i = 0; i < 10; i += 1) {
                const angle = Math.PI * 0.32 + (i / 9) * Math.PI * 1.36;
                ball(
                  [Math.sin(angle) * h * 0.1, headY + h * 0.01, Math.cos(angle) * h * 0.1],
                  h * 0.02,
                );
              }
              break;
            }
            case "long": {
              hairCap(headY, false);
              // The mass falling down the back of the neck to the shoulders.
              const mane = skin(
                [
                  section([0, headY + h * 0.06, -h * 0.045], h * 0.09, h * 0.05),
                  section([0, headY - h * 0.04, -h * 0.085], h * 0.1, h * 0.045),
                  section([0, headY - h * 0.17, -h * 0.09], h * 0.115, h * 0.04),
                ],
                16,
                5,
              );
              drape(mane, () => 0.008 * h, 12, rand() * Math.PI * 2);
              break;
            }
          }
        };

        /** The lappets of an eastern tiara, hanging beside the ears. */
        const lappets = (bandY: number) => {
          for (const side of [-1, 1]) {
            const lappet = new THREE.BoxGeometry(h * 0.03, h * 0.14, h * 0.05);
            lappet.translate(side * h * 0.098, bandY - h * 0.075, -h * 0.005);
            pieces.push(lappet);
          }
        };

        /** A band round the brow: the base every tiara rises from. */
        const browBand = (bandY: number) => {
          const band = new THREE.CylinderGeometry(h * 0.102, h * 0.106, h * 0.03, 20);
          band.translate(0, bandY, 0);
          pieces.push(band);
        };

        /** What sits on the head, if anything. */
        const headgearAt = (headY: number) => {
          const bandY = headY + h * 0.05;
          switch (headgear) {
            case "persianTiara": {
              // The tall rounded cap, leaning a little forward, over its band.
              browBand(bandY);
              lappets(bandY);
              skin(
                [
                  section([0, bandY, 0], h * 0.102, h * 0.102),
                  section([0, bandY + h * 0.07, h * 0.004], h * 0.098, h * 0.098),
                  section([0, bandY + h * 0.15, h * 0.012], h * 0.075, h * 0.075),
                  section([0, bandY + h * 0.21, h * 0.03], h * 0.035, h * 0.035),
                ],
                20,
                6,
              );
              break;
            }
            case "armenianTiara": {
              // A straight-sided cap, five points standing up across its front.
              browBand(bandY);
              lappets(bandY);
              const cap = new THREE.CylinderGeometry(h * 0.088, h * 0.1, h * 0.13, 20);
              cap.translate(0, bandY + h * 0.065, 0);
              pieces.push(cap);
              for (let i = 0; i < 5; i += 1) {
                const angle = (i - 2) * 0.42;
                const point = new THREE.CylinderGeometry(0, h * 0.022, h * 0.07, 6);
                point.translate(
                  Math.sin(angle) * h * 0.082,
                  bandY + h * 0.13 + h * 0.035,
                  Math.cos(angle) * h * 0.082,
                );
                pieces.push(point);
              }
              break;
            }
            case "phrygianCap": {
              // The soft cap, its peak falling forward over the brow.
              lappets(bandY);
              skin(
                [
                  section([0, headY - h * 0.01, 0], h * 0.106, h * 0.11),
                  section([0, headY + h * 0.06, 0], h * 0.1, h * 0.1),
                  section([0, headY + h * 0.13, h * 0.01], h * 0.07, h * 0.07),
                  section([0, headY + h * 0.17, h * 0.06], h * 0.045, h * 0.04),
                  section([0, headY + h * 0.16, h * 0.11], h * 0.025, h * 0.022),
                ],
                20,
                6,
              );
              break;
            }
            case "polos": {
              // The basket crown, heaped with fruit and grain.
              const crown = new THREE.CylinderGeometry(h * 0.092, h * 0.088, h * 0.075, 20);
              crown.translate(0, headY + h * 0.0875, 0);
              pieces.push(crown);
              for (let i = 0; i < 7; i += 1) {
                const angle = (i / 7) * Math.PI * 2;
                ball(
                  [Math.cos(angle) * h * 0.055, headY + h * 0.13, Math.sin(angle) * h * 0.055],
                  h * 0.022,
                );
              }
              ball([0, headY + h * 0.14, 0], h * 0.024);
              break;
            }
            case "diadem": {
              const fillet = new THREE.TorusGeometry(h * 0.1, h * 0.009, 8, 28);
              fillet.rotateX(Math.PI / 2);
              fillet.translate(0, headY + h * 0.035, 0);
              pieces.push(fillet);
              break;
            }
            case "veil": {
              // Drawn up over the crown and down the back to the shoulders.
              const veil = skin(
                [
                  section([0, headY + h * 0.1, -h * 0.005], h * 0.02, h * 0.02),
                  section([0, headY + h * 0.07, -h * 0.03], h * 0.11, h * 0.1),
                  section([0, headY - h * 0.03, -h * 0.06], h * 0.12, h * 0.075),
                  section([0, headY - h * 0.14, -h * 0.09], h * 0.17, h * 0.05),
                  section([0, headY - h * 0.3, -h * 0.1], h * 0.2, h * 0.045),
                ],
                24,
                5,
              );
              drape(veil, () => 0.01 * h, 10, rand() * Math.PI * 2);
              break;
            }
            case "helmet": {
              // The Corinthian helmet worn pushed back off the face, the way
              // Athena wears it: a bowl over the crown, the cheek-pieces and
              // the empty eye-holes tipped up over the brow, a horsehair crest.
              const bowl = new THREE.SphereGeometry(
                h * 0.112,
                22,
                14,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.55,
              );
              bowl.scale(1, 0.95, 1.12);
              bowl.translate(0, headY + h * 0.02, -h * 0.005);
              pieces.push(bowl);
              const visor = new THREE.CylinderGeometry(
                h * 0.09,
                h * 0.1,
                h * 0.05,
                18,
                1,
                true,
                -Math.PI * 0.45,
                Math.PI * 0.9,
              );
              visor.rotateX(-0.9);
              visor.translate(0, headY + h * 0.1, h * 0.06);
              pieces.push(visor);
              skin(
                [
                  section([0, headY + h * 0.12, h * 0.11], h * 0.012, h * 0.02),
                  section([0, headY + h * 0.2, h * 0.03], h * 0.016, h * 0.05),
                  section([0, headY + h * 0.19, -h * 0.08], h * 0.016, h * 0.05),
                  section([0, headY + h * 0.08, -h * 0.17], h * 0.012, h * 0.04),
                  section([0, headY - h * 0.05, -h * 0.17], h * 0.006, h * 0.02),
                ],
                12,
                6,
              );
              break;
            }
            case "muralCrown": {
              // A tall crown built as a city wall, towers and all, and the
              // round veil standing behind the head like a halo.
              const crown = new THREE.CylinderGeometry(h * 0.088, h * 0.098, h * 0.12, 24);
              crown.translate(0, headY + h * 0.11, 0);
              pieces.push(crown);
              for (let i = 0; i < 8; i += 1) {
                const angle = (i / 8) * Math.PI * 2;
                const tower = new THREE.BoxGeometry(h * 0.03, h * 0.04, h * 0.03);
                tower.rotateY(-angle);
                tower.translate(
                  Math.sin(angle) * h * 0.085,
                  headY + h * 0.185,
                  Math.cos(angle) * h * 0.085,
                );
                pieces.push(tower);
              }
              const halo = new THREE.CylinderGeometry(h * 0.2, h * 0.2, h * 0.012, 32);
              halo.rotateX(Math.PI / 2);
              halo.translate(0, headY + h * 0.02, -h * 0.11);
              pieces.push(halo);
              break;
            }
            default:
              break;
          }
        };

        /** The head, on its neck, with its hair and whatever it wears. */
        const headAt = (neckBase: number, neckHeight: number, headY: number) => {
          mark("skin");
          const firstHeadPiece = pieces.length + 1;
          const neck = new THREE.CylinderGeometry(h * 0.045, h * 0.055, neckHeight, 14);
          neck.translate(0, neckBase + neckHeight / 2, 0);
          pieces.push(neck);
          // Fine enough for a face to read on a colossus, coarser on a small
          // figure nobody will walk up to.
          const fine = h > 2.4 ? [72, 56] : [52, 40];
          let head: THREE_NS.BufferGeometry;
          if (headTemplate) {
            head = scanHead(h * 0.1);
          } else {
            head = new THREE.SphereGeometry(h * 0.1, fine[0], fine[1]);
            sculptHead(head, h * 0.1);
          }
          head.computeVertexNormals();
          head.translate(0, headY, 0);
          pieces.push(head);
          mark("hair");
          hairAt(headY);
          mark("accent");
          headgearAt(headY);
          /*
           * The head was sized at a fifth of the figure, which is a doll's
           * proportion; a Greek statue's head is nearer an eighth. So the
           * head, its hair and whatever it wears are drawn in together
           * towards the chin, narrowed to the face, and the neck is left
           * where it was.
           */
          const k = 0.76;
          const chin = headY - h * 0.1;
          for (let i = firstHeadPiece; i < pieces.length; i += 1) {
            const g = pieces[i]!;
            g.translate(0, -chin, 0);
            g.scale(k * 0.94, k, k);
            g.translate(0, chin + h * 0.012, 0);
          }
        };

        /** The rolled edge of a mantle, run through the points given. */
        const roll = (points: P[], rx: number, ry: number) => {
          mark("mantle");
          return skin(
            points.map((p) => section(p, rx, ry)),
            12,
            5,
          );
        };

        /* --------------------------------------------------------------
         * Things held. Each is drawn at the hand it is in, and where it
         * needs the ground — a sceptre, a club — it is told where that is.
         * -------------------------------------------------------------- */

        /** A tall staff gripped at `grip`, its foot on `ground`. */
        const sceptreAt = (grip: P, ground: number, top: number) => {
          const staff = new THREE.CylinderGeometry(h * 0.012, h * 0.014, top - ground, 10);
          staff.translate(grip[0] + h * 0.01, (top + ground) / 2, grip[2]);
          pieces.push(staff);
          ball([grip[0] + h * 0.01, top, grip[2]], h * 0.026);
        };

        /** A knotted club, its head on the ground, its handle in the hand. */
        const clubAt = (grip: P, foot: P) => {
          pieces.push(limb(grip, foot, h * 0.02, h * 0.05));
          const head = new THREE.SphereGeometry(h * 0.055, 10, 8);
          const pos = head.attributes["position"]!;
          for (let i = 0; i < pos.count; i += 1) {
            const push = 1 + (n1(pos.getX(i) * 40, pos.getY(i) * 40, pos.getZ(i) * 40) - 0.5) * 0.4;
            pos.setXYZ(i, pos.getX(i) * push, pos.getY(i) * push, pos.getZ(i) * push);
          }
          head.computeVertexNormals();
          head.translate(...foot);
          pieces.push(head);
        };

        /** A rolled scroll across the hand. */
        const scrollAt = (p: P) => {
          const scroll = new THREE.CylinderGeometry(h * 0.016, h * 0.016, h * 0.09, 10);
          scroll.rotateZ(Math.PI / 2);
          scroll.rotateY(0.3);
          scroll.translate(...p);
          pieces.push(scroll);
        };

        /** A writing tablet, held flat against the forearm. */
        const tabletAt = (p: P) => {
          const tablet = new THREE.BoxGeometry(h * 0.1, h * 0.13, h * 0.014);
          tablet.rotateY(0.35);
          tablet.rotateX(-0.25);
          tablet.translate(...p);
          pieces.push(tablet);
        };

        /** The bundle of rods, held tilted up and forward from the fist. */
        const barsomAt = (p: P, tilt: P) => {
          for (let i = 0; i < 5; i += 1) {
            const dx = (i - 2) * h * 0.008;
            pieces.push(
              limb(
                [p[0] + dx, p[1] - h * 0.04, p[2] - h * 0.02],
                [p[0] + dx * 2 + tilt[0], p[1] + tilt[1], p[2] + tilt[2]],
                h * 0.006,
                h * 0.005,
              ),
            );
          }
        };

        /** A horn of plenty, cradled from the hand up to the shoulder. */
        const cornucopiaAt = (p: P, mouth: P) => {
          const mid: P = [(p[0] + mouth[0]) / 2, (p[1] + mouth[1]) / 2 - h * 0.01, p[2] + h * 0.01];
          skin(
            [
              section([p[0], p[1] - h * 0.12, p[2]], h * 0.01, h * 0.01),
              section(p, h * 0.03, h * 0.03),
              section(mid, h * 0.045, h * 0.045),
              section(mouth, h * 0.062, h * 0.062),
            ],
            14,
            6,
          );
          for (let i = 0; i < 5; i += 1) {
            const angle = (i / 5) * Math.PI * 2;
            ball(
              [
                mouth[0] + Math.cos(angle) * h * 0.03,
                mouth[1] + h * 0.03 + (i % 2) * h * 0.02,
                mouth[2] + Math.sin(angle) * h * 0.03,
              ],
              h * 0.022,
            );
          }
        };

        /** A sheaf of wheat, ears above the fist. */
        const wheatAt = (p: P) => {
          for (let i = 0; i < 6; i += 1) {
            const angle = (i / 6) * Math.PI * 2;
            const dx = Math.cos(angle) * h * 0.012;
            const dz = Math.sin(angle) * h * 0.012;
            const tip: P = [p[0] + dx * 3, p[1] + h * 0.16, p[2] + dz * 3 + h * 0.02];
            pieces.push(limb([p[0] + dx, p[1] - h * 0.03, p[2] + dz], tip, h * 0.005, h * 0.004));
            ball(tip, h * 0.012, [1, 2.4, 1]);
          }
        };

        /** A strung bow, held upright at the grip. */
        const bowAt = (grip: P) => {
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(grip[0], grip[1] + h * 0.34, grip[2] + h * 0.08),
            new THREE.Vector3(grip[0], grip[1], grip[2] - h * 0.01),
            new THREE.Vector3(grip[0], grip[1] - h * 0.34, grip[2] + h * 0.08),
          ]);
          pieces.push(new THREE.TubeGeometry(curve, 14, h * 0.008, 6, false));
          pieces.push(
            limb(
              [grip[0], grip[1] + h * 0.34, grip[2] + h * 0.08],
              [grip[0], grip[1] - h * 0.34, grip[2] + h * 0.08],
              h * 0.002,
              h * 0.002,
            ),
          );
        };

        /** A spear, upright, its butt on the ground and its blade above the head. */
        const spearAt = (grip: P, ground: number) => {
          const top = h * 1.18;
          const shaft = new THREE.CylinderGeometry(h * 0.009, h * 0.011, top - ground, 8);
          shaft.translate(grip[0], (top + ground) / 2, grip[2]);
          pieces.push(shaft);
          const blade = new THREE.ConeGeometry(h * 0.02, h * 0.1, 8);
          blade.scale(1, 1, 0.35);
          blade.translate(grip[0], top + h * 0.05, grip[2]);
          pieces.push(blade);
        };

        /** A round shield resting on its rim at the side, its face turned out. */
        const shieldAt = (centre: P, side: number) => {
          const disc = new THREE.CylinderGeometry(h * 0.21, h * 0.21, h * 0.025, 32);
          disc.rotateZ(Math.PI / 2);
          disc.rotateY(side * 0.25);
          disc.translate(...centre);
          pieces.push(disc);
          const boss = new THREE.SphereGeometry(h * 0.05, 14, 10);
          boss.scale(0.5, 1, 1);
          boss.translate(centre[0] + side * h * 0.015, centre[1], centre[2]);
          pieces.push(boss);
          const rim = new THREE.TorusGeometry(h * 0.205, h * 0.012, 6, 32);
          rim.rotateY(Math.PI / 2 + side * 0.25);
          rim.translate(...centre);
          pieces.push(rim);
        };

        /** A shallow libation bowl, held out flat on the palm. */
        const phialeAt = (p: P) => {
          const bowl = new THREE.CylinderGeometry(h * 0.055, h * 0.035, h * 0.015, 18);
          bowl.translate(p[0], p[1] + h * 0.012, p[2]);
          pieces.push(bowl);
        };

        /** A thunderbolt: a double-ended spindle of flame, gripped in the middle. */
        const thunderboltAt = (p: P) => {
          const bolt = loftGeometry(
            [
              section([0, -h * 0.14, 0], h * 0.004, h * 0.004),
              section([0, -h * 0.08, 0], h * 0.03, h * 0.03),
              section([0, -h * 0.02, 0], h * 0.014, h * 0.014),
              section([0, h * 0.02, 0], h * 0.014, h * 0.014),
              section([0, h * 0.08, 0], h * 0.03, h * 0.03),
              section([0, h * 0.14, 0], h * 0.004, h * 0.004),
            ],
            12,
            4,
          );
          bolt.rotateZ(0.35);
          bolt.translate(...p);
          pieces.push(bolt);
        };

        /** A wreath, held out. */
        const wreathAt = (p: P) => {
          const ring = new THREE.TorusGeometry(h * 0.05, h * 0.012, 6, 18);
          ring.rotateY(0.4);
          ring.translate(...p);
          pieces.push(ring);
        };

        if (statue && !riding && !seated) {
          // A two-step pedestal: the wider base and the narrower cap that the
          // figure actually stands on.
          mark("plain");
          const base = new THREE.CylinderGeometry(h * 0.2, h * 0.225, h * 0.035, 24);
          base.translate(0, h * 0.0175, 0);
          pieces.push(base);
          const cap = new THREE.CylinderGeometry(h * 0.17, h * 0.2, h * 0.03, 24);
          cap.translate(0, h * 0.05, 0);
          pieces.push(cap);
          const ground = h * 0.065;
          // Feet, peeking out from beneath the hem.
          mark("skin");
          for (const side of [-1, 1]) {
            const foot = new THREE.SphereGeometry(h * 0.038, 10, 7);
            foot.scale(1.25, 0.72, 1.5);
            foot.translate(side * h * 0.045, h * 0.018, h * 0.05);
            pieces.push(foot);
          }
          /*
           * Contrapposto: the weight on the right leg, so the right hip rides
           * up and out and the whole figure leans a little back over it,
           * while the free left knee bends and pushes through the cloth. It
           * is the one thing that turns a column of drapery into somebody
           * standing. A man's hips swing less, and his shoulders are wider.
           */
          const hip = (male ? 0.012 : 0.02) * h;
          const broad = male ? 1.12 : 1;
          const sheath = dress === "ependytes";
          mark("cloth");
          const robe = skin(
            sheath
              ? [
                  // Artemis of Ephesus stands stiff and frontal, the sheath
                  // a tapering column from the waist to the feet.
                  section([0, h * 0.055, 0], h * 0.09, h * 0.08),
                  section([0, h * 0.2, 0], h * 0.1, h * 0.09),
                  section([0, h * 0.4, 0], h * 0.12, h * 0.1),
                  section([0, h * 0.5, 0], h * 0.13, h * 0.105),
                  section([0, h * 0.57, 0], h * 0.115, h * 0.09),
                ]
              : [
                  section([0, h * 0.055, 0], h * 0.165, h * 0.125),
                  section([0, h * 0.16, 0], h * 0.15, h * 0.115),
                  section([0.004 * h, h * 0.3, 0.006 * h], h * 0.135, h * 0.105),
                  section([0.012 * h, h * 0.42, 0.004 * h], h * 0.14, h * 0.108),
                  section([hip, h * 0.5, 0], h * 0.15, h * 0.115),
                  section([hip * 0.7, h * 0.57, 0], h * 0.115, h * 0.09),
                ],
            36,
            6,
          );
          {
            const pos = robe.attributes["position"]!;
            const normal = robe.attributes["normal"]!;
            for (let i = 0; i < pos.count; i += 1) {
              const dx = (pos.getX(i) + 0.06 * h) / (0.06 * h);
              const dy = (pos.getY(i) - 0.31 * h) / (0.08 * h);
              const dz = (pos.getZ(i) - 0.1 * h) / (0.07 * h);
              const push = Math.exp(-(dx * dx + dy * dy + dz * dz)) * 0.03 * h;
              if (push < 1e-5) continue;
              pos.setX(i, pos.getX(i) + normal.getX(i) * push);
              pos.setY(i, pos.getY(i) + normal.getY(i) * push);
              pos.setZ(i, pos.getZ(i) + normal.getZ(i) * push);
            }
            pos.needsUpdate = true;
          }
          // A chiton is thin linen and falls in many fine pleats; the heavy
          // wool of a peplos or a himation hangs in fewer, deeper ones.
          const fine = dress === "chiton" || sheath;
          const folds = (fine ? 15 : 9) + Math.floor(rand() * 4);
          const phase = rand() * Math.PI * 2;
          if (sheath) {
            // The sheath is panelled, not draped: bands of beasts and
            // rosettes round it, each a raised ring.
            mark("accent");
            for (let i = 0; i < 5; i += 1) {
              const y = h * (0.12 + i * 0.085);
              const r = h * (0.092 + i * 0.006);
              const band = new THREE.TorusGeometry(r, h * 0.008, 6, 28);
              band.rotateX(Math.PI / 2);
              band.scale(1, 1, 0.88);
              band.translate(0, y, 0);
              pieces.push(band);
              for (let k = 0; k < 6; k += 1) {
                const angle = -Math.PI / 2 + (k / 5) * Math.PI;
                const boss = new THREE.SphereGeometry(h * 0.014, 8, 6);
                boss.translate(Math.sin(angle) * r, y + h * 0.04, Math.cos(angle) * r * 0.88);
                pieces.push(boss);
              }
            }
            mark("cloth");
          }
          if (!sheath)
            drape(
              robe,
              (y) =>
                (fine ? 0.02 : 0.03) * h * Math.max(0.25, Math.min(1, (h * 0.57 - y) / (h * 0.5))),
              folds,
              phase,
            );
          if (dress === "peplos") {
            // The overfold of the peplos, turned down from the shoulders, its
            // hem breaking across the hips.
            const overfold = skin(
              [
                section([hip * 0.7, h * 0.62, 0], h * 0.13, h * 0.1),
                section([hip * 0.8, h * 0.52, 0], h * 0.152, h * 0.115),
                section([hip * 0.8, h * 0.445, 0], h * 0.16, h * 0.122),
              ],
              32,
              5,
            );
            drape(overfold, () => 0.02 * h, 12, rand() * Math.PI * 2);
          }
          // The torso: waist, ribcage, bust, the shoulder line, the neck root.
          const torso = skin(
            [
              section([hip * 0.6, h * 0.6, 0], h * 0.125, h * 0.095),
              section([hip * 0.4, h * 0.68, 0.004 * h], h * 0.145 * broad, h * 0.11),
              section([hip * 0.2, h * 0.745, 0.002 * h], h * 0.156 * broad, h * 0.1),
              // The shoulders rounding over into the slope of the trapezius
              // and the root of the neck, rather than a flat yoke.
              section([0, h * 0.775, 0], h * 0.165 * broad, h * 0.09),
              section([0, h * 0.795, -0.004 * h], h * 0.15 * broad, h * 0.078),
              section([0, h * 0.808, -0.006 * h], h * 0.115 * broad, h * 0.068),
              section([0, h * 0.818, -0.004 * h], h * 0.075, h * 0.058),
            ],
            32,
            6,
          );
          drape(torso, () => (fine ? 0.005 : 0.008) * h, fine ? 20 : 14, rand() * Math.PI * 2);
          if (sheath) {
            // The egg-shaped pendants hung in rows across the breast — the
            // attribute nobody has agreed on the meaning of, and nobody
            // fails to recognise.
            mark("accent");
            for (let row = 0; row < 3; row += 1) {
              const count = 5 - (row === 2 ? 1 : 0);
              for (let k = 0; k < count; k += 1) {
                const x = (k - (count - 1) / 2) * h * 0.04;
                const y = h * (0.71 - row * 0.045);
                const z = h * 0.098 - Math.abs(x) * 0.35 - row * h * 0.004;
                ball([x, y, z], h * 0.02, [1, 1.3, 0.85]);
              }
            }
            mark("cloth");
          } else if (!male) {
            // The hint of the breasts beneath the cloth, just enough to read.
            for (const side of [-1, 1]) {
              ball([side * h * 0.052, h * 0.665, h * 0.095], h * 0.036, [1, 0.85, 1.2]);
            }
          }
          /*
           * The mantle. A woman's is a light roll over the left shoulder,
           * down across the chest to the right hip and on round the back. A
           * himation is the same route in heavier wool, with a second fall
           * of cloth hanging straight down the left side. A toga adds the
           * sinus, the swag of cloth across the front, and the umbo, the
           * knot pulled out of it at the chest.
           */
          const heavy = dress === "himation" || dress === "toga";
          // The rolled edge of the mantle: a flattened band of cloth, not a tube.
          const rollR = heavy ? h * 0.05 : h * 0.038;
          if (!sheath)
            roll(
              [
                [-0.15 * h, 0.8 * h, 0],
                [-0.1 * h, 0.73 * h, 0.1 * h],
                [0, 0.63 * h, 0.125 * h],
                [0.1 * h, 0.54 * h, 0.11 * h],
                [0.16 * h, 0.485 * h, 0.03 * h],
                [0.14 * h, 0.47 * h, -0.08 * h],
                [0, 0.5 * h, -0.125 * h],
              ],
              rollR,
              rollR * 0.5,
            );
          if (heavy) {
            const fall = roll(
              [
                [-0.16 * h, 0.79 * h, -0.02 * h],
                [-0.19 * h, 0.55 * h, -0.02 * h],
                [-0.175 * h, 0.3 * h, 0],
                [-0.155 * h, 0.12 * h, 0.02 * h],
              ],
              h * 0.05,
              h * 0.04,
            );
            drape(fall, () => 0.012 * h, 8, rand() * Math.PI * 2);
          }
          if (dress === "toga") {
            roll(
              [
                [-0.17 * h, 0.7 * h, 0.04 * h],
                [-0.08 * h, 0.5 * h, 0.13 * h],
                [0.08 * h, 0.44 * h, 0.13 * h],
                [0.17 * h, 0.5 * h, 0.05 * h],
              ],
              h * 0.06,
              h * 0.04,
            );
            ball([-0.04 * h, 0.66 * h, 0.13 * h], h * 0.04, [1.3, 1, 0.8]);
          }
          headAt(h * 0.815, h * 0.065, h * 0.885);

          // The right arm: what it holds, or failing that what it does.
          const shoulderR: P = [h * 0.155 * broad, h * 0.76, h * 0.01];
          if (right === "sceptre") {
            const wrist: P = [h * 0.21, h * 0.5, h * 0.06];
            arm(shoulderR, [h * 0.19, h * 0.61, h * 0.02], wrist, 0.5);
            sceptreAt(wrist, ground, h * 1.02);
          } else if (right === "club") {
            const wrist: P = [h * 0.17, h * 0.46, h * 0.06];
            arm(shoulderR, [h * 0.17, h * 0.6, h * 0.03], wrist, 0.5);
            clubAt([h * 0.18, h * 0.43, h * 0.07], [h * 0.27, ground + h * 0.05, h * 0.13]);
          } else if (right === "wheat") {
            const wrist: P = [h * 0.13, h * 0.55, h * 0.13];
            arm(shoulderR, [h * 0.16, h * 0.6, h * 0.03], wrist, 0.5);
            wheatAt(wrist);
          } else if (right === "spear") {
            const wrist: P = [h * 0.2, h * 0.66, h * 0.06];
            arm(shoulderR, [h * 0.22, h * 0.68, h * 0.0], wrist, 0.5);
            spearAt(wrist, ground);
          } else if (right === "phiale") {
            const wrist: P = [h * 0.15, h * 0.55, h * 0.2];
            arm(shoulderR, [h * 0.17, h * 0.6, h * 0.04], wrist, 1.3);
            phialeAt([wrist[0], wrist[1] - h * 0.02, wrist[2] + h * 0.03]);
          } else if (right === "thunderbolt") {
            const wrist: P = [h * 0.17, h * 0.47, h * 0.08];
            arm(shoulderR, [h * 0.18, h * 0.6, h * 0.03], wrist, 0.5);
            thunderboltAt([wrist[0], wrist[1] - h * 0.04, wrist[2] + h * 0.02]);
          } else if (right === "wreath") {
            const wrist: P = [h * 0.16, h * 0.66, h * 0.2];
            arm(shoulderR, [h * 0.18, h * 0.62, h * 0.04], wrist, 1.2);
            wreathAt([wrist[0], wrist[1] + h * 0.03, wrist[2] + h * 0.04]);
          } else if (gesture === "forward") {
            arm(shoulderR, [h * 0.17, h * 0.6, h * 0.03], [h * 0.16, h * 0.6, h * 0.24], 1.1);
          } else if (gesture === "veil") {
            // Drawing the edge of the veil forward at the shoulder.
            arm(shoulderR, [h * 0.17, h * 0.62, h * 0.06], [h * 0.09, h * 0.8, h * 0.07], 0.5);
          } else if (right === "scroll") {
            const wrist: P = [h * 0.15, h * 0.46, h * 0.07];
            arm(shoulderR, [h * 0.16, h * 0.6, h * 0.03], wrist, 0.6);
            scrollAt([wrist[0], wrist[1] - h * 0.04, wrist[2] + h * 0.02]);
          } else if (gesture === "chin") {
            // The hand raised to the chin, in thought.
            arm(shoulderR, [h * 0.14, h * 0.62, h * 0.07], [h * 0.045, h * 0.8, h * 0.1], 0.5);
          } else if (gesture === "raised") {
            // The forearm lifted, palm turned out: greeting, or teaching.
            arm(shoulderR, [h * 0.17, h * 0.6, h * 0.03], [h * 0.15, h * 0.74, h * 0.1], 1.2);
          } else {
            // Hanging at the side and a little forward, a fold of the mantle
            // gathered in the hand.
            arm(shoulderR, [h * 0.16, h * 0.6, h * 0.03], [h * 0.15, h * 0.46, h * 0.07]);
          }

          // The left arm, and what it carries.
          const shoulderL: P = [-h * 0.155 * broad, h * 0.765, 0];
          if (left === "scroll" || left === "tablet") {
            // Across the body, forearm bent — the way three of the four
            // virtues on the Celsus façade stand.
            const wrist: P = [h * 0.04, h * 0.59, h * 0.09];
            arm(shoulderL, [-h * 0.13, h * 0.615, h * 0.04], wrist, 0.6);
            if (left === "scroll") scrollAt([h * 0.05, h * 0.55, h * 0.1]);
            else tabletAt([h * 0.02, h * 0.6, h * 0.12]);
          } else if (left === "cornucopia") {
            const wrist: P = [-h * 0.06, h * 0.62, h * 0.1];
            arm(shoulderL, [-h * 0.15, h * 0.62, h * 0.04], wrist, 0.5);
            cornucopiaAt(wrist, [-h * 0.17, h * 0.82, h * 0.09]);
          } else if (left === "barsom") {
            const wrist: P = [-h * 0.1, h * 0.58, h * 0.14];
            arm(shoulderL, [-h * 0.14, h * 0.61, h * 0.03], wrist, 0.5);
            barsomAt(wrist, [0, h * 0.17, h * 0.08]);
          } else if (left === "bow") {
            const wrist: P = [-h * 0.165, h * 0.46, h * 0.06];
            arm(shoulderL, [-h * 0.165, h * 0.6, h * 0.02], wrist, 0.5);
            bowAt(wrist);
          } else if (left === "club") {
            const wrist: P = [-h * 0.17, h * 0.46, h * 0.06];
            arm(shoulderL, [-h * 0.17, h * 0.6, h * 0.03], wrist, 0.5);
            clubAt([-h * 0.18, h * 0.43, h * 0.07], [-h * 0.27, ground + h * 0.05, h * 0.13]);
          } else if (left === "sceptre") {
            const wrist: P = [-h * 0.21, h * 0.5, h * 0.06];
            arm(shoulderL, [-h * 0.19, h * 0.61, h * 0.02], wrist, 0.5);
            sceptreAt(wrist, ground, h * 1.02);
          } else if (left === "wheat") {
            const wrist: P = [-h * 0.13, h * 0.55, h * 0.13];
            arm(shoulderL, [-h * 0.16, h * 0.6, h * 0.03], wrist, 0.5);
            wheatAt(wrist);
          } else if (left === "shield") {
            const wrist: P = [-h * 0.2, h * 0.47, h * 0.08];
            arm(shoulderL, [-h * 0.18, h * 0.6, h * 0.03], wrist, 0.6);
            shieldAt([-h * 0.25, ground + h * 0.21, h * 0.06], -1);
          } else if (gesture === "forward") {
            arm(shoulderL, [-h * 0.17, h * 0.6, h * 0.03], [-h * 0.16, h * 0.6, h * 0.24], 1.1);
          } else {
            arm(shoulderL, [-h * 0.16, h * 0.6, h * 0.03], [-h * 0.15, h * 0.46, h * 0.07]);
          }
        } else if (statue && riding) {
          /*
           * Astride. The seat is the origin: a tunic spread over the horse's
           * back, thighs forward and down round the barrel, the legs hanging
           * with the feet pointed, the torso upright, a cloak falling down the
           * back — and the right arm out in the gesture of address the
           * Capitoline horseman makes, the left holding the rein.
           */
          mark("cloth");
          const tunic = skin(
            [
              section([0, 0.16 * h, 0], 0.115 * h, 0.09 * h),
              section([0, 0.06 * h, 0.01 * h], 0.15 * h, 0.12 * h),
              section([0, -0.02 * h, 0.02 * h], 0.19 * h, 0.15 * h),
              section([0, -0.08 * h, 0.03 * h], 0.21 * h, 0.16 * h),
            ],
            28,
            5,
          );
          drape(tunic, () => 0.012 * h, 10, rand() * Math.PI * 2);
          mark("skin");
          for (const side of [-1, 1]) {
            // Thighs down and forward round the barrel, gripping, the knee
            // turned in against the horse, the lower leg hanging straight
            // with the toe down — no stirrups yet.
            const hipP: P = [side * 0.075 * h, 0.01 * h, 0.01 * h];
            const knee: P = [side * 0.2 * h, -0.17 * h, 0.16 * h];
            const ankle: P = [side * 0.19 * h, -0.45 * h, 0.1 * h];
            limbSkin(
              [
                hipP,
                lerpP(hipP, knee, 0.4, [side * 0.02 * h, 0, 0]),
                lerpP(hipP, knee, 0.8),
                knee,
                lerpP(knee, ankle, 0.3, [0, 0, -0.012 * h]),
                lerpP(knee, ankle, 0.8),
                ankle,
              ],
              [h * 0.07, h * 0.066, h * 0.052, h * 0.042, h * 0.043, h * 0.03, h * 0.024],
            );
            const foot = new THREE.SphereGeometry(h * 0.032, 14, 10);
            foot.scale(0.9, 0.75, 2.0);
            foot.rotateX(0.7);
            foot.translate(ankle[0], ankle[1] - 0.035 * h, ankle[2] + 0.025 * h);
            pieces.push(foot);
          }
          /*
           * A general's muscled cuirass: the breastplate modelled as the body
           * it covers — pectorals, the arch of the ribs, the navel — over a
           * fringe of leather straps falling across the thighs.
           */
          mark("accent");
          for (let i = 0; i < 12; i += 1) {
            const a = -Math.PI * 0.85 + (i / 11) * Math.PI * 1.7;
            const strap = new THREE.BoxGeometry(h * 0.032, h * 0.075, h * 0.012);
            strap.rotateX(-0.35);
            strap.rotateY(a);
            strap.translate(Math.sin(a) * h * 0.115, h * 0.05, Math.cos(a) * h * 0.09 + h * 0.01);
            pieces.push(strap);
          }
          for (const side of [-1, 1]) {
            ball([side * h * 0.05, h * 0.255, h * 0.07], h * 0.045, [1.1, 0.75, 0.6]);
          }
          ball([0, h * 0.17, h * 0.072], h * 0.06, [1.3, 0.9, 0.35]);
          mark("cloth");
          skin(
            [
              section([0, 0.08 * h, 0], 0.105 * h, 0.08 * h),
              section([0, 0.18 * h, 0.005 * h], 0.125 * h, 0.09 * h),
              section([0, 0.27 * h, 0], 0.15 * h, 0.09 * h),
              section([0, 0.32 * h, 0], 0.165 * h, 0.085 * h),
              section([0, 0.345 * h, 0], 0.085 * h, 0.07 * h),
            ],
            28,
            5,
          );
          mark("mantle");
          // The cloak, pinned at the right shoulder, hanging round the back
          // and spreading over the horse's quarters.
          const cloak = skin(
            [
              section([0, 0.34 * h, -0.02 * h], 0.16 * h, 0.06 * h),
              section([0, 0.24 * h, -0.06 * h], 0.18 * h, 0.07 * h),
              section([0, 0.08 * h, -0.1 * h], 0.2 * h, 0.07 * h),
              section([0, -0.06 * h, -0.15 * h], 0.22 * h, 0.06 * h),
              section([0, -0.12 * h, -0.2 * h], 0.2 * h, 0.03 * h),
            ],
            24,
            5,
          );
          drape(cloak, () => 0.01 * h, 9, rand() * Math.PI * 2);
          headAt(h * 0.345, h * 0.06, h * 0.455);
          arm(
            [0.16 * h, 0.31 * h, 0.01 * h],
            [0.25 * h, 0.22 * h, 0.13 * h],
            [0.27 * h, 0.25 * h, 0.3 * h],
            1.3,
          );
          arm(
            [-0.16 * h, 0.31 * h, 0],
            [-0.19 * h, 0.17 * h, 0.07 * h],
            [-0.1 * h, 0.14 * h, 0.19 * h],
            0.5,
          );
        } else if (statue && seated) {
          /*
           * Enthroned. The seat is the origin: thighs forward along the
           * throne, shins down to the footstool, the torso upright and the
           * hands resting on the knees unless they hold something — the pose
           * of the gods on Nemrut Dağı, who sit and look straight out over
           * the court, the king and Zeus with sceptre and barsom, the goddess
           * with her horn of plenty, Herakles with his club against his knee.
           */
          const fine = dress === "chiton";
          /*
           * The lower body as the sculptors of Nemrut cut it: one mass of
           * cloth swept from the hips forward over the two knees and down to
           * the ankles, the legs read through it — a valley between the
           * thighs, the knees standing proud, the fall between the shins
           * breaking into vertical folds, the hem lying across the feet.
           */
          mark("cloth");
          {
            const robe = skin(
              [
                section([0, 0.13 * h, -0.01 * h], 0.13 * h, 0.09 * h),
                section([0, 0.06 * h, 0.03 * h], 0.165 * h, 0.1 * h),
                section([0, 0.035 * h, 0.15 * h], 0.18 * h, 0.075 * h),
                section([0, 0.03 * h, 0.27 * h], 0.185 * h, 0.065 * h),
                section([0, -0.03 * h, 0.315 * h], 0.18 * h, 0.06 * h),
                section([0, -0.13 * h, 0.325 * h], 0.18 * h, 0.055 * h),
                section([0, -0.25 * h, 0.335 * h], 0.195 * h, 0.06 * h),
                section([0, -0.27 * h, 0.335 * h], 0.17 * h, 0.04 * h),
              ],
              40,
              6,
            );
            const pos = robe.attributes["position"]!;
            const legX = 0.095 * h;
            for (let i = 0; i < pos.count; i += 1) {
              const x = pos.getX(i);
              const y = pos.getY(i);
              const z = pos.getZ(i);
              const between = Math.exp(-((x / (0.035 * h)) ** 2));
              const onLeg = Math.exp(-(((Math.abs(x) - legX) / (0.05 * h)) ** 2));
              let dy = 0;
              let dz = 0;
              if (z > 0.06 * h && z < 0.3 * h && y > 0) {
                // The valley between the thighs, and each thigh rounded.
                dy += -between * 0.03 * h + onLeg * 0.012 * h;
              }
              if (y < 0.06 * h && y > -0.06 * h && z > 0.27 * h) {
                // The knees, standing out of the cloth.
                dz += onLeg * 0.022 * h;
              }
              if (y < -0.04 * h && z > 0.3 * h) {
                // Shins pressing the cloth forward, the fall sinking between
                // them in deep folds.
                const fold = Math.cos((x / h) * 120) * 0.006 * h * (1 - onLeg);
                dz += onLeg * 0.012 * h - between * 0.022 * h + fold;
              }
              pos.setY(i, y + dy);
              pos.setZ(i, z + dz);
            }
            pos.needsUpdate = true;
            robe.computeVertexNormals();
          }
          for (const side of [-1, 1]) {
            // The shoes, their toes showing under the hem.
            mark("accent");
            const foot = new THREE.SphereGeometry(h * 0.036, 18, 10);
            foot.scale(1, 0.55, 1.8);
            foot.translate(side * 0.1 * h, -0.255 * h, 0.39 * h);
            pieces.push(foot);
          }
          const footstool = -0.27 * h;
          const broad = male ? 1.1 : 1;
          mark("cloth");
          const torso = skin(
            [
              section([0, 0.1 * h, 0], 0.11 * h, 0.085 * h),
              section([0, 0.19 * h, 0.005 * h], 0.13 * h * broad, 0.095 * h),
              section([0, 0.27 * h, 0], 0.155 * h * broad, 0.095 * h),
              section([0, 0.32 * h, 0], 0.17 * h * broad, 0.09 * h),
              section([0, 0.345 * h, 0], 0.09 * h, 0.07 * h),
            ],
            28,
            5,
          );
          drape(torso, () => (fine ? 0.005 : 0.008) * h, fine ? 18 : 12, rand() * Math.PI * 2);
          if (!male) {
            for (const side of [-1, 1]) {
              ball([side * h * 0.05, h * 0.235, h * 0.09], h * 0.036, [1, 0.85, 1.2]);
            }
          }
          // The mantle, over the left shoulder and across to the right hip.
          roll(
            [
              [-0.15 * h, 0.34 * h, 0],
              [-0.1 * h, 0.27 * h, 0.09 * h],
              [0, 0.17 * h, 0.115 * h],
              [0.12 * h, 0.08 * h, 0.1 * h],
              [0.16 * h, 0.04 * h, 0.02 * h],
            ],
            dress === "himation" ? h * 0.065 : h * 0.045,
            dress === "himation" ? h * 0.045 : h * 0.032,
          );
          headAt(h * 0.345, h * 0.06, h * 0.455);

          const shoulderR: P = [0.165 * h * broad, 0.31 * h, 0.01 * h];
          if (right === "sceptre") {
            const wrist: P = [0.19 * h, 0.07 * h, 0.2 * h];
            arm(shoulderR, [0.2 * h, 0.16 * h, 0.06 * h], wrist, 0.5);
            sceptreAt(wrist, footstool, h * 0.56);
          } else if (right === "club") {
            const wrist: P = [0.11 * h, 0.09 * h, 0.24 * h];
            arm(shoulderR, [0.185 * h, 0.15 * h, 0.08 * h], wrist, 0.5);
            clubAt([0.12 * h, 0.1 * h, 0.25 * h], [0.24 * h, footstool + h * 0.04, 0.22 * h]);
          } else if (right === "wheat") {
            const wrist: P = [0.1 * h, 0.06 * h, 0.25 * h];
            arm(shoulderR, [0.185 * h, 0.15 * h, 0.08 * h], wrist, 0.5);
            wheatAt(wrist);
          } else {
            arm(shoulderR, [0.185 * h, 0.15 * h, 0.08 * h], [0.1 * h, 0.05 * h, 0.25 * h], 0.8);
          }
          const shoulderL: P = [-0.165 * h * broad, 0.31 * h, 0.01 * h];
          if (left === "barsom") {
            const wrist: P = [-0.12 * h, 0.18 * h, 0.22 * h];
            arm(shoulderL, [-0.185 * h, 0.15 * h, 0.08 * h], wrist, 0.5);
            barsomAt(wrist, [0, h * 0.16, h * 0.1]);
          } else if (left === "cornucopia") {
            const wrist: P = [-0.08 * h, 0.2 * h, 0.16 * h];
            arm(shoulderL, [-0.185 * h, 0.15 * h, 0.06 * h], wrist, 0.5);
            cornucopiaAt(wrist, [-0.17 * h, 0.36 * h, 0.1 * h]);
          } else if (left === "club") {
            const wrist: P = [-0.11 * h, 0.09 * h, 0.24 * h];
            arm(shoulderL, [-0.185 * h, 0.15 * h, 0.08 * h], wrist, 0.5);
            clubAt([-0.12 * h, 0.1 * h, 0.25 * h], [-0.24 * h, footstool + h * 0.04, 0.22 * h]);
          } else {
            arm(shoulderL, [-0.185 * h, 0.15 * h, 0.08 * h], [-0.1 * h, 0.05 * h, 0.25 * h], 0.8);
          }
        } else {
          // The scale figure: deliberately schematic, a teaching device. The
          // proportions are those of a person 1.75 m tall, but the rendering is
          // deliberately non-photographic — blue and smooth — so nobody
          // mistakes it for a find.
          const legs = new THREE.CylinderGeometry(h * 0.055, h * 0.045, h * 0.47, 8);
          for (const side of [-1, 1]) {
            const leg = legs.clone();
            leg.translate(side * h * 0.06, h * 0.235, 0);
            pieces.push(leg);
          }
          legs.dispose();
          const torso = new THREE.CapsuleGeometry(h * 0.11, h * 0.28, 4, 10);
          torso.translate(0, h * 0.68, 0);
          pieces.push(torso);
          for (const side of [-1, 1]) {
            const armGeo = new THREE.CylinderGeometry(h * 0.028, h * 0.022, h * 0.36, 7);
            armGeo.translate(side * h * 0.115, h * 0.6, 0);
            pieces.push(armGeo);
          }
          const head = new THREE.SphereGeometry(h * 0.075, 12, 10);
          head.translate(0, h * 0.93, 0);
          pieces.push(head);
        }

        // Every primitive here is indexed and a loft is too, but a merge only
        // holds when the lists agree, so everything is flattened first.
        const flat = pieces.map((piece) => (piece.index ? piece.toNonIndexed() : piece));
        const paint = part.paint;
        if (paint) {
          const roleAt = (index: number): PaintRole => {
            let role: PaintRole = "plain";
            for (const [from, r] of marks) if (from <= index) role = r;
            return role;
          };
          const tint = new THREE.Color();
          flat.forEach((piece, index) => {
            const role = roleAt(index);
            const hex = role === "plain" ? undefined : paint[role === "accent" ? "accent" : role];
            tint.set(hex ?? 0xffffff);
            // Painted marble keeps the stone's own colour underneath, so the
            // tint is mixed towards white rather than laid on at full strength.
            if (hex !== undefined)
              tint.lerp(new THREE.Color(0xffffff), role === "skin" ? 0.35 : 0.12);
            const count = piece.attributes["position"]!.count;
            const colours = new Float32Array(count * 3);
            for (let i = 0; i < count; i += 1) {
              colours[i * 3] = tint.r;
              colours[i * 3 + 1] = tint.g;
              colours[i * 3 + 2] = tint.b;
            }
            piece.setAttribute("color", new THREE.BufferAttribute(colours, 3));
          });
        }
        const merged = mergeGeometries(flat, false)!;
        pieces.forEach((piece) => piece.dispose());
        flat.forEach((piece) => piece.dispose());
        return merged;
      };

      /** A stable string hash, so each part's scars are its own, forever. */
      const hashString = (text: string) => {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
        return h >>> 0;
      };

      /** A deterministic generator: the same seed always yields the same stone. */
      const mulberry = (seed: number) => {
        let state = seed >>> 0;
        return () => {
          state = (state * 1664525 + 1013904223) >>> 0;
          return state / 4294967296;
        };
      };

      /** A 3-D value noise whose lattice is seeded, so no two parts match. */
      const valueNoise = (seed: number) => {
        const hash = (x: number, y: number, z: number) => {
          const n =
            Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 1.6180339887) * 43758.5453;
          return n - Math.floor(n);
        };
        const fade = (t: number) => t * t * (3 - 2 * t);
        return (x: number, y: number, z: number) => {
          const xi = Math.floor(x);
          const yi = Math.floor(y);
          const zi = Math.floor(z);
          const tx = fade(x - xi);
          const ty = fade(y - yi);
          const tz = fade(z - zi);
          const mix = (a: number, b: number, t: number) => a + (b - a) * t;
          const corner = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
          const x00 = mix(corner(0, 0, 0), corner(1, 0, 0), tx);
          const x10 = mix(corner(0, 1, 0), corner(1, 1, 0), tx);
          const x01 = mix(corner(0, 0, 1), corner(1, 0, 1), tx);
          const x11 = mix(corner(0, 1, 1), corner(1, 1, 1), tx);
          return mix(mix(x00, x10, ty), mix(x01, x11, ty), tz);
        };
      };

      /**
       * Wear a stone three ways at once, each seed of its own:
       *
       *  — erosion, a slow smooth field that bows the faces;
       *  — the arrises, which wear hardest, because an edge is exposed twice;
       *  — and cracks, a few meandering grooves diced into the surface.
       *
       * Every part is keyed by its position and material, so no two blocks on
       * the site — or in the same wall, for that matter — carry the same scar.
       */
      const damage = (geometry: THREE_NS.BufferGeometry, amount: number, seed: number) => {
        const position = geometry.attributes["position"]!;
        const normal = geometry.attributes["normal"]!;
        geometry.computeBoundingBox();
        const size = geometry.boundingBox!.getSize(new THREE.Vector3());
        const n1 = valueNoise(seed);
        const n2 = valueNoise(seed ^ 0x9e3779b9);
        const rand = mulberry(seed ^ 0x51ed270b);
        // Each crack is a wandering groove: a point, a direction, a width and a
        // wobble. Their count varies per part, so a row of fallen drums never
        // all breaks the same way.
        const crackCount = 1 + Math.floor(rand() * 3);
        const cracks: {
          p: [number, number, number];
          d: [number, number, number];
          width: number;
          wobble: number;
        }[] = [];
        for (let c = 0; c < crackCount; c += 1) {
          const p: [number, number, number] = [
            (rand() - 0.5) * size.x,
            (rand() - 0.5) * size.y,
            (rand() - 0.5) * size.z,
          ];
          const d: [number, number, number] = [0, 0, 0];
          const axis = Math.floor(rand() * 3);
          d[axis] = 1;
          d[(axis + 1 + Math.floor(rand() * 2)) % 3] = (rand() - 0.5) * 2;
          const len = Math.hypot(d[0], d[1], d[2]);
          d[0] /= len;
          d[1] /= len;
          d[2] /= len;
          cracks.push({
            p,
            d,
            width: 0.02 + rand() * 0.045,
            wobble: 1 + rand() * 3.2,
          });
        }
        for (let i = 0; i < position.count; i += 1) {
          const x = position.getX(i);
          const y = position.getY(i);
          const z = position.getZ(i);
          // How near a corner this vertex sits, 0 in the middle of a face to 1
          // at an arris: the edges wear away, the middles only bulge.
          const edge =
            (Math.abs(x) / (size.x / 2 + 1e-6)) * 0.5 +
            (Math.abs(y) / (size.y / 2 + 1e-6)) * 0.25 +
            (Math.abs(z) / (size.z / 2 + 1e-6)) * 0.5;
          const erosion =
            (n1(x * 2.4, y * 2.4, z * 2.4) - 0.5) * 0.6 +
            (n2(x * 4.8, y * 4.8, z * 4.8) - 0.5) * 0.3;
          let carve = 0;
          for (const crack of cracks) {
            const px = x - crack.p[0];
            const py = y - crack.p[1];
            const pz = z - crack.p[2];
            const along = px * crack.d[0] + py * crack.d[1] + pz * crack.d[2];
            const qx = crack.p[0] + crack.d[0] * along;
            const qy = crack.p[1] + crack.d[1] * along;
            const qz = crack.p[2] + crack.d[2] * along;
            const dist = Math.hypot(x - qx, y - qy, z - qz);
            const groove = Math.exp(-(dist * dist) / (crack.width * crack.width));
            // The cut is not a straight knife-line: it pulses as it runs,
            // opening and closing the way a fracture really does.
            const pulse = 0.5 + 0.5 * Math.sin(along * crack.wobble + seed);
            carve -= groove * amount * pulse * 1.5;
          }
          const push = amount * erosion - amount * edge * 0.5 + carve * Math.max(0.2, amount * 6);
          position.setX(i, x + normal.getX(i) * push);
          position.setY(i, y + normal.getY(i) * push);
          position.setZ(i, z + normal.getZ(i) * push);
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();
      };

      /**
       * Scour a relief panel after it is cut: the stoneworker's chatter, the
       * chipped border and the slight dish of a panel that has stood upright
       * for two thousand years. This is real geometry — the photo height map
       * the carving wears is laid over it, so detail and age both show.
       */
      const scour = (geometry: THREE_NS.BufferGeometry, seed: number, amount: number) => {
        const position = geometry.attributes["position"]!;
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;
        const w = bbox.max.x - bbox.min.x;
        const h = bbox.max.y - bbox.min.y;
        const n1 = valueNoise(seed);
        const n2 = valueNoise(seed ^ 0x9e3779b9);
        for (let i = 0; i < position.count; i += 1) {
          const x = position.getX(i);
          const y = position.getY(i);
          const z = position.getZ(i);
          const chatter =
            (n1(x * 2.4, y * 2.4, seed * 0.001) - 0.5) * 0.9 +
            (n2(x * 6, y * 6, seed * 0.0014) - 0.5) * 0.45;
          const u = Math.abs(x) / (w / 2);
          const v = Math.abs(y) / (h / 2);
          // The border, within a couple of centimetres of the frame, is the
          // part that has been knocked about most: chips at the edges uncover
          // the dressing marks, so the frame reads as worn before anything in
          // it does.
          const border =
            Math.pow(Math.max(0, (u - 0.96) / 0.05), 2) +
            Math.pow(Math.max(0, (v - 0.96) / 0.05), 2);
          position.setZ(i, z + chatter * amount * 0.12 + border * amount * 0.1);
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();
      };

      const geometryFor = (part: Part): THREE_NS.BufferGeometry => {
        let geometry: THREE_NS.BufferGeometry;
        switch (part.kind) {
          case "box": {
            const [w, h, d] = part.size;
            if (part.weather) {
              /*
               * A weathered block: divided about every 12 cm and then pushed
               * about by noise, so its faces bow, its edges chip and it stops
               * being a box. The subdivision is capped — a wall of a hundred
               * stones has to stay a wall, not a sculpture competition.
               */
              const cuts = (metres: number) => Math.min(14, Math.max(3, Math.round(metres / 0.1)));
              geometry = new THREE.BoxGeometry(w, h, d, cuts(w), cuts(h), cuts(d));
              damage(
                geometry,
                part.weather,
                hashString(`${JSON.stringify(part.at)}|${part.material}|box`),
              );
            } else {
              geometry = new THREE.BoxGeometry(w, h, d);
            }
            geometry.translate(0, h / 2, 0);
            if (part.rotY) geometry.rotateY(part.rotY);
            break;
          }
          case "cylinder": {
            geometry = new THREE.CylinderGeometry(
              part.radiusTop,
              part.radiusBottom,
              part.height,
              part.segments,
              // A weathered cone is a hill, and a hill needs rings to bend.
              part.weather ? 8 : 1,
              false,
              part.thetaStart ?? 0,
              part.thetaLength ?? Math.PI * 2,
            );
            if (part.weather)
              damage(
                geometry,
                part.weather,
                hashString(`${JSON.stringify(part.at)}|${part.material}|cyl`),
              );
            if (part.flutes) {
              // Push every vertex in towards the axis by a cosine of its angle:
              // the troughs of that wave are the grooves down the shaft.
              const position = geometry.attributes["position"]!;
              const depth = 0.09;
              for (let i = 0; i < position.count; i += 1) {
                const x = position.getX(i);
                const z = position.getZ(i);
                const r = Math.hypot(x, z);
                if (r < 1e-6) continue;
                const angle = Math.atan2(z, x);
                const scale = 1 - depth * (0.5 + 0.5 * Math.cos(part.flutes * angle));
                position.setX(i, x * scale);
                position.setZ(i, z * scale);
              }
              position.needsUpdate = true;
              // Normals have to follow the grooves, or they catch no light.
              geometry.computeVertexNormals();
            }
            geometry.translate(0, part.height / 2, 0);
            // Tipping it over here, after it stands on its base, is what lets a
            // part place a horizontal drum by naming only where it starts.
            if (part.rotX) geometry.rotateX(part.rotX);
            if (part.rotY) geometry.rotateY(part.rotY);
            break;
          }
          case "ring": {
            geometry = shapeFor(part);
            break;
          }
          case "relief": {
            /*
             * Divided finely enough that the height map has something to push:
             * about a vertex every two centimetres, capped so that a long
             * frieze does not become a million triangles.
             */
            const [w, h] = part.size;
            /*
             * Fine enough for the carving to read, and denser than the
             * photograph beneath it so the relief never out-resolves the mesh:
             * at 64 divisions a metre, a 12 m panel works out to about 78k
             * triangles — heavy but still smooth, and the carvings are the
             * parts of a model people actually walk up to.
             */
            const grid = (metres: number) => Math.min(220, Math.max(40, Math.round(metres * 64)));
            geometry = new THREE.PlaneGeometry(w, h, grid(w), grid(h));
            // The panel is scoured before it is stood up: a wave of stoneworker's
            // chatter, a worn border and a dish that two thousand years of
            // standing have pushed out of flat. Geometry, not a texture, so it
            // holds up to a camera an inch from the face.
            scour(
              geometry,
              hashString(`${JSON.stringify(part.at)}|${part.material}|relief`),
              part.weather ?? 0.12,
            );
            geometry.translate(0, h / 2, 0);
            if (part.rotX) geometry.rotateX(part.rotX);
            if (part.rotY) geometry.rotateY(part.rotY);
            break;
          }
          case "prism": {
            const [w, h, d] = part.size;
            const triangle = new THREE.Shape();
            triangle.moveTo(-w / 2, 0);
            triangle.lineTo(w / 2, 0);
            triangle.lineTo(0, h);
            triangle.closePath();
            geometry = new THREE.ExtrudeGeometry(triangle, { depth: d, bevelEnabled: false });
            geometry.translate(0, 0, -d / 2);
            if (part.rotY) geometry.rotateY(part.rotY);
            break;
          }
          case "carving": {
            /*
             * The silhouette, extruded and bevelled so its edge takes a raking
             * light the way a chisel-cut edge does. It is drawn on the face
             * and then sunk a little into it, so the bevel runs into the stone
             * behind rather than leaving a hairline round the figure.
             */
            const shape = new THREE.Shape(part.outline.map(([u, v]) => new THREE.Vector2(u, v)));
            for (const hole of part.holes ?? []) {
              shape.holes.push(new THREE.Path(hole.map(([u, v]) => new THREE.Vector2(u, v))));
            }
            const bevel = Math.min(0.02, part.depth * 0.3);
            geometry = new THREE.ExtrudeGeometry(shape, {
              depth: part.depth,
              bevelEnabled: true,
              bevelThickness: bevel,
              bevelSize: bevel * 0.7,
              bevelSegments: 2,
              curveSegments: 4,
            });
            geometry.translate(0, 0, -part.depth * (part.sink ?? 0.4));
            if (part.rotZ) geometry.rotateZ(part.rotZ);
            if (part.rotY) geometry.rotateY(part.rotY);
            break;
          }
          case "loft": {
            geometry = loftGeometry(part.sections);
            if (part.rotY) geometry.rotateY(part.rotY);
            break;
          }
          default: {
            geometry = figureGeometry(part);
            if (part.rotY) geometry.rotateY(part.rotY);
            break;
          }
        }
        geometry.translate(part.at[0], part.at[1], part.at[2]);
        return geometry;
      };

      /**
       * `mergeGeometries` returns null rather than throwing when the list is
       * not uniform, and an indexed box next to a non-indexed extrusion is
       * exactly that. Everything is flattened first so the merge always holds.
       */
      const flatten = (geometry: THREE_NS.BufferGeometry) => {
        if (!geometry.index) return geometry;
        const flat = geometry.toNonIndexed();
        geometry.dispose();
        return flat;
      };

      /**
       * Re-cut the texture coordinates from world position instead of from the
       * shape's own surface.
       *
       * A box hands back 0-1 across every face whatever its size, so a stone
       * texture laid on those coordinates is fine grain on a 40 cm block and a
       * smear on a 40 m wall. Projecting from world position along whichever
       * axis a face points down means one texel is the same number of
       * centimetres everywhere in the model, which is the whole difference
       * between "textured" and "made of stone".
       */
      const TEXTURE_METRES = 1.6;
      const worldUVs = (geometry: THREE_NS.BufferGeometry, channel: "uv" | "uv1" = "uv") => {
        const position = geometry.attributes["position"];
        const normal = geometry.attributes["normal"];
        if (!position || !normal) return geometry;
        const uv = new Float32Array(position.count * 2);
        for (let i = 0; i < position.count; i += 1) {
          const x = position.getX(i);
          const y = position.getY(i);
          const z = position.getZ(i);
          const nx = Math.abs(normal.getX(i));
          const ny = Math.abs(normal.getY(i));
          const nz = Math.abs(normal.getZ(i));
          let u: number;
          let v: number;
          if (ny >= nx && ny >= nz) {
            u = x;
            v = z;
          } else if (nx >= nz) {
            u = z;
            v = y;
          } else {
            u = x;
            v = y;
          }
          uv[i * 2] = u / TEXTURE_METRES;
          uv[i * 2 + 1] = v / TEXTURE_METRES;
        }
        geometry.setAttribute(channel, new THREE.BufferAttribute(uv, 2));
        return geometry;
      };

      /**
       * One stone, painted once into three canvases that live and die together:
       * the colour, a normal map carved from the very same height, and an
       * ambient occlusion map that darkens its pits. Three layers of noise —
       * a coarse mottle for the patchiness of a quarried block, a medium grain
       * for the surface, a fine jitter for the tooth — plus veining where the
       * material is marble. Drawn here rather than downloaded because each
       * texture has to tile seamlessly, carry its own normal map and cost
       * nothing, and because the PBR detail is what keeps a marble column from
       * ceasing to be marble the moment the camera walks up to it.
       */
      type StoneSet = {
        map: THREE_NS.CanvasTexture;
        normal: THREE_NS.CanvasTexture;
        ao: THREE_NS.CanvasTexture;
      };
      const buildStone = (
        seed: number,
        tune: { coarse: number; medium: number; vein: number },
      ): StoneSet => {
        const size = 1024;
        const mapCanvas = document.createElement("canvas");
        const normalCanvas = document.createElement("canvas");
        const aoCanvas = document.createElement("canvas");
        for (const canvas of [mapCanvas, normalCanvas, aoCanvas]) {
          canvas.width = size;
          canvas.height = size;
        }
        const mapCtx = mapCanvas.getContext("2d")!;
        const normalCtx = normalCanvas.getContext("2d")!;
        const aoCtx = aoCanvas.getContext("2d")!;
        const image = mapCtx.createImageData(size, size);
        const normalImage = normalCtx.createImageData(size, size);
        const aoImage = aoCtx.createImageData(size, size);
        const random = (() => {
          let state = seed >>> 0;
          return () => {
            state = (state * 1664525 + 1013904223) >>> 0;
            return state / 4294967296;
          };
        })();
        const smooth = (t: number) => t * t * (3 - 2 * t);
        const coarseCells = tune.coarse;
        const coarseLattice: number[] = [];
        for (let i = 0; i < (coarseCells + 1) * (coarseCells + 1); i += 1)
          coarseLattice.push(random());
        const sampleCoarse = (x: number, y: number) => {
          const fx = (x / size) * coarseCells;
          const fy = (y / size) * coarseCells;
          const x0 = Math.floor(fx);
          const y0 = Math.floor(fy);
          const tx = smooth(fx - x0);
          const ty = smooth(fy - y0);
          const at = (cx: number, cy: number) =>
            coarseLattice[(cy % coarseCells) * (coarseCells + 1) + (cx % coarseCells)]!;
          return (
            (at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx) * (1 - ty) +
            (at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx) * ty
          );
        };
        const medCells = tune.medium;
        const medLattice: number[] = [];
        for (let i = 0; i < (medCells + 1) * (medCells + 1); i += 1) medLattice.push(random());
        const sampleMed = (x: number, y: number) => {
          const fx = (x / size) * medCells;
          const fy = (y / size) * medCells;
          const x0 = Math.floor(fx);
          const y0 = Math.floor(fy);
          const tx = smooth(fx - x0);
          const ty = smooth(fy - y0);
          const at = (cx: number, cy: number) =>
            medLattice[(cy % medCells) * (medCells + 1) + (cx % medCells)]!;
          return (
            (at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx) * (1 - ty) +
            (at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx) * ty
          );
        };
        const values = new Float32Array(size * size);
        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            const mottle = sampleCoarse(x, y);
            const grain2 = sampleMed(x, y);
            const jitter = random();
            // Veining: faint diagonal streaks. The sine makes the streak, the
            // mottle modulates its strength so veins do not cross every block.
            const vein =
              Math.sin((x * 0.008 + y * 0.012 + mottle * 6) * 2.5) *
              (0.5 + 0.5 * Math.sin((x * 0.003 - y * 0.005 + grain2 * 4) * 5)) *
              tune.vein *
              mottle;
            const value =
              214 + (mottle - 0.5) * 24 + (grain2 - 0.5) * 14 + (jitter - 0.5) * 12 + vein * 28;
            values[y * size + x] = value;
            const index = (y * size + x) * 4;
            image.data[index] = value;
            image.data[index + 1] = value - 1;
            image.data[index + 2] = value - 5;
            image.data[index + 3] = 255;
          }
        }
        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            const at = (xx: number, yy: number) =>
              values[((yy + size) % size) * size + ((xx + size) % size)]!;
            const v = at(x, y);
            // The gradient of the same height that made the colour, turned into
            // a tangent-space normal: the tooth of the stone, not a flat map.
            const dzx = at(x + 1, y) - at(x - 1, y);
            const dzy = at(x, y + 1) - at(x, y - 1);
            const scale = 255 / 70;
            const r = Math.max(0, Math.min(255, 128 - dzx * scale));
            const g = Math.max(0, Math.min(255, 128 + dzy * scale));
            const ni = (y * size + x) * 4;
            normalImage.data[ni] = r;
            normalImage.data[ni + 1] = g;
            normalImage.data[ni + 2] = 255;
            normalImage.data[ni + 3] = 255;
            // Ambient occlusion: wherever this height sits below its three
            // neighbours, light cannot reach it — a pit, a seam, a chip — so
            // those are the places that go dark.
            let tallest = 0;
            for (let yy = -1; yy <= 1; yy += 1)
              for (let xx = -1; xx <= 1; xx += 1) tallest = Math.max(tallest, at(x + xx, y + yy));
            const pit = Math.max(0, tallest - v);
            const ao = Math.max(0.62, 1 - pit * 0.055);
            const ai = (y * size + x) * 4;
            const aov = ao * 255;
            aoImage.data[ai] = aov;
            aoImage.data[ai + 1] = aov;
            aoImage.data[ai + 2] = aov;
            aoImage.data[ai + 3] = 255;
          }
        }
        mapCtx.putImageData(image, 0, 0);
        normalCtx.putImageData(normalImage, 0, 0);
        aoCtx.putImageData(aoImage, 0, 0);
        const wrap = (texture: THREE_NS.CanvasTexture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          return texture;
        };
        const map = wrap(new THREE.CanvasTexture(mapCanvas));
        map.colorSpace = THREE.SRGBColorSpace;
        const normal = wrap(new THREE.CanvasTexture(normalCanvas));
        normal.colorSpace = THREE.NoColorSpace;
        const ao = wrap(new THREE.CanvasTexture(aoCanvas));
        ao.colorSpace = THREE.NoColorSpace;
        return { map, normal, ao };
      };
      // Marble: fine crystalline grain, and the veins that give it away.
      const stoneSet = buildStone(20260907, { coarse: 8, medium: 24, vein: 0.06 });
      // Limestone and block stone: coarser, yellower patchiness, no veins.
      const blockSet = buildStone(48712347, { coarse: 12, medium: 30, vein: 0 });
      // The name the rest of this file still talks in: the marble surface.
      const stoneTexture = stoneSet.map;

      /*
       * Parts that carry a photograph of their carving cannot join the merge:
       * a merged mesh has one material, and these each need their own map.
       * There are a handful of them per model, so they cost a handful of draw
       * calls — and they are the only places the real stone shows through.
       */
      let scaleFigure: THREE_NS.Mesh | null = null;
      const materialsOwned: THREE_NS.MeshStandardMaterial[] = [];
      const geometriesOwned: THREE_NS.BufferGeometry[] = [];
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      const textures: THREE_NS.Texture[] = [
        stoneSet.map,
        stoneSet.normal,
        stoneSet.ao,
        blockSet.map,
        blockSet.normal,
        blockSet.ao,
      ];
      // A part with a scan is drawn from the scan, further down, not from its
      // own primitive — though its bounds above still frame the camera.
      const carved = parts.filter((part) => part.carving && !part.scan);
      for (const part of carved) {
        const carving = part.carving!;
        const geometry = flatten(geometryFor(part));
        const palette = MATERIALS[part.material];
        const asDepth = carving.blend === "depth";
        /*
         * A carving shown as depth needs two sets of texture coordinates at
         * once: the panel's own 0-1 for the height map that cuts the relief,
         * and world-space ones for the stone grain laid over it. They go in
         * separate channels — `uv` for the carving, `uv1` for the stone.
         */
        let grain: THREE_NS.Texture | null = null;
        if (asDepth) {
          worldUVs(geometry, "uv1");
          grain = stoneTexture.clone();
          grain.channel = 1;
          grain.needsUpdate = true;
          textures.push(grain);
        }
        const material = new THREE.MeshStandardMaterial({
          // Carving in stone keeps the stone's own colour and grain; a fresco
          // or a mosaic is the picture, so it goes on white and unmodified.
          color: asDepth ? palette.color : 0xffffff,
          roughness: palette.roughness,
          metalness: 0,
          ...(grain ? { map: grain, roughnessMap: grain } : {}),
          ...(palette.sheen
            ? {
                sheen: palette.sheen,
                sheenRoughness: palette.sheenRoughness ?? 0.4,
                sheenColor: new THREE.Color(palette.sheenColor ?? 0xffffff),
              }
            : {}),
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        materialsOwned.push(material);
        geometriesOwned.push(geometry);
        loader.load(
          carving.url,
          (texture) => {
            if (disposed) return;
            texture.colorSpace = THREE.SRGBColorSpace;
            if (carving.repeat) {
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
              texture.repeat.set(carving.repeat[0], carving.repeat[1]);
            }
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            // Only a colour carving puts the photograph on the surface. A depth
            // one has already had the stone laid on it, and uses the photo for
            // nothing but height.
            if (!asDepth) material.map = texture;
            if (carving.relief && part.kind === "relief") {
              /*
               * The same photograph again, this time as height. It has to be a
               * second texture object because the displacement is sampled in
               * linear space, not sRGB — sharing one would either wash out the
               * colour or flatten the carving.
               */
              const height = texture.clone();
              height.colorSpace = THREE.NoColorSpace;
              height.needsUpdate = true;
              material.displacementMap = height;
              material.displacementScale = carving.relief;
              // Sink the panel so the carving comes out of the stone rather
              // than floating in front of it.
              material.displacementBias = -carving.relief * 0.45;
              textures.push(height);
            }
            material.needsUpdate = true;
            textures.push(texture);
          },
          undefined,
          // A blocked or missing photo leaves plain stone, which is the right
          // fallback: the model is still the model.
          () => {},
        );
      }

      /**
       * Everything of one material becomes one mesh. The building goes into
       * the scene; the props of its life go into their own group, so they can
       * be hidden with the people without rebuilding anything.
       */
      const addMerged = (source: Part[], parent: THREE_NS.Object3D) => {
        const byMaterial = new Map<Material, THREE_NS.BufferGeometry[]>();
        for (const part of source) {
          if (part.carving || part.scan) continue;
          const list = byMaterial.get(part.material) ?? [];
          list.push(flatten(geometryFor(part)));
          byMaterial.set(part.material, list);
        }

        for (const [name, list] of byMaterial) {
          /*
           * A painted statue carries a colour per vertex, and a merge only holds
           * when every geometry in it has the same attributes — so once one of
           * them is painted, every other piece of that stone is given plain
           * white, which leaves its colour exactly as it was.
           */
          /*
           * And stone is never one colour. Every block was quarried from its
           * own bed and has weathered its own way, so each piece of masonry
           * is given a tint of its own — a little lighter or darker, a little
           * warmer or cooler. A wall of identical blocks is the surest sign
           * of a computer; a wall of slightly different ones reads as built.
           */
          const masonry = ![
            "shadow",
            "human",
            "paintRed",
            "paintBlue",
            "paintGold",
            "bronze",
            "foliage",
            "linen",
          ].includes(name);
          const painted = masonry || list.some((geometry) => geometry.getAttribute("color"));
          if (painted) {
            let n = 0;
            for (const geometry of list) {
              n += 1;
              if (geometry.getAttribute("color")) continue;
              const count = geometry.attributes["position"]!.count;
              const colours = new Float32Array(count * 3);
              let r = 1;
              let gr = 1;
              let bl = 1;
              if (masonry) {
                const k = hashString(`${name}|${n}`);
                const shade = 0.9 + ((k & 255) / 255) * 0.16;
                const warm = (((k >> 8) & 255) / 255 - 0.5) * 0.05;
                r = shade + warm;
                gr = shade;
                bl = shade - warm;
              }
              for (let i = 0; i < count; i += 1) {
                colours[i * 3] = r;
                colours[i * 3 + 1] = gr;
                colours[i * 3 + 2] = bl;
              }
              geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
            }
          }
          // Normals come from the primitives themselves and survive the merge;
          // recomputing them here would flat-shade every column.
          const merged = list.length === 1 ? list[0]! : mergeGeometries(list, false);
          if (!merged) continue;
          if (list.length > 1) list.forEach((geometry) => geometry.dispose());
          worldUVs(merged);
          // The ambient occlusion map is read from the second UV channel, so the
          // same world-projected coordinates are duplicated there for it.
          const uv = merged.getAttribute("uv");
          if (uv) merged.setAttribute("uv1", uv.clone());
          const palette = MATERIALS[name];
          const isStone = !["shadow", "human", "linen", "foliage", "papyrus", "hide"].includes(
            name,
          );
          const stone =
            name === "marble" ||
            name === "marbleWorn" ||
            name === "pavonazzetto" ||
            name === "gialloAntico" ||
            name === "granite"
              ? stoneSet
              : blockSet;
          /*
           * MeshPhysicalMaterial over MeshStandardMaterial on purpose: the palette
           * files a thin clearcoat layer onto Roman marble (see `Palette`), and
           * only the physical material actually renders it — its `clearcoat`
           * term is the tight, bright highlight that polish puts back on the
           * stone. Standard material would silently drop it and leave every
           * façade reading as matte plaster, which is a reconstruction that never
           * happened (Roman façades were polished, the Celsus front famously so).
           */
          const material = new THREE.MeshPhysicalMaterial({
            color: palette.color,
            roughness: palette.roughness,
            metalness: palette.metalness,
            // The same grain on everything, tinted by each material's own colour
            // and roughened by it too, so marble reads polished and limestone
            // does not. The PBR channels are baked from the very same height, so
            // grain, shine and shadow agree about where every pit is.
            map: isStone ? stone.map : null,
            roughnessMap: isStone ? stone.map : null,
            normalMap: isStone ? stone.normal : null,
            aoMap: isStone ? stone.ao : null,
            aoMapIntensity: isStone ? 0.75 : 1,
            ...(palette.sheen
              ? {
                  sheen: palette.sheen,
                  sheenRoughness: palette.sheenRoughness ?? 0.4,
                  sheenColor: new THREE.Color(palette.sheenColor ?? 0xffffff),
                }
              : {}),
            // The polish layer, if the palette declared one. Kept just off a
            // mirror so the carving still reads as carved rather than as glass.
            ...(palette.clearcoat !== undefined
              ? {
                  clearcoat: palette.clearcoat,
                  clearcoatRoughness: palette.clearcoatRoughness ?? 0.35,
                }
              : {}),
          });
          if (painted) material.vertexColors = true;
          /*
           * Paint, shadowed openings and dark trim are laid on a surface, often
           * flush with it: a band of colour on a frieze, a door's dark void in
           * a wall. Two faces in one plane fight over every pixel and shimmer
           * as the camera moves, so these are drawn a hair in front.
           */
          const DECALS = ["paintRed", "paintBlue", "paintGold", "shadow", "stoneDark", "timber"];
          if (DECALS.includes(name)) {
            material.polygonOffset = true;
            material.polygonOffsetFactor = -1;
            material.polygonOffsetUnits = -2 - DECALS.indexOf(name) * 0.5;
          }
          const mesh = new THREE.Mesh(merged, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          parent.add(mesh);
          // The scale figure is a teaching device, not a find. It goes when the
          // labels go, which is what leaves the clean archaeological view.
          if (name === "human") scaleFigure = mesh;
          materialsOwned.push(material);
          geometriesOwned.push(merged);
        }
      };
      addMerged(parts, scene);

      /*
       * The life of the place: its furniture merged like the building, its
       * people and fires animated. All of it in one group, so the switch in
       * the viewer only has to hide that group.
       */
      const lifeGroup = new THREE.Group();
      lifeGroup.name = "life";
      scene.add(lifeGroup);
      let lifeHandle: LifeHandle | null = null;
      if (life) {
        addMerged(life.props, lifeGroup);
        lifeHandle = buildLife(THREE, life);
        lifeGroup.add(lifeHandle.group);
      }
      lifeGroup.visible = showLifeRef.current;
      // How much the fires light the scene: a little by day, fully at night.
      let glowTarget = atmos === "night" ? 1 : atmos === "golden" ? 0.45 : 0.08;
      let glow = glowTarget;

      // A wide apron under everything, so the model does not float in a void.
      const apron = new THREE.CircleGeometry(span * 2.2, 64);
      apron.rotateX(-Math.PI / 2);
      apron.translate(centre.x, bounds.min[1] - 0.06, centre.z);
      const groundTexture = blockSet.map.clone();
      groundTexture.needsUpdate = true;
      groundTexture.repeat.set(span / 3, span / 3);
      textures.push(groundTexture);
      const apronMaterial = new THREE.MeshStandardMaterial({
        roughness: 1,
        metalness: 0,
        map: groundTexture,
      });
      const apronMesh = new THREE.Mesh(apron, apronMaterial);
      apronMesh.receiveShadow = true;
      scene.add(apronMesh);

      const landscape = buildLandscape(THREE, {
        centre,
        span,
        groundY: bounds.min[1] - 0.06,
        footprint: Math.hypot(
          (bounds.max[0] - bounds.min[0]) / 2,
          (bounds.max[2] - bounds.min[2]) / 2,
        ),
        biome,
      });
      scene.add(landscape.group);

      /*
       * The scans. Each file is fetched once, however many parts use it (the
       * Mausoleum's frieze uses two files fifty times), and every use is a
       * clone sharing the file's geometry and textures. They arrive after the
       * rest of the model, so the building appears at once and its carvings
       * a moment later.
       */
      const scanGroup = new THREE.Group();
      scanGroup.name = "scans";
      scene.add(scanGroup);
      // The statues of the scene's life stand in their scans too, in the life
      // group, so they come and go with the rest of it.
      const placed = [
        ...parts.filter((part) => part.scan).map((part) => ({ part, into: scanGroup })),
        ...(life?.props ?? [])
          .filter((part) => part.scan)
          .map((part) => ({ part, into: lifeGroup })),
      ];
      const scanned = placed.map(({ part }) => part);
      const scanResources: { dispose: () => void }[] = [];
      if (scanned.length > 0) {
        void (async () => {
          const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
            import("three/addons/loaders/GLTFLoader.js"),
            import("three/addons/libs/meshopt_decoder.module.js"),
          ]);
          if (disposed) return;
          const gltfLoader = new GLTFLoader();
          gltfLoader.setMeshoptDecoder(MeshoptDecoder);
          const ids = [...new Set(scanned.map((part) => part.scan!.id))];
          const loaded = new Map<string, THREE_NS.Object3D>();
          await Promise.all(
            ids.map(async (id) => {
              try {
                const gltf = await gltfLoader.loadAsync(SCANS[id].url);
                loaded.set(id, gltf.scene);
              } catch {
                /* a missing scan leaves a gap, not a broken model */
              }
            }),
          );
          if (disposed) return;
          for (const [id, root] of loaded) {
            root.traverse((object) => {
              const mesh = object as THREE_NS.Mesh;
              if (!mesh.isMesh) return;
              // A scan is a thin shell of surface: let it cast a shadow, but
              // not receive its own, which on a shell is acne all over.
              mesh.castShadow = true;
              mesh.receiveShadow = false;
              // The free-archive scans come as bare surface, without normals.
              if (!mesh.geometry.attributes["normal"]) mesh.geometry.computeVertexNormals();
              scanResources.push(mesh.geometry);
              const original = mesh.material as THREE_NS.MeshStandardMaterial;
              // A scan's own texture already holds the light it was
              // photographed in; it should take this scene's light, not shine.
              // An untextured scan (a plaster cast) takes the model's marble.
              const palette = MATERIALS.marble;
              const material = new THREE.MeshStandardMaterial({
                map: original.map ?? null,
                side: THREE.DoubleSide,
                color: original.map ? 0xffffff : palette.color,
                roughness: 0.82,
                metalness: 0,
                envMapIntensity: 0.9,
                // A photographed texture under a second, simulated light reads
                // too dark in shade; a little of it is let glow through.
                ...(original.map ? { emissiveMap: original.map, emissive: 0x3a3a3a } : {}),
              });
              if (original.map) scanResources.push(original.map);
              original.dispose();
              mesh.material = material;
              scanResources.push(material);
            });
            void id;
          }
          const tintedScans = new Map<string, THREE_NS.MeshStandardMaterial>();
          for (const { part, into } of placed) {
            const fit = part.scan!;
            const root = loaded.get(fit.id);
            if (!root) continue;
            const box3 = new THREE.Box3().setFromObject(root);
            const size = box3.getSize(new THREE.Vector3());
            const holder = new THREE.Group();
            holder.name = `scan:${fit.id}`;
            const copy = root.clone(true);
            /*
             * A scan takes the stone of the part it stands in for: the lions at
             * Nemrut are the limestone of the terrace, not a white cast set
             * down among them.
             */
            if (part.material !== "marble") {
              copy.traverse((object) => {
                const mesh = object as THREE_NS.Mesh;
                if (!mesh.isMesh) return;
                const base = mesh.material as THREE_NS.MeshStandardMaterial;
                if (base.map) return;
                const key = `${fit.id}|${part.material}`;
                let tinted = tintedScans.get(key);
                if (!tinted) {
                  tinted = base.clone();
                  tinted.color.set(MATERIALS[part.material].color);
                  tintedScans.set(key, tinted);
                  scanResources.push(tinted);
                }
                mesh.material = tinted;
              });
            }
            copy.rotation.y = SCANS[fit.id].facing ?? 0;
            holder.add(copy);
            let scale = 1;
            if (fit.centre && fit.diameter) {
              // A drum: its own width matched to the column, round its axis.
              scale = fit.diameter / Math.max(size.x, size.z);
              holder.position.set(...fit.centre);
              holder.rotation.y = part.kind === "relief" ? part.rotY : 0;
            } else if (part.kind === "figure") {
              scale = part.height / size.y;
              holder.position.set(...part.at);
              holder.rotation.y = part.rotY;
            } else if (part.kind === "relief") {
              const [w, h] = part.size;
              scale = Math.min(w / size.x, h / size.y);
              // The panel's back sits on the face it is carved into.
              holder.rotation.y = part.rotY;
              const out = new THREE.Vector3(0, 0, 1).applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                part.rotY,
              );
              holder.position
                .set(...part.at)
                .addScaledVector(out, (size.z * scale) / 2 - 0.04)
                .add(new THREE.Vector3(0, (h - size.y * scale) / 2, 0));
            } else {
              continue;
            }
            holder.scale.setScalar(scale);
            into.add(holder);
          }
        })();
      }

      /* ---- light, camera ---- */

      const hemisphere = new THREE.HemisphereLight(0xffffff, 0x8d8264, 1.1);
      scene.add(hemisphere);
      const sun = new THREE.DirectionalLight(0xfff3e0, 2.2);
      sun.position.set(centre.x + span * 0.65, bounds.min[1] + span * 1.15, centre.z - span * 0.55);
      sun.target.position.copy(centre);
      sun.castShadow = true;
      // A phone's GPU pays four times over for a 2048 map; 1024 still keeps
      // the colonnade shadows readable at the distances a phone is held.
      const shadowSize = window.matchMedia("(pointer: coarse)").matches ? 1024 : 2048;
      sun.shadow.mapSize.set(shadowSize, shadowSize);
      sun.shadow.bias = -0.0006;
      sun.shadow.radius = 2.5;
      const shadowSpan = span * 0.85;
      /*
       * Each texel of the shadow map covers more ground on a 140 m theatre
       * than on a 20 m tomb. A bias smaller than a texel leaves the long
       * curved seat rows striped with their own shadow ("acne"), stripes that
       * crawl as the camera zooms; the bias is sized to the texel instead.
       */
      sun.shadow.normalBias = Math.max(0.03, ((shadowSpan * 2) / shadowSize) * 1.4);
      sun.shadow.camera.left = -shadowSpan;
      sun.shadow.camera.right = shadowSpan;
      sun.shadow.camera.top = shadowSpan;
      sun.shadow.camera.bottom = -shadowSpan;
      sun.shadow.camera.near = 1;
      sun.shadow.camera.far = span * 4;
      scene.add(sun);
      scene.add(sun.target);
      const fill = new THREE.DirectionalLight(0xdce8ff, 0.5);
      fill.position.set(centre.x - span, centre.y + span * 0.5, centre.z + span);
      scene.add(fill);

      const aspect = Math.max(0.5, (host.clientWidth || 16) / (host.clientHeight || 9));
      const camera = new THREE.PerspectiveCamera(45, aspect, 0.5, span * 12);
      // A building is read from a little below its middle, not from its middle.
      const target = new THREE.Vector3(
        centre.x,
        bounds.min[1] + (centre.y - bounds.min[1]) * 0.75,
        centre.z,
      );
      const direction = new THREE.Vector3(...VIEWPOINT[kind]).normalize();

      /*
       * Fitting the frame arithmetically kept getting it wrong in one direction
       * or the other — a bounding sphere pushes a 120 m temple twice as far
       * back as it needs, and fitting the height alone puts the camera inside
       * a façade. So the fit is measured instead of derived: start far enough
       * out that the whole model is certainly in front of the camera, project
       * the eight corners of its bounding box, and close in until the widest
       * corner sits just inside the edge of the frame.
       */
      const corners: THREE_NS.Vector3[] = [];
      for (const x of [bounds.min[0], bounds.max[0]]) {
        for (const y of [bounds.min[1], bounds.max[1]]) {
          for (const z of [bounds.min[2], bounds.max[2]]) {
            corners.push(new THREE.Vector3(x, y, z));
          }
        }
      }
      const FILL = 0.92;
      let distance = span * 2.5;
      for (let pass = 0; pass < 16; pass += 1) {
        camera.position.copy(target).addScaledVector(direction, distance);
        camera.lookAt(target);
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        let extent = 0;
        for (const corner of corners) {
          const projected = corner.clone().project(camera);
          extent = Math.max(extent, Math.abs(projected.x), Math.abs(projected.y));
        }
        if (extent <= 0) break;
        const scale = extent / FILL;
        distance *= scale;
        if (Math.abs(scale - 1) < 0.01) break;
      }
      const home = target.clone().addScaledVector(direction, distance);
      camera.position.copy(home);

      // Phones draw at up to 3x; past 1.5x the difference is invisible on a
      // small screen and the fill cost is not.
      const touch = window.matchMedia("(pointer: coarse)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, touch ? 1.5 : 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "none";
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.setAttribute("aria-label", label);
      host.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.copy(target);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.autoRotateSpeed = 0.55;
      controls.minDistance = span * 0.18;
      controls.maxDistance = span * 2.6;
      // Never let the camera go under the ground the building stands on.
      controls.maxPolarAngle = Math.PI * 0.495;
      controls.update();
      if (import.meta.env.DEV) {
        // A handle for the headless visual checks, so a test can walk the
        // camera up to a statue instead of guessing at wheel events.
        (window as unknown as { __recon?: unknown }).__recon = {
          camera,
          controls,
          target,
          span,
          scene,
        };
      }

      /**
       * The sky, as a gradient rather than a flat fill: pale at the horizon and
       * deeper overhead, which is what makes a model read as standing outdoors
       * instead of being pasted onto a colour swatch. Painted into a strip and
       * wrapped round the scene, then repainted in place as its colours ease
       * between one time of day and the next — so changing the light is a dusk
       * the scene passes through, not a hard cut.
       */
      const skyCanvas = document.createElement("canvas");
      skyCanvas.width = 4;
      skyCanvas.height = 256;
      const sky = new THREE.CanvasTexture(skyCanvas);
      sky.mapping = THREE.EquirectangularReflectionMapping;
      sky.colorSpace = THREE.SRGBColorSpace;
      const repaintSky = (top: THREE_NS.Color, horizon: THREE_NS.Color) => {
        const ctx = skyCanvas.getContext("2d")!;
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, `#${top.getHexString()}`);
        gradient.addColorStop(0.62, `#${horizon.getHexString()}`);
        gradient.addColorStop(1, `#${horizon.getHexString()}`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 4, 256);
        sky.needsUpdate = true;
      };
      scene.background = sky;
      /*
       * The same sky, used as the light that metal reflects. Without it a
       * bronze horse renders black: a metal in a physically based renderer
       * has almost no colour of its own, it only shows what is around it,
       * and what was around it was nothing.
       */
      scene.environment = sky;
      const fog = new THREE.Fog(0xdfe6ec, span * 1.8, span * 5.5);
      scene.fog = fog;

      /*
       * The night sky's stars: points scattered over the upper hemisphere and
       * well beyond the fog, gone by day. They fade in as the palette does and
       * add over the dark sky, so moonlight leaves them pin-sharp.
       */
      const starCount = 700;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i += 1) {
        let x = 0;
        let y = 0;
        let z = 0;
        let len = 0;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          z = Math.random() * 2 - 1;
          len = Math.hypot(x, y, z);
          // Only the upper hemisphere; a sky half-full of stars below the
          // ground sits under the model and reads as noise, not as night.
        } while (len > 1 || y / len < 0.08);
        const r = span * 7;
        starPositions[i * 3] = centre.x + (x / len) * r;
        starPositions[i * 3 + 1] = centre.y * 0.2 + (y / len) * r;
        starPositions[i * 3 + 2] = centre.z + (z / len) * r;
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({
        color: 0xfff2d8,
        size: Math.max(0.5, span * 0.018),
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
        blending: THREE.AdditiveBlending,
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      /*
       * Clouds, and the birds that work them: a few flattened puffs drifting
       * round the model and a small flock circling over the seating. Both fade
       * out at night — the scene is to be lit, not decorated — and both are
       * built from the measured building's own scale, so a stadium seats birds
       * in proportion the way it seats its audience.
       */
      const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.6,
      });
      const cloudPuff = new THREE.SphereGeometry(1, 12, 9);
      const clouds: {
        group: THREE_NS.Group;
        radius: number;
        speed: number;
        phase: number;
        altitude: number;
      }[] = [];
      for (let c = 0; c < 5; c += 1) {
        const group = new THREE.Group();
        const puffs = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < puffs; i += 1) {
          const puff = new THREE.Mesh(cloudPuff, cloudMaterial);
          const s = span * (0.045 + Math.random() * 0.05);
          puff.scale.set(s * 1.9, s * 0.5, s);
          puff.position.set(
            (Math.random() - 0.5) * s * 2.4,
            (Math.random() - 0.5) * s * 0.9,
            (Math.random() - 0.5) * s * 1.6,
          );
          group.add(puff);
        }
        scene.add(group);
        clouds.push({
          group,
          radius: span * (0.7 + Math.random() * 0.5),
          speed: 0.01 + Math.random() * 0.015,
          phase: Math.random() * Math.PI * 2,
          altitude: centre.y + span * (0.85 + Math.random() * 0.4),
        });
      }

      // A gull in plan, flattened; the flapping is a roll about the body axis.
      const birdShape = new THREE.Shape();
      birdShape.moveTo(-1.15, -0.06);
      birdShape.lineTo(-1.02, 0);
      birdShape.lineTo(-0.3, 0.09);
      birdShape.lineTo(0, 0.34);
      birdShape.lineTo(0.3, 0.09);
      birdShape.lineTo(1.02, 0);
      birdShape.lineTo(1.15, -0.06);
      birdShape.lineTo(0.34, 0.1);
      birdShape.lineTo(0, -0.28);
      birdShape.lineTo(-0.34, 0.1);
      birdShape.closePath();
      const birdGeometry = new THREE.ShapeGeometry(birdShape);
      birdGeometry.rotateX(-Math.PI / 2);
      const birdMaterial = new THREE.MeshStandardMaterial({
        color: 0x20242c,
        roughness: 0.9,
        metalness: 0,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
      });
      const flock: {
        group: THREE_NS.Group;
        wings: THREE_NS.Mesh;
        radius: number;
        speed: number;
        phase: number;
        altitude: number;
        flap: number;
      }[] = [];
      for (let b = 0; b < 9; b += 1) {
        const group = new THREE.Group();
        const wings = new THREE.Mesh(birdGeometry, birdMaterial);
        wings.scale.setScalar(span * (0.016 + Math.random() * 0.018));
        group.add(wings);
        scene.add(group);
        flock.push({
          group,
          wings,
          radius: span * (0.3 + Math.random() * 0.5),
          speed: 0.15 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2,
          altitude: centre.y + span * (0.3 + Math.random() * 0.45),
          flap: 5 + Math.random() * 5,
        });
      }

      /**
       * The atmosphere in numbers: what the lights, sky and life are *aiming*
       * at (its palette) and what they currently are (live). The loop eases
       * live towards its target every frame — about a two-second crossfade —
       * and then pushes the live values out to the scene.
       */
      const makeLive = (p: AtmosPalette): LiveAtmos => ({
        skyTop: new THREE.Color(p.sky.top),
        skyHorizon: new THREE.Color(p.sky.horizon),
        fog: new THREE.Color(p.fog),
        ground: new THREE.Color(p.ground),
        hemiSky: new THREE.Color(p.hemiSky),
        hemiGround: new THREE.Color(p.hemiGround),
        hemiIntensity: p.hemiIntensity,
        sunColor: new THREE.Color(p.sunColor),
        sunIntensity: p.sunIntensity,
        fillColor: new THREE.Color(p.fillColor),
        fillIntensity: p.fillIntensity,
        starOpacity: p.starOpacity,
        cloudOpacity: p.cloudOpacity,
        cloudColor: new THREE.Color(p.cloudColor),
        birdOpacity: p.birdOpacity,
        exposure: p.exposure,
      });

      const liveAtmos = makeLive(paletteFor(theme, atmos));
      let atmosTarget = liveAtmos;

      const applyLive = () => {
        hemisphere.color.set(liveAtmos.hemiSky);
        hemisphere.groundColor.set(liveAtmos.hemiGround);
        hemisphere.intensity = liveAtmos.hemiIntensity;
        sun.color.set(liveAtmos.sunColor);
        sun.intensity = liveAtmos.sunIntensity;
        fill.color.set(liveAtmos.fillColor);
        fill.intensity = liveAtmos.fillIntensity;
        fog.color.set(liveAtmos.fog);
        apronMaterial.color.set(liveAtmos.ground);
        renderer.toneMappingExposure = liveAtmos.exposure;
        starMaterial.opacity = liveAtmos.starOpacity;
        cloudMaterial.color.set(liveAtmos.cloudColor);
        cloudMaterial.opacity = liveAtmos.cloudOpacity;
        birdMaterial.opacity = liveAtmos.birdOpacity;
      };

      // The canvas repaints only when its colours actually moved, so a settled
      // scene stops rerendering the sky entirely.
      let lastSky: [number, number] = [-1, -1];
      const repaintSkyIfChanged = () => {
        const top = liveAtmos.skyTop.getHex();
        const horizon = liveAtmos.skyHorizon.getHex();
        if (top === lastSky[0] && horizon === lastSky[1]) return;
        lastSky = [top, horizon];
        repaintSky(liveAtmos.skyTop, liveAtmos.skyHorizon);
      };

      // The decorations are the model's surroundings, not the model. They drop
      // out of a model export the way they would drop out of a section drawing.
      const decorations = [
        lifeGroup,
        stars,
        landscape.group,
        ...clouds.map((c) => c.group),
        ...flock.map((f) => f.group),
      ];
      applyLive();
      repaintSkyIfChanged();

      // Declared ahead of `resize`, which reaches for it; filled in further down.
      let composer: {
        render: () => void;
        setSize: (w: number, h: number) => void;
        dispose: () => void;
      } | null = null;
      let qualityOn = false;
      const resize = () => {
        const { clientWidth, clientHeight } = host;
        if (!clientWidth || !clientHeight) return;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight, false);
        composer?.setSize(clientWidth, clientHeight);
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(host);

      /* ---- the labels on the model ---- */

      /*
       * Each label is an HTML pin sitting over the canvas, moved every frame to
       * wherever its point in the model has ended up on screen. Drawing them in
       * the DOM rather than in the scene keeps the type crisp at any distance
       * and lets them be clicked, which is what makes them teach rather than
       * decorate.
       */
      const layer = document.createElement("div");
      layer.style.cssText =
        "position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1";
      host.appendChild(layer);

      let pins: { element: HTMLButtonElement; point: THREE_NS.Vector3 }[] = [];
      const projected = new THREE.Vector3();

      const buildPins = (list: SceneLabel[], active: number | null) => {
        pins.forEach((pin) => pin.element.remove());
        pins = list.map((item, index) => {
          const element = document.createElement("button");
          element.type = "button";
          element.textContent = item.text;
          element.style.cssText = [
            "position:absolute",
            "left:0",
            "top:0",
            "pointer-events:auto",
            "cursor:pointer",
            "white-space:nowrap",
            "font:600 12px/1.1 system-ui,sans-serif",
            "padding:5px 9px 5px 20px",
            "border-radius:999px",
            "border:1px solid rgba(0,0,0,.14)",
            "backdrop-filter:blur(4px)",
            "transition:background-color .15s,color .15s",
          ].join(";");
          element.addEventListener("click", () => pickRef.current(index));
          // The dot that marks the actual point, drawn as the button's own
          // leading edge so pin and label can never drift apart.
          const dot = document.createElement("span");
          dot.style.cssText =
            "position:absolute;left:7px;top:50%;width:7px;height:7px;margin-top:-3.5px;border-radius:50%;background:currentColor";
          element.appendChild(dot);
          layer.appendChild(element);
          const pin = { element, point: new THREE.Vector3(...item.at) };
          styleLabel(element, index === active);
          return pin;
        });
      };

      function styleLabel(element: HTMLButtonElement, active: boolean) {
        element.style.background = active ? "#b45309" : "rgba(255,255,255,.88)";
        element.style.color = active ? "#fff" : "#1c1917";
        element.style.boxShadow = active
          ? "0 2px 10px rgba(180,83,9,.45)"
          : "0 1px 4px rgba(0,0,0,.25)";
      }

      let labelsVisible = showLabels;
      const placePins = () => {
        if (!pins.length) return;
        const width = host.clientWidth;
        const height2 = host.clientHeight;
        for (const pin of pins) {
          if (!labelsVisible) {
            pin.element.style.display = "none";
            continue;
          }
          projected.copy(pin.point).project(camera);
          // `z > 1` means the point is behind the camera, where projection
          // mirrors it to the wrong side of the screen.
          const offScreen =
            projected.z > 1 ||
            projected.x < -1.15 ||
            projected.x > 1.15 ||
            projected.y < -1.15 ||
            projected.y > 1.15;
          pin.element.style.display = offScreen ? "none" : "block";
          if (offScreen) continue;
          const x = (projected.x * 0.5 + 0.5) * width;
          const y = (-projected.y * 0.5 + 0.5) * height2;
          pin.element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-14px, -50%)`;
        }
      };

      buildPins(labels, activeLabel);

      /*
       * Ambient occlusion: the darkening in the joints between blocks, under
       * a cornice, between seat rows — the contact shadow the sun's shadow map
       * is too coarse to draw. Loaded only when asked for; it roughly doubles
       * the cost of a frame.
       */
      const ensureComposer = async () => {
        if (composer) return;
        const [{ EffectComposer }, { RenderPass }, { GTAOPass }, { OutputPass }] =
          await Promise.all([
            import("three/addons/postprocessing/EffectComposer.js"),
            import("three/addons/postprocessing/RenderPass.js"),
            import("three/addons/postprocessing/GTAOPass.js"),
            import("three/addons/postprocessing/OutputPass.js"),
          ]);
        if (disposed) return;
        const { clientWidth, clientHeight } = host;
        const made = new EffectComposer(renderer);
        made.addPass(new RenderPass(scene, camera));
        const ao = new GTAOPass(scene, camera, clientWidth, clientHeight);
        ao.updateGtaoMaterial({
          radius: Math.max(0.6, span * 0.012),
          distanceFallOff: 1,
          thickness: 1,
        });
        ao.blendIntensity = 0.85;
        made.addPass(ao);
        made.addPass(new OutputPass());
        made.setSize(clientWidth, clientHeight);
        composer = {
          render: () => made.render(),
          setSize: (w, h) => made.setSize(w, h),
          dispose: () => {
            ao.dispose();
            made.dispose();
          },
        };
      };

      /*
       * Camera moves glide rather than cut. A cut was fine for one click; for
       * a narrated tour that walks from part to part it is a slideshow, and
       * the eye loses where on the building it is.
       */
      let flight: {
        fromPos: THREE_NS.Vector3;
        toPos: THREE_NS.Vector3;
        fromTarget: THREE_NS.Vector3;
        toTarget: THREE_NS.Vector3;
        start: number;
        duration: number;
      } | null = null;
      const flyTo = (position: THREE_NS.Vector3, look: THREE_NS.Vector3) => {
        flight = {
          fromPos: camera.position.clone(),
          toPos: position.clone(),
          fromTarget: controls.target.clone(),
          toTarget: look.clone(),
          start: performance.now() / 1000,
          duration: 1.4,
        };
      };
      // Grabbing the model mid-flight hands the camera back at once.
      const cancelFlight = () => {
        flight = null;
      };
      controls.addEventListener("start", cancelFlight);

      let lastFrame = performance.now() / 1000;
      renderer.setAnimationLoop(() => {
        const now = performance.now() / 1000;
        const dt = Math.min(0.1, now - lastFrame);
        lastFrame = now;
        if (dt > 0) {
          const rate = Math.min(1, dt / 1.8);
          liveAtmos.hemiIntensity += (atmosTarget.hemiIntensity - liveAtmos.hemiIntensity) * rate;
          liveAtmos.sunIntensity += (atmosTarget.sunIntensity - liveAtmos.sunIntensity) * rate;
          liveAtmos.fillIntensity += (atmosTarget.fillIntensity - liveAtmos.fillIntensity) * rate;
          liveAtmos.starOpacity += (atmosTarget.starOpacity - liveAtmos.starOpacity) * rate;
          liveAtmos.cloudOpacity += (atmosTarget.cloudOpacity - liveAtmos.cloudOpacity) * rate;
          liveAtmos.birdOpacity += (atmosTarget.birdOpacity - liveAtmos.birdOpacity) * rate;
          liveAtmos.exposure += (atmosTarget.exposure - liveAtmos.exposure) * rate;
          liveAtmos.skyTop.lerp(atmosTarget.skyTop, rate);
          liveAtmos.skyHorizon.lerp(atmosTarget.skyHorizon, rate);
          liveAtmos.fog.lerp(atmosTarget.fog, rate);
          liveAtmos.ground.lerp(atmosTarget.ground, rate);
          liveAtmos.hemiSky.lerp(atmosTarget.hemiSky, rate);
          liveAtmos.hemiGround.lerp(atmosTarget.hemiGround, rate);
          liveAtmos.sunColor.lerp(atmosTarget.sunColor, rate);
          liveAtmos.fillColor.lerp(atmosTarget.fillColor, rate);
          liveAtmos.cloudColor.lerp(atmosTarget.cloudColor, rate);
          applyLive();
        }
        // The flocks' circles come out of time, not out of vectors, so no two
        // birds ever collide or pause, and the clouds drift with the place.
        for (const cloud of clouds) {
          const a = now * cloud.speed + cloud.phase;
          cloud.group.position.set(
            centre.x + Math.cos(a) * cloud.radius,
            cloud.altitude + Math.sin(now * 0.3 + cloud.phase) * span * 0.02,
            centre.z + Math.sin(a) * cloud.radius,
          );
        }
        for (const bird of flock) {
          const a = now * bird.speed + bird.phase;
          bird.group.position.set(
            centre.x + Math.cos(a) * bird.radius,
            bird.altitude + Math.sin(now * 1.7 + bird.phase * 3) * span * 0.03,
            centre.z + Math.sin(a) * bird.radius,
          );
          bird.group.rotation.y = Math.PI - a;
          bird.wings.rotation.z = Math.sin(now * bird.flap + bird.phase * 7) * 0.65;
        }
        repaintSkyIfChanged();
        glow += (glowTarget - glow) * Math.min(1, dt / 1.8);
        lifeHandle?.update(now, dt, glow, camera);
        if (flight) {
          const t = Math.min(1, (now - flight.start) / flight.duration);
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          camera.position.lerpVectors(flight.fromPos, flight.toPos, e);
          controls.target.lerpVectors(flight.fromTarget, flight.toTarget, e);
          if (t >= 1) flight = null;
        }
        controls.update();
        if (composer && qualityOn) composer.render();
        else renderer.render(scene, camera);
        placePins();
      });

      /** The three views the model is worth seeing from, besides its own. */
      const viewpoints: Record<"front" | "above" | "corner", THREE_NS.Vector3> = {
        front: new THREE.Vector3(0, 0.18, -1),
        above: new THREE.Vector3(0.05, 1, 0.12),
        corner: new THREE.Vector3(0.85, 0.4, -0.7),
      };

      apiRef.current = {
        setAtmos: (light: "light" | "dark", mode: AtmosMode) => {
          atmosTarget = makeLive(paletteFor(light, mode));
          glowTarget = mode === "night" ? 1 : mode === "golden" ? 0.45 : 0.08;
        },
        setLife: (on) => {
          lifeGroup.visible = on;
        },
        setAutoRotate: (on) => {
          controls.autoRotate = on;
        },
        reset: () => flyTo(home, target),
        setLabels: (list, visible, active) => {
          labelsVisible = visible;
          if (scaleFigure) scaleFigure.visible = visible;
          if (list.length !== pins.length) buildPins(list, active);
          else pins.forEach((pin, index) => styleLabel(pin.element, index === active));
          placePins();
        },
        setView: (view) => {
          const direction = viewpoints[view].clone().normalize();
          flyTo(target.clone().addScaledVector(direction, distance), target);
        },
        /*
         * Go and stand in front of one named part.
         *
         * Without this the carvings might as well not be there: a 5 cm relief
         * on a 30 m enclosure is a few pixels from the view the model opens at.
         * The camera keeps the direction it is already looking from and only
         * closes the distance, so choosing a label reads as walking up to the
         * thing rather than as being teleported somewhere unrecognisable.
         */
        /*
         * The model, as a file.
         *
         * Everything here is generated at runtime from measurements, so there
         * is no asset to hand anyone — until this. glTF binary is what Blender,
         * Unity and Unreal all read without a converter, and the export carries
         * the geometry with its materials rather than a picture of it.
         */
        exportGLB: async (withGround) => {
          const { GLTFExporter } = await import("three/addons/exporters/GLTFExporter.js");
          const exporter = new GLTFExporter();
          // The sky, clouds and birds are the building's surroundings, not the
          // building; they drop out of a model file the way they would drop
          // out of a section drawing.
          const wasVisible = decorations.map((object) => object.visible);
          decorations.forEach((object) => (object.visible = false));
          const apronWas = apronMesh.visible;
          if (!withGround) apronMesh.visible = false;
          try {
            const result = await exporter.parseAsync(scene, { binary: true, onlyVisible: true });
            return result as ArrayBuffer;
          } finally {
            decorations.forEach((object, index) => (object.visible = wasVisible[index]!));
            apronMesh.visible = apronWas;
          }
        },
        focus: (at) => {
          const point = new THREE.Vector3(...at);
          const direction = camera.position.clone().sub(controls.target).normalize();
          // Flatten the approach a little: coming in along a steep downward
          // look leaves the camera staring at the top of whatever it flew to.
          direction.y = Math.min(direction.y, 0.42);
          direction.normalize();
          const close = Math.max(5, span * 0.17);
          flyTo(point.clone().addScaledVector(direction, close), point);
        },
        setQuality: (on) => {
          qualityOn = on;
          if (on) void ensureComposer();
        },
        /** A still of exactly what is on screen, rendered now so the buffer is fresh. */
        capture: () => {
          if (composer && qualityOn) composer.render();
          else renderer.render(scene, camera);
          return renderer.domElement.toDataURL("image/jpeg", 0.9);
        },
      };
      apiRef.current.setQuality(qualityRef.current);
      setReady(true);

      cleanup = () => {
        apiRef.current = null;
        observer.disconnect();
        layer.remove();
        renderer.setAnimationLoop(null);
        controls.dispose();
        geometriesOwned.forEach((geometry) => geometry.dispose());
        materialsOwned.forEach((material) => material.dispose());
        textures.forEach((texture) => texture.dispose());
        sky.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
        cloudPuff.dispose();
        cloudMaterial.dispose();
        birdGeometry.dispose();
        birdMaterial.dispose();
        apron.dispose();
        apronMaterial.dispose();
        landscape.dispose();
        lifeHandle?.dispose();
        scanResources.forEach((resource) => resource.dispose());
        composer?.dispose();
        controls.removeEventListener("start", cancelFlight);
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
    // `biome` is fixed per model, so it rebuilding the scene costs nothing.
  }, [parts, kind, label, biome, life]);

  useEffect(() => {
    apiRef.current?.setLife(showLife);
  }, [showLife, ready]);

  useEffect(() => {
    apiRef.current?.setQuality(quality);
  }, [quality, ready]);

  useEffect(() => {
    if (captureToken <= 0 || !apiRef.current) return;
    captureRef.current?.(apiRef.current.capture());
  }, [captureToken]);

  useEffect(() => {
    apiRef.current?.setAtmos(theme, atmos);
  }, [theme, atmos, ready]);

  useEffect(() => {
    apiRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate, ready]);

  useEffect(() => {
    if (resetToken > 0) apiRef.current?.reset();
  }, [resetToken]);

  useEffect(() => {
    apiRef.current?.setLabels(labels, showLabels, activeLabel);
  }, [labels, showLabels, activeLabel, ready]);

  // Choosing a label walks the camera up to what it names.
  useEffect(() => {
    if (activeLabel === null) return;
    const target = labels[activeLabel];
    if (target) apiRef.current?.focus(target.at);
  }, [activeLabel, labels]);

  useEffect(() => {
    if (view) apiRef.current?.setView(view.name);
  }, [view]);

  useEffect(() => {
    if (exportToken <= 0) return;
    void apiRef.current?.exportGLB(groundRef.current).then((data) => exportRef.current(data));
  }, [exportToken]);

  if (failed) {
    return (
      <div
        className="grid place-items-center rounded-2xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground"
        style={{ height }}
      >
        {label}
      </div>
    );
  }

  // `relative` so the label layer, which is absolutely positioned, has this
  // box to sit in rather than the page.
  return <div ref={hostRef} className="relative h-full w-full" style={{ height }} />;
}
