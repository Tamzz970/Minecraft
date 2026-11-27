// Reusable voxel props. Every prop takes `p` (its local origin in the world) so a scene can place it anywhere.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Vx, Glow, rng, V3 } from "./V";
const FRM = "#1f3b38", WARM = "#ffb36a";
type P = { p: V3 };
const G: React.FC<P & { r?: number; children?: React.ReactNode }> = ({ p, r = 0, children }) => <group position={p} rotation={[0, r, 0]}>{children}</group>;

// "Room A": cutaway corner (back wall z=-3.5, left wall x=-4.2 with window z[-2.6,1.4] y[0.9,3.4], floor slab). Colours are parameters.
export const RoomA: React.FC<{ low?: string; high?: string; floor?: string; window?: boolean }> = ({ low = "#2e6b68", high = "#d8c4a0", floor = "#8a5a3a", window = true }) => (<group>
  <Vx p={[-0.65, -0.15, -0.6]} s={[7.3, 0.3, 6]} c={floor} />
  <Vx p={[-0.65, 0.65, -3.5]} s={[7.3, 1.3, 0.2]} c={low} /><Vx p={[-0.65, 2.65, -3.5]} s={[7.3, 2.7, 0.2]} c={high} />
  {window ? <>
    <Vx p={[-4.2, 0.65, -3.05]} s={[0.2, 1.3, 1.1]} c={low} /><Vx p={[-4.2, 2.65, -3.05]} s={[0.2, 2.7, 1.1]} c={high} />
    <Vx p={[-4.2, 0.65, 1.9]} s={[0.2, 1.3, 1.0]} c={low} /><Vx p={[-4.2, 2.65, 1.9]} s={[0.2, 2.7, 1.0]} c={high} />
    <Vx p={[-4.2, 0.45, -0.6]} s={[0.2, 0.9, 4.0]} c={low} /><Vx p={[-4.2, 3.9, -0.6]} s={[0.2, 1.0, 4.0]} c={high} />
    <Vx p={[-4.2, 0.96, -0.6]} s={[0.34, 0.12, 4.2]} c={FRM} /><Vx p={[-4.2, 3.4, -0.6]} s={[0.34, 0.12, 4.2]} c={FRM} />
    <Vx p={[-4.2, 2.15, -2.6]} s={[0.34, 2.5, 0.12]} c={FRM} /><Vx p={[-4.2, 2.15, 1.4]} s={[0.34, 2.5, 0.12]} c={FRM} />
    <Vx p={[-4.2, 2.15, -0.6]} s={[0.26, 2.4, 0.08]} c={FRM} /><Vx p={[-4.2, 2.15, -0.6]} s={[0.26, 0.08, 4.0]} c={FRM} />
    <mesh position={[-4.2, 2.15, -0.6]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[4.0, 2.45]} /><meshPhysicalMaterial color="#9fc4d6" transparent opacity={0.1} roughness={0.08} metalness={0} /></mesh>
  </> : <Vx p={[-4.2, 1.95, -0.6]} s={[0.2, 3.9, 6]} c={high} />}
</group>);

export const Rug: React.FC<P> = ({ p }) => <G p={p}><Vx p={[0, 0.012, 0]} s={[2.6, 0.024, 2.0]} c="#9c4636" /><Vx p={[0, 0.026, 0]} s={[2.2, 0.024, 1.6]} c="#d9a45a" /><Vx p={[0, 0.04, 0]} s={[1.9, 0.024, 1.3]} c="#9c4636" /></G>;

export const Desk: React.FC<P> = ({ p }) => (<G p={p}>
  <Vx p={[0, 0.8, 0]} s={[1.5, 0.08, 3.0]} c="#a8743f" />
  {[[-0.65, -1.4], [0.65, -1.4], [-0.65, 1.4], [0.65, 1.4]].map(([x, z], i) => <Vx key={i} p={[x, 0.38, z]} s={[0.08, 0.76, 0.08]} c="#6b4326" />)}
  <Vx p={[-0.35, 0.35, 0.9]} s={[0.6, 0.55, 0.9]} c="#8a5a30" />
</G>);                                           // desk top surface y=0.84 (relative to p.y=0 floor)

