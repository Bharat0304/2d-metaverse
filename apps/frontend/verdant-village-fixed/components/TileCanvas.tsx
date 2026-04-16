"use client";

import { useRef, useEffect, memo } from "react";
import { TILE, COLS, ROWS } from "@/types";
import { BASE_MAP, OBJECTS } from "@/lib/mapData";

// terrains.png  768×768 → 16 cols × 16 rows @ 48px
// outside.png   768×768 → 16 cols × 16 rows @ 48px
// houses.png    768×768 → 16 cols × 16 rows @ 48px (each house = 4×4 tiles = 192×192px)
// campfire.png  144×192 → 3 cols  × 4 rows  @ 48px (12 frames total)
// door.png      144×192 → 3 cols  × 4 rows  @ 48px (row=open-state 0=closed 3=open)

// terrains.png (row, col) per tile ID
const TERRAIN_SPRITES: Record<number, [number, number]> = {
  0: [1, 1],  // deep grass
  1: [1, 1],  // light grass (+ brightness overlay)
  2: [1, 4],  // dirt path
  3: [1, 8],  // stone cobble
  4: [8, 1],  // water
  5: [0, 4],  // sand edge
  6: [1, 1],  // tree border (grass base, tree drawn on top)
  7: [1, 1],  // house wall base (grass underneath house sprite)
  8: [1, 1],  // flower patch (grass + flower overlay)
  9: [1, 8],  // stone ground
};

const TILE_COLORS: Record<number, string> = {
  0: "#5aaa48", 1: "#68c055", 2: "#c8a870", 3: "#a09080",
  4: "#4890d8", 5: "#d4b87a", 6: "#3a7a2a", 7: "#d4c4a0",
  8: "#5aaa48", 9: "#908078",
};

interface TileCanvasProps {
  camX: number; camY: number;
  vpW: number;  vpH: number;
  campfireFrame: number;
  openDoors: Set<string>;
  openChests: Set<string>;
}

