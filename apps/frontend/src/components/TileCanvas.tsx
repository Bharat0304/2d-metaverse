"use client";

import { useRef, useEffect, memo } from "react";
import { TILE, COLS, ROWS, type Vec2 } from "@/types";
import { BASE_MAP, OBJECTS } from "@/lib/mapData";

// Tileset sprite positions for Serene Village 48x48 sheet
// Sheet is 19 cols × 45 rows of 48px tiles
const TS = {
  // Terrain row 0
  deepGrass:    { sx: 0,   sy: 0,   sw: 48, sh: 48 },
  lightGrass:   { sx: 48,  sy: 0,   sw: 48, sh: 48 },
  dirt:         { sx: 96,  sy: 0,   sw: 48, sh: 48 },
  stone:        { sx: 144, sy: 0,   sw: 48, sh: 48 },
  water:        { sx: 192, sy: 0,   sw: 48, sh: 48 },
  sand:         { sx: 240, sy: 0,   sw: 48, sh: 48 },
  // Trees — from row 6 of the sheet (~288px down)
  treeFull:     { sx: 0,   sy: 384, sw: 96, sh: 96 },  // 2×2 tile tree
  // House wall
  houseWall:    { sx: 0,   sy: 192, sw: 48, sh: 48 },
  // Flowers
  flowerPink:   { sx: 48,  sy: 192, sw: 48, sh: 48 },
};

interface TileCanvasProps {
  camX: number;
  camY: number;
  vpW: number;
  vpH: number;
  campfireFrame: number;
  openDoors: Set<string>;
  openChests: Set<string>;
}

