"use client";

import { useState, useEffect, useCallback } from "react";
import { AVATARS } from "./avatarData";
import { AvatarPreview } from "./PixelAvatar";

interface JoinPublicRoomModalProps {
  onBack: () => void;
  onJoin: (username: string, avatarId: string) => void;
}

export function JoinPublicRoomModal({ onBack, onJoin }: JoinPublicRoomModalProps) {
  const [visible, setVisible] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [webcamActive, setWebcamActive] = useState(false);
  const [joining, setJoining] = useState(false);
  const [webcamError, setWebcamError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const prevAvatar = useCallback(() => {
    setAvatarIndex(i => (i - 1 + AVATARS.length) % AVATARS.length);
  }, []);
  const nextAvatar = useCallback(() => {
    setAvatarIndex(i => (i + 1) % AVATARS.length);
  }, []);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevAvatar();
      if (e.key === "ArrowRight") nextAvatar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prevAvatar, nextAvatar]);

  const handleJoin = () => {
    if (!username.trim()) { setError("Please enter a username."); return; }
    if (username.trim().length < 2) { setError("Username must be at least 2 characters."); return; }
    if (username.trim().length > 16) { setError("Username must be 16 characters or less."); return; }
    setError("");
    setJoining(true);
    setTimeout(() => onJoin(username.trim(), AVATARS[avatarIndex].id), 800);
  };

  const handleWebcam = async () => {
    if (webcamActive) { setWebcamActive(false); return; }
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setWebcamActive(true);
      setWebcamError("");
    } catch {
      setWebcamError("Camera access denied.");
    }
  };

  const avatar = AVATARS[avatarIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,16,12,0.55)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="relative w-[400px] transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
        }}
      >
        {/* Pixel card */}
        <div
          style={{
            background: "#f4f0e8",
            border: "3px solid #1a0a2e",
            boxShadow: "6px 6px 0 #1a0a2e",
            position: "relative",
          }}
        >
          {/* Corner pixels */}
          {["top-0 left-0","top-0 right-0","bottom-0 left-0","bottom-0 right-0"].map(pos => (
            <div key={pos} className={`absolute ${pos} w-3 h-3 bg-[#1a0a2e]`} />
          ))}

          {/* Header */}
          <div
            className="relative px-6 py-3 flex items-center gap-3"
            style={{ background: "linear-gradient(180deg,#4a8a3c,#3a7a2c)", borderBottom: "3px solid #1a0a2e" }}
          >
            {/* Back button */}
            <button
              onClick={onBack}
              className="flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                color: "rgba(255,255,255,0.85)",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              ← BACK
            </button>
            <div className="flex-1 text-center">
              <span
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#fff", textShadow: "2px 2px 0 #1a3a10", letterSpacing: "0.05em" }}
              >
                JOIN PUBLIC ROOM
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-6">
            {/* Subtitle */}
            <p
              className="text-center mb-5"
              style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: "#6a5a4a", fontWeight: 700, lineHeight: 1.6 }}
            >
              Public rooms are open to everyone.<br />Pick your avatar and jump in!
            </p>

            {/* Avatar carousel */}
            <div className="flex items-center gap-3 mb-5">
              {/* Prev button */}
              <CarouselButton onClick={prevAvatar} label="◀" />

              {/* Avatar display */}
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="relative flex items-center justify-center mb-2 transition-all duration-200"
                  style={{
                    width: 140,
                    height: 140,
                    background: "linear-gradient(135deg, #e8f0e8 0%, #d0e8d0 100%)",
                    border: "3px solid #1a0a2e",
                    boxShadow: "3px 3px 0 #1a0a2e",
                    imageRendering: "pixelated",
                  }}
                >
                  {/* Checkerboard floor */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-6 opacity-20"
                    style={{
                      backgroundImage: "linear-gradient(45deg,#1a0a2e 25%,transparent 25%),linear-gradient(-45deg,#1a0a2e 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a0a2e 75%),linear-gradient(-45deg,transparent 75%,#1a0a2e 75%)",
                      backgroundSize: "8px 8px",
                      backgroundPosition: "0 0,0 4px,4px -4px,-4px 0",
                    }}
                  />
                  <AvatarPreview avatar={avatar} size={120} />

                  {/* Avatar name badge */}
                  <div
                    className="absolute bottom-2 left-0 right-0 text-center"
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: 7,
                      color: "#1a0a2e",
                      textShadow: "none",
                    }}
                  >
                  </div>
                </div>

                {/* Avatar name + dots */}
                <div
                  className="mb-2"
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#1a0a2e" }}
                >
                  {avatar.name.toUpperCase()}
                </div>
                <div className="flex gap-1.5">
                  {AVATARS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setAvatarIndex(i)}
                      style={{
                        width: i === avatarIndex ? 10 : 6,
                        height: 6,
                        background: i === avatarIndex ? "#4a8a3c" : "#c8b8a8",
                        border: "1px solid #1a0a2e",
                        cursor: "pointer",
                        padding: 0,
                        transition: "width 0.15s",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Next button */}
              <CarouselButton onClick={nextAvatar} label="▶" />
            </div>

            {/* Username input */}
            <div className="mb-1">
              <label
                htmlFor="username"
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#5a4a3a", display: "block", marginBottom: 6, letterSpacing: "0.05em" }}
              >
                USERNAME
              </label>
              <input
                id="username"
                type="text"
                value={username}
                maxLength={16}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                onKeyDown={e => { if (e.key === "Enter") handleJoin(); e.stopPropagation(); }}
                placeholder="Enter your name..."
                style={{
                  width: "100%",
                  background: "#fff",
                  border: "2px solid #1a0a2e",
                  padding: "10px 12px",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#1a0a2e",
                  outline: "none",
                  boxShadow: "2px 2px 0 #1a0a2e",
                }}
              />
              {error && (
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#c03030", marginTop: 4 }}>
                  ⚠ {error}
                </p>
              )}
            </div>

            {/* Char count */}
            <p
              className="text-right mb-4"
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#9a8a7a" }}
            >
              {username.length}/16
            </p>

            {/* Join button */}
            <JoinButton onClick={handleJoin} loading={joining} />

            {/* Webcam button */}
            <div className="mt-3">
              <button
                onClick={handleWebcam}
                style={{
                  width: "100%",
                  background: webcamActive ? "#c03030" : "transparent",
                  border: "2px solid #1a0a2e",
                  padding: "10px",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 8,
                  color: webcamActive ? "#fff" : "#5a4a3a",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s",
                }}
              >
                <span>{webcamActive ? "📷" : "📷"}</span>
                <span>{webcamActive ? "STOP WEBCAM" : "START WEBCAM"}</span>
              </button>
              {webcamError && (
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#c03030", marginTop: 4, textAlign: "center" }}>
                  {webcamError}
                </p>
              )}
              {webcamActive && (
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#4a8a3c", marginTop: 4, textAlign: "center" }}>
                  ● WEBCAM ACTIVE
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CarouselButton({ onClick, label }: { onClick: () => void; label: string }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: 32,
        height: 32,
        background: "#4a8a3c",
        border: "2px solid #1a0a2e",
        color: "#fff",
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 8,
        cursor: "pointer",
        flexShrink: 0,
        transform: pressed ? "translate(2px,2px)" : "none",
        boxShadow: pressed ? "1px 1px 0 #1a0a2e" : "2px 2px 0 #1a0a2e",
        transition: "transform 0.08s, box-shadow 0.08s",
      }}
    >
      {label}
    </button>
  );
}

function JoinButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: "100%",
        background: loading ? "#6aaa5a" : hovered ? "#5aaa48" : "#4a8a3c",
        border: "2px solid #1a0a2e",
        color: "#fff",
        padding: "13px",
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 9,
        letterSpacing: "0.05em",
        cursor: loading ? "not-allowed" : "pointer",
        transform: pressed ? "translate(3px,3px)" : hovered ? "translate(-1px,-1px)" : "none",
        boxShadow: pressed
          ? "1px 1px 0 #2a5a1c"
          : hovered
          ? "4px 4px 0 #2a5a1c"
          : "3px 3px 0 #2a5a1c",
        transition: "all 0.08s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {loading ? (
        <LoadingDots />
      ) : (
        "▶  JOIN ROOM"
      )}
    </button>
  );
}

function LoadingDots() {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setDot(d => (d + 1) % 4), 300);
    return () => clearInterval(iv);
  }, []);
  return (
    <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9 }}>
      JOINING{"...".slice(0, dot + 1)}
    </span>
  );
}
