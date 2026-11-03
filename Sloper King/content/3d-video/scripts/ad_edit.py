"""Assemble the Sloper King advert in Blender's video sequencer (9:16).

blender -b --factory-startup -P scripts/ad_edit.py -- PCT
  reads  renders/ad/tall_<PCT>/<shot>/####.png   (made by render_shot.py)
  writes renders/sloperking_ad_tall_<PCT>pct.mp4  and  sloperking_ad_edit.blend
  add "presale" for the pre-sale version (end card: DM call-to-action instead of the website)

Text style follows the Sloper King page of fre2028.la: font-black headlines with
a full stop, small uppercase sub-lines in amber (emerald for "pulley safe"),
slate-950 on light shots, white on dark shots.
"""
import bpy, os, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PCT = int(sys.argv[sys.argv.index("--") + 1]) if "--" in sys.argv else 40
PRESALE = "presale" in sys.argv
SHORT = "short" in sys.argv     # YouTube Short: public pre-sale price, sales link + subscribe call-to-action
WHITE_END = SHORT and os.path.isdir(os.path.join(ROOT, "renders", "ad", f"tall_{PCT}", "end_real"))
TAG = "_short" if SHORT else ("_presale" if PRESALE else "")
SRC = os.path.join(ROOT, "renders", "ad", f"tall_{PCT}")
PHOTO = os.path.join(ROOT, "assets", "photo_seoul_9x16.png")
FONT_BLACK = r"C:\Windows\Fonts\seguibl.ttf"
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FPS = 30


def srgb(hexs):
    h = hexs.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)) + (1.0,)


SLATE950, WHITE = srgb("#020617"), srgb("#FFFFFF")
AMBER400, AMBER600, EMERALD600 = srgb("#FBBF24"), srgb("#D97706"), srgb("#059669")
AMBER700 = srgb("#B45309")   # Short: darker amber, readable over the glowing muscles
SLATE600 = srgb("#475569")

# shot order (name, frames) - frames are the length of the rendered sequence
SHOTS = ["arms", "close", "adjust", "strong", "light", "grip", "train", "photo", "end"]   # add "hello" first for a product cold open
PHOTO_LEN = 75
HELLO = (180, 225)   # "hello screen": real product frames from the end of the intro (arms shot)
TRIM = 14            # skip the empty white start of the line drawing (frames of the arms shot)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
sc.render.resolution_percentage = PCT
sc.render.fps = FPS
sc.view_settings.view_transform = "Standard"   # shots are already display-ready sRGB
sc.view_settings.look = "None"
se = sc.sequence_editor_create()
strips = se.strips if hasattr(se, "strips") else se.sequences
fb = bpy.data.fonts.load(FONT_BLACK)
fbo = bpy.data.fonts.load(FONT_BOLD)


def add_seq(name, frame, channel=1, first=0, last=None, label=None):
    files = sorted(glob.glob(os.path.join(SRC, name, "*.png")))[first:last]
    assert files, f"no frames for {name} in {SRC}"
    st = strips.new_image(label or name, files[0], channel, frame)
    for f in files[1:]:
        st.elements.append(os.path.basename(f))
    st.frame_final_duration = len(files)
    # Blender 5.2 does not fit strips to the canvas: scale explicitly from the image width
    st.transform.scale_x = st.transform.scale_y = 1080 / st.elements[0].orig_width
    return st, len(files)


def sec(t):
    return int(round(t * FPS)) + 1


def text(body, t0, t1, size, color, x, y, font=fb, channel=5, shadow=False, align="LEFT", wrap=0.86, delay=0,
         fade_in=True, fade_out=True):
    f0, f1 = sec(t0) + delay, sec(t1)
    try:
        st = strips.new_effect(name=body[:20], type="TEXT", channel=channel, frame_start=f0, length=f1 - f0)
    except TypeError:
        st = strips.new_effect(name=body[:20], type="TEXT", channel=channel, frame_start=f0, frame_end=f1)
    st.text = body
    st.font = font
    st.font_size = size
    st.color = color
    st.location = (x, y)
    st.wrap_width = wrap
    for attr, v in (("anchor_x", align), ("anchor_y", "TOP"), ("alignment_x", align)):
        if hasattr(st, attr):
            setattr(st, attr, v)
    st.use_shadow = shadow
    if shadow and hasattr(st, "shadow_color"):
        st.shadow_color = (0, 0, 0, 0.55)
        for attr, v in (("shadow_offset", 0.06), ("shadow_blur", 0.4)):
            if hasattr(st, attr):
                setattr(st, attr, v)
    if hasattr(st, "blend_type"):
        st.blend_type = "ALPHA_OVER"
    # motion: slide up + fade in, quick fade out
    keys = ([(f0, 0.0), (f0 + 7, 1.0)] if fade_in else [(f0, 1.0)]) + ([(f1 - 5, 1.0), (f1 - 1, 0.0)] if fade_out else [])
    for f, a_ in keys:
        st.blend_alpha = a_; st.keyframe_insert("blend_alpha", frame=f)
    if fade_in:
        for f, dy in ((f0, -0.022), (f0 + 8, 0.0)):
            st.location = (x, y + dy); st.keyframe_insert("location", frame=f)
    return st


