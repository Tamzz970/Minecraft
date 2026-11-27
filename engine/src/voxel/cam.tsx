import React from "react";
// Camera: one smooth Hermite path through keyframes (no random shake). Keys follow the MEANING of the voice.
import { useThree } from "@react-three/fiber";
import { clamp, V3 } from "./V";
export type CamKey = { t: number; p: V3; l: V3 };           // time (s), position, look-at
export const camAt = (keys: CamKey[], t: number, pick: (k: CamKey) => V3): V3 => {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[i], k1 = keys[i + 1], pr = keys[Math.max(0, i - 1)], nx = keys[Math.min(keys.length - 1, i + 2)], h = k1.t - k0.t, u = clamp((t - k0.t) / h);
  const a = pick(k0), b = pick(k1), out: V3 = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const m0 = pr === k0 ? (b[c] - a[c]) / h : (b[c] - pick(pr)[c]) / (k1.t - pr.t), m1 = nx === k1 ? (b[c] - a[c]) / h : (pick(nx)[c] - a[c]) / (nx.t - k0.t);
    out[c] = (2 * u ** 3 - 3 * u ** 2 + 1) * a[c] + (u ** 3 - 2 * u ** 2 + u) * h * m0 + (-2 * u ** 3 + 3 * u ** 2) * b[c] + (u ** 3 - u ** 2) * h * m1;
  }
  return out;
};
export const CamRig: React.FC<{ t: number; keys: CamKey[]; fov?: number }> = ({ t, keys, fov }) => {
  const { camera } = useThree();
  camera.position.set(...camAt(keys, t, (k) => k.p)); camera.lookAt(...camAt(keys, t, (k) => k.l));
  if (fov && (camera as any).fov !== fov) { (camera as any).fov = fov; (camera as any).updateProjectionMatrix(); }
  camera.updateMatrixWorld(); return null;
};
