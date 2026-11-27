// Voxel hero: blocky 3D character. Local space: forward = +z, character's LEFT = +x, feet at y=0 (stand) / seat at y=0.5 (sit).
// A scene drives the hero ONLY through `act` (computed from the voice timeline by the scene) - nothing is hardcoded here.
import React from "react";
import { Vx } from "./V";

export type Look = { skin: string; hood: string; hood2: string; pants: string; shoe: string; hair: string; frame: string; glasses: boolean; chair: string };
export const LOOKS: Record<string, Look> = {
  dev: { skin: "#f0c7a0", hood: "#2f7f78", hood2: "#3b948c", pants: "#2b3a4c", shoe: "#c4622d", hair: "#1c1a22", frame: "#15181d", glasses: true, chair: "#7a2f22" },
  rust: { skin: "#e3b48c", hood: "#b5472f", hood2: "#c9583d", pants: "#2e2a36", shoe: "#e8d9b4", hair: "#5a3420", frame: "#15181d", glasses: false, chair: "#2f6f73" },
  night: { skin: "#f6d6b5", hood: "#2a3f6b", hood2: "#38538a", pants: "#1d2330", shoe: "#d9a45a", hair: "#e8d9b4", frame: "#15181d", glasses: true, chair: "#5a3420" },
};
export type Act = {
  mode?: "sit" | "stand";
  yaw?: number; pitch?: number; roll?: number;                 // head (yaw + = toward the character's left)
  sigh?: number; calm?: number;                                // 0..1 emotion pulses
  mood?: "neutral" | "smile" | "shock" | "sad" | "laugh";
  arms?: "type" | "down" | "up" | "point" | "wave" | "hold";
  walk?: number; amp?: number;                                 // walk phase (rad) and swing amplitude 0..1 (stand only)
};
export const WALK = 3.0; // walk phase (rad) per world unit travelled => feet never slide

