import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  Box,
  Check,
  CheckCircle2,
  Download,
  Dumbbell,
  Hand as HandIcon,
  Heart,
  Info,
  Layers,
  Loader2,
  Lock,
  Mail,
  Printer,
  RotateCcw,
  Ruler,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Target,
  Unlock,
  X,
} from 'lucide-react';
import BambumLayout, { AlsoFromBambum } from '@/components/bambum/BambumLayout';
import { PAYMENTS_API } from '@/lib/bambum/shop';
import { newsletterService } from '@/services/newsletterService';
import {
  DEFAULT_PARAMS,
  FINGER_ORDER,
  FRONT_DEPTH,
  MAX_WIDTH,
  MIN_WIDTH,
  computeLayout,
  type Finger,
  type FingerParams,
  type Hand,
} from '@/lib/fingerprint/layout';
import type { BuildResult } from '@/lib/fingerprint/engine';
import {
  EdgeMap,
  EnterValuesIllustration,
  FINGER_COLORS,
  FINGER_NAMES,
  MeasureIllustration,
  TraceHandIllustration,
  WidthIllustration,
} from '@/components/fingerprint/Illustrations';
import type { ViewerLabel } from '@/components/fingerprint/FingerPrintViewer';
import CheckoutDialog from '@/components/fingerprint/CheckoutDialog';

const FingerPrintViewer = dynamic(() => import('@/components/fingerprint/FingerPrintViewer'), { ssr: false });

type Status = 'idle' | 'loading-engine' | 'building' | 'ready' | 'error';
type FileKind = 'stl' | 'step';

const SUBSCRIBED_KEY = 'fingerprint_newsletter_subscribed';

const ORDER_API = `${PAYMENTS_API}/fingerprint`;
const SET_PRICE_CENTS = 4900;
// Shipping is calculated by the payments function from the address entered in the Stripe form
const euro = (cents: number) => `€${(cents / 100).toFixed(2).replace(/\.00$/, '')}`;

type OrderState =
  | { state: 'checking' }
  | { state: 'paid'; orderId: string; email: string }
  | { state: 'pending'; orderId: string }
  | { state: 'cancelled' }
  | { state: 'contribution_thanks' }
  | { state: 'error' };
type LengthFinger = Exclude<Finger, 'pinky'>;
type Inputs = { offset: Record<LengthFinger, string>; width: Record<Finger, string> };

/** Rows top to bottom in the order the climber sees them on a left hand (pinky → index). */
const ROW_ORDER: Finger[] = ['pinky', 'ring', 'middle', 'index'];
/** The viewer orbits around the centre of the original 79 mm block; the viewer re-centres the model on it. */
const VIEW_TARGET: [number, number, number] = [39.5, 16.5, 12.5];

const round1 = (n: number) => Math.round(n * 10) / 10;

const defaultInputs = (): Inputs => ({
  offset: {
    ring: String(round1(DEFAULT_PARAMS.offset.ring)),
    middle: String(round1(DEFAULT_PARAMS.offset.middle)),
    index: String(round1(DEFAULT_PARAMS.offset.index)),
  },
  width: {
    pinky: String(DEFAULT_PARAMS.width.pinky),
    ring: String(DEFAULT_PARAMS.width.ring),
    middle: String(DEFAULT_PARAMS.width.middle),
    index: String(DEFAULT_PARAMS.width.index),
  },
});

const toParams = (i: Inputs): FingerParams => ({
  offset: { ring: parseFloat(i.offset.ring), middle: parseFloat(i.offset.middle), index: parseFloat(i.offset.index) },
  width: {
    pinky: parseFloat(i.width.pinky),
    ring: parseFloat(i.width.ring),
    middle: parseFloat(i.width.middle),
    index: parseFloat(i.width.index),
  },
});

