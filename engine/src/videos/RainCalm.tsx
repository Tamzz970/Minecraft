// "Kenapa Hujan Membuat Kita Tenang?" - 22.5s voxel trial. 60 fps, 720x1280. Audio untrimmed (keeps [short pause]/[sighs]).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import "@fontsource/lora/400-italic.css";
import { World } from "../voxel/World";
import { clamp, V3 } from "../voxel/V";
import phrases from "../../public/phrases.json";

export const FPS = 60;
type K = { t: number; p: V3; l: V3 };
// camera follows the voice: wide rain-city -> glass -> hero -> cup -> sigh -> pull out through the window to an aerial of the street
const KEYS: K[] = [
  { t: 0.0, p: [3.2, 2.1, 4.6], l: [-4.5, 2.3, -0.4] }, { t: 3.1, p: [0.6, 2.0, 2.4], l: [-4.5, 2.2, -0.6] },
  { t: 5.5, p: [-1.9, 2.0, 1.0], l: [-4.2, 2.0, -0.7] }, { t: 8.4, p: [-2.7, 1.9, 0.5], l: [-4.2, 1.9, -0.8] },
  { t: 10.5, p: [-0.2, 1.8, 2.2], l: [-2.4, 1.55, -0.55] }, { t: 13.2, p: [-0.8, 1.7, 1.6], l: [-2.4, 1.55, -0.55] },
  { t: 15.2, p: [-1.7, 1.5, 1.4], l: [-2.9, 1.0, 0.4] }, { t: 17.2, p: [-0.9, 1.7, 1.9], l: [-2.5, 1.4, -0.3] },
  { t: 19.2, p: [-1.6, 1.9, 1.4], l: [-4.5, 2.2, -0.8] }, { t: 20.4, p: [-5.2, 3.0, 0.5], l: [-9, 1.0, -6] },
  { t: 22.6, p: [-5.2, 12, 14], l: [-8, -6, -14] },
];
const hermite = (t: number, pick: (k: K) => V3): V3 => {
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const k0 = KEYS[i], k1 = KEYS[i + 1], pr = KEYS[Math.max(0, i - 1)], nx = KEYS[Math.min(KEYS.length - 1, i + 2)], h = k1.t - k0.t, u = clamp((t - k0.t) / h);
  const a = pick(k0), b = pick(k1), out: V3 = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    const m0 = pr === k0 ? (b[c] - a[c]) / h : (b[c] - pick(pr)[c]) / (k1.t - pr.t), m1 = nx === k1 ? (b[c] - a[c]) / h : (pick(nx)[c] - a[c]) / (nx.t - k0.t);
    out[c] = (2 * u ** 3 - 3 * u ** 2 + 1) * a[c] + (u ** 3 - 2 * u ** 2 + u) * h * m0 + (-2 * u ** 3 + 3 * u ** 2) * b[c] + (u ** 3 - u ** 2) * h * m1;
  }
  return out;
};
const Cam: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const p = hermite(t, (k) => k.p), l = hermite(t, (k) => k.l);
  camera.position.set(...p); camera.lookAt(...l); camera.updateMatrixWorld();
  return null;
};

const Caption: React.FC<{ t: number }> = ({ t }) => {
  const ph = (phrases as { text: string; a: number; b: number }[]).find((q) => q.text && t >= q.a - 0.05 && t < q.b + 0.4);
  if (!ph) return null;
  const o = interpolate(t, [ph.a - 0.05, ph.a + 0.2, ph.b + 0.1, ph.b + 0.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", left: 50, right: 50, bottom: 170, textAlign: "center", fontFamily: "Lora, Georgia, serif", fontStyle: "italic", fontSize: 38, lineHeight: 1.3, color: "#f4ead8", opacity: o, textShadow: "0 2px 16px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.6)" }}>{ph.text.toLowerCase()}</div>;
};

export const RainCalm: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("voice.mp3")} />
      <AbsoluteFill style={{ filter: "contrast(1.08) saturate(1.12)" }}>
        <ThreeCanvas width={720} height={1280} shadows camera={{ fov: 55, near: 0.1, far: 220 }} gl={{ antialias: true }}><Cam t={t} /><World t={t} /></ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 52%, rgba(0,0,0,.6) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 28%)" }} />
      <Caption t={t} />
    </AbsoluteFill>
  );
};
