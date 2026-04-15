"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  TILE, COLS, ROWS, MOVE_SPEED,
  type Player, type NPC, type ChatMessage, type Direction,
} from "@/types";
import { OBJECTS, NPC_DEFS, buildCollisionMap } from "@/lib/mapData";

const CHAT_TIMEOUT = 5000;
const EMOTE_TIMEOUT = 3000;
const NPC_STEP_DELAY = 80; // ms between NPC movement steps

const EMOTES = ["👋", "❤️", "😄", "🎉", "👍", "💬", "🎵", "⭐"];

function makePlayer(): Player {
  return {
    id: "you",
    name: "YOU",
    color: "#9b5de5",
    avatarRow: 0,
    x: 14 * TILE,
    y: 9 * TILE,
    dir: "down",
    state: "idle",
    animFrame: 0,
    chatText: "",
    chatTimer: 0,
    emote: "",
    emoteTimer: 0,
  };
}

function makeNPCs(): NPC[] {
  return NPC_DEFS.map((def) => ({
    id: def.id,
    name: def.name,
    x: def.startX,
    y: def.startY,
    dir: "down" as Direction,
    animFrame: 0,
    walkPath: def.walkPath,
    pathIdx: 0,
    pauseTimer: 0,
    dialogue: def.dialogue,
    dialogueIdx: 0,
    spriteSx: def.spriteSx,
    spriteSy: def.spriteSy,
  }));
}