const TileCanvas = memo(function TileCanvas({
  camX, camY, vpW, vpH, campfireFrame, openDoors, openChests,
}: TileCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const loadedRef = useRef(0);
  const totalImages = 4;

  const TILE_COLORS: Record<number, string> = {
    0: "#5aaa48",
    1: "#68c055",
    2: "#c8a870",
    3: "#a09080",
    4: "#4890d8",
    5: "#d4b87a",
    6: "#3a7a2a",
    7: "#d4c4a0",
    8: "#5aaa48",
    9: "#908078",
  };

  useEffect(() => {
    const sheets = [
      { key: "tileset",  src: "/sprites/tileset.png" },
      { key: "houses",   src: "/sprites/houses.png" },
      { key: "campfire", src: "/sprites/campfire.png" },
      { key: "door",     src: "/sprites/door.png" },
    ];
    sheets.forEach(({ key, src }) => {
      if (imagesRef.current[key]) return;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedRef.current++;
        imagesRef.current[key] = img;
      };
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

    const tileset = imagesRef.current["tileset"];
    const housesImg = imagesRef.current["houses"];
    const campfireImg = imagesRef.current["campfire"];
    const doorImg = imagesRef.current["door"];

    // ── Draw base tiles ──────────────────────────────
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = BASE_MAP[r]?.[c] ?? 0;
        const dx = c * TILE - camX;
        const dy = r * TILE - camY;

        if (tileset) {
          // Map tile IDs to sprite sheet positions (48px grid)
          // Serene Village 48x48 sheet: 19 cols
          const spriteMap: Record<number, [number, number]> = {
            0: [0, 0],   // deep grass — col 0, row 0
            1: [1, 0],   // light grass
            2: [2, 0],   // dirt
            3: [3, 0],   // stone
            4: [4, 0],   // water
            5: [5, 0],   // sand
            6: [0, 8],   // tree/border (dark green)
            7: [6, 0],   // house base
            8: [0, 2],   // flower patch
            9: [7, 0],   // stone ground
          };
          const [sc, sr] = spriteMap[tileId] ?? [0, 0];
          try {
            ctx.drawImage(tileset, sc * 48, sr * 48, 48, 48, dx, dy, TILE, TILE);
          } catch {
            // fallback color
            ctx.fillStyle = TILE_COLORS[tileId] ?? "#5aaa48";
            ctx.fillRect(dx, dy, TILE, TILE);
          }
        } else {
          // Fallback solid color while loading
          ctx.fillStyle = TILE_COLORS[tileId] ?? "#5aaa48";
          ctx.fillRect(dx, dy, TILE, TILE);
          // Water shimmer
          if (tileId === 4) {
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.fillRect(dx + 4, dy + 4, 12, 6);
          }
        }

        // Tile overlays
        if (tileId === 4) { // water sparkle
          ctx.fillStyle = "rgba(180,220,255,0.3)";
          const t = Date.now() / 800;
          const wx = ((Math.sin(t + c * 0.7) + 1) / 2) * (TILE - 12);
          ctx.fillRect(dx + wx, dy + 6, 8, 3);
        }
      }
    }

    // ── Draw objects ─────────────────────────────────
    for (const obj of OBJECTS) {
      const dx = obj.tileX * TILE - camX;
      const dy = obj.tileY * TILE - camY;
      if (dx < -TILE * 2 || dx > vpW + TILE || dy < -TILE * 2 || dy > vpH + TILE) continue;

      if (obj.type === "campfire") {
        if (campfireImg) {
          // Campfire sheet: 3 cols × 4 rows at 48px
          const col = campfireFrame % 3;
          const row = Math.floor(campfireFrame / 3);
          ctx.drawImage(campfireImg, col * 48, row * 48, 48, 48, dx, dy - 12, TILE, TILE);
        } else {
          // Fallback drawn campfire
          ctx.fillStyle = "#4a3018";
          ctx.fillRect(dx + 12, dy + 28, 24, 8);
          ctx.fillStyle = "#ff6600";
          ctx.beginPath();
          ctx.moveTo(dx + 24, dy + 8);
          ctx.lineTo(dx + 14, dy + 30);
          ctx.lineTo(dx + 34, dy + 30);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#ffaa00";
          ctx.beginPath();
          ctx.moveTo(dx + 24, dy + 14);
          ctx.lineTo(dx + 18, dy + 30);
          ctx.lineTo(dx + 30, dy + 30);
          ctx.closePath();
          ctx.fill();
          // Glow
          const grad = ctx.createRadialGradient(dx + 24, dy + 24, 0, dx + 24, dy + 24, 30);
          grad.addColorStop(0, "rgba(255,140,0,0.3)");
          grad.addColorStop(1, "rgba(255,140,0,0)");
          ctx.fillStyle = grad;
          ctx.fillRect(dx - 6, dy - 6, TILE + 12, TILE + 12);
        }
        continue;
      }

      if (obj.type === "door") {
        const isOpen = openDoors.has(obj.id);
        if (doorImg) {
          const col = isOpen ? 1 : 0;
          ctx.drawImage(doorImg, col * 48, 0, 48, 48, dx, dy - 8, TILE, TILE);
        } else {
          ctx.fillStyle = isOpen ? "#8B4513" : "#6B3410";
          ctx.fillRect(dx + 8, dy, 32, 44);
          ctx.fillStyle = "#D4A017";
          ctx.beginPath();
          ctx.arc(dx + 34, dy + 24, 3, 0, Math.PI * 2);
          ctx.fill();
          if (isOpen) {
            ctx.strokeStyle = "#3a2010";
            ctx.strokeRect(dx + 8, dy, 16, 44);
          }
        }
        continue;
      }

      if (obj.type === "sign") {
        // Wooden sign
        ctx.fillStyle = "#8B6040";
        ctx.fillRect(dx + 8, dy + 8, 32, 24);
        ctx.fillStyle = "#6B4020";
        ctx.fillRect(dx + 20, dy + 32, 8, 16);
        ctx.fillStyle = "#c8a870";
        ctx.fillRect(dx + 10, dy + 10, 28, 20);
        // Sign text marker
        ctx.fillStyle = "#5a3010";
        ctx.fillRect(dx + 14, dy + 14, 20, 3);
        ctx.fillRect(dx + 14, dy + 20, 14, 3);
        continue;
      }

      if (obj.type === "well") {
        // Stone well
        ctx.fillStyle = "#888070";
        ctx.beginPath();
        ctx.arc(dx + 24, dy + 28, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#4890d8";
        ctx.beginPath();
        ctx.arc(dx + 24, dy + 28, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6a5a40";
        ctx.fillRect(dx + 4, dy + 4, 8, 20);
        ctx.fillRect(dx + 36, dy + 4, 8, 20);
        ctx.fillStyle = "#5a4030";
        ctx.fillRect(dx + 4, dy + 4, 40, 6);
        continue;
      }

      if (obj.type === "chest") {
        const isOpen = openChests.has(obj.id);
        ctx.fillStyle = isOpen ? "#c8a040" : "#a07020";
        ctx.fillRect(dx + 6, dy + 16, 36, 26);
        ctx.fillStyle = isOpen ? "#d4b050" : "#b08030";
        ctx.fillRect(dx + 6, dy + 16, 36, 12);
        ctx.fillStyle = "#d4a820";
        ctx.fillRect(dx + 19, dy + 24, 10, 8);
        if (isOpen) {
          // Sparkles
          ctx.fillStyle = "#ffe060";
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(dx + 12 + i * 12, dy + 8 - i * 4, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        continue;
      }
    }

    // ── Houses from Houses sheet ──────────────────────
    if (housesImg) {
      // House 1: top-left area (tileX 4-11, tileY 3-7)
      const h1x = 4 * TILE - camX;
      const h1y = 3 * TILE - camY;
      if (h1x > -200 && h1x < vpW + 200) {
        ctx.drawImage(housesImg, 0, 0, 192, 192, h1x, h1y, 192, 192);
      }
      // House 2: top-right (tileX 16-23, tileY 3-7)
      const h2x = 16 * TILE - camX;
      const h2y = 3 * TILE - camY;
      if (h2x > -200 && h2x < vpW + 200) {
        ctx.drawImage(housesImg, 192, 0, 192, 192, h2x, h2y, 192, 192);
      }
      // House 3: bottom-left (tileX 6-12, tileY 16-20)
      const h3x = 6 * TILE - camX;
      const h3y = 16 * TILE - camY;
      if (h3x > -200 && h3x < vpH + 200) {
        ctx.drawImage(housesImg, 0, 192, 192, 192, h3x, h3y, 192, 192);
      }
      // House 4: bottom-right
      const h4x = 22 * TILE - camX;
      const h4y = 16 * TILE - camY;
      if (h4x > -200 && h4x < vpW + 200) {
        ctx.drawImage(housesImg, 384, 0, 192, 192, h4x, h4y, 192, 192);
      }
    }

    // ── Border trees ──────────────────────────────────
    if (tileset) {
      for (let c = 0; c < COLS; c++) {
        if (BASE_MAP[0][c] === 6) {
          const dx2 = c * TILE - camX;
          ctx.drawImage(tileset, 0, 8 * 48, 48, 48, dx2, -camY, TILE, TILE);
        }
        if (BASE_MAP[ROWS-1][c] === 6) {
          const dx2 = c * TILE - camX;
          ctx.drawImage(tileset, 0, 8 * 48, 48, 48, dx2, (ROWS-1)*TILE - camY, TILE, TILE);
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
