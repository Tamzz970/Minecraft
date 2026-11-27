// Underwater voxel diorama ("Three Hearts"): seafloor, reef with a crack, kelp, light shafts, bubbles, octopus, big fish and a heart inset.
// Everything is a pure function of t -> frames render identically on any machine.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Vx, Glow, rng, sm, bump, clamp, V3 } from "./V";
import { camAt, CamKey } from "./cam";

// timeline taken from the real voiceover (engine/public/octopus/phrases.json)
export const TL = {
  charge: 0.0, alarm: 2.92, squirt: 4.61, jet: 6.83, inside: 9.88, stop: 14.65,
  bigHeart: 16.53, swimQuiet: 20.26, twoHearts: 23.72, blue: 28.8, tired: 33.11,
  crack: 38.34, fishLeave: 41.06, restart: 44.04, noSwim: 47.6, crawl: 50.19, end: 54.2,
};
const at = (keys: CamKey[], t: number): V3 => camAt(keys, t, (k) => k.p);

export const SeaLights: React.FC = () => (<>
  <color attach="background" args={["#0a2731"]} /><fog attach="fog" args={["#0a2731", 15, 58]} />
  <ambientLight color="#3d7d8f" intensity={0.85} /><hemisphereLight args={["#6fc2d6", "#0d2b26", 0.55]} />
  <directionalLight position={[4, 12, 3]} color="#a8e6ff" intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-camera-near={1} shadow-camera-far={40} shadow-bias={-0.0006} />
  <pointLight position={[2.4, 2.0, 1.4]} color="#ffc98a" intensity={7} distance={8} />
  <pointLight position={[-2.8, 1.5, 1.0]} color="#5fd0e0" intensity={4} distance={9} />
</>);

export const Sand: React.FC = () => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cells = useMemo(() => { const r = rng(11); const o: { p: V3; s: V3 }[] = [];
    for (let x = -11; x <= 11; x++) for (let z = -6; z <= 6; z++) { const h = 0.14 + 0.09 * Math.sin(x * 0.55 + z * 0.35) + 0.05 * r(); o.push({ p: [x, h / 2 - 0.14, z], s: [1, h, 1] }); }
    return o; }, []);
  useLayoutEffect(() => { if (!ref.current) return; const d = new THREE.Object3D();
    cells.forEach((c, i) => { d.position.set(...c.p); d.scale.set(...c.s); d.updateMatrix(); ref.current!.setMatrixAt(i, d.matrix); });
    ref.current.instanceMatrix.needsUpdate = true; }, [cells]);
  return <instancedMesh ref={ref} args={[undefined, undefined, cells.length]} receiveShadow frustumCulled={false}><boxGeometry /><meshStandardMaterial color="#bfa576" roughness={1} /></instancedMesh>;
};

// dark reef mass with a slot the octopus can hide in (slot opening faces +z)
export const Reef: React.FC = () => (<group>
  <Vx p={[3.3, 0.55, -0.35]} s={[2.4, 1.3, 1.7]} c="#2e5561" rot={[0, 0.18, 0]} />
  <Vx p={[3.15, 1.5, -0.25]} s={[1.7, 0.8, 1.35]} c="#37626d" />
  <Vx p={[3.75, 2.05, -0.15]} s={[0.8, 0.55, 0.9]} c="#3f6d78" />
  <Vx p={[2.2, 0.35, -0.1]} s={[0.9, 0.75, 1.2]} c="#2a4d59" />
  <Vx p={[4.6, 0.45, 0.6]} s={[1.1, 1.0, 1.0]} c="#25454f" />
  <Vx p={[2.6, 0.55, 0.42]} s={[0.62, 1.1, 0.5]} c="#132a31" />
  <Vx p={[2.6, 1.22, 0.52]} s={[0.95, 0.3, 0.7]} c="#2b4c57" />
  <Vx p={[2.05, 0.42, 0.6]} s={[0.42, 0.95, 0.62]} c="#234550" />
  <Vx p={[3.25, 0.42, 0.6]} s={[0.5, 0.95, 0.62]} c="#234550" />
</group>);

export const Rocks: React.FC = () => {
  const r = useMemo(() => { const g = rng(7); return Array.from({ length: 14 }, () => { const a = g() * Math.PI * 2, d = 3.4 + g() * 5; const s = 0.35 + g() * 0.8; return { p: [Math.cos(a) * d, s * 0.35, Math.sin(a) * d * 0.55 - 1.2] as V3, s, c: ["#24454f", "#2b4f5a", "#1e3d46"][Math.floor(g() * 3)] }; }); }, []);
  return <group>{r.map((o, i) => <Vx key={i} p={o.p} s={[o.s, o.s * 0.8, o.s]} c={o.c} rot={[0, i * 0.7, 0]} />)}</group>;
};

