import { useEffect, useRef, useState } from "react";
import { SCANS, type ScanId } from "@/lib/scans";

/**
 * One scan on its own: the real piece, turnable, in an even light. Loaded
 * only when it scrolls into view, since each is a megabyte or two.
 */
export default function ScanViewer({ id, label }: { id: ScanId; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "failed">("idle");

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      setState("loading");
      const THREE = await import("three");
      const [{ OrbitControls }, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
        import("three/addons/controls/OrbitControls.js"),
        import("three/addons/loaders/GLTFLoader.js"),
        import("three/addons/libs/meshopt_decoder.module.js"),
      ]);
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setState("failed");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      element.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.touchAction = "none";
      renderer.domElement.setAttribute("role", "img");
      renderer.domElement.setAttribute("aria-label", label);

      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x6b6253, 1.6));
      const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
      key.position.set(1.5, 2, 2.5);
      scene.add(key);
      const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 1000);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.2;

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      let root: InstanceType<typeof THREE.Object3D> | null = null;
      try {
        const gltf = await loader.loadAsync(SCANS[id].url);
        root = gltf.scene;
      } catch {
        if (!disposed) setState("failed");
      }
      if (disposed || !root) {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      root.rotation.y = SCANS[id].facing ?? 0;
      root.traverse((object) => {
        const mesh = object as InstanceType<typeof THREE.Mesh>;
        if (!mesh.isMesh) return;
        if (!mesh.geometry.attributes["normal"]) mesh.geometry.computeVertexNormals();
        const material = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>;
        material.side = THREE.DoubleSide;
        if (!material.map) material.color.set(0xe9e2d6);
      });
      scene.add(root);
      const box = new THREE.Box3().setFromObject(root);
      const centre = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();
      controls.target.copy(centre);
      camera.position.copy(centre).add(new THREE.Vector3(0, size * 0.12, size * 1.55));
      camera.near = size / 100;
      camera.far = size * 20;
      controls.minDistance = size * 0.3;
      controls.maxDistance = size * 3;
      // Grabbing it stops the turntable.
      controls.addEventListener("start", () => (controls.autoRotate = false));

      const resize = () => {
        const { clientWidth, clientHeight } = element;
        if (!clientWidth || !clientHeight) return;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight, false);
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
      });
      setState("ready");

      cleanup = () => {
        renderer.setAnimationLoop(null);
        observer.disconnect();
        controls.dispose();
        root?.traverse((object) => {
          const mesh = object as InstanceType<typeof THREE.Mesh>;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const material = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>;
          material.map?.dispose();
          material.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          seen.disconnect();
          void start();
        }
      },
      { rootMargin: "200px" },
    );
    seen.observe(element);
    return () => {
      disposed = true;
      seen.disconnect();
      cleanup();
    };
  }, [id, label]);

  return (
    <div
      ref={host}
      className={`relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-b from-secondary to-muted ${
        state === "ready" ? "" : "animate-pulse"
      }`}
    />
  );
}
