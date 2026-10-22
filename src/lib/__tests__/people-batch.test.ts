import { describe, expect, test } from "bun:test";
import * as THREE from "three";
import { HIDDEN_LAYER, batchMeshes } from "@/components/scene/batch";

/** A little figure: a body and two arms on pivots, as `life.ts` builds them. */
const figure = (material: THREE.Material, x: number) => {
  const root = new THREE.Group();
  root.position.x = x;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1, 0.2), material);
  const arm = new THREE.Group();
  arm.position.y = 0.8;
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.1), material);
  hand.position.y = -0.25;
  arm.add(hand);
  root.add(body, arm);
  return { root, body, arm, hand };
};

describe("drawing everybody in one batch", () => {
  const setup = () => {
    const material = new THREE.MeshStandardMaterial();
    const group = new THREE.Group();
    const people = [0, 2, 4].map((x) => figure(material, x));
    for (const p of people) group.add(p.root);
    // Something else in the group, drawn its own way: left alone.
    const fire = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
    group.add(fire);
    const batches = batchMeshes(THREE, group, material);
    expect(batches.length).toBe(1);
    const batch = batches[0]!;
    return { group, people, fire, batch };
  };

  test("every piece with the shared material becomes one instance", () => {
    const { batch } = setup();
    expect(batch.mesh.instanceCount).toBe(6);
  });

  test("identical shapes are stored once", () => {
    const { batch } = setup();
    // Three bodies and three arms, all alike: two shapes.
    expect(batch.mesh.unusedVertexCount).toBe(0);
    expect(batch.mesh.geometry.attributes["position"]!.count).toBe(48);
  });

  test("the originals stay for picking but are no longer drawn", () => {
    const { people, fire } = setup();
    const camera = new THREE.PerspectiveCamera();
    for (const p of people) {
      expect(p.body.layers.test(camera.layers)).toBe(false);
      const ray = new THREE.Raycaster(
        new THREE.Vector3(p.root.position.x, 0.5, 5),
        new THREE.Vector3(0, 0, -1),
      );
      expect(ray.intersectObject(p.root, true).length).toBe(0);
      ray.layers.enable(HIDDEN_LAYER);
      expect(ray.intersectObject(p.root, true).length).toBeGreaterThan(0);
    }
    expect(fire.layers.test(camera.layers)).toBe(true);
  });

  test("a frame's movement and visibility reach the batch", () => {
    const { people, batch } = setup();
    const m = new THREE.Matrix4();
    people[1]!.arm.rotation.z = Math.PI / 2;
    people[2]!.root.visible = false;
    batch.sync();
    // Instances are in traversal order: body then hand, person by person.
    batch.mesh.getMatrixAt(3, m);
    // Stored as 32-bit floats, so equal to that precision.
    const want = people[1]!.hand.matrixWorld.elements;
    m.elements.forEach((v, i) => expect(Math.abs(v - want[i]!)).toBeLessThan(1e-6));
    // And the arm really did swing.
    expect(Math.abs(want[0]!)).toBeLessThan(1e-6);
    expect(batch.mesh.getVisibleAt(4)).toBe(false);
    expect(batch.mesh.getVisibleAt(5)).toBe(false);
    expect(batch.mesh.getVisibleAt(0)).toBe(true);
  });

  test("too few pieces are not worth a batch", () => {
    const material = new THREE.MeshStandardMaterial();
    const group = new THREE.Group();
    group.add(figure(material, 0).root);
    expect(batchMeshes(THREE, group, material)).toEqual([]);
  });

  test("pieces of different vertex kinds go in separate batches", () => {
    const material = new THREE.MeshStandardMaterial();
    const group = new THREE.Group();
    for (let i = 0; i < 4; i += 1) {
      group.add(new THREE.Mesh(new THREE.BoxGeometry(), material));
      const packed = new THREE.BoxGeometry();
      const p = packed.attributes["position"]!;
      packed.setAttribute(
        "position",
        new THREE.BufferAttribute(
          Int16Array.from(p.array, (v) => v * 100),
          3,
        ),
      );
      group.add(new THREE.Mesh(packed, material));
    }
    const batches = batchMeshes(THREE, group, material, { still: true });
    expect(batches.length).toBe(2);
    expect(batches.map((b) => b.mesh.instanceCount)).toEqual([4, 4]);
  });

  test("still pieces are placed once and then only shown or hidden", () => {
    const material = new THREE.MeshStandardMaterial();
    const group = new THREE.Group();
    const holders = [0, 1, 2].map((x) => {
      const holder = new THREE.Group();
      holder.position.x = x * 3;
      holder.add(new THREE.Mesh(new THREE.BoxGeometry(), material));
      group.add(holder);
      return holder;
    });
    const [batch] = batchMeshes(THREE, group, material, { still: true, min: 3 });
    const m = new THREE.Matrix4();
    batch!.mesh.getMatrixAt(2, m);
    expect(m.elements[12]).toBe(6);
    holders[1]!.visible = false;
    holders[2]!.position.x = 100;
    batch!.sync();
    expect(batch!.mesh.getVisibleAt(1)).toBe(false);
    batch!.mesh.getMatrixAt(2, m);
    expect(m.elements[12]).toBe(6);
  });

  test("interleaved, packed vertices (as a scan's come) are unpicked as stored", () => {
    const material = new THREE.MeshStandardMaterial();
    const group = new THREE.Group();
    // Three corners, packed as 16-bit integers padded to four, beside a normal.
    const data = new Int16Array([0, 0, 0, 7, 100, 0, 0, 7, 0, 100, 0, 7]);
    const buffer = new THREE.InterleavedBuffer(data, 4);
    for (let i = 0; i < 3; i += 1) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.InterleavedBufferAttribute(buffer, 3, 0, false));
      g.setIndex([0, 1, 2]);
      group.add(new THREE.Mesh(g, material));
    }
    const [batch] = batchMeshes(THREE, group, material, { still: true, min: 3 });
    const position = batch!.mesh.geometry.attributes["position"]!;
    expect(position.array).toBeInstanceOf(Int16Array);
    expect(Array.from(position.array.slice(0, 9))).toEqual([0, 0, 0, 100, 0, 0, 0, 100, 0]);
  });
});
