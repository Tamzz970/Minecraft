// Register every video here (name = key in video.config.json). New video: add file + one line + a config entry.
import React from "react";
import { RainCalm } from "./RainCalm";
import { WalkDemo } from "./WalkDemo";
export const VIDEOS: Record<string, React.FC> = { RainCalm, WalkDemo };
