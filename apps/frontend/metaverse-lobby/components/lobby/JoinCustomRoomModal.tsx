"use client";

import { useState, useEffect } from "react";
import { AVATARS } from "./avatarData";
import { AvatarPreview } from "./PixelAvatar";

interface JoinCustomRoomModalProps {
  onBack: () => void;
  onJoin: (username: string, roomCode: string, avatarId: string) => void;
}

type TabType = "join" | "create";

const ROOM_THEMES = [
  { id: "village",  label: "Village",  emoji: "🏡", color: "#4a8a3c" },
  { id: "office",   label: "Office",   emoji: "🏢", color: "#3060a0" },
  { id: "arena",    label: "Arena",    emoji: "⚔️",  color: "#c03030" },
  { id: "lounge",   label: "Lounge",   emoji: "🎵", color: "#7030a0" },
];

export function JoinCustomRoomModal({ onBack, onJoin }: JoinCustomRoomModalProps) {
  const [visible, setVisible]       = useState(false);
  const [tab, setTab]               = useState<TabType>("join");
  const [username, setUsername]     = useState("");
  const [roomCode, setRoomCode]     = useState("");
  const [roomName, setRoomName]     = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [isPrivate, setIsPrivate]   = useState(false);
  const [theme, setTheme]           = useState("village");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [created, setCreated]       = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const handleJoin = () => {
    if (!username.trim())   { setError("Enter your username."); return; }
    if (!roomCode.trim())   { setError("Enter a room code."); return; }
    if (roomCode.trim().length !== 6) { setError("Room code must be 6 characters."); return; }
    setError(""); setLoading(true);
    setTimeout(() => onJoin(username.trim(), roomCode.trim().toUpperCase(), AVATARS[avatarIndex].id), 900);
  };

  const handleCreate = () => {
    if (!username.trim()) { setError("Enter your username."); return; }
    if (!roomName.trim()) { setError("Enter a room name."); return; }
    setError(""); setLoading(true);
    const code = generateCode();
    setTimeout(() => { setCreated(code); setLoading(false); }, 700);
  };

  const handleEnterCreated = () => {
    if (created) onJoin(username.trim(), created, AVATARS[avatarIndex].id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,16,12,0.55)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="relative w-[460px] transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
        }}
      >
        <div
          style={{
            background: "#f4f0e8",
            border: "3px solid #1a0a2e",
            boxShadow: "6px 6px 0 #1a0a2e",
            position: "relative",
          }}
        >
          {["top-0 left-0","top-0 right-0","bottom-0 left-0","bottom-0 right-0"].map(pos => (
            <div key={pos} className={`absolute ${pos} w-3 h-3 bg-[#1a0a2e]`} />
          ))}

          {/* Header */}
          <div
            className="px-5 py-3 flex items-center gap-3"
            style={{ background: "linear-gradient(180deg,#3060a0,#2050a0)", borderBottom: "3px solid #1a0a2e" }}
          >
            <button
              onClick={onBack}
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                color: "rgba(255,255,255,0.85)", background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.3)", padding: "4px 8px", cursor: "pointer",
              }}
            >
              ← BACK
            </button>
            <span
              className="flex-1 text-center"
              style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#fff", textShadow: "2px 2px 0 #102060", letterSpacing: "0.04em" }}
            >
              CUSTOM ROOM
            </span>
          </div>

          {/* Tab bar */}
          <div className="flex" style={{ borderBottom: "3px solid #1a0a2e" }}>
            {(["join","create"] as TabType[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setCreated(null); }}
                style={{
                  flex: 1,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 7,
                  padding: "10px 0",
                  background: tab === t ? "#fff" : "#e8e0d0",
                  borderRight: t === "join" ? "2px solid #1a0a2e" : "none",
                  color: tab === t ? "#1a0a2e" : "#7a6a5a",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  borderBottom: tab === t ? "3px solid #fff" : "none",
                  marginBottom: tab === t ? -3 : 0,
                  zIndex: tab === t ? 2 : 1,
                  position: "relative",
                  transition: "all 0.1s",
                }}
              >
                {t === "join" ? "JOIN ROOM" : "CREATE ROOM"}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="px-7 py-6">
            {/* Avatar mini-picker */}
            <div className="flex items-center gap-4 mb-5 p-3" style={{ background: "#ece8e0", border: "2px solid #1a0a2e" }}>
              <div
                style={{
                  width: 72, height: 72, background: "linear-gradient(135deg,#e0e8e0,#c8d8c8)",
                  border: "2px solid #1a0a2e", display: "flex", alignItems: "center", justifyContent: "center",
                  imageRendering: "pixelated", flexShrink: 0,
                }}
              >
                <AvatarPreview avatar={AVATARS[avatarIndex]} size={64} />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#5a4a3a", marginBottom: 8 }}>
                  AVATAR
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {AVATARS.map((av, i) => (
                    <button
                      key={av.id}
                      onClick={() => setAvatarIndex(i)}
                      title={av.name}
                      style={{
                        width: 20, height: 20,
                        background: i === avatarIndex ? av.colors.shirt : av.colors.hair,
                        border: i === avatarIndex ? "2px solid #1a0a2e" : "1px solid #8a7a6a",
                        cursor: "pointer",
                        boxShadow: i === avatarIndex ? "1px 1px 0 #1a0a2e" : "none",
                        transition: "transform 0.1s",
                        transform: i === avatarIndex ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#1a0a2e", marginTop: 6 }}>
                  {AVATARS[avatarIndex].name}
                </p>
              </div>
            </div>

            {/* Username always visible */}
            <InputField
              label="USERNAME"
              value={username}
              onChange={v => { setUsername(v); setError(""); }}
              placeholder="Your name..."
              maxLength={16}
            />

            {tab === "join" ? (
              /* JOIN TAB */
              <>
                <div className="mb-4 mt-4">
                  <InputField
                    label="ROOM CODE"
                    value={roomCode}
                    onChange={v => { setRoomCode(v.toUpperCase().slice(0, 6)); setError(""); }}
                    placeholder="e.g. ABC123"
                    maxLength={6}
                    mono
                  />
                </div>
                {error && <ErrorMsg text={error} />}
                <ActionButton
                  label="▶  JOIN ROOM"
                  loading={loading}
                  color="#3060a0"
                  shadowColor="#1a3a70"
                  onClick={handleJoin}
                />
              </>
            ) : (
              /* CREATE TAB */
              created ? (
                /* Room created! */
                <div className="mt-4">
                  <div
                    className="text-center p-5 mb-4"
                    style={{ background: "#e0f0e0", border: "2px solid #4a8a3c" }}
                  >
                    <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#4a8a3c", marginBottom: 8 }}>
                      ROOM CREATED!
                    </p>
                    <div
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: 20,
                        color: "#1a0a2e",
                        letterSpacing: "0.25em",
                        background: "#fff",
                        border: "2px solid #1a0a2e",
                        padding: "12px 20px",
                        margin: "8px 0",
                        boxShadow: "2px 2px 0 #1a0a2e",
                      }}
                    >
                      {created}
                    </div>
                    <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#6a8a6a", marginTop: 4 }}>
                      Share this code with friends
                    </p>
                  </div>
                  <ActionButton label="▶  ENTER ROOM" loading={false} color="#4a8a3c" shadowColor="#2a5a1c" onClick={handleEnterCreated} />
                </div>
              ) : (
                /* Create form */
                <div className="mt-4">
                  <InputField
                    label="ROOM NAME"
                    value={roomName}
                    onChange={v => { setRoomName(v); setError(""); }}
                    placeholder="My Village Room"
                    maxLength={24}
                  />

                  {/* Theme picker */}
                  <div className="mb-4 mt-4">
                    <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#5a4a3a", marginBottom: 6 }}>
                      THEME
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {ROOM_THEMES.map(th => (
                        <button
                          key={th.id}
                          onClick={() => setTheme(th.id)}
                          style={{
                            padding: "8px 4px",
                            background: theme === th.id ? th.color : "#ece8e0",
                            border: `2px solid ${theme === th.id ? "#1a0a2e" : "#c8b8a8"}`,
                            color: theme === th.id ? "#fff" : "#5a4a3a",
                            cursor: "pointer",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                            boxShadow: theme === th.id ? "2px 2px 0 #1a0a2e" : "none",
                            transition: "all 0.1s",
                          }}
                        >
                          <span style={{ fontSize: 16 }}>{th.emoji}</span>
                          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 5 }}>{th.label.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max players + private */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#5a4a3a", marginBottom: 4 }}>MAX PLAYERS</p>
                      <div className="flex items-center gap-2">
                        <StepButton onClick={() => setMaxPlayers(v => Math.max(2, v - 1))} label="−" />
                        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#1a0a2e", minWidth: 24, textAlign: "center" }}>
                          {maxPlayers}
                        </span>
                        <StepButton onClick={() => setMaxPlayers(v => Math.min(50, v + 1))} label="+" />
                      </div>
                    </div>
                    <div className="flex items-end pb-1">
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#5a4a3a" }}
                      >
                        <div
                          onClick={() => setIsPrivate(v => !v)}
                          style={{
                            width: 16, height: 16,
                            border: "2px solid #1a0a2e",
                            background: isPrivate ? "#3060a0" : "#fff",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: 10,
                          }}
                        >
                          {isPrivate && "✓"}
                        </div>
                        PRIVATE
                      </label>
                    </div>
                  </div>

                  {error && <ErrorMsg text={error} />}
                  <ActionButton
                    label="⚙  CREATE ROOM"
                    loading={loading}
                    color="#3060a0"
                    shadowColor="#1a3a70"
                    onClick={handleCreate}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder, maxLength, mono = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; mono?: boolean;
}) {
  return (
    <div>
      <label style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#5a4a3a", display: "block", marginBottom: 5, letterSpacing: "0.05em" }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.stopPropagation()}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "#fff",
          border: "2px solid #1a0a2e",
          padding: "9px 12px",
          fontFamily: mono ? "'Press Start 2P', monospace" : "'Nunito', sans-serif",
          fontSize: mono ? 12 : 14,
          fontWeight: 800,
          color: "#1a0a2e",
          outline: "none",
          letterSpacing: mono ? "0.15em" : "normal",
          boxShadow: "2px 2px 0 #1a0a2e",
        }}
      />
    </div>
  );
}

function ActionButton({
  label, loading, color, shadowColor, onClick,
}: {
  label: string; loading: boolean; color: string; shadowColor: string; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const [press, setPress] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        width: "100%",
        background: loading ? "#808080" : color,
        border: "2px solid #1a0a2e",
        color: "#fff",
        padding: "13px",
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 9,
        cursor: loading ? "not-allowed" : "pointer",
        transform: press ? "translate(3px,3px)" : hov ? "translate(-1px,-1px)" : "none",
        boxShadow: press ? `1px 1px 0 ${shadowColor}` : hov ? `4px 4px 0 ${shadowColor}` : `3px 3px 0 ${shadowColor}`,
        transition: "all 0.08s",
      }}
    >
      {loading ? "LOADING..." : label}
    </button>
  );
}

function StepButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 24, height: 24,
        background: "#4a8a3c",
        border: "2px solid #1a0a2e",
        color: "#fff",
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 10,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "1px 1px 0 #1a0a2e",
      }}
    >
      {label}
    </button>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return (
    <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#c03030", marginBottom: 8 }}>
      ⚠ {text}
    </p>
  );
}
