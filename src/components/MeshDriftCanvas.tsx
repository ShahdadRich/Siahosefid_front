import React, { useEffect, useRef } from 'react';

export const MESH_DRIFT_COLORS: [number, number, number][] = [
  [0.063, 0.063, 0.063], // #101010
  [0.961, 0.961, 0.961], // #F5F5F5
  [0.690, 0.690, 0.690], // #B0B0B0
  [0.227, 0.227, 0.227], // #3A3A3A
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 0.0],
];

export const MESH_DRIFT_LIGHT_COLORS: [number, number, number][] = [
  [0.961, 0.957, 0.941], // #f5f4f0 (--page-ground)
  [0.078, 0.075, 0.078], // #141314 (--inverse-ground sumi-ink)
  [0.520, 0.515, 0.505], // warm charcoal-stone midtone
  [0.925, 0.922, 0.910], // #ecebe8 (--alternate-ground)
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 0.0],
  [0.0, 0.0, 0.0],
];

export const MESH_DRIFT_UNIFORMS = {
  timeScale: -0.78,
  colorCount: 4.0,
  u_shape: [1.98, 0.31, 0.79, 0.01] as const,
  u_surface: [1.47, 1.10, 0.01, 1.30] as const,
  u_finish: [3.39, 0.18, 0.005, 0.01] as const,
  u_transform: [1015.0, 3.74, 0.11, 1.0] as const,
  u_spaceOffset: [0.01, -0.13] as const,
  u_cursorBase: [0.0, 0.50, 0.58] as const, // effect=0.0 (push), strength=0.50, radius=0.58
  maxDpr: 2,
};

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const MESH_DRIFT_FRAGMENT_SHADER = `// "Mesh drift" — made with the 21st.dev Shader Builder
// Packed WebGL1 uniforms (the shader exposes readable u_* aliases as macros):
//   u_colors[8] (first 4 used)
//   vec3(0.063, 0.063, 0.063)
//   vec3(0.961, 0.961, 0.961)
//   vec3(0.690, 0.690, 0.690)
//   vec3(0.227, 0.227, 0.227)
//   u_scene = vec4(canvas width, canvas height, seconds * -0.78, 4.0)
//   u_shape = vec4(1.98, 0.31, 0.79, 0.01)
//   u_surface = vec4(1.47, 1.10, 0.01, 1.30)
//   u_finish = vec4(3.39, 0.18, 0.005, 0.01)
//   u_transform = vec4(1015.0, 3.74, 0.11, 1.0)
//   u_space = vec4(0.01, -0.13, pointer x, pointer y)
//   u_cursor = vec4(presence, 0.0, 0.50, 0.58)

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[8];
// Seven packed vectors + eight colour vectors = 15 fragment uniform vectors,
// one below WebGL1's guaranteed minimum. Macros preserve the public u_* API.
uniform vec4 u_scene;      // resolution.xy, time, colour count
uniform vec4 u_shape;      // scale, intensity, paramA, warp
uniform vec4 u_surface;    // detail, contrast, brightness, saturation
uniform vec4 u_finish;     // hue, vignette, blur, grain
uniform vec4 u_transform;  // seed, rotation, drift, OKLab toggle
uniform vec4 u_space;      // offset.xy, pointer.xy
uniform vec4 u_cursor;

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_paramA u_shape.z
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_blur u_finish.z
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
// Keep hash inputs inside mediump's guaranteed ±2^14 range.
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy
#define u_mouse u_space.zw
#define u_cursorPresence u_cursor.x
#define u_cursorEffect u_cursor.y
#define u_cursorStrength u_cursor.z
#define u_cursorRadius u_cursor.w

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// Even, un-structured white noise for film grain (Dave Hoskins hash12). The
// multiply hash above is fine for value noise but shows a faint axis-aligned
// mesh at integer fragment coords, which reads as a net over flat areas.
float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(15731.743, 7892.321) * n);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

// --- OKLab colour mixing (perceptual), gated by u_oklab -----------------------
vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)),
    step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
  // max() guards the sRGB branch: out-of-gamut OKLab interpolations can send a
  // channel negative, and pow(negative, …) is NaN which mix()/step() would
  // then propagate. The linear branch clips such channels to 0 downstream.
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, c));
}
vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 mixColour(vec3 a, vec3 b, float t) {
  if (u_oklab > 0.5) {
    vec3 la = linToOklab(srgbToLinear(a));
    vec3 lb = linToOklab(srgbToLinear(b));
    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
  }
  return mix(a, b, t);
}

// Mix through the recipe colours; x is clamped to 0..1. WebGL1 forbids
// dynamic uniform indexing in fragment shaders, hence the constant loop.
vec3 palette(float x) {
  float n = max(u_colorCount - 1.0, 1.0);
  float f = clamp(x, 0.0, 1.0) * n;
  vec3 col = u_colors[0];
  for (int i = 0; i < 7; i++) {
    if (float(i) < n)
      col = mixColour(col, u_colors[i + 1],
        smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
  }
  return col;
}

vec3 hueRotate(vec3 col, float a) {
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211,
                          0.587, -0.274, -0.523,
                          0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0,
                          0.956, -0.272, -1.106,
                          0.621, -0.647, 1.703);
  vec3 yiq = toYIQ * col;
  float ca = cos(a), sa = sin(a);
  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);
  return toRGB * yiq;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  vec3 acc = u_colors[0] * 0.15;
  float total = 0.15;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= u_colorCount) break;
    float fi = float(i);
    vec2 c = vec2(
      sin(t * (0.21 + fi * 0.071) + fi * 2.4 + u_seed),
      cos(t * (0.17 + fi * 0.093) + fi * 1.7)) * (0.45 + u_intensity * 0.35);
    float w = exp(-dot(p - c, p - c) * 6.0);
    acc += u_colors[i] * w;
    total += w;
  }
  return acc / total;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);
  float cursorMask = 0.0;

  // Cursor modes 1–3 are local distortions. Push shifts the same screen-space
  // coordinates before field transforms, so Zoom/Rotate don't change its feel.
  if (u_cursorPresence > 0.001) {
    // u_mouse is normalized to -1..1 in canvas space. Convert it to the same
    // aspect-corrected screen space as p so effects stay under the cursor.
    vec2 cursor = (0.5 * u_mouse * u_resolution.xy)
      / min(u_resolution.x, u_resolution.y);
    vec2 cursorDelta = p - cursor;
    if (u_cursorEffect < 0.5) {
      p += cursor * u_cursorPresence * u_cursorStrength * 0.55;
    } else {
      float cursorDistance = length(cursorDelta);
      vec2 cursorDirection = cursorDelta / max(cursorDistance, 0.0001);
      cursorMask = u_cursorPresence
        * (1.0 - smoothstep(0.0, u_cursorRadius, cursorDistance));
      if (u_cursorEffect < 1.5) {
        p -= cursorDirection * cursorMask * u_cursorStrength * 0.24;
      } else if (u_cursorEffect < 2.5) {
        float cursorAngle = cursorMask * u_cursorStrength * 2.2;
        float cc = cos(cursorAngle), cs = sin(cursorAngle);
        p = cursor + mat2(cc, -cs, cs, cc) * cursorDelta;
      } else if (u_cursorEffect < 3.5) {
        float ripple = sin(
          cursorDistance / max(u_cursorRadius, 0.001) * 18.0 - u_time * 5.0);
        p -= cursorDirection * ripple * cursorMask * u_cursorStrength * 0.07;
      }
    }
  }

  // Keep presets that read uv (rather than p) in the same warped space.
  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= u_scale;
  // Field transform: rotate, pan, pointer push, slow drift.
  if (abs(u_rotate) > 0.0001) {
    float cr = cos(u_rotate), sr = sin(u_rotate);
    p = mat2(cr, -sr, sr, cr) * p;
  }
  p += u_offset;
  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));
  // Organic domain warp.
  if (u_warp > 0.0) {
    p += u_warp * (vec2(
      fbm(p * u_detail + u_seed),
      fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }
  // Shade, with an optional soft 5-tap blur.
  vec3 col;
  if (u_blur > 0.0) {
    float e = u_blur;
    float pe = e * u_scale;
    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;
    col  = shade(uv, p, u_time) * 0.36;
    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv + vec2(0.0, uvE.y), p + vec2(0.0, pe), u_time) * 0.16;
    col += shade(uv - vec2(0.0, uvE.y), p - vec2(0.0, pe), u_time) * 0.16;
  } else {
    col = shade(uv, p, u_time);
  }
  // Post: contrast, saturation, hue, brightness, vignette, grain.
  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;
  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }
  if (abs(u_hue) > 0.0001)
    col = hueRotate(col, u_hue);
  if (abs(u_brightness) > 0.0001)
    col += u_brightness;
  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }
  if (u_cursorPresence > 0.001 && u_cursorEffect > 3.5)
    col += (vec3(0.18) + col * 0.12) * cursorMask * u_cursorStrength;
  if (u_grain > 0.0001)
    col += (grainHash(
      gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export interface MeshDriftCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  isDark?: boolean;
}

export const MeshDriftCanvas: React.FC<MeshDriftCanvasProps> = ({
  className = 'fixed inset-0 w-full h-full block pointer-events-none z-0',
  style,
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDarkPropRef = useRef<boolean | undefined>(isDark);
  isDarkPropRef.current = isDark;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl.FRAGMENT_SHADER, MESH_DRIFT_FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    // Fullscreen triangle buffer in plain WebGL1
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const locScene = gl.getUniformLocation(program, 'u_scene');
    const locShape = gl.getUniformLocation(program, 'u_shape');
    const locSurface = gl.getUniformLocation(program, 'u_surface');
    const locFinish = gl.getUniformLocation(program, 'u_finish');
    const locTransform = gl.getUniformLocation(program, 'u_transform');
    const locSpace = gl.getUniformLocation(program, 'u_space');
    const locCursor = gl.getUniformLocation(program, 'u_cursor');

    const colorLocs: (WebGLUniformLocation | null)[] = [];
    for (let i = 0; i < 8; i++) {
      colorLocs.push(gl.getUniformLocation(program, `u_colors[${i}]`));
    }

    let appliedDarkState: boolean | null = null;
    const syncPaletteColors = () => {
      const resolvedDark =
        typeof isDarkPropRef.current === 'boolean'
          ? isDarkPropRef.current
          : typeof document !== 'undefined'
          ? document.documentElement.getAttribute('data-theme') !== 'light'
          : true;
      if (appliedDarkState === resolvedDark) return;
      appliedDarkState = resolvedDark;
      const palette = resolvedDark ? MESH_DRIFT_COLORS : MESH_DRIFT_LIGHT_COLORS;
      for (let i = 0; i < 8; i++) {
        const loc = colorLocs[i];
        const c = palette[i];
        if (loc && c) {
          gl.uniform3f(loc, c[0], c[1], c[2]);
        }
      }
    };

    syncPaletteColors();

    // Feed static packed uniforms exactly as listed in header comment
    gl.uniform4f(
      locShape,
      MESH_DRIFT_UNIFORMS.u_shape[0],
      MESH_DRIFT_UNIFORMS.u_shape[1],
      MESH_DRIFT_UNIFORMS.u_shape[2],
      MESH_DRIFT_UNIFORMS.u_shape[3]
    );
    gl.uniform4f(
      locSurface,
      MESH_DRIFT_UNIFORMS.u_surface[0],
      MESH_DRIFT_UNIFORMS.u_surface[1],
      MESH_DRIFT_UNIFORMS.u_surface[2],
      MESH_DRIFT_UNIFORMS.u_surface[3]
    );
    gl.uniform4f(
      locFinish,
      MESH_DRIFT_UNIFORMS.u_finish[0],
      MESH_DRIFT_UNIFORMS.u_finish[1],
      MESH_DRIFT_UNIFORMS.u_finish[2],
      MESH_DRIFT_UNIFORMS.u_finish[3]
    );
    gl.uniform4f(
      locTransform,
      MESH_DRIFT_UNIFORMS.u_transform[0],
      MESH_DRIFT_UNIFORMS.u_transform[1],
      MESH_DRIFT_UNIFORMS.u_transform[2],
      MESH_DRIFT_UNIFORMS.u_transform[3]
    );

    // Detect software WebGL (SwiftShader / llvmpipe) to prevent CPU starvation in headless browsers
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(rendererStr);

    let width = 1;
    let height = 1;
    const resize = () => {
      // Cap devicePixelRatio at 2 (or 1 on software renderer for responsiveness)
      const maxDpr = isSoftwareGl ? 1 : MESH_DRIFT_UNIFORMS.maxDpr;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let targetPresence = 0;
    let presence = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      targetPointerX = ((e.clientX - rect.left) / w) * 2.0 - 1.0;
      targetPointerY = (1.0 - (e.clientY - rect.top) / h) * 2.0 - 1.0;
      targetPresence = 1.0;
    };

    const handlePointerLeave = () => {
      targetPresence = 0.0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    let startTime = performance.now();
    let rafId = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const scheduleNext = () => {
      if (disposed || document.hidden) return;
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (isSoftwareGl) {
        timerId = setTimeout(() => {
          timerId = null;
          if (!disposed && !document.hidden) {
            rafId = requestAnimationFrame(render);
          }
        }, 140);
      } else {
        rafId = requestAnimationFrame(render);
      }
    };

    const render = (now: number) => {
      rafId = 0;
      if (disposed || document.hidden) return;

      const seconds = (now - startTime) * 0.001;
      pointerX += (targetPointerX - pointerX) * 0.08;
      pointerY += (targetPointerY - pointerY) * 0.08;
      presence += (targetPresence - presence) * 0.08;

      syncPaletteColors();

      gl.uniform4f(
        locScene,
        width,
        height,
        seconds * MESH_DRIFT_UNIFORMS.timeScale,
        MESH_DRIFT_UNIFORMS.colorCount
      );
      gl.uniform4f(
        locSpace,
        MESH_DRIFT_UNIFORMS.u_spaceOffset[0],
        MESH_DRIFT_UNIFORMS.u_spaceOffset[1],
        pointerX,
        pointerY
      );
      gl.uniform4f(
        locCursor,
        presence,
        MESH_DRIFT_UNIFORMS.u_cursorBase[0],
        MESH_DRIFT_UNIFORMS.u_cursorBase[1],
        MESH_DRIFT_UNIFORMS.u_cursorBase[2]
      );

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      scheduleNext();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        scheduleNext();
      } else {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial draw
    render(performance.now());

    return () => {
      disposed = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (buffer) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="mesh-drift-webgl1-canvas"
      aria-hidden="true"
      className={className}
      style={{ backgroundColor: isDark === false ? '#f5f4f0' : '#101010', ...style }}
    />
  );
};
