/**
 * What the ambient-occlusion pass must not see.
 *
 * GTAO draws the whole scene once more with a plain normal material to read
 * depth and normals. Anything see-through is drawn there as a solid quad, so
 * the smoke over an altar, a glow or a cloud came out of that pass as an
 * opaque block and the occlusion it computed painted a black column into the
 * frame. Three's pass already leaves out points and lines; this adds sprites
 * and every transparent surface that does not write depth.
 */
type Materialish = { transparent?: boolean; depthWrite?: boolean };
type Objectish = {
  visible: boolean;
  isPoints?: boolean;
  isLine?: boolean;
  isLine2?: boolean;
  isSprite?: boolean;
  material?: Materialish | Materialish[];
};

const seeThrough = (m: Materialish | undefined) =>
  !!m && m.transparent === true && m.depthWrite === false;

export function hiddenFromAo(object: Objectish): boolean {
  if (!object.visible) return false;
  if (object.isPoints || object.isLine || object.isLine2 || object.isSprite) return true;
  const { material } = object;
  if (!material) return false;
  return Array.isArray(material)
    ? material.length > 0 && material.every(seeThrough)
    : seeThrough(material);
}

/**
 * Replaces the pass's own visibility override with one that also hides the
 * see-through objects. The pass restores whatever it put in its cache.
 */
export function excludeSeeThroughFromAo(
  pass: unknown,
  scene: { traverse: (fn: (o: Objectish) => void) => void },
) {
  const ao = pass as { _overrideVisibility?: () => void; _visibilityCache?: Objectish[] };
  if (typeof ao._overrideVisibility !== "function" || !Array.isArray(ao._visibilityCache)) return;
  const cache = ao._visibilityCache;
  ao._overrideVisibility = () => {
    scene.traverse((object) => {
      if (hiddenFromAo(object)) {
        object.visible = false;
        cache.push(object);
      }
    });
  };
}
