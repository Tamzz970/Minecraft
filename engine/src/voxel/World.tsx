// Voxel world: cutaway room (left-wall window), desk props, bookshelf, voxel city + street below, rain, glass drops, sound-ripple frames, cup steam.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Vx, Glow, rng, sm, bump, V3 } from "./V";
import { Hero } from "./Hero";

const WALL_T = "#2e6b68", WALL_C = "#d8c4a0", FRM = "#1f3b38", WOOD = "#a8743f", WARM = "#ffb36a";

const Screen: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 640; c.height = 380; const g = c.getContext("2d")!;
    g.fillStyle = "#0e1c22"; g.fillRect(0, 0, 640, 380); g.fillStyle = "#16303a"; g.fillRect(0, 0, 640, 30);
    g.font = "bold 22px monospace";
    const L: [number, string, string][] = [[1, "#e0864f", "import"], [0, "", ""]];
    const rows: [string, string][][] = [
      [["#e0864f", "import "], ["#cfe3e0", "{ World } "], ["#e0864f", "from "], ["#9bd07a", "\"city\";"]],
      [],
      [["#e0864f", "const "], ["#cfe3e0", "city = "], ["#e0864f", "new "], ["#7fd0e0", "World("], ["#cfe3e0", "{ rain: "], ["#f2c35e", "0.4"], ["#cfe3e0", " });"]],
      [["#cfe3e0", "city."], ["#7fd0e0", "build"], ["#cfe3e0", "(streets, lamps, tram);"]],
      [["#cfe3e0", "city."], ["#7fd0e0", "add"], ["#cfe3e0", "(windows, books, tea);"]],
      [],
      [["#6f8a89", "// ruangan kecil, hujan di luar"]],
      [["#cfe3e0", "city."], ["#7fd0e0", "render"], ["#cfe3e0", "(calm);"]],
    ];
    void L; rows.forEach((r, i) => { let x = 24; r.forEach(([col, tx]) => { g.fillStyle = col; g.fillText(tx, x, 80 + i * 36); x += g.measureText(tx).width; }); });
    g.fillStyle = "#f2c35e"; g.fillRect(24 + 150, 80 + 7 * 36 - 18, 12, 24);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  return <mesh position={[-3.575, 1.38, -1.5]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[1.16, 0.69]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>;
};

