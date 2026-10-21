import type * as THREE_NS from "three";
import { REF_SIZE, type Placed, type ScaleRef } from "@/lib/scale-refs";

type ThreeModule = typeof import("three");

/**
 * The modern things set beside a model for scale (see `lib/scale-refs.ts`):
 * plain shapes in plain colours — a person, a bus, a block of flats with its
 * windows, a football pitch's lines — each with its name and size floating
 * over it. Deliberately not ancient-looking, so nobody takes them for part of
 * the reconstruction.
 */

export type ScaleRefsHandle = {
  group: THREE_NS.Group;
  dispose: () => void;
};

function label(THREE: ThreeModule, text: string, screenHeight: number) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const font = "600 44px system-ui, sans-serif";
  let width = 400;
  if (ctx) {
    ctx.font = font;
    width = Math.ceil(ctx.measureText(text).width) + 48;
  }
  canvas.width = width;
  canvas.height = 72;
  if (ctx) {
    ctx.font = font;
    ctx.fillStyle = "rgba(20,20,24,0.78)";
    const r = 36;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(width, 0, width, 72, r);
    ctx.arcTo(width, 72, 0, 72, r);
    ctx.arcTo(0, 72, 0, 0, r);
    ctx.arcTo(0, 0, width, 0, r);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 24, 38);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    fog: false,
    // The same size on screen however far away: a label, not a sign.
    sizeAttenuation: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 10;
  sprite.scale.set((screenHeight * width) / 72, screenHeight, 1);
  return { sprite, texture, material };
}

