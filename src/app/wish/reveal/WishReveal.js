"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ─── Theme config ─────────────────────────────────────────────────────── */
const THEMES = {
  romantic: { emoji: "💕", gradient: "linear-gradient(135deg, #FF6B9D, #C44B8F)", balloon: "linear-gradient(145deg, #FF8FB3 0%, #C44B8F 100%)", glow: "#FF6B9D", bg: "linear-gradient(145deg, #1a0520 0%, #2d0a2e 100%)" },
  funny:    { emoji: "😂", gradient: "linear-gradient(135deg, #FF6B35, #FBF38C)", balloon: "linear-gradient(145deg, #FF9A6C 0%, #F7C948 100%)", glow: "#FF6B35", bg: "linear-gradient(145deg, #1a0a00 0%, #2d1a00 100%)" },
  family:   { emoji: "🏠", gradient: "linear-gradient(135deg, #18FF92, #5A87FF)", balloon: "linear-gradient(145deg, #5EFFC4 0%, #5A87FF 100%)", glow: "#18FF92", bg: "linear-gradient(145deg, #001a10 0%, #001a40 100%)" },
  friends:  { emoji: "🎭", gradient: "linear-gradient(135deg, #A020F0, #FF1461)", balloon: "linear-gradient(145deg, #C060FF 0%, #FF1461 100%)", glow: "#A020F0", bg: "linear-gradient(145deg, #0d0520 0%, #200030 100%)" },
};

const HOLI_HEX = ["#FF1461","#FF6B35","#FBF38C","#18FF92","#5A87FF","#A020F0","#FF00FF","#00E5FF"];

/* ─── Pichkari options ─────────────────────────────────────────────────── */
const PICHKARIS = [
  { id: "red",    color: "#FF1461", glow: "#FF146188", label: "Laal",  water: "linear-gradient(to top, #FF1461cc 0%, #FF6B3577 60%, #FF146122 100%)" },
  { id: "green",  color: "#18FF92", glow: "#18FF9288", label: "Hara",  water: "linear-gradient(to top, #18FF92cc 0%, #5A87FF77 60%, #18FF9222 100%)" },
  { id: "purple", color: "#A020F0", glow: "#A020F088", label: "Neela", water: "linear-gradient(to top, #A020F0cc 0%, #FF00FF77 60%, #A020F022 100%)" },
];

/* ─── Realistic Pichkari Drawing ───────────────────────────────────────── */
function PichkariIcon({ color, fillLevel = 0, size = 70 }) {
  /* size = height in px; width = size * 1.8 */
  const h = size;
  const w = Math.round(size * 1.8);
  return (
    <div style={{ position: "relative", width: w, height: h, flexShrink: 0 }}>

      {/* ── Water tank (oval, shows fill level) ── */}
      <div style={{
        position: "absolute", top: "0%", left: "3%",
        width: "34%", height: "72%",
        borderRadius: "50% 50% 44% 44%",
        border: `2.5px solid ${color}`,
        overflow: "hidden",
        background: "rgba(0,0,0,0.38)",
        boxShadow: fillLevel > 0
          ? `0 0 18px ${color}66, inset 0 0 8px rgba(0,0,0,0.5)`
          : `inset 0 0 8px rgba(0,0,0,0.4), 0 0 4px rgba(255,255,255,0.06)`,
        transition: "box-shadow 0.3s",
      }}>
        {/* Water level inside tank */}
        <motion.div
          animate={{ height: `${fillLevel}%` }}
          transition={{ duration: 0.07 }}
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: `linear-gradient(to top, ${color} 0%, ${color}aa 100%)`,
          }}
        />
        {/* Bubbles when filling */}
        {fillLevel > 10 && fillLevel < 98 && (
          <motion.div
            animate={{ y: [0, -8, 0], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: 0.2 }}
            style={{
              position: "absolute",
              bottom: `${Math.min(fillLevel + 4, 90)}%`,
              left: "30%", width: 4, height: 4,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.55)",
            }}
          />
        )}
        {/* Tank shine highlight */}
        <div style={{
          position: "absolute", top: "10%", left: "16%",
          width: "30%", height: "36%",
          background: "rgba(255,255,255,0.22)", borderRadius: "50%",
          transform: "rotate(-28deg)", filter: "blur(2px)",
          pointerEvents: "none",
        }} />
        {/* Percentage text inside tank */}
        {fillLevel > 14 && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: Math.max(8, Math.round(size * 0.135)),
            fontWeight: 900, color: "white",
            textShadow: "0 1px 5px rgba(0,0,0,0.95)", zIndex: 2,
            letterSpacing: "-0.04em",
          }}>
            {Math.round(fillLevel)}%
          </div>
        )}
      </div>

      {/* ── Connector pipe (tank bottom → barrel) ── */}
      <div style={{
        position: "absolute", top: "58%", left: "28%",
        width: "16%", height: "20%",
        background: color, opacity: 0.8,
        borderRadius: "1px",
      }} />

      {/* ── Pump rod (left of tank) ── */}
      <div style={{
        position: "absolute", top: "24%", left: "0%",
        width: "5%", height: "50%",
        background: "rgba(255,255,255,0.2)", borderRadius: 3,
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
      {/* Pump knob */}
      <div style={{
        position: "absolute", top: "20%", left: "-1%",
        width: "8%", height: "8%",
        background: "rgba(255,255,255,0.32)", borderRadius: "50%",
        boxShadow: "0 0 4px rgba(255,255,255,0.2)",
      }} />

      {/* ── Barrel (horizontal body) ── */}
      <div style={{
        position: "absolute", top: "60%", left: "11%", right: "4%", height: "28%",
        background: `linear-gradient(180deg, ${color}ee 0%, ${color} 42%, ${color}99 100%)`,
        borderRadius: "5px 18px 18px 5px",
        boxShadow: `0 4px 12px rgba(0,0,0,0.35), 0 0 18px ${color}44`,
      }}>
        {/* Barrel shine */}
        <div style={{
          position: "absolute", top: "8%", left: "3%", right: "14%", height: "30%",
          background: "rgba(255,255,255,0.16)", borderRadius: "0 8px 8px 0", filter: "blur(1px)",
        }} />
        {/* Barrel ring detail */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: "38%",
          width: "3px", background: "rgba(0,0,0,0.22)", borderRadius: 2,
        }} />
      </div>

      {/* ── Nozzle tip ── */}
      <div style={{
        position: "absolute", top: "63%", right: "0%",
        width: "6%", height: "21%",
        background: color,
        borderRadius: "1px 8px 8px 1px",
        boxShadow: `0 0 14px ${color}, 0 0 4px rgba(0,0,0,0.4)`,
      }} />

      {/* ── Trigger / finger guard ── */}
      <div style={{
        position: "absolute", top: "80%", left: "53%",
        width: "5%", height: "20%",
        background: `${color}cc`, borderRadius: "0 0 4px 4px",
      }} />

      {/* ── Bottom grip ── */}
      <div style={{
        position: "absolute", bottom: "1%", left: "51%", right: "22%", height: "15%",
        border: `2px solid ${color}55`,
        borderTop: "none", borderRadius: "0 0 8px 8px",
      }} />

    </div>
  );
}

