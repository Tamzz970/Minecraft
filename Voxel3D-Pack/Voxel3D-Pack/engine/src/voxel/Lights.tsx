// Night-rain lighting preset: cold ambient + moon light through the window (one shadow caster), fog + background.
import React from "react";
export const NightRainLights: React.FC<{ sky?: string }> = ({ sky = "#2b3138" }) => (<>
  <color attach="background" args={[sky]} /><fog attach="fog" args={[sky, 22, 95]} />
  <ambientLight color="#6f9cb8" intensity={0.75} /><hemisphereLight args={["#7fa8c4", "#3a2a20", 0.35]} />
  <directionalLight position={[-11, 9, -3]} color="#8fb3d9" intensity={0.9} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-camera-near={1} shadow-camera-far={30} shadow-bias={-0.0006} />
</>);
