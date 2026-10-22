import type * as THREE_NS from "three";
import { contentKey, sameContents, type AttributeArray } from "@/lib/geometry-weld";

type ThreeModule = typeof THREE_NS;

/**
 * Everybody in one draw call.
 *
 * Each person is a little hierarchy of pivots — hips, knees, shoulders,
 * elbows, a neck — so they can walk and gesture, and every piece of it was a
 * mesh of its own: some five hundred draws a frame for a busy scene, and as
 * many again for the shadow, which on a phone was most of the frame. All of
 * them share the one vertex-coloured cloth material, which is what lets a
 * `BatchedMesh` draw them together: the pivots stay where they are and keep
 * animating, and each frame their world matrices are copied into the batch.
 *
 * The original meshes stay in the scene graph, moved to a layer the camera
 * and the shadow camera do not draw, so tapping a person (a raycast), the
 * near/far switch (their `visible` flags) and the model export all work on
 * them exactly as before.
 */
export const HIDDEN_LAYER = 1;

export type MeshBatch = {
  mesh: THREE_NS.BatchedMesh;
  /** Copy the pieces' current world matrices and visibility into the batch. */
  sync: () => void;
  dispose: () => void;
};

/** Whether `object` and every ancestor up to (not including) `root` is visible. */
const shown = (object: THREE_NS.Object3D, root: THREE_NS.Object3D) => {
  let o: THREE_NS.Object3D | null = object;
  while (o && o !== root) {
    if (!o.visible) return false;
    o = o.parent;
  }
  return true;
};

/** What a geometry's vertices are made of: a batch can only hold one kind. */
const signatureOf = (geometry: THREE_NS.BufferGeometry) =>
  Object.keys(geometry.attributes)
    .sort()
    .map((name) => {
      const a = geometry.attributes[name] as THREE_NS.BufferAttribute;
      return `${name}:${a.array.constructor.name}:${a.itemSize}:${a.normalized ? 1 : 0}`;
    })
    .join(",");

export type BatchOptions = {
  /** Fewest pieces worth a batch of their own. */
  min?: number;
  /**
   * The pieces never move (statues, reliefs): their matrices are copied
   * once, and each frame only their visibility is checked.
   */
  still?: boolean;
  /** The batch's name in the scene graph. */
  name?: string;
};

/**
 * Gather every plain mesh under `root` drawn with `material` into batches,
 * one per kind of vertex (see `signatureOf`), each added to `root`. A mesh
 * that is not indexed, or of a kind too rare to be worth it, is left drawing
 * on its own.
 */
export function batchMeshes(
  THREE: ThreeModule,
  root: THREE_NS.Object3D,
  material: THREE_NS.Material,
  options: BatchOptions = {},
): MeshBatch[] {
  const kinds = new Map<string, THREE_NS.Mesh[]>();
  root.traverse((object) => {
    const mesh = object as THREE_NS.Mesh & {
      isInstancedMesh?: boolean;
      isBatchedMesh?: boolean;
      isSkinnedMesh?: boolean;
    };
    if (!mesh.isMesh || mesh.isInstancedMesh || mesh.isBatchedMesh || mesh.isSkinnedMesh) return;
    if (mesh.material !== material || !mesh.geometry.index) return;
    if (mesh.layers.isEnabled(HIDDEN_LAYER) || Object.keys(mesh.geometry.morphAttributes).length)
      return;
    const kind = signatureOf(mesh.geometry);
    kinds.set(kind, [...(kinds.get(kind) ?? []), mesh]);
  });
  const batches: MeshBatch[] = [];
  for (const meshes of kinds.values()) {
    if (meshes.length < (options.min ?? 4)) continue;
    batches.push(batchOf(THREE, root, material, meshes, options));
  }
  return batches;
}