/* ─── Three.js particles ───────────────────────────────────────────────── */
const COUNT = 55;

function HoliParticles({ explode }) {
  const pointsRef   = useRef();
  const explodedRef = useRef(false);
  const damp        = useRef(new Array(COUNT).fill(1));

  const { geo, vel, orig } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const vel = [], orig = [];
    const palette = HOLI_HEX.map(h => new THREE.Color(h));
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 16, y = (Math.random() - 0.5) * 16, z = (Math.random() - 0.5) * 4;
      positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
      orig.push(x, y, z);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
      vel.push({ bx: (Math.random()-0.5)*0.6, by: (Math.random()-0.5)*0.6, bz: (Math.random()-0.5)*0.3 });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    return { geo: g, vel, orig };
  }, []);

  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(() => {
    if (explode && !explodedRef.current) { explodedRef.current = true; damp.current = new Array(COUNT).fill(1); }
  }, [explode]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    const t = clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      if (explodedRef.current) {
        pos.array[i*3]   += vel[i].bx * damp.current[i];
        pos.array[i*3+1] += vel[i].by * damp.current[i];
        pos.array[i*3+2] += vel[i].bz * damp.current[i];
        damp.current[i]   = Math.max(0, damp.current[i] - 0.016);
      } else {
        pos.array[i*3]   = orig[i*3]   + Math.sin(t * 0.38 + i * 0.53) * 1.1;
        pos.array[i*3+1] = orig[i*3+1] + Math.cos(t * 0.31 + i * 0.71) * 1.1;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial size={0.32} vertexColors transparent opacity={0.88} sizeAttenuation />
    </points>
  );
}

function ThreeBackground({ explode }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 13], fov: 55 }}
      gl={{ alpha: true, antialias: false }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}
    >
      <HoliParticles explode={explode} />
    </Canvas>
  );
}

/* ─── Confetti ─────────────────────────────────────────────────────────── */
function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    if (!active) { setPieces([]); return; }
    const n = typeof window !== "undefined" && window.innerWidth < 400 ? 70 : 110;
    setPieces(Array.from({ length: n }, (_, i) => ({
      id: i, left: Math.random() * 100, color: HOLI_HEX[Math.floor(Math.random() * HOLI_HEX.length)],
      duration: 2.5 + Math.random() * 3.5, delay: Math.random() * 2.5,
      size: 6 + Math.random() * 10, round: Math.random() > 0.45,
    })));
  }, [active]);
  if (!active || !pieces.length) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: "-20px",
          width: p.size, height: p.size, backgroundColor: p.color,
          borderRadius: p.round ? "50%" : "2px",
          animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
        }} />
      ))}
    </div>
  );
}

