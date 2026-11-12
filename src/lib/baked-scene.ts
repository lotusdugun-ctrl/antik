/**
 * Pişmiş ışıklı sahne.
 *
 * Blender'da gündüz ışığıyla pişirilmiş modeli (public/baked/<id>/) web sahnesine
 * koyar: ışık, gölge ve ortam kapatması dokuya işlenmiştir, telefon hesaplamaz. Mozaik3D
 * tarzı temiz ve net görünüm buradan gelir.
 *
 * Unity gölgelendiricisiyle (AntikBakedLit) aynı hesap:
 *   renk = doku(uv0) × taban rengi × köşe rengi × ışık haritası(uv1) × 2
 * Işık haritası olmayan küçük oyma parçalar (detail, flora) ışıklarını köşe renginde taşır.
 *
 * Web'in kendi binası, arazisi, taramaları ve sabit eşyası gizlenir (hepsi pişmiş modelin
 * içinde); yazıtlar (gölgelendiriciyle çizildikleri için dışa aktarılmadılar), insanlar,
 * ateşler, kuşlar ve gök olduğu gibi kalır.
 */
import type * as THREE_NS from "three";

import { BAKED_SITES } from "@/lib/baked-sites";

/** Pişmiş modeli hazır olan yerler. Dosyalar: public/baked/<id>/ */
const READY = new Set(BAKED_SITES);

/** Pişmiş modeli hazır olan yerler için klasörünü verir (`?baked=0` veya `?pilot=0` ile kapatılabilir). */
export function bakedFolderFor(id: string): string | undefined {
  if (typeof window === "undefined" || !READY.has(id)) return undefined;
  const off =
    new URLSearchParams(window.location.search).get("baked") === "0" ||
    new URLSearchParams(window.location.search).get("pilot") === "0";
  return off ? undefined : `/baked/${id}/`;
}

type BakeInfo = {
  model: string;
  preset?: string;
  scale: number;
  maps: Record<string, string | null>;
  /** Pişmiş modelin dosyaları (büyük yerler birkaç parçaya bölünür). */
  files?: string[];
};

export type BakedHandle = {
  group: THREE_NS.Group;
  /** Hangi ışıkla pişirildi ("golden" | "day"): sahnenin o ışığında renkler olduğu gibi kalır. */
  preset: string;
  /**
   * Sahnenin ışığı değişince (gün / akşam / gece): pişmiş model gündüz ışığıyla pişti, bu
   * yüzden gündüze göre oranla boyanır (web'in arazisiyle aynı oran).
   */
  setLight: (tint: THREE_NS.Color, cloudColor?: THREE_NS.Color, cloudOpacity?: number) => void;
  dispose: () => void;
};



/** Web sahnesindeki pişmiş modelde zaten bulunan her şeyi gizler. */
function hideBuilt(scene: THREE_NS.Scene, actors: THREE_NS.Object3D | null) {
  for (const child of scene.children) {
    const mesh = child as THREE_NS.Mesh;
    const m = mesh.material as THREE_NS.Material | undefined;
    if (
      mesh.isMesh &&
      m &&
      ((m as THREE_NS.MeshStandardMaterial).isMeshStandardMaterial ?? false)
    ) {
      child.visible = false; // birleştirilmiş bina parçaları ve zemin
    } else if (["landscape", "scans"].includes(child.name)) {
      child.visible = false;
    } else if (child.name === "life") {
      // sabit eşya (tezgâhlar, heykeller, hermler) pişmiş modelde; canlılar ve yazılar kalır
      for (const k of child.children) if (k !== actors && k.name !== "lettering") k.visible = false;
    }
  }
}