export const Kelp: React.FC<{ t: number; p: V3; h?: number }> = ({ t, p, h = 7 }) => (<group position={p}>
  {Array.from({ length: h }, (_, i) => { const sway = Math.sin(t * 0.85 + i * 0.42 + p[0]) * 0.028 * i; return <Vx key={i} p={[sway, 0.22 + i * 0.46, 0]} s={[0.2, 0.5, 0.2]} c={i % 2 ? "#2f7a5a" : "#27704f"} rot={[0, i * 0.2, sway * 2]} />; })}
</group>);

export const Bubbles: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null), N = 110;
  const d = useMemo(() => { const r = rng(21); return Array.from({ length: N }, (_, i) => ({ x: -1.5 + r() * 7.5, z: -1.5 + r() * 3.5, o: r(), sp: 0.35 + r() * 0.5, s: 0.035 + r() * 0.05, H: 4.5 + r() * 3 })); }, []);
  useLayoutEffect(() => { if (!ref.current) return; const o = new THREE.Object3D();
    d.forEach((q, i) => { const k = (t * q.sp + q.o * q.H * 2) % q.H; o.position.set(q.x + Math.sin(t * 2 + q.o * 9) * 0.12, k, q.z); o.scale.setScalar(q.s * (1 + 0.4 * Math.sin(t * 3 + i))); o.updateMatrix(); ref.current!.setMatrixAt(i, o.matrix); });
    ref.current.instanceMatrix.needsUpdate = true; });
  return <instancedMesh ref={ref} args={[undefined, undefined, N]} frustumCulled={false}><boxGeometry /><meshStandardMaterial color="#cfeeff" emissive="#8fd8f0" emissiveIntensity={0.55} transparent opacity={0.6} roughness={0.15} /></instancedMesh>;
};

export const Shafts: React.FC<{ t: number }> = ({ t }) => (<group>{[-3.6, -1.4, 0.8, 3.0, 5.0].map((x, i) => { const o = 0.05 + 0.03 * Math.sin(t * 0.6 + i); return <mesh key={i} position={[x + Math.sin(t * 0.25 + i) * 0.25, 4.2, -1.6 + i * 0.5]} rotation={[0.12, 0.05 * i, 0.16]}><boxGeometry args={[0.75, 9, 0.75]} /><meshBasicMaterial color="#8fe3f5" transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></mesh>; })}</group>);

// octopus path: settle -> alarm -> jet up -> drift -> dive into the crack -> crawl out along the floor
const OCTO_KEYS: CamKey[] = ([
  { t: 0, p: [0, 0.5, 0] }, { t: 3.6, p: [0.02, 0.52, 0] }, { t: 4.6, p: [0.06, 0.54, 0] }, { t: 6.2, p: [0.1, 0.56, 0] },
  { t: 7.4, p: [0.6, 1.55, 0.15] }, { t: 9.6, p: [0.8, 1.42, 0.08] }, { t: 14, p: [0.92, 1.2, 0] }, { t: 22, p: [1.0, 1.1, 0] },
  { t: 32, p: [1.2, 0.98, 0.05] }, { t: 38.3, p: [1.55, 0.86, 0.08] }, { t: 40.6, p: [2.55, 0.62, 0.18] },
  { t: 47.5, p: [2.56, 0.6, 0.18] }, { t: 50.3, p: [2.15, 0.44, 0.3] }, { t: 54.2, p: [1.0, 0.42, 0.45] },
] as { t: number; p: V3 }[]).map((k) => ({ ...k, l: [0, 0, 0] as V3 }));
const octoPos = (t: number) => at(OCTO_KEYS, t);