/* ─── Sounds ───────────────────────────────────────────────────────────── */
function playPopSound() {
  try {
    const AudioCtx = window.AudioContext || window["webkitAudioContext"];
    const ctx = new AudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    const src = ctx.createBufferSource(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
    filter.type = "bandpass"; filter.frequency.value = 600; filter.Q.value = 0.8;
    src.buffer = buf; src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(1.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    src.start(); src.stop(ctx.currentTime + 0.15);
  } catch { /* ignore */ }
}

function playCelebrationSound() {
  try {
    const AudioCtx = window.AudioContext || window["webkitAudioContext"];
    const ctx = new AudioCtx();
    [[261.63, 0], [329.63, 0.13], [392.00, 0.26], [523.25, 0.39]].forEach(([freq, t]) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "sine";
      const s = ctx.currentTime + t;
      gain.gain.setValueAtTime(0, s);
      gain.gain.linearRampToValueAtTime(0.28, s + 0.06);
      gain.gain.linearRampToValueAtTime(0, s + 0.32);
      osc.start(s); osc.stop(s + 0.35);
    });
  } catch { /* ignore */ }
}

/* ─── Framer Motion variants ───────────────────────────────────────────── */
const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
  exit:    { transition: { staggerChildren: 0.04 } },
};
const child = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
  exit:    { opacity: 0, y: -14, transition: { duration: 0.16 } },
};