const Room: React.FC = () => {
  const books = useMemo(() => {
    const r = rng(7), cols = ["#b5472f", "#d98a3d", "#2f6f73", "#e0c58a", "#7a3a52", "#4a6a8a", "#c9a35a"], out: { x: number; y: number; w: number; h: number; c: string }[] = [];
    [0.08, 0.98, 1.88].forEach((y0) => { let x = -0.1; while (x < 2.25) { const w = 0.08 + r() * 0.09, h = 0.4 + r() * 0.35; out.push({ x: x + w / 2, y: y0 + 0.03 + h / 2, w, h, c: cols[Math.floor(r() * cols.length)] }); x += w + 0.01; } });
    return out;
  }, []);
  return (<group>
    {/* floor, rug */}
    <Vx p={[-0.65, -0.15, -0.6]} s={[7.3, 0.3, 6]} c="#8a5a3a" />
    <Vx p={[-2.0, 0.012, -0.3]} s={[2.6, 0.024, 2.0]} c="#9c4636" /><Vx p={[-2.0, 0.026, -0.3]} s={[2.2, 0.024, 1.6]} c="#d9a45a" /><Vx p={[-2.0, 0.04, -0.3]} s={[1.9, 0.024, 1.3]} c="#9c4636" />
    {/* back wall */}
    <Vx p={[-0.65, 0.65, -3.5]} s={[7.3, 1.3, 0.2]} c={WALL_T} /><Vx p={[-0.65, 2.65, -3.5]} s={[7.3, 2.7, 0.2]} c={WALL_C} />
    {/* left wall with window opening z[-2.6,1.4], y[0.9,3.4] */}
    <Vx p={[-4.2, 0.65, -3.05]} s={[0.2, 1.3, 1.1]} c={WALL_T} /><Vx p={[-4.2, 2.65, -3.05]} s={[0.2, 2.7, 1.1]} c={WALL_C} />
    <Vx p={[-4.2, 0.65, 1.9]} s={[0.2, 1.3, 1.0]} c={WALL_T} /><Vx p={[-4.2, 2.65, 1.9]} s={[0.2, 2.7, 1.0]} c={WALL_C} />
    <Vx p={[-4.2, 0.45, -0.6]} s={[0.2, 0.9, 4.0]} c={WALL_T} /><Vx p={[-4.2, 3.9, -0.6]} s={[0.2, 1.0, 4.0]} c={WALL_C} />
    {/* window frame */}
    <Vx p={[-4.2, 0.96, -0.6]} s={[0.34, 0.12, 4.2]} c={FRM} /><Vx p={[-4.2, 3.4, -0.6]} s={[0.34, 0.12, 4.2]} c={FRM} />
    <Vx p={[-4.2, 2.15, -2.6]} s={[0.34, 2.5, 0.12]} c={FRM} /><Vx p={[-4.2, 2.15, 1.4]} s={[0.34, 2.5, 0.12]} c={FRM} />
    <Vx p={[-4.2, 2.15, -0.6]} s={[0.26, 2.4, 0.08]} c={FRM} /><Vx p={[-4.2, 2.15, -0.6]} s={[0.26, 0.08, 4.0]} c={FRM} />
    <mesh position={[-4.2, 2.15, -0.6]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[4.0, 2.45]} /><meshPhysicalMaterial color="#9fc4d6" transparent opacity={0.1} roughness={0.08} metalness={0} /></mesh>
    {/* bookshelf */}
    <Vx p={[-0.2, 1.5, -3.2]} s={[0.08, 3.0, 0.4]} c="#5a3420" /><Vx p={[2.4, 1.5, -3.2]} s={[0.08, 3.0, 0.4]} c="#5a3420" /><Vx p={[1.1, 3.0, -3.2]} s={[2.68, 0.08, 0.4]} c="#5a3420" />
    {[0.04, 0.94, 1.84].map((y) => <Vx key={y} p={[1.1, y, -3.2]} s={[2.6, 0.06, 0.4]} c="#6e4429" />)}
    {books.map((b, i) => <Vx key={i} p={[b.x, b.y, -3.2]} s={[b.w, b.h, 0.3]} c={b.c} />)}
    {/* picture */}
    <Vx p={[-2.0, 2.4, -3.38]} s={[0.95, 0.75, 0.06]} c="#1f3b38" /><Vx p={[-2.0, 2.4, -3.34]} s={[0.8, 0.6, 0.04]} c="#e8d9b4" /><Vx p={[-2.1, 2.3, -3.31]} s={[0.3, 0.22, 0.03]} c="#c4622d" /><Vx p={[-1.85, 2.45, -3.31]} s={[0.25, 0.2, 0.03]} c="#2f7f78" />
    {/* desk */}
    <Vx p={[-3.25, 0.8, -0.9]} s={[1.5, 0.08, 3.0]} c={WOOD} />
    {[[-3.9, -2.3], [-2.6, -2.3], [-3.9, 0.5], [-2.6, 0.5]].map(([x, z], i) => <Vx key={i} p={[x, 0.38, z]} s={[0.08, 0.76, 0.08]} c="#6b4326" />)}
    <Vx p={[-3.6, 0.35, 0.0]} s={[0.6, 0.55, 0.9]} c="#8a5a30" />
    {/* monitor */}
    <Vx p={[-3.62, 0.86, -1.5]} s={[0.3, 0.04, 0.4]} c="#20262c" /><Vx p={[-3.62, 1.05, -1.5]} s={[0.06, 0.34, 0.08]} c="#20262c" /><Vx p={[-3.62, 1.38, -1.5]} s={[0.06, 0.82, 1.3]} c="#14191e" /><Screen />
    <Vx p={[-2.85, 0.855, -0.12]} s={[0.2, 0.03, 0.5]} c="#2a3138" />
    {/* cup + saucer */}
    <Vx p={[-2.85, 0.855, 0.5]} s={[0.3, 0.02, 0.3]} c="#e9e2d2" /><Vx p={[-2.85, 0.96, 0.5]} s={[0.2, 0.2, 0.2]} c="#f1ece0" /><Vx p={[-2.85, 1.062, 0.5]} s={[0.16, 0.01, 0.16]} c="#4a2a18" /><Vx p={[-2.85, 0.97, 0.66]} s={[0.04, 0.1, 0.07]} c="#f1ece0" />
    {/* desk lamp */}
    <Vx p={[-3.7, 0.87, 0.5]} s={[0.26, 0.04, 0.26]} c="#22282e" /><Vx p={[-3.7, 1.15, 0.5]} s={[0.04, 0.55, 0.04]} c="#22282e" /><Vx p={[-3.55, 1.45, 0.5]} s={[0.34, 0.04, 0.04]} c="#22282e" /><Vx p={[-3.38, 1.4, 0.5]} s={[0.22, 0.14, 0.22]} c="#d6742f" e={WARM} ei={1.2} />
    <Glow p={[-3.38, 1.32, 0.5]} s={2.6} c={WARM} o={0.5} /><pointLight position={[-3.3, 1.3, 0.5]} color="#ffc27a" intensity={7} distance={6} />
    {/* tiny robot + plant */}
    <Vx p={[-3.45, 1.0, -0.62]} s={[0.26, 0.28, 0.22]} c="#e26a2c" /><Vx p={[-3.45, 1.22, -0.62]} s={[0.22, 0.17, 0.2]} c="#f08a43" /><Vx p={[-3.34, 1.22, -0.62]} s={[0.02, 0.09, 0.09]} c="#fff6e0" e="#fff6e0" ei={1.5} shadow={false} /><Vx p={[-3.45, 1.35, -0.62]} s={[0.02, 0.1, 0.02]} c="#22282e" />
    <Vx p={[-3.8, 0.94, -2.2]} s={[0.24, 0.2, 0.24]} c="#b5532f" /><Vx p={[-3.8, 1.14, -2.2]} s={[0.1, 0.22, 0.1]} c="#3c8a4a" /><Vx p={[-3.72, 1.22, -2.2]} s={[0.2, 0.1, 0.12]} c="#4aa05a" /><Vx p={[-3.88, 1.25, -2.15]} s={[0.16, 0.12, 0.14]} c="#2f7a3f" />
    {/* pendant */}
    <Vx p={[-1.0, 3.75, -1.2]} s={[0.02, 0.9, 0.02]} c="#22282e" /><Vx p={[-1.0, 3.2, -1.2]} s={[0.55, 0.22, 0.55]} c="#d6742f" e={WARM} ei={0.9} />
    <Glow p={[-1.0, 3.0, -1.2]} s={3.4} c={WARM} o={0.45} /><pointLight position={[-1.0, 2.9, -1.2]} color="#ffb267" intensity={10} distance={11} />
  </group>);
};

