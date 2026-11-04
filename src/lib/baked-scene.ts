/**
 * Pişmiş ışıklı sahne (pilot, yalnızca `?pilot=1` ile).
 *
 * Unity için Blender'da pişirilmiş modeli (unity/AntikViewer/Assets/Antik/Baked) web sahnesine
 * koyar: ışık, gölge ve ortam kapatması dokuya işlenmiştir, telefon hesaplamaz. Mozaik3D
 * tarzı yumuşak görünüm buradan gelir.
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

/** Pişmiş modeli hazır olan yerler. Dosyalar: public/baked/<id>/ */
const READY = new Set(["celsus-kutuphanesi"]);

/** `?pilot=1` açıksa ve yerin pişmiş modeli varsa klasörünü verir. */
export function bakedFolderFor(id: string): string | undefined {
  if (typeof window === "undefined" || !READY.has(id)) return undefined;
  const on = new URLSearchParams(window.location.search).get("pilot") === "1";
  return on ? `/baked/${id}/` : undefined;
}

type BakeInfo = {
  model: string;
  scale: number;
  maps: Record<string, string | null>;
};

export type BakedHandle = { group: THREE_NS.Group; dispose: () => void };

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
      for (const k of child.children)
        if (k !== actors && k.name !== "lettering") k.visible = false;
    }
  }
}

export async function applyBaked(
  THREE: typeof THREE_NS,
  scene: THREE_NS.Scene,
  folder: string,
  actors: THREE_NS.Object3D | null,
  anisotropy: number,
): Promise<BakedHandle> {
  const [{ GLTFLoader }, info] = await Promise.all([
    import("three/addons/loaders/GLTFLoader.js"),
    fetch(`${folder}${folder.split("/").filter(Boolean).pop()}-bake.json`).then(
      (r) => r.json() as Promise<BakeInfo>,
    ),
  ]);
  const id = info.model;
  const loader = new GLTFLoader();
  const textures = new THREE.TextureLoader();
  const owned: { dispose: () => void }[] = [];
  const maps = new Map<string, THREE_NS.Texture>();
  await Promise.all(
    Object.entries(info.maps).map(async ([part, file]) => {
      if (!file) return;
      const t = await textures.loadAsync(folder + file);
      t.channel = 1;
      t.flipY = false;
      t.colorSpace = THREE.NoColorSpace;
      t.anisotropy = anisotropy;
      maps.set(part, t);
      owned.push(t);
    }),
  );
  const [baked, skirt] = await Promise.all([
    loader.loadAsync(`${folder}${id}-baked.glb`),
    loader.loadAsync(`${folder}${id}-skirt.glb`).catch(() => null),
  ]);

  const group = new THREE.Group();
  group.name = "baked";
  const partOf = (o: THREE_NS.Object3D) => {
    for (let p: THREE_NS.Object3D | null = o; p; p = p.parent) {
      const m = p.name.match(
        new RegExp(`^${id}-(ground|terrain|near|detail|flora)`),
      );
      if (m) return `${id}-${m[1]}`;
    }
    return "";
  };
  const convert = (root: THREE_NS.Object3D, scale: number) =>
    root.traverse((o) => {
      const mesh = o as THREE_NS.Mesh;
      if (!mesh.isMesh) return;
      const lightMap = maps.get(partOf(mesh));
      const vertexColors = Boolean(mesh.geometry.getAttribute("color"));
      const swap = (old: THREE_NS.Material) => {
        const src = old as THREE_NS.MeshStandardMaterial;
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
        owned.push(m);
        if (src.map) owned.push(src.map);
        old.dispose();
        return m;
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(swap)
        : swap(mesh.material);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      owned.push(mesh.geometry);
    });
  convert(baked.scene, info.scale || 2);
  group.add(baked.scene);
  if (skirt) {
    convert(skirt.scene, 1);
    group.add(skirt.scene);
  }
  hideBuilt(scene, actors);
  scene.add(group);
  return {
    group,
    dispose: () => {
      scene.remove(group);
      for (const r of owned) r.dispose();
    },
  };
}
