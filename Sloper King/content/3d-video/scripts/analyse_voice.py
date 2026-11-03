import aud, sys, numpy as np
p = sys.argv[sys.argv.index("--") + 1]
s = aud.Sound(p)
print("SPECS", s.specs)
a = s.data()
print("SHAPE", a.shape)
x = a.mean(1) if a.ndim > 1 else a
sr = s.specs[0]
print("DUR", round(len(x) / sr, 2), "s")
print("PEAK", round(float(np.abs(x).max()), 3), "CLIP%", round(100 * float((np.abs(x) > 0.99).mean()), 3))
w = int(0.05 * sr)
rms = np.sqrt(np.convolve(x ** 2, np.ones(w) / w, mode="same"))[::w]
db = 20 * np.log10(rms + 1e-9)
print("RMS speech p90 dB", round(float(np.percentile(db, 90)), 1), " noise floor p10 dB", round(float(np.percentile(db, 10)), 1))
on = db > np.percentile(db, 90) - 20
segs, cur = [], None
for i, v in enumerate(on):
    t = i * w / sr
    if v and cur is None: cur = t
    if not v and cur is not None:
        if t - cur > 0.15: segs.append((round(cur, 2), round(t, 2)))
        cur = None
if cur is not None: segs.append((round(cur, 2), round(len(on) * w / sr, 2)))
print("SPEECH SEGMENTS", segs)
np.save(p + ".npy", x.astype(np.float32)); print("SR", sr)