# ---------------------------------------------------------------- picture track
t = 1
starts = {}
for name in SHOTS:
    starts[name] = t
    if name == "photo":
        st = strips.new_image("photo", PHOTO, 1, t)
        st.frame_final_duration = PHOTO_LEN
        if hasattr(st, "fit_method"):
            st.fit_method = "FILL"
        tr = st.transform
        base = tr.scale_x
        for f, s in ((t, 1.0), (t + PHOTO_LEN - 1, 1.08)):   # slow push-in
            tr.scale_x = tr.scale_y = base * s
            tr.keyframe_insert("scale_x", frame=f); tr.keyframe_insert("scale_y", frame=f)
        n = PHOTO_LEN
    elif name == "end" and WHITE_END:   # Short: photoreal rotating product on white (ad_end_real.py, Cycles)
        st, n = add_seq("end_real", t, channel=2, label="end")
        try:
            bg = strips.new_effect(name="end_bg", type="COLOR", channel=1, frame_start=t, length=n)
        except TypeError:
            bg = strips.new_effect(name="end_bg", type="COLOR", channel=1, frame_start=t, frame_end=t + n)
        bg.color = (1, 1, 1)
        st.blend_type = "ALPHA_OVER"
    elif name == "end":              # pack shot: product lowered to the middle, slate-950 fills the top
        st, n = add_seq(name, t, channel=2)
        try:
            bg = strips.new_effect(name="end_bg", type="COLOR", channel=1, frame_start=t, length=n)
        except TypeError:
            bg = strips.new_effect(name="end_bg", type="COLOR", channel=1, frame_start=t, frame_end=t + n)
        bg.color = SLATE950[:3]
        st.blend_type = "ALPHA_OVER"
        st.transform.offset_y = (0.0 if SHORT else -0.135) * 1920 * PCT / 100   # Short: room for 4 lines below
    elif name == "hello":
        st, n = add_seq("arms", t, first=HELLO[0], last=HELLO[1], label="hello")
    elif name == "arms":
        st, n = add_seq(name, t, first=TRIM)
        if SHORT:   # pan left during the camera swing: muscle labels clear the Shorts button column
            try:
                wb = strips.new_effect(name="arms_bg", type="COLOR", channel=1, frame_start=t, length=n)
            except TypeError:
                wb = strips.new_effect(name="arms_bg", type="COLOR", channel=1, frame_start=t, frame_end=t + n)
            wb.color = (1, 1, 1)
            st.channel = 2
            st.blend_type = "ALPHA_OVER"
            for f, ox in ((t + int(8.0 * FPS), 0.0), (t + int(9.6 * FPS), -0.10)):
                st.transform.offset_x = ox * 1080 * PCT / 100
                st.transform.keyframe_insert("offset_x", frame=f)
    else:
        st, n = add_seq(name, t)
        if name != "arms":           # every 3D shot keeps moving: slow push-in
            tr = st.transform
            base = tr.scale_x          # canvas-fit scale from add_seq
            for f, s_ in ((t, 1.0), (t + n - 1, 1.06)):
                tr.scale_x = tr.scale_y = base * s_
                tr.keyframe_insert("scale_x", frame=f); tr.keyframe_insert("scale_y", frame=f)
    t += n
sc.frame_start, sc.frame_end = 1, t - 1
T = {k: (v - 1) / FPS for k, v in starts.items()}
END = (t - 1) / FPS
print("SHOT STARTS (s)", {k: round(v, 2) for k, v in T.items()}, "END", round(END, 2))

# ---------------------------------------------------------------- copy (headline + sub-line)
HX, HY, SUBGAP = 0.075, 0.855, 0.004
H, S = (92 if SHORT else 108), 40   # px at 1080 wide; Short: narrower, clear of the button column


