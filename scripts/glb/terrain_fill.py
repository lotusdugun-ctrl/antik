"""Fill the unlit holes in a site's terrain lightmap.

    python3 terrain_fill.py <terrain-golden.png> [more ...]   (in place; keeps <name>.orig.png)

Where a scenery mound or slab of the model sinks into the ground, the bake's rays
start inside it and the terrain under it comes out pure black. In Unity the mound
is hidden under the terrain, so the patch reads as a black pit in the land. Those
pixels (all channels near zero) are painted in from the light round them.
"""
import os
import sys

import cv2
import numpy as np

for path in sys.argv[1:]:
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    mask = (img.astype(np.int32).sum(axis=2) < 10).astype(np.uint8) * 255
    # and the dark rim round each hole, where the bake's samples half hit the mound
    dark = (img.astype(np.int32).sum(axis=2) < 70).astype(np.uint8) * 255
    near = cv2.dilate(mask, np.ones((15, 15), np.uint8))
    mask = cv2.dilate(cv2.bitwise_and(dark, near) | mask, np.ones((5, 5), np.uint8))
    frac = mask.mean() / 255
    orig = path[:-4] + ".orig.png"
    if not os.path.exists(orig):
        cv2.imwrite(orig, img)
    if frac == 0:
        print(path, "clean")
        continue
    # A wide radius: the holes are tens of pixels across.
    small = cv2.resize(img, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
    smask = cv2.resize(mask, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_NEAREST)
    fill = cv2.inpaint(small, smask, 9, cv2.INPAINT_TELEA)
    fill = cv2.resize(fill, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    grown = cv2.dilate(mask, np.ones((5, 5), np.uint8))
    soft = cv2.GaussianBlur(grown.astype(np.float32) / 255, (9, 9), 0)[..., None]
    out = img * (1 - soft) + fill * soft
    cv2.imwrite(path, np.clip(out, 0, 255).astype(np.uint8))
    print(path, f"filled {frac:.4f}")
