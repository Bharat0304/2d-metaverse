import { COLS, ROWS, type InteractableObject } from "@/types";

// ─── TILE IDs ──────────────────────────────────────────────
// 0  = deep grass
// 1  = light grass
// 2  = dirt path
// 3  = stone path
// 4  = water
// 5  = sand edge
// 6  = tree (solid)
// 7  = house wall (solid)
// 8  = flower patch
// 9  = stone ground

export const TILE_COLORS: Record<number, string> = {
  0: "#4a8a3c",
  1: "#5aaa48",
  2: "#c8a870",
  3: "#a09080",
  4: "#4890d8",
  5: "#d4b87a",
  6: "#2a6020",
  7: "#c8a870",
  8: "#5aaa48",
  9: "#807870",
};

// ─── MAP LAYOUT (30×22) ────────────────────────────────────
// Legend: 0=grass  1=light grass  2=dirt  3=stone  4=water  6=tree(solid)
const R = ROWS, C = COLS;

// prettier-ignore
export const BASE_MAP: number[][] = [
  // row 0
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  // row 1
  [6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
  // row 2
  [6,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,6],
  // row 3
  [6,0,0,0,1,1,1,7,7,7,1,1,0,0,0,0,0,1,1,7,7,7,1,1,0,0,0,0,0,6],
  // row 4
  [6,0,0,1,1,1,7,7,7,7,7,1,1,0,0,0,1,1,7,7,7,7,7,1,1,0,0,0,0,6],
  // row 5
  [6,0,0,1,1,7,7,7,7,7,7,7,1,1,0,1,1,7,7,7,7,7,7,7,1,1,0,0,0,6],
  // row 6  (house front rows)
  [6,0,0,0,1,7,7,7,7,7,7,7,1,0,0,0,1,7,7,7,7,7,7,7,1,0,0,0,0,6],
  // row 7  (entrance row)
  [6,0,0,0,0,2,2,2,2,2,2,0,0,0,2,0,0,2,2,2,2,2,2,0,0,0,0,0,0,6],
  // row 8 — main path east-west
  [6,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,6],
  // row 9
  [6,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
  // row 10
  [6,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
  // row 11 — center
  [6,0,4,4,4,4,4,0,0,0,0,0,2,0,0,0,0,0,0,0,0,8,8,8,8,0,0,0,0,6],
  // row 12
  [6,0,4,4,4,4,4,0,0,0,0,0,2,0,0,3,3,3,3,3,0,8,8,8,8,0,0,0,0,6],
  // row 13
  [6,0,4,4,4,4,4,0,0,0,0,0,2,0,0,3,3,3,3,3,0,8,8,8,8,0,0,0,0,6],
  // row 14 — main path north-south
  [6,0,0,5,5,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,6],
  // row 15
  [6,0,0,0,0,0,0,0,0,0,0,0,2,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,6],
  // row 16
  [6,0,0,0,0,0,0,0,1,1,1,0,2,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,6],
  // row 17
  [6,0,0,0,0,0,0,1,7,7,7,1,2,1,0,0,0,0,0,0,0,0,0,1,7,7,7,1,0,6],
  // row 18
  [6,0,0,0,0,0,1,7,7,7,7,7,2,7,7,7,1,0,0,0,0,0,1,7,7,7,7,7,1,6],
  // row 19
  [6,0,0,0,0,0,0,1,7,7,7,1,2,1,7,7,1,0,0,0,0,0,0,1,7,7,7,1,0,6],
  // row 20
  [6,0,0,0,0,0,0,0,2,2,2,0,2,0,2,2,0,0,0,0,0,0,0,0,2,2,0,0,0,6],
  // row 21
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
];

// ─── SOLID TILES ──────────────────────────────────────────
export const SOLID_TILES = new Set([6, 7, 4]);

// ─── INTERACTABLE OBJECTS ─────────────────────────────────
export const OBJECTS: InteractableObject[] = [
  // Campfires
  { id: "campfire-1", type: "campfire", tileX: 14, tileY: 11, width: 1, height: 1, solid: false, label: "Warm campfire 🔥", state: "burning" },
  // Well (center)
  { id: "well-1", type: "well", tileX: 14, tileY: 12, width: 1, height: 1, solid: true, label: "Village Well 💧" },
  // Doors on houses
  { id: "door-h1", type: "door", tileX: 8, tileY: 6, width: 1, height: 1, solid: true, label: "Home of Elder Oak", state: "closed" },
  { id: "door-h2", type: "door", tileX: 20, tileY: 6, width: 1, height: 1, solid: true, label: "Blacksmith Workshop", state: "closed" },
  { id: "door-h3", type: "door", tileX: 9, tileY: 18, width: 1, height: 1, solid: true, label: "Inn & Tavern", state: "closed" },
  { id: "door-h4", type: "door", tileX: 24, tileY: 18, width: 1, height: 1, solid: true, label: "General Store", state: "closed" },
  // Signs
  { id: "sign-1", type: "sign", tileX: 12, tileY: 8, width: 1, height: 1, solid: false, label: "📜 Welcome to Verdant Village! Population: 42" },
  { id: "sign-2", type: "sign", tileX: 15, tileY: 12, width: 1, height: 1, solid: false, label: "📜 Town Square — Gather here at dusk" },
  // Chest
  { id: "chest-1", type: "chest", tileX: 15, tileY: 13, width: 1, height: 1, solid: true, label: "Treasure Chest 🎁", state: "closed" },
];

// ─── COLLISION MAP ─────────────────────────────────────────
export function buildCollisionMap(openDoors: Set<string>): boolean[][] {
  const map: boolean[][] = BASE_MAP.map((row) =>
    row.map((t) => SOLID_TILES.has(t))
  );
  // Objects
  for (const obj of OBJECTS) {
    if (!obj.solid) continue;
    if (obj.type === "door" && openDoors.has(obj.id)) continue;
    for (let dy = 0; dy < obj.height; dy++) {
      for (let dx = 0; dx < obj.width; dx++) {
        const r = obj.tileY + dy;
        const c = obj.tileX + dx;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) map[r][c] = true;
      }
    }
  }
  return map;
}

// ─── NPC PATHS ─────────────────────────────────────────────
import { TILE } from "@/types";

export const NPC_DEFS = [
  {
    id: "npc-elder",
    name: "Elder Oak",
    spriteSx: 0, spriteSy: 0,
    startX: 10 * TILE, startY: 10 * TILE,
    dialogue: [
      "Welcome, traveller! Verdant Village is peaceful.",
      "The campfire burns every night at the square.",
      "Beware the east forest after dark…",
    ],
    walkPath: [
      { x: 10 * TILE, y: 10 * TILE },
      { x: 12 * TILE, y: 10 * TILE },
      { x: 12 * TILE, y: 12 * TILE },
      { x: 10 * TILE, y: 12 * TILE },
    ],
  },
  {
    id: "npc-merchant",
    name: "Mira the Merchant",
    spriteSx: 48, spriteSy: 0,
    startX: 22 * TILE, startY: 14 * TILE,
    dialogue: [
      "Fresh goods at the General Store!",
      "Trade routes from the capital arrived today.",
      "I have potions, seeds, and maps!",
    ],
    walkPath: [
      { x: 22 * TILE, y: 14 * TILE },
      { x: 24 * TILE, y: 14 * TILE },
      { x: 24 * TILE, y: 16 * TILE },
      { x: 22 * TILE, y: 16 * TILE },
    ],
  },
  {
    id: "npc-blacksmith",
    name: "Bjorn",
    spriteSx: 0, spriteSy: 48,
    startX: 19 * TILE, startY: 9 * TILE,
    dialogue: [
      "I can forge the finest swords in the region.",
      "My workshop is just north of here.",
      "Bring me iron ore and I'll make you armour.",
    ],
    walkPath: [
      { x: 19 * TILE, y: 9 * TILE },
      { x: 21 * TILE, y: 9 * TILE },
      { x: 21 * TILE, y: 11 * TILE },
      { x: 19 * TILE, y: 11 * TILE },
    ],
  },
];
