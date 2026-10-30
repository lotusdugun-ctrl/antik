"""
Antik Türkiye: realistic trees and bushes for the baked scenes (Blender, numpy only).

The web scene draws its trees as lumps (a ball of leaves on a stick): fine far away,
toy-like up close. antik_bake.py calls replace_flora() after it has realised the
landscape's instances: every crown, trunk, cypress, conifer and bush is swapped for
a generated plant of the site's biome, at the same place and size, with

  - a branching trunk and limbs (tubes, bark texture),
  - leaf "cards": small quads carrying a photo-like spray of leaves (alpha cut-out),
    gathered in clumps so the light comes through between them as on an olive,
  - TEXCOORD_0 = the texture, TEXCOORD_1 = (height above the foot, flutter) for the
    phone's wind (Antik/BakedLit, _WindUV = 1),
  - the instance's tint in the vertex colour; the bake multiplies its light in.

Everything is seeded from the plant's position: the same scene gives the same trees.
"""
import math
import os
import random

import numpy as np

# ---------------------------------------------------------------- textures

# Foliage atlas: 4 x 2 cells; each cell is one spray, anchored at its bottom centre.
CELLS = {"olive": 0, "broad": 1, "needle": 2, "cypress": 3, "maquis": 4, "grass": 5, "juniper": 6, "beech": 7}
ATLAS_COLS, ATLAS_ROWS = 4, 2


def _cell_rect(kind):
    i = CELLS[kind]
    c, r = i % ATLAS_COLS, i // ATLAS_COLS
    # UV origin bottom-left; a small inset keeps mip levels from bleeding
    u0, v0 = c / ATLAS_COLS, 1.0 - (r + 1) / ATLAS_ROWS
    du, dv = 1.0 / ATLAS_COLS, 1.0 / ATLAS_ROWS
    e = 0.004
    return u0 + e * du, v0 + e * dv, u0 + (1 - e) * du, v0 + (1 - e) * dv


class Canvas:
    """RGBA float canvas, y up (0 = bottom), drawn supersampled."""

    def __init__(self, n):
        self.n = n
        self.rgb = np.zeros((n, n, 3), np.float32)
        self.a = np.zeros((n, n), np.float32)

    def leaf(self, x, y, ang, length, width, col, shape=0.8, rib=0.25, tipround=0.0):
        """A leaf from (x, y) (its stalk end) along angle ang (radians, 0 = up)."""
        n = self.n
        dx, dy = math.sin(ang), math.cos(ang)
        ex, ey = x + dx * length, y + dy * length
        r = max(width, 1.0) + 2
        x0, x1 = int(max(0, min(x, ex) - r)), int(min(n - 1, max(x, ex) + r)) + 1
        y0, y1 = int(max(0, min(y, ey) - r)), int(min(n - 1, max(y, ey) + r)) + 1
        if x1 <= x0 or y1 <= y0:
            return
        X, Y = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
        px, py = X - x, Y - y
        t = (px * dx + py * dy) / length          # along, 0..1
        s = (px * dy - py * dx)                    # across, pixels
        prof = np.clip(np.sin(np.pi * np.clip(t, 0, 1)), 0, 1) ** shape
        if tipround:
            prof = np.maximum(prof, np.where(t > 0.5, tipround * np.sqrt(np.clip(1 - ((t - 0.5) * 2) ** 2, 0, 1)), 0))
        half = width * 0.5 * prof
        inside = (t >= 0) & (t <= 1) & (np.abs(s) <= half)
        if not inside.any():
            return
        # shading: lighter towards one edge (the leaf is curved), a darker midrib
        across = np.where(half > 0, s / np.maximum(half, 1e-3), 0)
        shade = 0.88 + 0.16 * across - 0.10 * (1 - t) * 0.5
        shade = shade - rib * np.exp(-(s / 0.9) ** 2) * (t < 0.95)
        c = np.array(col, np.float32)[None, None, :] * shade[..., None]
        sl = (slice(y0, y1), slice(x0, x1))
        self.rgb[sl] = np.where(inside[..., None], c, self.rgb[sl])
        self.a[sl] = np.where(inside, 1.0, self.a[sl])

    def line(self, pts, w0, w1, col):
        """A tapered twig through pts (list of (x, y)), widths in pixels."""
        n = self.n
        for k in range(len(pts) - 1):
            (ax, ay), (bx, by) = pts[k], pts[k + 1]
            wa = w0 + (w1 - w0) * k / max(1, len(pts) - 1)
            wb = w0 + (w1 - w0) * (k + 1) / max(1, len(pts) - 1)
            r = max(wa, wb) + 2
            x0, x1 = int(max(0, min(ax, bx) - r)), int(min(n - 1, max(ax, bx) + r)) + 1
            y0, y1 = int(max(0, min(ay, by) - r)), int(min(n - 1, max(ay, by) + r)) + 1
            if x1 <= x0 or y1 <= y0:
                continue
            X, Y = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
            vx, vy = bx - ax, by - ay
            L2 = vx * vx + vy * vy + 1e-9
            t = np.clip(((X - ax) * vx + (Y - ay) * vy) / L2, 0, 1)
            d = np.hypot(X - (ax + t * vx), Y - (ay + t * vy))
            w = (wa + (wb - wa) * t) * 0.5
            inside = d <= w
            sl = (slice(y0, y1), slice(x0, x1))
            shade = (0.8 + 0.25 * (1 - d / np.maximum(w, 1e-3)))[..., None]
            self.rgb[sl] = np.where(inside[..., None], np.array(col, np.float32) * shade, self.rgb[sl])
            self.a[sl] = np.where(inside, 1.0, self.a[sl])


