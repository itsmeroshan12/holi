"use client";

import { useState } from "react";

const THEMES = [
 
  {
    id: "funny",
    emoji: "😂",
    label: "Funny",
    color: "#FF6B35",
    gradient: "linear-gradient(135deg, #FF6B35 0%, #FBF38C 100%)",
    balloonGrad: "linear-gradient(145deg, #FF9A6C, #F7C948)",
  },
  {
    id: "family",
    emoji: "🏠",
    label: "Family",
    color: "#18FF92",
    gradient: "linear-gradient(135deg, #18FF92 0%, #5A87FF 100%)",
    balloonGrad: "linear-gradient(145deg, #5EFFC4, #5A87FF)",
  },
  {
    id: "friends",
    emoji: "🎭",
    label: "Friends",
    color: "#A020F0",
    gradient: "linear-gradient(135deg, #A020F0 0%, #FF1461 100%)",
    balloonGrad: "linear-gradient(145deg, #C060FF, #FF1461)",
  },
   {
    id: "romantic",
    emoji: "💕",
    label: "Romantic",
    color: "#FF6B9D",
    gradient: "linear-gradient(135deg, #FF6B9D 0%, #C44B8F 100%)",
    balloonGrad: "linear-gradient(145deg, #FF8FB3, #C44B8F)",
  },
];


const MAX_WISH = 280;

