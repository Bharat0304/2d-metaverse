import json
import random

# Serene_Village_32x32.png: 608px wide, 1440px tall, 32px tiles, 19 columns, 45 rows
# Tile IDs are 1-indexed (GID = row*19 + col + 1)
# Row/col are 0-indexed here
def tid(row, col):
    return row * 19 + col + 1

# ── Key tile IDs from Serene Village 32x32 ──────────────────────────────────
# Row 0: grass/ground base tiles
GRASS          = tid(0, 0)   # 1  - main grass
GRASS2         = tid(0, 1)   # 2
GRASS3         = tid(0, 2)   # 3
GRASS_LIGHT    = tid(0, 4)   # 5
GRASS_DARK     = tid(0, 5)   # 6

# Row 1: more grass / ground variants
DIRT           = tid(1, 0)   # 20 - dirt path
DIRT2          = tid(1, 1)   # 21
DIRT3          = tid(1, 2)   # 22
GROUND         = tid(1, 3)   # 23
GROUND2        = tid(1, 4)   # 24

# Row 2: water / water edges
WATER          = tid(2, 0)   # 39
WATER2         = tid(2, 1)   # 40
WATER3         = tid(2, 2)   # 41

# Row 3: stone/cobblestone
STONE          = tid(3, 0)   # 58
STONE2         = tid(3, 1)   # 59
COBBLE         = tid(3, 2)   # 60

# Row 4: more decorative ground
SAND           = tid(4, 0)   # 77
SAND2          = tid(4, 1)   # 78

WIDTH  = 60
HEIGHT = 60

# ── Build base layer: all grass ───────────────────────────────────────────────
random.seed(42)
data = []
for y in range(HEIGHT):
    for x in range(WIDTH):
        # Slight grass variety to make it look natural
        r = random.random()
        if r < 0.75:
            data.append(GRASS)
        elif r < 0.88:
            data.append(GRASS2)
        elif r < 0.95:
            data.append(GRASS3)
        else:
            data.append(GRASS_LIGHT)

def set_tile(x, y, tile):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        data[y * WIDTH + x] = tile

def fill_rect(x1, y1, x2, y2, tile):
    for y in range(y1, y2 + 1):
        for x in range(x1, x2 + 1):
            set_tile(x, y, tile)

def draw_hpath(y, x1, x2, tile=DIRT, tile2=DIRT2):
    for x in range(x1, x2 + 1):
        set_tile(x, y, tile if (x + y) % 2 == 0 else tile2)

def draw_vpath(x, y1, y2, tile=DIRT, tile2=DIRT2):
    for y in range(y1, y2 + 1):
        set_tile(x, y, tile if (x + y) % 2 == 0 else tile2)

# ── Main dirt road: horizontal through center ─────────────────────────────────
for dy in range(3):
    draw_hpath(28 + dy, 0, WIDTH - 1)

# ── Main dirt road: vertical through center ────────────────────────────────────
for dx in range(3):
    draw_vpath(28 + dx, 0, HEIGHT - 1)

# ── Cobblestone central plaza (intersection)  ─────────────────────────────────
fill_rect(27, 27, 32, 32, COBBLE)

# ── Stone paths: secondary roads ──────────────────────────────────────────────
for dy in range(2):
    draw_hpath(14 + dy, 0, 26)
    draw_hpath(14 + dy, 33, WIDTH - 1)
    draw_hpath(45 + dy, 0, 26)
    draw_hpath(45 + dy, 33, WIDTH - 1)

for dx in range(2):
    draw_vpath(14 + dx, 0, 26)
    draw_vpath(14 + dx, 33, HEIGHT - 1)
    draw_vpath(45 + dx, 0, 26)
    draw_vpath(45 + dx, 33, HEIGHT - 1)

# ── Lake in top-left quadrant ─────────────────────────────────────────────────
for y in range(4, 12):
    for x in range(4, 12):
        # Oval-ish lake
        cx, cy = 7.5, 7.5
        if (x - cx) ** 2 / 16 + (y - cy) ** 2 / 12 <= 1:
            set_tile(x, y, WATER)
        elif (x - cx) ** 2 / 20 + (y - cy) ** 2 / 16 <= 1:
            set_tile(x, y, WATER2)

# ── Small pond in bottom-right quadrant ───────────────────────────────────────
for y in range(46, 56):
    for x in range(46, 56):
        cx, cy = 51, 51
        if (x - cx) ** 2 / 9 + (y - cy) ** 2 / 9 <= 1:
            set_tile(x, y, WATER)

# ── Stone building footprints (town hall, inn, market) ────────────────────────
fill_rect(3, 33, 10, 40, STONE)
fill_rect(20, 3, 26, 10, STONE2)
fill_rect(34, 34, 42, 42, STONE)
fill_rect(34, 4, 43, 11, STONE2)

# ── Sand border around the edges of the map ───────────────────────────────────
for x in range(WIDTH):
    set_tile(x, 0, SAND)
    set_tile(x, HEIGHT - 1, SAND)
for y in range(HEIGHT):
    set_tile(0, y, SAND)
    set_tile(WIDTH - 1, y, SAND)

# ─────────────────────────────────────────────────────────────────────────────
map_json = {
    "compressionlevel": -1,
    "height": HEIGHT,
    "infinite": False,
    "layers": [
        {
            "data": data,
            "height": HEIGHT,
            "id": 1,
            "name": "Tile Layer 1",
            "opacity": 1,
            "type": "tilelayer",
            "visible": True,
            "width": WIDTH,
            "x": 0,
            "y": 0,
        }
    ],
    "nextlayerid": 2,
    "nextobjectid": 1,
    "orientation": "orthogonal",
    "renderorder": "right-down",
    "tiledversion": "1.11.2",
    "tileheight": 32,
    "tilesets": [
        {
            "columns": 19,
            "firstgid": 1,
            "image": "Serene_Village_32x32.png",
            "imageheight": 1440,
            "imagewidth": 608,
            "margin": 0,
            "name": "MY_TILESET",
            "spacing": 0,
            "tilecount": 855,
            "tileheight": 32,
            "tilewidth": 32,
        }
    ],
    "tilewidth": 32,
    "type": "map",
    "version": "1.10",
    "width": WIDTH,
}

out = "public/assets/village/village.json"
with open(out, "w") as f:
    json.dump(map_json, f)

print(f"Generated {WIDTH}x{HEIGHT} village map → {out}")
print(f"Total tiles: {len(data)} (expected {WIDTH*HEIGHT})")
print(f"Tile variety: grass={data.count(GRASS)}, dirt={data.count(DIRT)}, water={data.count(WATER)}, cobble={data.count(COBBLE)}, stone={data.count(STONE)}")
