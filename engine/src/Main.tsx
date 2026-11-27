// STARTER composition. Claude: copy the scene pattern from src/examples/NvidiaDemo.tsx, replace S1.. with scenes for the NEW script.
// Inputs per video (made by the pipeline): public/words.json (word timings), public/script.json (script tokens WITH punctuation), public/mix.wav (voice+SFX).
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing, Audio, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Look } from "./style/puppet";
import { Rig, Person, Lights, seg, lerp, clamp } from "./style/kit";
import { Floor, WallDoor, Plant } from "./style/props";
import words from "../public/words.json";
import SCRIPT from "../public/script.json";

export const FPS = 30, LEAD = 6, TAIL = 8;
export const WALK = 3.4; // walk-cycle phase per world unit => feet never slide
export const hero: Look = { skin: "#fbe3c8", body: "#3f7bff", outfit: "shirt", hair: "short", hairColor: "#1b1b2a", shoe: "#1b1b2a" };
export type Ctx = { t: number; f: number };

export const Scene: React.FC<{ start: number; end: number; first?: boolean; trans?: "ghost" | "zoom" | "flash"; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ start, end, first, trans = "ghost", bg, children }) => {
  const from = Math.round(start * FPS) - (first ? 0 : LEAD), dur = Math.round(end * FPS) - from + TAIL;
  return <Sequence from={from} durationInFrames={dur} layout="none"><Inner from={from} first={first} trans={trans} bg={bg} children={children} /></Sequence>;
};
const Inner: React.FC<{ from: number; first?: boolean; trans: string; bg: string; children: (c: Ctx) => React.ReactNode }> = ({ from, first, trans, bg, children }) => {
  const f = useCurrentFrame(), t = (f + from) / FPS;
  const k = first ? 1 : clamp(f / (LEAD + 2));
  const sc = !first && trans === "zoom" ? lerp(1.35, 1, Easing.out(Easing.cubic)(k)) : 1;
  return (
    <AbsoluteFill style={{ opacity: first ? 1 : trans === "flash" ? 1 : k, transform: `scale(${sc})`, background: bg, filter: "saturate(1.32) contrast(1.07) brightness(1.02)" }}>
      <ThreeCanvas width={720} height={1280} camera={{ fov: 64, position: [0, 2, 8], near: 0.1, far: 120 }} gl={{ antialias: true }}>
        <color attach="background" args={[bg]} />{children({ t, f })}
      </ThreeCanvas>
      {!first && trans === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - clamp(f / 7) }} /> : null}
    </AbsoluteFill>
  );
};

/* ---------- captions: style is chosen per video via public/caption-style.json  {"style":"classic|highlight|minimal|impact"} ---------- */
import capCfg from "../public/caption-style.json";
export type CapStyle = "classic" | "highlight" | "minimal" | "impact";
type G = { words: string[]; a: number; b: number };
const PER: Record<CapStyle, number> = { classic: 2, highlight: 2, minimal: 4, impact: 1 };
const build = (style: CapStyle): G[] => {
  const g: G[] = []; let cur: number[] = [];
  const flush = () => { if (cur.length) { g.push({ words: cur.map((i) => String(SCRIPT[i]).replace(/^["“”]+/, "").replace(/[.,!?;:]*["“”]*$/, "")), a: words[cur[0]].start, b: words[cur[cur.length - 1]].end }); cur = []; } };
  words.forEach((_, i) => { cur.push(i); if (cur.length === PER[style] || /[.,!?;:]$/.test(String(SCRIPT[i]))) flush(); });
  flush(); return g;
};
const STYLE: CapStyle = (["classic", "highlight", "minimal", "impact"].includes((capCfg as { style: string }).style) ? (capCfg as { style: CapStyle }).style : "classic");
const groups = build(STYLE);
export const Captions: React.FC<{ style?: CapStyle }> = ({ style = STYLE }) => {
  const gs = style === STYLE ? groups : build(style);
  const f = useCurrentFrame(), t = f / FPS;
  const idx = gs.findIndex((g, i) => t >= g.a - 0.02 && t < (gs[i + 1]?.a ?? 99) - 0.02); const g = gs[Math.max(0, idx)];
  const pop = (amt: number, dur: number) => interpolate(t - g.a, [0, dur], [amt, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(2.6)) });
  const base: React.CSSProperties = { position: "absolute", left: 30, right: 30, top: 880, textAlign: "center", fontFamily: "Inter, Arial", fontWeight: 900, lineHeight: 1.05, color: "#fff", paintOrder: "stroke fill" };
  if (style === "minimal") {
    const o = interpolate(t - g.a, [0, 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return <div style={{ ...base, left: 50, right: 50, top: 900, fontWeight: 800, fontSize: 58, WebkitTextStroke: "9px #000", textShadow: "0 5px 0 rgba(0,0,0,.3)", opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>{g.words.join(" ")}</div>;
  }
  if (style === "impact") {
    return <div style={{ ...base, top: 850, fontSize: 124, textTransform: "uppercase", WebkitTextStroke: "16px #000", textShadow: "0 10px 0 rgba(0,0,0,.4)", transform: `scale(${pop(0.55, 0.14)})` }}>{g.words[0]}</div>;
  }
  const act = style === "highlight" ? Math.max(0, g.words.findIndex((_, k) => { const wi = words.findIndex((w) => Math.abs(w.start - g.a) < 1e-6); const w = words[wi + k]; return w && t >= w.start - 0.02 && t < w.end + 0.02; })) : -1;
  return <div style={{ ...base, fontSize: 88, WebkitTextStroke: "12px #000", textShadow: "0 8px 0 rgba(0,0,0,.35)", transform: `scale(${pop(0.75, 0.12)})` }}>
    {g.words.map((w, k) => <span key={k} style={{ color: style === "highlight" && k === act ? "#FFE600" : "#fff" }}>{k ? " " : ""}{w}</span>)}
  </div>;
};

const Demo = ({ t, f }: Ctx) => (<>
  <Rig t={t} t0={0} t1={2} from={[1.5, 1.7, 7]} to={[0.4, 1.9, 5]} lookFrom={[0, 2, 0]} lookTo={[0, 2, 0]} />
  <Lights /><Floor kind="plank" a="#8a4a28" b="#7a3f22" unit={2} /><WallDoor z={-7} W={26} kind="wood" a="#b2713d" b="#a2662f" door={{ x: 4.6, w: 2.4, h: 4.2 }} base="#5a2e18" /><Plant p={[-3, 0, -4]} />
  <Person p={[0, 0, 0]} h={3.6} look={hero} f={f} pose={{ mood: "smile" }} />
</>);

export const Main: React.FC = () => {
  const f = useCurrentFrame(); void f; void seg;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* <Audio src={staticFile("mix.wav")} />  <- enable once public/mix.wav exists */}
      <Scene first start={0} end={2} bg="#925b32">{(c) => <Demo {...c} />}</Scene>
      <Captions />
    </AbsoluteFill>
  );
};
void Audio; void staticFile;
