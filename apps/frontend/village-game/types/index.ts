export type Direction = "up" | "down" | "left" | "right";
export type PlayerState = "idle" | "walking" | "sitting" | "dancing";

export interface Vec2 { x: number; y: number; }

export interface Player {
  id: string;
  name: string;
  color: string;        // hue-rotate for avatar tinting
  avatarRow: number;    // which row in character sheet (0=red, 1=green, 2=blue, 3=yellow)
  x: number;           // pixel X
  y: number;           // pixel Y
  dir: Direction;
  state: PlayerState;
  animFrame: number;
  chatText: string;
  chatTimer: number;
  emote: string;
  emoteTimer: number;
}

export interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  dir: Direction;
  animFrame: number;
  walkPath: Vec2[];
  pathIdx: number;
  pauseTimer: number;
  dialogue: string[];
  dialogueIdx: number;
  spriteSx: number; // sprite sheet X offset
  spriteSy: number; // sprite sheet Y offset
}

export interface InteractableObject {
  id: string;
  type: "campfire" | "door" | "sign" | "well" | "chest";
  tileX: number;
  tileY: number;
  width: number;       // in tiles
  height: number;
  solid: boolean;
  label: string;
  state?: "open" | "closed" | "burning" | "off";
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  color: string;
  text: string;
  timestamp: number;
}

export const TILE = 48;
export const COLS = 30;
export const ROWS = 22;
export const MOVE_SPEED = 3;
export const VP_W = 960;
export const VP_H = 640;

// Tileset crop helpers
export interface TileRef {
  sheet: "tileset" | "houses" | "outside" | "terrains" | "village01";
  sx: number; sy: number;  // pixel offset in sheet
  sw: number; sh: number;  // pixel size
}
