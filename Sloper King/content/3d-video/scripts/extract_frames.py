"""Extract one frame per N seconds from a video with Blender's sequencer.
blender -b --factory-startup -P extract_frames.py -- video.mp4 outdir [every_s]"""
import bpy, sys, os
a = sys.argv[sys.argv.index("--") + 1:]
src, out = a[0], a[1]
every = float(a[2]) if len(a) > 2 else 1.0
sc = bpy.context.scene
sc.view_settings.view_transform = "Standard"
sc.sequence_editor_create()
strips = sc.sequence_editor.strips if hasattr(sc.sequence_editor, "strips") else sc.sequence_editor.sequences
st = strips.new_movie("v", src, channel=1, frame_start=1)
fps = st.fps if hasattr(st, "fps") else 25
el = st.elements[0]
sc.render.resolution_x, sc.render.resolution_y = el.orig_width, el.orig_height
sc.render.resolution_percentage = 50
sc.render.fps = round(fps)
n = st.frame_final_duration
print("VIDEO", el.orig_width, el.orig_height, fps, n, "frames", n / fps, "s")
sc.render.image_settings.file_format = "JPEG"
f, i = 1, 0
while f <= n:
    sc.frame_set(int(f))
    sc.render.filepath = os.path.join(out, f"x_{i:03d}_{f / fps:05.1f}s.jpg")
    bpy.ops.render.render(write_still=True)
    f += every * fps; i += 1
