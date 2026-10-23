"""Paint an original STRYDE mural onto the grey studio wall bake.

Replaces the previous third-party graffiti artwork entirely. The coarse baked
lighting of the source wall is kept so the mural sits in the scene's lighting.

Usage:
  python3 scripts/assets/paint_wall_mural.py <source_wall.webp> <dest_wall.webp> <font.ttf>
"""

import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

rng = np.random.default_rng(7)


def fbm(h, w, octaves=6, base=8):
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        res = base * 2**o
        n = rng.random((res, res)).astype(np.float32)
        out += cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC) * amp
        total += amp
        amp *= 0.5
    return out / total


def letters_mask(text, font_path, width, height, top):
    font = ImageFont.truetype(font_path, 400)
    tmp = Image.new("L", (6000, 800), 0)
    d = ImageDraw.Draw(tmp)
    x = 20
    for c in text:
        d.text((x, 100), c, font=font, fill=255)
        x += font.getlength(c) + 110
    tmp = tmp.crop(tmp.getbbox())
    scale = width / tmp.width
    tmp = tmp.resize((int(width), int(tmp.height * scale)), Image.LANCZOS)
    canvas = Image.new("L", (W, H), 0)
    canvas.paste(tmp, (int((W - tmp.width) / 2), int(top)))
    return np.asarray(canvas).astype(np.float32) / 255.0


def main():
    global W, H
    src_path, dst_path, font_path = sys.argv[1:4]
    src = Image.open(src_path)
    alpha = src.getchannel("A") if src.mode == "RGBA" else None
    rgb = np.asarray(src.convert("RGB")).astype(np.float32)
    H, W = rgb.shape[:2]
    lum = rgb.mean(axis=2)
    island = (lum > 3).astype(np.float32)
    ys, xs = np.where(island > 0)
    y0, y1 = ys.min(), ys.max()
    x0, x1 = xs.min(), xs.max()

    # Concrete base.
    grain = fbm(H, W, 7, 6)
    fine = rng.normal(0, 1, (H, W)).astype(np.float32)
    fine = cv2.GaussianBlur(fine, (0, 0), 1.2)
    concrete = 52 + 34 * (grain - 0.5) + 5 * fine
    mural = np.stack([concrete * 0.98, concrete, concrete * 1.03], axis=2)

    # Large colour fields: architectural blocks rather than tags.
    blocks = np.zeros((H, W, 3), np.float32)
    bmask = np.zeros((H, W), np.float32)
    span_h = y1 - y0
    for (fx0, fy0, fx1, fy1, col) in [
        (0.00, 0.08, 0.30, 0.62, (34, 92, 112)),
        (0.70, 0.10, 1.00, 0.70, (150, 38, 34)),
    ]:
        m = np.zeros((H, W), np.float32)
        cv2.rectangle(
            m,
            (int(x0 + fx0 * (x1 - x0)), int(y0 + fy0 * span_h)),
            (int(x0 + fx1 * (x1 - x0)), int(y0 + fy1 * span_h)),
            1.0,
            -1,
        )
        blocks += m[..., None] * np.array(col, np.float32)
        bmask = np.maximum(bmask, m)
    wear = (fbm(H, W, 6, 28) > 0.40).astype(np.float32)
    wear = cv2.GaussianBlur(wear, (0, 0), 1.5)
    bmask *= wear * 0.85
    mural = mural * (1 - bmask[..., None]) + blocks * bmask[..., None] / np.maximum(bmask[..., None], 1e-3) * bmask[..., None]

    # Wordmark: ochre letters with a hard black keyline and chipped paint.
    width = (x1 - x0) * 0.86
    letters = letters_mask("STRYDE", font_path, width, H, y0 + span_h * 0.24)
    outline = cv2.dilate((letters > 0.5).astype(np.uint8), np.ones((41, 41), np.uint8)).astype(np.float32)
    outline = cv2.GaussianBlur(outline, (0, 0), 2)
    mural = mural * (1 - outline[..., None] * 0.9) + np.array([14, 14, 16], np.float32) * outline[..., None] * 0.9
    chips = (fbm(H, W, 7, 14) > 0.36).astype(np.float32)
    chips = cv2.GaussianBlur(chips, (0, 0), 1.0)
    paint = letters * chips
    ochre = np.array([214, 172, 58], np.float32) * (0.85 + 0.3 * grain[..., None])
    mural = mural * (1 - paint[..., None]) + ochre * paint[..., None]

    # Fine cracks across the paint.
    cracks = np.zeros((H, W), np.uint8)
    for _ in range(26):
        x = int(rng.uniform(x0, x1))
        y = int(rng.uniform(y0 + span_h * 0.2, y0 + span_h * 0.6))
        ang = rng.uniform(0, np.pi * 2)
        for _ in range(int(rng.integers(18, 40))):
            ang += rng.normal(0, 0.45)
            nx, ny = int(x + np.cos(ang) * 28), int(y + np.sin(ang) * 28)
            cv2.line(cracks, (x, y), (nx, ny), 255, int(rng.integers(2, 5)))
            x, y = nx, ny
    cracks = cv2.GaussianBlur(cracks.astype(np.float32) / 255.0, (0, 0), 1.1) * letters
    mural *= 1 - cracks[..., None] * 0.7

    # Small editorial caption.
    cap = Image.new("L", (W, H), 0)
    font = ImageFont.truetype(font_path.replace("Bold", "Regular"), 70)
    ImageDraw.Draw(cap).text(
        (int(x0 + (x1 - x0) * 0.2), int(y0 + span_h * 0.47)), "STUDIO  /  NEXT  DROP", font=font, fill=255
    )
    cap = np.asarray(cap).astype(np.float32) / 255.0 * chips
    mural = mural * (1 - cap[..., None]) + np.array([225, 225, 220], np.float32) * cap[..., None]

    # Keep the bake's coarse lighting so the wall still sits in the scene.
    lit = cv2.GaussianBlur(lum, (0, 0), 160)
    lit_mask = cv2.GaussianBlur(island, (0, 0), 160)
    lit = lit / np.maximum(lit_mask, 1e-3)
    ref = np.median(lit[island > 0])
    shade = np.clip(lit / ref, 0.45, 1.3)
    target_mean = lum[island > 0].mean()
    mural *= shade[..., None]
    mural *= target_mean / max(mural[island > 0].mean(), 1e-3)

    out = rgb * (1 - island[..., None]) + mural * island[..., None]
    img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    if alpha is not None:
        img.putalpha(alpha)
    img.save(dst_path, "WEBP", quality=86, method=6)
    print("wrote", dst_path)


if __name__ == "__main__":
    main()
