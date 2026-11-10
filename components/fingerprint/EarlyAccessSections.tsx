import { useEffect, useState } from 'react';
import { ArrowRight, Camera, Gift, Play, Truck, X } from 'lucide-react';
import type { EarlyAccessInvite } from '@/components/fingerprint/PhotoDesigner';

// Sections of the personal early-access page, laid out like /sloperking.
// The media are the Sloper King ones for now; swap these paths for Tailr Edge media.
const REEL = '/sloperking/reel.mp4';
const REEL_POSTER = '/sloperking/reel-poster.png';
const PERSONAL_VIDEO = '/sloperking/thank-you.mp4';
const PHOTOS = Array.from({ length: 4 }, (_, i) => `/sloperking/presale/${i + 1}.jpg`);
const CLIPS = ['/sloperking/clips/clip-1.mp4', '/sloperking/clips/clip-2.mp4'];

// Until the counter loads from the invite
const FALLBACK_SOLD = 20;
const FALLBACK_SPOTS = 50;
// Regular shop price of a set (as in PhotoDesigner), shown struck through on the friends page
const SHOP_PRICE_CENTS = 4900;

const euro = (cents: number) => `€${(cents / 100).toFixed(2).replace(/\.00$/, '')}`;
const formatDeadline = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

/** Reel + personal welcome + price and Christmas counter + pre-order button (scrolls to the designer). */
export function EarlyAccessHero({ invite, onPreorder }: { invite: EarlyAccessInvite; onPreorder: () => void }) {
  const sold = invite.sold ?? FALLBACK_SOLD;
  const spots = invite.christmasSpots ?? FALLBACK_SPOTS;
  const spotsLeft = Math.max(spots - sold, 0);

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-100 px-4 py-6 md:py-8">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,340px)_1fr]">
        <video
          className="mx-auto aspect-[9/16] w-full max-w-[340px] rounded-3xl md:h-[min(calc(100svh_-_10rem),604px)] md:w-auto bg-slate-900 object-cover shadow-2xl"
          src={REEL}
          poster={REEL_POSTER}
          controls
          playsInline
          preload="metadata"
        />
        <div className="max-w-xl">
          <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-950">
            Early access for Sloper King owners
          </span>
          {/* Personal welcome */}
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
            {invite.firstName ? `Hi ${invite.firstName},` : 'Hi,'} your Tailr Edge set for {euro(invite.priceCents)}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Soon we launch our second product, Tailr Edge. Because you already ordered a Sloper King, you can get a set (left +
            right hand) now for <strong className="text-slate-950">{euro(invite.priceCents)}</strong> instead of{' '}
            {euro(invite.normalPriceCents)}, until {formatDeadline(invite.deadline)}.{' '}
            {invite.pickup ? 'Pick it up with your Sloper King' : 'It travels with your Sloper King'}, so you never pay shipping twice.
            This link is personal and is for one set.
          </p>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-800">
            <li className="flex items-start gap-3">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              {spotsLeft > 0
                ? `The first ${spots} sets are delivered before Christmas, together with your Sloper King`
                : `The Christmas batch of ${spots} is full. You can still order, delivery after Christmas`}
            </li>
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              {invite.pickup
                ? 'No shipping cost: you pick it up together with your Sloper King in Leuven'
                : `No shipping cost: it comes in the same package as your Sloper King`}
            </li>
            <li className="flex items-start gap-3">
              <Camera className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              Made to your fingers, measured from one photo of your hand with a bank card
            </li>
          </ul>

          {/* One purchase box: counter, price and the button, the same width as the text above */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <span className="text-3xl font-black text-slate-950">{sold}</span>
                <span className="ml-2 text-sm font-bold text-slate-500">sets ordered</span>
              </div>
              <span className="text-sm font-black text-slate-700">
                {spotsLeft > 0 ? `${spotsLeft} of ${spots} Christmas spots left` : 'Christmas batch full'}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min((sold / spots) * 100, 100)}%` }} />
            </div>
            <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">Set (left + right)</div>
                <div className="mt-0.5 text-sm text-slate-500">Early-access price until {formatDeadline(invite.deadline)}</div>
              </div>
              <div className="text-right">
                <span className="mr-2 text-sm font-bold text-slate-400 line-through">{euro(invite.normalPriceCents)}</span>
                <span className="text-3xl font-black text-slate-950">{euro(invite.priceCents)}</span>
              </div>
            </div>
            <button
              onClick={onPreorder}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white hover:bg-slate-800"
            >
              Pre-order now · {euro(invite.priceCents)} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Friends test page (/tailr-edge/friends): same hero, ordered as a new customer, free with code FRITS. */
export function FriendsHero({ onPreorder }: { onPreorder: () => void }) {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-100 px-4 py-6 md:py-8">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[minmax(0,340px)_1fr]">
        <video
          className="mx-auto aspect-[9/16] w-full max-w-[340px] rounded-3xl md:h-[min(calc(100svh_-_10rem),604px)] md:w-auto bg-slate-900 object-cover shadow-2xl"
          src={REEL}
          poster={REEL_POSTER}
          controls
          playsInline
          preload="metadata"
        />
        <div className="max-w-xl">
          <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-950">
            Friends test
          </span>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
            Hi friend, try the Tailr Edge before anyone else
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Soon we launch our second product, Tailr Edge. Before it goes public, I&apos;d love a few friends to test it. Measure your
            hand from one photo, order your set and enter the code <strong className="text-slate-950">FRITS</strong> at checkout: the
            set and the shipping are free. All I ask in return is your honest feedback.
          </p>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-800">
            <li className="flex items-start gap-3">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              Free with code FRITS: the set and the shipping
            </li>
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              Sent to your address, which you enter at checkout
            </li>
            <li className="flex items-start gap-3">
              <Camera className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              Made to your fingers, measured from one photo of your hand with a bank card
            </li>
          </ul>

          {/* One purchase box: price and the button, the same width as the text above */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">Set (left + right)</div>
                <div className="mt-0.5 text-sm text-slate-500">
                  With code <strong className="text-slate-950">FRITS</strong> at checkout, shipping included
                </div>
              </div>
              <div className="text-right">
                <span className="mr-2 text-sm font-bold text-slate-400 line-through">{euro(SHOP_PRICE_CENTS)} + shipping</span>
                <span className="text-3xl font-black text-slate-950">€0</span>
              </div>
            </div>
            <button
              onClick={onPreorder}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white hover:bg-slate-800"
            >
              Make yours <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Personal message video (placeholder until the file exists). */
export function EarlyAccessPersonalMessage({ friends = false }: { friends?: boolean }) {
  const [missing, setMissing] = useState(false);
  return (
    <section className="border-b border-slate-200 bg-slate-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-black md:text-3xl">A personal message</h2>
        <p className="mt-2 text-sm text-slate-300">
          {friends
            ? 'Thanks for helping me test Tailr Edge. Your feedback makes it better for everyone.'
            : 'You were among the first to believe in the Sloper King. That means the world to me.'}
        </p>
        {missing ? (
          <div className="mx-auto mt-6 flex aspect-[9/16] w-full max-w-xs items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 text-sm font-bold text-slate-500">
            Video coming soon
          </div>
        ) : (
          <video
            className="mx-auto mt-6 aspect-[9/16] w-full max-w-xs rounded-3xl bg-slate-900 object-contain shadow-2xl"
            src={PERSONAL_VIDEO}
            controls
            playsInline
            preload="metadata"
            onError={() => setMissing(true)}
          />
        )}
      </div>
    </section>
  );
}

/** Real photos and clips: 4 photos + 2 videos as square tiles, videos open in a pop-up. */
export function EarlyAccessRealPhotos() {
  const [missingPhotos, setMissingPhotos] = useState<Set<number>>(new Set());
  const [activeClip, setActiveClip] = useState<string | null>(null);

  useEffect(() => {
    if (!activeClip) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActiveClip(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeClip]);

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-black text-slate-950">Not just a render: the real thing</h2>
        <p className="mt-2 text-sm text-slate-600">Made in Belgium, printed and tested before it goes in your package.</p>
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
                alt={`Tailr Edge photo ${i + 1}`}
                loading="lazy"
                className="aspect-square w-full rounded-2xl object-cover"
                onError={() => setMissingPhotos((prev) => new Set(prev).add(i))}
              />
            ),
          )}
          {CLIPS.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveClip(src)}
              aria-label={`Play video ${i + 1}`}
              className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900"
            >
              <video src={`${src}#t=0.1`} className="pointer-events-none h-full w-full object-cover" muted playsInline preload="metadata" />
              <span className="absolute inset-0 flex items-center justify-center bg-slate-950/20 transition-colors group-hover:bg-slate-950/35">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 shadow-lg">
                  <Play className="ml-0.5 h-6 w-6 fill-slate-950 text-slate-950" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeClip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          onClick={() => setActiveClip(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Video"
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
    </section>
  );
}
