"""YouTube Short v2 (~24 s), re-cut for retention from the rendered 100 % shots.

blender -b --factory-startup -P scripts/short_v2_edit.py -- [render]
  -> renders/sloperking_short_v2_0001-NNNN.mp4  and  sloperking_short_v2_edit.blend

Why (YouTube analytics of v1: 71 % swiped away in 2 s, avg view 17 s of 42 s):
  - frame 1 must already show the product (scan half drawing / half real) + the hook text,
    no empty white start
  - science first (4 muscles), product reveal only after that, no price until the end card
  - the specs list was where viewers left: now 1 s flashes
  - the real photo of Fre on the slopers (credibility) moved up
Timeline:
  0.0  hook: scan render + "Hangboards only train 2 muscles. / CLIMBERS NEED FOUR."
  2.0  arm: 2 finger flexors -> + 2 wrist flexors -> 4 muscles -> fight the pump
 10.2  pulley safe (close-up)
 11.7  photo: developed by Fre Leys, PhD
 13.7  reveal: meet the Sloper King (real product, white)
 15.7  adjustable / strong / light / grip, ~1 s each
 19.9  end card: pre-sale, price, link, subscribe
"""
import bpy, os, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "renders", "ad", "tall_100")
PHOTO = os.path.join(ROOT, "assets", "photo_seoul_9x16.png")
FONT_BLACK = r"C:\Windows\Fonts\seguibl.ttf"
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FPS = 30


def srgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)) + (1.0,)


SLATE950, WHITE = srgb("#020617"), srgb("#FFFFFF")
AMBER400, AMBER600, AMBER700, EMERALD600 = srgb("#FBBF24"), srgb("#D97706"), srgb("#B45309"), srgb("#059669")

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1080, 1920, 100
sc.render.fps = FPS
sc.view_settings.view_transform = "Standard"
sc.view_settings.look = "None"
se = sc.sequence_editor_create()
strips = se.strips if hasattr(se, "strips") else se.sequences
fb = bpy.data.fonts.load(FONT_BLACK)
fbo = bpy.data.fonts.load(FONT_BOLD)


def color_strip(name, frame, n, col, channel=1):
    try:
        s = strips.new_effect(name=name, type="COLOR", channel=channel, frame_start=frame, length=n)
    except TypeError:
        s = strips.new_effect(name=name, type="COLOR", channel=channel, frame_start=frame, frame_end=frame + n)
    s.color = col[:3]
    return s


def seq(shot, frame, first=0, last=None, step=1, channel=2, label=None, push=1.0, offset_x=0.0, offset_y=0.0):
    files = sorted(glob.glob(os.path.join(SRC, shot, "*.png")))[first:last:step]
    assert files, shot
    st = strips.new_image(label or shot, files[0], channel, frame)
    for f in files[1:]:
        st.elements.append(os.path.basename(f))
    n = len(files)
    st.frame_final_duration = n
    st.blend_type = "ALPHA_OVER"
    tr = st.transform
    base = 1080 / st.elements[0].orig_width
    tr.offset_x = offset_x * 1080
    tr.offset_y = offset_y * 1920
    for f, s in ((frame, 1.0), (frame + n - 1, push)):
        tr.scale_x = tr.scale_y = base * s
        tr.keyframe_insert("scale_x", frame=f); tr.keyframe_insert("scale_y", frame=f)
    return n


def text(body, f0, f1, size, color, x, y, font=fb, channel=5, align="LEFT", shadow=False, fade_in=True, delay=0):
    f0 += delay
    try:
        st = strips.new_effect(name=body[:20], type="TEXT", channel=channel, frame_start=f0, length=f1 - f0)
    except TypeError:
        st = strips.new_effect(name=body[:20], type="TEXT", channel=channel, frame_start=f0, frame_end=f1)
    st.text = body; st.font = font; st.font_size = size; st.color = color
    st.location = (x, y); st.wrap_width = 0.86
    for attr, v in (("anchor_x", align), ("anchor_y", "TOP"), ("alignment_x", align)):
        if hasattr(st, attr):
            setattr(st, attr, v)
    st.use_shadow = shadow
    if shadow and hasattr(st, "shadow_color"):
        st.shadow_color = (0, 0, 0, 0.55)
        for attr, v in (("shadow_offset", 0.06), ("shadow_blur", 0.4)):
            if hasattr(st, attr):
                setattr(st, attr, v)
    st.blend_type = "ALPHA_OVER"
    keys = ([(f0, 0.0), (f0 + 5, 1.0)] if fade_in else [(f0, 1.0)]) + [(f1 - 4, 1.0), (f1 - 1, 0.0)]
    for f, a in keys:
        st.blend_alpha = a; st.keyframe_insert("blend_alpha", frame=f)
    if fade_in:
        for f, dy in ((f0, -0.018), (f0 + 6, 0.0)):
            st.location = (x, y + dy); st.keyframe_insert("location", frame=f)
    return st


