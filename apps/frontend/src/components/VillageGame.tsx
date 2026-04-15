"use client";

import { useRef } from "react";
import { TILE, COLS, ROWS, VP_W, VP_H } from "@/types";
import { useVillageEngine } from "@/lib/useVillageEngine";
import TileCanvas from "./TileCanvas";
import { Avatar } from "./Avatar";
import HUD from "./HUD";

export default function VillageGame() {
  const engine = useVillageEngine();
  const {
    player, npcs, onlinePlayers, openDoors, openChests,
    chatMessages, chatInput, setChatInput, sendChat, sendEmote,
    nearbyObj, nearbyNPC, dialogueOpen, setDialogueOpen,
    activeDialogue, notification, campfireFrame, interact,
  } = engine;

  // Camera: center on player, clamped
  const camX = Math.min(
    Math.max(player.x - VP_W / 2, 0),
    COLS * TILE - VP_W
  );
  const camY = Math.min(
    Math.max(player.y - VP_H / 2 + 40, 40),
    ROWS * TILE - (VP_H - 40)
  );

  // Sort all entities by Y for depth
  const allEntities = [
    ...onlinePlayers.map((p) => ({ ...p, dir: "down" as const, state: "idle" as const, animFrame: 0, chatText: "", emote: "", isNPC: false, isOther: true })),
    ...npcs.map((n) => ({ ...n, isNPC: true, isOther: false, chatText: "", emote: "" })),
    { ...player, isNPC: false, isOther: false },
  ].sort((a, b) => a.y - b.y);

  return (
    <div
      className="relative overflow-hidden bg-[#1a2820] select-none outline-none"
      style={{ width: VP_W, height: VP_H }}
      tabIndex={0}
    >
      {/* ── TILE MAP ─────────────────────────── */}
      <TileCanvas
        camX={camX}
        camY={camY - 40}
        vpW={VP_W}
        vpH={VP_H - 40}
        campfireFrame={campfireFrame}
        openDoors={openDoors}
        openChests={openChests}
      />

      {/* ── ENTITIES (SVG layer) ─────────────── */}
      <svg
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          width: VP_W,
          height: VP_H - 80,
          pointerEvents: "none",
          imageRendering: "pixelated",
        }}
      >
        {allEntities.map((entity) => {
          const isPlayer = entity.id === "you";
          const isNPC = (entity as any).isNPC;
          const sx = entity.x - camX;
          const sy = entity.y - (camY - 40);

          if (isPlayer) {
            return (
              <Avatar
                key="player"
                entity={player}
                camX={camX}
                camY={camY - 40}
                isPlayer
              />
            );
          }

          if (isNPC) {
            return (
              <Avatar
                key={entity.id}
                entity={entity as any}
                camX={camX}
                camY={camY - 40}
                isPlayer={false}
              />
            );
          }

          // Other online players
          return (
            <g key={entity.id} transform={`translate(${sx - 16}, ${sy - TILE * 0.6})`}>
              {/* Simple colored avatar */}
              <ellipse cx={16} cy={36} rx={12} ry={4} fill="rgba(0,0,0,0.25)" />
              <rect x={6}  y={22} width={5} height={8} fill="#303850" rx={1} />
              <rect x={21} y={22} width={5} height={8} fill="#303850" rx={1} />
              <rect x={4}  y={12} width={24} height={12} fill={(entity as any).color} rx={2} />
              <rect x={6}  y={0}  width={20} height={14} fill="#c8906a" rx={3} />
              <rect x={6}  y={0}  width={20} height={6}  fill="#2a1800" rx={3} />
              <rect x={9}  y={6}  width={4} height={4} fill="#1a0a2e" rx={1} />
              <rect x={19} y={6}  width={4} height={4} fill="#1a0a2e" rx={1} />
              <g transform="translate(0, 8)">
                <rect x={-8} y={-8} width={48} height={10} fill={(entity as any).color} rx={2} opacity={0.9} />
                <text x={16} y={0} textAnchor="middle" fontSize={6} fontFamily="'Press Start 2P',monospace" fill="white">
                  {(entity as any).name.slice(0, 8)}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* ── HUD ──────────────────────────────── */}
      <HUD
        player={player}
        npcs={npcs}
        onlinePlayers={onlinePlayers}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendChat={sendChat}
        sendEmote={sendEmote}
        nearbyObj={nearbyObj}
        nearbyNPC={nearbyNPC}
        notification={notification}
        dialogueOpen={dialogueOpen}
        setDialogueOpen={setDialogueOpen}
        activeDialogue={activeDialogue}
        onInteract={interact}
      />
    </div>
  );
}
