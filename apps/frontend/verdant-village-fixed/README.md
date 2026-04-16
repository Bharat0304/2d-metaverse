# 🌿 Verdant Village — Pixel Metaverse

A Gather Town-style village metaverse built with **Next.js 15 + TypeScript + Tailwind + Canvas API**, using the **Serene Village** tileset.

---

## Quick Start

```bash
# 1. Unzip and enter the project
cd verdant-village

# 2. Copy your sprite sheets into public/sprites/
#    The following files must be present:
#    public/sprites/tileset.png     (Serene_Village_48x48.png)
#    public/sprites/houses.png      (Houses_TILESET_B-C-D-E.png)
#    public/sprites/campfire.png    (__Campfire.png)
#    public/sprites/door.png        (__door.png)
#    public/sprites/outside.png     (Outside_Stuff_TILESET_B-C-D-E.png)
#    public/sprites/terrains.png    (Terrains_TILESET_B-C-D-E.png)
#    public/sprites/village01.png   (B-C-D-E_Serene_Village_01.png)

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev

# 5. Open in browser
open http://localhost:3000
```

> The app auto-redirects `/` → `/game`

---

## Controls

| Key | Action |
|-----|--------|
| `W A S D` / Arrow Keys | Move your character |
| `E` | Interact with nearby object or NPC |
| `Enter` | Send a chat message |
| Click on interact prompt | Same as pressing E |

---

## Features

### 🗺️ Village Map (30×22 tiles × 48px each)
- Lush grass terrain with path network (dirt + stone)
- Water pond with shimmer animation
- Flower patches and decorative tiles
- Border forest (solid trees block movement)
- 4 houses rendered from the Houses tileset

### 🏠 Interactive Objects
| Object | Interaction |
|--------|-------------|
| 🚪 Doors (×4) | Press E to open/close |
| 🔥 Campfire | Press E to light/extinguish (animated) |
| 💧 Well | Press E to inspect |
| 📜 Signs (×2) | Press E to read messages |
| 🎁 Treasure Chest | Press E to open (one-time loot!) |

### 👥 Multiplayer Feel
- 3 simulated online players (PixelWolf, Mochi, Zara) roam the map
- 3 NPCs with walking paths and multi-line dialogue
- Chat panel with real-time messages
- Players list tab showing all online avatars
- Minimap shows all player positions

### 💬 Chat & Emotes
- Type in the chat box and press Enter to send
- Your message appears as a bubble above your character (5 second timer)
- Click 😄 button to open emote picker
- Emotes appear as floating icons above your character

---

## File Structure

```
verdant-village/
├── app/
│   ├── game/page.tsx       ← Game page (SSR disabled)
│   ├── layout.tsx
│   ├── page.tsx            ← Redirects to /game
│   └── globals.css
│
├── components/
│   ├── VillageGame.tsx     ← Main game view + camera + entity sorting
│   ├── TileCanvas.tsx      ← Canvas tile renderer (uses sprite sheets)
│   ├── Avatar.tsx          ← SVG avatar + NPC sprites + walking animation
│   └── HUD.tsx             ← Chat, minimap, dialogue, notifications
│
├── lib/
│   ├── mapData.ts          ← 30×22 tile map, objects, NPC definitions, collision
│   └── useVillageEngine.ts ← Game loop, movement, interaction, NPC AI, chat
│
├── types/
│   └── index.ts            ← All TypeScript interfaces + constants
│
└── public/
    └── sprites/            ← All tileset PNG files go here
        ├── tileset.png
        ├── houses.png
        ├── campfire.png
        ├── door.png
        ├── outside.png
        ├── terrains.png
        └── village01.png
```

---

## Extending the Map

### Add a new interactable object
Edit `lib/mapData.ts` — add to the `OBJECTS` array:

```ts
{
  id: "my-sign",
  type: "sign",
  tileX: 16, tileY: 10,
  width: 1, height: 1,
  solid: false,
  label: "📜 This is my custom sign!",
}
```

### Add a new NPC
Add to `NPC_DEFS` in `lib/mapData.ts`:

```ts
{
  id: "npc-farmer",
  name: "Old Farmer",
  spriteSx: 0, spriteSy: 96,
  startX: 5 * TILE, startY: 16 * TILE,
  dialogue: [
    "The harvest was good this year.",
    "Have you visited the well yet?",
  ],
  walkPath: [
    { x: 5 * TILE, y: 16 * TILE },
    { x: 8 * TILE, y: 16 * TILE },
  ],
},
```

### Resize the map
Change `COLS` and `ROWS` in `types/index.ts`, then update `BASE_MAP` in `lib/mapData.ts`.

---

## Architecture Notes

- **TileCanvas** — uses `useEffect` + `requestAnimationFrame`-driven re-renders. Sprite sheets loaded once into a ref, then drawn every frame with `ctx.drawImage`.
- **useVillageEngine** — single `rAF` loop for the player, separate `setInterval` for NPC movement. Collision detection uses a boolean 2D array rebuilt from map + object state.
- **Avatar** — pure SVG pixel art characters. Walking animation driven by `animFrame % 4` with leg bob offsets.
- **Painter's algorithm** — all entities (player + NPCs + other players) sorted by Y before rendering, so characters behind trees/houses appear correctly.

---

## Tileset Credits

Serene Village tileset by RPG tileset pack (B-C-D-E variant).  
All sprites in `public/sprites/` must be provided by you.
