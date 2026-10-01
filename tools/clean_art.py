from pathlib import Path
from PIL import Image

# Generated cut-outs occasionally carry low-opacity neon pixels at their edge.
# Keep the painted core, discard only saturated translucent fringe pixels.
for source, target in [('short-v1.webp', 'short-v2.png'), ('long-v1.webp', 'long-v2.png'), ('plush-v1.webp', 'plush-v2.png'), ('furniture-v2.png', 'furniture-v3.png')]:
    image = Image.open(Path('assets') / source).convert('RGBA')
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            spread = max(r, g, b) - min(r, g, b)
            if a < 64 or (a < 230 and spread > 95):
                pixels[x, y] = (0, 0, 0, 0)
    image.save(Path('assets') / target, optimize=True)

