/**
 * Augmented reality, with nothing but three.js.
 *
 * Two routes, because the two phone platforms took two:
 *
 * - **Android (Chrome):** a WebXR `immersive-ar` session. A ring follows the
 *   floor under the screen's centre; a tap sets the model down there. It
 *   starts tabletop-sized and one button switches it to its real, measured
 *   size — standing in the orchestra of a theatre that is not there.
 * - **iPhone / iPad (Safari):** AR Quick Look, which opens a USDZ file. The
 *   model is converted on the device and handed over as a blob, also at
 *   tabletop size; Quick Look's own pinch scales it up.
 *
 * The model comes in as a GLB built in memory from the scene (never offered
 * as a download), so AR shows exactly the measured geometry and nothing extra.
 */
export type ARMode = "webxr" | "quicklook";

/** Largest dimension of the model at "tabletop" size, in metres. */
const TABLETOP = 1.2;

export async function arSupport(): Promise<ARMode | null> {
  if (typeof window === "undefined") return null;
  const anchor = document.createElement("a");
  if (anchor.relList?.supports?.("ar")) return "quicklook";
  const xr = (
    navigator as Navigator & { xr?: { isSessionSupported: (m: string) => Promise<boolean> } }
  ).xr;
  if (xr) {
    try {
      if (await xr.isSessionSupported("immersive-ar")) return "webxr";
    } catch {
      /* fall through */
    }
  }
  return null;
}

async function loadModel(glb: ArrayBuffer) {
  const THREE = await import("three");
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const gltf = await new GLTFLoader().parseAsync(glb, "");
  const model = gltf.scene;
  // Sit the model on its own origin, base at y = 0, so placing it on a floor
  // puts its footprint on the floor.
  const box = new THREE.Box3().setFromObject(model);
  const centre = box.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(centre.x, box.min.y, centre.z));
  const holder = new THREE.Group();
  holder.add(model);
  const size = box.getSize(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z) || 1;
  return { THREE, holder, tabletop: TABLETOP / largest };
}

/** iOS: convert to USDZ and hand it to Quick Look. */
export async function openQuickLook(glb: ArrayBuffer, name: string) {
  const { holder, tabletop } = await loadModel(glb);
  holder.scale.setScalar(tabletop);
  holder.updateMatrixWorld(true);
  const { USDZExporter } = await import("three/addons/exporters/USDZExporter.js");
  const usdz = await new USDZExporter().parseAsync(holder);
  const url = URL.createObjectURL(new Blob([usdz], { type: "model/vnd.usdz+zip" }));
  const anchor = document.createElement("a");
  anchor.rel = "ar";
  anchor.href = `${url}#allowsContentScaling=1`;
  // Quick Look needs a file name for a blob; this opens AR, not a save dialog.
  anchor.download = `${name}.usdz`;
  // Quick Look only answers an anchor that wraps an image.
  anchor.appendChild(document.createElement("img"));
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Free the geometry, materials and textures under `root`. */
function disposeTree(root: import("three").Object3D) {
  root.traverse((object) => {
    const mesh = object as import("three").Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value && typeof value === "object" && (value as { isTexture?: boolean }).isTexture) {
          (value as import("three").Texture).dispose();
        }
      }
      material.dispose();
    }
  });
}

export type ARLabels = { realSize: string; tabletop: string; exit: string; hint: string };

/** Android: a WebXR session with hit-testing against the real floor. */
export async function startWebXR(glb: ArrayBuffer, labels: ARLabels) {
  const { THREE, holder, tabletop } = await loadModel(glb);
  const xr = (navigator as Navigator & { xr: XRSystem }).xr;

  // The overlay: a hint and two buttons, drawn over the camera image.
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;pointer-events:none;font:600 14px system-ui;color:#fff;";
  const bar = document.createElement("div");
  bar.style.cssText =
    "position:absolute;left:0;right:0;bottom:24px;display:flex;gap:8px;justify-content:center;pointer-events:auto;";
  const hint = document.createElement("p");
  hint.textContent = labels.hint;
  hint.style.cssText =
    "position:absolute;top:24px;left:16px;right:16px;text-align:center;text-shadow:0 1px 3px #000;margin:0;";
  const button = (text: string) => {
    const b = document.createElement("button");
    b.textContent = text;
    b.style.cssText =
      "padding:10px 16px;border-radius:999px;border:0;background:rgba(0,0,0,.6);color:#fff;font:inherit;";
    bar.appendChild(b);
    return b;
  };
  const sizeButton = button(labels.realSize);
  const exitButton = button(labels.exit);
  overlay.append(hint, bar);
  document.body.appendChild(overlay);

  /*
   * Everything from here to the first frame can be refused — no camera
   * permission, no hit-testing, a session that will not start — and each step
   * has already put something on the page or on the GPU. On a refusal it is
   * all taken down again before the error goes back to the caller, or every
   * failed try would leave an invisible overlay and a WebGL context behind.
   */
  let session: XRSession | null = null;
  let renderer: InstanceType<typeof THREE.WebGLRenderer> | null = null;
  let hitSource: XRHitTestSource | undefined;
  try {
    session = await xr.requestSession("immersive-ar", {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay", "light-estimation"],
      domOverlay: { root: overlay },
    } as XRSessionInit);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.display = "none";
    document.body.appendChild(renderer.domElement);
    renderer.xr.setReferenceSpaceType("local");
    await renderer.xr.setSession(session);

    const viewer = await session.requestReferenceSpace("viewer");
    hitSource = await session.requestHitTestSource!({ space: viewer });
  } catch (error) {
    hitSource?.cancel();
    overlay.remove();
    // The session first, while the renderer that holds it is still whole.
    await session?.end().catch(() => {});
    if (renderer) {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
    disposeTree(holder);
    throw error;
  }
  const xrSession = session;
  const xrRenderer = renderer;

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8d8264, 1.6));
  const sun = new THREE.DirectionalLight(0xfff3e0, 2.2);
  sun.position.set(1, 2, 1);
  scene.add(sun);
  const camera = new THREE.PerspectiveCamera();

  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.1, 0.13, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  let real = false;
  holder.scale.setScalar(tabletop);
  holder.visible = false;
  scene.add(holder);
  sizeButton.onclick = (event) => {
    event.stopPropagation();
    real = !real;
    holder.scale.setScalar(real ? 1 : tabletop);
    sizeButton.textContent = real ? labels.tabletop : labels.realSize;
  };

  xrSession.addEventListener("select", () => {
    if (!reticle.visible) return;
    holder.position.setFromMatrixPosition(reticle.matrix);
    holder.visible = true;
    hint.style.display = "none";
  });

  const end = () => {
    xrRenderer.setAnimationLoop(null);
    hitSource?.cancel();
    xrRenderer.dispose();
    xrRenderer.forceContextLoss();
    xrRenderer.domElement.remove();
    overlay.remove();
    // The model and the ring were made for this session alone.
    disposeTree(holder);
    disposeTree(reticle);
  };
  exitButton.onclick = (event) => {
    event.stopPropagation();
    void xrSession.end();
  };
  xrSession.addEventListener("end", end);

  xrRenderer.setAnimationLoop((_, frame?: XRFrame) => {
    if (frame && hitSource) {
      const space = xrRenderer.xr.getReferenceSpace();
      const hits = frame.getHitTestResults(hitSource);
      const pose = hits[0] && space ? hits[0].getPose(space) : undefined;
      reticle.visible = Boolean(pose);
      if (pose) reticle.matrix.fromArray(pose.transform.matrix);
    }
    xrRenderer.render(scene, camera);
  });
}