def _curve(rng, x, y, ang, length, bend, steps=8):
    pts = [(x, y)]
    a = ang
    for _ in range(steps):
        a += rng.uniform(-bend, bend)
        x += math.sin(a) * length / steps
        y += math.cos(a) * length / steps
        pts.append((x, y))
    return pts, a


def _jit(rng, col, v=0.08, hue=0.04):
    k = 1 + rng.uniform(-v, v)
    h = rng.uniform(-hue, hue)
    return (col[0] * k * (1 + h), col[1] * k, col[2] * k * (1 - h))


def _spray(cv, rng, kind):
    """One cell: a spray of foliage growing up from the bottom centre."""
    n = cv.n
    twig = (0.42, 0.34, 0.27)
    if kind in ("olive", "broad", "maquis", "beech"):
        p = {
            # leaf length, width (share of the cell), leaves per twig, twigs, colours
            "olive": dict(L=0.12, W=0.026, per=16, twigs=10, shape=0.9, cols=[(0.78, 0.84, 0.70), (0.93, 0.95, 0.90), (0.70, 0.77, 0.62)], rib=0.12),
            "broad": dict(L=0.085, W=0.05, per=10, twigs=8, shape=0.55, cols=[(0.80, 0.88, 0.66), (0.70, 0.80, 0.58), (0.90, 0.95, 0.76)], rib=0.22),
            "beech": dict(L=0.10, W=0.06, per=9, twigs=8, shape=0.6, cols=[(0.80, 0.90, 0.62), (0.70, 0.82, 0.55), (0.92, 0.97, 0.72)], rib=0.25),
            "maquis": dict(L=0.065, W=0.03, per=18, twigs=12, shape=0.7, cols=[(0.74, 0.82, 0.64), (0.62, 0.72, 0.54), (0.86, 0.92, 0.76)], rib=0.1),
        }[kind]
        L, W = p["L"] * n, p["W"] * n
        for k in range(p["twigs"]):
            base_x = n * (0.5 + rng.uniform(-0.06, 0.06))
            ang = rng.uniform(-1.05, 1.05) * (0.35 + 0.65 * k / p["twigs"])
            length = n * rng.uniform(0.45, 0.85)
            pts, _ = _curve(rng, base_x, n * 0.01, ang, length, 0.12)
            cv.line(pts, n * 0.008, n * 0.003, twig)
            for j in range(p["per"]):
                t = 0.18 + 0.82 * j / p["per"]
                idx = min(len(pts) - 2, int(t * (len(pts) - 1)))
                (ax, ay), (bx, by) = pts[idx], pts[idx + 1]
                f = t * (len(pts) - 1) - idx
                x, y = ax + (bx - ax) * f, ay + (by - ay) * f
                d = math.atan2(bx - ax, by - ay)
                side = 1 if j % 2 else -1
                la = d + side * rng.uniform(0.35, 0.95)
                ll = L * rng.uniform(0.75, 1.15) * (0.75 + 0.25 * (1 - abs(t - 0.6)))
                cv.leaf(x, y, la, ll, W * rng.uniform(0.8, 1.2), _jit(rng, p["cols"][rng.randrange(3)]), p["shape"], p["rib"])
            # the end leaf
            (ax, ay), (bx, by) = pts[-2], pts[-1]
            cv.leaf(bx, by, math.atan2(bx - ax, by - ay), L, W, _jit(rng, p["cols"][0]), p["shape"], p["rib"])
    elif kind in ("needle", "juniper"):
        for k in range(8 if kind == "needle" else 14):
            base_x = n * (0.5 + rng.uniform(-0.05, 0.05))
            ang = rng.uniform(-0.8, 0.8)
            pts, _ = _curve(rng, base_x, n * 0.01, ang, n * rng.uniform(0.4, 0.75), 0.1)
            cv.line(pts, n * 0.012, n * 0.005, (0.38, 0.30, 0.24))
            for j in range(26 if kind == "needle" else 70):
                t = 0.25 + 0.75 * rng.random()
                idx = min(len(pts) - 2, int(t * (len(pts) - 1)))
                x, y = pts[idx]
                d = math.atan2(pts[idx + 1][0] - x, pts[idx + 1][1] - y)
                if kind == "needle":
                    for s in (-1, 1):
                        la = d + s * rng.uniform(0.25, 0.9)
                        cv.leaf(x, y, la, n * rng.uniform(0.09, 0.15), n * 0.006, _jit(rng, (0.72, 0.84, 0.66)), 0.3, 0.0)
                else:
                    la = d + rng.uniform(-1.2, 1.2)
                    cv.leaf(x, y, la, n * rng.uniform(0.025, 0.05), n * 0.012, _jit(rng, (0.70, 0.80, 0.66), 0.12), 0.5, 0.05)
    elif kind == "cypress":
        # flat fan-like sprays of scale leaves: a branching frond, dense
        def frond(x, y, ang, length, depth):
            pts, _ = _curve(rng, x, y, ang, length, 0.05, 6)
            cv.line(pts, n * 0.012 * (depth + 1) / 3, n * 0.006, (0.50, 0.58, 0.44))
            for j in range(1, len(pts)):
                px, py = pts[j]
                for s in (-1, 1):
                    if depth > 0 and j % 2 == 0:
                        frond(px, py, ang + s * rng.uniform(0.5, 0.8), length * 0.42, depth - 1)
                    else:
                        cv.leaf(px, py, ang + s * rng.uniform(0.4, 0.9), length * 0.16, n * 0.016, _jit(rng, (0.60, 0.72, 0.56), 0.12), 0.45, 0.0)
        for k in range(5):
            frond(n * (0.5 + rng.uniform(-0.04, 0.04)), n * 0.01, rng.uniform(-0.45, 0.45), n * rng.uniform(0.42, 0.58), 2)
    elif kind == "grass":
        for k in range(70):
            x = n * (0.5 + rng.gauss(0, 0.08))
            ang = rng.gauss(0, 0.35)
            length = n * rng.uniform(0.35, 0.95)
            col = _jit(rng, (0.86, 0.88, 0.70), 0.15, 0.08)
            pts, _ = _curve(rng, x, n * 0.005, ang, length, 0.06 + abs(ang) * 0.1, 10)
            cv.line(pts, n * 0.010, n * 0.0015, col)


