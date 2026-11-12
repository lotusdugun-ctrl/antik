/**
 * Ufka doğru incelen, yavaşça sürüklenen gerçekçi bulut katmanı (gökten sonra, her şeyin arkasında).
 * 3D geometri yerine gök kubbesine çizilir; binaların üzerine çökmez, kamerayı kapatmaz ve
 * şehir modellerinde devasa beyaz poligon kütleleri oluşturmaz.
 */
import type * as THREE_NS from "three";

export type CloudDomeHandle = {
  dome: THREE_NS.Mesh;
  material: THREE_NS.ShaderMaterial;
  setColor: (color: THREE_NS.Color) => void;
  setOpacity: (opacity: number) => void;
  dispose: () => void;
};

export function buildCloudDome(THREE: typeof THREE_NS): CloudDomeHandle {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    side: THREE.BackSide,
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(1, 1, 1) },
      opacity: { value: 0.6 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float time;
      uniform vec3 color;
      uniform float opacity;
      varying vec3 vDir;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int k = 0; k < 5; k++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
        return v;
      }
      void main() {
        vec3 d = normalize(vDir);
        if (d.y < 0.01) discard;
        // gökyüzü düzlemine izdüşüm: ufka doğru bulutlar sıklaşır ve küçülür
        vec2 p = d.xz / (d.y + 0.12) * 0.6 + vec2(time * 0.004, time * 0.0015);
        float n = fbm(p);
        float body = smoothstep(0.42, 0.64, n);
        // alt yüzler biraz gri, tepeler parlak
        float top = fbm(p * 1.7 + vec2(0.21, 0.13));
        vec3 c = color * mix(0.72, 1.0, smoothstep(0.35, 0.8, top));
        float a = min(0.95, body * smoothstep(0.01, 0.18, d.y) * opacity * 1.5);
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }`,
  });
  const geometry = new THREE.SphereGeometry(1, 48, 24);
  const dome = new THREE.Mesh(geometry, material);
  dome.name = "sky-clouds";
  dome.frustumCulled = false;
  dome.renderOrder = -1;
  const start = performance.now();
  dome.onBeforeRender = (_r, _s, camera) => {
    const far = (camera as THREE_NS.PerspectiveCamera).far || 2000;
    dome.position.copy(camera.position);
    dome.scale.setScalar(far * 0.9);
    dome.updateMatrixWorld();
    material.uniforms["time"]!.value = (performance.now() - start) / 1000;
  };
  return {
    dome,
    material,
    setColor: (c) => material.uniforms["color"]!.value.copy(c),
    setOpacity: (o) => {
      material.uniforms["opacity"]!.value = o;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
