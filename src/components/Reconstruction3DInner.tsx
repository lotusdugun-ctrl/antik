import { useEffect, useRef, useState } from "react";
import type * as THREE_NS from "three";
import { boundsOf, type LoftSection, type Material, type Part } from "@/lib/reconstruction-parts";
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
  // Down the long axis, the view from the closed end of the track.
  stadium: [0.5, 0.26, 1],
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
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{
    setAtmos: (t: "light" | "dark", a: AtmosMode) => void;
    setAutoRotate: (on: boolean) => void;
    reset: () => void;
    setLabels: (labels: SceneLabel[], visible: boolean, active: number | null) => void;
    setView: (view: "front" | "above" | "corner") => void;
    focus: (at: [number, number, number]) => void;
    exportGLB: () => Promise<ArrayBuffer>;
  } | null>(null);
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
        const seed = hashString(`${JSON.stringify(part.at)}|${part.material}|fig`);
        const rand = mulberry(seed);
        const n1 = valueNoise(seed);
        const pieces: THREE_NS.BufferGeometry[] = [];
        const statue = part.material !== "human";
        const bearded = part.bearded ?? part.material === "bronze";
        const riding = part.pose === "riding";
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

        /**
         * Sculpt a face into a plain sphere: nose, brow, sockets, cheeks, lips,
         * chin, jaw and ears, each a soft gaussian push along the surface normal
         * — the way a sculptor adds clay and takes it away. Recomputed normals
         * afterwards make it read as carved marble, not as a mask stuck on.
         */
        const sculptHead = (geo: THREE_NS.BufferGeometry, r0: number) => {
          const pos = geo.attributes["position"]!;
          for (let i = 0; i < pos.count; i += 1) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const a = x / r0;
            const b = y / r0;
            const c = z / r0;
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
            // The nose, and its bulbous tip.
            disp += bump(0, -0.05, 0.82, 0.16, 0.4, 0.34, 0.52);
            disp += bump(0, -0.12, 0.87, 0.12, 0.16, 0.2, 0.3);
            // The sockets, cut in rather than built up.
            disp += bump(-0.156, 0.04, 0.7, 0.15, 0.12, 0.15, -0.42);
            disp += bump(0.156, 0.04, 0.7, 0.15, 0.12, 0.15, -0.42);
            // The brow over each eye.
            disp += bump(-0.16, 0.2, 0.78, 0.2, 0.14, 0.3, 0.26);
            disp += bump(0.16, 0.2, 0.78, 0.2, 0.14, 0.3, 0.26);
            // The cheekbones.
            disp += bump(-0.42, -0.04, 0.42, 0.3, 0.24, 0.28, 0.18);
            disp += bump(0.42, -0.04, 0.42, 0.3, 0.24, 0.28, 0.18);
            // The mouth: lips, and the crease between them.
            disp += bump(0, -0.26, 0.8, 0.22, 0.12, 0.2, 0.16);
            disp += bump(0, -0.31, 0.77, 0.12, 0.045, 0.11, -0.14);
            // The chin and the jaw that carries it.
            disp += bump(0, -0.52, 0.52, 0.26, 0.26, 0.32, 0.28);
            disp += bump(0, -0.62, 0.3, 0.36, 0.24, 0.42, 0.2);
            // The ears.
            disp += bump(-0.98, -0.02, 0, 0.1, 0.22, 0.17, 0.3);
            disp += bump(0.98, -0.02, 0, 0.1, 0.22, 0.17, 0.3);
            if (bearded) {
              // The beard, massed under the jaw, rugged with hair.
              disp += bump(0, -0.42, 0.32, 0.36, 0.5, 0.5, 0.4);
              if (b < -0.2) disp += (n1(a * 14, b * 14, c * 14) - 0.5) * 0.28;
            } else {
              // Hair drawn up off the crown, rough where the surface is high.
              if (b > 0.3) disp += 0.24 + (n1(a * 12, b * 12, c * 12) - 0.5) * 0.24;
            }
            disp *= r0;
            pos.setX(i, x + ux * disp);
            pos.setY(i, y + uy * disp);
            pos.setZ(i, z + uz * disp);
          }
          pos.needsUpdate = true;
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

        /** The head, on its neck, with the hair the figure's sex wears. */
        const headAt = (neckBase: number, neckHeight: number, headY: number) => {
          const neck = new THREE.CylinderGeometry(h * 0.045, h * 0.055, neckHeight, 14);
          neck.translate(0, neckBase + neckHeight / 2, 0);
          pieces.push(neck);
          const head = new THREE.SphereGeometry(h * 0.1, 32, 26);
          sculptHead(head, h * 0.1);
          head.computeVertexNormals();
          head.translate(0, headY, 0);
          pieces.push(head);
          if (bearded) {
            const hairCap = new THREE.SphereGeometry(h * 0.107, 20, 14);
            hairCap.scale(1, 0.62, 1);
            hairCap.translate(0, headY + h * 0.03, h * 0.01);
            pieces.push(hairCap);
          } else {
            // The bun at the back of the head.
            const bun = new THREE.SphereGeometry(h * 0.055, 14, 11);
            bun.translate(0, headY + h * 0.075, -h * 0.083);
            pieces.push(bun);
          }
        };

        if (statue && !riding) {
          // A two-step pedestal: the wider base and the narrower cap that the
          // figure actually stands on.
          const base = new THREE.CylinderGeometry(h * 0.2, h * 0.225, h * 0.035, 24);
          base.translate(0, h * 0.0175, 0);
          pieces.push(base);
          const cap = new THREE.CylinderGeometry(h * 0.17, h * 0.2, h * 0.03, 24);
          cap.translate(0, h * 0.05, 0);
          pieces.push(cap);
          // Feet, peeking out from beneath the hem.
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
           * standing.
           */
          const hip = 0.02 * h;
          const robe = skin(
            [
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
          const folds = 9 + Math.floor(rand() * 4);
          const phase = rand() * Math.PI * 2;
          drape(
            robe,
            (y) => 0.03 * h * Math.max(0.25, Math.min(1, (h * 0.57 - y) / (h * 0.5))),
            folds,
            phase,
          );
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
          // The torso: waist, ribcage, bust, the shoulder line, the neck root.
          const torso = skin(
            [
              section([hip * 0.6, h * 0.6, 0], h * 0.125, h * 0.095),
              section([hip * 0.4, h * 0.68, 0.004 * h], h * 0.145, h * 0.11),
              section([hip * 0.2, h * 0.75, 0], h * 0.155, h * 0.095),
              section([0, h * 0.79, 0], h * 0.17, h * 0.085),
              section([0, h * 0.815, 0], h * 0.085, h * 0.07),
            ],
            28,
            5,
          );
          drape(torso, () => 0.008 * h, 14, rand() * Math.PI * 2);
          if (!bearded) {
            // The hint of the breasts beneath the cloth, just enough to read.
            for (const side of [-1, 1]) {
              const breast = new THREE.SphereGeometry(h * 0.036, 10, 8);
              breast.scale(1, 0.85, 1.2);
              breast.translate(side * h * 0.052, h * 0.665, h * 0.095);
              pieces.push(breast);
            }
          }
          // The mantle: its rolled edge over the left shoulder, down across
          // the chest to the right hip, and on round the back.
          skin(
            [
              section([-0.15 * h, 0.8 * h, 0], 0.05 * h, 0.035 * h),
              section([-0.1 * h, 0.73 * h, 0.1 * h], 0.05 * h, 0.035 * h),
              section([0, 0.63 * h, 0.125 * h], 0.048 * h, 0.034 * h),
              section([0.1 * h, 0.54 * h, 0.11 * h], 0.046 * h, 0.032 * h),
              section([0.16 * h, 0.485 * h, 0.03 * h], 0.044 * h, 0.03 * h),
              section([0.14 * h, 0.47 * h, -0.08 * h], 0.04 * h, 0.028 * h),
              section([0, 0.5 * h, -0.125 * h], 0.04 * h, 0.028 * h),
            ],
            12,
            5,
          );
          headAt(h * 0.815, h * 0.065, h * 0.885);
          // The right arm, hanging at the side and a little forward, a fold of
          // the mantle gathered in the hand. Shoulder, elbow, forearm, wrist.
          const shoulderR: P = [h * 0.155, h * 0.76, h * 0.01];
          const elbowR: P = [h * 0.16, h * 0.6, h * 0.03];
          const wristR: P = [h * 0.15, h * 0.46, h * 0.07];
          pieces.push(limb(shoulderR, elbowR, h * 0.037, h * 0.031));
          pieces.push(limb(elbowR, wristR, h * 0.028, h * 0.021));
          pieces.push(joint(elbowR, h * 0.032));
          pieces.push(...hand(wristR, h * 0.026));
          // The left arm across the body, forearm bent, a scroll in the hand —
          // the way three of the four virtues on the Celsus façade stand.
          const shoulderL: P = [-h * 0.155, h * 0.765, 0];
          const elbowL: P = [-h * 0.13, h * 0.615, h * 0.04];
          const wristL: P = [h * 0.04, h * 0.59, h * 0.09];
          pieces.push(limb(shoulderL, elbowL, h * 0.037, h * 0.032));
          pieces.push(limb(elbowL, wristL, h * 0.028, h * 0.022));
          pieces.push(joint(elbowL, h * 0.032));
          pieces.push(...hand(wristL, h * 0.026, 0.6));
          const scroll = new THREE.CylinderGeometry(h * 0.016, h * 0.016, h * 0.09, 10);
          scroll.rotateZ(Math.PI / 2);
          scroll.rotateY(0.3);
          scroll.translate(h * 0.05, h * 0.55, h * 0.1);
          pieces.push(scroll);
        } else if (statue && riding) {
          /*
           * Astride. The seat is the origin: a tunic spread over the horse's
           * back, thighs forward and down round the barrel, the legs hanging
           * with the feet pointed, the torso upright, a cloak falling down the
           * back — and the right arm out in the gesture of address the
           * Capitoline horseman makes, the left holding the rein.
           */
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
          for (const side of [-1, 1]) {
            const hipP: P = [side * 0.07 * h, 0, 0.02 * h];
            const knee: P = [side * 0.19 * h, -0.13 * h, 0.22 * h];
            const ankle: P = [side * 0.21 * h, -0.45 * h, 0.15 * h];
            pieces.push(limb(hipP, knee, h * 0.058, h * 0.042));
            pieces.push(joint(knee, h * 0.045));
            pieces.push(limb(knee, ankle, h * 0.04, h * 0.026));
            const foot = new THREE.SphereGeometry(h * 0.035, 10, 7);
            foot.scale(1, 0.7, 1.8);
            foot.translate(ankle[0], ankle[1] - 0.02 * h, ankle[2] + 0.03 * h);
            pieces.push(foot);
          }
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
          const cloak = skin(
            [
              section([0, 0.33 * h, -0.05 * h], 0.19 * h, 0.03 * h),
              section([0, 0.2 * h, -0.09 * h], 0.22 * h, 0.035 * h),
              section([0, 0.02 * h, -0.12 * h], 0.24 * h, 0.04 * h),
              section([0, -0.14 * h, -0.14 * h], 0.23 * h, 0.045 * h),
            ],
            20,
            5,
          );
          drape(cloak, () => 0.01 * h, 9, rand() * Math.PI * 2);
          headAt(h * 0.345, h * 0.06, h * 0.455);
          const shoulderR: P = [0.16 * h, 0.31 * h, 0.01 * h];
          const elbowR: P = [0.25 * h, 0.22 * h, 0.13 * h];
          const wristR: P = [0.27 * h, 0.25 * h, 0.3 * h];
          pieces.push(limb(shoulderR, elbowR, h * 0.037, h * 0.031));
          pieces.push(joint(elbowR, h * 0.032));
          pieces.push(limb(elbowR, wristR, h * 0.028, h * 0.022));
          pieces.push(...hand(wristR, h * 0.026, 1.3));
          const shoulderL: P = [-0.16 * h, 0.31 * h, 0];
          const elbowL: P = [-0.19 * h, 0.17 * h, 0.07 * h];
          const wristL: P = [-0.1 * h, 0.14 * h, 0.19 * h];
          pieces.push(limb(shoulderL, elbowL, h * 0.037, h * 0.031));
          pieces.push(joint(elbowL, h * 0.032));
          pieces.push(limb(elbowL, wristL, h * 0.028, h * 0.022));
          pieces.push(...hand(wristL, h * 0.026, 0.5));
        } else if (statue && part.pose === "seated") {
          /*
           * Enthroned. The seat is the origin: thighs forward along the
           * throne, shins down to the footstool, hands resting on the knees,
           * the torso upright and a tall tiara on the head — the pose of the
           * gods on Nemrut Dağı, who sit with their hands on their laps and
           * look straight out over the court.
           */
          const lap = skin(
            [
              section([0, 0.14 * h, 0], 0.12 * h, 0.09 * h),
              section([0, 0.06 * h, 0.04 * h], 0.15 * h, 0.1 * h),
              section([0, 0.03 * h, 0.16 * h], 0.16 * h, 0.07 * h),
              section([0, 0.03 * h, 0.27 * h], 0.16 * h, 0.06 * h),
            ],
            28,
            5,
          );
          drape(lap, () => 0.012 * h, 10, rand() * Math.PI * 2);
          for (const side of [-1, 1]) {
            const hipP: P = [side * 0.07 * h, 0, 0.02 * h];
            const knee: P = [side * 0.09 * h, 0.02 * h, 0.28 * h];
            const ankle: P = [side * 0.09 * h, -0.25 * h, 0.3 * h];
            pieces.push(limb(hipP, knee, h * 0.06, h * 0.045));
            pieces.push(joint(knee, h * 0.048));
            pieces.push(limb(knee, ankle, h * 0.042, h * 0.03));
            const foot = new THREE.SphereGeometry(h * 0.04, 10, 7);
            foot.scale(1, 0.6, 1.9);
            foot.translate(ankle[0], ankle[1] - 0.015 * h, ankle[2] + 0.05 * h);
            pieces.push(foot);
          }
          const torso = skin(
            [
              section([0, 0.1 * h, 0], 0.11 * h, 0.085 * h),
              section([0, 0.19 * h, 0.005 * h], 0.13 * h, 0.095 * h),
              section([0, 0.27 * h, 0], 0.155 * h, 0.095 * h),
              section([0, 0.32 * h, 0], 0.17 * h, 0.09 * h),
              section([0, 0.345 * h, 0], 0.09 * h, 0.07 * h),
            ],
            28,
            5,
          );
          drape(torso, () => 0.008 * h, 12, rand() * Math.PI * 2);
          headAt(h * 0.345, h * 0.06, h * 0.455);
          // The tiara: a tall cap rising from a band round the brow.
          const bandY = h * 0.455 + h * 0.06;
          const brow = new THREE.CylinderGeometry(h * 0.1, h * 0.105, h * 0.035, 20);
          brow.translate(0, bandY, 0);
          pieces.push(brow);
          const tiara = new THREE.CylinderGeometry(h * 0.02, h * 0.098, h * 0.17, 20);
          tiara.translate(0, bandY + h * 0.1, -h * 0.01);
          pieces.push(tiara);
          for (const side of [-1, 1]) {
            const shoulder: P = [side * 0.165 * h, 0.31 * h, 0.01 * h];
            const elbow: P = [side * 0.185 * h, 0.15 * h, 0.08 * h];
            const wrist: P = [side * 0.1 * h, 0.05 * h, 0.25 * h];
            pieces.push(limb(shoulder, elbow, h * 0.04, h * 0.033));
            pieces.push(joint(elbow, h * 0.034));
            pieces.push(limb(elbow, wrist, h * 0.03, h * 0.024));
            pieces.push(...hand(wrist, h * 0.028, 0.8));
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
            const arm = new THREE.CylinderGeometry(h * 0.028, h * 0.022, h * 0.36, 7);
            arm.translate(side * h * 0.115, h * 0.6, 0);
            pieces.push(arm);
          }
          const head = new THREE.SphereGeometry(h * 0.075, 12, 10);
          head.translate(0, h * 0.93, 0);
          pieces.push(head);
        }

        // Every primitive here is indexed and a loft is too, but a merge only
        // holds when the lists agree, so everything is flattened first.
        const flat = pieces.map((piece) => (piece.index ? piece.toNonIndexed() : piece));
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
      const carved = parts.filter((part) => part.carving);
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

      const byMaterial = new Map<Material, THREE_NS.BufferGeometry[]>();
      for (const part of parts) {
        if (part.carving) continue;
        const list = byMaterial.get(part.material) ?? [];
        list.push(flatten(geometryFor(part)));
        byMaterial.set(part.material, list);
      }

      for (const [name, list] of byMaterial) {
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
        const isStone = name !== "shadow" && name !== "human";
        const stone = name === "marble" || name === "marbleWorn" ? stoneSet : blockSet;
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
        const mesh = new THREE.Mesh(merged, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        // The scale figure is a teaching device, not a find. It goes when the
        // labels go, which is what leaves the clean archaeological view.
        if (name === "human") scaleFigure = mesh;
        materialsOwned.push(material);
        geometriesOwned.push(merged);
      }

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

      /* ---- light, camera ---- */

      const hemisphere = new THREE.HemisphereLight(0xffffff, 0x8d8264, 1.1);
      scene.add(hemisphere);
      const sun = new THREE.DirectionalLight(0xfff3e0, 2.2);
      sun.position.set(centre.x + span * 0.65, bounds.min[1] + span * 1.15, centre.z - span * 0.55);
      sun.target.position.copy(centre);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.bias = -0.0006;
      sun.shadow.normalBias = 0.03;
      sun.shadow.radius = 2.5;
      const shadowSpan = span * 0.85;
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

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
        (window as unknown as { __recon?: unknown }).__recon = { camera, controls, target, span };
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
      const decorations = [stars, ...clouds.map((c) => c.group), ...flock.map((f) => f.group)];
      applyLive();
      repaintSkyIfChanged();

      const resize = () => {
        const { clientWidth, clientHeight } = host;
        if (!clientWidth || !clientHeight) return;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight, false);
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
        controls.update();
        renderer.render(scene, camera);
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
        },
        setAutoRotate: (on) => {
          controls.autoRotate = on;
        },
        reset: () => {
          camera.position.copy(home);
          controls.target.copy(target);
          controls.update();
        },
        setLabels: (list, visible, active) => {
          labelsVisible = visible;
          if (scaleFigure) scaleFigure.visible = visible;
          if (list.length !== pins.length) buildPins(list, active);
          else pins.forEach((pin, index) => styleLabel(pin.element, index === active));
          placePins();
        },
        setView: (view) => {
          const direction = viewpoints[view].clone().normalize();
          camera.position.copy(target).addScaledVector(direction, distance);
          controls.target.copy(target);
          controls.update();
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
        exportGLB: async () => {
          const { GLTFExporter } = await import("three/addons/exporters/GLTFExporter.js");
          const exporter = new GLTFExporter();
          // The sky, clouds and birds are the building's surroundings, not the
          // building; they drop out of a model file the way they would drop
          // out of a section drawing.
          const wasVisible = decorations.map((object) => object.visible);
          decorations.forEach((object) => (object.visible = false));
          try {
            const result = await exporter.parseAsync(scene, { binary: true, onlyVisible: true });
            return result as ArrayBuffer;
          } finally {
            decorations.forEach((object, index) => (object.visible = wasVisible[index]!));
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
          camera.position.copy(point).addScaledVector(direction, close);
          controls.target.copy(point);
          controls.update();
        },
      };
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
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [parts, kind, label]);

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
    void apiRef.current?.exportGLB().then((data) => exportRef.current(data));
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