def foliage_atlas(cell=512, seed=7):
    """RGBA float32 atlas (H, W, 4), y up, colour bled into the clear parts."""
    rng = random.Random(seed)
    W, H = cell * ATLAS_COLS, cell * ATLAS_ROWS
    out = np.zeros((H, W, 4), np.float32)
    ss = 2
    for kind, i in CELLS.items():
        cv = Canvas(cell * ss)
        _spray(cv, rng, kind)
        rgb = cv.rgb.reshape(cell, ss, cell, ss, 3).mean((1, 3))
        a = cv.a.reshape(cell, ss, cell, ss).mean((1, 3))
        # straight (not premultiplied) colour: divide by coverage
        rgb = np.where(a[..., None] > 1e-4, rgb / np.maximum(a[..., None], 1e-4), 0)
        rgb = _bleed(rgb, a > 0.02)
        c, r = i % ATLAS_COLS, i // ATLAS_COLS
        y0 = H - (r + 1) * cell  # row 0 at the top of the image, y up in the array
        out[y0:y0 + cell, c * cell:(c + 1) * cell, :3] = rgb
        out[y0:y0 + cell, c * cell:(c + 1) * cell, 3] = a
    return out


def _bleed(rgb, mask, rounds=24):
    """Spread colour into the transparent texels (no dark fringes at a distance)."""
    rgb = rgb.copy()
    m = mask.copy()
    mean = rgb[m].mean(0) if m.any() else np.array([0.7, 0.75, 0.6])
    for _ in range(rounds):
        acc = np.zeros_like(rgb); cnt = np.zeros(m.shape, np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            acc += np.roll(np.roll(rgb * m[..., None], dy, 0), dx, 1)
            cnt += np.roll(np.roll(m.astype(np.float32), dy, 0), dx, 1)
        new = (~m) & (cnt > 0)
        rgb[new] = acc[new] / cnt[new][:, None]
        m = m | new
    rgb[~m] = mean
    return rgb


def bark_texture(w=256, h=512, seed=3):
    """Grey, vertically fibrous bark with furrows; the vertex colour gives its hue."""
    rng = np.random.default_rng(seed)

    def noise(fx, fy, oct=4):
        acc = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
        for o in range(oct):
            gx, gy = int(fx * 2 ** o), int(fy * 2 ** o)
            g = rng.random((gy + 1, gx + 1)).astype(np.float32)
            g[:, -1] = g[:, 0]; g[-1, :] = g[0, :]   # tiles
            ys = np.linspace(0, gy, h, endpoint=False); xs = np.linspace(0, gx, w, endpoint=False)
            yi, xi = ys.astype(int), xs.astype(int)
            ty, tx = (ys - yi)[:, None], (xs - xi)[None, :]
            ty, tx = ty * ty * (3 - 2 * ty), tx * tx * (3 - 2 * tx)
            a = g[yi][:, xi]; b = g[yi][:, xi + 1]; c = g[yi + 1][:, xi]; d = g[yi + 1][:, xi + 1]
            acc += amp * ((a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty)
            tot += amp; amp *= 0.5
        return acc / tot

    fib = noise(24, 3)
    furrow = np.abs(noise(6, 1.5, 3) - 0.5) * 2
    v = 0.55 + 0.45 * fib
    v *= 0.55 + 0.45 * np.clip(furrow * 1.6, 0, 1)
    v *= 0.85 + 0.15 * noise(4, 8, 2)
    rgb = np.stack([v * 1.0, v * 0.97, v * 0.93], -1)
    return np.concatenate([rgb, np.ones((h, w, 1), np.float32)], -1)


# ---------------------------------------------------------------- geometry

class Builder:
    """Vertices, faces and per-corner data for one mesh (z up, metres)."""

    def __init__(self):
        self.v = []; self.f = []
        self.uv = []; self.wind = []; self.nrm = []; self.col = []; self.mat = []

    def tube(self, path, radii, sides, col, foot, flutter=0.0, vscale=1.0, uscale=1.0):
        """A tube along path (list of Vectors) with a radius per point; bark UVs."""
        from mathutils import Vector
        rings = []
        prev_side = None
        lengths = [0.0]
        for i in range(1, len(path)):
            lengths.append(lengths[-1] + (path[i] - path[i - 1]).length)
        for i, p in enumerate(path):
            d = (path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)])
            d = d.normalized() if d.length > 1e-9 else Vector((0, 0, 1))
            if prev_side is None:
                side = d.orthogonal().normalized()
            else:
                side = (prev_side - d * prev_side.dot(d))
                side = side.normalized() if side.length > 1e-6 else d.orthogonal().normalized()
            prev_side = side
            up = d.cross(side)
            ring = []
            for k in range(sides + 1):
                a = 2 * math.pi * k / sides
                n = side * math.cos(a) + up * math.sin(a)
                ring.append((p + n * radii[i], n))
            rings.append(ring)
        base = len(self.v)
        for i, ring in enumerate(rings):
            for k, (q, n) in enumerate(ring):
                self.v.append(q)
        circ = 2 * math.pi * max(radii[0], 0.02)
        ur = max(1, round(circ * uscale / 0.6))
        for i in range(len(rings) - 1):
            for k in range(sides):
                a = base + i * (sides + 1) + k
                b = a + 1
                c = a + sides + 1 + 1
                d = a + sides + 1
                self.f.append((a, b, c, d))
                for (vi, ii, kk) in ((a, i, k), (b, i, k + 1), (c, i + 1, k + 1), (d, i + 1, k)):
                    self.uv.append((ur * kk / sides * 0.999, lengths[ii] / (0.6 * vscale)))
                    self.wind.append((max(0.0, self.v[vi].z - foot), flutter))
                    self.nrm.append(tuple(rings[ii][kk][1]))
                    self.col.append(col)
                self.mat.append(0)

    def card(self, base, up, right, size, kind, col, foot, normal_hint=None, flutter=1.0, width=1.0):
        """A leaf card: bottom centre at base, growing along up."""
        u0, v0, u1, v1 = _cell_rect(kind)
        r = right * (size * 0.5 * width)
        t = up * size
        corners = [base - r, base + r, base + r + t, base - r + t]
        uvs = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        n0 = right.cross(up).normalized()
        i0 = len(self.v)
        self.v.extend(corners)
        self.f.append((i0, i0 + 1, i0 + 2, i0 + 3))
        for k in range(4):
            self.uv.append(uvs[k])
            fl = flutter * (0.35 if k < 2 else 1.0)
            self.wind.append((max(0.0, corners[k].z - foot), fl))
            if normal_hint is not None:
                n = (normal_hint(corners[k]) * 0.7 + n0 * 0.3).normalized()
            else:
                n = n0
            self.nrm.append(tuple(n))
            self.col.append(col)
        self.mat.append(1)