export const Hero: React.FC<{ t: number; look?: Look; act?: Act }> = ({ t, look = LOOKS.dev, act = {} }) => {
  const { mode = "sit", yaw = 0, pitch = 0, roll = 0, sigh = 0, calm = 0, mood = "neutral", walk = 0, amp = 0 } = act;
  const sit = mode === "sit", arms = act.arms ?? (sit ? "type" : "down");
  const base = sit ? 0.58 : 1.03, bob = sit ? 0 : Math.abs(Math.sin(walk)) * 0.05 * amp;
  const shoulder = -0.035 * calm - 0.05 * sigh, chest = 1 + Math.sin(t * 1.5) * 0.012 + 0.05 * sigh;
  const blink = (t * 0.33) % 1 < 0.035 ? 0.1 : 1;

  const arm = (s: 1 | -1) => {
    let rx = 0, rz = 0, el = 0, elz = 0; const ph = walk + (s > 0 ? 0 : Math.PI);
    if (arms === "type") { rx = -0.9; el = -0.6 + Math.sin(t * 15 + s) * 0.025; }
    else if (arms === "down") { rx = Math.sin(ph) * 0.7 * amp; el = -0.1 + Math.min(0, rx) * 0.6; }
    else if (arms === "hold") { rx = -0.9; el = -0.9; }
    else if (arms === "up") { rz = s < 0 ? -2.7 : 2.7; }
    else if (s < 0 && arms === "point") { rx = -1.5; }
    else if (s < 0 && arms === "wave") { rz = -2.6; elz = Math.sin(t * 9) * 0.45; }
    else { rx = Math.sin(ph) * 0.5 * amp; }
    return (<group position={[s * 0.4, base + 0.64 + shoulder + bob, 0.02]} rotation={[rx, 0, rz]}>
      <Vx p={[0, -0.22, 0]} s={[0.19, 0.44, 0.19]} c={look.hood} />
      <group position={[0, -0.44, 0]} rotation={[el, 0, elz]}>
        <Vx p={[0, -0.2, 0]} s={[0.17, 0.4, 0.17]} c={look.hood} />
        <Vx p={[0, -0.42, 0]} s={[0.17, 0.12, 0.15]} c={look.skin} />
      </group>
    </group>);
  };
  const leg = (s: 1 | -1) => {
    if (sit) return (<group key={s}>
      <Vx p={[s * 0.17, 0.66, 0.3]} s={[0.26, 0.22, 0.62]} c={look.pants} />
      <Vx p={[s * 0.17, 0.32, 0.58]} s={[0.23, 0.58, 0.23]} c={look.pants} />
      <Vx p={[s * 0.17, 0.07, 0.68]} s={[0.27, 0.14, 0.38]} c={look.shoe} />
    </group>);
    const ph = walk + (s > 0 ? Math.PI : 0), sw = Math.sin(ph) * 0.7 * amp, bend = Math.max(0, -Math.cos(ph)) * 0.9 * amp;
    return (<group key={s} position={[s * 0.17, base + bob, 0]} rotation={[sw, 0, 0]}>
      <Vx p={[0, -0.25, 0]} s={[0.26, 0.5, 0.26]} c={look.pants} />
      <group position={[0, -0.5, 0]} rotation={[bend, 0, 0]}>
        <Vx p={[0, -0.24, 0]} s={[0.23, 0.48, 0.23]} c={look.pants} />
        <Vx p={[0, -0.46, 0.08]} s={[0.27, 0.14, 0.38]} c={look.shoe} />
      </group>
    </group>);
  };
  const brow = mood === "shock" ? 0.05 : 0, browTilt = mood === "sad" ? 0.22 : -0.12;
  const eye = (s: 1 | -1) => (<group position={[s * 0.14, 0.04, 0.285]}>
    {look.glasses ? <><Vx p={[0, 0, 0]} s={[0.19, 0.16, 0.035]} c={look.frame} shadow={false} /><Vx p={[0, 0, 0.012]} s={[0.145, 0.115, 0.03]} c="#cfe9f2" e="#9ed0e0" ei={0.35} shadow={false} /></> : <Vx p={[0, 0, 0.01]} s={[0.15, 0.13, 0.03]} c="#f4f0e6" shadow={false} />}
    <Vx p={[0, 0, 0.03]} s={[0.05, (mood === "shock" ? 0.1 : 0.075) * blink, 0.02]} c="#14161c" shadow={false} />
    <Vx p={[0, 0.15 + brow, 0.0]} s={[0.17, 0.035, 0.03]} c={look.hair} shadow={false} rot={[0, 0, s * browTilt]} />
  </group>);
  const mouth = mood === "shock" ? <Vx p={[0, -0.14, 0.29]} s={[0.08, 0.12, 0.03]} c="#3a1a18" shadow={false} />
    : mood === "laugh" ? <><Vx p={[0, -0.14, 0.29]} s={[0.2, 0.1, 0.03]} c="#3a1a18" shadow={false} /><Vx p={[0, -0.1, 0.305]} s={[0.17, 0.03, 0.02]} c="#f4f0e6" shadow={false} /></>
    : mood === "smile" ? <><Vx p={[0, -0.14, 0.29]} s={[0.18, 0.03, 0.03]} c="#9c4b3c" shadow={false} /><Vx p={[-0.1, -0.12, 0.29]} s={[0.03, 0.05, 0.03]} c="#9c4b3c" shadow={false} /><Vx p={[0.1, -0.12, 0.29]} s={[0.03, 0.05, 0.03]} c="#9c4b3c" shadow={false} /></>
    : mood === "sad" ? <><Vx p={[0, -0.15, 0.29]} s={[0.12, 0.03, 0.03]} c="#9c4b3c" shadow={false} /><Vx p={[-0.07, -0.17, 0.29]} s={[0.03, 0.05, 0.03]} c="#9c4b3c" shadow={false} /><Vx p={[0.07, -0.17, 0.29]} s={[0.03, 0.05, 0.03]} c="#9c4b3c" shadow={false} /></>
    : <Vx p={[0, -0.14, 0.29]} s={[0.14 + 0.06 * sigh, 0.03, 0.03]} c="#9c4b3c" shadow={false} />;
  return (<group>
    {sit ? <>{/* chair */}
      <Vx p={[0, 0.5, 0]} s={[0.72, 0.08, 0.72]} c={look.chair} /><Vx p={[0, 0.95, -0.38]} s={[0.7, 0.8, 0.08]} c={look.chair} />
      <Vx p={[0, 0.25, 0]} s={[0.1, 0.5, 0.1]} c="#222a30" /><Vx p={[0, 0.03, 0]} s={[0.7, 0.06, 0.1]} c="#222a30" /><Vx p={[0, 0.03, 0]} s={[0.1, 0.06, 0.7]} c="#222a30" /></> : null}
    {leg(-1)}{leg(1)}
    <group position={[0, base + bob, 0]} scale={[1, chest, 1]}>
      <Vx p={[0, 0.4, 0]} s={[0.64, 0.8, 0.42]} c={look.hood} />
      <Vx p={[0, 0.2, 0.215]} s={[0.4, 0.2, 0.02]} c={look.hood2} />
      <Vx p={[-0.07, 0.62, 0.22]} s={[0.04, 0.2, 0.02]} c="#e8e2d0" /><Vx p={[0.07, 0.62, 0.22]} s={[0.04, 0.2, 0.02]} c="#e8e2d0" />
    </group>
    {arm(-1)}{arm(1)}
    <group position={[0, base + bob + 1.08, 0.02]} rotation={[pitch, yaw, roll]}>
      <Vx p={[0, -0.28, -0.02]} s={[0.5, 0.14, 0.4]} c={look.hood2} />
      <Vx p={[0, 0.1, 0]} s={[0.58, 0.58, 0.56]} c={look.skin} />
      <Vx p={[0, 0.43, -0.02]} s={[0.62, 0.2, 0.6]} c={look.hair} /><Vx p={[0, 0.2, -0.3]} s={[0.62, 0.4, 0.1]} c={look.hair} />
      <Vx p={[-0.31, 0.25, -0.02]} s={[0.06, 0.34, 0.5]} c={look.hair} /><Vx p={[0.31, 0.25, -0.02]} s={[0.06, 0.34, 0.5]} c={look.hair} />
      <Vx p={[-0.12, 0.35, 0.3]} s={[0.3, 0.12, 0.08]} c={look.hair} rot={[0, 0, 0.12]} /><Vx p={[0.17, 0.37, 0.3]} s={[0.26, 0.1, 0.08]} c={look.hair} rot={[0, 0, -0.1]} />
      {eye(-1)}{eye(1)}
      <Vx p={[0, 0.04, 0.3]} s={[0.07, 0.03, 0.04]} c={look.frame} shadow={false} /><Vx p={[0, -0.04, 0.3]} s={[0.07, 0.07, 0.06]} c="#e3b088" />
      {mouth}
      <Vx p={[-0.2, -0.08, 0.29]} s={[0.1, 0.06, 0.02]} c="#e79a8a" shadow={false} /><Vx p={[0.2, -0.08, 0.29]} s={[0.1, 0.06, 0.02]} c="#e79a8a" shadow={false} />
    </group>
  </group>);
};