def card(f0, f1, head, sub=None, x=0.075, y=0.86, size=92, sub_size=40, ink=SLATE950, sub_col=AMBER700,
         shadow=False, fade_in=True):
    lines = head.count("\n") + 1
    text(head, f0, f1, size, ink, x, y, shadow=shadow, fade_in=fade_in)
    if sub:
        text(sub, f0, f1, sub_size, sub_col, x, y - lines * size * 1.45 / 1920 - 0.004, font=fbo, channel=6,
             shadow=shadow, fade_in=fade_in, delay=3 if fade_in else 0)


t = 1
# Picture cut to Fre's voiceover (sentence starts measured from the pauses in vo_clean.wav, seconds):
#  L1 0.3 hook | L2 3.35 finger flexors | L3 5.7 wrist flexors | L4 8.25 four muscles .. 9.5 fight the pump
#  L5 11.15 pulleys | L6 13.0 Fre | L7 15.25 built the Sloper King | L8 16.5 angles / 17.45 150 kg / 18.7 100 g
#  L9 19.9 pre-sale
CUT = {"arm": 3.3, "wrist": 5.65, "four": 8.2, "pump": 9.35, "close": 11.05, "photo": 12.9, "reveal": 15.15,
       "adjust": 16.3, "strong": 17.55, "light": 18.65, "end": 19.8}
END_AT = 22.85   # just after the last word: the Short loops right away


def F(sec):                     # seconds -> edit frame
    return 1 + round(sec * FPS)


def fit(shot, frame, n_out, first, last, **kw):
    """Shot frames first..last, retimed to exactly n_out frames (slowed down or sped up)."""
    files = sorted(glob.glob(os.path.join(SRC, shot, "*.png")))[first:last]
    pick = [files[min(len(files) - 1, int(i * len(files) / n_out))] for i in range(n_out)]
    return seq_files(shot, frame, pick, **kw)


def seq_files(shot, frame, files, channel=2, label=None, push=1.0, offset_x=0.0, offset_y=0.0):
    st = strips.new_image(label or shot, files[0], channel, frame)
    for f in files[1:]:
        st.elements.append(os.path.basename(f))
    n = len(files)
    st.frame_final_duration = n
    st.blend_type = "ALPHA_OVER"
    tr = st.transform
    base = 1080 / st.elements[0].orig_width
    tr.offset_x = offset_x * 1080
    tr.offset_y = offset_y * 1920
    for f, s in ((frame, 1.0), (frame + n - 1, push)):
        tr.scale_x = tr.scale_y = base * s
        tr.keyframe_insert("scale_x", frame=f); tr.keyframe_insert("scale_y", frame=f)
    return n


# ---- hook: scan in progress (half drawing, half real), text on screen from frame 1 (slowed to the sentence)
n = F(CUT["arm"]) - t
fit("arms", t, n, 128, 196, label="hook", offset_y=-0.07)
color_strip("hook_bg", t, n, WHITE)
text("Hangboards only\ntrain 2 muscles.", t, t + n, 96, SLATE950, 0.075, 0.89, fade_in=False)
text("CLIMBERS NEED FOUR.", t, t + n, 64, AMBER700, 0.075, 0.89 - 2 * 96 * 1.45 / 1920 - 0.006, font=fbo,
     channel=6, fade_in=False)
t += n

# ---- arm, retimed per sentence (arm-scene frames: finger 620, wrist 770, all four 920, pump 980..1100;
#      rendered with step 2, so file index = scene frame / 2)
AX, AY, AS, ASS = 0.36, 0.40, 54, 32
for key, nxt, i0, i1, head, sub in (
        ("arm", "wrist", 306, 385, "Hangboards train\n2 finger flexors.", "FDP  ·  FDS"),
        ("wrist", "four", 385, 460, "Slopers need\n2 more: wrist flexors.", "+ FCR  ·  FCU"),
        ("four", "pump", 460, 490, "4 muscles.\nActive.", None),
        ("pump", "close", 490, 551, "Fight the pump.", "BOOSTS YOUR POWER ENDURANCE")):
    n = F(CUT[nxt]) - t
    fit("arms", t, n, i0, i1, label=key, offset_x=-0.10)
    color_strip(key + "_bg", t, n, WHITE)
    card(t, t + n, head, sub, x=AX, y=AY, size=AS, sub_size=ASS)
    t += n

