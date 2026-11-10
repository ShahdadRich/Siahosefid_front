import React, { useEffect, useRef } from 'react';
import { AppTheme } from '../utils/siahSefidLogic';

export const CONFIG = {
  "bgColor": "#07080c",
  "colorA": "#12151f",
  "colorB": "#3a4152",
  "colorC": "#8e93a4",
  "colorD": "#eceff5",
  "scale": 0.2,
  "speed": 0.33,
  "flow": 0.04,
  "roughness": 0.36,
  "lacunarity": 2.55,
  "smokeScale": 2.51,
  "curl": 0.36,
  "curlScale": 0.88,
  "rise": 0.03,
  "slender": 1.55,
  "width": 1.55,
  "spread": 1.11,
  "lean": 1.25,
  "density": 2.15,
  "contrast": 2.1,
  "midpoint": 0.76,
  "glow": 0.53,
  "sink": 0.2,
  "grain": 0.12,
  "grainAnim": 0,
  "dither": 1.1,
  "vignette": 0.26,
  "cursor": 1,
  "pointerRadius": 0.84,
  "draft": 1.85,
  "pointerStrength": 0.16,
  "parallax": 0.028,
  "maxDpr": 1
};

export const LIGHT_CONFIG = {
  ...CONFIG,
  "bgColor": "#f5f4f0",
  "colorA": "#d6d5d2",
  "colorB": "#505050",
  "colorC": "#262626",
  "colorD": "#141314",
  "glow": 0.0,
  "vignette": 0.08,
};

export function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255
  ];
}

const VERTEX_SHADER = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;
uniform vec2  iMouseVel;
uniform vec2  iMouseWake;

uniform vec3  uBgColor, uColorA, uColorB, uColorC, uColorD;
uniform float uScale, uSpeed, uFlow, uRoughness, uLacunarity;
uniform float uSmokeScale, uCurl, uCurlScale, uRise, uSlender;
uniform float uWidth, uSpread, uLean, uDensity;
uniform float uContrast, uMidpoint, uGlow, uSink;
uniform float uGrain, uDither, uVignette;
uniform float uPointerRadius, uDraft, uPointerStrength, uParallax;
uniform float uGrainAnim;

#define OCTAVES 3
#define TRAIL_TAPS 6

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float hash1(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float snoise(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += amp * snoise(p);
    p *= uLacunarity;
    amp *= uRoughness;
  }
  return v;
}

float trail(vec2 uv, float radius) {
  vec2 wob = vec2(snoise(uv * 1.7 + vec2(0.0, iTime * 0.05)),
                  snoise(uv * 1.7 + vec2(4.3, -iTime * 0.04)));
  uv += wob * radius * 0.18;
  float a = 0.0, wsum = 0.0;
  float r2 = max(1e-4, radius * radius);
  for (int i = 0; i < TRAIL_TAPS; i++) {
    float k = float(i) / float(TRAIL_TAPS - 1);
    vec2 c = mix(iMouseWake, iMouse, k);
    vec2 dd = uv - c;
    float w = mix(0.30, 1.0, k);
    a += w * exp(-dot(dd, dd) / r2);
    wsum += w;
  }
  return a / wsum;
}

float potential(vec2 p) {
  return snoise(p) + 0.5 * snoise(p * 2.03 + vec2(3.7, -1.9));
}

vec2 curl(vec2 p, float e) {
  float nx1 = potential(p + vec2(0.0, e));
  float nx2 = potential(p - vec2(0.0, e));
  float ny1 = potential(p + vec2(e, 0.0));
  float ny2 = potential(p - vec2(e, 0.0));
  return vec2(nx1 - nx2, ny2 - ny1) / (2.0 * e);
}

vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.36, t));
  c = mix(c, uColorC, smoothstep(0.32, 0.70, t));
  c = mix(c, uColorD, smoothstep(0.66, 1.00, t));
  return c;
}

float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}