const TileCanvas = memo(function TileCanvas({
  camX, camY, vpW, vpH, campfireFrame, openDoors, openChests,
}: TileCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const sheets = [
      { key: "terrains", src: "/sprites/terrains.png" },
      { key: "outside",  src: "/sprites/outside.png"  },
      { key: "houses",   src: "/sprites/houses.png"   },
      { key: "campfire", src: "/sprites/campfire.png" },
      { key: "door",     src: "/sprites/door.png"     },
    ];
    sheets.forEach(({ key, src }) => {
      if (imagesRef.current[key]) return;
      const img = new Image();
      img.src = src;
      img.onload  = () => { imagesRef.current[key] = img; };
      img.onerror = () => console.warn("sprite load failed:", src);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, vpW, vpH);

    const startCol = Math.max(0, Math.floor(camX / TILE));
    const startRow = Math.max(0, Math.floor(camY / TILE));
    const endCol   = Math.min(COLS - 1, Math.ceil((camX + vpW) / TILE));
    const endRow   = Math.min(ROWS - 1, Math.ceil((camY + vpH) / TILE));

    const terrains   = imagesRef.current["terrains"];
    const outside    = imagesRef.current["outside"];
    const housesImg  = imagesRef.current["houses"];
    const campfireImg = imagesRef.current["campfire"];
    const doorImg    = imagesRef.current["door"];

    // ── 1. BASE TILES ─────────────────────────────────────────────────────────
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = BASE_MAP[r]?.[c] ?? 0;
        const dx = Math.round(c * TILE - camX);
        const dy = Math.round(r * TILE - camY);

        if (terrains) {
          const [sr, sc] = TERRAIN_SPRITES[tileId] ?? [1, 1];
          ctx.drawImage(terrains, sc * 48, sr * 48, 48, 48, dx, dy, TILE, TILE);
          if (tileId === 1) { ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fillRect(dx, dy, TILE, TILE); }
          if (tileId === 8 && outside) ctx.drawImage(outside, 0, 0, 48, 48, dx, dy, TILE, TILE);
        } else {
          ctx.fillStyle = TILE_COLORS[tileId] ?? "#5aaa48";
          ctx.fillRect(dx, dy, TILE, TILE);
        }

        // Water shimmer
        if (tileId === 4) {
          const t = Date.now() / 900;
          const wx = ((Math.sin(t + c * 0.9) + 1) / 2) * (TILE - 16);
          ctx.fillStyle = "rgba(180,230,255,0.25)";
          ctx.fillRect(dx + wx, dy + 10, 10, 3);
          ctx.fillRect(dx + TILE - wx - 10, dy + 28, 8, 2);
        }
      }
    }

    // ── 2. HOUSES ─────────────────────────────────────────────────────────────
    // houses.png: each house = 192×192px (4 tiles × 4 tiles)
    //   srcX=0,   srcY=0   → red-roof small  (top-left quadrant)
    //   srcX=192, srcY=0   → tan-roof small  (top-right 1st house)
    //   srcX=0,   srcY=192 → large red-roof  (mid-left)
    //   srcX=192, srcY=192 → large brown     (mid-right)
    const drawHouse = (srcX: number, srcY: number, tileX: number, tileY: number) => {
      const hx = Math.round(tileX * TILE - camX);
      const hy = Math.round(tileY * TILE - camY);
      if (hx < vpW + 200 && hx > -200 && hy < vpH + 200 && hy > -200) {
        if (housesImg) {
          ctx.drawImage(housesImg, srcX, srcY, 192, 192, hx, hy, 192, 192);
        } else {
          ctx.fillStyle = "#d4a870"; ctx.fillRect(hx, hy, 192, 192);
          ctx.fillStyle = "#c04030"; ctx.fillRect(hx, hy, 192, 64);
        }
      }
    };
    drawHouse(0,   0,   4,  3);   // House 1 – top-left  (Elder Oak)
    drawHouse(192, 0,   16, 3);   // House 2 – top-right (Blacksmith)
    drawHouse(0,   192, 6,  16);  // House 3 – bot-left  (Inn)
    drawHouse(192, 192, 22, 16);  // House 4 – bot-right (Store)

    // ── 3. OBJECTS ────────────────────────────────────────────────────────────
    for (const obj of OBJECTS) {
      const dx = Math.round(obj.tileX * TILE - camX);
      const dy = Math.round(obj.tileY * TILE - camY);
      if (dx < -TILE * 3 || dx > vpW + TILE * 2 || dy < -TILE * 3 || dy > vpH + TILE * 2) continue;

      if (obj.type === "campfire") {
        if (campfireImg) {
          const frame = campfireFrame % 12;
          const col = frame % 3;
          const row = Math.floor(frame / 3);
          ctx.drawImage(campfireImg, col * 48, row * 48, 48, 48, dx, dy - 8, TILE, TILE);
          // Warm glow
          const grd = ctx.createRadialGradient(dx + 24, dy + 20, 0, dx + 24, dy + 20, 40);
          grd.addColorStop(0, "rgba(255,160,0,0.20)");
          grd.addColorStop(1, "rgba(255,80,0,0)");
          ctx.fillStyle = grd;
          ctx.fillRect(dx - 16, dy - 16, TILE + 32, TILE + 32);
        } else {
          ctx.fillStyle = "#4a3018"; ctx.fillRect(dx + 12, dy + 28, 24, 8);
          ctx.fillStyle = "#ff6600";
          ctx.beginPath(); ctx.moveTo(dx+24,dy+8); ctx.lineTo(dx+14,dy+30); ctx.lineTo(dx+34,dy+30); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#ffaa00";
          ctx.beginPath(); ctx.moveTo(dx+24,dy+14); ctx.lineTo(dx+18,dy+30); ctx.lineTo(dx+30,dy+30); ctx.closePath(); ctx.fill();
        }
        continue;
      }

      if (obj.type === "door") {
        const isOpen = openDoors.has(obj.id);
        if (doorImg) {
          // door.png row 0 = closed, row 3 = fully open
          const row = isOpen ? 3 : 0;
          ctx.drawImage(doorImg, 0, row * 48, 48, 48, dx, dy - 4, TILE, TILE);
        } else {
          ctx.fillStyle = isOpen ? "#8B5a2B" : "#6B3410";
          ctx.fillRect(dx + 8, dy, 32, 44);
          if (!isOpen) { ctx.fillStyle = "#D4A017"; ctx.beginPath(); ctx.arc(dx+34,dy+24,3,0,Math.PI*2); ctx.fill(); }
          else { ctx.strokeStyle = "#3a2010"; ctx.lineWidth = 2; ctx.strokeRect(dx+8,dy,16,44); }
        }
        continue;
      }

      if (obj.type === "sign") {
        if (outside) {
          ctx.drawImage(outside, 7 * 48, 0, 48, 48, dx, dy - 4, TILE, TILE);
        } else {
          ctx.fillStyle = "#8B6040"; ctx.fillRect(dx+8,dy+8,32,24);
          ctx.fillStyle = "#6B4020"; ctx.fillRect(dx+20,dy+32,8,16);
          ctx.fillStyle = "#c8a870"; ctx.fillRect(dx+10,dy+10,28,20);
          ctx.fillStyle = "#5a3010"; ctx.fillRect(dx+14,dy+14,20,3); ctx.fillRect(dx+14,dy+20,14,3);
        }
        continue;
      }

      if (obj.type === "well") {
        ctx.fillStyle = "#888070"; ctx.beginPath(); ctx.arc(dx+24,dy+28,20,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = "#4890d8"; ctx.beginPath(); ctx.arc(dx+24,dy+28,14,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = "#6a5a40"; ctx.fillRect(dx+4,dy+4,8,20); ctx.fillRect(dx+36,dy+4,8,20);
        ctx.fillStyle = "#5a4030"; ctx.fillRect(dx+4,dy+4,40,6);
        continue;
      }

      if (obj.type === "chest") {
        const isOpen = openChests.has(obj.id);
        if (outside) {
          const chestRow = isOpen ? 11 : 9;
          ctx.drawImage(outside, 6 * 48, chestRow * 48, 48, 48, dx, dy, TILE, TILE);
        } else {
          ctx.fillStyle = isOpen ? "#c8a040" : "#a07020"; ctx.fillRect(dx+6,dy+16,36,26);
          ctx.fillStyle = isOpen ? "#d4b050" : "#b08030"; ctx.fillRect(dx+6,dy+16,36,12);
          ctx.fillStyle = "#d4a820"; ctx.fillRect(dx+19,dy+24,10,8);
          if (isOpen) { ctx.fillStyle="#ffe060"; for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(dx+12+i*12,dy+8-i*4,3,0,Math.PI*2);ctx.fill();} }
        }
        continue;
      }
    }

    // ── 4. BORDER TREE OVERLAY ────────────────────────────────────────────────
    if (outside) {
      // Draw lush trees on top of grass base for border tiles
      for (let c = startCol; c <= endCol; c++) {
        if (BASE_MAP[0]?.[c] === 6) {
          const tx = Math.round(c * TILE - camX);
          const ty = Math.round(0 * TILE - camY);
          // 2-tall tree (row0 col8 in outside = top, row1 col8 = trunk)
          ctx.drawImage(outside, 8*48, 0, 48, 48, tx, ty, TILE, TILE);
        }
        if (BASE_MAP[ROWS-1]?.[c] === 6) {
          const tx = Math.round(c * TILE - camX);
          const ty = Math.round((ROWS-1) * TILE - camY);
          ctx.drawImage(outside, 8*48, 0, 48, 48, tx, ty, TILE, TILE);
        }
      }
      for (let r = startRow + 1; r < endRow; r++) {
        if (BASE_MAP[r]?.[0] === 6) {
          ctx.drawImage(outside, 8*48, 0, 48, 48, Math.round(0 - camX), Math.round(r*TILE - camY), TILE, TILE);
        }
        if (BASE_MAP[r]?.[COLS-1] === 6) {
          ctx.drawImage(outside, 8*48, 0, 48, 48, Math.round((COLS-1)*TILE - camX), Math.round(r*TILE - camY), TILE, TILE);
        }
      }
    }

  }, [camX, camY, vpW, vpH, campfireFrame, openDoors, openChests]);

  return (
    <canvas
      ref={canvasRef}
      width={vpW}
      height={vpH}
      style={{ position: "absolute", inset: 0, imageRendering: "pixelated" }}
    />
  );
});

export default TileCanvas;
