import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';

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
  /** Called with the entered shipping address to set the shipping cost. Omit when nothing ships (pickup). */
  shippingUrl?: string;
  livemode: boolean;
  title: string;
  subtitle?: string;
  /** What is being ordered (e.g. the hand measurements). */
  summary?: ReactNode;
  /** Price rows shown under the summary. */
  rows: { label: string; value: string }[];
  onClose: () => void;
}

export default function CheckoutDialog({ clientSecret, publishableKey, shippingUrl, livemode, title, subtitle, summary, rows, onClose }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let form: any = null;
    let addressDone = false;

    const updateShipping = async (sessionId: string, shippingDetails: unknown) => {
      const res = await fetch(shippingUrl as string, {
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
          if (shippingUrl && status?.shippingAddress?.complete && !addressDone) {
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
            <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}

            {summary && <div className="mt-5 space-y-4">{summary}</div>}

            <dl className="mt-5 space-y-1.5 border-t border-slate-200 pt-4 text-sm">
              {rows.map((r) => (
                <div key={r.label} className="flex justify-between gap-3">
                  <dt className="text-slate-600">{r.label}</dt>
                  <dd className="text-right font-bold text-slate-950">{r.value}</dd>
                </div>
              ))}
            </dl>
            {shippingUrl && (
              <p className="mt-2 text-[11px] text-slate-400">The exact total appears in the payment form once your address is filled in.</p>
            )}

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
