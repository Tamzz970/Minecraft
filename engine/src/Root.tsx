import React from "react";
import { Composition } from "remotion";
import "@fontsource/inter/900.css";
import { Main } from "./Main";
import { NvidiaV4 } from "./videos/NvidiaV4";
import { RainCalm } from "./videos/RainCalm";
// DURATION: set durationInFrames = ceil(voiceover_seconds * fps). Stick3D = 30 fps; voxel trial = 60 fps.
export const Root: React.FC = () => <>
  <Composition id="Main" component={Main} width={720} height={1280} fps={30} durationInFrames={60} />
  <Composition id="NvidiaV4" component={NvidiaV4} width={720} height={1280} fps={30} durationInFrames={661} />
  <Composition id="RainCalm" component={RainCalm} width={720} height={1280} fps={60} durationInFrames={1353} />
</>;
