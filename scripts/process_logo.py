"""Process the new brand logo PNG:
1. Convert to RGBA and make near-black background transparent.
2. Detect the gap between the building mark and the textual brand line at the bottom.
3. Crop to the mark only and tight-fit to its bounding box.
4. Save the cleaned mark to public/images/logo-mark.png.
5. Also write a square-padded version (transparent canvas) for favicons / apple-touch-icon.

Run with:  python3 scripts/process_logo.py
"""

from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(
    "/Users/lukiansilagadze/.cursor/projects/Users-lukiansilagadze-Projects-svay-engineering/"
    "assets/ChatGPT_Image_26_____2026__.__10_39_20-e9b767d8-acfc-4718-b628-2b4769877a93.png"
)
OUT_MARK = ROOT / "public" / "images" / "logo-mark.png"
OUT_LIGHT = ROOT / "public" / "images" / "logo-mark-light.png"
OUT_FAV_32 = ROOT / "public" / "favicon-32.png"
OUT_FAV_192 = ROOT / "public" / "favicon-192.png"
OUT_APPLE = ROOT / "public" / "apple-touch-icon.png"


# Pixel is considered background if it's near-black.
BG_THRESHOLD = 22


def black_mask(rgb):
    r, g, b = rgb
    return r <= BG_THRESHOLD and g <= BG_THRESHOLD and b <= BG_THRESHOLD


def remove_black_bg(im: Image.Image) -> Image.Image:
    """Return RGBA image where near-black pixels are fully transparent."""
    im = im.convert("RGBA")
    pixels = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r <= BG_THRESHOLD and g <= BG_THRESHOLD and b <= BG_THRESHOLD:
                pixels[x, y] = (0, 0, 0, 0)
    return im


def find_mark_bottom(rgba: Image.Image) -> int:
    """Find the y where the mark ends, looking for a horizontal gap of empty rows
    between the building mark (top) and the brand text (bottom).
    """
    px = rgba.load()
    w, h = rgba.size
    row_has_content = [False] * h
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 0:
                row_has_content[y] = True
                break

    in_gap = False
    gap_start = 0
    GAP_MIN = 30
    last_content_before_gap = 0
    for y in range(h):
        if not row_has_content[y]:
            if not in_gap:
                in_gap = True
                gap_start = y
        else:
            if in_gap:
                if y - gap_start >= GAP_MIN and last_content_before_gap > h * 0.3:
                    return last_content_before_gap
                in_gap = False
            last_content_before_gap = y
    return h


def crop_tight(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    return im.crop(bbox)


def pad_uniform(im: Image.Image, pad_ratio: float = 0.06) -> Image.Image:
    """Add a uniform transparent padding around the content, preserving aspect ratio."""
    w, h = im.size
    pad = int(max(w, h) * pad_ratio)
    canvas = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad), im)
    return canvas


def pad_square_on_bg(im: Image.Image, color, pad_ratio: float = 0.12) -> Image.Image:
    w, h = im.size
    side = max(w, h)
    pad = int(side * pad_ratio)
    canvas_side = side + pad * 2
    canvas = Image.new("RGBA", (canvas_side, canvas_side), color)
    canvas.paste(im, ((canvas_side - w) // 2, (canvas_side - h) // 2), im)
    return canvas


def main():
    raw = Image.open(SRC)
    rgba = remove_black_bg(raw)

    bottom_of_mark = find_mark_bottom(rgba)
    mark_only = rgba.crop((0, 0, rgba.width, bottom_of_mark))
    mark_tight = crop_tight(mark_only)
    mark_padded = pad_uniform(mark_tight, pad_ratio=0.04)

    # Main asset for header/footer/JSON-LD logo.
    OUT_MARK.parent.mkdir(parents=True, exist_ok=True)
    mark_padded.save(OUT_MARK, "PNG", optimize=True)
    # Light alias kept identical (it's the same mark; backgrounds are dark in the UI).
    mark_padded.save(OUT_LIGHT, "PNG", optimize=True)

    # Favicons: render mark on brand-dark background so the silhouette is recognizable
    # at very small sizes (favicons would otherwise look smudged on transparent BG in some UAs).
    brand_bg = (11, 27, 44, 255)  # --color-bg
    fav_base = pad_square_on_bg(mark_tight, brand_bg, pad_ratio=0.15)
    fav_base.resize((512, 512), Image.LANCZOS).resize((192, 192), Image.LANCZOS).save(
        OUT_FAV_192, "PNG", optimize=True
    )
    fav_base.resize((128, 128), Image.LANCZOS).resize((32, 32), Image.LANCZOS).save(
        OUT_FAV_32, "PNG", optimize=True
    )
    fav_base.resize((720, 720), Image.LANCZOS).resize((180, 180), Image.LANCZOS).save(
        OUT_APPLE, "PNG", optimize=True
    )

    print(f"Mark saved to {OUT_MARK} ({mark_padded.size})")
    print(f"Mark light saved to {OUT_LIGHT}")
    print(f"Favicon 32 saved to {OUT_FAV_32}")
    print(f"Favicon 192 saved to {OUT_FAV_192}")
    print(f"Apple touch icon saved to {OUT_APPLE}")


if __name__ == "__main__":
    main()