/** Design links (`?left=…&right=…`, as in the order emails): ring,middle,index lengths then pinky,ring,middle,index widths. */
const parseHandQuery = (q: string | null): Inputs | null => {
  const v = (q || '').split(',').map((x) => x.trim());
  if (v.length !== 7 || v.some((x) => x === '' || !Number.isFinite(Number(x)))) return null;
  return {
    offset: { ring: v[0], middle: v[1], index: v[2] },
    width: { pinky: v[3], ring: v[4], middle: v[5], index: v[6] },
  };
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-2.5 py-1 text-right text-sm font-bold focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200';

export default function FingerPrintPage() {
  const [hand, setHand] = useState<Hand>('left');
  // One set of values per hand. Locked (default): both hands share the values of the hand being edited.
  const [handInputs, setHandInputs] = useState<Record<Hand, Inputs>>(() => ({ left: defaultInputs(), right: defaultInputs() }));
  const [locked, setLocked] = useState(true);
  const inputs = handInputs[hand];
  const setInputs = (update: (v: Inputs) => Inputs) =>
    setHandInputs((h) => {
      const next = update(h[hand]);
      return locked ? { left: next, right: next } : { ...h, [hand]: next };
    });
  const toggleLock = () => {
    // Re-locking makes the other hand copy the values of the hand currently shown
    if (!locked) setHandInputs((h) => ({ left: h[hand], right: h[hand] }));
    setLocked(!locked);
  };
  const [status, setStatus] = useState<Status>('idle');
  const [buildError, setBuildError] = useState<string | null>(null);
  const [result, setResult] = useState<BuildResult | null>(null);
  const [builtFor, setBuiltFor] = useState<{ params: FingerParams; hand: Hand } | null>(null);
  const buildId = useRef(0);

  const params: FingerParams = useMemo(() => toParams(inputs), [inputs]);
  const layout = useMemo(() => computeLayout(params), [params]);

  /* ---------- Ordering ---------- */
  // A set is always left + right, so both hands must be valid before ordering
  const orderBlocker = useMemo(() => {
    if (computeLayout(toParams(handInputs.left)).errors.length) return 'left';
    if (computeLayout(toParams(handInputs.right)).errors.length) return 'right';
    return null;
  }, [handInputs]);
  const [ordering, setOrdering] = useState(false);
  const [checkout, setCheckout] = useState<{
    clientSecret: string;
    publishableKey: string;
    livemode: boolean;
    design: { left: FingerParams; right: FingerParams; locked: boolean };
  } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [contributing, setContributing] = useState(false);
  const [contributionError, setContributionError] = useState<string | null>(null);

  // Voluntary "pay what you want" contribution for the free files: amount chosen on Stripe's page
  const startContribution = async () => {
    if (contributing) return;
    setContributing(true);
    setContributionError(null);
    try {
      const res = await fetch(`${ORDER_API}/contribution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design: { left: toParams(handInputs.left), right: toParams(handInputs.right) },
          originUrl: window.location.origin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not open the contribution page.');
      window.location.href = data.url;
    } catch (e: any) {
      setContributionError(e?.message || 'Could not open the contribution page.');
      setContributing(false);
    }
  };
  const [order, setOrder] = useState<OrderState | null>(null);

  const startOrder = async () => {
    if (orderBlocker || ordering) return;
    setOrdering(true);
    setOrderError(null);
    try {
      const res = await fetch(`${ORDER_API}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design: { locked, left: toParams(handInputs.left), right: toParams(handInputs.right) },
          originUrl: window.location.origin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.clientSecret) throw new Error(data.error || 'Could not start the checkout. Please try again.');
      setCheckout({
        clientSecret: data.clientSecret,
        publishableKey: data.publishableKey,
        livemode: !!data.livemode,
        design: { left: toParams(handInputs.left), right: toParams(handInputs.right), locked },
      });
      setOrdering(false);
    } catch (e: any) {
      setOrderError(e?.message || 'Could not start the checkout. Please try again.');
      setOrdering(false);
    }
  };

  // Load a design from the URL and handle the return from Stripe Checkout
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const left = parseHandQuery(q.get('left'));
    const right = parseHandQuery(q.get('right'));
    if (left || right) {
      const l = left || right!;
      const r = right || left!;
      setHandInputs({ left: l, right: r });
      setLocked(JSON.stringify(l) === JSON.stringify(r));
    }

    const orderParam = q.get('order');
    const sessionId = q.get('session_id');
    if (orderParam === 'cancelled') setOrder({ state: 'cancelled' });
    if (orderParam === 'success' && sessionId) {
      setOrder({ state: 'checking' });
      fetch(`${ORDER_API}/order/${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.paid) setOrder({ state: 'paid', orderId: d.orderId, email: d.email });
          else if (d.orderId) setOrder({ state: 'pending', orderId: d.orderId });
          else setOrder({ state: 'error' });
        })
        .catch(() => setOrder({ state: 'error' }));
    }
    const contributionParam = q.get('contribution');
    if (contributionParam === 'thanks') setOrder({ state: 'contribution_thanks' });
    if (orderParam || contributionParam) {
      q.delete('order');
      q.delete('session_id');
      q.delete('contribution');
      const rest = q.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
    }
  }, []);

  // Rebuild (debounced) whenever the inputs change and are valid
  useEffect(() => {
    if (layout.errors.length) return;
    const id = ++buildId.current;
    const t = setTimeout(async () => {
      try {
        const engine = await import('@/lib/fingerprint/engine');
        setStatus((s) => (s === 'idle' || s === 'loading-engine' ? 'loading-engine' : 'building'));
        await engine.initEngine();
        if (id !== buildId.current) return;
        setStatus('building');
        // let the status paint before the (blocking) CAD work
        await new Promise((r) => setTimeout(r, 30));
        const res = await engine.buildDesign(params, hand);
        if (id !== buildId.current) {
          res.shape.delete();
          return;
        }
        setResult((prev) => {
          prev?.shape.delete();
          return res;
        });
        setBuiltFor({ params, hand });
        setBuildError(null);
        setStatus('ready');
      } catch (e: any) {
        if (id !== buildId.current) return;
        console.error(e);
        setBuildError(e?.message || 'Something went wrong while building the model.');
        setStatus('error');
      }
    }, 450);
    return () => clearTimeout(t);
  }, [params, hand, layout.errors.length]);

  const labels: ViewerLabel[] = useMemo(() => {
    if (!builtFor) return [];
    const l = computeLayout(builtFor.params);
    return l.columns.map((c) => {
      const xMid = (c.x0 + c.x1) / 2;
      const x = builtFor.hand === 'left' ? xMid : l.width - xMid;
      return {
        text: FINGER_NAMES[c.finger],
        color: FINGER_COLORS[c.finger],
        position: [x, l.edgeY[c.finger] + 6, -4] as [number, number, number],
      };
    });
  }, [builtFor]);

  const fileBase = builtFor
    ? `FingerPrint_${builtFor.hand}_R${round1(builtFor.params.offset.ring)}_M${round1(builtFor.params.offset.middle)}_I${round1(
        builtFor.params.offset.index,
      )}_W${FINGER_ORDER.map((f) => round1(builtFor.params.width[f])).join('-')}`
    : 'FingerPrint';

  const saveFile = async (kind: FileKind) => {
    if (!result) return;
    const engine = await import('@/lib/fingerprint/engine');
    const blob = kind === 'stl' ? result.shape.blobSTL({ binary: true, tolerance: 0.02, angularTolerance: 0.1 }) : result.shape.blobSTEP();
    engine.downloadBlob(blob, `${fileBase}.${kind}`);
  };

  // Downloads are unlocked by subscribing to the newsletter (remembered in this browser)
  const [subscribed, setSubscribed] = useState(false);
  const [gateKind, setGateKind] = useState<FileKind | null>(null);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSubscribed(localStorage.getItem(SUBSCRIBED_KEY) === '1');
    } catch {}
  }, []);

  const download = (kind: FileKind) => {
    if (subscribed) saveFile(kind);
    else {
      setGateError(null);
      setGateKind(kind);
    }
  };

  const unlockDownloads = () => {
    setSubscribed(true);
    try {
      localStorage.setItem(SUBSCRIBED_KEY, '1');
    } catch {}
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateKind || subscribing) return;
    setSubscribing(true);
    setGateError(null);
    try {
      await newsletterService.subscribe(email.trim());
    } catch (err: any) {
      const msg: string = err?.message || '';
      // An address that is already on the list is fine; any other server problem shouldn't block the download either.
      if (/ongeldig|invalid|verplicht/i.test(msg)) {
        setGateError('Please enter a valid email address.');
        setSubscribing(false);
        return;
      }
      if (!/al ingeschreven/i.test(msg)) console.error('Newsletter subscription failed:', err);
    }
    unlockDownloads();
    setSubscribing(false);
    const kind = gateKind;
    setGateKind(null);
    saveFile(kind);
  };

  const busy = status === 'loading-engine' || status === 'building';
  const stale = !!result && busy;

  return (
    <BambumLayout
      active="fingerprint"
      links={[
        { label: 'Why FingerPrint', href: '#advantages' },
        { label: 'How it works', href: '#tutorial' },
      ]}
    >
      <Head>
        <title>FingerPrint | Custom Unequal Crimp Generator</title>
        <meta
          name="description"
          content="Enter the length difference and width of your fingers and download a FingerPrint crimp edge made for your hand, as STL or STEP."
        />
      </Head>

      <main className="mx-auto max-w-6xl px-4 pb-24">
        {/* Hero */}
        <section className="py-6 md:py-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Custom unequal crimp</div>
          <h1 className="max-w-3xl text-4xl font-medium leading-[1.1] tracking-tight text-slate-800 sm:text-5xl">
            One edge <strong className="font-black text-slate-950">per finger</strong>,{' '}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text font-black text-transparent">
              shaped to your hand.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-700">
            Your fingers are not the same length, so why train on a straight edge? Enter how much longer your ring, middle and
            index finger are than your pinky, and how wide each finger is. FingerPrint shapes each edge to match, shows you the
            result in 3D and gives you an STL to print or a STEP file to edit.
          </p>
        </section>

        {/* Configurator */}
        <section id="designer" className="grid scroll-mt-20 gap-6 lg:h-[calc(100vh-6rem)] lg:min-h-[500px] lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:order-2 lg:min-h-0 lg:overflow-y-auto">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Hand</span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {locked ? 'Both hands use the same values' : 'Each hand has its own values'}
                </span>
              </div>
              <div className="flex items-stretch gap-2">
              <div className="grid flex-1 grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {(['left', 'right'] as Hand[]).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHand(h)}
                    className={`rounded-lg py-1 text-sm font-extrabold capitalize transition-all ${
                      hand === h ? 'bg-white text-slate-950 shadow' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {h} hand
                  </button>
                ))}
              </div>
              <button
                onClick={toggleLock}
                title={locked ? 'Unlock to enter different values for each hand' : 'Lock to use the same values for both hands'}
                aria-label={locked ? 'Unlock left and right hand' : 'Lock left and right hand'}
                aria-pressed={locked}
                className={`flex w-10 items-center justify-center rounded-xl border transition-all ${
                  locked
                    ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700'
                }`}
              >
                {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
              </div>
            </div>

            <div>
              <div className="mb-1 grid grid-cols-[1fr_88px_72px] items-end gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Finger</span>
                <span className="text-right text-[10px] font-extrabold uppercase leading-tight tracking-wider text-slate-500">
                  Length
                </span>
                <span className="text-right text-[10px] font-extrabold uppercase leading-tight tracking-wider text-slate-500">Width</span>
              </div>

              {ROW_ORDER.map((f) => (
                <div key={f} className="grid grid-cols-[1fr_88px_72px] items-center gap-2 border-b border-slate-100 py-1 last:border-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <span className="h-3 w-3 rounded-full" style={{ background: FINGER_COLORS[f] }} />
                    {FINGER_NAMES[f]}
                  </div>
                  {f === 'pinky' ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-right text-sm font-bold text-slate-400">0</div>
                  ) : (
                    <input
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={inputs.offset[f]}
                      onChange={(e) => setInputs((v) => ({ ...v, offset: { ...v.offset, [f]: e.target.value } }))}
                      className={inputClass}
                      aria-label={`${FINGER_NAMES[f]} length difference in mm`}
                    />
                  )}
                  <input
                    type="number"
                    inputMode="decimal"
                    step={0.5}
                    min={MIN_WIDTH}
                    max={MAX_WIDTH}
                    value={inputs.width[f]}
                    onChange={(e) => setInputs((v) => ({ ...v, width: { ...v.width, [f]: e.target.value } }))}
                    className={inputClass}
                    aria-label={`${FINGER_NAMES[f]} edge width in mm`}
                  />
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">
                  All values in mm. Total width: <strong className="text-slate-700">{round1(layout.width)} mm</strong>
                </p>
                <button
                  onClick={() => setInputs(() => defaultInputs())}
                  title="Reset to the values of the original design"
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-500 hover:border-slate-300 hover:text-slate-950"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Original
                </button>
              </div>
            </div>

            {layout.errors.length > 0 && (
              <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>{layout.errors.join(' ')}</div>
              </div>
            )}
            {layout.errors.length === 0 && layout.shift > 0.05 && (
              <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  All edges were moved <strong>{layout.shift.toFixed(1)} mm</strong> further back because a finger is shorter than your pinky.
                  The differences between your fingers are unchanged.
                </div>
              </div>
            )}
            {layout.errors.length === 0 && layout.holeScale < 0.995 && (
              <div className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  {layout.holeScale > 0 ? (
                    <>
                      The central load hole was reduced to <strong>Ø {(19 * layout.holeScale).toFixed(1)} mm</strong> (original Ø 19 mm) so it
                      stays inside the edges around it.
                    </>
                  ) : (
                    <>The edges around the centre are too close to the front for a load hole, so this version has none. Use the side eyelets.</>
                  )}
                </div>
              </div>
            )}

            <div className="flex min-h-[110px] flex-col lg:flex-1">
              <div className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">Edge depth from the front (mm)</div>
              <div className="h-36 rounded-xl bg-slate-50 p-1.5 lg:h-auto lg:min-h-0 lg:flex-1">
                <EdgeMap layout={layout} hand={hand} />
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <div className="text-sm font-extrabold text-slate-950">Printed set, made for you</div>
                  <div className="text-[11px] text-slate-600">
                    Left + right hand{locked ? ', same values' : ', each with its own values'}
                  </div>
                </div>
                <div className="text-xl font-black text-slate-950">{euro(SET_PRICE_CENTS)}</div>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                + shipping: €2.99 Belgium · €4.99 rest of the EU
              </p>
              <button
                onClick={startOrder}
                disabled={!!orderBlocker || ordering}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-sm font-black text-white shadow-md transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ordering ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                {ordering ? 'Opening checkout…' : `Order your set · ${euro(SET_PRICE_CENTS)}`}
              </button>
              {orderBlocker && (
                <p className="mt-1.5 text-xs font-semibold text-red-700">Fix the {orderBlocker} hand values before ordering.</p>
              )}
              {orderError && <p className="mt-1.5 text-xs font-semibold text-red-700">{orderError}</p>}
            </div>
          </div>

          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-100 shadow-sm sm:h-[520px] lg:order-1 lg:h-full">
            <FingerPrintViewer result={result} labels={labels} target={VIEW_TARGET} />

            {(busy || status === 'idle') && (
              <div
                className={`pointer-events-none absolute inset-0 flex items-center justify-center ${stale ? 'items-start pt-4' : 'bg-white/60'}`}
              >
                <div className="flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {status === 'building' ? 'Building your edges…' : 'Loading the CAD engine (first time ≈ 8 MB)…'}
                </div>
              </div>
            )}
            {status === 'error' && buildError && (
              <div className="absolute inset-x-4 top-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {buildError}
              </div>
            )}
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/80 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">
              Drag to rotate · scroll to zoom · right-drag to pan
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section id="advantages" className="scroll-mt-20 pt-20">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Why FingerPrint</div>
          <h2 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            More ergonomic. Fewer injuries.{' '}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent">More training. Stronger grip.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
            On a straight edge your longest fingers do most of the work while the others hang along. FingerPrint gives every
            finger its own edge at its own length, so all four fingers grip the way your hand is built.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Advantage icon={<HandIcon className="h-5 w-5" />} title="Ergonomic grip">
              Each edge sits exactly where that fingertip lands, so your hand stays in a natural position instead of bending to fit a
              straight line.
            </Advantage>
            <Advantage icon={<Scale className="h-5 w-5" />} title="Load spread over every finger">
              Every finger carries its own share. No single finger has to take the peak load while the others barely touch the edge.
            </Advantage>
            <Advantage icon={<Layers className="h-5 w-5" />} title="Calluses spread evenly">
              The skin load is shared too, so calluses don&apos;t build up on one finger the way they do on a straight edge.
            </Advantage>
            <Advantage icon={<ShieldCheck className="h-5 w-5" />} title="Spares your A2 pulleys">
              The A2 finger pulleys aren&apos;t loaded in this grip, so you can train hard without worrying about that pulley.
            </Advantage>
            <Advantage icon={<Dumbbell className="h-5 w-5" />} title="More training volume">
              Because the grip is ergonomic and less stressful on your fingers, you can train more: more sets, more sessions, less
              time recovering.
            </Advantage>
            <Advantage icon={<Target className="h-5 w-5" />} title="Carries over to real holds">
              Every finger is trained to its own maximum, which translates much better to three-finger drags and two-finger pocket
              holds.
            </Advantage>
          </div>
        </section>

        {/* Tutorial */}
        <section id="tutorial" className="scroll-mt-20 pt-20">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Tutorial</div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Measure your hand in 4 steps</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Step n={1} title="Trace your hand" image={<TraceHandIllustration />}>
              You only need to measure one hand: the other is usually the same. Lay it flat on a sheet of paper, fingers relaxed and
              together, as you would hold an edge, and trace around the fingertips with a pencil held vertically.
            </Step>
            <Step n={2} title="Measure the lengths" image={<MeasureIllustration />}>
              Draw a line through the tip of your pinky, square to your fingers. That line is <strong>0</strong>. Measure how far the
              ring, middle and index fingertips stick out past it, in millimetres.
            </Step>
            <Step n={3} title="Measure the widths" image={<WidthIllustration />}>
              Measure each finger across its last joint, where the fingertip is widest, with a ruler held flat over the
              finger. Do this for all four fingers. If the fingers feel cramped side by side on the edge, add 1–2 mm to each.
            </Step>
            <Step n={4} title="Enter your numbers" image={<EnterValuesIllustration />}>
              Type the three length differences and the four widths in the designer above. With the lock closed, both hands get the
              same values; open it if your hands differ and enter each hand separately. The 3D view updates as you type.
            </Step>
          </div>
        </section>

        {/* Notes */}
        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <Note icon={<Ruler className="h-5 w-5" />} title="What do the numbers mean?">
            Each length is the distance between the pinky edge and that finger&apos;s edge, measured square to the 5° edge face. The
            original FingerPrint uses {round1(DEFAULT_PARAMS.offset.ring)} / {round1(DEFAULT_PARAMS.offset.middle)} /{' '}
            {round1(DEFAULT_PARAMS.offset.index)} mm (ring / middle / index) and edge widths of{' '}
            {FINGER_ORDER.map((f) => DEFAULT_PARAMS.width[f]).join(' / ')} mm (index / middle / ring / pinky).
          </Note>
          <Note icon={<Box className="h-5 w-5" />} title="What stays the same?">
            Everything except the edge positions and widths: the {FRONT_DEPTH} mm front lip, the 5 mm and 3 mm fillets on every edge,
            the cord channel, the load hole and the mounting eyelets. If an edge gets too close, the load hole shrinks around its
            centre.
          </Note>
          <Note icon={<Printer className="h-5 w-5" />} title="Safety first">
            A printed part can fail without warning. Never hang more than you can control, keep your feet close to the ground the
            first time, and replace the print as soon as you see layer cracks.
          </Note>
        </section>
        {/* Print it yourself: open for makers, personal use only (CC BY-NC 4.0) */}
        <section id="makers" className="mt-16 scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-500">
                  <Heart className="h-3.5 w-3.5 fill-rose-500" /> For makers
                </span>
                <a
                  href="https://creativecommons.org/licenses/by-nc/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-slate-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                >
                  CC BY-NC 4.0
                </a>
              </div>
              <h2 className="text-xl font-black text-slate-950">Own a 3D printer? Print your FingerPrint yourself.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                I love open source and the maker community, so the design is free for personal use. Download the file for the hand
                currently shown in the designer above, print it, tweak it, share your improvements.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Print it for yourself, your friends or your club
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Remix and share it, with credit to FingerPrint by
                  FRE2028
                </li>
                <li className="flex gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" /> No commercial use: don&apos;t sell the files or printed
                  FingerPrints
                </li>
              </ul>
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                <p className="text-sm leading-relaxed text-slate-700">
                  <strong>Pay what you want:</strong> the files are free. If FingerPrint helps your climbing, you can give what you
                  want to support my road to LA 2028.
                </p>
                <button
                  onClick={startContribution}
                  disabled={contributing}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-black text-white shadow-sm transition-all hover:bg-rose-600 disabled:opacity-60"
                >
                  {contributing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Heart className="h-3.5 w-3.5 fill-white" />}
                  {contributing ? 'Opening…' : 'Give what you want'}
                </button>
                {contributionError && <p className="mt-1.5 text-xs font-semibold text-red-700">{contributionError}</p>}
              </div>
              <p className="mt-3 text-xs text-slate-400">Printed parts are used at your own risk.</p>
            </div>
            <div className="flex gap-2 md:flex-col">
              <button
                onClick={() => download('stl')}
                disabled={!result || busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-800 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> STL
              </button>
              <button
                onClick={() => download('step')}
                disabled={!result || busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-black text-slate-800 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> STEP
              </button>
            </div>
          </div>
        </section>
      </main>

      <AlsoFromBambum current="fingerprint" />

      {checkout && (
        <CheckoutDialog
          clientSecret={checkout.clientSecret}
          publishableKey={checkout.publishableKey}
          livemode={checkout.livemode}
          design={checkout.design}
          priceCents={SET_PRICE_CENTS}
          shippingUrl={`${ORDER_API}/shipping`}
          onClose={() => setCheckout(null)}
        />
      )}

      {order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={() => setOrder(null)}>
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {order.state === 'checking' && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" /> Checking your payment…
              </div>
            )}
            {order.state === 'paid' && (
              <>
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h2 className="mt-3 text-xl font-black text-slate-950">Thank you for your order!</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Your FingerPrint set is being made to your measurements.
                  {order.email && (
                    <>
                      {' '}
                      We&apos;ll keep you posted at <strong>{order.email}</strong>.
                    </>
                  )}
                </p>
                <p className="mt-3 text-xs text-slate-400">Order number: {order.orderId}</p>
              </>
            )}
            {order.state === 'pending' && (
              <>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-amber-500" />
                <h2 className="mt-3 text-xl font-black text-slate-950">Payment is being processed</h2>
                <p className="mt-2 text-sm text-slate-600">We&apos;ll start on your set as soon as the payment is confirmed.</p>
                <p className="mt-3 text-xs text-slate-400">Order number: {order.orderId}</p>
              </>
            )}
            {order.state === 'contribution_thanks' && (
              <>
                <Heart className="mx-auto h-12 w-12 fill-rose-500 text-rose-500" />
                <h2 className="mt-3 text-xl font-black text-slate-950">Thank you for your contribution!</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  It means a lot and directly supports my road to LA 2028. Happy printing and strong fingers!
                </p>
              </>
            )}
            {order.state === 'cancelled' && (
              <>
                <h2 className="text-xl font-black text-slate-950">Checkout cancelled</h2>
                <p className="mt-2 text-sm text-slate-600">No payment was made. Your design is still here whenever you&apos;re ready.</p>
              </>
            )}
            {order.state === 'error' && (
              <>
                <h2 className="text-xl font-black text-slate-950">We couldn&apos;t check your order</h2>
                <p className="mt-2 text-sm text-slate-600">
                  If you completed the payment, your order is safe and linked to your design. We&apos;ll be in touch by email.
                </p>
              </>
            )}
            {order.state !== 'checking' && (
              <button
                onClick={() => setOrder(null)}
                className="mt-5 w-full rounded-xl bg-slate-950 py-2.5 text-sm font-black text-white hover:bg-slate-800"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {gateKind && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => !subscribing && setGateKind(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fp-gate-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setGateKind(null)}
              disabled={subscribing}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Mail className="h-5 w-5" />
            </div>
            <h2 id="fp-gate-title" className="text-xl font-black text-slate-950">
              Get your {gateKind.toUpperCase()} file
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              FingerPrint is free. Subscribe to my newsletter and your custom file downloads right away. You only have to do this
              once.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 space-y-3">
              <input
                type="email"
                required
                autoFocus
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              {gateError && <div className="text-sm font-semibold text-red-700">{gateError}</div>}
              <button
                type="submit"
                disabled={subscribing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-black text-slate-950 shadow-md transition-all hover:bg-amber-500 disabled:opacity-60"
              >
                {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {subscribing ? 'Subscribing…' : `Subscribe & download ${gateKind.toUpperCase()}`}
              </button>
              <p className="text-center text-[11px] text-slate-400">No spam, only occasional updates.</p>
            </form>
          </div>
        </div>
      )}
    </BambumLayout>
  );
}

function Advantage({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">{icon}</div>
      <h3 className="text-base font-extrabold text-slate-950">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

function Step({ n, title, image, children }: { n: number; title: string; image: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/15] bg-gradient-to-b from-amber-50 to-white">
        <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
          {n}
        </div>
        {image}
      </div>
      <div className="p-4">
        <h3 className="text-base font-extrabold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{children}</p>
      </div>
    </div>
  );
}

function Note({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-2 flex items-center gap-2 font-extrabold text-slate-950">
        <span className="text-amber-500">{icon}</span>
        {title}
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}