def _rand_unit(rng):
    from mathutils import Vector
    while True:
        v = Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)))
        if 0.05 < v.length <= 1:
            return v.normalized()


def _card_frame(rng, out, up_bias=0.4, droop=0.0):
    """An up and a right vector for a card growing outwards along `out`."""
    from mathutils import Vector
    z = Vector((0, 0, 1))
    up = (out + z * up_bias + _rand_unit(rng) * 0.45 - z * droop)
    up = up.normalized() if up.length > 1e-6 else z
    right = up.cross(_rand_unit(rng))
    right = right.normalized() if right.length > 1e-6 else up.orthogonal().normalized()
    return up, right


def _gnarled(rng, start, direction, length, steps, wander, rise=0.0):
    from mathutils import Vector
    pts = [start.copy()]
    d = direction.normalized()
    for i in range(steps):
        d = (d + _rand_unit(rng) * wander + Vector((0, 0, rise))).normalized()
        pts.append(pts[-1] + d * (length / steps))
    return pts


def _nearest_on(paths, p):
    best = None
    for path, radii in paths:
        for i, q in enumerate(path):
            d = (q - p).length
            if best is None or d < best[0]:
                best = (d, q, radii[i])
    return best


# Species: crown envelope (from the trunk's split height to the top), clumps, cards.
SPECIES = {
    "olive": dict(cell="olive", split=0.2, limbs=(3, 5), spread=0.7, gnarl=0.45, crown_lo=0.26,
                  clumps=(16, 24), cards=(10, 16), card=0.16, clump_r=0.17, shell=(0.45, 1.0),
                  bark=(0.42, 0.40, 0.36), girth=0.095, flat=0.85),
    "broad": dict(cell="broad", split=0.35, limbs=(3, 5), spread=0.5, gnarl=0.25, crown_lo=0.33,
                  clumps=(22, 30), cards=(12, 18), card=0.15, clump_r=0.16, shell=(0.35, 1.0),
                  bark=(0.36, 0.31, 0.26), girth=0.07, flat=0.95),
    "beech": dict(cell="beech", split=0.4, limbs=(4, 6), spread=0.42, gnarl=0.15, crown_lo=0.35,
                  clumps=(26, 36), cards=(12, 18), card=0.14, clump_r=0.15, shell=(0.35, 1.0),
                  bark=(0.55, 0.55, 0.52), girth=0.06, flat=1.0),
    "juniper": dict(cell="juniper", split=0.2, limbs=(3, 5), spread=0.45, gnarl=0.4, crown_lo=0.18,
                    clumps=(18, 26), cards=(10, 16), card=0.17, clump_r=0.17, shell=(0.3, 1.0),
                    bark=(0.40, 0.33, 0.28), girth=0.08, flat=1.0),
}

