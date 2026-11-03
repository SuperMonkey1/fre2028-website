"""Builds cut-ready SVGs of the one-colour logo for a Brother ScanNCut (heat-transfer vinyl).

Everything is plain filled outlines: text converted to glyph shapes, the emblem merged into
solid pieces. Run render.js first (it writes layout.json), then:

    python cutfile.py [width in mm, default 280]
"""
import json, math, os, re, sys

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont, OverlapMode
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from shapely.geometry import LineString, Point, Polygon
from shapely.ops import unary_union
from shapely import affinity

HERE = os.path.dirname(os.path.abspath(__file__))
font_path = os.path.join(HERE, 'Montserrat-wght.ttf')  # Google Fonts, SIL Open Font License
width_mm = float(sys.argv[1]) if len(sys.argv) > 1 else 280.0
layout = json.load(open(os.path.join(HERE, 'layout.json'), encoding='utf-8'))


# ---- emblem (the 0), in its 0-100 viewBox units, same geometry as logo.html's mono version ----
def sample_path(d, steps=24):
    """Absolute M/L/H/V/C/Q/Z path -> list of points."""
    toks = re.findall(r'[MLHVCQZ]|-?[\d.]+', d)
    pts, i, cur, cmd = [], 0, (0.0, 0.0), None
    while i < len(toks):
        if toks[i] in 'MLHVCQZ':
            cmd = toks[i]; i += 1
            if cmd == 'Z':
                continue
        n = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6, 'Q': 4}[cmd]
        v = [float(t) for t in toks[i:i + n]]; i += n
        if cmd in 'ML':
            cur = (v[0], v[1]); pts.append(cur)
        elif cmd == 'H':
            cur = (v[0], cur[1]); pts.append(cur)
        elif cmd == 'V':
            cur = (cur[0], v[0]); pts.append(cur)
        elif cmd == 'C':
            p0, p1, p2, p3 = cur, (v[0], v[1]), (v[2], v[3]), (v[4], v[5])
            for k in range(1, steps + 1):
                t = k / steps; a = 1 - t
                pts.append((a**3*p0[0] + 3*a*a*t*p1[0] + 3*a*t*t*p2[0] + t**3*p3[0],
                            a**3*p0[1] + 3*a*a*t*p1[1] + 3*a*t*t*p2[1] + t**3*p3[1]))
            cur = p3
        elif cmd == 'Q':
            p0, p1, p2 = cur, (v[0], v[1]), (v[2], v[3])
            for k in range(1, steps + 1):
                t = k / steps; a = 1 - t
                pts.append((a*a*p0[0] + 2*a*t*p1[0] + t*t*p2[0], a*a*p0[1] + 2*a*t*p1[1] + t*t*p2[1]))
            cur = p2
    return pts

centre = Point(50, 50)
ring = centre.buffer(50, quad_segs=128).difference(centre.buffer(36.8, quad_segs=128))
window = centre.buffer(37, quad_segs=128)

flame = Polygon(sample_path('M51 14 C57 21 59 26 56 31 C54 34 47 34 45 31 C42 26 46 22 47 18 C48 21 49 22 50 22 C51 19 51 17 51 14 Z'))
core = Polygon(sample_path('M50.5 23 C53 26 54 28 52.5 30.5 C51.5 32 48.5 32 47.8 30.5 C47 28.5 48.5 26.5 50.5 23 Z'))
mountain = Polygon(sample_path('M6 70 L32 45 L39 51 L51 36 L94 70 Z'))
above_stripes = Polygon(sample_path('M0 0 H100 V60.6 Q50 54.6 0 68.6 Z', 48))
ridge = LineString([(51, 36), (56.5, 57)]).buffer(0.9, quad_segs=16)
stripes = [LineString(sample_path(d, 64)).buffer(2.7, cap_style='flat')
           for d in ('M0 76 Q50 62 100 68', 'M0 85.5 Q50 71.5 100 77.5', 'M0 95 Q50 81 100 87')]

inner = unary_union([flame.difference(core),
                     mountain.intersection(above_stripes).difference(ridge),
                     *stripes]).intersection(window)
emblem = unary_union([ring, inner])
z = layout['zero']
emblem = affinity.affine_transform(emblem, [z['size'] / 100, 0, 0, z['size'] / 100, z['x'], z['y']])


def geom_to_d(g):
    polys = [g] if g.geom_type == 'Polygon' else list(g.geoms)
    d = ''
    for p in polys:
        for ring_ in [p.exterior, *p.interiors]:
            c = list(ring_.coords)
            d += 'M' + 'L'.join(f'{x:.3f} {y:.3f}' for x, y in c[:-1]) + 'Z'
    return d, polys


