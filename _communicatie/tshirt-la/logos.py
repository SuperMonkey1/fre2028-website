"""Makes one-colour vector versions of the sponsor logos (for the shirt and the vinyl cut file).

    python logos.py

Writes sponsor-<name>.svg next to this script: one even-odd path each, fill = currentColor.
imec and LRD only exist as images, so they are traced; Cronos is taken from its SVG.
"""
import os

import numpy as np
import potrace
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))


def trace(mask):
    """Boolean array (True = ink) -> SVG path data."""
    curves = potrace.Bitmap(~mask).trace(  # potracer fills the False pixels
        turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    for curve in curves:
        p = curve.start_point
        d.append(f'M{p.x:.2f} {p.y:.2f}')
        for seg in curve.segments:
            e = seg.end_point
            if seg.is_corner:
                d.append(f'L{seg.c.x:.2f} {seg.c.y:.2f}L{e.x:.2f} {e.y:.2f}')
            else:
                d.append(f'C{seg.c1.x:.2f} {seg.c1.y:.2f} {seg.c2.x:.2f} {seg.c2.y:.2f} {e.x:.2f} {e.y:.2f}')
        d.append('Z')
    return ''.join(d)


def crop(mask):
    ys, xs = np.nonzero(mask)
    return mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


inline = {}


def write(name, d, w, h):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">'
           f'<path fill="currentColor" fill-rule="evenodd" d="{d}"/></svg>\n')
    open(os.path.join(HERE, f'sponsor-{name}.svg'), 'w', encoding='utf-8').write(svg)
    inline[name] = (f'<svg class="sp {name}" data-name="{name}" viewBox="0 0 {w} {h}">'
                    f'<path fill="currentColor" fill-rule="evenodd" d="{d}"/></svg>')
    print(name, w, h, len(d), 'chars')


def upscaled(img, k=3):
    return img.resize((img.width * k, img.height * k), Image.LANCZOS)


# imec: dark letters + blue square on white
im = Image.open(os.path.join(REPO, '_sales/partners/imec/LOGO-IMEC_black.svg.webp')).convert('RGBA')
bg = Image.new('RGBA', im.size, 'white'); bg.alpha_composite(im)
lum = np.asarray(upscaled(bg.convert('L')))
mask = crop(lum < 200)
write('imec', trace(mask), mask.shape[1], mask.shape[0])

# KU Leuven R&D: the white parts (symbol + lettering) are the ink. The symbol's fine stripes are
# too thin to cut in vinyl, so that part is closed into solid shapes.
im = Image.open(os.path.join(REPO, '_sales/partners/LRD/LRD_LOGO_RGB.png')).convert('RGB')
im = im.crop((4, 4, im.width - 4, im.height - 4))  # the file has a stray white edge row
white = Image.fromarray(((np.asarray(im).min(axis=2) > 225) * 255).astype('uint8'))
split = 511  # symbol on the left, lettering on the right
symbol = white.crop((0, 0, split, white.height)).filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.MinFilter(13))
white.paste(symbol, (0, 0))
mask = crop(np.asarray(upscaled(white)) > 128)
write('lrd', trace(mask), mask.shape[1], mask.shape[0])

# Cronos: rendered from its SVG with Inkscape, then traced. "GROEP" is drawn with hairlines
# that are too thin to cut, so that word is thickened.
import subprocess, tempfile
INKSCAPE = 'C:/Program Files/Inkscape/bin/inkscape.com'
tmp = os.path.join(tempfile.gettempdir(), 'cronos-mask.png')
H = 3000
subprocess.run([INKSCAPE, os.path.join(REPO, 'public/images/partners/cronos.svg'), '--export-type=png',
                f'--export-filename={tmp}', f'--export-height={H}'], check=True, capture_output=True)
alpha = Image.open(tmp).getchannel('A')
scale = H / 292.6                       # px per unit of the original viewBox
groep_top = int(258 * scale)            # "GROEP" sits below the grey bar
groep = alpha.crop((0, groep_top, alpha.width, alpha.height)).filter(ImageFilter.MaxFilter(2 * int(1.5 * scale) + 1))
alpha.paste(groep, (0, groep_top))
mask = crop(np.asarray(alpha) > 128)
write('cronos', trace(mask), mask.shape[1], mask.shape[0])

# put the logos into logo.html's 2 x 2 grid: imec, Cronos / LRD, invitation to become a partner
cells = [inline['imec'], inline['cronos'], inline['lrd'],
         '<div class="invite"><div class="big">YOUR LOGO HERE?</div>'
         '<div class="small">BECOME A PARTNER</div><div class="small">FRE2028.LA</div></div>']
html_path = os.path.join(HERE, 'logo.html')
html = open(html_path, encoding='utf-8').read()
a = html.index('<!-- sponsors:start')
a = html.index('\n', a) + 1
b = html.index('<!-- sponsors:end -->')
html = html[:a] + ''.join(f'    <div class="cell">{c}</div>\n' for c in cells) + html[b:]
open(html_path, 'w', encoding='utf-8').write(html)
