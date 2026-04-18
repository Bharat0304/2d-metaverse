"use client";

import { useEffect, useRef } from "react";

// Draws a looping pixel art village background
export function GameBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef(0);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const W = canvas.width;
    const H = canvas.height;
    const T = 48; // tile size

    const draw = () => {
      frameRef.current++;
      const f = frameRef.current;

      // Clear
      ctx.fillStyle = "#5aaa48";
      ctx.fillRect(0, 0, W, H);

      // Checker grass
      for (let r = 0; r < Math.ceil(H / T) + 1; r++) {
        for (let c = 0; c < Math.ceil(W / T) + 1; c++) {
          const isAlt = (r + c) % 2 === 0;
          ctx.fillStyle = isAlt ? "#5aaa48" : "#68c055";
          ctx.fillRect(c * T, r * T, T, T);
        }
      }

      // Dirt path (horizontal through middle)
      ctx.fillStyle = "#c8a060";
      ctx.fillRect(0, H / 2 - 24, W, 48);
      ctx.fillStyle = "#b89050";
      for (let x = 0; x < W; x += 24) {
        ctx.fillRect(x, H / 2 - 2, 12, 4);
      }

      // Animated water patch (top-right)
      const wt = f / 30;
      ctx.fillStyle = "#4898e8";
      ctx.fillRect(W - 220, 40, 180, 120);
      for (let wr = 0; wr < 3; wr++) {
        for (let wc = 0; wc < 4; wc++) {
          const wx = W - 210 + wc * 44 + Math.sin(wt + wr * 1.3) * 4;
          const wy = 60 + wr * 34;
          ctx.fillStyle = `rgba(255,255,255,${0.12 + Math.sin(wt * 2 + wc) * 0.06})`;
          ctx.fillRect(wx, wy, 18, 4);
        }
      }

      // Trees (dark blobs)
      const trees = [
        [60, 80], [140, 60], [W-100, 80], [W-180, 60],
        [80, H-120], [160, H-100], [W-90, H-120], [W-170, H-100],
        [300, 40], [W-300, 40],
      ];
      trees.forEach(([tx, ty]) => {
        ctx.fillStyle = "#2a5a18";
        ctx.beginPath(); ctx.arc(tx, ty+8, 28, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#4a8828";
        ctx.beginPath(); ctx.arc(tx, ty, 22, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#5a3a10";
        ctx.fillRect(tx-5, ty+22, 10, 20);
      });

      // Campfire (animated)
      const cf_x = 320, cf_y = H/2 + 60;
      const fl = Math.sin(f * 0.15) * 3;
      ctx.fillStyle = "#4a3018"; ctx.fillRect(cf_x - 12, cf_y + 6, 24, 8);
      ctx.fillStyle = "#ff6600";
      ctx.beginPath();
      ctx.moveTo(cf_x, cf_y - 12 + fl); ctx.lineTo(cf_x-14, cf_y+6); ctx.lineTo(cf_x+14, cf_y+6);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ffcc00";
      ctx.beginPath();
      ctx.moveTo(cf_x, cf_y - 6 + fl); ctx.lineTo(cf_x-8, cf_y+6); ctx.lineTo(cf_x+8, cf_y+6);
      ctx.closePath(); ctx.fill();
      // Glow
      const g = ctx.createRadialGradient(cf_x, cf_y, 0, cf_x, cf_y, 40);
      g.addColorStop(0, `rgba(255,140,0,${0.18 + Math.sin(f*0.15)*0.06})`);
      g.addColorStop(1, "rgba(255,100,0,0)");
      ctx.fillStyle = g; ctx.fillRect(cf_x-40, cf_y-40, 80, 80);

      // Simple house outlines
      drawHouse(ctx, 80, H/2 + 80, "#c84040");
      drawHouse(ctx, W-260, H/2 + 80, "#409040");
      drawHouse(ctx, 80, H/2 - 160, "#3060a0");
      drawHouse(ctx, W-260, H/2 - 160, "#c84040");

      // Walking NPC (simple)
      const npcX = ((f * 1.2) % (W + 80)) - 40;
      const npcY = H/2 - 30;
      const npcBob = f % 8 < 4 ? 0 : 1;
      drawSimpleChar(ctx, npcX, npcY - npcBob, "#9b5de5");

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={typeof window !== "undefined" ? window.innerWidth : 1440}
      height={typeof window !== "undefined" ? window.innerHeight : 900}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        imageRendering: "pixelated",
        zIndex: 0,
      }}
    />
  );
}

function drawHouse(ctx: CanvasRenderingContext2D, x: number, y: number, roofColor: string) {
  // Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x + 80, y - 70);
  ctx.lineTo(x, y - 10);
  ctx.lineTo(x + 160, y - 10);
  ctx.closePath();
  ctx.fill();
  // Walls
  ctx.fillStyle = "#d4c4a0";
  ctx.fillRect(x + 14, y - 10, 132, 100);
  // Door
  ctx.fillStyle = "#8B5A2B";
  ctx.fillRect(x + 60, y + 56, 36, 44);
  ctx.fillStyle = "#D4A017";
  ctx.beginPath(); ctx.arc(x + 91, y + 78, 3, 0, Math.PI*2); ctx.fill();
  // Windows
  ctx.fillStyle = "#a8d8f0";
  ctx.fillRect(x + 18, y + 10, 30, 30);
  ctx.fillRect(x + 112, y + 10, 30, 30);
  // Window frames
  ctx.strokeStyle = "#6a5030"; ctx.lineWidth = 2;
  ctx.strokeRect(x + 18, y + 10, 30, 30);
  ctx.strokeRect(x + 112, y + 10, 30, 30);
}

function drawSimpleChar(ctx: CanvasRenderingContext2D, x: number, y: number, shirtColor: string) {
  ctx.fillStyle = "#c8906a"; ctx.fillRect(x+12, y+0, 16, 12);
  ctx.fillStyle = "#2a1800"; ctx.fillRect(x+12, y+0, 16, 5);
  ctx.fillStyle = shirtColor; ctx.fillRect(x+9, y+12, 22, 10);
  ctx.fillStyle = "#303850"; ctx.fillRect(x+11, y+22, 6, 8);
  ctx.fillStyle = "#303850"; ctx.fillRect(x+23, y+22, 6, 8);
  ctx.fillStyle = "#201810"; ctx.fillRect(x+9, y+28, 8, 4);
  ctx.fillStyle = "#201810"; ctx.fillRect(x+23, y+28, 8, 4);
}