BIOME_OF = {
    "gobeklitepe-d-yapisi": "steppe", "aizanoi-zeus-tapinagi": "steppe", "nemrut-dogu-terasi": "mountain",
    "hattusa-aslanli-kapi": "steppe", "catalhoyuk-dogu-hoyugu": "steppe", "ani-katedrali": "steppe",
    "sumela-manastiri": "pontic", "sagalassos-antoninler-cesmesi": "alpine",
}
# what a "crown" tree and a "bush" are in each biome
CROWN_OF = {"mediterranean": "olive", "steppe": "broad", "mountain": "broad", "alpine": "juniper", "pontic": "beech"}
BUSH_OF = {"mediterranean": "maquis", "steppe": "steppe", "mountain": "grass", "alpine": "juniper", "pontic": "broad"}


def crown_tree(b, rng, base, h, w, spec, tint, shade):
    """A broadleaf tree: trunk, limbs, then clumps of leaf cards on twigs."""
    from mathutils import Vector
    S = SPECIES[spec]
    foot = base.z
    girth = max(0.12, h * S["girth"]) * 0.5
    split = h * S["split"] * rng.uniform(0.85, 1.15)
    bark = tuple(c * (0.85 + 0.3 * shade) for c in S["bark"]) + (1.0,)
    lean = Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), 0)) * 0.12
    trunk = _gnarled(rng, base - Vector((0, 0, 0.3)), Vector((0, 0, 1)) + lean, split + 0.3, 5, S["gnarl"] * 0.25, 0.2)
    tr = [girth * (1.25 - 0.35 * i / (len(trunk) - 1)) for i in range(len(trunk))]
    tr[0] *= 1.25
    b.tube(trunk, tr, 9, bark, foot, 0.0)
    paths = [(trunk, tr)]
    top = trunk[-1]
    # crown envelope: an ellipsoid over the split
    c_lo = foot + h * S["crown_lo"]
    cz = (c_lo + foot + h) * 0.5
    rz = (foot + h - c_lo) * 0.5
    rxy = w * 0.5
    centre = Vector((base.x, base.y, cz)) + lean * h * 0.4
    # limbs: out and up towards the envelope's shell
    nl = rng.randint(*S["limbs"])
    a0 = rng.uniform(0, 2 * math.pi)
    for k in range(nl):
        a = a0 + 2 * math.pi * (k + rng.uniform(-0.25, 0.25)) / nl
        target = centre + Vector((math.cos(a) * rxy * rng.uniform(0.45, 0.8), math.sin(a) * rxy * rng.uniform(0.45, 0.8),
                                  rz * rng.uniform(-0.1, 0.6)))
        d = target - top
        pts = _gnarled(rng, top, d.normalized() * (1 - S["spread"]) + Vector((math.cos(a), math.sin(a), 0.4)) * S["spread"],
                       d.length, 6, S["gnarl"], 0.05)
        r0 = girth * rng.uniform(0.55, 0.75)
        rr = [r0 * (1 - 0.75 * i / (len(pts) - 1)) for i in range(len(pts))]
        b.tube(pts, rr, 7, bark, foot, 0.0)
        paths.append((pts, rr))
    # clumps of foliage, mostly on the outer part of the envelope
    nc = int(rng.randint(*S["clumps"]) * max(0.6, min(1.8, (w * h) / 30.0)))
    card = max(0.5, h * S["card"]) * rng.uniform(0.9, 1.1)

    def radial(p):
        d = p - centre
        d = Vector((d.x / max(rxy, 0.1), d.y / max(rxy, 0.1), d.z / max(rz, 0.1)))
        return d.normalized() if d.length > 1e-6 else Vector((0, 0, 1))

    for c in range(nc):
        for _ in range(20):
            u = _rand_unit(rng) * rng.uniform(*S["shell"]) ** 0.5
            if u.z > -0.55:
                break
        u.z *= S["flat"]
        cc = centre + Vector((u.x * rxy, u.y * rxy, u.z * rz))
        cr = max(0.35, h * S["clump_r"]) * rng.uniform(0.75, 1.25)
        # a twig from the nearest limb to the clump
        _, q, qr = _nearest_on(paths, cc)
        twig = _gnarled(rng, q, cc - q, max(0.2, (cc - q).length), 4, 0.25, 0.0)
        r0 = max(0.015, min(qr * 0.6, 0.05))
        b.tube(twig, [r0 * (1 - 0.7 * i / (len(twig) - 1)) for i in range(len(twig))], 4, bark, foot, 0.25)
        out = radial(cc)
        for k in range(rng.randint(*S["cards"])):
            off = Vector((rng.gauss(0, 0.5), rng.gauss(0, 0.5), rng.gauss(0, 0.35))) * cr
            p = cc + off - out * card * 0.25
            o = (out * 0.8 + off.normalized() * 0.6) if off.length > 1e-6 else out
            up, right = _card_frame(rng, o.normalized(), 0.25, 0.1)
            leafcol = tuple(t * (0.9 + 0.2 * rng.random()) for t in tint) + (1.0,)
            b.card(p, up, right, card * rng.uniform(0.8, 1.2), S["cell"], leafcol, foot, radial, 1.0)


