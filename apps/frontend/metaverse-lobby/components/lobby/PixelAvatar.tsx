"use client";

import { useEffect, useState } from "react";
import type { AvatarDef } from "./avatarData";

interface PixelAvatarProps {
  avatar: AvatarDef;
  size?: number;
  animate?: boolean;
  direction?: "left" | "right" | "down" | "up";
}

export function PixelAvatar({ avatar, size = 80, animate = true, direction = "down" }: PixelAvatarProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setFrame(f => (f + 1) % 4), 200);
    return () => clearInterval(id);
  }, [animate]);

  const { colors, accessory } = avatar;
  const scale = size / 48;

  // Walk bob
  const bobY = animate && frame % 2 === 1 ? 1 : 0;
  // Leg swing
  const leg1X = animate ? (frame === 1 || frame === 2 ? 2 : -1) : 0;
  const leg2X = animate ? (frame === 0 || frame === 3 ? 2 : -1) : 0;

  const showFace = direction !== "up";
  const flipX = direction === "left";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ imageRendering: "pixelated" }}
    >
      <g transform={`translate(0, ${bobY}) scale(${flipX ? -1 : 1}, 1) translate(${flipX ? -48 : 0}, 0)`}>
        {/* Shadow */}
        <ellipse cx={24} cy={46} rx={10} ry={3} fill="rgba(0,0,0,0.2)" />

        {/* Legs */}
        <rect x={15 + leg1X} y={30} width={5} height={10} fill={colors.pants} rx={1} />
        <rect x={27 - leg2X} y={30} width={5} height={10} fill={colors.pants} rx={1} />

        {/* Shoes */}
        <rect x={13 + leg1X} y={38} width={7} height={4} fill={colors.shoes} rx={1} />
        <rect x={25 - leg2X} y={38} width={7} height={4} fill={colors.shoes} rx={1} />

        {/* Body */}
        <rect x={12} y={18} width={24} height={14} fill={colors.shirt} rx={2} />

        {/* Collar */}
        <rect x={20} y={18} width={8} height={5} fill="rgba(255,255,255,0.25)" rx={1} />

        {/* Arms */}
        <rect x={5} y={19} width={7} height={10} fill={colors.shirt} rx={2} />
        <rect x={36} y={19} width={7} height={10} fill={colors.shirt} rx={2} />

        {/* Hands */}
        <circle cx={8}  cy={30} r={4} fill={colors.skin} />
        <circle cx={40} cy={30} r={4} fill={colors.skin} />

        {/* Head */}
        <rect x={13} y={4} width={22} height={16} fill={colors.skin} rx={3} />

        {/* Hair */}
        <rect x={13} y={4}  width={22} height={7}  fill={colors.hair} rx={3} />
        <rect x={13} y={4}  width={6}  height={4}  fill={colors.hair} />
        {direction !== "up" && <rect x={35} y={4} width={0} height={4} fill={colors.hair} />}

        {/* Face */}
        {showFace && (
          <>
            <rect x={17} y={12} width={5} height={4} fill="#1a0a2e" rx={1} />
            <rect x={26} y={12} width={5} height={4} fill="#1a0a2e" rx={1} />
            <rect x={18} y={13} width={2} height={2} fill="white" />
            <rect x={27} y={13} width={2} height={2} fill="white" />
            <rect x={20} y={18} width={8} height={2}  fill={colors.hair === "#e04080" ? "#c060a0" : "#b07060"} rx={1} />
          </>
        )}

        {/* Accessory */}
        {accessory === "hat" && (
          <>
            <rect x={11} y={2} width={26} height={4} fill={colors.accent} rx={1} />
            <rect x={14} y={-2} width={20} height={6} fill={colors.accent} rx={2} />
          </>
        )}
        {accessory === "crown" && (
          <>
            <rect x={13} y={1} width={22} height={4} fill={colors.accent} />
            <rect x={13} y={-1} width={4} height={4} fill={colors.accent} />
            <rect x={22} y={-2} width={4} height={5} fill={colors.accent} />
            <rect x={31} y={-1} width={4} height={4} fill={colors.accent} />
            <rect x={14} y={0} width={2} height={2} fill="#e84040" />
            <rect x={23} y={-1} width={2} height={2} fill="#40e0f0" />
            <rect x={32} y={0} width={2} height={2} fill="#e84040" />
          </>
        )}
        {accessory === "headband" && (
          <rect x={12} y={7} width={24} height={3} fill={colors.accent} />
        )}
        {accessory === "cap" && (
          <>
            <rect x={13} y={3} width={22} height={5} fill={colors.accent} rx={2} />
            <rect x={10} y={6} width={28} height={3} fill={colors.accent} rx={1} />
            <rect x={8}  y={7} width={6}  height={2} fill={colors.accent} rx={1} />
          </>
        )}
        {accessory === "bow" && (
          <>
            <rect x={11} y={3} width={6}  height={4} fill={colors.accent} rx={1} />
            <rect x={31} y={3} width={6}  height={4} fill={colors.accent} rx={1} />
            <rect x={22} y={4} width={4}  height={3} fill={colors.accent} rx={1} />
          </>
        )}
        {accessory === "glasses" && showFace && (
          <>
            <rect x={15} y={12} width={9}  height={5} fill="none" stroke={colors.accent} strokeWidth={1.5} rx={1} />
            <rect x={24} y={12} width={9}  height={5} fill="none" stroke={colors.accent} strokeWidth={1.5} rx={1} />
            <line x1={24} y1={14} x2={24} y2={14} stroke={colors.accent} strokeWidth={1.5} />
          </>
        )}
      </g>
    </svg>
  );
}

