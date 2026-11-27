// Demo of STANDING / WALKING / WAVING hero on the street (no audio). Walk phase = distance * WALK => feet never slide.
import React from "react";
import { VoxelVideo } from "../voxel/ui";
import { CamKey } from "../voxel/cam";
import { Hero, LOOKS, Act, WALK } from "../voxel/Hero";
import { City, Y0 } from "../voxel/city";
import { Rain } from "../voxel/weather";
import { NightRainLights } from "../voxel/Lights";
import { sm } from "../voxel/V";

const KEYS: CamKey[] = [
  { t: 0, p: [-7.7, -7.2, 7], l: [-4.9, -7.2, 3.5] }, { t: 2.2, p: [-7.7, -7.3, 1.8], l: [-4.9, -7.3, -0.2] }, { t: 3.6, p: [-7.5, -7.4, -0.6], l: [-4.9, -7.4, -2.6] },
  { t: 4.6, p: [-7.5, -7.6, -0.2], l: [-4.9, -7.6, -3.0] }, { t: 6.0, p: [-7.4, -7.7, 0.6], l: [-4.9, -7.7, -3.0] },
];
const SPEED = 2.0, S = 0.6;                                       // units/s, hero scale (street is bigger than the room)
const Scene: React.FC<{ t: number }> = ({ t }) => {
  const go = Math.min(t, 3.5), z = 4 - go * SPEED, moving = t < 3.5;
  const amp = moving ? sm(0, 0.3, t) : 0, turn = sm(3.5, 4.2, t);
  const act: Act = { mode: "stand", walk: go * SPEED * WALK, amp, arms: t > 4.3 ? "wave" : "down", mood: t > 4.3 ? "smile" : "neutral", yaw: -0.2 * turn };
  return (<group>
    <NightRainLights /><City t={t} /><Rain t={t} />
    <pointLight position={[-6.2, Y0 + 3.2, z + 0.5]} color="#ffc88a" intensity={22} distance={10} /><pointLight position={[-7.5, Y0 + 2.5, z - 1]} color="#7fb0d0" intensity={10} distance={9} />
    <group position={[-4.9, Y0 + 0.225, z]} rotation={[0, Math.PI + turn * (Math.PI / 2), 0]} scale={S}><Hero t={t} look={LOOKS.night} act={act} /></group>
  </group>);
};
export const WalkDemo: React.FC = () => <VoxelVideo fps={60} keys={KEYS}>{(t) => <Scene t={t} />}</VoxelVideo>;
