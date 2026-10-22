import type * as THREE_NS from "three";

/**
 * Water that moves, for almost nothing: the surface's normal is bent by a
 * few travelling waves computed in the fragment shader from the world
 * position and the clock, so the sun's highlight and the sky's reflection
 * ripple across a river, the sea or a basin without a single extra vertex.
 * A face that stands upright (a jet falling from a spout into a basin) gets
 * streaks running down it instead. One uniform, set once a frame.
 */
export function animateWater(material: THREE_NS.MeshPhysicalMaterial) {
  const time = { value: 0 };
  material.onBeforeCompile = (shader) => {
    shader.uniforms["uWaterTime"] = time;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWaterWorld;")
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\nvWaterWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vWaterWorld;
uniform float uWaterTime;
vec2 waterSlope(vec2 p, float t) {
  vec2 g = vec2(0.0);
  // A slow warp, so the trains never line up into a grid.
  p += vec2(sin(p.y * 0.21 + t * 0.07), sin(p.x * 0.17 - t * 0.05)) * 1.6;
  // Four trains of waves, each its own length, heading and speed.
  vec4 k = vec4(0.9, 1.7, 3.1, 5.3);
  vec4 sp = vec4(0.55, 0.8, 1.1, 1.5);
  vec2 d0 = vec2(0.8, 0.6), d1 = vec2(-0.5, 0.86), d2 = vec2(0.96, -0.28), d3 = vec2(-0.2, -0.98);
  g += d0 * cos(dot(p, d0) * k.x + t * sp.x) * 0.5;
  g += d1 * cos(dot(p, d1) * k.y + t * sp.y) * 0.32;
  g += d2 * cos(dot(p, d2) * k.z + t * sp.z) * 0.2;
  g += d3 * cos(dot(p, d3) * k.w + t * sp.w) * 0.12;
  return g;
}`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
{
  vec3 worldN = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
  float flat_ = smoothstep(0.55, 0.9, abs(worldN.y));
  // Fainter with distance: far off, the waves are finer than a pixel.
  float near_ = 1.0 / (1.0 + length(vViewPosition) / 45.0);
  vec2 slope = waterSlope(vWaterWorld.xz, uWaterTime) * 0.2 * flat_ * near_;
  // On an upright face, streaks sliding down.
  float fall = (1.0 - flat_) * sin(vWaterWorld.y * 26.0 + uWaterTime * 9.0 + sin(vWaterWorld.x * 40.0 + vWaterWorld.z * 40.0) * 2.0);
  vec3 bend = vec3(slope.x + fall * 0.18 * (1.0 - flat_), 0.0, slope.y);
  normal = normalize(normal + (viewMatrix * vec4(bend, 0.0)).xyz);
}`,
      )
      .replace(
        "#include <clearcoat_normal_fragment_maps>",
        "#include <clearcoat_normal_fragment_maps>\n#ifdef USE_CLEARCOAT\nclearcoatNormal = normal;\n#endif",
      );
  };
  // A different program from the stone's, so three.js does not reuse theirs.
  material.customProgramCacheKey = () => "antik-water";
  return {
    tick(seconds: number) {
      time.value = seconds;
    },
  };
}

/**
 * Cuts the bodies of water out of a flat ground disc (the apron under a
 * model), so a river or a harbour basin lying lower than the site is not
 * covered over by it. Only large bodies count; a basin is the building's.
 */
export function cutWater(
  material: THREE_NS.Material,
  water: readonly { x: number; z: number; hx: number; hz: number; rot: number }[],
) {
  const big = water.filter((w) => w.hx * w.hz >= 40).slice(0, 4);
  if (big.length === 0) return;
  const rects = big.map((w) => [w.x, w.z, w.hx, w.hz]);
  const turns = big.map((w) => w.rot);
  while (rects.length < 4) {
    rects.push([0, 0, -1, -1]);
    turns.push(0);
  }
  material.onBeforeCompile = (shader) => {
    shader.uniforms["uCutRects"] = { value: rects.flat() };
    shader.uniforms["uCutTurns"] = { value: turns };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vCutWorld;")
      .replace(
        "#include <worldpos_vertex>",
        "#include <worldpos_vertex>\nvCutWorld = (modelMatrix * vec4(transformed, 1.0)).xz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec2 vCutWorld;\nuniform float uCutRects[16];\nuniform float uCutTurns[4];",
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
for (int i = 0; i < 4; i++) {
  vec2 d = vCutWorld - vec2(uCutRects[i * 4], uCutRects[i * 4 + 1]);
  float c = cos(uCutTurns[i]);
  float s = sin(uCutTurns[i]);
  vec2 q = abs(vec2(d.x * c - d.y * s, d.x * s + d.y * c));
  if (q.x < uCutRects[i * 4 + 2] && q.y < uCutRects[i * 4 + 3]) discard;
}`,
      );
  };
  material.customProgramCacheKey = () => `antik-cut-${big.length}`;
}
