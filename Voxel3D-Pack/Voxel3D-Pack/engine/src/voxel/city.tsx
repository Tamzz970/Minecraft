// Voxel city below/outside a window: buildings, lit windows (instanced), street, lamps, tram.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Vx, Glow, rng, V3 } from "./V";
const WARM = "#ffb36a";
export type B = { x0: number; x1: number; z0: number; z1: number; top: number; c: string };
export const Y0 = -9;
const mk = (x0: number, x1: number, rows: [number, number, number, string][]): B[] => rows.map(([z0, z1, top, c]) => ({ x0, x1, z0, z1, top, c }));
export const DEFAULT_CITY: B[] = [
  ...mk(-14.4, -8.4, [[-34, -26, 9, "#a8412f"], [-26, -19, 4, "#2f6f73"], [-19, -12, 7, "#d9c9a2"], [-12, -4, 5.5, "#a8412f"], [-4, 3.5, 8, "#2f6f73"], [3.5, 11, 3.5, "#b5845a"], [11, 19, 10, "#a8412f"]]),   // across the street (windows face +x)
  ...mk(-22, -15, [[-36, -27, 15, "#2f6f73"], [-27, -17, 12, "#a8412f"], [-17, -8, 16, "#d9c9a2"], [-8, 2, 11, "#2f6f73"], [2, 12, 14, "#a8412f"], [12, 22, 17, "#b5845a"]]),  // skyline row
  ...mk(-4.4, 5, [[-36, -3.7, 5, "#2f6f73"], [-3.7, 2.4, -0.4, "#a8412f"], [2.4, 22, 2.4, "#b5845a"]]),                                                                      // our side (windows face -x)
];
const CityWindows: React.FC<{ city: B[] }> = ({ city }) => {
  const lit = useRef<THREE.InstancedMesh>(null), dark = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const r = rng(11), L: V3[] = [], D: V3[] = [];
    city.forEach((b) => { const east = b.x0 > -5, xf = east ? b.x0 : b.x1, sg = east ? -1 : 1; for (let z = b.z0 + 0.9; z < b.z1 - 0.5; z += 1.35) for (let y = Y0 + 0.9; y < b.top - 0.4; y += 1.5) (r() < 0.4 ? L : D).push([xf + sg * 0.03, y, z]); });
    return { L, D };
  }, [city]);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    ([[lit.current, data.L], [dark.current, data.D]] as [THREE.InstancedMesh | null, V3[]][]).forEach(([m, arr]) => { if (!m) return; arr.forEach((p, i) => { o.position.set(...p); o.scale.set(0.05, 0.68, 0.62); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.instanceMatrix.needsUpdate = true; });
  }, [data]);
  return (<group>
    <instancedMesh ref={lit} args={[undefined, undefined, data.L.length]}><boxGeometry /><meshStandardMaterial color="#3a2a1c" emissive={WARM} emissiveIntensity={1.5} /></instancedMesh>
    <instancedMesh ref={dark} args={[undefined, undefined, data.D.length]}><boxGeometry /><meshStandardMaterial color="#1a2830" roughness={0.3} /></instancedMesh>
  </group>);
};
export const Tram: React.FC<{ t: number; x?: number; speed?: number }> = ({ t, x = -6.4, speed = 2.8 }) => {
  const z = 24 - ((t * speed) % 64);
  return (<group position={[x, Y0 + 0.9, z]}>
    <Vx p={[0, 0, 0]} s={[1.5, 1.3, 3.8]} c="#e9dcbf" /><Vx p={[0, -0.25, 0]} s={[1.52, 0.35, 3.82]} c="#2f6f73" /><Vx p={[0, 0.72, 0]} s={[1.3, 0.14, 3.6]} c="#2f6f73" /><Vx p={[0, 1.0, 0.3]} s={[0.1, 0.35, 0.1]} c="#1c2227" />
    {[-1.3, -0.4, 0.5, 1.4].map((q) => <group key={q}><Vx p={[0.76, 0.2, q]} s={[0.03, 0.45, 0.6]} c="#3a2a1c" e={WARM} ei={1.3} shadow={false} /><Vx p={[-0.76, 0.2, q]} s={[0.03, 0.45, 0.6]} c="#3a2a1c" e={WARM} ei={1.3} shadow={false} /></group>)}
    <Glow p={[0, 0, -2.3]} s={2.6} c="#fff0c4" o={0.7} />
  </group>);
};
export const Street: React.FC<{ t: number; tram?: boolean }> = ({ t, tram = true }) => {
  const lamps = useMemo(() => { const a: V3[] = []; for (let z = -32; z < 20; z += 6) { a.push([-4.9, Y0, z]); a.push([-7.9, Y0, z + 3]); } return a; }, []);
  const dashes = useMemo(() => Array.from({ length: 24 }, (_, i) => -34 + i * 2.5), []);
  return (<group>
    <Vx p={[-6.4, Y0 - 0.05, -6]} s={[4.0, 0.1, 64]} c="#1b2329" r={0.3} shadow={false} />
    <Vx p={[-4.9, Y0 + 0.1, -6]} s={[1.0, 0.25, 64]} c="#3a4248" shadow={false} /><Vx p={[-7.9, Y0 + 0.1, -6]} s={[1.0, 0.25, 64]} c="#3a4248" shadow={false} />
    {dashes.map((z) => <Vx key={z} p={[-6.4, Y0 + 0.01, z]} s={[0.12, 0.02, 1.2]} c="#c9c3a8" shadow={false} />)}
    {lamps.map((p, i) => (<group key={i}><Vx p={[p[0], Y0 + 1.9, p[2]]} s={[0.08, 3.8, 0.08]} c="#20282d" shadow={false} /><Vx p={[p[0], Y0 + 3.85, p[2]]} s={[0.4, 0.1, 0.22]} c="#ffe0a8" e={WARM} ei={2} shadow={false} /><Glow p={[p[0], Y0 + 3.7, p[2]]} s={4.2} c={WARM} o={0.55} /></group>))}
    {tram ? <Tram t={t} /> : null}
  </group>);
};
export const City: React.FC<{ t: number; city?: B[]; tram?: boolean }> = ({ t, city = DEFAULT_CITY, tram = true }) => (<group>
  {city.map((b, i) => <Vx key={i} p={[(b.x0 + b.x1) / 2, (Y0 + b.top) / 2, (b.z0 + b.z1) / 2]} s={[b.x1 - b.x0, b.top - Y0, b.z1 - b.z0]} c={b.c} shadow={false} />)}
  <CityWindows city={city} /><Street t={t} tram={tram} />
</group>);
