import { describe, expect, test } from "bun:test";
import { excludeSeeThroughFromAo, hiddenFromAo } from "@/lib/ao-visibility";

describe("ambient occlusion leaves out what is see-through", () => {
  test("sprites, points, lines and transparent non-depth surfaces are hidden", () => {
    expect(hiddenFromAo({ visible: true, isSprite: true })).toBe(true);
    expect(hiddenFromAo({ visible: true, isPoints: true })).toBe(true);
    expect(
      hiddenFromAo({ visible: true, material: { transparent: true, depthWrite: false } }),
    ).toBe(true);
  });

  test("solid surfaces and already hidden objects are left alone", () => {
    expect(
      hiddenFromAo({ visible: true, material: { transparent: false, depthWrite: true } }),
    ).toBe(false);
    expect(hiddenFromAo({ visible: true, material: { transparent: true, depthWrite: true } })).toBe(
      false,
    );
    expect(hiddenFromAo({ visible: false, isSprite: true })).toBe(false);
    expect(hiddenFromAo({ visible: true })).toBe(false);
  });

  test("the pass hides them for its normal render and gets them back", () => {
    const smoke = { visible: true, isSprite: true };
    const stone = { visible: true, material: { transparent: false, depthWrite: true } };
    const pass = {
      _visibilityCache: [] as { visible: boolean }[],
      _overrideVisibility: () => {},
      _restoreVisibility() {
        for (const o of this._visibilityCache) o.visible = true;
        this._visibilityCache.length = 0;
      },
    };
    excludeSeeThroughFromAo(pass, { traverse: (fn) => [smoke, stone].forEach(fn) });
    pass._overrideVisibility();
    expect([smoke.visible, stone.visible]).toEqual([false, true]);
    pass._restoreVisibility();
    expect(smoke.visible).toBe(true);
  });
});