# ---- pulley safe (close-up)
n = F(CUT["photo"]) - t
fit("close", t, n, 0, 60, push=1.04)
color_strip("close_bg", t, n, WHITE)
card(t, t + n, "Pulley safe.", "IDEAL FOR WARM UP", sub_col=EMERALD600)
t += n

# ---- photo: who made it
n = F(CUT["reveal"]) - t
st = strips.new_image("photo", PHOTO, 2, t)
st.frame_final_duration = n
tr = st.transform
for f, s in ((t, 1.0), (t + n - 1, 1.06)):
    tr.scale_x = tr.scale_y = s
    tr.keyframe_insert("scale_x", frame=f); tr.keyframe_insert("scale_y", frame=f)
card(t, t + n, "Developed by\nFré Leys, PhD.", "PARA CLIMBER\nWORLD CHAMPIONSHIP FINALIST", y=0.49, ink=WHITE,
     sub_col=AMBER400, shadow=True)
t += n

# ---- reveal: the real product on white
n = F(CUT["adjust"]) - t
fit("arms", t, n, 165, 225, push=1.04, label="reveal")
color_strip("reveal_bg", t, n, WHITE)
card(t, t + n, "Meet the\nSloper King™.")
t += n

# ---- specs, each on its spoken words
for shot, nxt, first, last, head, sub, y in (
        ("adjust", "strong", 0, 62, "Adjustable.", "5 ANGLES", 0.40),
        ("strong", "light", 20, 60, "Strong.", "TESTED TO 150 KG", 0.40),
        ("light", "end", 0, 40, "Light.", "< 100 G", 0.86)):
    n = F(CUT[nxt]) - t
    fit(shot, t, n, first, last, push=1.03)
    color_strip(shot + "_bg", t, n, SLATE950)
    card(t, t + n, head, sub, y=y, ink=WHITE, sub_col=AMBER400, shadow=True)
    t += n

# ---- end card: real-looking product on white, offer only here
E = t
n = fit("end_real", t, F(END_AT) - t, 0, 100, label="end", offset_y=-0.02)
color_strip("end_bg", t, n, WHITE)
END = t + n
text("SLOPER KING™", E, END, 104, SLATE950, 0.5, 0.905, align="CENTER", channel=9, fade_in=False)
text("Train the strength", E + 6, END, 76, SLATE950, 0.5, 0.49, align="CENTER")
text("hangboards forget.", E + 6, END, 76, AMBER600, 0.5, 0.49 - 76 * 1.2 / 1920, align="CENTER", channel=6, delay=4)
# end card kept minimal: price and link live in the pinned comment / channel profile
text("PRE-SALE NOW OPEN", E + 18, END, 48, SLATE950, 0.5, 0.375, font=fbo, align="CENTER", channel=7)
text("Comment \"KING\" for the details", E + 22, END, 48, AMBER700, 0.5, 0.338, font=fbo, align="CENTER", channel=11)
text("Link in my channel profile", E + 30, END, 34, SLATE950, 0.5, 0.300, font=fbo, align="CENTER", channel=13)
text("SUBSCRIBE  ·  science & tech for better climbing", E + 10, END, 32, AMBER700, 0.5, 0.825, font=fbo,
     align="CENTER", channel=12)
t += n

sc.frame_start, sc.frame_end = 1, t - 1
VOICE = os.path.join(ROOT, "assets", "voice", "vo_clean.wav")   # Fre's voiceover (clean_voice.py)
if os.path.exists(VOICE):
    vo = strips.new_sound("voice", VOICE, 20, 1)
    vo.volume = 1.0
    print("VOICE", round(vo.frame_final_duration / FPS, 2), "s")
print("SHORT V2 LENGTH", round((t - 1) / FPS, 2), "s")

ims = sc.render.image_settings
if hasattr(ims, "media_type"):
    ims.media_type = "VIDEO"
ims.file_format = "FFMPEG"
sc.render.ffmpeg.format = "MPEG4"
sc.render.ffmpeg.codec = "H264"
sc.render.ffmpeg.constant_rate_factor = "HIGH"
sc.render.ffmpeg.audio_codec = "AAC" if os.path.exists(VOICE) else "NONE"
sc.render.ffmpeg.audio_bitrate = 192
sc.render.ffmpeg.audio_channels = "MONO"
sc.render.ffmpeg.audio_mixrate = 48000
sc.render.filepath = os.path.join(ROOT, "renders", "sloperking_short_v2_")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, "sloperking_short_v2_edit.blend"))
if "render" in sys.argv:
    bpy.ops.render.render(animation=True)
    print("RENDERED", sc.render.filepath)