/* ─── Main component ───────────────────────────────────────────────────── */
export default function WishReveal({ wishData }) {
  /* suspense | balloon | burst | selectPichkari | fillPichkari | throwColor | revealed */
  const [phase,             setPhase]             = useState("suspense");
  const [confetti,          setConfetti]          = useState(false);
  const [explode,           setExplode]           = useState(false);
  const [mounted,           setMounted]           = useState(false);
  const [selectedPichkari,  setSelectedPichkari]  = useState(null);
  const [progress,          setProgress]          = useState(0);
  const [filling,           setFilling]           = useState(false);
  const [throwSplash,       setThrowSplash]       = useState(false);

  const timerRef        = useRef(null);
  const fillIntervalRef = useRef(null);
  const fillingRef      = useRef(false);
  const progressRef     = useRef(0);
  const bucketRef       = useRef(null);   /* full bucket — overlap target */
  const pichkariCtrl    = useAnimation();

  const t           = THEMES[wishData?.theme] || THEMES.romantic;
  const pichkariDef = PICHKARIS.find(p => p.id === selectedPichkari) || PICHKARIS[0];
  const senderName  =
    typeof wishData?.sender === "string" && wishData.sender.trim()
      ? wishData.sender.trim()
      : "Someone";
  const wishText =
    typeof wishData?.wish === "string" && wishData.wish.trim()
      ? wishData.wish.trim()
      : "Happy Holi!";
  const wishWords = wishText.split(/\s+/);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!wishData) return;
    timerRef.current = setTimeout(() => setPhase("balloon"), 2800);
    return () => clearTimeout(timerRef.current);
  }, [wishData]);

  /* Balloon tap → burst → select pichkari */
  const handleBurst = () => {
    if (phase !== "balloon") return;
    playPopSound();
    setPhase("burst");
    setExplode(true);
    setTimeout(() => setPhase("selectPichkari"), 480);
  };

  /* Proceed to fill game */
  const handleStartFill = () => {
    if (!selectedPichkari) return;
    progressRef.current = 0;
    setProgress(0);
    setFilling(false);
    fillingRef.current = false;
    setPhase("fillPichkari");
  };

  /* Drag handler — pichkari dragged to bucket, fills pichkari tank */
  const handleDrag = (event, info) => {
    if (!bucketRef.current || progressRef.current >= 100) return;
    const b   = bucketRef.current.getBoundingClientRect();
    const pad = 34;
    const isOver =
      info.point.x >= b.left - pad && info.point.x <= b.right + pad &&
      info.point.y >= b.top  - pad && info.point.y <= b.bottom + pad;

    if (isOver && !fillingRef.current) {
      fillingRef.current = true;
      setFilling(true);
      fillIntervalRef.current = setInterval(() => {
        progressRef.current = Math.min(100, progressRef.current + 2);
        setProgress(progressRef.current);
        if (progressRef.current >= 100) {
          clearInterval(fillIntervalRef.current);
          fillingRef.current = false;
          setFilling(false);
          /* Auto-advance to throw phase after brief celebration pause */
          setTimeout(() => setPhase("throwColor"), 650);
        }
      }, 50);
    } else if (!isOver && fillingRef.current) {
      fillingRef.current = false;
      setFilling(false);
      clearInterval(fillIntervalRef.current);
    }
  };

  const handleDragEnd = () => {
    fillingRef.current = false;
    setFilling(false);
    clearInterval(fillIntervalRef.current);
    if (progressRef.current < 100)
      pichkariCtrl.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } });
  };

  /* Throw pichkari → color splash → reveal wish */
  const handleThrow = () => {
    if (phase !== "throwColor") return;
    setThrowSplash(true);
    playCelebrationSound();
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate([60, 40, 120, 40, 240]);
    setConfetti(true);
    setTimeout(() => {
      setThrowSplash(false);
      setPhase("revealed");
      setTimeout(() => setConfetti(false), 7000);
    }, 520);
  };

  /* ─── Invalid link ─── */
  if (!wishData) {
    return (
      <main style={{ minHeight: "100svh", background: "#0d0520", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>😕</div>
          <h2 style={{ color: "white", fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Wish nahi mili!</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>Link expire ho gayi ya galat hai.</p>
          <Link href="/wish" style={{ display: "block", padding: "16px 24px", borderRadius: 14, background: "linear-gradient(135deg, #FF1461, #FF6B35)", color: "white", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
            🎈 Secret Wish Banao
          </Link>
        </div>
      </main>
    );
  }

  const showBalloon = phase === "balloon" || phase === "burst";
  const isRevealed  = phase === "revealed";

  return (
    <main style={{
      minHeight: "100svh", background: t.bg, position: "relative",
      overflow: isRevealed ? "auto" : "hidden",
      display: "flex", alignItems: isRevealed ? "flex-start" : "center", justifyContent: "center",
      padding: isRevealed ? "clamp(24px,5vw,40px) 16px 48px" : "16px",
    }}>

      {mounted && <ThreeBackground explode={explode} />}
      <Confetti active={confetti} />

      {/* Color splash overlay on throw */}
      <AnimatePresence>
        {throwSplash && (
          <motion.div
            key="throwSplash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.82, 0] }}
            transition={{ duration: 0.52, times: [0, 0.28, 1] }}
            style={{
              position: "fixed", inset: 0, zIndex: 9998,
              background: `radial-gradient(circle at center, ${pichkariDef.color} 0%, ${pichkariDef.color}bb 60%, transparent 100%)`,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "min(400px,85vw)", height: "min(400px,85vw)", borderRadius: "50%",
          background: t.glow, filter: "blur(80px)", zIndex: 2, pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 520, margin: "0 auto" }}>
        <AnimatePresence mode="wait">

          {/* ── SUSPENSE ── */}
          {phase === "suspense" && (
            <motion.div key="suspense" variants={stagger} initial="initial" animate="animate" exit="exit"
              style={{ textAlign: "center", padding: "0 8px" }}
            >
              <motion.div animate={{ y: [0,-18,-6,0], rotate: [-3,3,-1,0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: "clamp(52px,14vw,72px)", lineHeight: 1, marginBottom: 16, display: "inline-block" }}>
                🎈
              </motion.div>
              <motion.h1 variants={child} style={{ fontSize: "clamp(20px,5.5vw,34px)", fontWeight: 900, color: "white", marginBottom: 12, lineHeight: 1.3 }}>
                Tumhare liye ek<br />
                <span style={{ background: t.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Secret Holi Wish
                </span>
                <br />aayi hai! 🎨
              </motion.h1>
              <motion.p variants={child} style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(14px,3.5vw,16px)", marginBottom: 28 }}>
                From: <strong style={{ color: "rgba(255,255,255,0.85)" }}>{senderName}</strong>
              </motion.p>
              <motion.div variants={child} style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i}
                    animate={{ scale: [1,1.6,1], opacity: [0.5,1,0.5] }}
                    transition={{ duration: 0.8, delay: i * 0.22, repeat: Infinity }}
                    style={{ width: 10, height: 10, borderRadius: "50%", background: HOLI_HEX[i * 2] }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ── BALLOON / BURST ── */}
          {showBalloon && (
            <motion.div key="balloon"
              initial={{ opacity: 0, scale: 0.4, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }}
              exit={{ scale: [1,1.5,0], opacity: [1,0.7,0], filter: ["blur(0px)","blur(0px)","blur(8px)"], transition: { duration: 0.44, times: [0,0.28,1] } }}
              style={{ textAlign: "center", padding: "0 8px" }}
            >
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(12px,3vw,14px)", marginBottom: "clamp(20px,5vw,36px)" }}>
                From: <strong style={{ color: "rgba(255,255,255,0.8)" }}>{senderName}</strong>
              </motion.p>
              <motion.div
                animate={phase === "balloon" ? { y: [0,-20,-8,0], rotate: [-4,4,-2,0] } : {}}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                onClick={phase === "balloon" ? handleBurst : undefined}
                style={{ cursor: phase === "balloon" ? "pointer" : "default", display: "inline-flex", flexDirection: "column", alignItems: "center", userSelect: "none", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              >
                <motion.div
                  whileHover={phase === "balloon" ? { scale: 1.07 } : {}}
                  whileTap={phase === "balloon" ? { scale: 0.91 } : {}}
                  style={{ width: "clamp(120px,36vw,160px)", height: "clamp(150px,46vw,200px)", background: t.balloon, borderRadius: "50% 50% 50% 50% / 45% 45% 55% 55%", boxShadow: `inset -20px -20px 40px rgba(0,0,0,0.2), inset 12px 12px 24px rgba(255,255,255,0.15), 0 0 50px ${t.glow}88`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <div style={{ position: "absolute", top: "14%", left: "22%", width: "25%", height: "30%", background: "rgba(255,255,255,0.22)", borderRadius: "50%", transform: "rotate(-30deg)", filter: "blur(4px)" }} />
                  <span style={{ fontSize: "clamp(30px,9vw,44px)", zIndex: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>{t.emoji}</span>
                </motion.div>
                <div style={{ width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: "16px solid rgba(0,0,0,0.45)" }} />
                <motion.div animate={{ rotate: [-3,3,-3] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: 2, height: "clamp(55px,14vw,90px)", background: "rgba(255,255,255,0.35)", borderRadius: 1, transformOrigin: "top center" }} />
              </motion.div>
              {phase === "balloon" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0,0.8,0.4,0.8] }} transition={{ duration: 1.6, delay: 0.5, repeat: Infinity }}
                  style={{ marginTop: "clamp(12px,3vw,18px)", color: "rgba(255,255,255,0.7)", fontSize: "clamp(13px,3.5vw,15px)", fontWeight: 600 }}>
                  👆 Tap to reveal!
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── SELECT PICHKARI ── */}
          {phase === "selectPichkari" && (
            <motion.div key="selectPichkari" variants={stagger} initial="initial" animate="animate" exit="exit"
              style={{ textAlign: "center", padding: "0 8px" }}
            >
              <motion.div variants={child} style={{ marginBottom: "clamp(8px,2vw,14px)" }}>
                <div style={{ fontSize: "clamp(36px,9vw,48px)", marginBottom: 8 }}>🎨</div>
                <h2 style={{ fontSize: "clamp(18px,5vw,26px)", fontWeight: 900, color: "white", marginBottom: 4 }}>
                  Apna pichkari chunno!
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(12px,3vw,14px)" }}>
                  Ek rang chuno aur wish unlock karo 🔓
                </p>
              </motion.div>

              {/* 3 realistic pichkari cards */}
              <motion.div variants={child}
                style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(8px,2vw,14px)", marginBottom: "clamp(20px,5vw,28px)" }}
              >
                {PICHKARIS.map(p => (
                  <motion.button
                    key={p.id}
                    onClick={() => setSelectedPichkari(p.id)}
                    whileTap={{ scale: 0.93 }}
                    animate={selectedPichkari === p.id ? { scale: 1.06, y: -4 } : { scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    style={{
                      padding: "clamp(12px,3vw,18px) clamp(6px,1.5vw,10px)",
                      borderRadius: 16,
                      border: `2.5px solid ${selectedPichkari === p.id ? p.color : "rgba(255,255,255,0.14)"}`,
                      background: selectedPichkari === p.id
                        ? `linear-gradient(145deg,${p.color}28,${p.color}10)`
                        : "rgba(255,255,255,0.05)",
                      boxShadow: selectedPichkari === p.id ? `0 0 30px ${p.glow}` : "none",
                      cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                      touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                      overflow: "hidden",
                    }}
                  >
                    {/* Realistic pichkari icon in card */}
                    <div style={{ overflow: "visible", transform: "scale(0.9)", transformOrigin: "center" }}>
                      <PichkariIcon
                        color={p.color}
                        fillLevel={selectedPichkari === p.id ? 88 : 0}
                        size={44}
                      />
                    </div>
                    {/* Spray animation when selected */}
                    {selectedPichkari === p.id && (
                      <motion.div
                        animate={{ x: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        style={{ position: "absolute", right: "8%", top: "38%", fontSize: "clamp(9px,2vw,11px)" }}
                      >💧</motion.div>
                    )}
                    <span style={{
                      color: selectedPichkari === p.id ? p.color : "rgba(255,255,255,0.55)",
                      fontSize: "clamp(10px,2.5vw,13px)", fontWeight: 700,
                    }}>
                      {p.label}
                    </span>
                    {selectedPichkari === p.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                        style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                    )}
                  </motion.button>
                ))}
              </motion.div>

              {/* Proceed button */}
              <motion.div variants={child}>
                <motion.button
                  onClick={handleStartFill}
                  disabled={!selectedPichkari}
                  whileHover={selectedPichkari ? { scale: 1.04 } : {}}
                  whileTap={selectedPichkari ? { scale: 0.96 } : {}}
                  style={{
                    width: "100%", padding: "clamp(14px,4vw,17px)", borderRadius: 14, border: "none",
                    background: selectedPichkari
                      ? `linear-gradient(135deg, ${pichkariDef.color}, ${pichkariDef.color}bb)`
                      : "rgba(255,255,255,0.1)",
                    color: selectedPichkari ? "white" : "rgba(255,255,255,0.3)",
                    fontSize: "clamp(14px,4vw,16px)", fontWeight: 800,
                    cursor: selectedPichkari ? "pointer" : "not-allowed",
                    letterSpacing: "-0.01em",
                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                    transition: "background 0.3s, color 0.3s",
                    boxShadow: selectedPichkari ? `0 0 24px ${pichkariDef.color}66` : "none",
                  }}
                >
                  {selectedPichkari ? `💦 ${pichkariDef.label} se Shuru Karo!` : "Pehle ek rang chuno 👆"}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* ── FILL PICHKARI (bucket is full, user fills their pichkari from it) ── */}
          {phase === "fillPichkari" && (
            <motion.div key="fillPichkari"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 24 } }}
              exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "0 8px" }}
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}
                style={{ marginBottom: "clamp(10px,3vw,16px)" }}>
                <h2 style={{ fontSize: "clamp(17px,4.5vw,22px)", fontWeight: 900, color: "white", marginBottom: 4 }}>
                  Pichkari Bharo! 💧
                </h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(11px,3vw,13px)" }}>
                  Pichkari ko bucket ke upar drag karo aur hold karo
                </p>
              </motion.div>

              {/* ── Full bucket at top (already has water — target for overlap) ── */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(8px,2vw,12px)" }}>
                <motion.div
                  ref={bucketRef}
                  animate={filling ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35, repeat: filling ? Infinity : 0 }}
                  style={{ position: "relative", width: "clamp(96px,24vw,130px)", height: "clamp(86px,22vw,116px)" }}
                >
                  {/* Handle */}
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    width: "58%", height: 13,
                    borderStyle: "solid",
                    borderWidth: "3px 3px 0 3px",
                    borderColor: filling ? pichkariDef.color : "rgba(255,255,255,0.38)",
                    borderRadius: "50% 50% 0 0",
                    transition: "border-color 0.3s",
                  }} />
                  {/* Body */}
                  <div style={{
                    width: "100%", height: "100%",
                    border: `3px solid ${filling ? pichkariDef.color : "rgba(255,255,255,0.3)"}`,
                    borderRadius: "6px 6px 18px 18px", overflow: "hidden",
                    position: "relative", background: "rgba(0,0,0,0.2)",
                    boxShadow: filling ? `0 0 28px ${pichkariDef.color}88` : `0 0 10px rgba(255,255,255,0.06)`,
                    transition: "border-color 0.3s, box-shadow 0.3s",
                  }}>
                    {/* Water — already FULL */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: `linear-gradient(to top, ${pichkariDef.color}ee 0%, ${pichkariDef.color}99 65%, ${pichkariDef.color}55 100%)`,
                    }} />
                    {/* Surface shimmer */}
                    <motion.div
                      animate={{ x: [-5, 5, -5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      style={{ position: "absolute", top: 0, left: -5, right: -5, height: 5, background: "rgba(255,255,255,0.28)", borderRadius: "50%", filter: "blur(2px)" }}
                    />
                    {/* Drip effect when filling */}
                    {filling && (
                      <motion.div
                        animate={{ y: [0, 18, 36], opacity: [1, 0.7, 0], scaleY: [0.5, 1, 1.3] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        style={{
                          position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
                          width: 6, height: 10, background: pichkariDef.color,
                          borderRadius: "50% 50% 60% 60%", filter: `drop-shadow(0 2px 4px ${pichkariDef.color})`,
                        }}
                      />
                    )}
                    {/* Bucket emoji */}
                    <div style={{
                      position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "clamp(24px,6vw,32px)", filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.6))",
                    }}>
                      🪣
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Instruction arrow (points down toward pichkari) */}
              <motion.div
                animate={{ y: filling ? 0 : [0, 6, 0], opacity: filling ? 0 : [0.5, 0.9, 0.5] }}
                transition={{ duration: 0.9, repeat: Infinity }}
                style={{ fontSize: "clamp(13px,3vw,15px)", color: "rgba(255,255,255,0.5)", marginBottom: "clamp(6px,1.5vw,10px)" }}
              >
                ⬇️ Pichkari ko yahaan drag karo
              </motion.div>

              {/* Progress bar */}
              <div style={{ margin: "0 auto clamp(6px,2vw,10px)", maxWidth: 220, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.07 }}
                  style={{ height: "100%", borderRadius: 4, background: `linear-gradient(to right, ${pichkariDef.color}, ${pichkariDef.color}88)` }}
                />
              </div>

              {/* Status text */}
              <motion.div
                animate={{ opacity: filling ? 1 : 0.5 }}
                style={{
                  marginBottom: "clamp(10px,3vw,16px)", fontSize: "clamp(11px,2.8vw,13px)",
                  color: filling ? pichkariDef.color : "rgba(255,255,255,0.35)",
                  fontWeight: 600, transition: "color 0.3s",
                }}
              >
                {filling ? "💧 Pani bhar raha hai..." : "⬆️ Bucket ke upar le jao aur hold karo"}
              </motion.div>

              {/* ── Draggable pichkari (empty → fills visually as progress rises) ── */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <motion.div
                  drag
                  dragMomentum={false}
                  dragElastic={0.05}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  animate={pichkariCtrl}
                  whileDrag={{ scale: 1.09, cursor: "grabbing" }}
                  style={{
                    cursor: "grab",
                    touchAction: "none",
                    userSelect: "none",
                    position: "relative",
                    zIndex: 50,
                    filter: filling ? `drop-shadow(0 0 14px ${pichkariDef.color})` : "none",
                    transition: "filter 0.3s",
                  }}
                >
                  <PichkariIcon color={pichkariDef.color} fillLevel={progress} size={82} />
                  {/* Water drips onto pichkari when filling */}
                  {filling && (
                    <motion.div
                      animate={{ y: [-8, 0, 0], opacity: [0, 1, 0], scaleY: [0.5, 1.2, 0.5] }}
                      transition={{ duration: 0.45, repeat: Infinity }}
                      style={{
                        position: "absolute", top: -14, left: "20%",
                        fontSize: 12, color: pichkariDef.color,
                      }}
                    >💧</motion.div>
                  )}
                </motion.div>
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }}
                style={{ color: "rgba(255,255,255,0.2)", fontSize: "clamp(10px,2.5vw,12px)", marginTop: "clamp(10px,2.5vw,14px)" }}>
                100% pe automatically next step ayega! 🎊
              </motion.p>
            </motion.div>
          )}

          {/* ── THROW COLOR ── */}
          {phase === "throwColor" && (
            <motion.div key="throwColor"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 240, damping: 22 } }}
              exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.38 } }}
              style={{ textAlign: "center", padding: "0 8px" }}
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.12 } }}>
                <div style={{ fontSize: "clamp(32px,8vw,46px)", marginBottom: 10 }}>🎯</div>
                <h2 style={{ fontSize: "clamp(18px,5vw,28px)", fontWeight: 900, color: "white", marginBottom: 6, lineHeight: 1.25 }}>
                  Pichkari Bhar Gayi!{" "}
                  <span style={{
                    background: `linear-gradient(90deg, ${pichkariDef.color}, #FBF38C, ${pichkariDef.color})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    Ab Phenko! 💥
                  </span>
                </h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(12px,3vw,14px)", marginBottom: "clamp(22px,5vw,32px)" }}>
                  Pichkari pe tap karo — rang udao aur wish dekho!
                </p>
              </motion.div>

              {/* Full pichkari — tap to throw */}
              <motion.div
                onClick={handleThrow}
                animate={{ y: [0, -16, -6, 0], rotate: [-7, 7, -3, 0] }}
                transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                whileTap={{ scale: 0.86, rotate: 25, transition: { duration: 0.15 } }}
                style={{
                  cursor: "pointer", display: "inline-flex", justifyContent: "center",
                  touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  filter: `drop-shadow(0 0 32px ${pichkariDef.color}) drop-shadow(0 0 70px ${pichkariDef.color}88)`,
                }}
              >
                <PichkariIcon color={pichkariDef.color} fillLevel={100} size={105} />
              </motion.div>

              {/* Tap prompt */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
                transition={{ duration: 1.0, repeat: Infinity }}
                style={{
                  marginTop: "clamp(24px,6vw,34px)",
                  fontSize: "clamp(15px,4vw,19px)",
                  fontWeight: 900, color: pichkariDef.color,
                  letterSpacing: "0.04em",
                  textShadow: `0 0 24px ${pichkariDef.color}, 0 0 48px ${pichkariDef.color}88`,
                }}
              >
                👆 TAP KARO — RANG PHENKO!
              </motion.div>

              {/* Color rings animation behind pichkari */}
              {[0,1,2].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                  transition={{ duration: 1.6, delay: i * 0.5, repeat: Infinity }}
                  style={{
                    position: "absolute", top: "45%", left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: 80, height: 80, borderRadius: "50%",
                    border: `3px solid ${pichkariDef.color}`,
                    pointerEvents: "none", zIndex: -1,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* ── REVEALED (top-to-bottom word-by-word) ── */}
          {phase === "revealed" && (
            <motion.div key="revealed" variants={stagger} initial="initial" animate="animate" style={{ width: "100%" }}>

              {/* Header */}
              <motion.div variants={child} style={{ textAlign: "center", marginBottom: "clamp(16px,4vw,28px)" }}>
                <motion.div animate={{ rotate: [0,18,-14,10,-8,0] }} transition={{ duration: 0.7, delay: 0.1 }}
                  style={{ fontSize: "clamp(40px,10vw,56px)", lineHeight: 1, marginBottom: 8, display: "inline-block" }}>
                  🎉
                </motion.div>
                <h2 style={{ fontSize: "clamp(20px,5vw,32px)", fontWeight: 900, color: "white", marginBottom: 4, lineHeight: 1.2 }}>
                  Wish Reveal! {t.emoji}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(13px,3vw,14px)" }}>
                  From <strong style={{ color: "rgba(255,255,255,0.85)" }}>{senderName}</strong>
                </p>
              </motion.div>

              {/* Wish card */}
              <motion.div variants={child}
                style={{
                  background: `linear-gradient(145deg,${t.glow}20 0%,rgba(255,255,255,0.06) 100%)`,
                  backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                  borderRadius: 20,
                  padding: "clamp(20px,5vw,32px) clamp(16px,4vw,28px)",
                  border: `1.5px solid ${t.glow}44`,
                  marginBottom: 16,
                  boxShadow: `0 0 50px ${t.glow}28`,
                }}
              >
                {/* Holi color bars — drop from top */}
                <div style={{ display: "flex", gap: "clamp(4px,1vw,6px)", marginBottom: 18 }}>
                  {HOLI_HEX.map((c, i) => (
                    <motion.div key={i}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 400, damping: 18 }}
                      style={{
                        flex: 1, minWidth: 0,
                        height: i % 3 === 0 ? "clamp(18px,4vw,26px)" : "clamp(14px,3vw,20px)",
                        borderRadius: "0 0 50% 50%", background: c,
                        boxShadow: `0 3px 8px ${c}88`, transformOrigin: "top center",
                      }}
                    />
                  ))}
                </div>

                {/* Wish text — word by word, naturally flows top → bottom */}
                <div style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 12,
                  padding: "clamp(14px,4vw,18px) clamp(14px,4vw,20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  lineHeight: 1.78,
                }}>
                  {/* Opening quote */}
                  <motion.span
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 22 }}
                    style={{
                      display: "inline-block", verticalAlign: "top",
                      color: `${pichkariDef.color}bb`, fontSize: "clamp(22px,5vw,28px)",
                      fontStyle: "italic", lineHeight: 1, marginRight: 5, marginTop: 2,
                    }}
                  >❝</motion.span>

                  {/* Each word animates in from above, staggered → top-to-bottom visual flow */}
                  {wishWords.map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: -16, filter: "blur(7px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: 0.48 + i * 0.07,
                        type: "spring", stiffness: 175, damping: 22,
                      }}
                      style={{
                        display: "inline-block", marginRight: "0.32em",
                        color: "white", fontSize: "clamp(15px,4vw,19px)",
                        fontWeight: 500, fontStyle: "italic",
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}

                  {/* Closing quote */}
                  <motion.span
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.48 + wishWords.length * 0.07,
                      type: "spring", stiffness: 200, damping: 22,
                    }}
                    style={{
                      display: "inline-block", verticalAlign: "bottom",
                      color: `${pichkariDef.color}bb`, fontSize: "clamp(22px,5vw,28px)",
                      fontStyle: "italic", lineHeight: 1, marginLeft: 5,
                    }}
                  >❞</motion.span>
                </div>
              </motion.div>

              {/* Happy Holi */}
              <motion.div variants={child} style={{ textAlign: "center", marginBottom: 16 }}>
                <p style={{
                  fontSize: "clamp(15px,4vw,18px)", fontWeight: 700,
                  background: "linear-gradient(90deg,#FF1461,#FF6B35,#FBF38C,#18FF92,#5A87FF,#A020F0)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  Happy Holi! 🎨🌈 Bura na mano!
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div variants={child} style={{
                background: "rgba(255,255,255,0.05)", borderRadius: 18,
                padding: "clamp(16px,4vw,20px)", border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center", marginBottom: 20,
              }}>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(13px,3vw,14px)", marginBottom: 14 }}>
                  Tumhara bhi koi secret hai? 👀
                </p>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: "block" }}>
                  <Link href="/wish" style={{
                    display: "block", padding: "clamp(13px,3.5vw,15px) 24px", borderRadius: 14,
                    background: t.gradient, color: "white", fontWeight: 800,
                    fontSize: "clamp(14px,4vw,16px)", textDecoration: "none",
                    letterSpacing: "-0.01em",
                    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
                  }}>
                    🎈 Apni Secret Wish Banao!
                  </Link>
                </motion.div>
              </motion.div>

              <motion.p variants={child} style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, paddingBottom: 16 }}>
                Bura na mano, Holi hai! 🌈
              </motion.p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
