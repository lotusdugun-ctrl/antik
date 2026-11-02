import { useEffect, useRef, useState } from "react";

/**
 * A 360° panorama on the inside of a sphere: drag to look round, wheel or pinch
 * to zoom. The image centre faces the viewer first. One WebGL context, given
 * back when the viewer goes.
 */
export default function PanoramaViewer({ src, label }: { src: string; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    setState("loading");

    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false });
      } catch {
        setState("failed");
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const canvas = renderer.domElement;
      canvas.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", label);
      element.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
      const geometry = new THREE.SphereGeometry(10, 96, 48);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x222222 });
      scene.add(new THREE.Mesh(geometry, material));

      // u = 0.5 (the image centre) sits at −x on the turned-out sphere: start there.
      let lon = 180;
      let lat = 0;
      let fov = 70;
      let raf = 0;
      const draw = () => {
        raf = 0;
        lat = Math.max(-85, Math.min(85, lat));
        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon);
        camera.fov = fov;
        camera.updateProjectionMatrix();
        camera.lookAt(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta),
        );
        renderer.render(scene, camera);
      };
      const redraw = () => {
        if (!raf) raf = requestAnimationFrame(draw);
      };
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        redraw();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      resize();

      // drag to look, two fingers to zoom
      const pointers = new Map<number, { x: number; y: number }>();
      let pinch = 0;
      const down = (e: PointerEvent) => {
        canvas.setPointerCapture(e.pointerId);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        canvas.style.cursor = "grabbing";
      };
      const move = (e: PointerEvent) => {
        const last = pointers.get(e.pointerId);
        if (!last) return;
        if (pointers.size === 2) {
          pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const [a, b] = [...pointers.values()];
          if (!a || !b) return;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinch) fov = Math.max(30, Math.min(95, fov * (pinch / d)));
          pinch = d;
        } else {
          const k = (fov / 70) * 0.12;
          lon -= (e.clientX - last.x) * k;
          lat += (e.clientY - last.y) * k;
          pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }
        redraw();
      };
      const up = (e: PointerEvent) => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinch = 0;
        canvas.style.cursor = "grab";
      };
      const wheel = (e: WheelEvent) => {
        e.preventDefault();
        fov = Math.max(30, Math.min(95, fov + e.deltaY * 0.04));
        redraw();
      };
      const key = (e: KeyboardEvent) => {
        const steps: Record<string, [number, number]> = {
          ArrowLeft: [-5, 0],
          ArrowRight: [5, 0],
          ArrowUp: [0, 5],
          ArrowDown: [0, -5],
        };
        const step = steps[e.key];
        if (!step) return;
        e.preventDefault();
        lon += step[0];
        lat += step[1];
        redraw();
      };
      canvas.tabIndex = 0;
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      canvas.addEventListener("wheel", wheel, { passive: false });
      canvas.addEventListener("keydown", key);

      let texture: InstanceType<typeof THREE.Texture> | null = null;
      new THREE.TextureLoader().load(
        src,
        (t) => {
          if (disposed) {
            t.dispose();
            return;
          }
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = renderer.capabilities.getMaxAnisotropy();
          texture = t;
          material.map = t;
          material.color.set(0xffffff);
          material.needsUpdate = true;
          setState("ready");
          redraw();
        },
        undefined,
        () => !disposed && setState("failed"),
      );

      cleanup = () => {
        if (raf) cancelAnimationFrame(raf);
        observer.disconnect();
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
        canvas.removeEventListener("wheel", wheel);
        canvas.removeEventListener("keydown", key);
        texture?.dispose();
        material.dispose();
        geometry.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [src, label]);

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden bg-black">
      {state !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
          {state === "failed" ? (
            "—"
          ) : (
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
        </div>
      )}
    </div>
  );
}
