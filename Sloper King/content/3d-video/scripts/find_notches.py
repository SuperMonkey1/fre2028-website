"""Find the rope notches ('half holes') in the slot outline. Usable from Blender and plain python.
find_notches(segments) -> list of (center_yz, radius, opening_dir) sorted along the slot."""
import numpy as np


def chain(segs, tol=1e-7):
    key = lambda p: (round(p[0] / tol), round(p[1] / tol))
    adj = {}
    for a, b in segs:
        ka, kb = key(a), key(b)
        adj.setdefault(ka, []).append((kb, b)); adj.setdefault(kb, []).append((ka, a))
    pos = {key(a): a for a, b in segs}; pos.update({key(b): b for a, b in segs})
    loops, seen = [], set()
    for st in adj:
        if st in seen:
            continue
        loop, cur, prev = [st], st, None
        seen.add(st)
        while True:
            nxt = [k for k, _ in adj[cur] if k != prev and k not in seen]
            if not nxt:
                break
            prev, cur = cur, nxt[0]; seen.add(cur); loop.append(cur)
        loops.append(np.array([pos[k] for k in loop]))
    return loops


def resample(loop, step=0.0001):
    loop = np.vstack([loop, loop[:1]])
    d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(loop, axis=0), axis=1))]
    t = np.arange(0, d[-1], step)
    return np.stack([np.interp(t, d, loop[:, 0]), np.interp(t, d, loop[:, 1])], 1)


def fit_circle(p):
    A = np.c_[2 * p, np.ones(len(p))]
    b = (p ** 2).sum(1)
    c = np.linalg.lstsq(A, b, rcond=None)[0]
    r = np.sqrt(c[2] + c[0] ** 2 + c[1] ** 2)
    return c[:2], r, np.abs(np.linalg.norm(p - c[:2], axis=1) - r).max()


def find_notches(loops, rmin=0.0015, rmax=0.0032, skip_largest=True):
    loops = sorted(loops, key=len)
    out = []
    for lp in (loops[:-1] if skip_largest else loops):   # the largest is normally the outer profile
        q = resample(lp)
        n = len(q)
        win = 40                      # +-4 mm of outline
        fits = []
        for i in range(0, n, 3):
            idx = np.arange(i - win, i + win) % n
            c, r, err = fit_circle(q[idx])
            if rmin < r < rmax and err < 0.00012:
                fits.append((c, r))
        # cluster centres
        cl = []
        for c, r in fits:
            for k in cl:
                if np.linalg.norm(k[0] / k[2] - c) < 0.001:
                    k[0] += c; k[1] += r; k[2] += 1; break
            else:
                cl.append([c.copy(), r, 1])
        for c, r, m in cl:
            if m >= 3:
                c = c / m; r = r / m
                # opening direction: from the centre towards the closest part of the loop that is farther than r
                d = np.linalg.norm(q - c, axis=1)
                far = q[d > r * 1.6]
                near = far[np.argsort(np.linalg.norm(far - c, axis=1))[:30]].mean(0)
                o = near - c; o /= np.linalg.norm(o)
                out.append((c, r, o))
    return out


if __name__ == "__main__":
    import sys
    loops = list(np.load(sys.argv[1], allow_pickle=True))
    for c, r, o in find_notches(loops):
        print("NOTCH y=%.4f z=%.4f r=%.2fmm open=(%.2f,%.2f)" % (c[0], c[1], r * 1000, o[0], o[1]))