def card(t0, t1, head, sub=None, dark=False, sub_col=None, y=HY, shadow=False, size=None, fade_in=True, hx=None,
         sub_size=None):
    hx = HX if hx is None else hx
    hs = size or H
    lines = head.count("\n") + 1
    shadow = shadow or dark
    text(head, t0, t1, hs, WHITE if dark else SLATE950, hx, y, shadow=shadow, fade_in=fade_in)
    if sub:
        text(sub, t0, t1, sub_size or S, sub_col or (AMBER400 if dark else (AMBER700 if SHORT else AMBER600)), hx,
             y - lines * hs * 1.45 / 1920 - SUBGAP, font=fbo, channel=6, shadow=shadow, delay=4)


a = T["arms"] - TRIM / FPS   # arm-shot timeline origin (the trimmed white start is before the cut)
TOP = 0.865     # intro: above the drawing and its "90 mm" dimension line (logo comes in at 6 s)
card(T["arms"], a + 3.0, "Hangboards only\ntrain two muscles.", size=88, y=TOP, fade_in=False)   # on screen at the cut
card(a + 3.2, a + 6.0, "Climbers need 4.", y=TOP)
card(a + 6.0, a + 8.2, "Meet the\nSloper King™.", y=TOP)   # reveal of the real product
if "hello" in T:   # optional cold open (not used: it gives the product away too early)
    card(T["hello"], T["arms"], "Meet the\nSloper King™.", y=TOP, fade_in=False)
LOW = 0.40 if SHORT else 0.31   # copy low in the frame, above the Reels UI (~20 %) / Shorts UI (~27 %)
# arm timeline (arm_scene.py ad mode, frame / 60 = s): finger flexors 620, wrist flexors 770,
# all four 920, pump 980, close-up 1100
MS, MY = (62, LOW) if SHORT else (88, LOW + 0.045)   # Short: below the "+ FCU" label, above the Shorts UI
AX, SS = (0.36, 34) if SHORT else (None, None)   # Short: copy in the white area right of the (panned) arm
card(a + 10.33, a + 12.83, "Hangboards:\n2 finger flexors.", "FDP  ·  FDS", y=MY, size=MS, hx=AX, sub_size=SS)
card(a + 12.83, a + 15.33, "Sloper King adds\n2 wrist flexors.", "+ FCR  ·  FCU   EXTRA", y=MY, size=MS, hx=AX,
     sub_size=SS)
card(a + 15.33, a + 16.33, "4 muscles.\nActive.", y=MY if SHORT else LOW + 0.06, size=MS if SHORT else None, hx=AX)
card(a + 16.33, T["close"], "Fight the pump.", "BOOSTS YOUR POWER ENDURANCE", y=MY if SHORT else LOW,
     size=MS if SHORT else None, hx=AX, sub_size=SS)
card(T["close"], T["adjust"], "Pulley safe.", "IDEAL FOR WARM UP", sub_col=EMERALD600)
card(T["adjust"], T["strong"], "Adjustable.", "5 CANTILEVER ANGLES", dark=True, y=LOW)   # rope runs through the top
# difficulty meter fills up with the rope steps (position 5 -> 1, every 0.5 s, see ad_shots.py)
for i in range(5):
    t0 = T["adjust"] + i * 0.5
    t1 = T["adjust"] + (i + 1) * 0.5 if i < 4 else T["strong"]
    text("DIFFICULTY   " + "●" * (i + 1) + "○" * (4 - i), t0, t1, 40, AMBER400, HX, LOW + 0.05, font=fbo,
         channel=7, shadow=True, fade_in=(i == 0), fade_out=(i == 4))
card(T["strong"], T["light"], "Strong.", "TESTED UP TO 150 KG LOAD", dark=True, y=LOW)
card(T["light"], T["grip"], "Light.", "< 100 G  ·  POCKET SIZE", dark=True)
card(T["grip"], T["train"], "Grip.", "220-GRIT GOLDX FRICTION", sub_col=SLATE950)   # dark copy on the ochre grip paper
methods = ["Pull-up bar.", "Cable machine.", "Pick ups.", "Crag."]
step = (T["photo"] - T["train"]) / len(methods)
for i, m in enumerate(methods):
    card(T["train"] + i * step, T["train"] + (i + 1) * step, m, dark=True, y=LOW)
# "TRAIN ANYWHERE" stays while the four options flash
text("TRAIN ANYWHERE", T["train"], T["photo"], S, AMBER400, HX, LOW - H * 1.45 / 1920 - SUBGAP, font=fbo,
     channel=6, shadow=True)