export async function applyBaked(
  THREE: typeof THREE_NS,
  scene: THREE_NS.Scene,
  folder: string,
  actors: THREE_NS.Object3D | null,
  anisotropy: number,
  webClouds?: THREE_NS.Material,
): Promise<BakedHandle> {
  const [{ GLTFLoader }, { MeshoptDecoder }, info] = await Promise.all([
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/libs/meshopt_decoder.module.js"),
    fetch(`${folder}${folder.split("/").filter(Boolean).pop()}-bake.json`).then(
      (r) => r.json() as Promise<BakeInfo>,
    ),
  ]);
  const id = info.model;
  const loader = new GLTFLoader();
  // gltfpack -cc: geometri meshopt ile sıkıştırıldı (Celsus 32 MB → 8 MB)
  loader.setMeshoptDecoder(MeshoptDecoder);
  const textures = new THREE.TextureLoader();
  const owned: { dispose: () => void }[] = [];
  const maps = new Map<string, THREE_NS.Texture>();
  await Promise.all(
    Object.entries(info.maps).map(async ([part, file]) => {
      if (!file) return;
      const t = await textures.loadAsync(folder + file);
      t.channel = 1;
      t.flipY = false;
      t.colorSpace = THREE.SRGBColorSpace; // antik_bake.py: ışığın yarısı, sRGB PNG
      t.anisotropy = anisotropy;
      maps.set(part, t);
      owned.push(t);
    }),
  );
  const files = info.files?.length ? info.files : [`${id}-baked.glb`];
  const [skirt, ...pieces] = await Promise.all([
    loader.loadAsync(`${folder}${id}-skirt.glb`).catch(() => null),
    ...files.map((file) => loader.loadAsync(folder + file)),
  ]);

  const group = new THREE.Group();
  group.name = "baked";
  const partOf = (o: THREE_NS.Object3D) => {
    for (let p: THREE_NS.Object3D | null = o; p; p = p.parent) {
      const m = p.name.match(new RegExp(`^${id}-(ground|terrain|near|detail|flora)`));
      if (m) return `${id}-${m[1]}`;
    }
    return "";
  };
  const nearColor = (c: THREE_NS.Color | undefined, r: number, g: number, b: number) =>
    Boolean(
      c && Math.abs(c.r - r) < 0.025 && Math.abs(c.g - g) < 0.025 && Math.abs(c.b - b) < 0.025,
    );
  // Unity AntikSetup.Surface ile aynı: 1 = toprak/çimen ("ground" #a9977a, "grass" #a8965f), 2 = kaya ("rock" #8b877d)
  const surfaceKind = (src: THREE_NS.MeshStandardMaterial) => {
    const n = src.name || "";
    if (
      n === "ground" ||
      n === "grass" ||
      nearColor(src.color, 0.397, 0.309, 0.195) ||
      nearColor(src.color, 0.392, 0.3, 0.114)
    )
      return 1;
    if (n === "rock" || nearColor(src.color, 0.258, 0.242, 0.212)) return 2;
    return 0;
  };
  const applyGroundDetail = (m: THREE_NS.MeshBasicMaterial, rock: number, patches: number) => {
    m.onBeforeCompile = (shader) => {
      shader.uniforms["uBakedRock"] = { value: rock };
      shader.uniforms["uBakedPatches"] = { value: patches };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vBakedWorld;")
        .replace(
          "#include <worldpos_vertex>",
          "#include <worldpos_vertex>\nvBakedWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
varying vec3 vBakedWorld;
uniform float uBakedRock;
uniform float uBakedPatches;
float bakedHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float bakedNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(bakedHash(i), bakedHash(i + vec2(1.0, 0.0)), u.x),
             mix(bakedHash(i + vec2(0.0, 1.0)), bakedHash(i + vec2(1.0, 1.0)), u.x), u.y);
}`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
{
  vec3 p = vBakedWorld;
  vec3 nWS = normalize(cross(dFdx(p), dFdy(p)));
  float level = smoothstep(0.48, 0.84, abs(nWS.y));
  float grit = bakedNoise(p.xz * 1.35) * 0.55 + bakedNoise(p.xz * 0.31 + 0.37) * 0.45;
  float blot = bakedNoise(p.xz * 0.028) * 0.65 + bakedNoise(p.xz * 0.095 + 0.5) * 0.35;
  vec3 earthTint = mix(vec3(0.82, 0.90, 0.72), vec3(1.09, 1.03, 0.86), smoothstep(0.28, 0.72, blot));
  vec3 levelC = diffuseColor.rgb * mix(0.84, 1.16, grit) * mix(vec3(1.0), earthTint, uBakedPatches * (1.0 - uBakedRock * 0.75));
  float side = abs(nWS.z) / (abs(nWS.x) + abs(nWS.z) + 1e-3);
  float strata = mix(bakedNoise(vec2(p.z * 0.11, p.y * 0.28)), bakedNoise(vec2(p.x * 0.11, p.y * 0.28)), side);
  float fine = mix(bakedNoise(vec2(p.z, p.y) * 0.65), bakedNoise(vec2(p.x, p.y) * 0.65), side);
  float k = mix(0.38, 0.65, uBakedRock);
  vec3 steepC = diffuseColor.rgb * mix(1.0, 0.76 + (strata * 0.55 + fine * 0.45) * 0.48, k) * mix(vec3(1.0), earthTint, uBakedPatches * 0.45);
  levelC *= mix(1.0, 0.86 + strata * 0.28, 0.3 * uBakedRock);
  diffuseColor.rgb = mix(steepC, levelC, level);
}`,
        );
    };
    m.customProgramCacheKey = () => `baked-detail-${rock}-${patches}`;
  };
  const convert = (root: THREE_NS.Object3D, scale: number) =>
    root.traverse((o) => {
      const mesh = o as THREE_NS.Mesh;
      if (!mesh.isMesh) return;
      const partName = partOf(mesh);
      const lightMap = maps.get(partName);
      const vertexColors = Boolean(mesh.geometry.getAttribute("color"));
      const swap = (old: THREE_NS.Material) => {
        const src = old as THREE_NS.MeshStandardMaterial;
        const kind = surfaceKind(src);
        const isGroundPart = partName.endsWith("-terrain") || partName.endsWith("-ground");
        const m = new THREE.MeshBasicMaterial({
          map: src.map ?? null,
          color: src.color ? src.color.clone() : new THREE.Color(1, 1, 1),
          vertexColors,
          transparent: src.transparent,
          alphaTest: src.alphaTest,
          side: src.side,
          toneMapped: false,
        });
        if (m.map) m.map.anisotropy = anisotropy;
        if (lightMap) {
          m.lightMap = lightMap;
          // MeshBasicMaterial ışık haritasını π'ye böler
          m.lightMapIntensity = scale * Math.PI;
        } else {
          m.color.multiplyScalar(scale);
        }
        if (kind !== 0 || isGroundPart) {
          applyGroundDetail(m, kind === 2 ? 1 : 0, kind === 1 || isGroundPart ? 0.65 : 0.35);
        }
        owned.push(m);
        if (src.map) owned.push(src.map);
        old.dispose();
        return m;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      owned.push(mesh.geometry);
    });
  for (const piece of pieces) {
    convert(piece!.scene, info.scale || 2);
    group.add(piece!.scene);
  }
  if (skirt) {
    convert(skirt.scene, 1);
    group.add(skirt.scene);
  }
  hideBuilt(scene, actors);
  const lit: { m: THREE_NS.MeshBasicMaterial; base: THREE_NS.Color }[] = [];
  group.traverse((o) => {
    const mesh = o as THREE_NS.Mesh;
    if (!mesh.isMesh) return;
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      const b = m as THREE_NS.MeshBasicMaterial;
      if (b.isMeshBasicMaterial) lit.push({ m: b, base: b.color.clone() });
    }
  });
  scene.add(group);
  return {
    group,
    preset: info.preset ?? "golden",
    setLight: (tint) => {
      for (const { m, base } of lit) m.color.copy(base).multiply(tint);
    },
    dispose: () => {
      scene.remove(group);
      for (const r of owned) r.dispose();
    },
  };
}
