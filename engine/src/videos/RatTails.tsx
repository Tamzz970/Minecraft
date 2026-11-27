// "Ekor Tikus Hanoi" — 10 scenes, 9:16 720x1280 30fps. Timings come from public/words.json (voice-aligned).
// S1 Dupont proud in front of city hall | S2 rat-infested street + announcement stamp | S3 office: imagined pile -> "tails only" idea
// S4 whip to the queue, Minh drops the bag | S5 counter: coin + bell | S6 sewer: snip + release | S7 riverbank dusk: rat family thought
// S8 backyard farm, names above rat heads (text only) | S9 clerk whispers, record-scratch freeze | S10 payroll punchline.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Box, Cyl, Ball, CanvasPlane, INK } from "../style/toon";
import { Look } from "../style/puppet";
import { Person, Lights, Sign, Clock, Desk, seg, lerp, clamp, V3 } from "../style/kit";
import { Floor, WallDoor, SideWall, Glow, Shaft, Plant, Shelf, Frame, WindowCity, Lamp, Chair, Cabinet, Rug, Dust } from "../style/props";
import { Cam, Key, camAt, FaceGroup, hand, Building, StreetLamp, Hydrant, Bench, Bin, Barrier, Lectern, Mug } from "../style/extra";
import { Captions } from "../Main";

const FPS = 30, LEAD = 6, TAIL = 8, WALK = 3.4;
type Ctx = { t: number; f: number };
type Trans = "ghost" | "zoom" | "flash" | "whip";

const dupont: Look = { skin: "#f7d4b5", body: "#2b3a67", outfit: "suit", tie: "#e5233a", hair: "swept", hairColor: "#3b2a1a", hat: "#e9e2c4", shoe: "#1b1b2a" };
const minh: Look = { skin: "#e5bd92", body: "#2fa56a", outfit: "shirt", hair: "short", hairColor: "#15131a", hat: "#e7c15a", shoe: "#3a2a1a" };
const clerk: Look = { skin: "#d9ac80", body: "#8a5ad8", outfit: "blazer", shirt: "#ffffff", hair: "bob", hairColor: "#1a1010", glasses: true, badge: "#ffc23a", shoe: "#2a1a12" };
const folks: Look[] = [
  { skin: "#e0b48c", body: "#e53e3e", outfit: "hoodie", hair: "short", hairColor: "#1a1010" }, { skin: "#c98e62", body: "#f0b429", outfit: "shirt", hair: "bob", hairColor: "#1a1010" },
  { skin: "#e5bd92", body: "#2f8cff", outfit: "shirt", hair: "short", hairColor: "#222", hat: "#d9a441" }, { skin: "#d9ac80", body: "#ff7a29", outfit: "hoodie", hair: "bob", hairColor: "#111" },
  { skin: "#c98e62", body: "#22a867", outfit: "shirt", hair: "short", hairColor: "#111", hat: "#e7c15a" }, { skin: "#e0b48c", body: "#7c4dff", outfit: "blazer", shirt: "#fff", hair: "short", hairColor: "#222" },
];