export const Octopus: React.FC<{ t: number; flip?: number }> = ({ t }) => {
  const p = octoPos(t);
  const swim = bump(6.2, 7.6, 12.0, t) + 0.25 * bump(16, 24, 34, t);
  const crawl = sm(TL.noSwim, TL.crawl + 1.5, t);
  const squirt = bump(4.5, 5.0, 6.4, t);
  const hide = sm(TL.crack, TL.crack + 1.6, t) * (1 - sm(47.5, 48.6, t));
  const scale = 1 - 0.22 * hide;
  const yaw = 0.35 * sm(TL.crack, TL.crack + 2, t) - 0.9 * crawl;
  const C = { body: "#d3613f", bodyL: "#e07a55", bodyD: "#b34f33", arm: "#c8563a" };
  return (<group position={p} scale={scale} rotation={[0, yaw, 0]}>
    <group position={[0, -0.1, 0]}>
      <Vx p={[0, 0.28, 0]} s={[0.62, 0.32, 0.5]} c={C.bodyD} />
      <Vx p={[0, 0.58, 0]} s={[0.74, 0.36, 0.58]} c={C.body} />
      <Vx p={[0, 0.84, 0]} s={[0.56, 0.26, 0.44]} c={C.bodyL} />
      <Vx p={[0, 1.02, 0]} s={[0.32, 0.16, 0.28]} c={C.bodyL} />
      <Vx p={[0.22, 0.66, 0.29]} s={[0.17, 0.17, 0.06]} c="#f4f7f2" />
      <Vx p={[-0.22, 0.66, 0.29]} s={[0.17, 0.17, 0.06]} c="#f4f7f2" />
      <Vx p={[0.22, 0.66, 0.33]} s={[0.09, 0.09, 0.04]} c="#14202a" />
      <Vx p={[-0.22, 0.66, 0.33]} s={[0.09, 0.09, 0.04]} c="#14202a" />
      <Vx p={[0, 0.5, 0.3]} s={[0.1, 0.05, 0.04]} c="#8f3a26" />
      {/* 8 arms, four segments each; swim waves travel down the arm, crawl lifts alternating arms */}
      {Array.from({ length: 8 }, (_, a) => { const ang = (a / 8) * Math.PI * 2 + 0.35;
        return <group key={a} rotation={[0, ang, 0]}>
          {Array.from({ length: 4 }, (_, s) => {
            const lift = crawl * (0.1 + 0.06 * s) * Math.sin(t * (2.2 + 2 * crawl) + a * 0.9 + s * 0.5)
              + Math.sin(t * (2.6 + 3.2 * swim) + s * 1.1 + a * 0.8) * (0.04 + 0.1 * swim) * (s + 1) * 0.5;
            const r = 0.16 + s * 0.2;
            return <Vx key={s} p={[r, 0.14 - s * 0.03 + lift, 0]} s={[0.21, 0.13 - s * 0.012, 0.13 - s * 0.012]} c={s % 2 ? C.arm : C.bodyD} rot={[0, 0, -0.15 * s + lift]} />;
          })}
        </group>; })}
    </group>
    {squirt > 0.02 ? <Squirt t={t} amp={squirt} /> : null}
  </group>);
};

const Squirt: React.FC<{ t: number; amp: number }> = ({ t, amp }) => (<group>{Array.from({ length: 10 }, (_, i) => {
  const k = ((t - TL.squirt) * 1.5 + i / 10) % 1; const d = Math.sin((i / 10) * Math.PI);
  return <Vx key={i} p={[0.25 + k * 0.9, 0.25 + Math.sin(k * Math.PI) * 0.12 - k * 0.06 * d, (i / 10 - 0.5) * 0.9 * k]} s={[0.09, 0.09, 0.09]} c="#dff4fb" e="#bfeaf7" ei={0.6} o={amp * (1 - k)} shadow={false} />; })}</group>);

const HEART: [number, number][] = [[-0.5, 0.35], [0.5, 0.35], [-0.5, 0], [0.5, 0], [0, 0], [0, -0.4]];
const Heart: React.FC<{ p: V3; s: number; beat: number; red: number }> = ({ p, s, beat, red }) => {
  const c = red > 0.5 ? "#e0453a" : "#2f6fd0", e = red > 0.5 ? "#ff6a4d" : "#4f97ff";
  return (<group position={p} scale={s * (1 + 0.16 * beat)}>
    <Glow p={[0, 0, 0]} s={2.2} c={c} o={0.35 + 0.3 * beat} />
    {HEART.map(([x, y], i) => <Vx key={i} p={[x * 0.34, y * 0.34, 0]} s={[0.3, 0.3, 0.3]} c={c} e={e} ei={0.5 + 1.5 * beat} shadow={false} />)}
  </group>);
};

