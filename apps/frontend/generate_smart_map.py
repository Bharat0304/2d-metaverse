import json
import random

width = 40
height = 30

GRASS = 73     # Guessed from glitch map - top of edge block
PATH = 82      # Guessed from glitch map
WATER = 152    # Guessed from glitch map - solid blue

data = [GRASS] * (width * height)

# Add a lake
for y in range(18, 28):
    for x in range(25, 38):
        if random.random() < 0.9:
            data[x + y * width] = WATER

# Add a village square path
for y in range(12, 18):
    for x in range(10, 20):
        data[x + y * width] = PATH

# Paths leading away from the square
for x in range(15, 35):
    data[x + 14 * width] = PATH
    data[x + 15 * width] = PATH

# Sprinkle some random objects for texture
for _ in range(30):
    rx = random.randint(2, width-2)
    ry = random.randint(2, height-2)
    if data[rx + ry*width] == GRASS:
        data[rx + ry*width] = GRASS + random.choice([1, 2, 5]) 

map_json = {
  "compressionlevel": -1,
  "height": height,
  "infinite": False,
  "layers": [
    {
      "data": data,
      "height": height,
      "id": 1,
      "name": "Tile Layer 1",
      "opacity": 1,
      "type": "tilelayer",
      "visible": True,
      "width": width,
      "x": 0,
      "y": 0
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
      "tilewidth": 32
    }
  ],
  "tilewidth": 32,
  "type": "map",
  "version": "1.10",
  "width": width
}

with open('public/assets/village/village.json', 'w') as f:
    json.dump(map_json, f)
