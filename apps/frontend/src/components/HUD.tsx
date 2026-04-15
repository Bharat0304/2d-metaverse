"use client";

import { useRef, useEffect, useState } from "react";
import type { ChatMessage, NPC, Player } from "@/types";
import { TILE, COLS, ROWS } from "@/types";

const EMOTE_LIST = ["👋", "❤️", "😄", "🎉", "👍", "🎵", "⭐", "😂", "🔥", "💤"];

interface HUDProps {
  player: Player;
  npcs: NPC[];
  onlinePlayers: { id: string; name: string; color: string; x: number; y: number }[];
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  sendChat: (t: string) => void;
  sendEmote: (e: string) => void;
  nearbyObj: string | null;
  nearbyNPC: NPC | null;
  notification: string | null;
  dialogueOpen: boolean;
  setDialogueOpen: (v: boolean) => void;
  activeDialogue: { npc: NPC; line: string } | null;
  onInteract: () => void;
}

export default function HUD({
  player, npcs, onlinePlayers, chatMessages, chatInput, setChatInput,
  sendChat, sendEmote, nearbyObj, nearbyNPC, notification,
  dialogueOpen, setDialogueOpen, activeDialogue, onInteract,
}: HUDProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showEmotes, setShowEmotes] = useState(false);
  const [tab, setTab] = useState<"chat" | "players">("chat");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const totalPlayers = onlinePlayers.length + 1;

  return (
    <>
      {/* ── TOP BAR ───────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-[#1a2820]/90 border-b-2 border-[#4a8a3c] flex items-center px-4 gap-4 z-30 backdrop-blur-sm">
        <span className="font-['Press_Start_2P'] text-[11px] text-[#68c055] tracking-wider">
          🌿 VERDANT VILLAGE
        </span>
        <div className="h-4 w-px bg-[#4a8a3c]/50" />
        <span className="font-['Press_Start_2P'] text-[7px] text-[#4a8a3c]">
          {totalPlayers} PLAYERS ONLINE
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#68c055] animate-pulse" />
          <span className="font-['Press_Start_2P'] text-[6px] text-[#4a8a3c]">
            {player.name} · VERDANT VILLAGE
          </span>
        </div>
        <div className="font-['Press_Start_2P'] text-[6px] text-[#4a8a3c] bg-[#1a3020] px-2 py-1 border border-[#4a8a3c]/30">
          ❤️ 100  ⚡ 80  🪙 250
        </div>
      </div>

      {/* ── CONTROLS HINT ────────────────────── */}
      <div className="absolute top-12 left-3 z-20 bg-[#1a2820]/80 border border-[#4a8a3c]/40 px-3 py-2">
        <div className="font-['Press_Start_2P'] text-[5px] text-[#4a8a3c] leading-[2.2]">
          WASD / ↑↓←→  MOVE<br/>
          E  —  INTERACT<br/>
          ENTER  —  CHAT
        </div>
      </div>

      {/* ── NOTIFICATION ─────────────────────── */}
      {notification && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-[#1a2820] border-2 border-[#ffd166] px-5 py-2 shadow-[3px_3px_0_#ffd166]">
          <span className="font-['Press_Start_2P'] text-[8px] text-[#ffd166]">{notification}</span>
        </div>
      )}

      {/* ── INTERACT PROMPT ───────────────────── */}
      {(nearbyObj || nearbyNPC) && !dialogueOpen && (
        <div
          className="absolute bottom-[185px] left-1/2 -translate-x-1/2 z-30 bg-[#1a2820]/95 border-2 border-[#68c055] px-5 py-2 flex items-center gap-3 shadow-[3px_3px_0_#4a8a3c] cursor-pointer"
          onClick={onInteract}
        >
          <div className="bg-[#68c055] text-[#1a2820] font-['Press_Start_2P'] text-[8px] px-2 py-1">E</div>
          <span className="font-['Press_Start_2P'] text-[7px] text-[#68c055]">
            {nearbyNPC ? `Talk to ${nearbyNPC.name}` : "Interact"}
          </span>
        </div>
      )}

      {/* ── DIALOGUE BOX ─────────────────────── */}
      {dialogueOpen && activeDialogue && (
        <div className="absolute bottom-[185px] left-1/2 -translate-x-1/2 z-40 w-[500px] bg-[#1a2820]/98 border-2 border-[#68c055] shadow-[4px_4px_0_#4a8a3c]">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-[#4a8a3c]/40 bg-[#1a3020]">
            <div className="w-8 h-8 bg-[#4a8a3c] border border-[#68c055] flex items-center justify-center text-lg">
              🧙
            </div>
            <span className="font-['Press_Start_2P'] text-[8px] text-[#68c055]">
              {activeDialogue.npc.name}
            </span>
          </div>
          <div className="px-4 py-4">
            <p className="font-['Nunito'] text-[14px] text-[#c8e8c0] font-bold leading-relaxed">
              "{activeDialogue.line}"
            </p>
          </div>
          <div className="flex justify-end px-4 pb-3 gap-2">
            <button
              className="font-['Press_Start_2P'] text-[7px] bg-[#4a8a3c] text-white border border-[#68c055] px-3 py-1 cursor-pointer hover:bg-[#5aaa48] transition-colors"
              onClick={onInteract}
            >
              NEXT ▶
            </button>
            <button
              className="font-['Press_Start_2P'] text-[7px] bg-transparent text-[#4a8a3c] border border-[#4a8a3c] px-3 py-1 cursor-pointer hover:bg-[#1a3020] transition-colors"
              onClick={() => setDialogueOpen(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ── RIGHT PANEL (chat + players) ──────── */}
      <div className="absolute top-10 right-0 bottom-0 w-[260px] flex flex-col bg-[#1a2820]/90 border-l-2 border-[#4a8a3c]/50 z-20 backdrop-blur-sm">
        {/* Tab bar */}
        <div className="flex border-b-2 border-[#4a8a3c]/40">
          <button
            className={`flex-1 font-['Press_Start_2P'] text-[6px] py-2 transition-colors ${tab === "chat" ? "bg-[#1a3020] text-[#68c055]" : "text-[#4a8a3c] hover:bg-[#1a2820]"}`}
            onClick={() => setTab("chat")}
          >
            💬 CHAT
          </button>
          <button
            className={`flex-1 font-['Press_Start_2P'] text-[6px] py-2 transition-colors ${tab === "players" ? "bg-[#1a3020] text-[#68c055]" : "text-[#4a8a3c] hover:bg-[#1a2820]"}`}
            onClick={() => setTab("players")}
          >
            👥 {totalPlayers}
          </button>
        </div>

        {tab === "chat" ? (
          <>
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 min-h-0">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex gap-1 items-start">
                  <span className="font-['Press_Start_2P'] text-[5px] mt-[2px] flex-shrink-0" style={{ color: msg.color }}>
                    {msg.playerName.slice(0, 6)}:
                  </span>
                  <span className="font-['Nunito'] text-[11px] text-[#c8e8c0] font-bold leading-tight break-words">
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Emote picker */}
            {showEmotes && (
              <div className="px-2 pb-1 grid grid-cols-5 gap-1">
                {EMOTE_LIST.map((em) => (
                  <button
                    key={em}
                    className="text-lg hover:bg-[#1a3020] rounded cursor-pointer py-1 transition-colors"
                    onClick={() => { sendEmote(em); setShowEmotes(false); }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            <div className="flex border-t border-[#4a8a3c]/30">
              <button
                className="font-['Press_Start_2P'] text-[8px] px-2 text-[#ffd166] hover:bg-[#1a3020] transition-colors border-r border-[#4a8a3c]/30"
                onClick={() => setShowEmotes((v) => !v)}
              >
                😄
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") { sendChat(chatInput); setChatInput(""); }
                }}
                placeholder="Say something..."
                className="flex-1 bg-transparent px-2 py-2 font-['Nunito'] text-[11px] text-white font-bold outline-none placeholder:text-[#4a6a40] placeholder:font-normal"
              />
              <button
                onClick={() => { sendChat(chatInput); setChatInput(""); }}
                className="font-['Press_Start_2P'] text-[6px] bg-[#4a8a3c] text-white px-2 hover:bg-[#68c055] transition-colors"
              >
                ▶
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
            {/* Me */}
            <div className="flex items-center gap-2 p-2 bg-[#1a3020] border border-[#4a8a3c]/30">
              <div className="w-6 h-6 rounded-full border border-[#9b5de5] flex items-center justify-center text-xs" style={{ background: "#9b5de5" }}>
                🤖
              </div>
              <div>
                <div className="font-['Press_Start_2P'] text-[6px] text-[#9b5de5]">YOU</div>
                <div className="font-['Press_Start_2P'] text-[5px] text-[#4a8a3c]">Verdant Village</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-[#68c055]" />
            </div>
            {/* Others */}
            {onlinePlayers.map((p) => (
              <div key={p.id} className="flex items-center gap-2 p-2 hover:bg-[#1a3020] transition-colors">
                <div className="w-6 h-6 rounded-full border border-[#4a8a3c] flex items-center justify-center text-xs" style={{ background: p.color }}>
                  🧑
                </div>
                <div>
                  <div className="font-['Press_Start_2P'] text-[6px]" style={{ color: p.color }}>{p.name}</div>
                  <div className="font-['Press_Start_2P'] text-[5px] text-[#4a8a3c]">Roaming</div>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-[#68c055]" />
              </div>
            ))}
            {/* NPCs */}
            {npcs.map((npc) => (
              <div key={npc.id} className="flex items-center gap-2 p-2 opacity-70">
                <div className="w-6 h-6 rounded-full border border-[#4a6a40] bg-[#405040] flex items-center justify-center text-xs">🧙</div>
                <div>
                  <div className="font-['Press_Start_2P'] text-[6px] text-[#6a9060]">{npc.name}</div>
                  <div className="font-['Press_Start_2P'] text-[5px] text-[#4a6a40]">NPC</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MINIMAP ───────────────────────────── */}
      <div className="absolute bottom-10 left-3 z-20 bg-[#1a2820]/90 border-2 border-[#4a8a3c]/50 p-2">
        <div className="font-['Press_Start_2P'] text-[5px] text-[#4a8a3c] mb-1">MINIMAP</div>
        <svg width="100" height="76" style={{ display: "block" }}>
          {/* Base */}
          <rect width="100" height="76" fill="#1a3a20" />
          {/* Zones */}
          <rect x="0"  y="0" width="100" height="76" fill="#2a5020" opacity="0.5" />
          {/* Water */}
          <rect x="6"  y="38" width="20" height="16" fill="#3060a0" opacity="0.8" />
          {/* Paths */}
          <rect x="16" y="26" width="70" height="4"  fill="#a08860" opacity="0.8" />
          <rect x="38" y="10" width="4"  height="60" fill="#a08860" opacity="0.8" />
          {/* Stone plaza */}
          <rect x="45" y="38" width="18" height="18" fill="#706860" opacity="0.7" />
          {/* Houses */}
          <rect x="12" y="10" width="20" height="18" fill="#c84040" opacity="0.8" />
          <rect x="50" y="10" width="20" height="18" fill="#c84040" opacity="0.8" />
          <rect x="20" y="52" width="18" height="16" fill="#40a060" opacity="0.8" />
          <rect x="68" y="52" width="18" height="16" fill="#4040a0" opacity="0.8" />
          {/* Trees (border) */}
          <rect x="0" y="0" width="100" height="5" fill="#1a5010" />
          <rect x="0" y="70" width="100" height="6" fill="#1a5010" />
          <rect x="0" y="0" width="5" height="76" fill="#1a5010" />
          <rect x="95" y="0" width="5" height="76" fill="#1a5010" />

          {/* Online players */}
          {onlinePlayers.map((p) => (
            <circle
              key={p.id}
              cx={(p.x / TILE / COLS) * 100}
              cy={(p.y / TILE / ROWS) * 76}
              r={2.5}
              fill={p.color}
            />
          ))}

          {/* Player dot */}
          <circle
            cx={(player.x / TILE / COLS) * 100}
            cy={(player.y / TILE / ROWS) * 76}
            r={3}
            fill="#ffd166"
            stroke="#1a0a2e"
            strokeWidth={1}
          />
          <circle
            cx={(player.x / TILE / COLS) * 100}
            cy={(player.y / TILE / ROWS) * 76}
            r={6}
            fill="#ffd166"
            opacity={0.2}
          />
        </svg>
      </div>

      {/* ── BOTTOM STATUS BAR ─────────────────── */}
      <div className="absolute bottom-0 left-0 right-[260px] h-10 bg-[#1a2820]/90 border-t-2 border-[#4a8a3c]/50 flex items-center px-4 gap-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#68c055]" />
          <span className="font-['Press_Start_2P'] text-[6px] text-[#4a8a3c]">VERDANT VILLAGE</span>
        </div>
        <div className="h-3 w-px bg-[#4a8a3c]/30" />
        <span className="font-['Press_Start_2P'] text-[6px] text-[#4a8a3c]">{totalPlayers} ONLINE</span>
        <div className="h-3 w-px bg-[#4a8a3c]/30" />
        <span className="font-['Press_Start_2P'] text-[6px] text-[#4a8a3c]">PING: 8ms</span>
        <div className="flex-1" />
        <span className="font-['Press_Start_2P'] text-[5px] text-[#4a6a40]">
          WASD MOVE · E INTERACT · ENTER CHAT
        </span>
      </div>
    </>
  );
}
