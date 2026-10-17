import type * as THREE_NS from "three";
import {
  glyphOf,
  LEADING,
  measure,
  SPACE,
  STROKE,
  TRACKING,
  type Lettering,
  type Stroke,
} from "@/lib/epigraphy";
import type { Part } from "@/lib/reconstruction-parts";

/**
 * The inscriptions of a model, drawn.
 *
 * Every lettered plate (`inscription` in `reconstruction-detail.ts`) is laid
 * out on a shared canvas — a page of an atlas — with its letters cut stroke
 * by stroke, and then drawn as one quad lying a few millimetres in front of
 * the stone. A building's whole lettering is a handful of triangles and one
 * or two textures, so a dedication thirty metres long costs what a statue
 * base does.
 *
 * Cut letters are drawn as a V-groove seen in daylight: the groove dark and
 * a little red, where dirt and the trace of the paint that filled them sit;
 * its upper wall in shadow and its lower lip catching the light. Painted
 * letters are flat ochre; scratched ones a fine line; rubricated ones are cut
 * and filled with a strong red, as the stones meant to be read from afar were.
 */

type Plate = Extract<Part, { kind: "box" }> & { lettering: Lettering };

export const isPlate = (part: Part): part is Plate =>
  part.kind === "box" && part.lettering !== undefined;

/** The margin round each text on its plate, in cap heights: room for the lit lip. */
const PAD = 0.35;
const PAGE = 2048;

type Slot = { plate: Plate; page: number; x: number; y: number; w: number; h: number; px: number };

/** Where on its plate each stroke of a line goes, in cap heights from the line's left end. */
function strokesOf(line: string): { x: number; strokes: Stroke[] }[] {
  const out: { x: number; strokes: Stroke[] }[] = [];
  let x = 0;
  let previous = false;
  for (const char of line) {
    if (char === " ") {
      x += SPACE;
      previous = false;
      continue;
    }
    const glyph = glyphOf(char);
    if (!glyph) continue;
    if (previous) x += TRACKING;
    out.push({ x: x + STROKE / 2, strokes: glyph.strokes });
    x += glyph.width + STROKE;
    previous = true;
  }
  return out;
}

/**
 * The serifs: a short cross-stroke at every free end of a straight cut at
 * the top or bottom of the letter, which is what makes lettering read as
 * carved rather than as written.
 */
function serifs(strokes: Stroke[]): [number, number, number, number][] {
  const ends: [number, number][] = [];
  for (const s of strokes) if (s[0] === "l") ends.push([s[1], s[2]], [s[3], s[4]]);
  const shared = (x: number, y: number) =>
    ends.filter(([ex, ey]) => Math.abs(ex - x) < 0.03 && Math.abs(ey - y) < 0.03).length > 1;
  const out: [number, number, number, number][] = [];
  for (const s of strokes) {
    if (s[0] !== "l") continue;
    const [, x1, y1, x2, y2] = s;
    const level = Math.abs(y2 - y1) < 0.05;
    for (const [x, y] of [
      [x1, y1],
      [x2, y2],
    ] as const) {
      if (shared(x, y)) continue;
      if (!level && (y < 0.03 || y > 0.97)) out.push([x - 0.11, y, x + 0.11, y]);
      else if (level && Math.abs(x - (x === x1 ? x2 : x1)) > 0.2)
        out.push([x, y - 0.08, x, y + 0.08]);
    }
  }
  return out;
}

function pathOf(lettering: Lettering, px: number, left: number, top: number): Path2D {
  const path = new Path2D();
  const widest = Math.max(...lettering.lines.map(measure));
  const cut = lettering.finish === "cut" || lettering.finish === "rubricated";
  lettering.lines.forEach((line, row) => {
    const baseline = top + (PAD + 1 + row * LEADING) * px;
    const start = left + (PAD + (widest - measure(line)) / 2) * px;
    for (const { x, strokes } of strokesOf(line)) {
      const X = (u: number) => start + (x + u) * px;
      const Y = (v: number) => baseline - v * px;
      for (const s of strokes) {
        if (s[0] === "l") {
          path.moveTo(X(s[1]), Y(s[2]));
          path.lineTo(X(s[3]), Y(s[4]));
        } else if (s[0] === "a") {
          const [, cx, cy, rx, ry, a0, a1] = s;
          // Canvas y runs down, so an arc anticlockwise on the stone is clockwise here.
          path.moveTo(X(cx + rx * Math.cos(a0)), Y(cy + ry * Math.sin(a0)));
          path.ellipse(X(cx), Y(cy), rx * px, ry * px, 0, -a0, -a1, a1 > a0);
        } else {
          path.moveTo(X(s[1]) + STROKE * px * 0.6, Y(s[2]));
          path.arc(X(s[1]), Y(s[2]), STROKE * px * 0.6, 0, Math.PI * 2);
        }
      }
      if (cut) {
        for (const [x1, y1, x2, y2] of serifs(strokes)) {
          path.moveTo(X(x1), Y(y1));
          path.lineTo(X(x2), Y(y2));
        }
      }
    }
  });
  return path;
}