// Static facing-right avatar for the carousel preview (larger)
export function AvatarPreview({ avatar, size = 120 }: { avatar: AvatarDef; size?: number }) {
  const [frame, setFrame] = useState(0);
  const [dir, setDir] = useState<"down" | "left" | "right" | "up">("down");

  useEffect(() => {
    const frameId = setInterval(() => setFrame(f => (f + 1) % 4), 220);
    return () => clearInterval(frameId);
  }, []);

  // Rotate through directions slowly
  useEffect(() => {
    const dirs: Array<"down" | "left" | "right" | "up"> = ["down", "right", "down", "left"];
    let i = 0;
    const dirId = setInterval(() => {
      i = (i + 1) % dirs.length;
      setDir(dirs[i]);
    }, 1200);
    return () => clearInterval(dirId);
  }, []);

  const bobY = frame % 2 === 1 ? 1 : 0;
  const leg1X = frame === 1 || frame === 2 ? 2 : -1;
  const leg2X = frame === 0 || frame === 3 ? 2 : -1;
  const { colors, accessory } = avatar;
  const showFace = dir !== "up";
  const flipX = dir === "left";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 52"
      style={{ imageRendering: "pixelated", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
    >
      <g transform={`translate(0, ${bobY}) scale(${flipX ? -1 : 1}, 1) translate(${flipX ? -48 : 0}, 0)`}>
        <ellipse cx={24} cy={50} rx={10} ry={3} fill="rgba(0,0,0,0.3)" />

        {/* Legs */}
        <rect x={15 + leg1X} y={30} width={5} height={10} fill={colors.pants} rx={1} />
        <rect x={27 - leg2X} y={30} width={5} height={10} fill={colors.pants} rx={1} />
        <rect x={13 + leg1X} y={38} width={7} height={4} fill={colors.shoes} rx={1} />
        <rect x={25 - leg2X} y={38} width={7} height={4} fill={colors.shoes} rx={1} />

        {/* Body */}
        <rect x={12} y={18} width={24} height={14} fill={colors.shirt} rx={2} />
        <rect x={20} y={18} width={8}  height={5}  fill="rgba(255,255,255,0.25)" rx={1} />

        {/* Arms */}
        <rect x={5}  y={19} width={7} height={10} fill={colors.shirt} rx={2} />
        <rect x={36} y={19} width={7} height={10} fill={colors.shirt} rx={2} />
        <circle cx={8}  cy={30} r={4} fill={colors.skin} />
        <circle cx={40} cy={30} r={4} fill={colors.skin} />

        {/* Head */}
        <rect x={13} y={4}  width={22} height={16} fill={colors.skin} rx={3} />
        <rect x={13} y={4}  width={22} height={7}  fill={colors.hair} rx={3} />
        <rect x={13} y={4}  width={6}  height={4}  fill={colors.hair} />

        {showFace && (
          <>
            <rect x={17} y={12} width={5} height={4} fill="#1a0a2e" rx={1} />
            <rect x={26} y={12} width={5} height={4} fill="#1a0a2e" rx={1} />
            <rect x={18} y={13} width={2} height={2} fill="white" />
            <rect x={27} y={13} width={2} height={2} fill="white" />
            <rect x={20} y={18} width={8} height={2} fill="#b07060" rx={1} />
          </>
        )}

        {accessory === "hat" && <>
          <rect x={11} y={2}  width={26} height={4} fill={colors.accent} rx={1} />
          <rect x={14} y={-2} width={20} height={6} fill={colors.accent} rx={2} />
        </>}
        {accessory === "crown" && <>
          <rect x={13} y={1}  width={22} height={4} fill={colors.accent} />
          <rect x={13} y={-1} width={4}  height={4} fill={colors.accent} />
          <rect x={22} y={-2} width={4}  height={5} fill={colors.accent} />
          <rect x={31} y={-1} width={4}  height={4} fill={colors.accent} />
          <rect x={14} y={0}  width={2}  height={2} fill="#e84040" />
          <rect x={23} y={-1} width={2}  height={2} fill="#40e0f0" />
          <rect x={32} y={0}  width={2}  height={2} fill="#e84040" />
        </>}
        {accessory === "headband" && <rect x={12} y={7} width={24} height={3} fill={colors.accent} />}
        {accessory === "cap" && <>
          <rect x={13} y={3} width={22} height={5} fill={colors.accent} rx={2} />
          <rect x={10} y={6} width={28} height={3} fill={colors.accent} rx={1} />
          <rect x={8}  y={7} width={6}  height={2} fill={colors.accent} rx={1} />
        </>}
        {accessory === "bow" && <>
          <rect x={11} y={3} width={6} height={4} fill={colors.accent} rx={1} />
          <rect x={31} y={3} width={6} height={4} fill={colors.accent} rx={1} />
          <rect x={22} y={4} width={4} height={3} fill={colors.accent} rx={1} />
        </>}
        {accessory === "glasses" && showFace && <>
          <rect x={15} y={12} width={9} height={5} fill="none" stroke={colors.accent} strokeWidth={1.5} rx={1} />
          <rect x={24} y={12} width={9} height={5} fill="none" stroke={colors.accent} strokeWidth={1.5} rx={1} />
        </>}
      </g>
    </svg>
  );
}
