"use client";

import { useState, useEffect } from "react";

interface WelcomeModalProps {
  onJoinPublic: () => void;
  onJoinCustom: () => void;
}

export function WelcomeModal({ onJoinPublic, onJoinCustom }: WelcomeModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,16,12,0.55)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="relative w-[420px] transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
        }}
      >
        {/* Pixel border card */}
        <div
          className="relative"
          style={{
            background: "#f4f0e8",
            border: "3px solid #1a0a2e",
            boxShadow: "6px 6px 0 #1a0a2e, inset 0 0 0 1px rgba(255,255,255,0.6)",
            imageRendering: "pixelated",
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-[#1a0a2e]" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-[#1a0a2e]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#1a0a2e]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#1a0a2e]" />

          {/* Header strip */}
          <div
            className="px-6 py-4 text-center border-b-3"
            style={{
              background: "linear-gradient(180deg, #4a8a3c 0%, #3a7a2c 100%)",
              borderBottom: "3px solid #1a0a2e",
            }}
          >
            {/* Pixel logo */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <PixelLeaf />
              <span
                className="text-white tracking-[0.15em] text-lg"
                style={{ fontFamily: "'Press Start 2P', monospace", textShadow: "2px 2px 0 #1a3a10" }}
              >
                VORTEX
              </span>
              <PixelLeaf flip />
            </div>
            <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em" }}>
              METAVERSE
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <h1
              className="text-center text-[#1a0a2e] mb-2"
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, lineHeight: 1.8, letterSpacing: "0.05em" }}
            >
              WELCOME
            </h1>
            <p
              className="text-center mb-8"
              style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#5a4a3a", fontWeight: 700, lineHeight: 1.6 }}
            >
              Choose how you'd like to enter the village.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <PixelButton
                label="▶  JOIN PUBLIC ROOM"
                color="#4a8a3c"
                hoverColor="#5aaa48"
                shadowColor="#2a5a1c"
                textColor="#fff"
                onClick={onJoinPublic}
              />
              <PixelButton
                label="⚙  JOIN / CREATE ROOM"
                color="#3060a0"
                hoverColor="#4070b0"
                shadowColor="#1a3a70"
                textColor="#fff"
                onClick={onJoinCustom}
              />
            </div>

            {/* Footer hint */}
            <p
              className="text-center mt-6"
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#9a8a7a", letterSpacing: "0.08em", lineHeight: 1.8 }}
            >
              WASD TO MOVE · E TO INTERACT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PixelButton({
  label, color, hoverColor, shadowColor, textColor, onClick,
}: {
  label: string; color: string; hoverColor: string; shadowColor: string; textColor: string; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 9,
        letterSpacing: "0.05em",
        background: hovered ? hoverColor : color,
        color: textColor,
        border: "2px solid #1a0a2e",
        padding: "14px 20px",
        cursor: "pointer",
        width: "100%",
        textAlign: "center",
        transform: pressed ? "translate(3px,3px)" : hovered ? "translate(-1px,-1px)" : "none",
        boxShadow: pressed
          ? "1px 1px 0 #1a0a2e"
          : hovered
          ? `4px 4px 0 ${shadowColor}`
          : `3px 3px 0 ${shadowColor}`,
        transition: "background 0.1s, box-shadow 0.08s, transform 0.08s",
        imageRendering: "pixelated",
      }}
    >
      {label}
    </button>
  );
}

function PixelLeaf({ flip = false }: { flip?: boolean }) {
  return (
    <svg width={16} height={16} viewBox="0 0 8 8" style={{ imageRendering: "pixelated", transform: flip ? "scaleX(-1)" : undefined }}>
      <rect x={4} y={1} width={2} height={2} fill="#90e070" />
      <rect x={3} y={2} width={3} height={2} fill="#68c055" />
      <rect x={2} y={3} width={4} height={2} fill="#4a9a38" />
      <rect x={3} y={5} width={2} height={2} fill="#3a7a28" />
    </svg>
  );
}
