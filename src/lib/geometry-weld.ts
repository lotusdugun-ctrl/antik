/**
 * Shrinking the generated geometry without changing a single pixel of it.
 *
 * The models are built from primitives that are flattened to one vertex per
 * triangle corner so they can be merged and tinted. A sphere or a column
 * drum flattened that way carries every vertex five or six times over — the
 * same position, the same normal, the same colour. Welding those exact
 * duplicates back into one indexed vertex leaves the surface, its shading and
 * its texture coordinates bit for bit what they were, and the GPU transforms
 * each corner once instead of six times.
 *
 * Only exact copies are joined: a flat-shaded edge, where two faces meet with
 * different normals, keeps both of its vertices, so nothing becomes smooth
 * that was meant to be sharp.
 */

/** Typed arrays a vertex attribute can hold. */
export type AttributeArray =
  Float32Array | Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array;

/** One attribute of a vertex buffer: its values and how many make a vertex. */
export type WeldInput = { array: AttributeArray; itemSize: number };

export type WeldResult = {
  /** For each original vertex, the welded vertex it became. */
  index: Uint32Array;
  /** For each welded vertex, the first original vertex it was copied from. */
  source: Uint32Array;
  /** How many vertices are left. */
  count: number;
};

/** The raw bits of a typed array, read 32 bits (or fewer) at a time. */
const bitsOf = (array: AttributeArray): Uint32Array | Int32Array | Uint16Array | Uint8Array => {
  if (array instanceof Float32Array)
    return new Uint32Array(array.buffer, array.byteOffset, array.length);
  if (array instanceof Int8Array)
    return new Uint8Array(array.buffer, array.byteOffset, array.length);
  if (array instanceof Int16Array)
    return new Uint16Array(array.buffer, array.byteOffset, array.length);
  return array;
};

/**
 * Find the vertices that are exact copies of an earlier one, across every
 * attribute at once. `count` is the number of vertices; each attribute's
 * array holds `count * itemSize` values.
 */
export function weldVertices(attributes: WeldInput[], count: number): WeldResult {
  const views = attributes.map((a) => ({ bits: bitsOf(a.array), size: a.itemSize }));
  for (const v of views) {
    if (v.bits.length < count * v.size) throw new Error("attribute shorter than vertex count");
  }
  // Open addressing, at most half full, so a probe is short.
  let capacity = 16;
  while (capacity < count * 2) capacity *= 2;
  const mask = capacity - 1;
  const table = new Int32Array(capacity).fill(-1);
  const index = new Uint32Array(count);
  const source = new Uint32Array(count);
  let unique = 0;
  const same = (a: number, b: number) => {
    for (const { bits, size } of views) {
      const ia = a * size;
      const ib = b * size;
      for (let k = 0; k < size; k += 1) if (bits[ia + k] !== bits[ib + k]) return false;
    }
    return true;
  };
  for (let i = 0; i < count; i += 1) {
    // FNV-1a over the bits of every component.
    let h = 0x811c9dc5;
    for (const { bits, size } of views) {
      const base = i * size;
      for (let k = 0; k < size; k += 1) {
        h ^= bits[base + k]!;
        h = Math.imul(h, 0x01000193);
      }
    }
    h ^= h >>> 15;
    let slot = h & mask;
    for (;;) {
      const found = table[slot]!;
      if (found < 0) {
        table[slot] = unique;
        source[unique] = i;
        index[i] = unique;
        unique += 1;
        break;
      }
      if (same(source[found]!, i)) {
        index[i] = found;
        break;
      }
      slot = (slot + 1) & mask;
    }
  }
  return { index, source: source.slice(0, unique), count: unique };
}

/** The values of the welded vertices only, in welded order. */
export function compactAttribute<T extends AttributeArray>(
  array: T,
  itemSize: number,
  source: Uint32Array,
): T {
  const Ctor = array.constructor as new (length: number) => T;
  const out = new Ctor(source.length * itemSize);
  for (let i = 0; i < source.length; i += 1) {
    const from = source[i]! * itemSize;
    const to = i * itemSize;
    for (let k = 0; k < itemSize; k += 1) out[to + k] = array[from + k]!;
  }
  return out;
}

/** Remap an existing index through a weld, or build one for a flat buffer. */
export function remapIndex(
  weld: WeldResult,
  original: ArrayLike<number> | null,
): Uint16Array | Uint32Array {
  const length = original ? original.length : weld.index.length;
  const out = weld.count <= 65535 ? new Uint16Array(length) : new Uint32Array(length);
  for (let i = 0; i < length; i += 1) out[i] = weld.index[original ? original[i]! : i]!;
  return out;
}

/**
 * A fingerprint of a geometry's contents, for finding geometries that are
 * the same shape built twice (the same far figure for two people dressed
 * alike). Equal geometries always get the same key; a shared key is checked
 * value by value before two are treated as one (see `sameContents`).
 */
export function contentKey(arrays: AttributeArray[]): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  let length = 0;
  for (const array of arrays) {
    const bits = bitsOf(array);
    length += bits.length;
    for (let i = 0; i < bits.length; i += 1) {
      const v = bits[i]!;
      h1 = Math.imul(h1 ^ v, 0x01000193);
      h2 = Math.imul(h2 ^ v, 0x85ebca6b) ^ (h2 >>> 13);
    }
    h1 = Math.imul(h1 ^ 0xff, 0x01000193);
  }
  return `${length}:${(h1 >>> 0).toString(36)}:${(h2 >>> 0).toString(36)}`;
}

/** Whether two lists of arrays hold exactly the same values. */
export function sameContents(a: AttributeArray[], b: AttributeArray[]): boolean {
  if (a.length !== b.length) return false;
  for (let k = 0; k < a.length; k += 1) {
    const x = bitsOf(a[k]!);
    const y = bitsOf(b[k]!);
    if (x.length !== y.length || x.constructor !== y.constructor) return false;
    for (let i = 0; i < x.length; i += 1) if (x[i] !== y[i]) return false;
  }
  return true;
}
