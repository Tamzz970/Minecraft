// Deterministic weather/atmosphere (everything is a pure function of time t -> frames render identically on any machine).
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { rng, sm, bump } from "./V";

export const Rain: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null), N = 900;
  const drops = useMemo(() => { const r = rng(3); return Array.from({ length: N }, (_, i) => { const near = i < 350; return { x: near ? -9 + r() * 4.6 : -26 + r() * 22, z: near ? -5 + r() * 9 : -14 + r() * 26, s: 11 + r() * 5, o: r(), H: near ? 9 : 22, y0: near ? -3 : -9 }; }); }, []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D(); if (!ref.current) return;
    drops.forEach((d, i) => { const k = (t * d.s + d.o * d.H) % d.H; o.position.set(d.x - k * 0.1, d.y0 + d.H - k, d.z); o.rotation.set(0, 0, 0.1); o.scale.set(0.014, 0.5, 0.014); o.updateMatrix(); ref.current!.setMatrixAt(i, o.matrix); });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}><boxGeometry /><meshBasicMaterial color="#b9d3e2" transparent opacity={0.5} fog={false} /></instancedMesh>;
};
// drops sliding on the window glass (glass plane at x = gx)
export const GlassDrops: React.FC<{ t: number; gx?: number }> = ({ t, gx = -4.31 }) => {
  const d = useMemo(() => { const r = rng(5); return Array.from({ length: 26 }, (_, i) => ({ z: -2.45 + r() * 3.7, y: 1.1 + r() * 2.2, sp: 0.04 + r() * 0.09, o: r(), l: 0.05 + r() * 0.09, st: i > 15 })); }, []);
  return (<group>{d.map((q, i) => { const y = q.st ? q.y : q.y - ((t * q.sp + q.o) % 1) * 0.9; return <mesh key={i} position={[gx, y, q.z]}><boxGeometry args={[0.012, q.st ? 0.035 : q.l, 0.035]} /><meshStandardMaterial color="#e2f1f8" emissive="#bcd8e6" emissiveIntensity={0.6} transparent opacity={0.6} roughness={0.1} /></mesh>; })}</group>);
};
// sound ripples: square frames expanding along +x. amp 0..1 (scene fades it in/out), speed in cycles/s
export const Rings: React.FC<{ t: number; amp: number; speed?: number; origin?: [number, number, number] }> = ({ t, amp, speed = 0.45, origin = [-3.95, 1.95, -0.9] }) => {
  if (amp < 0.01) return null;
  return (<group>{[0, 1, 2, 3].map((i) => { const ph = (t * speed + i / 4) % 1, sc = 0.4 + ph * 0.6, op = bump(0, 0.3, 1, ph) * amp * 0.4, h = 0.6 * sc;
    const m = <meshBasicMaterial color="#b6e8f2" transparent opacity={op} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />;
    return (<group key={i} position={[origin[0] + ph * 2.3, origin[1], origin[2]]}>
      <mesh position={[0, h, 0]}><boxGeometry args={[0.03, 0.035, h * 2]} />{m}</mesh><mesh position={[0, -h, 0]}><boxGeometry args={[0.03, 0.035, h * 2]} />{m}</mesh>
      <mesh position={[0, 0, h]}><boxGeometry args={[0.03, h * 2, 0.035]} />{m}</mesh><mesh position={[0, 0, -h]}><boxGeometry args={[0.03, h * 2, 0.035]} />{m}</mesh>
    </group>); })}</group>);
};
// steam above a cup; p = cup saucer centre. sigh 0..1 makes it sway
export const Steam: React.FC<{ t: number; p: [number, number, number]; sigh?: number }> = ({ t, p, sigh = 0 }) => (<group>{Array.from({ length: 7 }, (_, i) => { const ph = (t * 0.45 + i / 7) % 1; return <mesh key={i} position={[p[0] + Math.sin(ph * 6 + i * 2) * (0.05 + 0.06 * sigh) + sigh * 0.04, p[1] + 0.245 + ph * 0.6, p[2] + Math.cos(ph * 5 + i) * 0.03]}><boxGeometry args={[0.045 + ph * 0.03, 0.045 + ph * 0.03, 0.045]} /><meshBasicMaterial color="#ffffff" transparent opacity={(1 - ph) * 0.4} depthWrite={false} fog={false} /></mesh>; })}</group>);
void sm;
