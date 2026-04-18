"use client";

import { useState, useEffect } from "react";
import { GameBackground } from "@/components/lobby/GameBackground";
import { WelcomeModal } from "@/components/lobby/WelcomeModal";
import { JoinPublicRoomModal } from "@/components/lobby/JoinPublicRoomModal";
import { JoinCustomRoomModal } from "@/components/lobby/JoinCustomRoomModal";

type Screen = "welcome" | "public" | "custom" | "loading" | "joined";

interface JoinedState {
  username: string;
  roomCode: string;
  avatarId: string;
}

export default function LobbyPage() {
  const [screen, setScreen]   = useState<Screen>("welcome");
  const [joined, setJoined]   = useState<JoinedState | null>(null);
  const [dots, setDots]       = useState(0);

  // Loading dots animation
  useEffect(() => {
    if (screen !== "loading") return;
    const iv = setInterval(() => setDots(d => (d + 1) % 4), 350);
    return () => clearInterval(iv);
  }, [screen]);

  const handleJoinPublic = (username: string, avatarId: string) => {
    setJoined({ username, avatarId, roomCode: "PUBLIC" });
    setScreen("loading");
    setTimeout(() => setScreen("joined"), 1800);
  };

  const handleJoinCustom = (username: string, roomCode: string, avatarId: string) => {
    setJoined({ username, avatarId, roomCode });
    setScreen("loading");
    setTimeout(() => setScreen("joined"), 1800);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#5aaa48]">
      {/* Animated pixel art village background */}
      <GameBackground />

      {/* Modal layer */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {screen === "welcome" && (
          <WelcomeModal
            onJoinPublic={() => setScreen("public")}
            onJoinCustom={() => setScreen("custom")}
          />
        )}

        {screen === "public" && (
          <JoinPublicRoomModal
            onBack={() => setScreen("welcome")}
            onJoin={handleJoinPublic}
          />
        )}

        {screen === "custom" && (
          <JoinCustomRoomModal
            onBack={() => setScreen("welcome")}
            onJoin={handleJoinCustom}
          />
        )}

        {screen === "loading" && joined && (
          <LoadingScreen username={joined.username} roomCode={joined.roomCode} dots={dots} />
        )}

        {screen === "joined" && joined && (
          <JoinedScreen
            username={joined.username}
            roomCode={joined.roomCode}
            onLeave={() => setScreen("welcome")}
          />
        )}
      </div>
    </main>
  );
}

// ── Loading screen ──────────────────────────────────────────────────────────
function LoadingScreen({ username, roomCode, dots }: { username: string; roomCode: string; dots: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,16,12,0.72)", backdropFilter: "blur(3px)" }}>
      <div
        style={{
          background: "#f4f0e8",
          border: "3px solid #1a0a2e",
          boxShadow: "6px 6px 0 #1a0a2e",
          padding: "40px 60px",
          textAlign: "center",
          minWidth: 300,
        }}
      >
        <div className="flex justify-center mb-6">
          <PixelSpinner />
        </div>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#1a0a2e", marginBottom: 8, letterSpacing: "0.05em" }}>
          JOINING{["", ".", "..", "..."][dots]}
        </p>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#5a4a3a", marginBottom: 4 }}>
          Welcome, {username.toUpperCase()}
        </p>
        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#8a7a6a" }}>
          ROOM: {roomCode}
        </p>
      </div>
    </div>
  );
}

function PixelSpinner() {
  const [r, setR] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setR(v => (v + 45) % 360), 100);
    return () => clearInterval(iv);
  }, []);
  const positions = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" style={{ imageRendering: "pixelated" }}>
      {positions.map((angle, i) => {
        const rad = ((angle + r) * Math.PI) / 180;
        const x = 24 + Math.cos(rad) * 16 - 4;
        const y = 24 + Math.sin(rad) * 16 - 4;
        const opacity = 0.2 + (i / positions.length) * 0.8;
        return <rect key={angle} x={x} y={y} width={8} height={8} fill="#4a8a3c" opacity={opacity} rx={1} />;
      })}
    </svg>
  );
}

// ── Joined/in-room screen ───────────────────────────────────────────────────
function JoinedScreen({ username, roomCode, onLeave }: { username: string; roomCode: string; onLeave: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(10,16,12,0.65)", backdropFilter: "blur(2px)" }}>
      <div
        style={{
          background: "#f4f0e8",
          border: "3px solid #1a0a2e",
          boxShadow: "6px 6px 0 #1a0a2e",
          padding: "0 0 24px",
          minWidth: 340,
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(180deg,#4a8a3c,#3a7a2c)", borderBottom: "3px solid #1a0a2e", padding: "16px 24px" }}>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#fff", textShadow: "2px 2px 0 #1a3a10" }}>
            YOU'RE IN!
          </p>
        </div>
        <div className="px-8 pt-6">
          <div style={{ width: 60, height: 60, background: "#d0e8d0", border: "2px solid #4a8a3c", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 32 }}>🎉</span>
          </div>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#1a0a2e", marginBottom: 6 }}>
            {username.toUpperCase()}
          </p>
          <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#5a4a3a", marginBottom: 4 }}>
            ROOM: {roomCode}
          </p>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "#6a5a4a", fontWeight: 700, margin: "16px 0" }}>
            You've joined the village! Walk around using WASD and press E to interact with objects and NPCs.
          </p>

          {/* Status badges */}
          <div className="flex justify-center gap-3 mb-6">
            {[
              { icon: "👥", label: "4 ONLINE" },
              { icon: "🔥", label: "CAMPFIRE LIT" },
              { icon: "⚡", label: "8ms PING" },
            ].map(b => (
              <div
                key={b.label}
                style={{
                  background: "#e8e0d0",
                  border: "2px solid #1a0a2e",
                  padding: "6px 10px",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <span style={{ fontSize: 12 }}>{b.icon}</span>
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#1a0a2e" }}>{b.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onLeave}
            style={{
              width: "100%",
              background: "#c03030",
              border: "2px solid #1a0a2e",
              color: "#fff",
              padding: "12px",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              cursor: "pointer",
              boxShadow: "3px 3px 0 #801010",
            }}
          >
            ← LEAVE ROOM
          </button>
        </div>
      </div>
    </div>
  );
}