function batchOf(
  THREE: ThreeModule,
  root: THREE_NS.Object3D,
  material: THREE_NS.Material,
  meshes: THREE_NS.Mesh[],
  options: BatchOptions,
): MeshBatch {
  /*
   * Two people dressed alike are built with identical pieces; the batch
   * stores each distinct shape once and draws it as often as it is needed.
   */
  /*
   * A scan's vertices often come interleaved (its packed positions padded
   * out beside other data); the batch needs each attribute on its own, so
   * those are unpicked into plain copies first. The values are copied as
   * stored, packed integers and all.
   */
  const plain = (g: THREE_NS.BufferGeometry) => {
    const names = Object.keys(g.attributes);
    const interleaved = (a: unknown) =>
      (a as THREE_NS.InterleavedBufferAttribute).isInterleavedBufferAttribute === true;
    if (!names.some((name) => interleaved(g.attributes[name]))) return g;
    const out = new THREE.BufferGeometry();
    for (const name of names) {
      const a = g.attributes[name]!;
      if (!interleaved(a)) {
        out.setAttribute(name, a);
        continue;
      }
      const source = a as THREE_NS.InterleavedBufferAttribute;
      const data = source.data.array as AttributeArray;
      const Ctor = data.constructor as new (length: number) => AttributeArray;
      const values = new Ctor(source.count * source.itemSize);
      for (let i = 0; i < source.count; i += 1)
        for (let k = 0; k < source.itemSize; k += 1)
          values[i * source.itemSize + k] = data[i * source.data.stride + source.offset + k]!;
      out.setAttribute(name, new THREE.BufferAttribute(values, source.itemSize, source.normalized));
    }
    out.setIndex(g.index);
    return out;
  };
  const plainOf = new Map<THREE_NS.BufferGeometry, THREE_NS.BufferGeometry>();
  for (const mesh of meshes)
    if (!plainOf.has(mesh.geometry)) plainOf.set(mesh.geometry, plain(mesh.geometry));
  const arraysOf = (g: THREE_NS.BufferGeometry) => [
    ...Object.keys(g.attributes)
      .sort()
      .map((k) => g.attributes[k]!.array as AttributeArray),
    g.index!.array as AttributeArray,
  ];
  const shapes: THREE_NS.BufferGeometry[] = [];
  const byKey = new Map<string, number[]>();
  const shapeOf = new Map<THREE_NS.BufferGeometry, number>();
  let vertices = 0;
  let indices = 0;
  for (const mesh of meshes) {
    if (shapeOf.has(mesh.geometry)) continue;
    const g = plainOf.get(mesh.geometry)!;
    const arrays = arraysOf(g);
    const key = contentKey(arrays);
    const same = (byKey.get(key) ?? []).find((s) => sameContents(arraysOf(shapes[s]!), arrays));
    if (same !== undefined) {
      shapeOf.set(mesh.geometry, same);
      continue;
    }
    shapeOf.set(mesh.geometry, shapes.length);
    byKey.set(key, [...(byKey.get(key) ?? []), shapes.length]);
    shapes.push(g);
    vertices += g.attributes["position"]!.count;
    indices += g.index!.count;
  }

  const batch = new THREE.BatchedMesh(meshes.length, vertices, indices, material);
  batch.name = options.name ?? "batch";
  // The batch moves as its people do; its own bounds would be stale, so it
  // is never culled whole — each person in it is culled on their own.
  batch.frustumCulled = false;
  batch.castShadow = meshes.some((m) => m.castShadow);
  batch.receiveShadow = meshes.some((m) => m.receiveShadow);
  // A model file wants the people themselves, not this drawing aid.
  batch.userData["noExport"] = true;
  const geometryIds = shapes.map((g) => batch.addGeometry(g));
  const ids = meshes.map((mesh) => {
    const id = batch.addInstance(geometryIds[shapeOf.get(mesh.geometry)!]!);
    mesh.layers.set(HIDDEN_LAYER);
    return id;
  });
  root.add(batch);

  const visible = meshes.map(() => true);
  const inverse = new THREE.Matrix4();
  const local = new THREE.Matrix4();
  let placed = false;
  const sync = () => {
    const move = !options.still || !placed;
    if (move) {
      root.updateMatrixWorld();
      inverse.copy(batch.matrixWorld).invert();
    }
    for (let i = 0; i < meshes.length; i += 1) {
      const mesh = meshes[i]!;
      const on = shown(mesh, root);
      if (on !== visible[i]) {
        visible[i] = on;
        batch.setVisibleAt(ids[i]!, on);
      }
      if (move && (on || !placed))
        batch.setMatrixAt(ids[i]!, local.multiplyMatrices(inverse, mesh.matrixWorld));
    }
    placed = true;
  };
  sync();

  return {
    mesh: batch,
    sync,
    dispose: () => {
      batch.removeFromParent();
      batch.dispose();
    },
  };
}
