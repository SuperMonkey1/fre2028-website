"""Thumbnail / cover for the advert: a clean frame of the scan (half drawing, half real)
with the copy in the advert's text style (Segoe UI Black / Bold, slate-950 + amber-600).

  blender -b sloperking_arms_ad.blend -P scripts/render_thumb_frame.py -- 271 0.03 0.84
  python scripts/make_thumbnail.py      ->  renders/sloperking_ad_thumbnail.png (1080x1920)
  arm variant (4 glowing muscles):
  blender -b sloperking_arms_ad.blend -P scripts/render_thumb_frame.py -- 940 0.19 0.86 arm_thumb_frame noskin
  python scripts/make_thumbnail.py arm  ->  renders/sloperking_ad_thumbnail_arm.png
                                            + renders/ad/thumb_safezones.png (check image)

Layout is kept inside every place Instagram shows the cover:
  Reels full screen 9:16  - UI on top (~0-250 px), caption at the bottom (> ~1500 px)
  feed 4:5                - centre crop, y 285..1635
  profile grid 3:4        - centre crop, y 240..1680
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARM = "arm" in sys.argv[1:]
src = os.path.join(ROOT, "renders", "ad", "tall_100", "arms", "0136.png")    # fallback: arms shot, mid-scan
thumb = os.path.join(ROOT, "renders", "ad", "arm_thumb_frame.png" if ARM else "thumb_frame.png")
im = Image.open(thumb if os.path.exists(thumb) else src).convert("RGB").resize((1080, 1920), Image.LANCZOS)
d = ImageDraw.Draw(im)
INK, AMBER, SLATE600, WHITE = (2, 6, 23), (217, 119, 6), (71, 85, 105), (255, 255, 255)
BLACK, BOLD = r"C:\Windows\Fonts\seguibl.ttf", r"C:\Windows\Fonts\segoeuib.ttf"
SAFE_TOP, SAFE_BOTTOM = 300, 1500    # inside 4:5 + 3:4 crops and clear of the Reels caption
x = int(0.075 * 1080)

# brand mark (amber dot + SLOPER KING(TM)), as in the video
logo = ImageFont.truetype(BLACK, 34)
ly = SAFE_TOP + 18
d.ellipse((x, ly + 14, x + 14, ly + 28), fill=AMBER)
d.text((x + 26, ly), "SLOPER KING™", font=logo, fill=INK, stroke_width=6, stroke_fill=WHITE)
# headline + curiosity sub-line
font = ImageFont.truetype(BLACK, 108)
y = ly + 70
for i, line in enumerate(["Meet the", "Sloper King™."]):
    d.text((x, y + i * int(108 * 1.2)), line, font=font, fill=INK, stroke_width=10, stroke_fill=WHITE)
sub = ImageFont.truetype(BOLD, 52)
if not ARM:   # the arm frame already tells the story with its four labels
  d.text((x + 4, y + 2 * int(108 * 1.2) + 24), "CLIMBERS NEED FOUR.", font=sub, fill=AMBER,
       stroke_width=8, stroke_fill=WHITE)
# maker, under the product
cred = ImageFont.truetype(BOLD, 36)
if not ARM:
  d.text((x + 4, SAFE_BOTTOM - 60), "BY FRÉ LEYS", font=cred, fill=SLATE600, stroke_width=6, stroke_fill=WHITE)

out = os.path.join(ROOT, "renders", "sloperking_ad_thumbnail_arm.png" if ARM else "sloperking_ad_thumbnail.png")
im.save(out)
print("THUMB", out, im.size)

# check image: the three crops side by side
crops = {"reels 9:16": (0, 1920), "feed 4:5": (285, 1635), "grid 3:4": (240, 1680)}
tiles = []
for name, (a, b) in crops.items():
    t = im.crop((0, a, 1080, b)).resize((360, int(360 * (b - a) / 1080)))
    tiles.append((name, t))
W = sum(t.width for _, t in tiles) + 40
H = max(t.height for _, t in tiles) + 40
sheet = Image.new("RGB", (W, H), (60, 60, 60))
sd = ImageDraw.Draw(sheet)
xx = 10
for name, t in tiles:
    sheet.paste(t, (xx, 30)); sd.text((xx, 8), name, fill=WHITE); xx += t.width + 10
sheet.save(os.path.join(ROOT, "renders", "ad", "thumb_safezones_arm.png" if ARM else "thumb_safezones.png"))
