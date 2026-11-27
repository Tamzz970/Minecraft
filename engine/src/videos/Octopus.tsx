// "Three Hearts" - octopus escapes a big fish. 54.2s, 30 fps, 720x1280. Silent render: audio (voice + sfx) is muxed from engine/public/mix.wav.
// Beat times come from 02-videos/octopus/phrases.json (real voiceover).
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { VoxelVideo } from "../voxel/ui";
import { CamKey } from "../voxel/cam";
import { SeaWorld, TL } from "../voxel/sea";
import phrases from "../../public/octopus/phrases.json";

export const FPS = 30;
export const FRAMES = 1627;

// camera follows the MEANING of each phrase: fish -> octopus -> squirt -> jet -> hearts -> crack -> fish leaves -> crawl
const KEYS: CamKey[] = [
  { t: 0.0, p: [5.4, 2.6, 6.6], l: [-0.1, 1.0, 0.0] }, { t: 0.9, p: [4.1, 2.2, 5.2], l: [0.1, 0.95, 0.0] },
  { t: 2.6, p: [1.9, 1.6, 3.4], l: [0.3, 0.9, 0.1] }, { t: 4.4, p: [0.9, 1.35, 2.5], l: [0.1, 0.85, 0.0] },
  { t: 6.2, p: [1.4, 1.5, 2.9], l: [0.3, 1.0, 0.0] }, { t: 7.0, p: [2.3, 1.95, 3.7], l: [0.5, 1.15, 0.1] },
  { t: 9.9, p: [1.5, 1.7, 2.5], l: [0.7, 1.35, 0.1] }, { t: 13.6, p: [0.9, 1.62, 1.8], l: [0.95, 1.62, 0.3] },
  { t: 16.6, p: [0.55, 1.6, 1.62], l: [0.95, 1.6, 0.3] }, { t: 20.3, p: [1.6, 1.62, 2.3], l: [1.1, 1.5, 0.2] },
  { t: 23.8, p: [0.72, 1.6, 1.58], l: [0.95, 1.6, 0.3] }, { t: 28.8, p: [1.05, 1.6, 1.75], l: [1.0, 1.62, 0.3] },
  { t: 33.2, p: [2.0, 1.75, 2.9], l: [1.2, 1.2, 0.1] }, { t: 38.4, p: [3.1, 1.62, 3.5], l: [2.5, 0.75, 0.2] },
  { t: 41.2, p: [4.3, 2.1, 4.7], l: [3.0, 1.45, -0.4] }, { t: 44.2, p: [3.0, 1.35, 3.1], l: [2.5, 0.72, 0.2] },
  { t: 47.8, p: [2.85, 0.88, 2.7], l: [2.25, 0.5, 0.3] }, { t: 50.4, p: [2.6, 0.64, 2.7], l: [1.65, 0.44, 0.35] },
  { t: TL.end, p: [3.3, 0.95, 4.3], l: [1.2, 0.46, 0.4] },
];

const Rays: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 30, FRAMES], [0.22, 0.32, 0.26]);
  return (<AbsoluteFill style={{ mixBlendMode: "screen", opacity: o }}>
    <Img src={staticFile("octopus/assets/glow-rays-overlay.png")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.02 + 0.03 * Math.sin(f / 110)})` }} />
  </AbsoluteFill>);
};
const Plankton: React.FC = () => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.3 }}>
    <Img src={staticFile("octopus/assets/bokeh-plankton-overlay.png")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translateY(${-14 * ((f / 450) % 1)}px) scale(1.04)` }} />
  </AbsoluteFill>);
};

export const Octopus: React.FC = () => (
  <VoxelVideo fps={FPS} keys={KEYS} phrases={phrases} overlay={<><Rays /><Plankton /></>}>
    {(t) => <SeaWorld t={t} />}
  </VoxelVideo>
);
