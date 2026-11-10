import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  Box,
  Camera,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Dumbbell,
  Hand as HandIcon,
  Heart,
  Info,
  Layers,
  Loader2,
  Mail,
  Printer,
  Ruler,
  Scale,
  ScanLine,
  ShieldCheck,
  ShoppingCart,
  Target,
  X,
} from 'lucide-react';
import BambumLayout, { AlsoFromBambum } from '@/components/bambum/BambumLayout';
import { PAYMENTS_API } from '@/lib/bambum/shop';
import { newsletterService } from '@/services/newsletterService';
import {
  DEFAULT_PARAMS,
  FINGER_ORDER,
  FRONT_DEPTH,
  computeLayout,
  type Finger,
  type FingerParams,
  type Hand,
} from '@/lib/fingerprint/layout';
import type { BuildResult } from '@/lib/fingerprint/engine';
import { FINGER_COLORS, FINGER_NAMES } from '@/components/fingerprint/Illustrations';
import type { ViewerLabel } from '@/components/fingerprint/FingerPrintViewer';
import CheckoutDialog from '@/components/fingerprint/CheckoutDialog';
import Link from 'next/link';
import TailrEdgeAdvantages from '@/components/fingerprint/TailrEdgeAdvantages';
import { EarlyAccessHero, EarlyAccessPersonalMessage, EarlyAccessRealPhotos, FriendsHero } from '@/components/fingerprint/EarlyAccessSections';
import { FRIENDS_PAGE, GENDERS, MEASURE_PAGE, decodeHand, formatHeight, isGender, isMeasurementId, loadGender, loadHand, loadHeight, loadMeasurementId, type Gender } from '@/lib/fingerprint/savedHand';

/** Personal early-access link for Sloper King buyers (/tailr-edge/early-access?invite=TOKEN). */
export interface EarlyAccessInvite {
  token: string;
  firstName: string;
  pickup: boolean;
  street: string;
  city: string;
  used: boolean;
  expired: boolean;
  deadline: string;
  priceCents: number;
  normalPriceCents: number;
  /** Christmas counter: sets ordered so far (starts at 20) and the number of Christmas spots */
  sold?: number;
  christmasSpots?: number;
}

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
/** The viewer orbits around the centre of the original 79 mm block; the viewer re-centres the model on it. */
const VIEW_TARGET: [number, number, number] = [39.5, 16.5, 12.5];

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Tailr Edge designer fed by the photo measure page. Used by /shop/tailr-edge-photo and, with an invite, by the
 * personal early-access page: then the price is the early-access price and the set is sent with the customer's
 * Sloper King, so the checkout has no shipping step.
 */