// three hearts shown as a floating inset in front of the octopus while the voice talks about them
export const Hearts: React.FC<{ t: number }> = ({ t }) => {
  const show = sm(TL.inside, TL.inside + 0.8, t) * (1 - sm(TL.crack - 0.6, TL.crack + 0.6, t));
  if (show < 0.02) return null;
  const p = octoPos(t), base: V3 = [p[0] + 0.15, p[1] + 0.95, p[2] + 0.62];
  const stopped = sm(TL.stop - 0.15, TL.stop + 0.25, t) * (1 - sm(TL.restart, TL.restart + 1.1, t));
  const beat = (h: number) => Math.max(0, Math.sin(t * Math.PI * 2 * 1.6 + h)) ** 3;
  const fast = 0.6 + 0.4 * (1 - sm(TL.swimQuiet, TL.swimQuiet + 1.2, t));
  const blue = sm(TL.blue, TL.blue + 1.2, t);
  const bigBeat = beat(0) * (1 - stopped);
  return (<group position={base} scale={show}>
    <Heart p={[-0.42, 0.3, 0]} s={0.42} beat={beat(1) * fast} red={1 - blue} />
    <Heart p={[0.42, 0.3, 0]} s={0.42} beat={beat(2) * fast} red={1 - blue} />
    <Heart p={[0, -0.28, 0.1]} s={0.6} beat={bigBeat} red={1 - blue} />
  </group>);
};

const FISH_KEYS: CamKey[] = ([
  { t: 0, p: [9.5, 2.1, -2.6] }, { t: 2.4, p: [2.6, 1.25, 0.15] }, { t: 3.4, p: [3.7, 1.55, -0.7] },
  { t: 4.8, p: [6.0, 2.0, -1.9] }, { t: 12, p: [8.5, 2.2, -3.2] }, { t: 30, p: [6.0, 2.3, -3.6] },
  { t: 39.0, p: [5.8, 2.2, -3.0] }, { t: 41.4, p: [3.4, 1.9, -1.4] }, { t: 43.0, p: [2.5, 1.7, -2.5] },
  { t: 44.6, p: [4.6, 2.0, -3.2] }, { t: 47.0, p: [8.0, 2.3, -4.0] }, { t: 54.2, p: [13, 2.6, -5.2] },
] as { t: number; p: V3 }[]).map((k) => ({ ...k, l: [0, 0, 0] as V3 }));

export const BigFish: React.FC<{ t: number }> = ({ t }) => {
  const p = at(FISH_KEYS, t), q = at(FISH_KEYS, Math.min(t + 0.1, TL.end));
  const dx = q[0] - p[0], dz = q[2] - p[2];
  const yaw = Math.abs(dx) + Math.abs(dz) > 1e-5 ? Math.atan2(-dz, dx) : 0;
  const wag = Math.sin(t * 5.5) * 0.3;
  return (<group position={p} rotation={[0, yaw, 0]}>
    <Vx p={[0, 0, 0]} s={[1.55, 0.78, 0.64]} c="#3f5f7d" />
    <Vx p={[0.86, 0.04, 0]} s={[0.42, 0.5, 0.44]} c="#4a6d8c" />
    <Vx p={[-0.86, 0, 0]} s={[0.34, 0.56, 0.5]} c="#36536e" />
    <group position={[-1.02, 0, 0]} rotation={[0, wag, 0]}><Vx p={[-0.3, 0, 0]} s={[0.62, 0.72, 0.12]} c="#35526b" /></group>
    <Vx p={[0.05, 0.45, 0]} s={[0.6, 0.34, 0.1]} c="#3d5f7e" />
    <Vx p={[-0.05, -0.42, 0]} s={[0.5, 0.26, 0.1]} c="#3d5f7e" />
    <Vx p={[0.66, 0.26, 0.33]} s={[0.16, 0.16, 0.08]} c="#f2f7fa" />
    <Vx p={[0.71, 0.26, 0.36]} s={[0.09, 0.09, 0.05]} c="#101d26" />
    <Vx p={[0.66, 0.26, -0.33]} s={[0.16, 0.16, 0.08]} c="#f2f7fa" />
    <Vx p={[0.71, 0.26, -0.36]} s={[0.09, 0.09, 0.05]} c="#101d26" />
    <Vx p={[0.92, -0.02, 0]} s={[0.1, 0.14, 0.2]} c="#20303c" />
  </group>);
};

export const SeaWorld: React.FC<{ t: number }> = ({ t }) => (<group>
  <SeaLights />
  <Sand /><Rocks /><Reef />
  <Kelp t={t} p={[-2.4, -0.05, -0.6]} h={8} /><Kelp t={t} p={[-3.0, -0.05, 0.6]} h={6} />
  <Kelp t={t} p={[-1.7, -0.05, -2.0]} h={5} /><Kelp t={t} p={[-4.2, -0.05, -1.4]} h={7} />
  <Bubbles t={t} /><Shafts t={t} />
  <BigFish t={t} /><Octopus t={t} /><Hearts t={t} />
</group>);
void sm; void clamp;