// ---- city -----------------------------------------------------------------
type B = { x0: number; x1: number; z0: number; z1: number; top: number; c: string };
const Y0 = -9;
const WEST1: B[] = [[-34, -26, 9, "#a8412f"], [-26, -19, 4, "#2f6f73"], [-19, -12, 7, "#d9c9a2"], [-12, -4, 5.5, "#a8412f"], [-4, 3.5, 8, "#2f6f73"], [3.5, 11, 3.5, "#b5845a"], [11, 19, 10, "#a8412f"]].map(([z0, z1, top, c]) => ({ x0: -14.4, x1: -8.4, z0: z0 as number, z1: z1 as number, top: top as number, c: c as string }));
const WEST2: B[] = [[-36, -27, 15, "#2f6f73"], [-27, -17, 12, "#a8412f"], [-17, -8, 16, "#d9c9a2"], [-8, 2, 11, "#2f6f73"], [2, 12, 14, "#a8412f"], [12, 22, 17, "#b5845a"]].map(([z0, z1, top, c]) => ({ x0: -22, x1: -15, z0: z0 as number, z1: z1 as number, top: top as number, c: c as string }));
const EAST: B[] = [[-36, -3.7, 5, "#2f6f73"], [-3.7, 2.4, -0.4, "#a8412f"], [2.4, 22, 2.4, "#b5845a"]].map(([z0, z1, top, c]) => ({ x0: -4.4, x1: 5, z0: z0 as number, z1: z1 as number, top: top as number, c: c as string }));

const CityWindows: React.FC = () => {
  const lit = useRef<THREE.InstancedMesh>(null), dark = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const r = rng(11), L: V3[] = [], D: V3[] = [];
    const face = (xf: number, sgn: number, z0: number, z1: number, yb: number, yt: number, p: number) => {
      for (let z = z0 + 0.9; z < z1 - 0.5; z += 1.35) for (let y = yb + 0.9; y < yt - 0.4; y += 1.5) (r() < p ? L : D).push([xf + sgn * 0.03, y, z]);
    };
    WEST1.forEach((b) => face(b.x1, 1, b.z0, b.z1, Y0, b.top, 0.42)); WEST2.forEach((b) => face(b.x1, 1, b.z0, b.z1, Y0, b.top, 0.38)); EAST.forEach((b) => face(b.x0, -1, b.z0, b.z1, Y0, b.top, 0.4));
    return { L, D };
  }, []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    ([[lit.current, data.L], [dark.current, data.D]] as [THREE.InstancedMesh | null, V3[]][]).forEach(([m, arr]) => { if (!m) return; arr.forEach((p, i) => { o.position.set(...p); o.scale.set(0.05, 0.68, 0.62); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }); m.instanceMatrix.needsUpdate = true; });
  }, [data]);
  return (<group>
    <instancedMesh ref={lit} args={[undefined, undefined, data.L.length]}><boxGeometry /><meshStandardMaterial color="#3a2a1c" emissive="#ffb35c" emissiveIntensity={1.5} /></instancedMesh>
    <instancedMesh ref={dark} args={[undefined, undefined, data.D.length]}><boxGeometry /><meshStandardMaterial color="#1a2830" roughness={0.3} /></instancedMesh>
  </group>);
};