emblem_d, emblem_polys = geom_to_d(emblem)

# ---- text as glyph outlines ----
base = TTFont(font_path)
upm = base['head'].unitsPerEm
fonts = {}
glyph_paths = []
minx = miny = math.inf
maxx = maxy = -math.inf
for g in layout['glyphs']:
    if g['ch'].isspace():
        continue
    w = g['weight']
    if w not in fonts:
        # merge overlapping contours: cutter software fills even-odd, so overlaps would become holes
        fonts[w] = instantiateVariableFont(TTFont(font_path), {'wght': w}, overlap=OverlapMode.REMOVE)
    f = fonts[w]
    gs = f.getGlyphSet()
    name = f.getBestCmap()[ord(g['ch'])]
    s = g['size'] / upm
    pen = SVGPathPen(gs)
    gs[name].draw(TransformPen(pen, (s, 0, 0, -s, g['x'], g['y'])))
    glyph_paths.append(pen.getCommands())
    # bounds from the glyph's control box
    from fontTools.pens.boundsPen import BoundsPen
    bp = BoundsPen(gs); gs[name].draw(bp)
    if bp.bounds:
        x0, y0, x1, y1 = bp.bounds
        minx = min(minx, g['x'] + x0 * s); maxx = max(maxx, g['x'] + x1 * s)
        miny = min(miny, g['y'] - y1 * s); maxy = max(maxy, g['y'] - y0 * s)

# ---- partner grid: sponsor logos (from logos.py) and the invitation box ----
from shapely.geometry import box as rect
from svgelements import Matrix, Path as SvgPath
sponsor_paths = []
for sp in layout.get('sponsors', []):
    src = open(os.path.join(HERE, f"sponsor-{sp['name']}.svg"), encoding='utf-8').read()
    d = re.search(r' d="([^"]+)"', src).group(1)
    p = SvgPath(d) * Matrix(sp['w'] / sp['vw'], 0, 0, sp['h'] / sp['vh'], sp['x'], sp['y'])
    sponsor_paths.append(p.d())
    minx = min(minx, sp['x']); maxx = max(maxx, sp['x'] + sp['w'])
    miny = min(miny, sp['y']); maxy = max(maxy, sp['y'] + sp['h'])
if 'invite' in layout:
    iv = layout['invite']
    r_, bw = iv['radius'], iv['border']
    core = rect(iv['x'] + r_, iv['y'] + r_, iv['x'] + iv['w'] - r_, iv['y'] + iv['h'] - r_)
    frame = core.buffer(r_, quad_segs=32).difference(core.buffer(r_ - bw, quad_segs=32))
    sponsor_paths.append(geom_to_d(frame)[0])
    fx0, fy0, fx1, fy1 = frame.bounds
    minx, miny, maxx, maxy = min(minx, fx0), min(miny, fy0), max(maxx, fx1), max(maxy, fy1)

ex0, ey0, ex1, ey1 = emblem.bounds
minx, miny, maxx, maxy = min(minx, ex0), min(miny, ey0), max(maxx, ex1), max(maxy, ey1)
pad = 4
minx -= pad; miny -= pad; maxx += pad; maxy += pad
vw, vh = maxx - minx, maxy - miny
height_mm = width_mm * vh / vw

pieces = len(emblem_polys) + len(glyph_paths)


def write(name, mirrored):
    flip = f' transform="translate({minx * 2 + vw:.3f} 0) scale(-1 1)"' if mirrored else ''
    body = f'<path d="{emblem_d}" fill-rule="evenodd"/>\n' + ''.join(f'<path d="{d}" fill-rule="evenodd"/>\n' for d in glyph_paths + sponsor_paths)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width_mm:.1f}mm" height="{height_mm:.1f}mm" '
           f'viewBox="{minx:.3f} {miny:.3f} {vw:.3f} {vh:.3f}">\n'
           f'<g fill="#000"{flip}>\n{body}</g>\n</svg>\n')
    open(os.path.join(HERE, name), 'w', encoding='utf-8').write(svg)


write('fre2028-la-cut.svg', False)
write('fre2028-la-cut-MIRRORED.svg', True)
print(f'{width_mm:.0f} x {height_mm:.0f} mm, emblem pieces: {len(emblem_polys)}, glyphs: {len(glyph_paths)}, partner shapes: {len(sponsor_paths)}')
