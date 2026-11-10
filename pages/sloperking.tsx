import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { ArrowRight, Bell, CheckCircle2, Gift, Globe2, Minus, Package, Play, Plus, ShieldCheck, Truck, X } from 'lucide-react';

import BambumLayout from '@/components/bambum/BambumLayout';
import CheckoutDialog from '@/components/bambum/CheckoutDialog';
import { PAYMENTS_API } from '@/lib/bambum/shop';
import { contactService } from '@/services/contactService';
import { trackSloperKingCheckout, trackSloperKingPurchase, trackSloperKingView } from '@/lib/analytics';
import { KNOWN_COUNTRIES, type ShippingRates, countryNamer, fetchShippingRates } from '@/lib/bambum/shipping';

// Presale landing page for Instagram DMs: country -> quantity -> price & ship date -> Stripe,
// or a waitlist for countries we don't ship to yet. Checkout reuses the Sloper King payment flow;
// the countries we ship to and their cost come from /admin/shipping.
const ORDER_API = `${PAYMENTS_API}/sloperking`;
// In production the counter goes through Firebase Hosting, whose CDN answers from a nearby edge
const STATS_URL = process.env.NODE_ENV === 'production' ? '/api/payments/sloperking/stats' : `${ORDER_API}/stats`;
// The price depends on how many are sold; the server sets the tier (shown until the counter loads: presale tier)
const FALLBACK_PRICES = { pair: 39, single: 21 };
const EARLY_BIRD = { count: 60, single: 16, pair: 30 };

type Stats = {
  sold: number;
  tier: { label: string; upTo: number | null; prices: { single: number; pair: number } };
  next: { label: string; prices: { single: number; pair: number } } | null;
};

const POPULAR_COUNTRIES = ['BE', 'NL', 'DE', 'FR', 'LU', 'AT', 'ES', 'IT'];
const OTHER_COUNTRY = 'OTHER';

// Shipping schedule: first package leaves on 1 December, 40 Sloper Kings per working day (two machines),
// so the first 300 Sloper Kings (a pair counts as 2) are delivered before Christmas.
const SHIP_START = new Date(2026, 11, 1);
const UNITS_PER_DAY = 40;
const BREAK_EVEN = 150; // Sloper Kings sold to cover the costs
const CHRISTMAS_SPOTS = 300;
const AFTER_CHRISTMAS_START = new Date(2027, 0, 4); // first ship day for orders beyond the Christmas batch
const CHRISTMAS_CUTOFF = new Date(2026, 11, 18); // last ship day that still arrives before Christmas
const HOLIDAYS = ['2026-12-25', '2027-01-01'];

const FALLBACK_TIER = { label: 'Presale', prices: FALLBACK_PRICES };
const FALLBACK_NEXT = { label: 'Retail', prices: { single: 24.95, pair: 44.95 } };

/** Grey pulsing block shown in place of a number that is still loading. */
const NumberSkeleton = ({ className }: { className: string }) => (
  <span className={`inline-block animate-pulse rounded bg-slate-200 align-middle ${className}`} aria-label="Loading" />
);
const THANK_YOU_VIDEO = '/sloperking/thank-you.mp4';
const PHOTOS = Array.from({ length: 4 }, (_, i) => `/sloperking/presale/${i + 1}.jpg`);
const CLIPS = ['/sloperking/clips/clip-1.mp4', '/sloperking/clips/clip-2.mp4'];

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const isWorkingDay = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6 && !HOLIDAYS.includes(dayKey(d));
const nextWorkingDay = (d: Date) => {
  const next = new Date(d);
  do next.setDate(next.getDate() + 1);
  while (!isWorkingDay(next));
  return next;
};