const Tram: React.FC<{ t: number }> = ({ t }) => {
  const z = 24 - ((t * 2.8) % 64), y = Y0 + 0.9;
  return (<group position={[-6.4, y, z]}>
    <Vx p={[0, 0, 0]} s={[1.5, 1.3, 3.8]} c="#e9dcbf" /><Vx p={[0, -0.25, 0]} s={[1.52, 0.35, 3.82]} c="#2f6f73" /><Vx p={[0, 0.72, 0]} s={[1.3, 0.14, 3.6]} c="#2f6f73" /><Vx p={[0, 1.0, 0.3]} s={[0.1, 0.35, 0.1]} c="#1c2227" />
    {[-1.3, -0.4, 0.5, 1.4].map((q) => <group key={q}><Vx p={[0.76, 0.2, q]} s={[0.03, 0.45, 0.6]} c="#3a2a1c" e={WARM} ei={1.3} shadow={false} /><Vx p={[-0.76, 0.2, q]} s={[0.03, 0.45, 0.6]} c="#3a2a1c" e={WARM} ei={1.3} shadow={false} /></group>)}
    <Glow p={[0, 0.0, -2.3]} s={2.6} c="#fff0c4" o={0.7} />
  </group>);
};

const Street: React.FC<{ t: number }> = ({ t }) => {
  const lamps = useMemo(() => { const a: V3[] = []; for (let z = -32; z < 20; z += 6) { a.push([-4.9, Y0, z]); a.push([-7.9, Y0, z + 3]); } return a; }, []);
  const dashes = useMemo(() => Array.from({ length: 24 }, (_, i) => -34 + i * 2.5), []);
  return (<group>
    <Vx p={[-6.4, Y0 - 0.05, -6]} s={[4.0, 0.1, 64]} c="#1b2329" r={0.3} shadow={false} />
    <Vx p={[-4.9, Y0 + 0.1, -6]} s={[1.0, 0.25, 64]} c="#3a4248" shadow={false} /><Vx p={[-7.9, Y0 + 0.1, -6]} s={[1.0, 0.25, 64]} c="#3a4248" shadow={false} />
    {dashes.map((z) => <Vx key={z} p={[-6.4, Y0 + 0.01, z]} s={[0.12, 0.02, 1.2]} c="#c9c3a8" shadow={false} />)}
    {lamps.map((p, i) => (<group key={i}><Vx p={[p[0], Y0 + 1.9, p[2]]} s={[0.08, 3.8, 0.08]} c="#20282d" shadow={false} /><Vx p={[p[0], Y0 + 3.85, p[2]]} s={[0.4, 0.1, 0.22]} c="#ffe0a8" e={WARM} ei={2} shadow={false} /><Glow p={[p[0], Y0 + 3.7, p[2]]} s={4.2} c={WARM} o={0.55} /></group>))}
    <Tram t={t} />
  </group>);
};

const City: React.FC<{ t: number }> = ({ t }) => (<group>
  {[...WEST1, ...WEST2, ...EAST].map((b, i) => <Vx key={i} p={[(b.x0 + b.x1) / 2, (Y0 + b.top) / 2, (b.z0 + b.z1) / 2]} s={[b.x1 - b.x0, b.top - Y0, b.z1 - b.z0]} c={b.c} shadow={false} />)}
  {/* rooftop caps on the room's building top edge handled by room slab */}
  <CityWindows /><Street t={t} />
</group>);

