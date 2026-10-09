import { useEffect, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import type { FingerParams } from '@/lib/fingerprint/layout';

// Stripe's embedded checkout form (ui_mode "form"). Shipping is calculated by our server from the
// address the customer enters; after paying, Stripe sends them to the session's return_url.
const STRIPE_JS = 'https://js.stripe.com/endive/stripe.js';

let stripeJsPromise: Promise<any> | null = null;
const loadStripeJs = () => {
  if (!stripeJsPromise) {
    stripeJsPromise = new Promise((resolve, reject) => {
      if ((window as any).Stripe) return resolve((window as any).Stripe);
      const script = document.createElement('script');
      script.src = STRIPE_JS;
      script.async = true;
      script.onload = () => resolve((window as any).Stripe);
      script.onerror = () => {
        stripeJsPromise = null;
        reject(new Error('Could not load the payment form.'));
      };
      document.head.appendChild(script);
    });
  }
  return stripeJsPromise;
};

interface Props {
  clientSecret: string;
  publishableKey: string;
  shippingUrl: string;
  livemode: boolean;
  /** The design being ordered, shown in the order summary. */
  design: { left: FingerParams; right: FingerParams; locked: boolean };
  priceCents: number;
  onClose: () => void;
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();
const euro = (cents: number) => `€${(cents / 100).toFixed(2)}`;

function HandSummary({ title, p }: { title: string; p: FingerParams }) {
  const rows: [string, number | null, number][] = [
    ['Pinky', 0, p.width.pinky],
    ['Ring', p.offset.ring, p.width.ring],
    ['Middle', p.offset.middle, p.width.middle],
    ['Index', p.offset.index, p.width.index],
  ];
  return (
    <div>
      <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{title}</div>
      <table className="w-full text-xs text-slate-600">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-slate-400">
            <th className="py-0.5 text-left font-bold">Finger</th>
            <th className="py-0.5 text-right font-bold">Length</th>
            <th className="py-0.5 text-right font-bold">Width</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, len, w]) => (
            <tr key={name} className="border-t border-slate-200/70">
              <td className="py-0.5">{name}</td>
              <td className="py-0.5 text-right tabular-nums">{fmt(len ?? 0)} mm</td>
              <td className="py-0.5 text-right tabular-nums">{fmt(w)} mm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CheckoutDialog({ clientSecret, publishableKey, shippingUrl, livemode, design, priceCents, onClose }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let form: any = null;
    let addressDone = false;

    const updateShipping = async (sessionId: string, shippingDetails: unknown) => {
      const res = await fetch(shippingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, shippingDetails }),
      });
      const result = await res.json().catch(() => ({ type: 'error', message: 'We couldn’t calculate shipping.' }));
      if (result.type === 'error') throw new Error(result.message);
      return result;
    };

    (async () => {
      try {
        const Stripe = await loadStripeJs();
        if (cancelled) return;
        const stripe = Stripe(publishableKey);
        const checkout = await stripe.initCheckoutFormSdk({ clientSecret });
        if (cancelled) return;
        form = checkout.createForm();
        form.mount(mountRef.current);
        setLoading(false);

        form.on('change', async (event: any) => {
          const { value, status } = event;
          if (status?.shippingAddress?.complete && !addressDone) {
            addressDone = true;
            const loaded = await checkout.loadActions();
            if (loaded.type !== 'success') {
              addressDone = false;
              return;
            }
            const actions = loaded.actions;
            try {
              await actions.runServerUpdate(() => updateShipping(actions.getSession().id, value.shippingAddress));
              setShippingError(null);
            } catch (e: any) {
              addressDone = false;
              setShippingError(e?.message || 'We couldn’t calculate shipping for this address.');
            }
          } else if (!status?.shippingAddress?.complete && addressDone) {
            addressDone = false;
          }
        });
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          setError(e?.message || 'Could not load the payment form.');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        form?.unmount?.();
        form?.destroy?.();
      } catch {}
    };
  }, [clientSecret, publishableKey, shippingUrl]);

  return (
    // The overlay itself scrolls; the inner min-h-full wrapper centres the card only while it fits,
    // so a tall Stripe form can always be scrolled back to the top.
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center p-3 sm:p-6 lg:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Checkout"
          className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[2fr_3fr]"
        >
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="absolute right-3 top-3 z-10 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Order summary */}
          <aside className="border-b border-slate-200 bg-slate-50 p-5 sm:p-6 md:border-b-0 md:border-r">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Your order</div>
            <h2 className="mt-1 text-xl font-black text-slate-950">FingerPrint set</h2>
            <p className="mt-1 text-xs text-slate-500">Custom crimp edges for your left and right hand, made to your measurements.</p>

            <div className="mt-5 space-y-4">
              {design.locked ? (
                <HandSummary title="Both hands" p={design.left} />
              ) : (
                <>
                  <HandSummary title="Left hand" p={design.left} />
                  <HandSummary title="Right hand" p={design.right} />
                </>
              )}
            </div>

            <dl className="mt-5 space-y-1.5 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">FingerPrint set (left + right)</dt>
                <dd className="font-bold text-slate-950">{euro(priceCents)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600">Shipping</dt>
                <dd className="text-right text-slate-600">€2.99 Belgium · €4.99 rest of the EU</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-slate-400">The exact total appears in the payment form once your address is filled in.</p>

            {!livemode && (
              <p className="mt-4 rounded-md bg-amber-100 px-2 py-1.5 text-[11px] font-bold text-amber-800">
                Test mode: no real payment. Use card 4242 4242 4242 4242.
              </p>
            )}
          </aside>

          {/* Stripe form */}
          <div className="p-5 sm:p-6">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm font-bold text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading the payment form…
              </div>
            )}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            {shippingError && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{shippingError}</div>
            )}
            <div ref={mountRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
