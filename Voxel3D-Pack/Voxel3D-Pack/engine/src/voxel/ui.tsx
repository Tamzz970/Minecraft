// Video shell: audio, canvas, grade, vignette, subtitles. Default subtitles are VOXEL (real cubes in the 3D scene, see caption.tsx); "serif" = old 2D Lora style.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import "@fontsource/lora/400-italic.css";
import { CamRig, CamKey } from "./cam";
import { VoxelCaption, Phrase } from "./caption";
export type { Phrase } from "./caption";
export const Caption: React.FC<{ t: number; phrases: Phrase[] }> = ({ t, phrases }) => {
  const ph = phrases.find((q) => q.text && t >= q.a - 0.05 && t < q.b + 0.4);
  if (!ph) return null;
  const o = interpolate(t, [ph.a - 0.05, ph.a + 0.2, ph.b + 0.1, ph.b + 0.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", left: 50, right: 50, bottom: 170, textAlign: "center", fontFamily: "Lora, Georgia, serif", fontStyle: "italic", fontSize: 38, lineHeight: 1.3, color: "#f4ead8", opacity: o, textShadow: "0 2px 16px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.6)" }}>{ph.text.toLowerCase()}</div>;
};

// <VoxelVideo fps keys phrases audio="name/voice.mp3">{(t) => <World t={t}/>}</VoxelVideo>
export const VoxelVideo: React.FC<{ fps: number; keys: CamKey[]; phrases?: Phrase[]; audio?: string; fov?: number; caption?: "voxel" | "serif"; children: (t: number) => React.ReactNode }> = ({ fps, keys, phrases = [], audio, fov = 55, caption = "voxel", children }) => {
  const t = useCurrentFrame() / fps;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <AbsoluteFill style={{ filter: "contrast(1.08) saturate(1.12)" }}>
        <ThreeCanvas width={720} height={1280} shadows camera={{ fov, near: 0.1, far: 220 }} gl={{ antialias: true }}><CamRig t={t} keys={keys} fov={fov} />{children(t)}{caption === "voxel" && phrases.length ? <VoxelCaption t={t} phrases={phrases} /> : null}</ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 52%, rgba(0,0,0,.6) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(0,0,0,.5) 0%, rgba(0,0,0,0) 28%)" }} />
      {caption === "serif" ? <Caption t={t} phrases={phrases} /> : null}
    </AbsoluteFill>
  );
};