card(T["photo"], T["end"], "Developed by\nFré Leys, PhD.",
     "PARA CLIMBER\nWORLD CHAMPIONSHIP FINALIST" if SHORT else "PARA CLIMBER  ·  WORLD CHAMPIONSHIP FINALIST",
     dark=True, y=0.49 if SHORT else 0.42, shadow=True)
# end card: website hero line, url, price
e = T["end"]
EI, EA = (SLATE950, AMBER700) if WHITE_END else (WHITE, AMBER400)   # end card ink / accent
text("SLOPER KING™", e, END, 104 if WHITE_END else 120, EI, 0.5, 0.905 if WHITE_END else 0.86, align="CENTER", channel=9)
EY = 0.54 if WHITE_END else 0.57 if SHORT else (0.405 if PRESALE else 0.375)   # pre-sale / short cards have more lines: block higher
EH = 76 if WHITE_END else 84
text("Train the strength", e + 0.2, END, EH, EI, 0.5, EY, align="CENTER")
text("hangboards forget.", e + 0.2, END, EH, AMBER600 if WHITE_END else EA, 0.5, EY - EH * 1.2 / 1920, align="CENTER", channel=6, delay=5)
if SHORT:     # public pre-sale (same tiers as fre2028.LA/sloperking) + grow the channel
    dy = -0.045 if WHITE_END else 0.0      # white card: photo above, copy block lower
    text("PRE-SALE NOW OPEN", e + 0.7, END, 44, EI, 0.5, 0.445 + dy, font=fbo, align="CENTER", channel=7, delay=6)
    text("€21  ·  2 for €39   (excl. shipping)", e + 0.7, END, 40, EA, 0.5, 0.41 + dy, font=fbo, align="CENTER",
         channel=8, delay=10)
    text("fre2028.LA/sloperking", e + 0.7, END, 44, EI, 0.5, 0.375 + dy, font=fbo, align="CENTER", channel=11, delay=14)
    text("SUBSCRIBE  ·  science & tech for better climbing", e + 0.7, END, 30 if WHITE_END else 34, EA, 0.5, 0.33 + dy, font=fbo,
         align="CENTER", channel=12, delay=30)
elif PRESALE:   # friends & family pre-sale price
    text("PRE-SALE NOW OPEN", e + 0.7, END, 44, WHITE, 0.5, 0.278, font=fbo, align="CENTER", channel=7, delay=6)
    text("€16  ·  2 for €30   (excl. shipping)", e + 0.7, END, 40, AMBER400, 0.5, 0.243, font=fbo, align="CENTER",
         channel=8, delay=10)
    text("DM me to get yours", e + 0.7, END, 40, WHITE, 0.5, 0.208, font=fbo, align="CENTER", channel=11, delay=14)
else:
    text("www.fre2028.LA/shop", e + 0.7, END, 40, WHITE, 0.5, 0.25, font=fbo, align="CENTER", channel=7, delay=6)
    text("€24.95", e + 0.7, END, 40, AMBER400, 0.5, 0.215, font=fbo, align="CENTER", channel=8, delay=10)

# ---------------------------------------------------------------- logo, top left
dark_from = T["adjust"]
for t0, t1, col in ((a + 8.2, dark_from, SLATE950), (dark_from, e, WHITE)):   # logo after the reveal card
    text("●", t0, t1, 30, AMBER400 if col == WHITE else AMBER600, 0.075, 0.905, font=fbo, channel=9)
    text("SLOPER KING™", t0, t1, 30, col, 0.1, 0.905, channel=10)
    if SHORT:   # offer visible from the reveal on: most viewers leave before the end card (avg view ~18 s)
        text("PRE-SALE €21  ·  fre2028.LA/sloperking", t0, t1, 28, AMBER400 if col == WHITE else AMBER700,
             0.075, 0.885, font=fbo, channel=13)

# ---------------------------------------------------------------- output
ims = sc.render.image_settings
if hasattr(ims, "media_type"):
    ims.media_type = "VIDEO"
ims.file_format = "FFMPEG"
sc.render.ffmpeg.format = "MPEG4"
sc.render.ffmpeg.codec = "H264"
sc.render.ffmpeg.constant_rate_factor = "HIGH"
sc.render.ffmpeg.audio_codec = "NONE"
sc.render.filepath = os.path.join(ROOT, "renders", f"sloperking_ad{TAG}_tall_{PCT}pct_")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, f"sloperking_ad{TAG}_edit.blend"))
if "render" in sys.argv:
    bpy.ops.render.render(animation=True)
    print("RENDERED", sc.render.filepath)