/* ---------- scene wrapper ---------- */
const Scene: React.FC<{ start: number; end: number; first?: boolean; trans?: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ start, end, first, trans = "ghost", bg, children }) => {
  const from = Math.round(start * FPS) - (first ? 0 : LEAD), dur = Math.round(end * FPS) - from + TAIL;
  return <Sequence from={from} durationInFrames={dur} layout="none"><Inner from={from} first={first} trans={trans} bg={bg} children={children} /></Sequence>;
};
const Inner: React.FC<{ from: number; first?: boolean; trans: Trans; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ from, first, trans, bg, children }) => {
  const f = useCurrentFrame(), t = (f + from) / FPS;
  const k = first ? 1 : clamp(f / (LEAD + 2)), ke = Easing.out(Easing.cubic)(k);
  const sc = !first && trans === "zoom" ? lerp(1.35, 1, ke) : 1;
  const tx = !first && trans === "whip" ? (1 - ke) * 720 : 0, blur = !first && trans === "whip" ? (1 - ke) * 14 : 0;
  return (
    <AbsoluteFill style={{ opacity: first || trans === "flash" || trans === "whip" ? 1 : k, transform: `translateX(${tx}px) scale(${sc})`, background: bg, filter: `saturate(1.32) contrast(1.07) brightness(1.02)${blur > 0.2 ? ` blur(${blur.toFixed(1)}px)` : ""}` }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 60, position: [0, 2, 8], near: 0.1, far: 200 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
    </AbsoluteFill>
  );
};

/* ---------- new reusable props (logged in ACTION-LIBRARY) ---------- */
// Rat: toon rat. tail 0 = tailless. run = scurry bob. yaw: 0 faces +x, PI faces -x.
const Rat: React.FC<{ p: V3; yaw?: number; s?: number; tail?: number; t?: number; run?: number; col?: string; sit?: number }> = ({ p, yaw = 0, s = 1, tail = 1, t = 0, run = 0, col = "#8f93a8", sit = 0 }) => {
  const bob = run ? Math.abs(Math.sin(t * 20 + p[0])) * 0.06 * s : Math.sin(t * 3 + p[0] * 2) * 0.008 * s;
  return (
    <group position={[p[0], p[1] + bob, p[2]]} rotation={[0, yaw, 0]}>
      <group rotation={[0, 0, sit * 0.55]} position={[0, sit * 0.12 * s, 0]}>
        <Ball p={[0, 0.2 * s, 0]} r={0.2 * s} color={col} s={[1.5, 0.95, 0.95]} ink={0.035} />
        <Ball p={[0.33 * s, 0.24 * s, 0]} r={0.13 * s} color={col} s={[1.25, 1, 1]} ink={0.03} />
        <Ball p={[0.52 * s, 0.22 * s, 0]} r={0.035 * s} color="#ff8fa3" ink={0.02} />
        {[-1, 1].map((z) => <React.Fragment key={z}>
          <Ball p={[0.27 * s, 0.38 * s, z * 0.1 * s]} r={0.075 * s} color="#ffb3c1" ink={0.025} />
          <Ball p={[0.42 * s, 0.29 * s, z * 0.065 * s]} r={0.028 * s} color="#0b0d1a" ink={0.0} />
          <Ball p={[0.18 * s, 0.03 * s, z * 0.12 * s]} r={0.045 * s} color="#ffb3c1" ink={0.02} />
        </React.Fragment>)}
        {tail > 0 ? [0, 1, 2, 3, 4].map((i) => <Cyl key={i} p={[-(0.3 + 0.1 * i) * s, (0.17 + 0.015 * i + Math.sin(t * 5 + i) * 0.01) * s, Math.sin(i * 0.9) * 0.03 * s]} rt={0.016 * s} h={0.13 * s * tail} color="#ff9fb0" line={2} rot={[0, 0, Math.PI / 2]} />) : <Ball p={[-0.3 * s, 0.17 * s, 0]} r={0.03 * s} color="#ff9fb0" ink={0.02} />}
      </group>
    </group>
  );
};
// loose tail piece
const TailPiece: React.FC<{ p: V3; rot?: V3; s?: number }> = ({ p, rot = [0, 0, 0], s = 1 }) => <group position={p} rotation={rot}><Cyl p={[0, 0, 0]} rt={0.02 * s} h={0.5 * s} color="#ff9fb0" line={2} rot={[0, 0, Math.PI / 2]} /></group>;
// name tag floating above a head (faces camera). k = pop 0..1 (text only)
const NameTag: React.FC<{ p: V3; text: string; k: number }> = ({ p, text, k }) => k < 0.02 ? null : (
  <group position={p} scale={[k, k, 1]}>
    <CanvasPlane p={[0, 0, 0]} s={[1.5, 0.5]} px={[300, 100]} face draw={(c, W, H) => {
      c.clearRect(0, 0, W, H); c.fillStyle = "#fff8d6"; c.strokeStyle = INK; c.lineWidth = 8;
      c.beginPath(); c.roundRect(6, 6, W - 12, H - 30, 26); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(W / 2 - 16, H - 25); c.lineTo(W / 2, H - 4); c.lineTo(W / 2 + 16, H - 25); c.closePath(); c.fillStyle = "#fff8d6"; c.fill(); c.stroke();
      c.fillStyle = INK; c.font = "900 46px Inter, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, W / 2, (H - 24) / 2 + 2);
    }} />
  </group>
);
// thought cloud (faces camera), draw(c,W,H) paints the content
const Cloud: React.FC<{ p: V3; s: [number, number]; k: number; draw: (c: CanvasRenderingContext2D, W: number, H: number) => void }> = ({ p, s, k, draw }) => k < 0.02 ? null : (
  <group position={p} scale={[k, k, 1]}>
    <CanvasPlane p={[0, 0, 0]} s={s} px={[Math.round(s[0] * 180), Math.round(s[1] * 180)]} face draw={(c, W, H) => {
      c.clearRect(0, 0, W, H); c.fillStyle = "#ffffff"; c.strokeStyle = INK; c.lineWidth = 8;
      const blobs: [number, number, number][] = [[0.22, 0.4, 0.2], [0.42, 0.25, 0.22], [0.64, 0.25, 0.22], [0.8, 0.42, 0.19], [0.7, 0.62, 0.2], [0.42, 0.66, 0.22], [0.22, 0.6, 0.17]];
      for (const pass of [0, 1]) for (const [x, y, r] of blobs) { c.beginPath(); c.ellipse(W * x, H * y * 0.9, W * r, H * r * 1.05, 0, 0, 7); if (pass === 0) c.stroke(); else c.fill(); }
      c.beginPath(); c.arc(W * 0.3, H * 0.93, 14, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(W * 0.24, H * 0.99, 8, 0, 7); c.fill(); c.stroke();
      draw(c, W, H);
    }} />
  </group>
);
const drawRatHead = (c: CanvasRenderingContext2D, x: number, y: number, r: number, tailless = false, dead = false) => {
  c.fillStyle = "#9a9eb3"; c.strokeStyle = INK; c.lineWidth = r * 0.12;
  for (const dx of [-1, 1]) { c.beginPath(); c.arc(x + dx * r * 0.7, y - r * 0.7, r * 0.42, 0, 7); c.fillStyle = "#ffb3c1"; c.fill(); c.stroke(); }
  c.beginPath(); c.ellipse(x, y, r, r * 0.85, 0, 0, 7); c.fillStyle = "#9a9eb3"; c.fill(); c.stroke();
  c.fillStyle = INK; c.font = `900 ${r * 0.6}px Arial`; c.textAlign = "center"; c.textBaseline = "middle";
  if (dead) { c.fillText("x", x - r * 0.35, y - r * 0.1); c.fillText("x", x + r * 0.35, y - r * 0.1); } else { c.beginPath(); c.arc(x - r * 0.32, y - r * 0.1, r * 0.12, 0, 7); c.arc(x + r * 0.32, y - r * 0.1, r * 0.12, 0, 7); c.fill(); }
  c.fillStyle = "#ff8fa3"; c.beginPath(); c.arc(x, y + r * 0.28, r * 0.13, 0, 7); c.fill();
  if (!tailless) { c.strokeStyle = "#ff9fb0"; c.lineWidth = r * 0.12; c.beginPath(); c.moveTo(x + r * 0.9, y + r * 0.5); c.quadraticCurveTo(x + r * 1.7, y + r * 0.9, x + r * 1.5, y + r * 0.2); c.stroke(); }
};
const Coin: React.FC<{ p: V3; rot?: V3 }> = ({ p, rot = [Math.PI / 2, 0, 0] }) => <Cyl p={p} rt={0.11} h={0.035} color="#ffc928" line={2} rot={rot} />;
const toWorld = (p: V3, loc: V3, cam: V3): V3 => { const y = Math.atan2(cam[0] - p[0], cam[2] - p[2]); return [p[0] + loc[0] * Math.cos(y) + loc[2] * Math.sin(y), p[1] + loc[1], p[2] - loc[0] * Math.sin(y) + loc[2] * Math.cos(y)]; };
const ease = Easing.inOut(Easing.cubic);

/* ---------- reusable sets ---------- */
const Street: React.FC<{ t: number; dusk?: boolean; hallSign?: string }> = ({ t, hallSign }) => (<>
  <Floor kind="tile" a="#d8c08e" b="#c9b07a" unit={2} w={44} d={44} />
  <Box p={[0, 0.02, 7.5]} s={[44, 0.04, 5]} color="#555a70" line={2} />{[-12, -6, 0, 6, 12].map((x) => <Box key={x} p={[x, 0.05, 7.5]} s={[2, 0.02, 0.18]} color="#f1e6b8" line={1} />)}
  <Box p={[0, 0.12, 5.0]} s={[44, 0.24, 0.3]} color="#b8a87a" line={2} />
  {[[-13, 6.5, "#f2c14e"], [-7.6, 8.4, "#e8955a"], [-2.2, 7.2, "#5aa9a3"], [3.6, 9, "#f0dfa6"], [9.4, 7.6, "#d9694a"], [15, 8.4, "#6c8bd9"]].map(([x, h, c], i) => <React.Fragment key={i}>
    <Building p={[x as number, 0, -9]} s={[5.2, h as number, 2.2]} color={c as string} seed={i + 2} lit={0.45} trim="#6a3b2a" />
    <Box p={[x as number, 3.0, -7.7]} s={[4.4, 0.18, 0.9]} color={i % 2 ? "#e5233a" : "#1f8a6a"} line={2} />
  </React.Fragment>)}
  <WindowCity p={[-30, 5, -12]} s={[6, 6]} />
  <StreetLamp p={[-10.5, 0, 4.4]} h={5} on={0.6} /><StreetLamp p={[13.5, 0, 4.4]} h={5} on={0.6} flip />
  <Hydrant p={[-7.4, 0, 4.2]} /><Bin p={[8.6, 0, 4.2]} /><Bench p={[-11.2, 0, 4.0]} /><Plant p={[-13.5, 0, 4.1]} s={1.4} />
  <Barrier p={[13.5, 0, 4.0]} w={2.6} />
  <Sign p={[12.2, 2.6, -5.2]} s={[2.4, 0.9]} text="HANOI 1902" bg="#1d4f9a" fg="#fff" size={78} />
  <Glow p={[6, 9, -9]} r={7} color="rgba(255,220,150,0.9)" o={0.3} /><Dust t={t} area={[10, 5, 4]} color="rgba(255,240,200,.8)" />
  {hallSign ? <Sign p={[0, 6.6, -7.4]} s={[5.2, 1]} text={hallSign} bg="#f6efd2" fg="#1f2a55" size={64} /> : null}
</>);
const OfficeSet: React.FC<{ t: number; night?: boolean; door?: boolean }> = ({ t, night, door }) => (<>
  <Floor kind="plank" a="#9a5a30" b="#8a4e28" unit={2} w={30} d={30} />
  <WallDoor z={-7} W={30} kind="plain" a={night ? "#2c3a6a" : "#f3e3b0"} b={night ? "#2c3a6a" : "#f3e3b0"} base={night ? "#161b38" : "#9a6a3a"} door={door ? { x: 1.5, w: 3.4, h: 4.4 } : undefined} />
  <SideWall x={-10} kind="plain" a={night ? "#26335e" : "#e9d49a"} b={night ? "#26335e" : "#e9d49a"} /><SideWall x={10} kind="plain" a={night ? "#26335e" : "#e9d49a"} b={night ? "#26335e" : "#e9d49a"} />
  <WindowCity p={[5.6, 4.4, -6.9]} s={[3.2, 3.6]} dusk={night} />
  {[0, 1, 2].map((i) => <Box key={i} p={[-5.6 + i * 0.5, 5.6, -6.88]} s={[0.5, 1.3, 0.06]} color={["#2447a8", "#f4f4f4", "#d62839"][i]} line={2} />)}
  <Frame p={[-3.4, 4.6, -6.9]} s={[1.4, 1.8]} art={1} /><Clock p={[0, 6.6, -6.85]} r={0.6} t={t} />
  <Shelf p={[-7.8, 0, -6.4]} w={2.6} rows={4} seed={5} wood="#6a3f22" /><Cabinet p={[8.2, 0, -6.4]} color="#8a6a4a" /><Plant p={[-9, 0, -4]} s={1.4} /><Plant p={[9, 0, -3]} s={1.2} />
  <Rug p={[0, 0, 0.5]} s={[8, 4.6]} a="#7a1f2e" b="#e0b250" /><Lamp p={[-6.6, 0, -4.8]} h={3} color="#ffe9a8" />
  <Shaft p={[4.2, 4.5, -2]} s={[2.4, 8]} rot={[0, 0, 0.4]} color="255,236,170" o={0.14} /><Dust t={t} area={[7, 5, 3]} />
</>);
const Sewer: React.FC<{ t: number }> = ({ t }) => (<>
  <Floor kind="tile" a="#1d4a45" b="#183f3b" unit={1.6} w={30} d={30} />
  <WallDoor z={-7} W={30} kind="brick" a="#2f6b62" b="#27594f" base="#143530" />
  <SideWall x={-9} kind="brick" a="#2f6b62" b="#27594f" /><SideWall x={9} kind="brick" a="#2f6b62" b="#27594f" />
  <Box p={[0, 0.06, -3.5]} s={[30, 0.12, 2.2]} color="#2a7fb0" line={2} />{[-8, -4, 0, 4, 8].map((x, i) => <Box key={x} p={[x + Math.sin(t * 1.5 + i) * 0.3, 0.14, -3.5]} s={[1.2, 0.02, 0.1]} color="#8fd3f4" line={1} />)}
  {[-1.2, 2.6, 5].map((y, i) => <Cyl key={i} p={[0, y + 4, -6.5]} rt={0.28} h={26} color={["#8b6a4a", "#6a7f8c", "#a06a3a"][i]} rot={[0, 0, Math.PI / 2]} line={3} />)}
  {[-6, 5].map((x) => <Box key={x} p={[x, 3.8, -6.8]} s={[2, 1.3, 0.1]} color="#10201e" line={3} />)}
  <Lamp p={[-5.2, 0, -5.4]} h={3} color="#ffd36a" /><Glow p={[-5.2, 3.1, -5.2]} r={3} color="rgba(255,200,90,0.9)" o={0.35} />
  {[0, 1, 2].map((i) => { const d = (t * 1.1 + i * 0.37) % 1; return <Ball key={i} p={[-2 + i * 2.6, 6.2 - d * 6, -6.4]} r={0.07} color="#8fd3f4" ink={0.02} />; })}
  <Box p={[3.8, 0.5, -5.4]} s={[1.4, 1, 1]} color="#5a4a3a" /><Cyl p={[-8, 0.6, -5.2]} rt={0.5} h={1.2} color="#6a5a4a" /><Shaft p={[1.5, 5, -3]} s={[1.6, 8]} rot={[0, 0, 0.25]} color="170,230,220" o={0.12} /><Dust t={t} area={[6, 4, 3]} color="rgba(170,230,220,.8)" />
</>);

/* ================= S1 0 – 4.25 "Pak Dupont, pejabat Prancis di Hanoi, sangat bangga dengan idenya." ================= */
const K1: Key[] = [{ t: 0, pos: [1.2, 1.5, 9.6], look: [0, 1.4, 0], fov: 58 }, { t: 2.0, pos: [0.6, 1.7, 8.2], look: [0, 1.7, 0], fov: 56 }, { t: 4.4, pos: [0.2, 1.9, 7.2], look: [0, 1.9, 0], fov: 54 }];
const S1 = ({ t, f }: Ctx) => {
  const flag = (i: number) => Math.sin(t * 4 + i) * 0.08;
  return (<>
    <Cam t={t} keys={K1} />
    <Lights warm="#fff0cc" />
    <Street t={t} hallSign="HÔTEL DE VILLE · HANOI" />
    <Cyl p={[3.4, 3.2, -1.2]} rt={0.06} h={6.4} color="#cfd3df" line={2} />
    {[0, 1, 2].map((i) => <Box key={i} p={[3.4 + 0.45 + i * 0.35, 6.0 + flag(i), -1.2]} s={[0.35, 0.7, 0.05]} color={["#2447a8", "#f4f4f4", "#d62839"][i]} line={2} />)}
    {[[-4.6, 0.9, -0.6, 0], [-3.4, 0.6, -0.8, 1], [5.6, 1.1, -1.4, 3]].map(([x, z, zz, i], k) => <Rat key={k} p={[x as number + Math.sin(t * 1.4 + k) * 0.6, 0, zz as number]} yaw={Math.cos(t * 1.4 + k) > 0 ? 0 : Math.PI} s={0.7} run={1} t={t} col={["#8f93a8", "#a48a6a", "#7e8296"][k]} />)}
    <Person p={[0, 0, 1.0]} h={3.5} look={dupont} f={f} pose={{ mood: t > 2.3 ? "grin" : "smile", arms: "chest", armK: seg(t, 0.3, 0.9), hunch: -0.15, tilt: 0.04 * Math.sin(t * 2), squash: 0.015 * Math.sin(t * 4), lookX: 0 }} />
  </>);
};

/* ================= S2 4.25 – 10.8 rats everywhere; plague; "mengumumkan" stamp; reward sign ================= */
const K2: Key[] = [
  { t: 4.25, pos: [-5, 6.5, 11.5], look: [0, 0.6, 1.0], fov: 64 }, { t: 6.9, pos: [-2.0, 3.6, 10.8], look: [1.0, 1.4, 0.8], fov: 58 },
  { t: 7.7, pos: [-0.2, 2.8, 9.4], look: [1.5, 1.7, 0.6], fov: 54 }, { t: 10.9, pos: [0.2, 2.8, 8.8], look: [1.5, 1.8, 0.6], fov: 52 }];
const S2 = ({ t, f }: Ctx) => {
  const arm = t < 7.2 ? 0 : t < 7.6 ? seg(t, 7.2, 7.6, Easing.in(Easing.quad)) : 1 - seg(t, 7.6, 8.1);
  const sign = seg(t, 8.35, 8.75, Easing.out(Easing.back(2.2)));
  const green = seg(t, 5.3, 6.0) * (1 - seg(t, 6.9, 7.3));
  return (<>
    <Cam t={t} keys={K2} impacts={[[7.6, 0.03]]} />
    <Lights warm="#fff0cc" />
    <Street t={t} />
    {Array.from({ length: 16 }, (_, i) => { const sp = 1.2 + (i % 4) * 0.25, ph = i * 1.7, x = -9 + ((t * sp + ph) % 18), z = -1 + (i % 5) * 1.2; return <Rat key={i} p={[x, 0, z]} yaw={0} s={0.8} run={1} t={t} col={["#8f93a8", "#a48a6a", "#7e8296", "#c9c2b8"][i % 4]} />; })}
    <Glow p={[0, 1.2, 0]} r={9} color="rgba(120,255,120,0.8)" o={0.28 * green} />
    <Person p={[-5.8, 0, 2.2]} h={3.2} look={folks[1]} f={f} pose={{ mood: "shock", arms: "up", armK: 1, air: Math.abs(Math.sin(t * 6)) * 0.12 }} />
    <Person p={[6.2, 0, 2.0]} h={3.2} look={folks[2]} f={f} pose={{ mood: "worry", arms: "head", armK: 1, nerv: 0.4, flip: true }} />
    {/* announcement board + stamp */}
    <Box p={[2.6, 2.0, 0.6]} s={[2.2, 2.8, 0.14]} color="#8a5a32" /><Box p={[2.6, 0.8, 0.6]} s={[0.2, 1.6, 0.2]} color="#6a4222" />
    <Sign p={[2.6, 2.2, 0.7]} s={[1.9, 2.3]} text="PENGUMUMAN" bg="#fff8d6" fg="#7a1f2e" size={46} />
    {sign > 0.02 ? <group position={[2.6, 1.25, 0.8]} scale={[sign, sign, 1]}><Sign p={[0, 0, 0]} s={[1.7, 0.7]} text="1 SEN / TIKUS" bg="#ffd23a" fg="#1b1b2a" size={46} /></group> : null}
    {t > 7.6 ? <Glow p={[2.6, 1.7, 0.9]} r={1.4} color="rgba(255,255,220,1)" o={0.8 * Math.exp(-(t - 7.6) * 8)} /> : null}
    <Person p={[0.9, 0, 1.2]} h={3.5} look={dupont} f={f} pose={{ mood: t < 7.0 ? "worry" : t < 8.3 ? "grin" : "smile", arms: undefined, armR: [0.55 + 0.0 * arm, lerp(0.9, 0.52, arm)], armRK: seg(t, 6.9, 7.2), armL: [-0.2, 0.55], armLK: seg(t, 6.9, 7.2), nerv: t < 6.9 ? 0.3 : 0 }} />
    <FaceGroup p={[0.9, 0, 1.2]}><Box p={hand(3.5, [0.55, lerp(0.9, 0.52, arm)], 0, false, 0.1)} s={[0.3, 0.2, 0.2]} color="#7a1f2e" line={2} /></FaceGroup>
  </>);
};

/* ================= S3 10.8 – 15.8 office: dead-rat imagination (cartoon) -> tails only idea ================= */
const K3: Key[] = [{ t: 10.8, pos: [-1.0, 3.2, 9.2], look: [0.4, 2.8, 0], fov: 60 }, { t: 13.0, pos: [-0.2, 3.2, 7.8], look: [0.6, 3.1, 0], fov: 56 }, { t: 14.35, pos: [0.4, 3.2, 7.2], look: [0.6, 2.9, 0], fov: 54 }, { t: 15.9, pos: [0.7, 3.1, 6.8], look: [0.7, 2.8, 0], fov: 52 }];
const S3 = ({ t, f }: Ctx) => {
  const cl = seg(t, 11.5, 11.9, Easing.out(Easing.back(2))) * (1 - seg(t, 14.3, 14.45));
  const bulb = seg(t, 14.4, 14.6, Easing.out(Easing.back(3)));
  const nR = Math.floor(clamp((t - 12.0) / 1.8) * 9);
  return (<>
    <Cam t={t} keys={K3} />
    <Lights warm="#fff2d8" />
    <OfficeSet t={t} />
    <Desk p={[0.4, 0, -0.9]} w={4.4} top="#8a5a32" leg="#5a3a20" /><Chair p={[-2.2, 0, -3.0]} rotY={0.3} color="#7a1f2e" />
    <Box p={[2.0, 1.28, -0.8]} s={[0.6, 0.1, 0.45]} color="#f6efd2" line={2} />
    {t > 14.2 ? <group position={[1.1, 1.55, -0.7]} scale={seg(t, 14.2, 14.5, Easing.out(Easing.back(2)))}><Cyl p={[0, 0, 0]} rt={0.3} h={0.6} color="#bfe9ff" line={2} /><Cyl p={[0, 0.34, 0]} rt={0.31} h={0.06} color="#8a6a4a" line={2} />{[0, 1, 2, 3].map((i) => <Cyl key={i} p={[-0.12 + i * 0.08, 0.5, 0]} rt={0.015} h={0.35} color="#ff9fb0" line={1} rot={[0, 0, (i - 1.5) * 0.12]} />)}<Sign p={[0, 0, 0.32]} s={[0.46, 0.3]} text="EKOR" bg="#fff" fg="#7a1f2e" size={70} /></group> : null}
    <Person p={[0.3, 0, -2.0]} h={3.5} look={dupont} f={f} pose={{ mood: t < 12.2 ? "worry" : t < 14.3 ? "shock" : "grin", arms: t < 14.3 ? "chest" : "up", armK: seg(t, 11.0, 11.3), nerv: t > 12 && t < 14.3 ? 0.4 : 0, sweat: t > 12.4 && t < 14.3 ? 1 : 0, hunch: t > 12 && t < 14.3 ? 0.25 : 0, squash: t > 14.4 ? 0.1 * Math.exp(-(t - 14.4) * 6) : 0 }} />
    <Cloud p={[2.0, 5.9, -1.5]} s={[4.2, 3.0]} k={cl} draw={(c, W, H) => { for (let i = 0; i < nR; i++) drawRatHead(c, W * (0.24 + (i % 5) * 0.13), H * (0.62 - Math.floor(i / 5) * 0.22), 40, false, true); }} />
    <Glow p={[0.4, 5.6, -1.5]} r={1.8} color="rgba(255,240,120,1)" o={0.9 * bulb} />
    {bulb > 0.02 ? <group position={[0.4, 5.5, -1.5]} scale={bulb}><Ball p={[0, 0, 0]} r={0.35} color="#fff3a6" /><Cyl p={[0, -0.4, 0]} rt={0.14} h={0.2} color="#9aa3b8" line={2} /></group> : null}
  </>);
};

/* ================= S4 15.8 – 22.8 (whip) the queue; Minh drops the bag on the counter at "tas" ================= */
const K4: Key[] = [{ t: 15.8, pos: [-9.5, 4.4, 10.8], look: [-1.0, 1.8, 0.6], fov: 62 }, { t: 18.3, pos: [-2.6, 3.4, 10.4], look: [3.0, 1.8, 0.8], fov: 58 }, { t: 20.2, pos: [2.4, 2.8, 9.8], look: [6.2, 1.8, 1.0], fov: 54 }, { t: 22.9, pos: [3.8, 2.6, 9.4], look: [6.4, 1.9, 1.0], fov: 52 }];
const Bag: React.FC<{ p: V3; s?: number; tails?: boolean }> = ({ p, s = 1, tails = true }) => <group position={p} scale={s}><Ball p={[0, 0.4, 0]} r={0.5} color="#b08850" s={[1, 1.1, 0.9]} />{tails ? [0, 1, 2, 3].map((i) => <Cyl key={i} p={[-0.18 + i * 0.12, 1.02, 0.0]} rt={0.02} h={0.5} color="#ff9fb0" line={1} rot={[0, 0, (i - 1.5) * 0.18]} />) : null}</group>;
const Counter: React.FC<{ p: V3; open?: boolean }> = ({ p, open }) => (<group position={p}>
  <Box p={[0, 1.0, 0]} s={[2.8, 2.0, 1.4]} color="#8a5a32" /><Box p={[0, 2.1, 0]} s={[3.2, 0.2, 1.7]} color="#5a3a20" line={3} />{open ? <Sign p={[0, 5.4, -0.9]} s={[3.2, 0.8]} text="KANTOR HADIAH" bg="#f6efd2" fg="#7a1f2e" size={50} /> : <>
  <Sign p={[0, 3.7, 0.1]} s={[3.2, 0.9]} text="KANTOR HADIAH" bg="#f6efd2" fg="#7a1f2e" size={52} />
  <Box p={[0, 2.7, -0.5]} s={[2.4, 1.1, 0.06]} color="#bfe9ff" line={2} /><Box p={[-1.5, 2.6, -0.2]} s={[0.1, 1.2, 0.1]} color="#5a3a20" /><Box p={[1.5, 2.6, -0.2]} s={[0.1, 1.2, 0.1]} color="#5a3a20" /></>}
</group>);
const S4 = ({ t, f }: Ctx) => {
  const drop = seg(t, 20.7, 20.95, Easing.in(Easing.quad)), settle = t > 20.95 ? Math.exp(-(t - 20.95) * 9) * Math.sin((t - 20.95) * 30) * 0.08 : 0;
  const A: V3 = [6.5, 2.3 + Math.sin(t * 5) * 0.03, 1.55], B: V3 = [7.35, 2.2, 1.0];
  const bp: V3 = [lerp(A[0], B[0], drop), lerp(A[1], B[1], drop) + Math.sin(drop * Math.PI) * 0.3 + settle, lerp(A[2], B[2], drop)];
  return (<>
    <Cam t={t} keys={K4} impacts={[[20.95, 0.03]]} />
    <Lights warm="#e8f0ff" />
    <Street t={t} />
    <Counter p={[8.2, 0, 0.4]} />
    {[0, 1, 2, 3, 4].map((i) => { const x = -3.4 + i * 1.75, z = 1.0 + (i % 2) * 0.5; return <React.Fragment key={i}>
      <Person p={[x, 0, z]} h={3.2} look={folks[i]} f={f} pose={{ mood: i % 2 ? "smile" : "deadpan", arms: "hold", armK: 0.7, tilt: Math.sin(t * 2 + i) * 0.04, squash: Math.sin(t * 3 + i) * 0.012 }} />
      <Bag p={[x + 0.55, 1.0, z + 0.2]} s={0.75} /></React.Fragment>; })}
    <Person p={[5.2, 0, 1.2]} h={3.5} look={minh} f={f} pose={{ mood: "grin", armR: [0.5, 0.62], armRK: t < 20.7 ? 1 : seg(t, 20.9, 21.4), nerv: 0, squash: t > 20.9 ? -0.08 * Math.exp(-(t - 20.95) * 8) : 0, tilt: 0.03 * Math.sin(t * 3) }} />
    <Bag p={bp} s={1.1} />
    <Dust t={t} area={[8, 4, 3]} color="rgba(255,240,200,.8)" />
  </>);
};

/* ================= S5 22.8 – 25.25 counter: coin, "Hebat" bell ding ================= */
const K5: Key[] = [{ t: 22.8, pos: [7.6, 2.9, 9.8], look: [7.7, 2.4, 0.0], fov: 50 }, { t: 25.3, pos: [7.6, 2.9, 8.6], look: [7.7, 2.6, 0.0], fov: 46 }];
const S5 = ({ t, f }: Ctx) => {
  const coin = seg(t, 23.2, 23.85, ease), ding = t > 23.94 ? Math.exp(-(t - 23.94) * 7) : 0;
  const nod = Math.sin(clamp((t - 22.9) / 0.9) * Math.PI * 2) * 0.05;
  return (<>
    <Cam t={t} keys={K5} />
    <Lights warm="#fff0cc" />
    <Street t={t} />
    <Counter p={[8.4, 0, 0.4]} open />
    <Person p={[8.9, 0.9, -0.9]} h={3.6} look={dupont} f={f} pose={{ mood: t < 23.9 ? "smile" : "grin", arms: t < 23.9 ? "chest" : "up", armK: seg(t, 22.8, 23.1), tilt: nod, squash: t > 23.94 ? 0.12 * ding : 0 }} />
    <Person p={[6.4, 0, 1.6]} h={3.5} look={minh} f={f} pose={{ mood: "grin", arms: t > 23.94 ? "up" : "hold", armK: 0.8, air: t > 23.94 ? Math.abs(Math.sin((t - 23.94) * 9)) * 0.2 * Math.exp(-(t - 23.94) * 2) : 0 }} />
    <Bag p={[7.3, 2.2, 1.0]} s={1.1} />
    {coin < 0.99 ? <Coin p={[lerp(8.5, 6.7, coin), 3.2 + Math.sin(coin * Math.PI) * 0.8, 0.6]} rot={[Math.PI / 2, t * 12, 0]} /> : null}
    <group position={[9.5, 2.3, 1.0]} scale={[1 + ding * 0.2, 1 - ding * 0.15, 1]}><Ball p={[0, 0.12, 0]} r={0.2} color="#ffc928" s={[1, 0.7, 1]} /><Ball p={[0, 0.3, 0]} r={0.05} color="#ffe27a" ink={0.02} /></group>
    {t > 23.94 ? <Glow p={[9.5, 2.6, 1.2]} r={1.2} color="rgba(255,240,150,1)" o={0.9 * ding} /> : null}
  </>);
};

/* ================= S6 25.25 – 29.95 sewer: snip at "memotong", release at "melepas" ================= */
const K6: Key[] = [{ t: 25.25, pos: [-1.0, 4.5, 10.8], look: [2.0, 1.6, 0.8], fov: 64 }, { t: 26.7, pos: [1.8, 2.4, 9.4], look: [2.4, 1.6, 0.9], fov: 52 }, { t: 27.5, pos: [1.9, 2.1, 8.4], look: [2.4, 1.5, 0.9], fov: 48 }, { t: 28.4, pos: [1.6, 2.2, 9.4], look: [2.0, 1.5, 0.9], fov: 52 }, { t: 29.95, pos: [-1.0, 2.4, 9.4], look: [-1.0, 1.4, 0.8], fov: 56 }];
const S6 = ({ t, f }: Ctx) => {
  const cut = t >= 27.5, snipK = t > 26.9 && t < 27.5 ? Math.abs(Math.sin(t * 22)) : t >= 27.5 ? 0.0 : 0;
  const fly = seg(t, 27.5, 28.05, Easing.in(Easing.quad));
  const jump = t > 27.5 && t < 28.2 ? Math.sin(clamp((t - 27.5) / 0.7) * Math.PI) * 0.9 : 0;
  const run = t > 29.2, rx = run ? 1.4 - (t - 29.2) * 7 : 1.4;
  const arm: [number, number] = [0.25, t > 28.9 ? 0.55 : 0.4];
  return (<>
    <Cam t={t} keys={K6} impacts={[[27.5, 0.012]]} />
    <Lights warm="#cfeee6" />
    <Sewer t={t} />
    <Box p={[1.4, 0.45, 0.9]} s={[2.0, 0.9, 1.3]} color="#6a5a4a" />
    {!run || rx > -8 ? <Rat p={[rx, 0.9 + jump, 0.9]} yaw={run ? Math.PI : Math.PI} s={1.6} tail={cut ? 0 : 1} t={t} run={run ? 1 : 0} sit={run ? 0 : 0.3} col="#a48a6a" /> : null}
    {run ? <Glow p={[rx + 1.4, 0.9, 1.2]} r={0.9} color="rgba(255,240,200,1)" o={0.6 * Math.exp(-(t - 29.2) * 5)} /> : null}
    <Person p={[3.0, 0, 1.3]} h={3.5} look={minh} f={f} pose={{ mood: t < 26.6 ? "grin" : "smile", flip: true, armR: arm, armRK: t > 26.5 && t < 29.3 ? 1 : 0, arms: t > 29.3 ? "point" : undefined, armK: t > 29.3 ? 0.8 : 0, lookX: -0.4, nerv: 0.1, hunch: 0.25 }} />
    {t > 26.4 && t < 29.2 ? <group position={[2.4, 1.45, 1.5]} rotation={[0, 0, 0.15]}>
      <Box p={[0, 0.06 + snipK * 0.07, 0]} s={[0.55, 0.05, 0.05]} color="#cfd3df" rot={[0, 0, 0.0 + snipK * 0.4]} line={2} /><Box p={[0, -0.06 - snipK * 0.07, 0]} s={[0.55, 0.05, 0.05]} color="#cfd3df" rot={[0, 0, -snipK * 0.4]} line={2} />
    </group> : null}
    {cut ? <TailPiece p={[lerp(2.15, 3.9, fly), lerp(1.2, 0.5, fly) + Math.sin(fly * Math.PI) * 0.6, lerp(0.9, 1.7, fly)]} rot={[0, 0, fly * 6]} s={1.3} /> : null}
    <Cyl p={[3.9, 0.35, 1.7]} rt={0.4} rb={0.3} h={0.7} color="#8b6a4a" line={3} />{cut && fly > 0.98 ? <TailPiece p={[3.9, 0.75, 1.7]} rot={[0, 0, 1.3]} s={1.1} /> : null}
  </>);
};

/* ================= S7 29.95 – 35.7 riverbank dusk: "Kasihan" cloud, then rats multiply ================= */
const K7: Key[] = [{ t: 29.95, pos: [-1.2, 3.0, 9.6], look: [0.2, 3.2, 0], fov: 56 }, { t: 32.8, pos: [0.4, 3.2, 9.2], look: [0.4, 3.5, 0], fov: 58 }, { t: 35.8, pos: [0.6, 3.3, 8.8], look: [0.4, 3.6, 0], fov: 58 }];
const S7 = ({ t, f }: Ctx) => {
  const c1 = seg(t, 30.1, 30.5, Easing.out(Easing.back(2))) * (1 - seg(t, 31.4, 31.55)), c2 = seg(t, 31.6, 32.0, Easing.out(Easing.back(2))) * (1 - seg(t, 35.0, 35.2));
  const n = t < 32.9 ? 1 : t < 33.4 ? 2 : t < 33.9 ? 4 : t < 34.45 ? 8 : 16;
  return (<>
    <Cam t={t} keys={K7} />
    <Lights warm="#ffc9a0" />
    <Floor kind="carpet" a="#3f7a4a" b="#386c42" unit={2} w={44} d={44} />
    <Box p={[0, 0.03, -5]} s={[44, 0.06, 7]} color="#3a7fb8" line={2} />{[-10, -4, 2, 8].map((x, i) => <Box key={x} p={[x + Math.sin(t * 1.2 + i) * 0.4, 0.08, -5 + (i % 2)]} s={[2, 0.02, 0.1]} color="#cfeaff" line={1} />)}
    <Ball p={[-8, 4.2 - (t - 30) * 0.12, -12]} r={2.8} color="#ff9a4a" ink={0.02} /><Glow p={[-8, 4.2 - (t - 30) * 0.12, -11.5]} r={9} color="rgba(255,150,90,1)" o={0.55} />
    {[-9, -6.4, 7, 9.6].map((x, i) => <React.Fragment key={i}><Cyl p={[x, 1.6, -2]} rt={0.22} h={3.2} color="#6a4a2a" /><Ball p={[x, 4.0, -2]} r={1.5} color={i % 2 ? "#2f8a52" : "#3fa060"} s={[1, 0.9, 1]} /></React.Fragment>)}
    {[-3.2, -2.6, -2.0, 3.4, 4.0].map((x, i) => <Cyl key={i} p={[x, 0.6, -0.6]} rt={0.05} h={1.2 + (i % 2) * 0.4} color="#4aa86a" line={1} rot={[0, 0, Math.sin(t * 1.5 + i) * 0.08]} />)}
    <Bench p={[0, 0, 0.2]} rotY={0} /><StreetLamp p={[-4.6, 0, 0.4]} h={5} on={0.9} />
    <Person p={[0, 0.55, 0.45]} h={3.1} look={minh} f={f} pose={{ mood: t < 31.5 ? "worry" : t < 34.9 ? "grin" : "laugh", arms: "hold", armK: 0.8, tilt: 0.03 * Math.sin(t * 2), hunch: 0.1 }} />
    <Rat p={[0.55, 1.45, 1.05]} yaw={0.4} s={1.1} tail={0} t={t} sit={0.2} col="#a48a6a" />
    <Cloud p={[0.5, 6.2, 0.4]} s={[4.4, 3.2]} k={c1} draw={(c, W, H) => drawRatHead(c, W * 0.46, H * 0.5, 105, true)} />
    <Cloud p={[0.5, 6.4, 0.4]} s={[4.6, 3.3]} k={c2} draw={(c, W, H) => { for (let i = 0; i < n; i++) { const cols = n > 8 ? 6 : n > 2 ? 4 : 2, r = n > 8 ? 36 : n > 2 ? 52 : n > 1 ? 74 : 100, x = n === 1 ? 0.5 : 0.22 + ((i % cols) / (cols - 1)) * 0.56, y = n <= cols ? 0.5 : 0.28 + Math.floor(i / cols) * (n > 8 ? 0.2 : 0.3); drawRatHead(c, W * x, H * y, r, true); } }} />
  </>);
};

/* ================= S8 35.7 – 41.1 backyard rat farm; names above heads at "bahkan memberi nama pada tiap tikus" (TEXT ONLY) ================= */
const K8: Key[] = [{ t: 35.7, pos: [-7.0, 4.2, 11.2], look: [0, 1.6, 0], fov: 62 }, { t: 37.6, pos: [3.0, 3.0, 10.8], look: [-1.0, 1.8, 0], fov: 56 }, { t: 38.75, pos: [0.0, 2.8, 10.8], look: [0, 1.9, 0], fov: 54 }, { t: 39.35, pos: [0.0, 2.3, 10.2], look: [0.0, 1.9, 3.0], fov: 50 }, { t: 41.2, pos: [0.0, 2.3, 9.8], look: [0.0, 1.9, 3.0], fov: 49 }];
const S8 = ({ t, f }: Ctx) => {
  const tags: [string, number, number, number][] = [["Sudewo", -0.78, 2.0, 39.45], ["Maidi", 0.78, 2.0, 39.8], ["Amba", -0.78, 0.7, 40.15], ["Patra", 0.78, 0.7, 40.5]];
  const cols = ["#8f93a8", "#a48a6a", "#e8e2d6", "#4a4658"];
  return (<>
    <Cam t={t} keys={K8} />
    <Lights warm="#ffe6b8" />
    <Floor kind="plank" a="#7a4a2a" b="#6c4024" unit={2} w={34} d={34} />
    <WallDoor z={-7} W={30} kind="wood" a="#c98a4a" b="#b97c3d" door={{ x: 6.2, w: 2.2, h: 4 }} base="#5a3018" />
    {[-8.4, -5.6, -2.8, 0, 2.8].map((x, i) => <Box key={i} p={[x, 0.7, -5.2 + (i % 2) * 0.4]} s={[2.2, 1.4, 1.2]} color="#c9b48a" opacity={1} />)}
    {[-8.4, -5.6, -2.8, 0, 2.8].map((x, i) => <React.Fragment key={"c" + i}>
      <Box p={[x, 1.55, -5.2 + (i % 2) * 0.4]} s={[2.3, 0.1, 1.3]} color="#5a3a20" line={3} />
      {[-0.9, -0.3, 0.3, 0.9].map((dx) => <Cyl key={dx} p={[x + dx, 0.7, -4.52 + (i % 2) * 0.4]} rt={0.02} h={1.3} color="#9aa3b8" line={1} />)}
      {[0, 1].map((k) => <Rat key={k} p={[x - 0.5 + k * 0.9, 0.05, -5.0 + (i % 2) * 0.4]} yaw={k ? Math.PI : 0} s={0.8} tail={0} t={t + i + k} run={t > 36.5 && t < 38.9 ? 1 : 0} col={cols[(i + k) % 4]} />)}
    </React.Fragment>)}
    {[-10, -7.5, 8, 10.5].map((x, i) => <React.Fragment key={i}><Cyl p={[x, 1.2, -3.5]} rt={0.14} h={2.4} color="#6a4a2a" /><Ball p={[x, 2.9, -3.5]} r={1.1} color="#3fa060" s={[1.1, 0.8, 1]} /></React.Fragment>)}
    <Lamp p={[-3.6, 0, -3.4]} h={2.6} color="#ffd36a" /><Glow p={[-3.6, 2.7, -3.3]} r={2.5} color="rgba(255,200,90,1)" o={0.35} />
    <Person p={[5.2, 0, -2.6]} h={3.2} look={minh} f={f} pose={{ mood: "grin", arms: "chest", armK: 0.9, tilt: Math.sin(t * 2) * 0.04, flip: true }} />
    <Dust t={t} area={[8, 3, 3]} color="rgba(255,235,190,.8)" />
    {/* foreground rack with the four named rats */}
    <Box p={[0, 2.0, 3.0]} s={[3.2, 0.12, 1.0]} color="#8a5a32" line={3} /><Box p={[0, 0.7, 3.0]} s={[3.2, 0.12, 1.0]} color="#8a5a32" line={3} />
    {[-1.5, 1.5].map((x) => <Box key={x} p={[x, 1.2, 3.0]} s={[0.12, 2.0, 0.12]} color="#6a4222" line={2} />)}
    {tags.map(([name, x, y, t0], i) => <React.Fragment key={name}>
      <Rat p={[x, y + 0.06, 3.0]} yaw={0.5 + i * 0.1} s={1.5} tail={0} t={t + i} sit={0.25} col={cols[i]} />
      <NameTag p={[x, y + 0.95, 3.0]} text={name} k={seg(t, t0, t0 + 0.28, Easing.out(Easing.back(2.6)))} />
    </React.Fragment>)}
  </>);
};

/* ================= S9 41.1 – 47.2 clerk whispers; record scratch at "tanpa"; frozen "terdiam" ================= */
const K9: Key[] = [{ t: 41.1, pos: [-3.0, 3.4, 10.6], look: [-1.0, 2.6, 0], fov: 60 }, { t: 43.8, pos: [-1.0, 3.2, 9.6], look: [-1.0, 2.5, 0], fov: 54 }, { t: 45.3, pos: [-0.6, 3.2, 8.2], look: [-0.8, 2.6, 0], fov: 50 }, { t: 47.3, pos: [-0.4, 3.2, 7.4], look: [-0.6, 2.7, 0], fov: 48 }];
const S9 = ({ t, f }: Ctx) => {
  const wk = seg(t, 41.4, 43.3, Easing.inOut(Easing.quad)), cx = lerp(-7.5, -1.6, wk), moving = wk > 0 && wk < 1;
  const sip = t < 45.16 ? 0.5 + 0.5 * Math.sin(t * 2.4) : 1;
  const rat = seg(t, 46.55, 46.95, Easing.out(Easing.back(2)));
  return (<>
    <Cam t={t} keys={K9} />
    <Lights warm="#b8c6ff" />
    <OfficeSet t={t} night />
    <Desk p={[0.2, 0, -1.0]} w={4.4} top="#6a4222" leg="#3a2212" />
    <Lamp p={[1.8, 1.2, -1.3]} h={1.4} color="#ffe9a8" />
    <Person p={[0.4, 0, -2.0]} h={3.5} look={dupont} f={f} pose={{ mood: t < 45.1 ? "smile" : t < 46.1 ? "shock" : "deadpan", armR: [0.35, 0.5 + 0.35 * (t < 45.16 ? sip : 1)], armRK: 1, tilt: t > 45.16 && t < 45.4 ? -0.12 : 0, lookX: t > 45.16 ? -0.5 : 0, sweat: t > 46.1 ? 1 : 0, nerv: t > 46.1 ? 0.3 : 0, hunch: 0 }} />
    <FaceGroup p={[0.4, 0, -2.0]}><Mug p={hand(3.5, [0.35, 0.5 + 0.35 * (t < 45.16 ? sip : 1)], 0, false, 0.14)} s={1.2} /></FaceGroup>
    <Person p={[cx, 0, 0.2]} h={3.3} look={clerk} f={f} pose={{ mood: t < 43.5 ? "smile" : "worry", walk: cx * WALK, speed: moving ? 1 : 0, arms: t > 43.5 ? "head" : "down", armK: t > 43.5 ? 0.4 : 0, tilt: t > 43.5 ? 0.14 : 0, flip: false, nerv: 0.2 }} />
    {rat > 0.02 ? <group scale={[rat, rat, rat]}><Rat p={[2.0, 1.28, -0.8]} yaw={Math.PI} s={1.3} tail={0} t={t} sit={0.1} col="#a48a6a" /></group> : null}
    {t > 46.4 ? <Ball p={[-3.1 + Math.sin(t * 9) * 0.0, 1.38 + Math.max(0, Math.sin(t * 5)) * 0.1, -0.8]} r={0.06} color="#7bd34a" ink={0.02} /> : null}
  </>);
};

/* ================= S10 47.2 – 50.52 payroll punchline: register ka-ching at "menggaji" ================= */
const K10: Key[] = [{ t: 47.2, pos: [-0.4, 3.2, 7.4], look: [-0.4, 2.7, 0], fov: 48 }, { t: 48.7, pos: [0.4, 3.4, 8.8], look: [0.3, 3.0, -1.0], fov: 54 }, { t: 50.6, pos: [0.8, 3.6, 11.5], look: [0.4, 2.6, -2.0], fov: 60 }];
const S10 = ({ t, f }: Ctx) => {
  const pop = t > 48.63 ? Math.exp(-(t - 48.63) * 4) : 0, dr = seg(t, 48.63, 48.8, Easing.out(Easing.back(3)));
  return (<>
    <Cam t={t} keys={K10} impacts={[[48.63, 0.012]]} />
    <Lights warm="#fff2d8" />
    <OfficeSet t={t} door />
    <Desk p={[-0.6, 0, -1.0]} w={4.4} top="#8a5a32" leg="#5a3a20" />
    <group position={[0.6, 1.3, -0.9]}><Box p={[0, 0.25, 0]} s={[1.3, 0.5, 0.9]} color="#3a3f58" /><Box p={[0, 0.75, -0.2]} s={[1.1, 0.5, 0.2]} color="#5a6fa8" line={2} /><Sign p={[0, 0.78, -0.07]} s={[0.8, 0.3]} text="$$$" bg="#bfe9ff" fg="#0b0d1a" size={90} /><Box p={[0, 0.12 + dr * 0.05, 0.5]} s={[1.0, 0.16, 0.3]} color="#8a8fa8" line={2} /></group>
    {t > 48.63 ? [0, 1, 2, 3, 4, 5].map((i) => { const k = (t - 48.63) * 1.4, vx = (i - 2.5) * 0.7, y = 2.6 + Math.sin(clamp(k * 1.6 + i * 0.05) * Math.PI) * 1.6 * (0.7 + (i % 3) * 0.2); return <Coin key={i} p={[0.6 + vx * k * 1.2, y, -0.4 + (i % 2) * 0.3]} rot={[Math.PI / 2 + t * 8, t * 6, 0]} />; }) : null}
    {t > 48.63 ? <Glow p={[0.6, 2.2, -0.3]} r={2.2} color="rgba(255,225,120,1)" o={0.8 * pop} /> : null}
    <Person p={[-1.8, 0, -2.0]} h={3.5} look={dupont} f={f} pose={{ mood: t < 48.6 ? "deadpan" : "shock", armR: [0.35, 0.5], armRK: 1, sweat: 1, nerv: 0.2, lookX: 0.3, squash: t > 48.63 ? 0.1 * pop : 0 }} />
    {[0, 1, 2, 3].map((i) => <React.Fragment key={i}>
      <Person p={[0.3 + i * 0.95, 0, -9.0 + 0.3 * (i % 2)]} h={2.8} look={folks[i + 1]} f={f} pose={{ mood: "grin", arms: "hold", armK: 0.7, squash: Math.sin(t * 4 + i) * 0.015 }} />
      <Box p={[0.3 + i * 0.95 + 0.4, 1.3, -8.6 + 0.3 * (i % 2)]} s={[0.55, 0.45, 0.4]} color="#b08850" line={2} /><Rat p={[0.3 + i * 0.95 + 0.4, 1.52, -8.6 + 0.3 * (i % 2)]} s={0.55} tail={0} t={t + i} col="#a48a6a" />
    </React.Fragment>)}
  </>);
};

export const RatTails: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Scene first start={0} end={4.25} bg="#f3d9a0">{(c) => <S1 {...c} />}</Scene>
    <Scene start={4.25} end={10.8} trans="zoom" bg="#f0c987">{(c) => <S2 {...c} />}</Scene>
    <Scene start={10.8} end={15.8} trans="ghost" bg="#efe1b8">{(c) => <S3 {...c} />}</Scene>
    <Scene start={15.8} end={22.8} trans="whip" bg="#bcd8f2">{(c) => <S4 {...c} />}</Scene>
    <Scene start={22.8} end={25.25} trans="flash" bg="#f0c987">{(c) => <S5 {...c} />}</Scene>
    <Scene start={25.25} end={29.95} trans="zoom" bg="#14352f">{(c) => <S6 {...c} />}</Scene>
    <Scene start={29.95} end={35.7} trans="ghost" bg="#6a3a7a">{(c) => <S7 {...c} />}</Scene>
    <Scene start={35.7} end={41.1} trans="ghost" bg="#cfe8a8">{(c) => <S8 {...c} />}</Scene>
    <Scene start={41.1} end={47.2} trans="ghost" bg="#1c2748">{(c) => <S9 {...c} />}</Scene>
    <Scene start={47.2} end={50.6} trans="flash" bg="#efe1b8">{(c) => <S10 {...c} />}</Scene>
    <Captions />
  </AbsoluteFill>
);
void Audio; void staticFile; void Shaft; void Chair; void Cabinet; void camAt; void Clock; void Lectern; void Barrier;
