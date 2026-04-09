import json
import random

width = 60
height = 60

# We'll use tiles from 30 to 200 to avoid the transparent/empty ones at the top left.
data = []
for _ in range(width * height):
    # Mostly grass-like (let's hope 55, 56, 57 are grass)
    if random.random() < 0.8:
        data.append(55)
    else:
        # Occasionally mix in other tiles to see houses/trees
        data.append(random.randint(100, 300))

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