def cypress_tree(b, rng, base, h, w, tint, shade):
    """Italian cypress: a trunk inside a tight spindle of upright sprays."""
    from mathutils import Vector
    foot = base.z
    bark = (0.36 * (0.85 + 0.3 * shade), 0.30, 0.25, 1.0)
    trunk = _gnarled(rng, base - Vector((0, 0, 0.2)), Vector((0, 0, 1)), h * 0.8, 5, 0.03, 0.0)
    b.tube(trunk, [max(0.1, w * 0.06) * (1 - 0.6 * i / 5) for i in range(len(trunk))], 6, bark, foot, 0.0)
    # the web's spindle profile (radius share against height share)
    prof = [(0, 0.0), (0.03, 0.32), (0.18, 0.5), (0.45, 0.48), (0.72, 0.34), (0.92, 0.15), (1.0, 0.0)]

    def radius_at(t):
        for (t0, r0), (t1, r1) in zip(prof, prof[1:]):
            if t <= t1:
                return (r0 + (r1 - r0) * (t - t0) / max(t1 - t0, 1e-6)) * w
        return 0.0

    def radial(p):
        d = Vector((p.x - base.x, p.y - base.y, 0.25))
        return d.normalized()

    card = max(0.7, w * 0.42)
    n = int(480 * h / 12 * max(0.7, w / 2.4))
    for i in range(n):
        t = 0.04 + 0.94 * (i + rng.random()) / n
        z = foot + t * h
        rmax = radius_at(t)
        a = rng.uniform(0, 2 * math.pi)
        rr = rmax * math.sqrt(rng.uniform(0.1, 0.8))
        out = Vector((math.cos(a), math.sin(a), 0))
        p = Vector((base.x, base.y, z - card * 0.45)) + out * rr
        up = (Vector((0, 0, 1)) * 0.9 + out * 0.25 + _rand_unit(rng) * 0.15).normalized()
        right = up.cross(out + _rand_unit(rng) * 0.35)
        right = right.normalized() if right.length > 1e-6 else up.orthogonal().normalized()
        col = tuple(c * (0.85 + 0.25 * rng.random()) for c in tint) + (1.0,)
        b.card(p, up, right, card * rng.uniform(0.85, 1.2), "cypress", col, foot, radial, 0.5)


def conifer_tree(b, rng, base, h, w, tint, shade, kind="pine"):
    """Black pine / spruce: a straight trunk, whorls of branches, needle tufts."""
    from mathutils import Vector
    foot = base.z
    bark = (0.42 * (0.85 + 0.3 * shade), 0.33, 0.26, 1.0)
    trunk = _gnarled(rng, base - Vector((0, 0, 0.2)), Vector((0, 0, 1)), h, 6, 0.02, 0.0)
    g = max(0.1, h * 0.03)
    b.tube(trunk, [g * (1 - 0.85 * i / 6) for i in range(len(trunk))], 7, bark, foot, 0.0)
    whorls = int(6 + h / 2)
    card = max(0.55, h * 0.1)

    def radial(p):
        d = Vector((p.x - base.x, p.y - base.y, 0.3))
        return d.normalized()

    for k in range(whorls):
        t = 0.25 + 0.72 * k / whorls
        z = foot + t * h
        r = w * 0.5 * (1 - t) ** 0.9 * 1.15 + 0.3
        nb = rng.randint(4, 6)
        a0 = rng.uniform(0, 2 * math.pi)
        for j in range(nb):
            a = a0 + 2 * math.pi * j / nb + rng.uniform(-0.3, 0.3)
            d = Vector((math.cos(a), math.sin(a), rng.uniform(-0.15, 0.25)))
            pts = _gnarled(rng, Vector((base.x, base.y, z)), d, r, 3, 0.12, -0.04)
            b.tube(pts, [g * 0.35 * (1 - 0.7 * i / 3) for i in range(4)], 4, bark, foot, 0.2)
            for q in pts[1:]:
                for _ in range(3):
                    up, right = _card_frame(rng, (q - Vector((base.x, base.y, q.z))).normalized(), 0.3, 0.0)
                    col = tuple(c * (0.88 + 0.24 * rng.random()) for c in tint) + (1.0,)
                    b.card(q - up * card * 0.3, up, right, card * rng.uniform(0.8, 1.2), "needle", col, foot, radial, 0.8)