float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  float t = iTime * uSpeed;
  float tr = trail(uv, uPointerRadius);
  vec2 p = (uv - iMouse * uParallax) * uScale;
  vec2 sp = p + vec2(0.0, -t * uRise);
  vec2 c = curl(sp * uCurlScale + vec2(0.0, t * uFlow), 0.14) * uCurl;
  c += iMouseVel * uDraft * tr;
  vec2 mp = vec2(sp.x, sp.y * uSlender) * uSmokeScale + c;
  float dens = fbm(mp) * 0.5 + 0.5;
  float h = uv.y + 0.55;
  float lean = iMouse.x * uLean * clamp(h, 0.0, 1.6);
  float width = max(0.06, uWidth * (0.45 + uSpread * clamp(h, 0.0, 1.8)));
  float xr = (uv.x - lean) / width;
  float corridor = exp(-xr * xr);
  // Natural dissipation at the bottom tail of the smoke column + cooling at the top
  float cool = smoothstep(-0.65, 0.85, uv.y);
  float baseFade = smoothstep(-0.48, -0.12, uv.y + c.y * 0.25); // organic wavy tail termination
  float smoke = dens * corridor * mix(1.0, 0.30, cool) * baseFade * uDensity;
  float f = clamp((smoke - uMidpoint) * uContrast + 0.5 + tr * uPointerStrength * 0.30, 0.0, 1.0);
  vec3 col = ramp4(f);
  col += uColorD * uGlow * pow(f, 4.0);
  col = mix(uBgColor, col, smoothstep(0.0, max(0.01, uSink), f) * 0.90 + 0.10);
  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export const FlueCanvas: React.FC<{ theme?: AppTheme }> = ({ theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const themeRef = useRef<AppTheme>(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });

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
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
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

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Uniform locations
    const uLoc = (name: string) => gl.getUniformLocation(program, name);
    const locResolution = uLoc('iResolution');
    const locTime = uLoc('iTime');
    const locMouse = uLoc('iMouse');
    const locMouseVel = uLoc('iMouseVel');
    const locMouseWake = uLoc('iMouseWake');

    const locBgColor = uLoc('uBgColor');
    const locColorA = uLoc('uColorA');
    const locColorB = uLoc('uColorB');
    const locColorC = uLoc('uColorC');
    const locColorD = uLoc('uColorD');
    const locGlow = uLoc('uGlow');
    const locVignette = uLoc('uVignette');

    let appliedTheme: AppTheme | null = null;
    const applyPaletteForTheme = (targetTheme: AppTheme) => {
      if (appliedTheme === targetTheme) return;
      appliedTheme = targetTheme;
      const activeCfg = targetTheme === 'light' ? LIGHT_CONFIG : CONFIG;
      gl.uniform3fv(locBgColor, hexToVec3(activeCfg.bgColor));
      gl.uniform3fv(locColorA, hexToVec3(activeCfg.colorA));
      gl.uniform3fv(locColorB, hexToVec3(activeCfg.colorB));
      gl.uniform3fv(locColorC, hexToVec3(activeCfg.colorC));
      gl.uniform3fv(locColorD, hexToVec3(activeCfg.colorD));
      gl.uniform1f(locGlow, activeCfg.glow);
      gl.uniform1f(locVignette, activeCfg.vignette);
    };

    applyPaletteForTheme(themeRef.current);

    gl.uniform1f(uLoc('uScale'), CONFIG.scale);
    gl.uniform1f(uLoc('uSpeed'), CONFIG.speed);
    gl.uniform1f(uLoc('uFlow'), CONFIG.flow);
    gl.uniform1f(uLoc('uRoughness'), CONFIG.roughness);
    gl.uniform1f(uLoc('uLacunarity'), CONFIG.lacunarity);
    gl.uniform1f(uLoc('uSmokeScale'), CONFIG.smokeScale);
    gl.uniform1f(uLoc('uCurl'), CONFIG.curl);
    gl.uniform1f(uLoc('uCurlScale'), CONFIG.curlScale);
    gl.uniform1f(uLoc('uRise'), CONFIG.rise);
    gl.uniform1f(uLoc('uSlender'), CONFIG.slender);
    gl.uniform1f(uLoc('uWidth'), CONFIG.width);
    gl.uniform1f(uLoc('uSpread'), CONFIG.spread);
    gl.uniform1f(uLoc('uLean'), CONFIG.lean);
    gl.uniform1f(uLoc('uDensity'), CONFIG.density);
    gl.uniform1f(uLoc('uContrast'), CONFIG.contrast);
    gl.uniform1f(uLoc('uMidpoint'), CONFIG.midpoint);
    gl.uniform1f(uLoc('uSink'), CONFIG.sink);
    gl.uniform1f(uLoc('uGrain'), CONFIG.grain);
    gl.uniform1f(uLoc('uGrainAnim'), CONFIG.grainAnim);
    gl.uniform1f(uLoc('uDither'), CONFIG.dither);
    gl.uniform1f(uLoc('uPointerRadius'), CONFIG.pointerRadius);
    gl.uniform1f(uLoc('uDraft'), CONFIG.draft);
    gl.uniform1f(uLoc('uPointerStrength'), CONFIG.pointerStrength);
    gl.uniform1f(uLoc('uParallax'), CONFIG.parallax);

    // Sizing with maxDpr: 1
    let width = 1;
    let height = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.useProgram(program);
      gl.uniform2f(locResolution, width, height);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Three-pole pointer rig state
    let targetX = 0;
    let targetY = 0;
    let leadX = 0;
    let leadY = 0;
    let bodyX = 0;
    let bodyY = 0;
    let wakeX = 0;
    let wakeY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (!CONFIG.cursor) return;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const a = w / h;
      targetX = ((e.clientX - rect.left) / w - 0.5) * a;
      targetY = 0.5 - (e.clientY - rect.top) / h;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerMove, { passive: true });

    // Detect software WebGL (SwiftShader / llvmpipe) to prevent CPU starvation in headless browsers
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(rendererStr);

    // Clamped clock ([4.167, 50] ms) & three-pole pointer rig
    let simTime = 0;
    let lastNow = performance.now();
    let rafId = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let isVisible = true;
    let disposed = false;

    const scheduleNext = () => {
      if (disposed || !isVisible) return;
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
          if (!disposed && isVisible) {
            rafId = requestAnimationFrame(render);
          }
        }, 140);
      } else {
        rafId = requestAnimationFrame(render);
      }
    };

    const render = (now: number) => {
      rafId = 0;
      if (disposed) return;
      const rawDtMs = now - lastNow;
      lastNow = now;
      if (!isVisible || document.hidden) return;
      const ms = rawDtMs > 50 ? 50 : rawDtMs < 4.167 ? 4.167 : rawDtMs;
      const s = ms > 36.7 ? 2.2 : ms * 0.06;
      simTime += ms * 0.001;

      const kLead = 0.105 * s;
      const kBody = 0.043 * s;
      const kWake = 0.017 * s;

      leadX += (targetX - leadX) * kLead;
      leadY += (targetY - leadY) * kLead;

      bodyX += (leadX - bodyX) * kBody;
      bodyY += (leadY - bodyY) * kBody;

      wakeX += (bodyX - wakeX) * kWake;
      wakeY += (bodyY - wakeY) * kWake;

      applyPaletteForTheme(themeRef.current);

      gl.uniform2f(locResolution, width, height);
      gl.uniform1f(locTime, simTime);
      gl.uniform2f(locMouse, bodyX, bodyY);
      gl.uniform2f(locMouseVel, leadX - bodyX, leadY - bodyY);
      gl.uniform2f(locMouseWake, wakeX, wakeY);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      scheduleNext();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          lastNow = performance.now();
          scheduleNext();
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    scheduleNext();

    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerMove);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  const bgHex = theme === 'light' ? LIGHT_CONFIG.bgColor : CONFIG.bgColor;

  return (
    <canvas
      ref={canvasRef}
      data-testid="flue-webgl2-canvas"
      aria-hidden="true"
      className="absolute top-0 inset-x-0 z-0 w-full hero-flue-canvas-mask block pointer-events-none"
      style={{ backgroundColor: bgHex }}
    />
  );
};
