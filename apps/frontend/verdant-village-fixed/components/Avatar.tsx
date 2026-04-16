"use client";

import { useMemo } from "react";
import { TILE, type Player, type NPC, type Direction } from "@/types";

// ── walk animation frame lookup ─────────────────────
// For an RPG Maker style 3×4 sheet: cols=left/center/right, rows=down/left/right/up
const WALK_FRAME_X = [1, 0, 2, 0]; // center, left, right, center
const DIR_ROW: Record<Direction, number> = { down: 0, left: 1, right: 2, up: 3 };

interface AvatarProps {
  entity: Player | NPC;
  camX: number;
  camY: number;
  isPlayer?: boolean;
}

// Draw a pixel avatar using CSS canvas-like approach via SVG
export function Avatar({ entity, camX, camY, isPlayer = false }: AvatarProps) {
  const sx = entity.x - camX;
  const sy = entity.y - camY - TILE * 0.7;

  // Out of view
  if (sx < -80 || sx > 1100 || sy < -80 || sy > 760) return null;

  const dir = entity.dir;
  const frame = "animFrame" in entity ? entity.animFrame : 0;
  const walkColIdx = frame % 4;
  const frameCol = WALK_FRAME_X[walkColIdx];
  const frameRow = DIR_ROW[dir];

  // Get player/NPC specific props
  const name = entity.name;
  const color = isPlayer ? (entity as Player).color : "#7a8090";
  const chatText = isPlayer ? (entity as Player).chatText : "";
  const emote = isPlayer ? (entity as Player).emote : "";
  const isWalking = entity.state === "walking";
  const bobY = isWalking ? Math.sin(frame * Math.PI * 0.5) * 2 : 0;

  return (
    <g transform={`translate(${sx}, ${sy + bobY})`}>
      {/* Chat bubble */}
      {chatText && (
        <g transform="translate(0,-48)">
          <rect x={-48} y={-18} width={96} height={20} fill="white" rx={4} stroke="#1a0a2e" strokeWidth={1.5} />
          <polygon points="-4,2 4,2 0,8" fill="white" stroke="#1a0a2e" strokeWidth={1} />
          <text x={0} y={-3} textAnchor="middle" fontSize={8} fontFamily="Nunito,sans-serif" fontWeight="800" fill="#1a0a2e">
            {chatText.length > 16 ? chatText.slice(0, 16) + "…" : chatText}
          </text>
        </g>
      )}

      {/* Emote bubble */}
      {emote && (
        <g transform="translate(20,-60)">
          <circle cx={0} cy={0} r={14} fill="white" stroke="#ffd166" strokeWidth={2} />
          <text x={0} y={5} textAnchor="middle" fontSize={14}>{emote}</text>
        </g>
      )}

      {/* Avatar body — pixel-art style character */}
      <PixelCharacter dir={dir} frame={frame} color={color} isPlayer={isPlayer} />

      {/* Name tag */}
      <g transform="translate(0, 8)">
        <rect x={-24} y={-8} width={48} height={10} fill={isPlayer ? "#9b5de5" : "#405060"} rx={2} opacity={0.9} />
        <text x={0} y={0} textAnchor="middle" fontSize={6} fontFamily="'Press Start 2P',monospace" fill="white">
          {name.length > 8 ? name.slice(0, 8) : name}
        </text>
      </g>

      {/* Shadow */}
      <ellipse cx={0} cy={36} rx={12} ry={4} fill="rgba(0,0,0,0.25)" />
    </g>
  );
}

function PixelCharacter({ dir, frame, color, isPlayer }: {
  dir: Direction; frame: number; color: string; isPlayer: boolean;
}) {
  const isBack = dir === "up";
  const isLeft = dir === "left";
  const walkBob = frame % 2;

  // Character palette based on color
  const skinTone = "#c8906a";
  const hairCol = "#2a1800";
  const shirtCol = color;
  const pantsCol = isPlayer ? "#303850" : "#404850";
  const shoeCol = "#201810";
  const legOffset = walkBob ? [2, -2] : [0, 0];

  return (
    <g transform="translate(-16, -8)">
      {/* Legs */}
      <rect x={7  + legOffset[0]} y={22} width={5} height={8} fill={pantsCol} rx={1} />
      <rect x={20 + legOffset[1]} y={22} width={5} height={8} fill={pantsCol} rx={1} />
      {/* Shoes */}
      <rect x={5  + legOffset[0]} y={28} width={7} height={4} fill={shoeCol} rx={1} />
      <rect x={18 + legOffset[1]} y={28} width={7} height={4} fill={shoeCol} rx={1} />

      {/* Body */}
      <rect x={5} y={12} width={22} height={12} fill={shirtCol} rx={2} />
      {/* Collar detail */}
      <rect x={12} y={12} width={8} height={5} fill="rgba(255,255,255,0.3)" rx={1} />

      {/* Arms */}
      {!isBack ? (
        <>
          <rect x={-1} y={13} width={6} height={9} fill={shirtCol} rx={2} />
          <rect x={27} y={13} width={6} height={9} fill={shirtCol} rx={2} />
          <circle cx={2}  cy={23} r={3.5} fill={skinTone} />
          <circle cx={30} cy={23} r={3.5} fill={skinTone} />
        </>
      ) : (
        <>
          <rect x={-1} y={13} width={6} height={9} fill={shirtCol} rx={2} />
          <rect x={27} y={13} width={6} height={9} fill={shirtCol} rx={2} />
        </>
      )}

      {/* Head */}
      <rect x={6} y={0} width={20} height={14} fill={skinTone} rx={3} />
      {/* Hair */}
      <rect x={6} y={0} width={20} height={6} fill={hairCol} rx={3} />
      {!isBack && <rect x={6} y={0} width={5} height={4} fill={hairCol} />}
      {isLeft  && <rect x={6} y={0} width={4} height={8} fill={hairCol} />}

      {/* Face */}
      {!isBack && (
        <>
          <rect x={9}  y={6} width={4} height={4} fill="#1a0a2e" rx={1} />
          <rect x={19} y={6} width={4} height={4} fill="#1a0a2e" rx={1} />
          <rect x={9}  y={7} width={2} height={2} fill="white" />
          <rect x={19} y={7} width={2} height={2} fill="white" />
          <rect x={12} y={11} width={8} height={2} fill="#b06858" rx={1} />
        </>
      )}

      {/* Hat for player */}
      {isPlayer && (
        <rect x={4} y={-3} width={24} height={5} fill={color} rx={2} opacity={0.8} />
      )}
    </g>
  );
}

// Online player dots on minimap
export function MinimapDot({ x, y, color, name }: { x: number; y: number; color: string; name: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={3} fill={color} />
      <circle cx={x} cy={y} r={3} fill={color} opacity={0.6} style={{ animation: "ping 1.5s infinite" }} />
    </g>
  );
}
