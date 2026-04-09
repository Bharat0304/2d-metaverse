import json

width = 60
height = 60

# Fill with grass (tile 1)
data = [1] * (width * height)

# Add a path horizontally (let's try tile 19 or 20)
for x in range(width):
    data[x + 15 * width] = 20
    data[x + 16 * width] = 20

# Add a water block
for y in range(20, 25):
    for x in range(20, 25):
        data[x + y * width] = 2

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
