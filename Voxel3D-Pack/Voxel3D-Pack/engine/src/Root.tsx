import React from "react";
import { Composition } from "remotion";
import cfg from "../video.config.json";
import { VIDEOS } from "./videos";
// Single source of truth: engine/video.config.json (fps + frames per video). tools/prep_voice.py fills `frames` from the voiceover.
export const Root: React.FC = () => <>
  {Object.entries(cfg.videos).map(([id, v]) => <Composition key={id} id={id} component={VIDEOS[id]} width={720} height={1280} fps={v.fps} durationInFrames={v.frames} />)}
</>;