export function useVillageEngine() {
  const [player, setPlayer] = useState<Player>(makePlayer());
  const [npcs, setNpcs] = useState<NPC[]>(makeNPCs());
  const [openDoors, setOpenDoors] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "0", playerId: "sys", playerName: "SYSTEM", color: "#06d6a0", text: "Welcome to Verdant Village! Use WASD/arrows to move. Press E to interact.", timestamp: Date.now() },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [nearbyObj, setNearbyObj] = useState<string | null>(null);
  const [nearbyNPC, setNearbyNPC] = useState<NPC | null>(null);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<{ npc: NPC; line: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [openChests, setOpenChests] = useState<Set<string>>(new Set());
  const [campfireOn, setCampfireOn] = useState(true);
  const [campfireFrame, setCampfireFrame] = useState(0);
  const [onlinePlayers] = useState([
    { id: "p1", name: "PixelWolf", color: "#ff4d6d", x: 8 * TILE, y: 14 * TILE },
    { id: "p2", name: "Mochi", color: "#06d6a0", x: 18 * TILE, y: 12 * TILE },
    { id: "p3", name: "Zara", color: "#ffd166", x: 22 * TILE, y: 9 * TILE },
  ]);

  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const npcTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const campfireRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotif = useCallback((msg: string) => {
    setNotification(msg);
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => setNotification(null), 2800);
  }, []);

  // ── INTERACT ──────────────────────────────────────────
  const interact = useCallback(() => {
    // NPC dialogue
    if (nearbyNPC) {
      const npc = nearbyNPC;
      const line = npc.dialogue[npc.dialogueIdx % npc.dialogue.length];
      setActiveDialogue({ npc, line });
      setDialogueOpen(true);
      setNpcs((prev) =>
        prev.map((n) => n.id === npc.id ? { ...n, dialogueIdx: n.dialogueIdx + 1 } : n)
      );
      return;
    }

    if (!nearbyObj) return;
    const obj = OBJECTS.find((o) => o.id === nearbyObj);
    if (!obj) return;

    if (obj.type === "door") {
      setOpenDoors((prev) => {
        const next = new Set(prev);
        if (next.has(obj.id)) { next.delete(obj.id); showNotif("Door closed."); }
        else { next.add(obj.id); showNotif(`🚪 ${obj.label} — Entered!`); }
        return next;
      });
      return;
    }

    if (obj.type === "campfire") {
      setCampfireOn((v) => !v);
      showNotif(campfireOn ? "🔥 Campfire extinguished." : "🔥 Campfire lit!");
      return;
    }

    if (obj.type === "chest") {
      if (!openChests.has(obj.id)) {
        setOpenChests((prev) => new Set([...prev, obj.id]));
        showNotif("🎁 Found: 50 gold coins + Rare seed!");
        addChat("SYSTEM", "#ffd166", "YOU found treasure in the chest! ✨");
      } else {
        showNotif("📦 Chest is empty.");
      }
      return;
    }

    showNotif(obj.label);
  }, [nearbyObj, nearbyNPC, openChests, campfireOn, showNotif]);

  const addChat = useCallback((name: string, color: string, text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      playerId: "you",
      playerName: name,
      color,
      text,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev.slice(-40), msg]);
  }, []);

  const sendChat = useCallback((text: string) => {
    if (!text.trim()) return;
    addChat("YOU", "#9b5de5", text.trim());
    setPlayer((p) => ({ ...p, chatText: text.trim(), chatTimer: CHAT_TIMEOUT }));
  }, [addChat]);

  const sendEmote = useCallback((emote: string) => {
    setPlayer((p) => ({ ...p, emote, emoteTimer: EMOTE_TIMEOUT }));
    addChat("YOU", "#9b5de5", `${emote}`);
  }, [addChat]);

  // ── CAMPFIRE ANIMATION ────────────────────────────────
  useEffect(() => {
    campfireRef.current = setInterval(() => {
      setCampfireFrame((f) => (f + 1) % 4);
    }, 150);
    return () => { if (campfireRef.current) clearInterval(campfireRef.current); };
  }, []);

  // ── NPC MOVEMENT ─────────────────────────────────────
  useEffect(() => {
    npcTimerRef.current = setInterval(() => {
      setNpcs((prev) =>
        prev.map((npc) => {
          if (npc.pauseTimer > 0) return { ...npc, pauseTimer: npc.pauseTimer - NPC_STEP_DELAY };
          const target = npc.walkPath[npc.pathIdx];
          const dx = target.x - npc.x;
          const dy = target.y - npc.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 2) {
            const nextIdx = (npc.pathIdx + 1) % npc.walkPath.length;
            return { ...npc, x: target.x, y: target.y, pathIdx: nextIdx, pauseTimer: nextIdx === 0 ? 2000 : 400, animFrame: 0 };
          }
          const speed = 1.2;
          const nx = npc.x + (dx / dist) * speed;
          const ny = npc.y + (dy / dist) * speed;
          let dir: Direction = "down";
          if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? "right" : "left";
          else dir = dy > 0 ? "down" : "up";
          return { ...npc, x: nx, y: ny, dir, animFrame: (npc.animFrame + 1) % 8 };
        })
      );
    }, NPC_STEP_DELAY);
    return () => { if (npcTimerRef.current) clearInterval(npcTimerRef.current); };
  }, []);

  // ── GAME LOOP ─────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      frameRef.current++;
      const keys = keysRef.current;

      setPlayer((prev) => {
        let { x, y, dir, state, animFrame, chatTimer, emoteTimer } = prev;
        let dx = 0, dy = 0;

        if (keys.has("ArrowUp")    || keys.has("w") || keys.has("W")) dy = -1;
        if (keys.has("ArrowDown")  || keys.has("s") || keys.has("S")) dy =  1;
        if (keys.has("ArrowLeft")  || keys.has("a") || keys.has("A")) dx = -1;
        if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx =  1;

        if (dx !== 0 || dy !== 0) {
          if      (dy < 0) dir = "up";
          else if (dy > 0) dir = "down";
          else if (dx < 0) dir = "left";
          else             dir = "right";

          const len = Math.sqrt(dx * dx + dy * dy);
          const vx = (dx / len) * MOVE_SPEED;
          const vy = (dy / len) * MOVE_SPEED;

          const collision = buildCollisionMap(new Set()); // re-use cached in real impl
          const nx = x + vx;
          const ny = y + vy;
          const hw = 14, hh = 10; // hitbox half-size

          const colAtPoint = (px: number, py: number) => {
            const tc = Math.floor(px / TILE);
            const tr = Math.floor(py / TILE);
            return (collision[tr]?.[tc]) ?? true;
          };

          const blockedX = colAtPoint(nx + hw, y) || colAtPoint(nx - hw, y);
          const blockedY = colAtPoint(x, ny + hh) || colAtPoint(x, ny - hh);

          if (!blockedX) x = Math.max(TILE, Math.min((COLS - 1) * TILE - 1, nx));
          if (!blockedY) y = Math.max(TILE, Math.min((ROWS - 1) * TILE - 1, ny));

          state = "walking";
          if (frameRef.current % 7 === 0) animFrame = (animFrame + 1) % 4;
        } else {
          state = "idle";
          animFrame = 0;
        }

        chatTimer  = Math.max(0, chatTimer  - 16);
        emoteTimer = Math.max(0, emoteTimer - 16);

        return {
          ...prev, x, y, dir, state, animFrame,
          chatTimer, emoteTimer,
          chatText:  chatTimer  > 0 ? prev.chatText  : "",
          emote:     emoteTimer > 0 ? prev.emote     : "",
        };
      });

      // Proximity detection
      setPlayer((prev) => {
        const px = prev.x / TILE, py = prev.y / TILE;

        let closestObj: string | null = null;
        let closestObjDist = Infinity;
        for (const obj of OBJECTS) {
          const d = Math.hypot(px - (obj.tileX + 0.5), py - (obj.tileY + 0.5));
          if (d < 1.8 && d < closestObjDist) { closestObj = obj.id; closestObjDist = d; }
        }
        setNearbyObj(closestObj);

        let closestNPC: NPC | null = null;
        let closestNPCDist = Infinity;
        setNpcs((npcs) => {
          for (const npc of npcs) {
            const d = Math.hypot(prev.x - npc.x, prev.y - npc.y);
            if (d < TILE * 2 && d < closestNPCDist) { closestNPC = npc; closestNPCDist = d; }
          }
          setNearbyNPC(closestNPC);
          return npcs;
        });

        return prev;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── KEYS ──────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === "e" || e.key === "E") interact();
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [interact]);

  return {
    player, npcs, onlinePlayers, openDoors, chatMessages, chatInput, setChatInput,
    sendChat, sendEmote, nearbyObj, nearbyNPC, dialogueOpen, setDialogueOpen,
    activeDialogue, notification, openChests, campfireOn, campfireFrame,
    interact, EMOTES,
  };
}
