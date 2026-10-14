import { useEffect, useRef, useState } from "react";
import { SCANS, type ScanId } from "@/lib/scans";

/*
 * How many scans may hold a live WebGL context at once.
 *
 * A browser keeps only so many contexts (Chrome: 16) and, past that, silently
 * drops the oldest — which is the main reconstruction on the same page, left
 * black for good. A gallery can list fifteen scans, so they take turns: a few
 * are live, the rest wait for a slot or show the still they last drew.
 */
const MAX_LIVE = 4;
let live = 0;
const queue: (() => void)[] = [];

/** Ask for a live slot; `onGranted` runs once one is free. Returns the release. */
function requestSlot(onGranted: () => void) {
  let held: "waiting" | "held" | "done" = "waiting";
  const grant = () => {
    held = "held";
    live += 1;
    onGranted();
  };
  if (live < MAX_LIVE) grant();
  else queue.push(grant);
  return () => {
    if (held === "waiting") {
      const index = queue.indexOf(grant);
      if (index >= 0) queue.splice(index, 1);
    } else if (held === "held") {
      live -= 1;
      queue.shift()?.();
    }
    held = "done";
  };
}

/** How long a scan may sit off screen before it gives its context back. */
const LINGER_MS = 3000;

type ViewerState = "idle" | "loading" | "ready" | "failed";

type LiveViewer = {
  /** Draw every frame, or stop drawing (off screen). */
  setRunning: (on: boolean) => void;
  /** Tear down; hands back a still of the last view, if there was one. */
  destroy: () => string | null;
};

function mountViewer(
  element: HTMLDivElement,
  id: ScanId,
  label: () => string,
  setState: (state: ViewerState) => void,
): LiveViewer {
  let disposed = false;
  let running = true;
  let teardown: (() => string | null) | null = null;
  let applyRunning = () => {};

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
    const release = () => {
      renderer.dispose();
      // Give the context back now rather than at garbage collection.
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    element.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute("aria-label", label());

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
      controls.dispose();
      release();
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
    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
    };
    applyRunning = () => renderer.setAnimationLoop(running ? loop : null);
    applyRunning();
    setState("ready");

    teardown = () => {
      // The last view, kept as a still so the tile is not left blank while
      // it waits for a slot again. Rendered now, so the buffer is fresh.
      let poster: string | null = null;
      try {
        renderer.render(scene, camera);
        poster = renderer.domElement.toDataURL("image/webp", 0.8);
      } catch {
        poster = null;
      }
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
      release();
      return poster;
    };
  };
  void start();

  return {
    setRunning: (on) => {
      running = on;
      applyRunning();
    },
    destroy: () => {
      disposed = true;
      return teardown?.() ?? null;
    },
  };
}

/**
 * One scan on its own: the real piece, turnable, in an even light. Loaded
 * only when it scrolls into view, since each is a megabyte or two; drawn only
 * while it is on screen; and given back — context and all — when it has been
 * off screen a little while, leaving a still of how it last looked.
 */
export default function ScanViewer({ id, label }: { id: ScanId; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ViewerState>("idle");
  const [poster, setPoster] = useState<string | null>(null);
  // Read when the canvas is made; a language switch only renames it (below).
  const labelRef = useRef(label);
  labelRef.current = label;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let viewer: LiveViewer | null = null;
    let release: (() => void) | null = null;
    let linger = 0;

    const goDark = () => {
      const still = viewer?.destroy() ?? null;
      viewer = null;
      if (still) setPoster(still);
      release?.();
      release = null;
      setState((current) => (current === "failed" ? current : "idle"));
    };

    const seen = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1]?.isIntersecting ?? false;
        if (visible) {
          window.clearTimeout(linger);
          if (viewer) viewer.setRunning(true);
          else if (!release) {
            release = requestSlot(() => {
              viewer = mountViewer(
                element,
                id,
                () => labelRef.current,
                (next) => {
                  setState(next);
                  // A scan that cannot be shown should not keep a slot from
                  // one that can; it tries again when it next scrolls in.
                  if (next === "failed") goDark();
                },
              );
            });
          }
          return;
        }
        // Off screen: stop drawing at once, and give the context back if it
        // stays off screen. A scan still waiting for a slot stops waiting.
        viewer?.setRunning(false);
        window.clearTimeout(linger);
        linger = window.setTimeout(goDark, LINGER_MS);
      },
      { rootMargin: "200px" },
    );
    seen.observe(element);
    return () => {
      seen.disconnect();
      window.clearTimeout(linger);
      viewer?.destroy();
      viewer = null;
      release?.();
    };
  }, [id]);

  useEffect(() => {
    host.current?.querySelector("canvas")?.setAttribute("aria-label", label);
  }, [label]);

  const pulsing = (state === "loading" || state === "idle") && !poster;
  return (
    <div
      ref={host}
      role={poster && state !== "ready" ? "img" : undefined}
      aria-label={poster && state !== "ready" ? label : undefined}
      className={`relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-b from-secondary to-muted bg-cover bg-center ${
        pulsing ? "animate-pulse" : ""
      }`}
      style={poster ? { backgroundImage: `url(${poster})` } : undefined}
    />
  );
}