function draw(context: CanvasRenderingContext2D, slot: Slot) {
  const { lettering, material } = slot.plate;
  const { px } = slot;
  const path = pathOf(lettering, px, slot.x, slot.y);
  context.lineJoin = "round";
  context.lineCap = "round";
  const width = STROKE * px;
  const pass = (style: string, lineWidth: number, dy: number) => {
    context.save();
    context.translate(0, dy * px);
    context.strokeStyle = style;
    context.fillStyle = style;
    context.lineWidth = lineWidth;
    context.stroke(path);
    context.restore();
  };
  if (lettering.finish === "painted") {
    pass("rgba(152, 52, 32, 0.9)", width * 0.95, 0);
    return;
  }
  if (lettering.finish === "scratched") {
    pass("rgba(255, 250, 240, 0.45)", width * 0.42, 0.025);
    pass("rgba(52, 42, 34, 0.85)", width * 0.32, 0);
    return;
  }
  if (lettering.finish === "rubricated") {
    /*
     * Cut, and the groove filled with red: the lip still catches the light,
     * the paint fills the cut edge to edge, and a hair of shadow under the
     * upper wall keeps the letter crisp against white marble at a distance.
     */
    pass("rgba(255, 252, 244, 0.5)", width * 1.25, 0.05);
    pass("rgba(70, 14, 8, 0.75)", width * 1.18, -0.02);
    pass("rgba(176, 30, 20, 1)", width, 0);
    return;
  }
  const dark = material === "letteringDark";
  // The lower lip of the groove, catching the light from above.
  pass(dark ? "rgba(255, 246, 230, 0.32)" : "rgba(255, 252, 244, 0.55)", width * 1.05, 0.05);
  // The groove itself, holding dirt and the last of its red paint.
  pass(dark ? "rgba(22, 16, 12, 0.92)" : "rgba(104, 52, 38, 0.86)", width, 0);
  // And its upper wall, in its own shadow.
  pass(dark ? "rgba(0, 0, 0, 0.55)" : "rgba(40, 22, 16, 0.6)", width * 0.5, -0.03);
}

/**
 * Builds the lettering for a set of plates. The canvases are drawn and the
 * quads laid out here; nothing is added to a scene.
 */
export function buildLettering(
  THREE: typeof THREE_NS,
  plates: Plate[],
  anisotropy: number,
): { group: THREE_NS.Group; dispose: () => void } {
  const group = new THREE.Group();
  group.name = "lettering";
  if (plates.length === 0 || typeof document === "undefined") {
    return { group, dispose: () => {} };
  }

  // Shelf-pack every plate's text into pages, at a resolution that keeps a
  // statue base's letters sharp at arm's length and a long architrave's in bounds.
  const slots: Slot[] = [];
  let page = 0;
  let x = 0;
  let y = 0;
  let shelf = 0;
  const heights: number[] = [0];
  for (const plate of plates) {
    const { lettering } = plate;
    const widest = Math.max(...lettering.lines.map(measure));
    const tall = 1 + (lettering.lines.length - 1) * LEADING;
    let px = Math.max(20, Math.min(64, Math.round(lettering.letter * 900)));
    px = Math.min(
      px,
      Math.floor((PAGE - 4) / (widest + PAD * 2)),
      Math.floor((PAGE - 4) / (tall + PAD * 2)),
    );
    const w = Math.ceil((widest + PAD * 2) * px);
    const h = Math.ceil((tall + PAD * 2) * px);
    if (x + w > PAGE) {
      x = 0;
      y += shelf + 2;
      shelf = 0;
    }
    if (y + h > PAGE) {
      page += 1;
      heights.push(0);
      x = 0;
      y = 0;
      shelf = 0;
    }
    slots.push({ plate, page, x, y, w, h, px });
    x += w + 2;
    shelf = Math.max(shelf, h);
    heights[page] = Math.max(heights[page]!, y + h);
  }

  const textures: THREE_NS.Texture[] = [];
  const geometries: THREE_NS.BufferGeometry[] = [];
  const materials: THREE_NS.Material[] = [];
  heights.forEach((used, index) => {
    const canvas = document.createElement("canvas");
    canvas.width = PAGE;
    canvas.height = Math.max(4, Math.ceil(used / 4) * 4);
    const context = canvas.getContext("2d");
    if (!context) return;
    const mine = slots.filter((slot) => slot.page === index);
    for (const slot of mine) draw(context, slot);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = anisotropy;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    textures.push(texture);

    const positions: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    for (const slot of mine) {
      const { plate } = slot;
      const letter = plate.lettering.letter;
      // The quad is the text's slot, cap heights turned back into metres.
      const pad = PAD * letter;
      const scale = letter / slot.px;
      const half = (slot.w * scale) / 2;
      const height = slot.h * scale;
      const c = Math.cos(plate.rotY);
      const s = Math.sin(plate.rotY);
      // On the plate's front face, a millimetre further out.
      const out = plate.size[2] / 2 + 0.001;
      const base = positions.length / 3;
      for (const [u, v] of [
        [-half, -pad],
        [half, -pad],
        [half, height - pad],
        [-half, height - pad],
      ] as const) {
        positions.push(
          plate.at[0] + u * c + out * s,
          plate.at[1] + v,
          plate.at[2] - u * s + out * c,
        );
        normals.push(s, 0, c);
      }
      const W = PAGE;
      const H = canvas.height;
      const u0 = slot.x / W;
      const u1 = (slot.x + slot.w) / W;
      // Canvas rows run down; texture v runs up (flipY).
      const v1 = 1 - slot.y / H;
      const v0 = 1 - (slot.y + slot.h) / H;
      uvs.push(u0, v0, u1, v0, u1, v1, u0, v1);
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometries.push(geometry);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.03,
      depthWrite: false,
      roughness: 0.95,
      metalness: 0,
      // In front of the stone it lies on, however far off the camera is.
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -6,
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.renderOrder = 2;
    group.add(mesh);
  });

  return {
    group,
    dispose: () => {
      textures.forEach((texture) => texture.dispose());
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