def bush(b, rng, base, s, sy, kind, tint):
    """A low bush: a few stems, a dome of leaf cards; or a grass tussock."""
    from mathutils import Vector
    foot = base.z
    if kind in ("grass", "steppe"):
        n = rng.randint(3, 5)
        hgt = max(0.25, sy * 1.6)
        for k in range(n):
            a = math.pi * k / n + rng.uniform(-0.2, 0.2)
            right = Vector((math.cos(a), math.sin(a), 0))
            up = (Vector((0, 0, 1)) + _rand_unit(rng) * 0.15).normalized()
            col = tuple(c * (0.9 + 0.2 * rng.random()) for c in tint) + (1.0,)
            b.card(base - Vector((0, 0, 0.03)), up, right, hgt, "grass", col, foot, None, 1.0, width=max(1.0, s / hgt))
        return
    cell = {"maquis": "maquis", "juniper": "juniper", "broad": "broad"}.get(kind, "maquis")
    height = max(0.3, sy * 1.7)
    centre = base + Vector((0, 0, height * 0.45))
    card = max(0.32, min(s, height) * 0.7)

    def radial(p):
        d = p - centre
        d = Vector((d.x, d.y, d.z * 1.4 + 0.2))
        return d.normalized() if d.length > 1e-6 else Vector((0, 0, 1))

    n = int(14 + 18 * min(2.0, s))
    for k in range(n):
        u = _rand_unit(rng)
        if u.z < -0.2:
            u.z = -u.z * 0.3
        p = centre + Vector((u.x * s * 0.42, u.y * s * 0.42, u.z * height * 0.4))
        o = radial(p)
        up, right = _card_frame(rng, o, 0.5, 0.0)
        col = tuple(c * (0.88 + 0.24 * rng.random()) for c in tint) + (1.0,)
        b.card(p - up * card * 0.45, up, right, card * rng.uniform(0.8, 1.2), cell, col, foot, radial, 0.7)


# ---------------------------------------------------------------- Blender glue

def _signature(o):
    return (len(o.data.vertices), len(o.data.polygons))


# the web's unit meshes (landscape.ts): vertex and face counts after Blender's import
KIND_OF = {(77, 120): "cypress", (84, 160): "crown", (40, 24): "trunk", (240, 80): "bush", (99, 160): "conifer"}


def classify(o):
    k = KIND_OF.get(_signature(o))
    if k:
        return k
    # conifer lathe: 8 segments x 11 profile points, depending on how the importer welds
    if o.data.vertices and len(o.data.vertices) in (99, 90, 81):
        bb = [v.co for v in o.data.vertices]
        if min(c.z for c in bb) > -0.05 and max(c.z for c in bb) < 1.05:
            return "conifer"
    return None


def make_materials(out_dir, name):
    import bpy
    tmp = os.path.join(out_dir, "_plants")
    os.makedirs(tmp, exist_ok=True)
    atlas = foliage_atlas()
    H, W = atlas.shape[:2]
    img = bpy.data.images.new(f"{name}-foliage", W, H, alpha=True)
    img.pixels.foreach_set(atlas.astype(np.float32).ravel())
    img.filepath_raw = os.path.join(tmp, f"{name}-foliage.png")
    img.file_format = "PNG"
    img.save()
    bark = bark_texture()
    bh, bw = bark.shape[:2]
    bimg = bpy.data.images.new(f"{name}-bark", bw, bh, alpha=False)
    bimg.pixels.foreach_set(bark.astype(np.float32).ravel())
    bimg.filepath_raw = os.path.join(tmp, f"{name}-bark.png")
    bimg.file_format = "PNG"
    bimg.save()

    def mat(label, image, alpha):
        m = bpy.data.materials.new(label)
        m.use_nodes = True
        nt = m.node_tree
        bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
        tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = image
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        if alpha:
            nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
            try:
                m.surface_render_method = "DITHERED"
            except AttributeError:
                pass
        bsdf.inputs["Roughness"].default_value = 0.9
        m.use_backface_culling = False
        return m

    return mat("antik-bark", bimg, False), mat("antik-foliage", img, True)


