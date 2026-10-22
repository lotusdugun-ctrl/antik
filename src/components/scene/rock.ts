import type * as THREE_NS from "three";
import { rockOffset, rockShade, type RockFace } from "@/lib/models/rockface";

/**
 * A block of living rock: a plain box (its back, sides and top, never looked
 * at closely) and, over its front, a finely divided sheet pushed out by the
 * rock face of `models/rockface.ts` — ledges, joints, an overhang — and shaded
 * darker in the joints and lighter on the shelves. One metre or so a cell:
 * a 90 m face is a few thousand triangles, not a sculpture.
 */
export function rockGeometry(
  THREE: typeof THREE_NS,
  mergeGeometries: (
    list: THREE_NS.BufferGeometry[],
    groups: boolean,
  ) => THREE_NS.BufferGeometry | null,
  w: number,
  h: number,
  d: number,
  face: RockFace,
): THREE_NS.BufferGeometry {
  const cell = Math.max(1, Math.min(1.6, Math.sqrt((w * h) / 4000)));
  const nx = Math.max(4, Math.round(w / cell));
  const ny = Math.max(4, Math.round(h / cell));
  const sheet = new THREE.PlaneGeometry(w, h, nx, ny);
  // Facing -z, the block's front.
  sheet.rotateY(Math.PI);
  const position = sheet.attributes["position"] as THREE_NS.BufferAttribute;
  const shade = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i += 1) {
    // After the turn, +x on the sheet is -u seen from the front.
    const u = -position.getX(i);
    const v = position.getY(i) + h / 2;
    const out = rockOffset(face, w, h, u, v) * face.relief;
    position.setZ(i, -d / 2 - out);
    const k = rockShade(face, w, h, u, v);
    shade[i * 3] = k;
    shade[i * 3 + 1] = k * 0.99;
    shade[i * 3 + 2] = k * 0.96;
  }
  sheet.computeVertexNormals();
  const body = new THREE.BoxGeometry(w, h, d);
  const bodyShade = new Float32Array(body.attributes["position"]!.count * 3).fill(0.7);
  body.setAttribute("color", new THREE.BufferAttribute(bodyShade, 3));
  sheet.setAttribute("color", new THREE.BufferAttribute(shade, 3));
  const merged = mergeGeometries([body.toNonIndexed(), sheet.toNonIndexed()], false);
  body.dispose();
  sheet.dispose();
  return merged ?? new THREE.BoxGeometry(w, h, d);
}