const CODE: [string, string][][] = [
  [["#e0864f", "import "], ["#cfe3e0", "{ World } "], ["#e0864f", "from "], ["#9bd07a", "\"city\";"]], [],
  [["#e0864f", "const "], ["#cfe3e0", "city = "], ["#e0864f", "new "], ["#7fd0e0", "World("], ["#cfe3e0", "{ rain: "], ["#f2c35e", "0.4"], ["#cfe3e0", " });"]],
  [["#cfe3e0", "city."], ["#7fd0e0", "build"], ["#cfe3e0", "(streets, lamps, tram);"]],
  [["#cfe3e0", "city."], ["#7fd0e0", "add"], ["#cfe3e0", "(windows, books, tea);"]], [],
  [["#6f8a89", "// ruangan kecil, hujan di luar"]], [["#cfe3e0", "city."], ["#7fd0e0", "render"], ["#cfe3e0", "(calm);"]],
];
// Monitor facing +x. p = base centre on the desk top. `lines` = coloured code rows [[colour, text], ...]
export const Monitor: React.FC<P & { lines?: [string, string][][] }> = ({ p, lines = CODE }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 640; c.height = 380; const g = c.getContext("2d")!;
    g.fillStyle = "#0e1c22"; g.fillRect(0, 0, 640, 380); g.fillStyle = "#16303a"; g.fillRect(0, 0, 640, 30); g.font = "bold 22px monospace";
    lines.forEach((r, i) => { let x = 24; r.forEach(([col, tx]) => { g.fillStyle = col; g.fillText(tx, x, 80 + i * 36); x += g.measureText(tx).width; }); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, [lines]);
  return (<G p={p}>
    <Vx p={[0, 0, 0]} s={[0.3, 0.04, 0.4]} c="#20262c" /><Vx p={[0, 0.19, 0]} s={[0.06, 0.34, 0.08]} c="#20262c" /><Vx p={[0, 0.52, 0]} s={[0.06, 0.82, 1.3]} c="#14191e" />
    <mesh position={[0.045, 0.52, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[1.16, 0.69]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
  </G>);
};
export const Keyboard: React.FC<P> = ({ p }) => <G p={p}><Vx p={[0, 0, 0]} s={[0.2, 0.03, 0.5]} c="#2a3138" /></G>;

export const Cup: React.FC<P> = ({ p }) => (<G p={p}>
  <Vx p={[0, 0, 0]} s={[0.3, 0.02, 0.3]} c="#e9e2d2" /><Vx p={[0, 0.105, 0]} s={[0.2, 0.2, 0.2]} c="#f1ece0" /><Vx p={[0, 0.207, 0]} s={[0.16, 0.01, 0.16]} c="#4a2a18" /><Vx p={[0, 0.115, 0.16]} s={[0.04, 0.1, 0.07]} c="#f1ece0" />
</G>);
export const DeskLamp: React.FC<P> = ({ p }) => (<G p={p}>
  <Vx p={[0, 0, 0]} s={[0.26, 0.04, 0.26]} c="#22282e" /><Vx p={[0, 0.28, 0]} s={[0.04, 0.55, 0.04]} c="#22282e" /><Vx p={[0.15, 0.58, 0]} s={[0.34, 0.04, 0.04]} c="#22282e" />
  <Vx p={[0.32, 0.53, 0]} s={[0.22, 0.14, 0.22]} c="#d6742f" e={WARM} ei={1.2} />
  <Glow p={[0.32, 0.45, 0]} s={2.6} c={WARM} o={0.5} /><pointLight position={[0.4, 0.43, 0]} color="#ffc27a" intensity={7} distance={6} />
</G>);
export const Robot: React.FC<P> = ({ p }) => (<G p={p}>
  <Vx p={[0, 0.14, 0]} s={[0.26, 0.28, 0.22]} c="#e26a2c" /><Vx p={[0, 0.36, 0]} s={[0.22, 0.17, 0.2]} c="#f08a43" /><Vx p={[0.11, 0.36, 0]} s={[0.02, 0.09, 0.09]} c="#fff6e0" e="#fff6e0" ei={1.5} shadow={false} /><Vx p={[0, 0.49, 0]} s={[0.02, 0.1, 0.02]} c="#22282e" />
</G>);
export const Plant: React.FC<P> = ({ p }) => (<G p={p}>
  <Vx p={[0, 0.1, 0]} s={[0.24, 0.2, 0.24]} c="#b5532f" /><Vx p={[0, 0.3, 0]} s={[0.1, 0.22, 0.1]} c="#3c8a4a" /><Vx p={[0.08, 0.38, 0]} s={[0.2, 0.1, 0.12]} c="#4aa05a" /><Vx p={[-0.08, 0.41, 0.05]} s={[0.16, 0.12, 0.14]} c="#2f7a3f" />
</G>);
export const Pendant: React.FC<P> = ({ p }) => (<G p={p}>
  <Vx p={[0, 0.55, 0]} s={[0.02, 0.9, 0.02]} c="#22282e" /><Vx p={[0, 0, 0]} s={[0.55, 0.22, 0.55]} c="#d6742f" e={WARM} ei={0.9} />
  <Glow p={[0, -0.2, 0]} s={3.4} c={WARM} o={0.45} /><pointLight position={[0, -0.3, 0]} color="#ffb267" intensity={10} distance={11} />
</G>);
export const Picture: React.FC<P> = ({ p }) => (<G p={p}>
  <Vx p={[0, 0, 0]} s={[0.95, 0.75, 0.06]} c="#1f3b38" /><Vx p={[0, 0, 0.04]} s={[0.8, 0.6, 0.04]} c="#e8d9b4" /><Vx p={[-0.1, -0.1, 0.07]} s={[0.3, 0.22, 0.03]} c="#c4622d" /><Vx p={[0.15, 0.05, 0.07]} s={[0.25, 0.2, 0.03]} c="#2f7f78" />
</G>);
export const Bookshelf: React.FC<P & { seed?: number }> = ({ p, seed = 7 }) => {
  const books = useMemo(() => {
    const r = rng(seed), cols = ["#b5472f", "#d98a3d", "#2f6f73", "#e0c58a", "#7a3a52", "#4a6a8a", "#c9a35a"], out: { x: number; y: number; w: number; h: number; c: string }[] = [];
    [0.08, 0.98, 1.88].forEach((y0) => { let x = -1.2; while (x < 1.15) { const w = 0.08 + r() * 0.09, h = 0.4 + r() * 0.35; out.push({ x: x + w / 2, y: y0 + 0.03 + h / 2, w, h, c: cols[Math.floor(r() * cols.length)] }); x += w + 0.01; } });
    return out;
  }, [seed]);
  return (<G p={p}>
    <Vx p={[-1.3, 1.5, 0]} s={[0.08, 3.0, 0.4]} c="#5a3420" /><Vx p={[1.3, 1.5, 0]} s={[0.08, 3.0, 0.4]} c="#5a3420" /><Vx p={[0, 3.0, 0]} s={[2.68, 0.08, 0.4]} c="#5a3420" />
    {[0.04, 0.94, 1.84].map((y) => <Vx key={y} p={[0, y, 0]} s={[2.6, 0.06, 0.4]} c="#6e4429" />)}
    {books.map((b, i) => <Vx key={i} p={[b.x, b.y, 0]} s={[b.w, b.h, 0.3]} c={b.c} />)}
  </G>);
};
