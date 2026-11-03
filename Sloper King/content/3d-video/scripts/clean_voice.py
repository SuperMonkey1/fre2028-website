"""Clean up a voiceover: high-pass, gentle noise gate, presence lift, compression, loudness.
python scripts/clean_voice.py IN.npy SR OUT.wav
(IN.npy comes from analyse_voice.py, which decodes any audio file with Blender's aud module)"""
import sys, wave
import numpy as np

src, sr, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
x = np.load(src).astype(np.float64)
SR = 48000
# resample to 48 kHz (linear; adds no detail but keeps the video's audio rate)
t_in = np.arange(len(x)) / sr
t_out = np.arange(int(len(x) * SR / sr)) / SR
x = np.interp(t_out, t_in, x)


def biquad(x, b, a):
    y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
    b0, b1, b2 = b; a0, a1, a2 = a
    b0, b1, b2, a1, a2 = b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0
    for i, v in enumerate(x):
        o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, v, y1, o
        y[i] = o
    return y


def highpass(f, q=0.707):
    w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
    return ((1 + c) / 2, -(1 + c), (1 + c) / 2), (1 + al, -2 * c, 1 - al)


def peaking(f, gain_db, q=1.0):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
    return (1 + al * A, -2 * c, 1 - al * A), (1 + al / A, -2 * c, 1 - al / A)


x = biquad(x, *highpass(110))                # rumble / handling noise (110 Hz: less plosive thump)


def lowpass(f, q=0.707):
    w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
    return ((1 - c) / 2, 1 - c, (1 - c) / 2), (1 + al, -2 * c, 1 - al)


# de-plosive: where the low band (< 200 Hz) bursts far above its normal speech level, pull it down
low = biquad(x, *lowpass(200))
wl = int(0.005 * SR)
lenv = np.sqrt(np.convolve(low ** 2, np.ones(wl) / wl, mode="same")) + 1e-9
ref = np.percentile(lenv, 80)
g = np.clip(ref * 1.6 / lenv, 0.15, 1.0)              # only bursts get reduced (to -16 dB at most)
g = np.convolve(g, np.ones(4 * wl) / (4 * wl), mode="same")
x = x - low * (1 - g)
print("PLOSIVE frames reduced:", round(100 * float((g < 0.9).mean()), 2), "%")
x = biquad(x, *peaking(250, -2.5, 1.0))      # less boxy
x = biquad(x, *peaking(3200, 3.5, 0.9))      # presence: clearer words despite the 8 kHz limit

# envelope (10 ms) for gate + compressor
w = int(0.01 * SR)
env = np.sqrt(np.convolve(x ** 2, np.ones(w) / w, mode="same")) + 1e-9
env_db = 20 * np.log10(env)
peak_db = np.percentile(env_db, 95)
# gentle gate: -12 dB on the quiet parts between words
gate = np.where(env_db < peak_db - 32, 10 ** (-12 / 20), 1.0)
gate = np.convolve(gate, np.ones(4 * w) / (4 * w), mode="same")
x *= gate
# compressor: 3:1 above (peak - 14 dB)
thr = peak_db - 14
over = np.maximum(env_db - thr, 0)
gain = 10 ** (-(over * (1 - 1 / 3)) / 20)
gain = np.convolve(gain, np.ones(2 * w) / (2 * w), mode="same")
x *= gain
# loudness: speech RMS around -16 dBFS, peaks limited to -1 dBFS
rms_speech = np.sqrt(np.mean(x[env > np.percentile(env, 60)] ** 2))
x *= 10 ** (-16 / 20) / rms_speech
lim = 10 ** (-1 / 20)
x = np.tanh(x / lim) * lim
fade = int(0.02 * SR)
x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)

pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
with wave.open(out, "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
print("VOICE", out, round(len(x) / SR, 2), "s", "peak", round(float(np.abs(x).max()), 3))
