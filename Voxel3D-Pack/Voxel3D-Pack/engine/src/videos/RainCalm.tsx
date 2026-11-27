// "Kenapa Hujan Membuat Kita Tenang?" - voxel night-rain room. 60 fps, 720x1280. Audio untrimmed (keeps [short pause] / [sighs]).
// Pattern for a new video: (1) camera keys from the voice meaning (2) a Scene that turns time t into hero `act` + effects (3) wrap in <VoxelVideo>.
import React from "react";
import { VoxelVideo } from "../voxel/ui";
import { CamKey } from "../voxel/cam";
import { Hero, LOOKS, Act } from "../voxel/Hero";
import { RoomA, Rug, Desk, Monitor, Keyboard, Cup, DeskLamp, Robot, Plant, Pendant, Picture, Bookshelf } from "../voxel/props";
import { City } from "../voxel/city";
import { Rain, GlassDrops, Rings, Steam } from "../voxel/weather";
import { NightRainLights } from "../voxel/Lights";
import { sm, bump } from "../voxel/V";
import phrases from "../../public/rain-calm/phrases.json";

export const FPS = 60;
// camera follows the voice: wide rain-city -> glass -> hero -> cup -> sigh -> out through the window to an aerial of the street
const KEYS: CamKey[] = [
  { t: 0.0, p: [3.2, 2.1, 4.6], l: [-4.5, 2.3, -0.4] }, { t: 3.1, p: [0.6, 2.0, 2.4], l: [-4.5, 2.2, -0.6] },
  { t: 5.5, p: [-1.9, 2.0, 1.0], l: [-4.2, 2.0, -0.7] }, { t: 8.4, p: [-2.7, 1.9, 0.5], l: [-4.2, 1.9, -0.8] },
  { t: 10.5, p: [-0.2, 1.8, 2.2], l: [-2.4, 1.55, -0.55] }, { t: 13.2, p: [-0.8, 1.7, 1.6], l: [-2.4, 1.55, -0.55] },
  { t: 15.2, p: [-1.7, 1.5, 1.4], l: [-2.9, 1.0, 0.4] }, { t: 17.2, p: [-0.9, 1.7, 1.9], l: [-2.5, 1.4, -0.3] },
  { t: 19.2, p: [-1.6, 1.9, 1.4], l: [-4.5, 2.2, -0.8] }, { t: 20.4, p: [-5.2, 3.0, 0.5], l: [-9, 1.0, -6] },
  { t: 22.6, p: [-5.2, 12, 14], l: [-8, -6, -14] },
];

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const sigh = bump(17.65, 17.95, 18.6, t);                 // [sighs]   ~17.7-18.2 s
  const calm = sm(8.4, 9.6, t);                             // [calm]    ~8.5 s
  const act: Act = {
    mode: "sit", arms: "type", sigh, calm,
    yaw: 0.6 - 1.1 * bump(3.0, 5.2, 8.2, t) - 0.2 * sm(13, 15, t) - 0.15 * sigh,        // [thoughtful]: looks out of the window
    pitch: -0.12 * bump(0.2, 1.5, 3.2, t) - 0.1 * bump(3, 5.2, 8.2, t) + 0.12 * sm(8.4, 9.6, t) * (1 - sm(12, 13.5, t)) + 0.1 * sm(13.5, 15.5, t) * (1 - sigh) - 0.14 * sigh,
    roll: 0.08 * bump(0, 1.2, 3.2, t) - 0.05 * sigh,
  };
  const ripple = sm(3.0, 3.8, t) * (1 - sm(12.4, 13.6, t)) * (0.55 + 0.45 * (1 - sm(8, 9, t)));
  return (<group>
    <NightRainLights />
    <RoomA /><Rug p={[-2, 0, -0.3]} /><Desk p={[-3.25, 0, -0.9]} /><Monitor p={[-3.62, 0.86, -1.5]} /><Keyboard p={[-2.85, 0.855, -0.12]} />
    <Cup p={[-2.85, 0.855, 0.5]} /><DeskLamp p={[-3.7, 0.87, 0.5]} /><Robot p={[-3.45, 0.86, -0.62]} /><Plant p={[-3.8, 0.84, -2.2]} />
    <Pendant p={[-1.0, 3.2, -1.2]} /><Picture p={[-2.0, 2.4, -3.38]} /><Bookshelf p={[1.1, 0, -3.2]} />
    <group position={[-2.4, 0, -0.55]} rotation={[0, Math.atan2(-0.5, 0.87), 0]}><Hero t={t} look={LOOKS.dev} act={act} /></group>
    <City t={t} /><Rain t={t} /><GlassDrops t={t} /><Rings t={t} amp={ripple} speed={t < 8.4 ? 0.45 : 0.25} /><Steam t={t} p={[-2.85, 0.855, 0.5]} sigh={sigh} />
  </group>);
};
export const RainCalm: React.FC = () => <VoxelVideo fps={FPS} keys={KEYS} phrases={phrases} audio="rain-calm/voice.mp3">{(t) => <Scene t={t} />}</VoxelVideo>;
