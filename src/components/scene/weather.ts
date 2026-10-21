import type * as THREE_NS from "three";
import type { Weather } from "@/lib/weather";

type ThreeModule = typeof import("three");

/**
 * Light weather over a model: soft clouds drifting with the wind, a morning
 * mist lying low in the valley, dust blown off a bare summit in gusts.
 *
 * Kept cheap enough for a phone: a dozen sprites for the clouds or the mist,
 * one point cloud for the dust, one shared soft texture painted on a canvas,
 * no extra lights and nothing that casts a shadow. Everything is placed from
 * the model's own size, so a 20 m tomb and a 270 m stadium get the same
 * weather at their own scale.
 */

export type WeatherHandle = {
  group: THREE_NS.Group;
  set: (kind: Weather | "off") => void;
  /** Fewer particles and sprites, for the low-quality setting. */
  setLite: (on: boolean) => void;
  /** How much nearer the fog should come, 1 = as it was. */
  fogScale: () => number;
  /** `night` 0 by day to 1 at night dims and greys everything. */
  update: (now: number, dt: number, focus: THREE_NS.Vector3, night: number) => void;
  dispose: () => void;
};

export function buildWeather(
  THREE: ThreeModule,
  options: { centre: THREE_NS.Vector3; span: number; groundY: number; reducedMotion: boolean },
): WeatherHandle {
  const { centre, span, groundY, reducedMotion } = options;
  const group = new THREE.Group();
  group.name = "weather";
  group.visible = false;
  const pace = reducedMotion ? 0.25 : 1;

  /* One soft round blot, used by every sprite. */
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  const soft = new THREE.CanvasTexture(canvas);
  soft.colorSpace = THREE.SRGBColorSpace;

  // The wind: one direction for everything, a little off the model's axes.
  const wind = new THREE.Vector3(0.82, 0, 0.57);

  /* ---- clouds: flattened puffs drifting across and wrapping round ---- */
  const cloudMaterial = new THREE.SpriteMaterial({
    map: soft,
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    fog: false,
  });
  const reach = span * 2.2;
  const clouds: { sprite: THREE_NS.Sprite; offset: number; side: number; height: number }[] = [];
  for (let i = 0; i < 12; i += 1) {
    const sprite = new THREE.Sprite(cloudMaterial);
    const size = span * (0.35 + ((i * 37) % 11) / 20);
    sprite.scale.set(size * 2.2, size * 0.7, 1);
    group.add(sprite);
    clouds.push({
      sprite,
      offset: (i / 12) * reach * 2,
      side: (((i * 53) % 17) / 17 - 0.5) * reach * 1.6,
      height: groundY + Math.max(45, span * 1.1) + span * (((i * 29) % 7) / 10),
    });
  }

  /* ---- mist: wide pale sheets lying near the ground ---- */
  const mistMaterial = new THREE.SpriteMaterial({
    map: soft,
    color: 0xf2f4f5,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const mists: { sprite: THREE_NS.Sprite; angle: number; radius: number; lift: number }[] = [];
  for (let i = 0; i < 14; i += 1) {
    const sprite = new THREE.Sprite(mistMaterial);
    const size = Math.max(14, span * (0.45 + ((i * 31) % 9) / 18));
    sprite.scale.set(size * 2.4, size * 0.45, 1);
    group.add(sprite);
    mists.push({
      sprite,
      angle: (i / 14) * Math.PI * 2,
      radius: span * (0.55 + ((i * 47) % 13) / 13),
      lift: 1.5 + ((i * 17) % 5),
    });
  }

  /* ---- dust: specks swept along by gusts round the point of interest ---- */
  const DUST = 260;
  const box = Math.max(12, Math.min(60, span * 0.45));
  const dustPositions = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i += 1) {
    dustPositions[i * 3] = (Math.random() - 0.5) * box * 2;
    dustPositions[i * 3 + 1] = Math.random() * box * 0.35;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * box * 2;
    dustSeed[i] = Math.random();
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    map: soft,
    color: 0xcdb58e,
    size: Math.max(0.12, box * 0.006),
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;
  group.add(dust);
  const dustOrigin = new THREE.Vector3();

  let kind: Weather | "off" = "off";
  let lite = false;
  const show = () => {
    group.visible = kind !== "off" && kind !== "clear";
    clouds.forEach((c, i) => (c.sprite.visible = kind === "clouds" && (!lite || i % 2 === 0)));
    mists.forEach((m, i) => (m.sprite.visible = kind === "mist" && (!lite || i % 2 === 0)));
    dust.visible = kind === "dust";
    dustGeometry.setDrawRange(0, lite ? DUST / 2 : DUST);
  };
  show();

  const tint = new THREE.Color();
  const update = (now: number, dt: number, focus: THREE_NS.Vector3, night: number) => {
    if (!group.visible) return;
    const t = now * pace;
    if (kind === "clouds") {
      cloudMaterial.opacity = 0.5 * (1 - night * 0.75);
      tint.setRGB(1 - night * 0.6, 1 - night * 0.55, 1 - night * 0.45);
      cloudMaterial.color.copy(tint);
      for (const c of clouds) {
        const along = ((c.offset + t * span * 0.012) % (reach * 2)) - reach;
        c.sprite.position.set(
          centre.x + wind.x * along - wind.z * c.side,
          c.height,
          centre.z + wind.z * along + wind.x * c.side,
        );
      }
    } else if (kind === "mist") {
      // Morning mist thins as the day goes on; it lies thickest at dawn and night.
      mistMaterial.opacity = 0.22 + night * 0.12;
      tint.setRGB(0.95 - night * 0.6, 0.96 - night * 0.58, 0.97 - night * 0.5);
      mistMaterial.color.copy(tint);
      for (const m of mists) {
        const a = m.angle + t * 0.004;
        m.sprite.position.set(
          centre.x + Math.cos(a) * m.radius,
          groundY + m.lift + Math.sin(t * 0.2 + m.angle) * 0.6,
          centre.z + Math.sin(a) * m.radius,
        );
      }
    } else if (kind === "dust") {
      // Gusts: mostly still air, then a few seconds of wind every so often.
      const gust = Math.pow(Math.max(0, Math.sin(t * 0.35)), 3);
      dustMaterial.opacity = (0.15 + gust * 0.55) * (1 - night * 0.7);
      dustOrigin.set(focus.x, Math.max(groundY, focus.y - box * 0.1), focus.z);
      dust.position.copy(dustOrigin);
      const speed = (1.5 + gust * 9) * pace;
      const step = Math.min(0.1, dt);
      for (let i = 0; i < DUST; i += 1) {
        const k = i * 3;
        const s = dustSeed[i]!;
        dustPositions[k] = dustPositions[k]! + wind.x * speed * step * (0.6 + s);
        dustPositions[k + 2] = dustPositions[k + 2]! + wind.z * speed * step * (0.6 + s);
        dustPositions[k + 1] =
          dustPositions[k + 1]! + Math.sin(t * 2 + s * 10) * 0.3 * step * (1 + gust * 3);
        // Wrap round inside the box, so the specks never run out.
        if (dustPositions[k]! > box) dustPositions[k] = dustPositions[k]! - box * 2;
        if (dustPositions[k + 2]! > box) dustPositions[k + 2] = dustPositions[k + 2]! - box * 2;
        if (dustPositions[k + 1]! < 0) dustPositions[k + 1] = box * 0.35;
        if (dustPositions[k + 1]! > box * 0.35) dustPositions[k + 1] = 0;
      }
      (dustGeometry.attributes["position"] as THREE_NS.BufferAttribute).needsUpdate = true;
    }
  };

  return {
    group,
    set: (next) => {
      kind = next;
      show();
    },
    setLite: (on) => {
      lite = on;
      show();
    },
    fogScale: () =>
      group.visible && kind === "mist" ? 0.55 : group.visible && kind === "dust" ? 0.8 : 1,
    update,
    dispose: () => {
      soft.dispose();
      cloudMaterial.dispose();
      mistMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
    },
  };
}