// ---- weather & details -------------------------------------------------------
const Rain: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null), N = 900;
  const drops = useMemo(() => { const r = rng(3); return Array.from({ length: N }, (_, i) => { const near = i < 350; return { x: near ? -9 + r() * 4.6 : -26 + r() * 22, z: near ? -5 + r() * 9 : -14 + r() * 26, s: 11 + r() * 5, o: r(), H: near ? 9 : 22, y0: near ? -3 : -9 }; }); }, []);
  useLayoutEffect(() => {
    const o = new THREE.Object3D(); if (!ref.current) return;
    drops.forEach((d, i) => { const k = (t * d.s + d.o * d.H) % d.H; o.position.set(d.x - k * 0.1, d.y0 + d.H - k, d.z); o.rotation.set(0, 0, 0.1); o.scale.set(0.014, 0.5, 0.014); o.updateMatrix(); ref.current!.setMatrixAt(i, o.matrix); });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}><boxGeometry /><meshBasicMaterial color="#b9d3e2" transparent opacity={0.5} fog={false} /></instancedMesh>;
};

const GlassDrops: React.FC<{ t: number }> = ({ t }) => {
  const d = useMemo(() => { const r = rng(5); return Array.from({ length: 26 }, (_, i) => ({ z: -2.45 + r() * 3.7, y: 1.1 + r() * 2.2, sp: 0.04 + r() * 0.09, o: r(), l: 0.05 + r() * 0.09, st: i > 15 })); }, []);
  return (<group>{d.map((q, i) => { const y = q.st ? q.y : q.y - ((t * q.sp + q.o) % 1) * 0.9; return <mesh key={i} position={[-4.31, y, q.z]}><boxGeometry args={[0.012, q.st ? 0.035 : q.l, 0.035]} /><meshStandardMaterial color="#e2f1f8" emissive="#bcd8e6" emissiveIntensity={0.6} transparent opacity={0.6} roughness={0.1} /></mesh>; })}</group>);
};

const Rings: React.FC<{ t: number }> = ({ t }) => {
  const amp = sm(3.0, 3.8, t) * (1 - sm(12.4, 13.6, t)) * (0.55 + 0.45 * (1 - sm(8, 9, t)));
  const speed = t < 8.4 ? 0.45 : 0.25;
  if (amp < 0.01) return null;
  return (<group>{[0, 1, 2, 3].map((i) => { const ph = (t * speed + i / 4) % 1, sc = 0.4 + ph * 0.6, op = bump(0, 0.3, 1, ph) * amp * 0.4, h = 0.6 * sc, x = -3.95 + ph * 2.3;
    const m = <meshBasicMaterial color="#b6e8f2" transparent opacity={op} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />;
    return (<group key={i} position={[x, 1.95, -0.9]}>
      <mesh position={[0, h, 0]}><boxGeometry args={[0.03, 0.035, h * 2]} />{m}</mesh><mesh position={[0, -h, 0]}><boxGeometry args={[0.03, 0.035, h * 2]} />{m}</mesh>
      <mesh position={[0, 0, h]}><boxGeometry args={[0.03, h * 2, 0.035]} />{m}</mesh><mesh position={[0, 0, -h]}><boxGeometry args={[0.03, h * 2, 0.035]} />{m}</mesh>
    </group>); })}</group>);
};

const Steam: React.FC<{ t: number }> = ({ t }) => (<group>{Array.from({ length: 7 }, (_, i) => { const ph = (t * 0.45 + i / 7) % 1, sigh = bump(17.65, 17.95, 18.7, t); return <mesh key={i} position={[-2.85 + Math.sin(ph * 6 + i * 2) * (0.05 + 0.06 * sigh) + sigh * 0.04, 1.1 + ph * 0.6, 0.5 + Math.cos(ph * 5 + i) * 0.03]}><boxGeometry args={[0.045 + ph * 0.03, 0.045 + ph * 0.03, 0.045]} /><meshBasicMaterial color="#ffffff" transparent opacity={(1 - ph) * 0.4} depthWrite={false} fog={false} /></mesh>; })}</group>);

export const World: React.FC<{ t: number }> = ({ t }) => (<group>
  <color attach="background" args={["#2b3138"]} /><fog attach="fog" args={["#2b3138", 22, 95]} />
  <ambientLight color="#6f9cb8" intensity={0.75} /><hemisphereLight args={["#7fa8c4", "#3a2a20", 0.35]} />
  <directionalLight position={[-11, 9, -3]} color="#8fb3d9" intensity={0.9} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-camera-near={1} shadow-camera-far={30} shadow-bias={-0.0006} />
  <Room /><group position={[-2.4, 0, -0.55]} rotation={[0, Math.atan2(-0.5, 0.87), 0]}><Hero t={t} /></group>
  <City t={t} /><Rain t={t} /><GlassDrops t={t} /><Rings t={t} /><Steam t={t} />
</group>);
