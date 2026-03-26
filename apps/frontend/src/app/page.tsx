"use client";

import { useEffect, useRef, useState } from "react";

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onJoin }: { onJoin: (name: string, spaceId: string) => void }) {
  const [name, setName] = useState("");
  const [space, setSpace] = useState("space_1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onJoin(name.trim(), space.trim() || "space_1");
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 60% 40%, #1e1b4b 0%, #0f172a 60%)",
      }}
    >
      {/* Ambient glow blobs */}
      <div style={{
        position: "absolute", top: "15%", left: "20%",
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "15%",
        width: 300, height: 300,
        background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />

      <div
        className="glass fade-up"
        style={{ width: "100%", maxWidth: 420, padding: "2.5rem" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 68, height: 68, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            margin: "0 auto 1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, boxShadow: "0 0 30px rgba(99,102,241,0.5)"
          }}>⚡</div>
          <h1 style={{
            fontSize: "1.75rem", fontWeight: 800,
            background: "linear-gradient(90deg, #818cf8, #22d3ee)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "0.25rem"
          }}>ZEP Metaverse</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Enter your name and join the office
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
              Display Name
            </label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Bharat"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: 6 }}>
              Space ID
            </label>
            <input
              className="input"
              type="text"
              placeholder="e.g. space_1"
              value={space}
              onChange={e => setSpace(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: "0.5rem", width: "100%", height: 48 }}
          >
            🚀 Enter Metaverse
          </button>
        </form>

        {/* Footer hint */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#475569", fontSize: "0.78rem" }}>
          Use <kbd style={{
            background:"#1e293b", padding:"1px 6px", borderRadius:4,
            border:"1px solid #334155", color:"#94a3b8"
          }}>W A S D</kbd> or <kbd style={{
            background:"#1e293b", padding:"1px 6px", borderRadius:4,
            border:"1px solid #334155", color:"#94a3b8"
          }}>↑ ↓ ← →</kbd> to move
        </p>
      </div>
    </div>
  );
}

// ── Game HUD ──────────────────────────────────────────────────────────────────
function GameHUD({ name, spaceId }: { name: string; spaceId: string }) {
  return (
    <>
      {/* Top bar */}
      <div
        id="hud"
        className="glass"
        style={{ display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.5rem 1.25rem", borderRadius: 9999 }}
      >
        <span style={{ position: "relative", display: "inline-flex" }}>
          <span className="dot" style={{
            width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
            display: "block", position: "relative", zIndex: 1
          }} />
          <span className="ping" style={{
            position: "absolute", inset: 0, borderRadius: "50%", background: "#22c55e", opacity: 0.3
          }} />
        </span>
        <span id="hud-text" style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: 500 }}>
          🌐 {name} · Space: {spaceId}
        </span>
        <span style={{
          fontSize: "0.72rem", background:"rgba(99,102,241,0.2)",
          color:"#818cf8", borderRadius:9999, padding:"2px 10px"
        }}>LIVE</span>
      </div>

      {/* Proximity toast */}
      <div id="proximity-toast" />

      {/* Controls */}
      <div id="controls" className="glass" style={{ padding: "0.6rem 0.9rem", borderRadius: 12 }}>
        <div style={{ color: "#64748b", fontSize: "0.72rem", lineHeight: 1.8 }}>
          <div>🕹️ <b style={{color:"#94a3b8"}}>WASD / Arrows</b> – Move</div>
          <div>👥 <b style={{color:"#94a3b8"}}>Proximity</b> – Auto-detect</div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [joined, setJoined] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [spaceId, setSpaceId] = useState("space_1");
  const gameRef = useRef<any>(null);

  const handleJoin = (name: string, sid: string) => {
    setPlayerName(name);
    setSpaceId(sid);
    setJoined(true);
  };

  useEffect(() => {
    if (!joined) return;

    let game: any;

    // Dynamic import so Phaser doesn't run on server
    import("phaser").then((PhaserModule) => {
      const Phaser = PhaserModule;
      return import("../phaser/GameScene").then(({ PreloadScene, GameScene }) => {
        if (gameRef.current) return; // already mounted

        const config = {
          type: Phaser.AUTO,
          parent: "game-container",
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: "#0f172a",
          scene: [PreloadScene, GameScene],
          physics: { default: "arcade", arcade: { debug: false } },
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
        };

        game = new Phaser.Game(config);
        gameRef.current = game;

        // Once the game boots, restart GameScene with player data
        game.events.once("ready", () => {
          const gs = game.scene.getScene("GameScene");
          if (gs) gs.scene.restart({ name: playerName, spaceId });
        });


        // Remove the step-hook to avoid duplicate restarts
      });
    });


    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [joined, playerName, spaceId]);

  if (!joined) return <LoginScreen onJoin={handleJoin} />;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0f172a", overflow: "hidden" }}>
      <GameHUD name={playerName} spaceId={spaceId} />
      <div id="game-container" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
