// Voxel style primitives: lit (PBR) boxes, NO ink outline. Replaces style/toon.tsx for the voxel look.
import React from "react";
import * as THREE from "three";
export type V3 = [number, number, number];

export const Vx: React.FC<{ p: V3; s: V3; c: string; e?: string; ei?: number; rot?: V3; shadow?: boolean; r?: number; o?: number }> = ({ p, s, c, e, ei = 1, rot = [0, 0, 0], shadow = true, r = 0.85, o = 1 }) => (
  <mesh position={p} rotation={rot} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={r} metalness={0} emissive={e ?? "#000000"} emissiveIntensity={e ? ei : 0} transparent={o < 1} opacity={o} />
  </mesh>
);

let _g: THREE.CanvasTexture | null = null;
const glowTexture = () => {
  if (_g) return _g;
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, "rgba(255,255,255,1)"); rg.addColorStop(0.25, "rgba(255,255,255,0.35)"); rg.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128); _g = new THREE.CanvasTexture(c); return _g;
};
// additive soft glow = cheap "bloom" around lights
export const Glow: React.FC<{ p: V3; s: number; c: string; o?: number }> = ({ p, s, c, o = 0.6 }) => (
  <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={glowTexture()} color={c} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></sprite>
);

export const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const sm = (a: number, b: number, x: number) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
export const bump = (a: number, m: number, b: number, x: number) => sm(a, m, x) * (1 - sm(m, b, x));