export default function WishPage() {
  const [sender, setSender]   = useState("");
  const [wish, setWish]       = useState("");
  const [theme, setTheme]     = useState("romantic");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied]   = useState(false);
  const [step, setStep]       = useState("create"); // "create" | "share"
  const [error, setError]     = useState("");

  const selectedTheme = THEMES.find((t) => t.id === theme);

  const handleCreate = () => {
    if (!wish.trim()) { setError("Pehle wish toh likho! 💭"); return; }
    setError("");
    const payload = JSON.stringify({
      wish: wish.trim(),
      sender: sender.trim() || "Someone Special 🎨",
      theme,
    });
    const encoded = btoa(encodeURIComponent(payload));
    setShareUrl(`${window.location.origin}/wish/reveal?d=${encoded}`);
    setStep("share");
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const text = `${selectedTheme.emoji} Maine tumhare liye ek *Secret Holi Wish* bheji hai! 🌈\n\nClick karke reveal karo 👇\n${shareUrl}\n\nBura na mano, Holi hai! 🎉`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const reset = () => { setStep("create"); setShareUrl(""); setCopied(false); };

  /* ── Styles ── */
  const page = {
    minHeight: "100svh",
    background: "linear-gradient(145deg, #0d0520 0%, #0b1740 55%, #160824 100%)",
    position: "relative",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 16px 40px",
  };

  const card = {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    borderRadius: 20,
    padding: "clamp(20px,5vw,30px) clamp(16px,4vw,24px)",
    border: "1px solid rgba(255,255,255,0.12)",
    width: "100%",
    maxWidth: 540,
  };

  return (
    <main style={page}>
      {/* Background blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[
          { c: "#FF146155", s: 320, t: "-80px",  l: "-100px" },
          { c: "#A020F055", s: 260, t: "60%",    r: "-80px"  },
          { c: "#18FF9240", s: 200, b: "5%",     l: "5%"     },
          { c: "#5A87FF40", s: 180, t: "30%",    l: "55%"    },
        ].map((b, i) => (
          <div key={i} className="float-anim" style={{
            position: "absolute", width: b.s, height: b.s,
            borderRadius: "50%", background: b.c, filter: "blur(65px)",
            top: b.t, left: b.l, right: b.r, bottom: b.b,
            animationDelay: `${i * 0.8}s`,
          }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 540 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(18px,4vw,28px)" }}>
          <div className="float-anim" style={{ fontSize: "clamp(44px,12vw,60px)", lineHeight: 1, marginBottom: 10 }}>🎈</div>
          <h1 style={{
            fontSize: "clamp(22px, 6vw, 38px)", fontWeight: 900,
            background: "linear-gradient(90deg, #FF1461, #FF6B35, #FBF38C, #18FF92, #5A87FF, #A020F0)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            lineHeight: 1.2, marginBottom: 6, letterSpacing: "-0.02em",
          }}>
            Secret Holi Wish
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(13px,3.5vw,15px)" }}>
            Ek secret wish bhejo — friend tap karke reveal karega! 🎨
          </p>
        </div>

        {step === "create" ? (
          <div style={card} className="slide-up">

            {/* Sender name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                👤 Tumhara naam (optional)
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value.slice(0, 30))}
                placeholder="e.g. Rahul, Didi, Your Secret Admirer..."
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)", color: "white",
                  fontSize: 16, outline: "none",
                  /* prevent iOS auto-zoom on focus (needs 16px) */
                }}
              />
            </div>

            {/* Wish textarea */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                💭 Apni secret Holi wish likho
              </label>
              <div style={{ position: "relative" }}>
                <textarea
                  value={wish}
                  onChange={(e) => setWish(e.target.value.slice(0, MAX_WISH))}
                  placeholder="e.g. Is Holi pe tumhare saath rang khelna chahta/chahti hoon... 🌈"
                  rows={4}
                  style={{
                    width: "100%", padding: "13px 16px", borderRadius: 12,
                    border: "1.5px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.08)", color: "white",
                    fontSize: 16, outline: "none", resize: "none",
                    fontFamily: "inherit",
                    /* 16px prevents iOS auto-zoom */
                  }}
                />
                <span style={{
                  position: "absolute", bottom: 10, right: 12,
                  fontSize: 11, color: wish.length > MAX_WISH * 0.85 ? "#FF6B35" : "rgba(255,255,255,0.3)",
                }}>
                  {wish.length}/{MAX_WISH}
                </span>
              </div>
            </div>

            {/* Theme selector */}
            <div style={{ marginBottom: 26 }}>
              <label style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 12 }}>
                🎨 Wish ka vibe kya hai?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    style={{
                      padding: "12px 6px",
                      borderRadius: 12,
                      border: `2px solid ${theme === t.id ? t.color : "rgba(255,255,255,0.15)"}`,
                      background: theme === t.id ? t.gradient : "rgba(255,255,255,0.05)",
                      color: "white",
                      cursor: "pointer",
                      textAlign: "center",
                      transform: theme === t.id ? "scale(1.05)" : "scale(1)",
                      transition: "all 0.22s",
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{t.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Create button */}
            <button
              onClick={handleCreate}
              style={{
                width: "100%", padding: 16, borderRadius: 14, border: "none",
                background: selectedTheme.gradient,
                color: "white", fontSize: 17, fontWeight: 800,
                cursor: "pointer", letterSpacing: "-0.01em",
              }}
            >
              ✨ Secret Link Banao!
            </button>

            {error && (
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 10,
                background: "rgba(255,20,97,0.18)", color: "#FF8AB0", fontSize: 14, textAlign: "center",
              }}>
                {error}
              </div>
            )}
          </div>
        ) : (
          /* ── Share step ── */
          <div style={card} className="reveal-anim">
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
              <div style={{ color: "#FBF38C", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
                Secret Wish Ready hai!
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                Yeh link apne friend ko bhejo 👇
              </div>
            </div>

            {/* URL preview */}
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, padding: "10px 14px",
              marginBottom: 14, fontSize: 12, color: "rgba(255,255,255,0.4)",
              wordBreak: "break-all", fontFamily: "monospace",
            }}>
              {shareUrl.length > 80 ? shareUrl.slice(0, 80) + "…" : shareUrl}
            </div>

            {/* WhatsApp */}
            <button onClick={shareWhatsApp} style={{
              width: "100%", padding: 14, borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #25D366, #128C7E)",
              color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10,
            }}>
              📲 WhatsApp pe Bhejo!
            </button>

            {/* Copy link */}
            <button onClick={copyLink} style={{
              width: "100%", padding: 14, borderRadius: 12,
              border: `1.5px solid ${copied ? "rgba(24,255,146,0.5)" : "rgba(255,255,255,0.22)"}`,
              background: copied ? "rgba(24,255,146,0.12)" : "rgba(255,255,255,0.07)",
              color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer",
              transition: "all 0.25s", marginBottom: 14,
            }}>
              {copied ? "✅ Link Copy Ho Gaya!" : "🔗 Link Copy Karo"}
            </button>

            <button onClick={reset} style={{
              width: "100%", padding: 12, borderRadius: 12, border: "none",
              background: "transparent", color: "rgba(255,255,255,0.4)",
              fontSize: 14, cursor: "pointer",
            }}>
              ← Nayi wish banao
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 24 }}>
          Bura na mano, Holi hai! 🌈
        </p>
      </div>
    </main>
  );
}
