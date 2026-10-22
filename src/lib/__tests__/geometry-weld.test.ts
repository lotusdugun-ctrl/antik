import { describe, expect, test } from "bun:test";
import {
  compactAttribute,
  contentKey,
  remapIndex,
  sameContents,
  weldVertices,
} from "@/lib/geometry-weld";

/** A unit quad as two flat triangles, one vertex per corner (six, four distinct). */
const quad = () => {
  const position = new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0]);
  const normal = new Float32Array(18);
  for (let i = 0; i < 6; i += 1) normal[i * 3 + 2] = 1;
  return { position, normal };
};

/** Expand an indexed buffer back to one vertex per corner. */
const expand = (array: Float32Array, size: number, index: ArrayLike<number>) => {
  const out = new Float32Array(index.length * size);
  for (let i = 0; i < index.length; i += 1)
    for (let k = 0; k < size; k += 1) out[i * size + k] = array[index[i]! * size + k]!;
  return out;
};

describe("welding exact duplicate vertices", () => {
  test("a flattened quad comes back as four vertices and six indices", () => {
    const { position, normal } = quad();
    const weld = weldVertices(
      [
        { array: position, itemSize: 3 },
        { array: normal, itemSize: 3 },
      ],
      6,
    );
    expect(weld.count).toBe(4);
    const index = remapIndex(weld, null);
    expect(index).toBeInstanceOf(Uint16Array);
    expect(index.length).toBe(6);
    const p = compactAttribute(position, 3, weld.source);
    const n = compactAttribute(normal, 3, weld.source);
    // Drawn through the index, every triangle corner is exactly what it was.
    expect(expand(p, 3, index)).toEqual(position);
    expect(expand(n, 3, index)).toEqual(normal);
  });
  test("vertices that differ in any attribute stay apart (a sharp edge stays sharp)", () => {
    const { position, normal } = quad();
    // The second triangle faces another way.
    for (let i = 3; i < 6; i += 1) normal[i * 3 + 2] = -1;
    const weld = weldVertices(
      [
        { array: position, itemSize: 3 },
        { array: normal, itemSize: 3 },
      ],
      6,
    );
    expect(weld.count).toBe(6);
  });
  test("an existing index is remapped, not replaced", () => {
    const position = new Float32Array([0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0]);
    const weld = weldVertices([{ array: position, itemSize: 3 }], 4);
    expect(weld.count).toBe(3);
    expect(Array.from(remapIndex(weld, [0, 1, 3, 2, 1, 3]))).toEqual([0, 1, 2, 0, 1, 2]);
  });
  test("large buffers get a 32-bit index", () => {
    const n = 70000;
    const position = new Float32Array(n * 3);
    for (let i = 0; i < n; i += 1) position[i * 3] = i;
    const weld = weldVertices([{ array: position, itemSize: 3 }], n);
    expect(weld.count).toBe(n);
    expect(remapIndex(weld, null)).toBeInstanceOf(Uint32Array);
  });
  test("integer attributes weld too", () => {
    const colour = new Uint16Array([1, 2, 3, 1, 2, 3, 4, 5, 6]);
    expect(weldVertices([{ array: colour, itemSize: 3 }], 3).count).toBe(2);
  });
});

describe("content keys, for sharing geometry built twice", () => {
  test("equal contents share a key and compare equal", () => {
    const a = quad();
    const b = quad();
    expect(contentKey([a.position, a.normal])).toBe(contentKey([b.position, b.normal]));
    expect(sameContents([a.position, a.normal], [b.position, b.normal])).toBe(true);
  });
  test("any change changes the key", () => {
    const a = quad();
    const b = quad();
    b.position[4] = 0.5;
    expect(contentKey([a.position])).not.toBe(contentKey([b.position]));
    expect(sameContents([a.position], [b.position])).toBe(false);
    expect(contentKey([a.position, a.normal])).not.toBe(contentKey([a.normal, a.position]));
  });
});
