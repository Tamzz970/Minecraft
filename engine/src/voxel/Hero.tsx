// Voxel hero (3D blocky character at a desk). Forward = +z in local space.
import React from "react";
import { Vx, sm, bump } from "./V";

const SKIN = "#f0c7a0", HOOD = "#2f7f78", HOOD2 = "#3b948c", PANTS = "#2b3a4c", SHOE = "#c4622d", HAIR = "#1c1a22", FRAME = "#15181d";

export const Hero: React.FC<{ t: number }> = ({ t }) => {
  const breathe = Math.sin(t * 1.5) * 0.012;
  const sigh = bump(17.65, 17.95, 18.6, t);                       // [sighs] 17.7-18.2s
  const calm = sm(8.4, 9.6, t);                                   // [calm] ~8.5s: shoulders drop
  const shoulder = -0.035 * calm - 0.05 * sigh;
  const chest = 1 + breathe + 0.05 * sigh;
  // head: [thoughtful] tilts & looks up at the window, later softens toward the screen/cup
  const yaw = 0.6 - 1.1 * bump(3.0, 5.2, 8.2, t) - 0.2 * sm(13, 15, t) - 0.15 * sigh;
  const pitch = -0.12 * bump(0.2, 1.5, 3.2, t) - 0.1 * bump(3, 5.2, 8.2, t) + 0.12 * sm(8.4, 9.6, t) * (1 - sm(12, 13.5, t)) + 0.1 * sm(13.5, 15.5, t) * (1 - sigh) - 0.14 * sigh;
  const roll = 0.08 * bump(0, 1.2, 3.2, t) - 0.05 * sigh;
  const blink = (t * 0.33) % 1 < 0.035 ? 0.1 : 1;
  const arm = (sx: number) => (<group position={[sx * 0.4, 1.22 + shoulder, 0.02]}>
    <Vx p={[0, -0.2, 0]} s={[0.19, 0.44, 0.19]} c={HOOD} />
    <Vx p={[0, -0.4, 0.22]} s={[0.17, 0.17, 0.46]} c={HOOD} />
    <Vx p={[0, -0.4, 0.5]} s={[0.17, 0.12, 0.14]} c={SKIN} />
  </group>);
  const eye = (sx: number) => (<group position={[sx * 0.14, 0.04, 0.285]}>
    <Vx p={[0, 0, 0]} s={[0.19, 0.16, 0.035]} c={FRAME} shadow={false} />
    <Vx p={[0, 0, 0.012]} s={[0.145, 0.115, 0.03]} c="#cfe9f2" e="#9ed0e0" ei={0.35} shadow={false} />
    <Vx p={[0, 0, 0.03]} s={[0.05, 0.075 * blink, 0.02]} c="#14161c" shadow={false} />
    <Vx p={[0, 0.15, 0.0]} s={[0.17, 0.035, 0.03]} c={HAIR} shadow={false} rot={[0, 0, sx * -0.12]} />
  </group>);
  return (<group>
    {/* chair */}
    <Vx p={[0, 0.5, 0]} s={[0.72, 0.08, 0.72]} c="#7a2f22" />
    <Vx p={[0, 0.95, -0.38]} s={[0.7, 0.8, 0.08]} c="#7a2f22" />
    <Vx p={[0, 0.25, 0]} s={[0.1, 0.5, 0.1]} c="#222a30" /><Vx p={[0, 0.03, 0]} s={[0.7, 0.06, 0.1]} c="#222a30" /><Vx p={[0, 0.03, 0]} s={[0.1, 0.06, 0.7]} c="#222a30" />
    {/* legs */}
    {[-1, 1].map((s) => (<group key={s}>
      <Vx p={[s * 0.17, 0.66, 0.3]} s={[0.26, 0.22, 0.62]} c={PANTS} />
      <Vx p={[s * 0.17, 0.32, 0.58]} s={[0.23, 0.58, 0.23]} c={PANTS} />
      <Vx p={[s * 0.17, 0.07, 0.68]} s={[0.27, 0.14, 0.38]} c={SHOE} />
    </group>))}
    {/* torso */}
    <group position={[0, 0.58, 0]} scale={[1, chest, 1]}>
      <Vx p={[0, 0.4, 0]} s={[0.64, 0.8, 0.42]} c={HOOD} />
      <Vx p={[0, 0.2, 0.215]} s={[0.4, 0.2, 0.02]} c={HOOD2} />
      <Vx p={[-0.07, 0.62, 0.22]} s={[0.04, 0.2, 0.02]} c="#e8e2d0" /><Vx p={[0.07, 0.62, 0.22]} s={[0.04, 0.2, 0.02]} c="#e8e2d0" />
    </group>
    {arm(-1)}{arm(1)}
    {/* head */}
    <group position={[0, 1.66, 0.02]} rotation={[pitch, yaw, roll]}>
      <Vx p={[0, -0.28, -0.02]} s={[0.5, 0.14, 0.4]} c={HOOD2} />
      <Vx p={[0, 0.1, 0]} s={[0.58, 0.58, 0.56]} c={SKIN} />
      <Vx p={[0, 0.43, -0.02]} s={[0.62, 0.2, 0.6]} c={HAIR} />
      <Vx p={[0, 0.2, -0.3]} s={[0.62, 0.4, 0.1]} c={HAIR} />
      <Vx p={[-0.31, 0.25, -0.02]} s={[0.06, 0.34, 0.5]} c={HAIR} /><Vx p={[0.31, 0.25, -0.02]} s={[0.06, 0.34, 0.5]} c={HAIR} />
      <Vx p={[-0.12, 0.35, 0.3]} s={[0.3, 0.12, 0.08]} c={HAIR} rot={[0, 0, 0.12]} /><Vx p={[0.17, 0.37, 0.3]} s={[0.26, 0.1, 0.08]} c={HAIR} rot={[0, 0, -0.1]} />
      {eye(-1)}{eye(1)}
      <Vx p={[0, 0.04, 0.3]} s={[0.07, 0.03, 0.04]} c={FRAME} shadow={false} />
      <Vx p={[0, -0.04, 0.3]} s={[0.07, 0.07, 0.06]} c="#e3b088" />
      <Vx p={[0, -0.14, 0.29]} s={[0.14 + 0.06 * sigh, 0.03, 0.03]} c="#9c4b3c" shadow={false} />
      <Vx p={[-0.2, -0.08, 0.29]} s={[0.1, 0.06, 0.02]} c="#e79a8a" shadow={false} /><Vx p={[0.2, -0.08, 0.29]} s={[0.1, 0.06, 0.02]} c="#e79a8a" shadow={false} />
    </group>
  </group>);
};
