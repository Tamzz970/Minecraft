// VOXEL SUBTITLES: each subtitle phrase is rasterised once with a pixel font (Press Start 2P, 8x8 grid) and every lit pixel becomes a real cube in the
// 3D scene. Three stacked layers (front cream, middle darker cream, back shadow) give the blocky extruded look. Rendered in screen space on top of
// everything (no depth test), so no wall or prop can ever hide it. Phrases should be <= 36 chars (2 lines of ~18).
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender } from "remotion";
import "@fontsource/press-start-2p/400.css";
import { clamp } from "./V";

export type Phrase = { text: string; tag?: string; a: number; b: number };
const CH = 8, LINE_H = 11, MAXC = 18, PX = 4.1;                    // font px, line pitch (grid), chars per line, screen px per grid pixel
type Bm = { w: number; h: number; px: [number, number][] };
const wrap = (text: string) => { const out: string[] = []; let cur = ""; for (const w of text.split(/\s+/)) { const t = cur ? cur + " " + w : w; if (t.length <= MAXC || !cur) cur = t; else { out.push(cur); cur = w; } } if (cur) out.push(cur); return out; };
const raster = (text: string): Bm => {
  const lines = wrap(text.toLowerCase()), mx = Math.max(...lines.map((l) => l.length)), w = mx * CH, h = lines.length * LINE_H;
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d", { willReadFrequently: true })!;
  g.fillStyle = "#fff"; g.font = `${CH}px "Press Start 2P"`; g.textBaseline = "top"; g.imageSmoothingEnabled = false;
  lines.forEach((l, i) => g.fillText(l, Math.floor(((mx - l.length) * CH) / 2), i * LINE_H));
  const d = g.getImageData(0, 0, w, h).data, px: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 110) px.push([x, y]);
  return { w, h, px };
};
const LAYERS = [{ c: "#0b171b", z: -2, dx: 1, dy: -1, ro: 1000 }, { c: "#b9a883", z: -1, dx: 0.5, dy: -0.5, ro: 1001 }, { c: "#f4ead8", z: 0, dx: 0, dy: 0, ro: 1002 }];

export const VoxelCaption: React.FC<{ t: number; phrases: Phrase[]; screenY?: number }> = ({ t, phrases, screenY = -0.6 }) => {
  const { camera } = useThree();
  const [handle] = useState(() => delayRender("voxel-caption-font"));
  const [bms, setBms] = useState<Bm[] | null>(null);
  const refs = [useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null), useRef<THREE.InstancedMesh>(null)];
  useEffect(() => {
    document.fonts.load(`${CH}px "Press Start 2P"`).then(() => { setBms(phrases.map((p) => (p.text ? raster(p.text) : { w: 0, h: 0, px: [] }))); continueRender(handle); }).catch(() => continueRender(handle));
  }, []);
  const i = phrases.findIndex((q) => q.text && t >= q.a - 0.05 && t < q.b + 0.4);
  const cam = camera as THREE.PerspectiveCamera, D = 3, visH = 2 * D * Math.tan((cam.fov * Math.PI) / 360), u = (PX * visH) / 1280;
  useLayoutEffect(() => {
    if (!bms) return; const o = new THREE.Object3D(), bm = i >= 0 ? bms[i] : null;
    refs.forEach((r, li) => { const m = r.current; if (!m) return; const L = LAYERS[li]; let n = 0;
      if (bm) bm.px.forEach(([x, y]) => { o.position.set((x - bm.w / 2 + 0.5 + L.dx) * u, -(y - bm.h / 2 + 0.5 + L.dy) * u, L.z * u); o.updateMatrix(); m.setMatrixAt(n++, o.matrix); });
      m.count = n; m.instanceMatrix.needsUpdate = true; });
  }, [bms, i, u]);
  if (!bms) return null;
  const ph = i >= 0 ? phrases[i] : null, k = ph ? clamp((t - (ph.a - 0.05)) / 0.18) : 1;
  const pop = 0.82 + 0.18 * (1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2));      // easeOutBack pop-in
  const alpha = ph ? clamp(Math.min((t - (ph.a - 0.05)) / 0.12, (ph.b + 0.4 - t) / 0.25)) : 0;
  const pos = new THREE.Vector3(0, screenY * (visH / 2), -D).applyQuaternion(cam.quaternion).add(cam.position);
  const N = Math.max(1, ...bms.map((b) => b.px.length));
  return (<group position={pos} quaternion={cam.quaternion} scale={pop}>
    {LAYERS.map((L, li) => (<instancedMesh key={li} ref={refs[li]} args={[undefined, undefined, N]} frustumCulled={false} renderOrder={L.ro}>
      <boxGeometry args={[u, u, u]} /><meshBasicMaterial color={L.c} transparent opacity={alpha} depthTest={false} depthWrite={false} fog={false} toneMapped={false} />
    </instancedMesh>))}
  </group>);
};