def replace_flora(objs, site, tints, out_dir):
    """Swap the web's trees and bushes among `objs` (realised landscape objects) for
    generated ones. Returns (kept objects, new plant objects)."""
    import bpy
    from mathutils import Vector
    biome = BIOME_OF.get(site, "mediterranean")
    crown_sp = CROWN_OF[biome]
    bush_kind = BUSH_OF[biome]
    kept, gone = [], []
    plants = {"crown": [], "cypress": [], "conifer": [], "bush": []}
    # A forest (Sumela's gorge) would come to millions of faces, more than the bake's
    # memory holds: only the nearest MAX_PLANTS are generated; the far ones keep the
    # web's simple shapes (a trunk under a crown), which at that distance read the same.
    kinds = [(o, classify(o)) for o in objs]
    dist = lambda o: (o.matrix_world.translation.x ** 2 + o.matrix_world.translation.y ** 2) ** 0.5
    ds = sorted(dist(o) for o, k in kinds if k not in (None, "trunk"))
    max_plants = int(os.environ.get("ANTIK_MAX_PLANTS", "650"))
    cutoff = ds[max_plants - 1] if len(ds) > max_plants else float("inf")
    if cutoff != float("inf"):
        print(f"[antik] plants beyond {cutoff:.0f} m keep their simple shapes ({len(ds) - max_plants} of {len(ds)})")
    for o, k in kinds:
        if k is None or dist(o) > cutoff + (1.0 if k == "trunk" else 0.0):
            kept.append(o)
            continue
        gone.append(o)
        if k == "trunk":
            continue
        mw = o.matrix_world
        loc = mw.translation.copy()
        sc = mw.to_scale()
        tint = (1.0, 1.0, 1.0)
        if tints:
            best = min(tints, key=lambda t: (t[0][0] - loc.x) ** 2 + (t[0][1] - loc.y) ** 2 + (t[0][2] - loc.z) ** 2)
            if (best[0][0] - loc.x) ** 2 + (best[0][1] - loc.y) ** 2 + (best[0][2] - loc.z) ** 2 < 0.01:
                tint = tuple(best[1])
        plants[k].append((loc, sc, tint))
    if not gone:
        return objs, []
    bark_m, leaf_m = make_materials(out_dir, site)
    made = []

    def emit(label, b):
        if not b.f:
            return
        me = bpy.data.meshes.new(label)
        me.from_pydata([tuple(v) for v in b.v], [], b.f)
        me.materials.append(bark_m)
        me.materials.append(leaf_m)
        me.polygons.foreach_set("material_index", b.mat)
        uv = me.uv_layers.new(name="UVMap")
        uv.data.foreach_set("uv", [x for t in b.uv for x in t])
        wl = me.uv_layers.new(name="wind")
        wl.data.foreach_set("uv", [x for t in b.wind for x in t])
        col = me.color_attributes.new("Color", "BYTE_COLOR", "CORNER")
        col.data.foreach_set("color", [x for c in b.col for x in (tuple(c) + (1.0,))[:4]])
        me.color_attributes.active_color = col
        me.color_attributes.render_color_index = 0
        me.update()
        try:
            me.normals_split_custom_set([tuple(n) for n in b.nrm])
        except Exception as e:
            print("[antik] custom normals skipped:", e)
        ob = bpy.data.objects.new(label, me)
        bpy.context.scene.collection.objects.link(ob)
        made.append(ob)

    def seed(loc):
        return int(abs(loc.x) * 1000) * 7919 + int(abs(loc.y) * 1000) * 104729 + int(abs(loc.z) * 100)

    # crowns: web crown sits at foot + 0.63 h, scaled (w, w, 0.55 h)
    for i, (loc, sc, tint) in enumerate(plants["crown"]):
        rng = random.Random(seed(loc))
        h = sc.z / 0.55
        w = sc.x
        base = Vector((loc.x, loc.y, loc.z - 0.63 * h))
        b = Builder()
        sp = crown_sp
        if biome == "mediterranean" and rng.random() < 0.25:
            sp = "broad"   # a kermes oak or a carob among the olives
        crown_tree(b, rng, base, h, w * 1.1, sp, tint, rng.random())
        emit(f"tree-{i}", b)
    for i, (loc, sc, tint) in enumerate(plants["cypress"]):
        rng = random.Random(seed(loc))
        base = Vector((loc.x, loc.y, loc.z + 0.3))
        b = Builder()
        cypress_tree(b, rng, base, sc.z, sc.x, tint, rng.random())
        emit(f"cypress-{i}", b)
    for i, (loc, sc, tint) in enumerate(plants["conifer"]):
        rng = random.Random(seed(loc))
        base = Vector((loc.x, loc.y, loc.z + 0.2))
        b = Builder()
        conifer_tree(b, rng, base, sc.z, sc.x, tint, rng.random())
        emit(f"conifer-{i}", b)
    # bushes in a few meshes (one object each is slow to join)
    b = Builder(); nb = 0
    for i, (loc, sc, tint) in enumerate(plants["bush"]):
        rng = random.Random(seed(loc))
        base = Vector((loc.x, loc.y, loc.z + 0.08))
        bush(b, rng, base, sc.x * 1.9, sc.z, bush_kind, tint)
        nb += 1
        if nb % 60 == 0:
            emit(f"bushes-{nb}", b); b = Builder()
    emit(f"bushes-{nb}", b)
    for o in gone:
        bpy.data.objects.remove(o, do_unlink=True)
    print(f"[antik] plants ({biome}): {len(plants['crown'])} {crown_sp}, {len(plants['cypress'])} cypress, "
          f"{len(plants['conifer'])} conifer, {len(plants['bush'])} {bush_kind} -> "
          f"{sum(len(o.data.polygons) for o in made)} faces")
    return kept, made


def bake_mode(on):
    """While the light is baked into the leaf cards' corners: those corners lie in the
    clear part of the texture, where Blender would see no leaf at all and bake black.
    Make the card itself solid for the point being baked (camera rays) but keep it
    cut out for the shadow and bounce rays, so light still comes through the crown."""
    import bpy
    m = bpy.data.materials.get("antik-foliage")
    if m is None:
        return
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tex = next(n for n in nt.nodes if n.type == "TEX_IMAGE")
    for n in [n for n in nt.nodes if n.name.startswith("antik_bake_")]:
        nt.nodes.remove(n)
    if on:
        tex.image.alpha_mode = "CHANNEL_PACKED"
        lp = nt.nodes.new("ShaderNodeLightPath"); lp.name = "antik_bake_path"
        mx = nt.nodes.new("ShaderNodeMath"); mx.name = "antik_bake_max"; mx.operation = "MAXIMUM"
        nt.links.new(lp.outputs["Is Camera Ray"], mx.inputs[0])
        nt.links.new(tex.outputs["Alpha"], mx.inputs[1])
        nt.links.new(mx.outputs[0], bsdf.inputs["Alpha"])
    else:
        tex.image.alpha_mode = "STRAIGHT"
        nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