/** A block of flats' façade: rows of windows on a pale render. */
function windows(THREE: ThreeModule, floors: number, bays: number) {
  const canvas = document.createElement("canvas");
  canvas.width = bays * 32;
  canvas.height = floors * 32;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#d9d4cc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let f = 0; f < floors; f += 1) {
      for (let b = 0; b < bays; b += 1) {
        ctx.fillStyle = (f * 7 + b * 3) % 5 === 0 ? "#6f8394" : "#45576a";
        ctx.fillRect(b * 32 + 8, f * 32 + 8, 16, 16);
      }
      ctx.fillStyle = "#c4bdb2";
      ctx.fillRect(0, f * 32 + 29, canvas.width, 3);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A pitch's white lines on grass, drawn to the FIFA layout. */
function pitchTexture(THREE: ThreeModule) {
  const scale = 8; // pixels a metre
  const canvas = document.createElement("canvas");
  canvas.width = 105 * scale;
  canvas.height = 68 * scale;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    for (let i = 0; i < 10; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? "#5f8f3e" : "#567f37";
      ctx.fillRect((i * canvas.width) / 10, 0, canvas.width / 10, canvas.height);
    }
    ctx.strokeStyle = "#f4f4ee";
    ctx.lineWidth = 0.12 * scale * 2;
    const m = (v: number) => v * scale;
    ctx.strokeRect(m(0.2), m(0.2), m(104.6), m(67.6));
    ctx.beginPath();
    ctx.moveTo(m(52.5), m(0.2));
    ctx.lineTo(m(52.5), m(67.8));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(m(52.5), m(34), m(9.15), 0, Math.PI * 2);
    ctx.stroke();
    for (const x of [0.2, 104.8]) {
      const dir = x < 50 ? 1 : -1;
      ctx.strokeRect(Math.min(m(x), m(x + dir * 16.5)), m(34 - 20.16), m(16.5), m(40.32));
      ctx.strokeRect(Math.min(m(x), m(x + dir * 5.5)), m(34 - 9.16), m(5.5), m(18.32));
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildScaleRefs(
  THREE: ThreeModule,
  placed: Placed[],
  groundAt: (x: number, z: number) => number,
  names: Record<ScaleRef, string>,
  span: number,
): ScaleRefsHandle {
  const group = new THREE.Group();
  group.name = "scale-refs";
  const owned: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(thing: T) => {
    owned.push(thing);
    return thing;
  };
  const textHeight = Math.max(1.1, Math.min(6, span * 0.035));

  placed.forEach(({ ref, x, z, rotY }, order) => {
    const size = REF_SIZE[ref];
    // The highest ground under the thing, so nothing sinks into a slope.
    let y = -Infinity;
    for (const fx of [-0.5, 0, 0.5]) {
      for (const fz of [-0.5, 0, 0.5]) {
        const c = Math.cos(rotY);
        const s = Math.sin(rotY);
        const lx = fx * size.w;
        const lz = fz * size.d;
        y = Math.max(y, groundAt(x + c * lx + s * lz, z - s * lx + c * lz));
      }
    }
    const holder = new THREE.Group();
    holder.position.set(x, y, z);
    holder.rotation.y = rotY;
    group.add(holder);

    if (ref === "person") {
      const body = keep(new THREE.CapsuleGeometry(0.22, 1.75 - 0.44, 4, 12));
      const material = keep(
        new THREE.MeshStandardMaterial({ color: 0xe0562b, roughness: 0.6, metalness: 0 }),
      );
      const mesh = new THREE.Mesh(body, material);
      mesh.position.y = 1.75 / 2;
      mesh.castShadow = true;
      holder.add(mesh);
    } else if (ref === "bus") {
      const bodyMaterial = keep(
        new THREE.MeshStandardMaterial({ color: 0x2f6fb3, roughness: 0.45, metalness: 0.1 }),
      );
      const glass = keep(
        new THREE.MeshStandardMaterial({ color: 0x1d2933, roughness: 0.2, metalness: 0.2 }),
      );
      const tyre = keep(new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.9 }));
      const body = keep(new THREE.BoxGeometry(size.w, size.h - 0.35, size.d));
      const band = keep(new THREE.BoxGeometry(size.w - 0.6, 0.95, size.d + 0.04));
      const wheel = keep(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 16));
      const shell = new THREE.Mesh(body, bodyMaterial);
      shell.position.y = 0.35 + (size.h - 0.35) / 2;
      shell.castShadow = true;
      holder.add(shell);
      const windowsBand = new THREE.Mesh(band, glass);
      windowsBand.position.y = 0.35 + size.h - 1.45;
      holder.add(windowsBand);
      for (const wx of [-size.w * 0.32, size.w * 0.3]) {
        for (const wz of [-size.d / 2, size.d / 2]) {
          const w = new THREE.Mesh(wheel, tyre);
          w.rotation.x = Math.PI / 2;
          w.position.set(wx, 0.5, wz);
          holder.add(w);
        }
      }
    } else if (ref === "block") {
      const face = keep(windows(THREE, 10, 8));
      const side = keep(windows(THREE, 10, 4));
      const plain = keep(new THREE.MeshStandardMaterial({ color: 0xb9b2a6, roughness: 0.9 }));
      const front = keep(new THREE.MeshStandardMaterial({ map: face, roughness: 0.85 }));
      const flank = keep(new THREE.MeshStandardMaterial({ map: side, roughness: 0.85 }));
      const geometry = keep(new THREE.BoxGeometry(size.w, size.h, size.d));
      // +x, -x, +y, -y, +z, -z
      const mesh = new THREE.Mesh(geometry, [flank, flank, plain, plain, front, front]);
      mesh.position.y = size.h / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      holder.add(mesh);
    } else {
      const texture = keep(pitchTexture(THREE));
      const material = keep(
        new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 1,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -4,
        }),
      );
      const plane = keep(new THREE.PlaneGeometry(size.w, size.d));
      const mesh = new THREE.Mesh(plane, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.08;
      mesh.receiveShadow = true;
      holder.add(mesh);
    }

    const tag = label(THREE, names[ref], 0.042);
    keep(tag.texture);
    keep(tag.material);
    tag.sprite.position.set(0, Math.max(size.h, 0) + textHeight * 1.2, 0);
    // Each label a row higher on screen than the last, so far away they stack, not overlap.
    tag.sprite.center.set(0.5, -0.2 - order * 1.25);
    holder.add(tag.sprite);
  });

  return {
    group,
    dispose: () => owned.forEach((thing) => thing.dispose()),
  };
}