/** Ship date for the n-th Sloper King (1-based) in the queue. */
const shipDateFor = (position: number) => {
  // Beyond the Christmas batch the queue restarts after the holidays
  const beyond = position > CHRISTMAS_SPOTS;
  let d = new Date(beyond ? AFTER_CHRISTMAS_START : SHIP_START);
  if (!isWorkingDay(d)) d = nextWorkingDay(d);
  const index = beyond ? position - CHRISTMAS_SPOTS : position;
  for (let slot = Math.floor((index - 1) / UNITS_PER_DAY); slot > 0; slot--) d = nextWorkingDay(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today ? nextWorkingDay(today) : d;
};

const formatDay = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' });

type OrderState =
  | { state: 'checking' }
  | { state: 'paid'; orderId: string; email: string }
  | { state: 'pending'; orderId: string }
  | { state: 'error' };

export default function SloperKingPresalePage() {
  const orderRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [country, setCountry] = useState('');
  const [itemType, setItemType] = useState<'pair' | 'single'>('pair');
  const [quantity, setQuantity] = useState(1);
  const [pickup, setPickup] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<{ clientSecret: string; publishableKey: string; livemode: boolean } | null>(null);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [email, setEmail] = useState('');
  const [waitlistState, setWaitlistState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [missingPhotos, setMissingPhotos] = useState<Set<number>>(new Set());
  const [thanksMissing, setThanksMissing] = useState(false);
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const [question, setQuestion] = useState({ name: '', email: '', message: '', website: '' });
  const [questionState, setQuestionState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [rates, setRates] = useState<ShippingRates | null>(null);
  const [ratesError, setRatesError] = useState(false);

  const countryName = useMemo(() => {
    const name = countryNamer();
    return (code: string) => (code === OTHER_COUNTRY ? 'Another country' : name(code));
  }, []);

  const loadRates = () => {
    setRatesError(false);
    fetchShippingRates()
      .then(setRates)
      .catch(() => setRatesError(true));
  };

  const loadStats = () =>
    fetch(STATS_URL)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.sold !== 'number' || !d.tier) return;
        setStats(d);
      })
      .catch(() => {});

  useEffect(() => {
    trackSloperKingView();
    loadStats();
    loadRates();
  }, []);

  // Handle the return from Stripe (same contract as the shop page)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const sessionId = q.get('session_id');
    if (q.get('order') === 'success' && sessionId) {
      setOrder({ state: 'checking' });
      fetch(`${ORDER_API}/order/${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.paid) {
            setOrder({ state: 'paid', orderId: d.orderId, email: d.email });
            trackSloperKingPurchase(sessionId, d.itemType, d.amountTotal, d.pickup ? 'pickup' : 'ship');
            loadStats();
          } else if (d.orderId) setOrder({ state: 'pending', orderId: d.orderId });
          else setOrder({ state: 'error' });
        })
        .catch(() => setOrder({ state: 'error' }));
    }
    if (q.has('order')) {
      q.delete('order');
      q.delete('session_id');
      const rest = q.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
    }
  }, []);

  const shipCountries = rates ? Object.keys(rates) : [];
  const waitlistCountries = KNOWN_COUNTRIES.filter((c) => !shipCountries.includes(c));
  const byName = (a: string, b: string) => countryName(a).localeCompare(countryName(b));
  const canShip = shipCountries.includes(country);
  const prices = stats?.tier.prices ?? FALLBACK_PRICES;
  const sold = stats ? stats.sold : null;
  const tierLeft = stats?.tier.upTo ? stats.tier.upTo - stats.sold : null;
  const subtotal = prices[itemType] * quantity;
  const shipping = pickup || !rates ? 0 : rates[country] ?? 0;
  // Counted in Sloper Kings: a pair is 2. The package ships when the last unit of the order is ready.
  const units = (itemType === 'pair' ? 2 : 1) * quantity;
  const position = sold === null ? null : sold + 1;
  const lastPosition = sold === null ? null : sold + units;
  const shipDate = lastPosition === null ? null : shipDateFor(lastPosition);
  const spotsLeft = sold === null ? null : Math.max(CHRISTMAS_SPOTS - sold, 0);
  const batchFull = sold !== null && sold >= CHRISTMAS_SPOTS;
  const eur = (v: number) => `€${Number.isInteger(v) ? v : v.toFixed(2)}`;

  const scrollToOrder = () => orderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // "Join the waitlist" link: opens the waitlist form straight away (for a country we don't ship to yet)
  const goToWaitlist = () => {
    if (!country || canShip) setCountry(OTHER_COUNTRY);
    setTimeout(() => {
      scrollToOrder();
      setTimeout(() => document.getElementById('email')?.focus({ preventScroll: true }), 600);
    }, 50);
  };

  const handleCheckout = async () => {
    if (isLoadingCheckout || !canShip) return;
    setIsLoadingCheckout(true);
    setCheckoutError(null);
    trackSloperKingCheckout(itemType, quantity, subtotal, pickup ? 'pickup' : 'ship');
    try {
      const res = await fetch(`${ORDER_API}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          quantity,
          pickup,
          country,
          returnPath: '/sloperking',
          originUrl: window.location.origin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.clientSecret) throw new Error(data.error || 'Could not start the checkout. Please try again.');
      setCheckout({ clientSecret: data.clientSecret, publishableKey: data.publishableKey, livemode: !!data.livemode });
    } catch (err: any) {
      setCheckoutError(err.message || 'Could not load checkout. Please try again.');
    }
    setIsLoadingCheckout(false);
  };

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistState === 'saving') return;
    setWaitlistState('saving');
    try {
      const res = await fetch(`${ORDER_API}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, country, quantity: itemType === 'pair' ? quantity * 2 : quantity, source: 'presale' }),
      });
      setWaitlistState(res.ok ? 'done' : 'error');
    } catch {
      setWaitlistState('error');
    }
  };

  useEffect(() => {
    if (!activeClip) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActiveClip(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeClip]);

  const handleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questionState === 'sending') return;
    // Honeypot filled in: a bot. Pretend it worked, send nothing.
    if (question.website) {
      setQuestionState('done');
      return;
    }
    setQuestionState('sending');
    try {
      // Same contact function as the homepage form (emails the message to the inbox)
      await contactService.sendMessage({
        name: question.name.trim(),
        email: question.email.trim(),
        inquiryType: 'Sloper King – Question',
        message: country ? `${question.message}

(Country selected on the page: ${country})` : question.message,
      });
      setQuestionState('done');
    } catch {
      setQuestionState('error');
    }
  };

  return (
    <BambumLayout
      active="sloper-king"
      hideShopNav
      cta={
        <button
          onClick={scrollToOrder}
          className="hidden rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-300 sm:block"
        >
          Pre-order
        </button>
      }
    >
      <Head>
        <title>Sloper King™ Presale | BamBum</title>
        <meta
          name="description"
          content="Pre-order the Sloper King™ pump trainer. Shipping from 1 December, the first 300 Sloper Kings are delivered before Christmas."
        />
        <meta property="og:title" content="Sloper King™ Presale" />
        <meta property="og:description" content="Shipping from 1 December. First 300 Sloper Kings delivered before Christmas." />
        <meta property="og:image" content="https://www.fre2028.la/sloperking/reel-poster.png" />
        {/* Start the counter request while the page is still loading */}
        {process.env.NODE_ENV === 'production' && (
          <link rel="preload" as="fetch" href="/api/payments/sloperking/stats" crossOrigin="anonymous" />
        )}
      </Head>

      {/* Hero: the reel + the promise */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-100 px-4 py-6 md:py-8">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,340px)_1fr] md:items-stretch">
          <video
            className="mx-auto aspect-[9/16] md:self-start w-full max-w-[340px] rounded-3xl md:h-[min(calc(100svh_-_10rem),604px)] md:w-auto bg-slate-900 object-cover shadow-2xl"
            src="/sloperking/reel.mp4"
            poster="/sloperking/reel-poster.png"
            controls
            playsInline
            preload="metadata"
          />
          {/* On desktop the purchase box sits at the bottom, level with the bottom of the reel */}
          <div className="flex max-w-xl flex-col">
            <div>
            <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-950">
              Presale open
            </span>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
              The Sloper King™ is ready, tested and in production! It starts shipping on 1 December.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Thanks for all the messages after the reel! Everything is here: pick your
              country, choose how many you want and lock in your spot.
            </p>
            <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-800">
              <li className="flex items-start gap-3">
                <Gift className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                {batchFull
                  ? `The Christmas batch of ${CHRISTMAS_SPOTS} is full. You can still pre-order, delivery after Christmas`
                  : `The first ${CHRISTMAS_SPOTS} Sloper Kings are delivered before Christmas`}
              </li>
              <li className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                Tracked shipping across Europe, the cost is shown for your country
              </li>
              <li className="flex items-start gap-3">
                <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <span>
                  We don&apos;t ship to your country yet (US, Canada, UK…)?{' '}
                  <button
                    type="button"
                    onClick={goToWaitlist}
                    className="font-black text-amber-700 underline underline-offset-2 hover:text-amber-600"
                  >
                    Join the waitlist
                  </button>
                  , we&apos;re working on shipping for January/February
                </span>
              </li>
            </ul>
            </div>
            {/* One purchase box: counter, prices and the button, the same width as the text above */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:mt-auto">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <div>
                  {stats ? (
                    <span className="text-2xl font-black text-slate-950">{stats.sold}</span>
                  ) : (
                    <NumberSkeleton className="h-7 w-14" />
                  )}
                  <span className="ml-1.5 font-bold text-slate-500">sold</span>
                  <span className="ml-2 text-xs font-black text-emerald-700">
                    {stats && stats.sold >= BREAK_EVEN ? '· break-even reached' : `· break-even ${BREAK_EVEN}`}
                  </span>
                </div>
                {spotsLeft === null ? (
                  <NumberSkeleton className="h-4 w-32" />
                ) : (
                  <span className="font-black text-slate-700">
                    {spotsLeft > 0 ? `${spotsLeft} of ${CHRISTMAS_SPOTS} Christmas spots left` : 'Christmas batch full'}
                  </span>
                )}
              </div>
              <div className="relative mt-2">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${stats ? Math.min((stats.sold / CHRISTMAS_SPOTS) * 100, 100) : 0}%` }}
                  />
                </div>
                {/* Break-even marker */}
                <div
                  className="absolute -top-1 h-4 w-0.5 rounded bg-emerald-600"
                  style={{ left: `${(BREAK_EVEN / CHRISTMAS_SPOTS) * 100}%` }}
                  aria-hidden="true"
                />
              </div>
              {/* Price: the current tier large, early bird and the next tier on one small line */}
              <div className="mt-3 flex items-end justify-between gap-4 border-t border-slate-100 pt-3">
                <div className="text-sm">
                  <div className="font-black text-slate-950">
                    {(stats?.tier ?? FALLBACK_TIER).label} price{tierLeft !== null ? ` · ${tierLeft} left` : ''}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    <span className="line-through">
                      Early bird {eur(EARLY_BIRD.single)} / {eur(EARLY_BIRD.pair)}
                    </span>
                    {(stats ? stats.next : FALLBACK_NEXT) &&
                      ` · then ${(stats ? stats.next! : FALLBACK_NEXT).label.toLowerCase()} ${eur((stats ? stats.next! : FALLBACK_NEXT).prices.single)} / ${eur((stats ? stats.next! : FALLBACK_NEXT).prices.pair)}`}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-black text-slate-950">
                    {eur((stats?.tier ?? FALLBACK_TIER).prices.single)} / {eur((stats?.tier ?? FALLBACK_TIER).prices.pair)}
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">Single / Pair</div>
                </div>
              </div>
              <button
                onClick={scrollToOrder}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white hover:bg-slate-800"
              >
                Pre-order now · from {eur(prices.single)} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Personal thank-you video (shows a placeholder until the file exists) */}
      <section className="border-b border-slate-200 bg-slate-950 px-4 py-14 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black md:text-3xl">A personal thank you</h2>
          <p className="mt-2 text-sm text-slate-300">
            Over 70,000 of you watched the reel and hundreds of you sent a message. That means the world to me.
          </p>
          {thanksMissing ? (
            <div className="mx-auto mt-6 flex aspect-[9/16] w-full max-w-xs items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 text-sm font-bold text-slate-500">
              Thank-you video coming soon
            </div>
          ) : (
            <video
              className="mx-auto mt-6 aspect-[9/16] w-full max-w-xs rounded-3xl bg-slate-900 object-contain shadow-2xl"
              src={THANK_YOU_VIDEO}
              controls
              playsInline
              preload="metadata"
              onError={() => setThanksMissing(true)}
            />
          )}
        </div>
      </section>

      {/* Real photos */}
      <section className="border-b border-slate-200 bg-white px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-black text-slate-950">Not just a render: the real thing</h2>
          <p className="mt-2 text-sm text-slate-600">Made in Belgium, tested on pull-up bars, pick-ups, cable machines and on a tree and bolts at crags.</p>
          {/* 4 photos + 2 videos, all the same square tile; videos open in a pop-up */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {PHOTOS.map((src, i) =>
              missingPhotos.has(i) ? (
                <div
                  key={src}
                  className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-xs font-bold text-slate-400"
                >
                  Photo {i + 1}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`Sloper King photo ${i + 1}`}
                  loading="lazy"
                  className="aspect-square w-full rounded-2xl object-cover"
                  onError={() => setMissingPhotos((prev) => new Set(prev).add(i))}
                />
              )
            )}
            {CLIPS.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveClip(src)}
                aria-label={`Play Sloper King video ${i + 1}`}
                className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900"
              >
                <video
                  src={`${src}#t=0.1`}
                  className="pointer-events-none h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20 transition-colors group-hover:bg-slate-950/35">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 shadow-lg">
                    <Play className="ml-0.5 h-6 w-6 fill-slate-950 text-slate-950" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Order flow */}
      <section ref={orderRef} id="order" className="scroll-mt-20 border-b border-slate-200 bg-slate-50 px-4 py-14">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-black text-slate-950">Reserve your Sloper King™</h2>
          {batchFull && (
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800">
              The Christmas batch is full, but you can still pre-order. New orders ship from {formatDay(shipDateFor(CHRISTMAS_SPOTS + 1))}.
            </p>
          )}

          {/* Step 1: country */}
          <label className="mt-6 block text-xs font-black uppercase tracking-wider text-slate-500" htmlFor="country">
            1. Where should we ship it?
          </label>
          <select
            id="country"
            value={country}
            disabled={!rates}
            onChange={(e) => {
              setCountry(e.target.value);
              setPickup(false);
              setWaitlistState('idle');
            }}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">{rates ? 'Choose your country…' : 'Loading countries…'}</option>
            {shipCountries.length > 0 && (
              <optgroup label="We ship here">
                {POPULAR_COUNTRIES.filter((c) => shipCountries.includes(c)).map((c) => (
                  <option key={c} value={c}>
                    {countryName(c)}
                  </option>
                ))}
                {shipCountries
                  .filter((c) => !POPULAR_COUNTRIES.includes(c))
                  .sort(byName)
                  .map((c) => (
                    <option key={c} value={c}>
                      {countryName(c)}
                    </option>
                  ))}
              </optgroup>
            )}
            {/* Only after the rates load: country names differ between Node and the browser, so they can't be server-rendered */}
            {rates && (
              <optgroup label="Coming soon (waitlist)">
                {[...waitlistCountries.sort(byName), OTHER_COUNTRY].map((c) => (
                  <option key={c} value={c}>
                    {countryName(c)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {ratesError && (
            <p className="mt-2 text-sm font-semibold text-red-600">
              Could not load the countries.{' '}
              <button onClick={loadRates} className="underline">
                Try again
              </button>
            </p>
          )}

          {country && (
            <>
              {/* Step 2: how many */}
              <div className="mt-6 text-xs font-black uppercase tracking-wider text-slate-500">2. How many?</div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(['pair', 'single'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setItemType(type)}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      itemType === type ? 'border-amber-400 bg-white' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-black text-slate-950">{type === 'pair' ? 'Pair (2 units)' : 'Single unit'}</div>
                    <div className="mt-0.5 text-lg font-black text-slate-950">
                      €{prices[type].toFixed(2)}
                      {stats?.next && (
                        <span className="ml-1.5 text-xs font-bold text-slate-400 line-through">€{stats.next.prices[type].toFixed(2)}</span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      {type === 'pair' ? 'Both hands · pouch & guide card' : '1 unit with load cord'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2.5">
                <span className="text-sm font-bold text-slate-700">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    aria-label="Fewer"
                    onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-base font-black">{quantity}</span>
                  <button
                    aria-label="More"
                    onClick={() => setQuantity((q) => Math.min(q + 1, 20))}
                    className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {canShip ? (
                <>
                  {country === 'BE' && (
                    <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                      <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} className="h-4 w-4 accent-amber-500" />
                      Pick it up in Leuven (free)
                    </label>
                  )}

                  {/* Step 3: price + delivery */}
                  <div className="mt-6 text-xs font-black uppercase tracking-wider text-slate-500">3. Your order</div>
                  <div className="mt-2 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {quantity}x {itemType === 'pair' ? 'Pair' : 'Single unit'}
                      </span>
                      <span className="font-bold">€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{pickup ? 'Pickup in Leuven' : `Shipping to ${countryName(country)}`}</span>
                      <span className="font-bold">{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-black text-slate-950">
                      <span>Total</span>
                      <span>€{(subtotal + shipping).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                    <Package className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    {shipDate && position !== null ? (
                      <div>
                        {lastPosition! <= CHRISTMAS_SPOTS ? (
                          <strong>You&apos;re in the first {CHRISTMAS_SPOTS}: delivered before Christmas 🎄</strong>
                        ) : (
                          <strong>
                            {shipDate <= CHRISTMAS_CUTOFF
                              ? 'Should still arrive before Christmas'
                              : 'Christmas batch is full: delivery after Christmas'}
                          </strong>
                        )}
                        <div className="mt-0.5 text-slate-600">
                          Sloper King {units > 1 ? `#${position}–${lastPosition}` : `#${position}`} · estimated {pickup ? 'ready for pickup' : 'dispatch'} {formatDay(shipDate)}
                          {pickup ? '' : ', delivered 1–3 working days later'}.
                        </div>
                      </div>
                    ) : (
                      <div>
                        Shipping starts 1 December. The first {CHRISTMAS_SPOTS} Sloper Kings are delivered before Christmas.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isLoadingCheckout}
                    className="mt-5 w-full rounded-xl bg-slate-950 py-4 text-base font-black text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {isLoadingCheckout ? 'Loading payment…' : `Pre-order now · €${(subtotal + shipping).toFixed(2)}`}
                  </button>
                  {checkoutError && <p className="mt-2 text-sm font-semibold text-red-600">{checkoutError}</p>}
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4" /> Secure payment with Stripe. You pay now and your place in the queue is locked in.
                  </p>
                </>
              ) : waitlistState === 'done' ? (
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    You&apos;re on the list! We&apos;ll email <strong>{email}</strong> as soon as we can ship to {countryName(country)}.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWaitlist} className="mt-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    <strong className="text-slate-950">We don&apos;t ship to {countryName(country)} yet.</strong> We&apos;re looking
                    for affordable shipping in January/February. Leave your email and you&apos;ll be the first to know, with your
                    spot reserved.
                  </div>
                  <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500" htmlFor="email">
                    3. Notify me
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                    <button
                      type="submit"
                      disabled={waitlistState === 'saving'}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      <Bell className="h-4 w-4" /> {waitlistState === 'saving' ? 'Saving…' : 'Notify me'}
                    </button>
                  </div>
                  {waitlistState === 'error' && (
                    <p className="mt-2 text-sm font-semibold text-red-600">Could not save your email. Please try again.</p>
                  )}
                </form>
              )}
            </>
          )}
        </div>

      </section>

      {/* Question form: sent through the same contact function as the homepage */}
      <section id="questions" className="scroll-mt-20 border-b border-slate-200 bg-white px-4 py-14">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-black text-slate-950">Questions?</h2>
          <p className="mt-2 text-sm text-slate-600">Ask anything. I&apos;ll answer you personally by email.</p>
          {questionState === 'done' ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>Thanks! Your question is on its way. I&apos;ll reply to {question.email}.</div>
            </div>
          ) : (
            <form onSubmit={handleQuestion} className="mt-6 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={question.name}
                  onChange={(e) => setQuestion({ ...question, name: e.target.value })}
                  placeholder="Your name"
                  maxLength={100}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
                <input
                  type="email"
                  required
                  value={question.email}
                  onChange={(e) => setQuestion({ ...question, email: e.target.value })}
                  placeholder="you@email.com"
                  className="rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <textarea
                required
                rows={4}
                maxLength={3000}
                value={question.message}
                onChange={(e) => setQuestion({ ...question, message: e.target.value })}
                placeholder="Your question…"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              {/* Honeypot for bots, hidden from people */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={question.website}
                onChange={(e) => setQuestion({ ...question, website: e.target.value })}
                className="hidden"
                aria-hidden="true"
              />
              <button
                type="submit"
                disabled={questionState === 'sending'}
                className="w-full rounded-xl bg-slate-950 py-3.5 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {questionState === 'sending' ? 'Sending…' : 'Send question'}
              </button>
              {questionState === 'error' && (
                <p className="text-sm font-semibold text-red-600">Could not send your question. Please try again.</p>
              )}
            </form>
          )}
        </div>
      </section>

      {activeClip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setActiveClip(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Sloper King video"
        >
          <button
            onClick={() => setActiveClip(null)}
            aria-label="Close video"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          <video
            src={activeClip}
            className="max-h-[85vh] max-w-full rounded-2xl bg-black shadow-2xl"
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {checkout && (
        <CheckoutDialog
          clientSecret={checkout.clientSecret}
          publishableKey={checkout.publishableKey}
          livemode={checkout.livemode}
          shippingUrl={pickup ? undefined : `${ORDER_API}/shipping`}
          exactTotal
          title={itemType === 'pair' ? 'Sloper King™ Set of 2 (Pair)' : 'Sloper King™ Single Unit'}
          subtitle={shipDate ? `Presale · estimated ${pickup ? 'pickup' : 'dispatch'} ${formatDay(shipDate)}` : 'Presale · shipping from 1 December'}
          rows={[
            { label: `${quantity}x ${itemType === 'pair' ? 'Pair' : 'Single unit'}`, value: `€${subtotal.toFixed(2)}` },
            { label: pickup ? 'Pickup in Leuven' : `Shipping (${countryName(country)})`, value: shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}` },
          ]}
          onClose={() => setCheckout(null)}
        />
      )}

      {order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={() => setOrder(null)}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {order.state === 'checking' && (
              <>
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
                <h2 className="mt-3 text-xl font-black text-slate-950">Checking your payment…</h2>
              </>
            )}
            {order.state === 'paid' && (
              <>
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h2 className="mt-3 text-xl font-black text-slate-950">Your Sloper King™ is reserved!</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {sold !== null
                    ? `Estimated dispatch: ${formatDay(shipDateFor(sold))}. `
                    : 'Shipping starts 1 December. '}
                  You&apos;ll get tracking details by email
                  {order.email ? (
                    <>
                      {' '}
                      at <strong>{order.email}</strong>
                    </>
                  ) : null}
                  .
                </p>
                <p className="mt-3 text-xs text-slate-400">Order number: {order.orderId}</p>
              </>
            )}
            {order.state === 'pending' && (
              <>
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
                <h2 className="mt-3 text-xl font-black text-slate-950">Payment is being processed</h2>
                <p className="mt-2 text-sm text-slate-600">We&apos;ll reserve your spot as soon as the payment is confirmed.</p>
                <p className="mt-3 text-xs text-slate-400">Order number: {order.orderId}</p>
              </>
            )}
            {order.state === 'error' && (
              <>
                <h2 className="text-xl font-black text-slate-950">We couldn&apos;t check your order</h2>
                <p className="mt-2 text-sm text-slate-600">If you completed the payment, your order is safe. We&apos;ll be in touch by email.</p>
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
    </BambumLayout>
  );
}