export default function PhotoDesigner({ invite = null, friends = false }: { invite?: EarlyAccessInvite | null; friends?: boolean }) {
  // The early-access page and the friends test page (/tailr-edge/friends) share the /sloperking-style layout
  const landing = !!invite || friends;
  const priceCents = invite ? invite.priceCents : SET_PRICE_CENTS;
  const measureHref = invite
    ? `${MEASURE_PAGE}?invite=${encodeURIComponent(invite.token)}`
    : friends
      ? `${MEASURE_PAGE}?from=friends`
      : MEASURE_PAGE;
  const [hand, setHand] = useState<Hand>('left');
  // Values saved on the measure page (link or this browser), used for both hands; until then the original design is shown
  const [measured, setMeasured] = useState<FingerParams | null>(null);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  // Stored photo with the measurement overlay (from the measure page), sent with the order
  const [measurementId, setMeasurementId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [buildError, setBuildError] = useState<string | null>(null);
  const [result, setResult] = useState<BuildResult | null>(null);
  const [builtFor, setBuiltFor] = useState<{ params: FingerParams; hand: Hand } | null>(null);
  const buildId = useRef(0);

  const params: FingerParams = measured || DEFAULT_PARAMS;
  const layout = useMemo(() => computeLayout(params), [params]);

  /* ---------- Ordering ---------- */
  const orderBlocker = invite?.used
    ? 'You already ordered your Tailr Edge set with this link.'
    : invite?.expired
      ? 'This early-access offer has ended.'
      : !measured
    ? 'Measure your hand from a photo before ordering.'
    : layout.errors.length
      ? 'Some measured values do not fit the body. Check the lines on the photo or measure again.'
      : null;
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
          design: { left: params, right: params },
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
      const res = await fetch(invite ? `${ORDER_API}/invite/${encodeURIComponent(invite.token)}/checkout` : `${ORDER_API}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design: { locked: true, left: params, right: params },
          originUrl: window.location.origin,
          heightCm: heightCm || undefined,
          gender: gender || undefined,
          measurementId: measurementId || undefined,
          returnPath: friends ? FRIENDS_PAGE : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.clientSecret) throw new Error(data.error || 'Could not start the checkout. Please try again.');
      setCheckout({
        clientSecret: data.clientSecret,
        publishableKey: data.publishableKey,
        livemode: !!data.livemode,
        design: { left: params, right: params, locked: true },
      });
      setOrdering(false);
    } catch (e: any) {
      setOrderError(e?.message || 'Could not start the checkout. Please try again.');
      setOrdering(false);
    }
  };

  // Handle the return from Stripe Checkout
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    // On an early-access link only a hand measured through that link counts, so a new link starts unmeasured
    const fromLink = decodeHand(q.get('left')) || decodeHand(q.get('right'));
    const saved = loadHand(invite ? invite.token : friends ? 'friends' : undefined);
    setMeasured(fromLink || saved);
    setHeightCm(Number(q.get('height')) || loadHeight());
    const g = q.get('gender');
    setGender(isGender(g) ? g : loadGender());
    const m = q.get('m');
    setMeasurementId(isMeasurementId(m) ? m : fromLink || saved ? loadMeasurementId() : null);
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
    ? `TailrEdge_${builtFor.hand}_R${round1(builtFor.params.offset.ring)}_M${round1(builtFor.params.offset.middle)}_I${round1(
        builtFor.params.offset.index,
      )}_W${FINGER_ORDER.map((f) => round1(builtFor.params.width[f])).join('-')}`
    : 'TailrEdge';

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

  const designerRef = useRef<HTMLElement>(null);
  // Pre-order buttons: to the tailor-made intro above the designer (early-access page), else the designer itself
  const scrollToDesigner = () =>
    (document.getElementById('tailor-made') || designerRef.current)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 3D designer with the measure link and the order button, and the advantages: shared by both layouts
  const designerSection = (
        <section ref={designerRef} id="designer" className="grid scroll-mt-20 gap-6 lg:h-[calc(100vh-6rem)] lg:min-h-[500px] lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:order-2 lg:min-h-0 lg:overflow-y-auto">
        {measured ? (
          <div>
            <div className="mb-1 grid grid-cols-[1fr_72px_72px] items-end gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Your hand</span>
              <span className="text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Length</span>
              <span className="text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Width</span>
            </div>
            {(['pinky', 'ring', 'middle', 'index'] as const).map((f) => (
              <div key={f} className="grid grid-cols-[1fr_72px_72px] items-center gap-2 border-b border-slate-100 py-1 last:border-0">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <span className="h-3 w-3 rounded-full" style={{ background: FINGER_COLORS[f] }} />
                  {FINGER_NAMES[f]}
                </div>
                <div className="text-right text-sm font-bold text-slate-800">{f === 'pinky' ? '0' : measured.offset[f]}</div>
                <div className="text-right text-sm font-bold text-slate-800">{measured.width[f]}</div>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                mm, from your photo{heightCm ? ` · height ${formatHeight(heightCm)}` : ''}
                {gender ? ` · ${GENDERS.find(([id]) => id === gender)?.[1].toLowerCase()}` : ''}
              </p>
              <Link
                href={measureHref}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 shadow-sm hover:bg-amber-300"
              >
                <Camera className="h-3.5 w-3.5" /> Measure again
              </Link>
            </div>
          </div>
        ) : (
          // Not measured yet: the example photo, cropped to the hand and card, with the button on it
          // On desktop it fills the panel height above the order box
          <Link href={measureHref} className="group relative block overflow-hidden rounded-xl lg:min-h-[260px] lg:flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/tailr-edge/measure-example.jpg?v=2"
              alt="Example photo: a hand palm up with a bank card on the palm"
              className="aspect-[4/3] w-full object-cover object-[50%_75%] transition-transform duration-300 group-hover:scale-[1.03] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
            />
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700">
              Example
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent px-4 pb-4 pt-12">
              <div className="text-sm font-extrabold text-white">Measure your hand from a photo</div>
              <div className="mt-0.5 text-xs text-slate-200">Palm up, a bank card on your palm, taken from above.</div>
              <span className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-black text-slate-950 group-hover:bg-amber-300">
                <Camera className="h-4 w-4" /> Start measuring
              </span>
            </div>
          </Link>
        )}

        {measured && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Preview hand</span>
              <span className="text-[11px] font-semibold text-slate-400">Both hands use the same values</span>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
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
            <p className="mt-1.5 text-xs text-slate-500">
              Total width: <strong className="text-slate-700">{round1(layout.width)} mm</strong>
            </p>
          </div>
        )}

        {measured && layout.errors.length > 0 && (
          <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{layout.errors.join(' ')}</div>
          </div>
        )}
        {layout.errors.length === 0 && layout.shift > 0.05 && (
          <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
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

        {/* keeps the order box at the bottom of the panel */}
        {measured && <div className="hidden lg:block lg:flex-1" />}

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="text-sm font-extrabold text-slate-950">Printed set, made for you</div>
              <div className="text-[11px] text-slate-600">Left + right hand, same values</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-slate-950">{euro(priceCents)}</div>
              {invite && <div className="text-[11px] text-slate-500 line-through">{euro(invite.normalPriceCents)}</div>}
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            {invite
              ? invite.pickup
                ? 'No shipping: picked up together with your Sloper King'
                : 'No shipping cost: sent with your Sloper King'
              : friends
                ? '+ shipping. With code FRITS at checkout, the set and shipping are free'
                : '+ shipping (cost per country, shown at checkout)'}
          </p>
          <button
            onClick={startOrder}
            disabled={!!orderBlocker || ordering}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-sm font-black text-white shadow-md transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ordering ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            {ordering ? 'Opening checkout…' : `Order your set · ${euro(priceCents)}`}
          </button>
          {orderBlocker && <p className="mt-1.5 text-xs font-semibold text-red-700">{orderBlocker}</p>}
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
        {!measured && status === 'ready' && (
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
            <div className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-600 shadow">
              Original design shown. Measure your hand to make it yours.
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/80 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">
          Drag to rotate · scroll to zoom · right-drag to pan
        </div>
      </div>
    </section>
  );

  const advantagesSection = <TailrEdgeAdvantages />;

  return (
    <BambumLayout
      // personal early-access page: no shop links in the header
      hideShopNav={landing}
      active="tailr-edge"
      links={
        landing
          ? [{ label: 'Why Tailr Edge', href: '#advantages' }]
          : [
              { label: 'Why Tailr Edge', href: '#advantages' },
              { label: 'How it works', href: '#tutorial' },
            ]
      }
      cta={
        landing ? (
          <button
            onClick={scrollToDesigner}
            className="hidden rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 sm:block"
          >
            Pre-order
          </button>
        ) : undefined
      }
    >
      <Head>
        <title>{invite ? 'Tailr Edge | Early access' : friends ? 'Tailr Edge | Friends test' : 'Tailr Edge | Measure your hand from a photo'}</title>
        <meta
          name="description"
          content="Upload a photo of your hand with a bank card on your palm and get a Tailr Edge crimp edge made for your fingers, as STL or STEP."
        />
        <meta name="robots" content="noindex" />
      </Head>

      {landing ? (
        // Personal early-access page and friends test page, laid out like /sloperking: hero with reel and counter, designer, advantages,
        // personal message, real photos
        <>
          {invite ? <EarlyAccessHero invite={invite} onPreorder={scrollToDesigner} /> : <FriendsHero onPreorder={scrollToDesigner} />}
          <main className="mx-auto max-w-6xl px-4 pb-20 pt-10">
            {/* Tailor-made intro: the example photo and a clear button to the measure page */}
            <section id="tailor-made" className="mb-6 scroll-mt-20">
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Made to measure</div>
                <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Tailor-made for your hands</h2>
                <p className="mt-2 text-xl font-bold text-amber-600">One picture is enough</p>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
                  Take a photo of your hand, palm up, with a bank card on your palm, like the example. We measure every finger from it
                  and shape each edge to match. You see the result in 3D below before you order.
                </p>
                <Link
                  href={measureHref}
                  className="mt-5 inline-flex items-center gap-2.5 rounded-xl bg-amber-400 px-7 py-4 text-base font-black text-slate-950 shadow-lg shadow-amber-200 transition-all hover:-translate-y-0.5 hover:bg-amber-300"
                >
                  <Camera className="h-5 w-5" /> {measured ? 'Measure again' : 'Measure your hand'}
                </Link>
              </div>
            </section>
            {designerSection}
            {advantagesSection}
          </main>
          <EarlyAccessPersonalMessage friends={friends} />
          <EarlyAccessRealPhotos />
        </>
      ) : (
      <main className="mx-auto max-w-6xl px-4 pb-24">
        {/* Hero */}
        <section className="py-6 md:py-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Made-to-measure crimp edge</div>
          <h1 className="max-w-3xl text-4xl font-medium leading-[1.1] tracking-tight text-slate-800 sm:text-5xl">
            Every finger,{' '}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text font-black text-transparent">
              its share.
            </span>
          </h1>
          <p className="mt-3 text-xl font-bold text-slate-900">Made to your fingers. Kind to your pulleys.</p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-700">
            Your fingers are not the same length, so why train on a straight edge? Upload one photo of your hand with a bank card
            on your palm. Tailr Edge finds the crease of each upper finger joint, measures how far each finger reaches past your pinky
            and how wide it is, shapes each edge to match and shows you the result in 3D.
          </p>
          <ul className="mt-6 grid max-w-3xl gap-x-8 gap-y-2.5 text-sm text-slate-700 sm:grid-cols-2">
            {[
              ['Made to measure', '3D-printed from your finger lengths'],
              ['Even load', 'all 4 fingers loaded evenly, including your little finger'],
              ['Open drag position', 'middle joint extended, minimal load on A2'],
              ['No pressure points', 'so no skin problems on your little finger'],
              ['Same position every time', 'consistent, measurable training'],
            ].map(([title, text]) => (
              <li key={title} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  <strong className="text-slate-950">{title}:</strong> {text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {designerSection}
        {advantagesSection}

        {/* Tutorial */}
        <section id="tutorial" className="scroll-mt-20 pt-20">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Tutorial</div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Measure your hand with one photo</h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Step n={1} title="Hold your hand flat" image={<StepIcon icon={<HandIcon className="h-12 w-12" />} />}>
              Hold your hand horizontal and roughly flat, palm up, over a plain, light background. Keep your fingers straight and
              relaxed, gently touching each other. One hand is enough: the other is usually the same.
            </Step>
            <Step n={2} title="Add a bank card" image={<StepIcon icon={<CreditCard className="h-12 w-12" />} />}>
              Lay a bank card (or any card of that size) flat on your palm, with the card number hidden. The card is the ruler: its
              known size turns the photo into millimetres and corrects the camera angle.
            </Step>
            <Step n={3} title="Photo from straight above" image={<StepIcon icon={<Camera className="h-12 w-12" />} />}>
              Hold your phone level, straight above your hand, so your fingers and the card fill most of the photo. Use good, even
              light so the creases of your finger joints are visible. A slight angle is corrected automatically.
            </Step>
            <Step n={4} title="Upload and check" image={<StepIcon icon={<ScanLine className="h-12 w-12" />} />}>
              Upload the photo on the measure page. It finds your hand, the card and the crease of each upper finger joint. Drag a
              line or a box side if it is off, then save: the designer shows your edge in 3D.
            </Step>
          </div>
        </section>

        {/* Notes */}
        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <Note icon={<Ruler className="h-5 w-5" />} title="What do the numbers mean?">
            Each length is how far the crease of that finger&apos;s upper joint lies past the crease of your pinky, measured along
            your fingers. Each width is the width of the finger across that crease. The original Tailr Edge uses {round1(DEFAULT_PARAMS.offset.ring)} / {round1(DEFAULT_PARAMS.offset.middle)} /{' '}
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
        {/* Print it yourself: open for makers, personal use only (CC BY-NC 4.0). Not on the early-access page. */}
        {!invite && (
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
              <h2 className="text-xl font-black text-slate-950">Own a 3D printer? Print your Tailr Edge yourself.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                I love open source and the maker community, so the design is free for personal use. Download the file for the hand
                currently shown in the designer above, print it, tweak it, share your improvements.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Print it for yourself, your friends or your club
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> Remix and share it, with credit to Tailr Edge by
                  FRE2028
                </li>
                <li className="flex gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" /> No commercial use: don&apos;t sell the files or printed
                  Tailr Edges
                </li>
              </ul>
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                <p className="text-sm leading-relaxed text-slate-700">
                  <strong>Pay what you want:</strong> the files are free. If Tailr Edge helps your climbing, you can give what you
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
        )}
      </main>
      )}

      {/* They already own a Sloper King: no cross-sell on the personal early-access page */}
      {!landing && <AlsoFromBambum current="tailr-edge" />}

      {checkout && (
        <CheckoutDialog
          clientSecret={checkout.clientSecret}
          publishableKey={checkout.publishableKey}
          livemode={checkout.livemode}
          design={checkout.design}
          priceCents={priceCents}
          shippingUrl={invite ? undefined : `${ORDER_API}/shipping`}
          shippingNote={invite ? (invite.pickup ? 'Picked up with your Sloper King' : 'Free, sent with your Sloper King') : undefined}
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
                  Your Tailr Edge set is being made to your measurements.
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
              Tailr Edge is free. Subscribe to my newsletter and your custom file downloads right away. You only have to do this
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

function StepIcon({ icon }: { icon: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center text-amber-500">{icon}</div>;
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
