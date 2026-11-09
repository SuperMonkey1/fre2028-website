import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Download, ExternalLink, Hand, Loader2, RefreshCw } from 'lucide-react';

import { PAYMENTS_API } from '@/lib/bambum/shop';
import { formatHeight } from '@/lib/fingerprint/savedHand';
import type { FingerParams, Hand as HandSide } from '@/lib/fingerprint/layout';

// Tailr Edge orders with everything needed to make them: the customer's height and gender, the design values per hand
// and the final STL/STEP files, built here in the browser with the same CAD engine as the designer.
// Loading needs SLOPERKING_ADMIN_KEY from functions/.env (the same key as /admin/shipping).
const ADMIN_KEY_STORAGE = 'sloperking_admin_key';
const ORDERS_API = `${PAYMENTS_API}/fingerprint/admin/orders`;

interface Order {
  orderId: string;
  status: string;
  livemode: boolean;
  free: boolean;
  promoCode: string;
  createdAt: string | null;
  paidAt: string | null;
  customerName: string;
  customerEmail: string;
  heightCm: number | null;
  gender: string;
  design: { left: FingerParams; right: FingerParams; sameForBothHands?: boolean } | null;
  designUrl: string;
  amountTotal: number | null;
  shippingCountry: string;
}

type FileKind = 'stl' | 'step';

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–';

export default function TailrEdgeAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnfinished, setShowUnfinished] = useState(false);
  const [building, setBuilding] = useState<string | null>(null);

  const load = async (key = adminKey) => {
    if (!key) {
      setError('Enter the admin key (SLOPERKING_ADMIN_KEY in functions/.env).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ORDERS_API, { headers: { 'x-admin-key': key } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load the orders.');
      setOrders(data.orders || []);
      try {
        localStorage.setItem(ADMIN_KEY_STORAGE, key);
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Could not load the orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_authenticated') !== 'true') {
      router.push('/');
      return;
    }
    setIsAuthenticated(true);
    let key = '';
    try {
      key = localStorage.getItem(ADMIN_KEY_STORAGE) || '';
    } catch {}
    setAdminKey(key);
    if (key) load(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const shown = useMemo(
    () => (orders || []).filter((o) => showUnfinished || o.status === 'paid'),
    [orders, showUnfinished],
  );

  // Builds the final model for one hand and downloads it
  const download = async (order: Order, hand: HandSide, kind: FileKind) => {
    if (!order.design || building) return;
    const id = `${order.orderId}-${hand}-${kind}`;
    setBuilding(id);
    try {
      const engine = await import('@/lib/fingerprint/engine');
      await engine.initEngine();
      const res = await engine.buildDesign(order.design[hand], hand);
      const blob = kind === 'stl' ? res.shape.blobSTL({ binary: true, tolerance: 0.02, angularTolerance: 0.1 }) : res.shape.blobSTEP();
      engine.downloadBlob(blob, `TailrEdge_${order.orderId}_${hand}.${kind}`);
      res.shape.delete();
    } catch (e: any) {
      setError(`Could not build the ${hand} hand of order ${order.orderId}: ${e?.message || e}`);
    } finally {
      setBuilding(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <Head>
        <title>Tailr Edge orders | Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Hand className="h-5 w-5" /> Tailr Edge orders
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4">
          <label className="flex-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
            Admin key
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="SLOPERKING_ADMIN_KEY from functions/.env"
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-zinc-900 focus:border-zinc-500 focus:outline-none"
            />
          </label>
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded bg-black px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Load orders
          </button>
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input type="checkbox" checked={showUnfinished} onChange={(e) => setShowUnfinished(e.target.checked)} />
            Also show unfinished checkouts
          </label>
        </div>

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        {orders && (
          <p className="mt-6 text-sm text-zinc-500">
            {shown.length} {showUnfinished ? 'order' : 'paid order'}
            {shown.length === 1 ? '' : 's'}
            {!showUnfinished && orders.length > shown.length ? ` (${orders.length - shown.length} unfinished checkouts hidden)` : ''}
          </p>
        )}

        <div className="mt-3 space-y-4">
          {shown.map((o) => (
            <div key={o.orderId} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold">{o.orderId}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        o.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {o.status === 'paid' ? (o.free ? 'free' : 'paid') : o.status.replace(/_/g, ' ')}
                    </span>
                    {o.promoCode && <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600">code {o.promoCode}</span>}
                    {!o.livemode && <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600">TEST</span>}
                  </div>
                  <div className="mt-1 text-sm text-zinc-700">
                    {o.customerName || 'No name yet'}
                    {o.customerEmail && <span className="text-zinc-500"> · {o.customerEmail}</span>}
                    {o.shippingCountry && <span className="text-zinc-500"> · ships to {o.shippingCountry}</span>}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {o.paidAt ? `Paid ${dateTime(o.paidAt)}` : `Started ${dateTime(o.createdAt)}`}
                    {o.amountTotal !== null && ` · €${(o.amountTotal / 100).toFixed(2)}`}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div>
                    <span className="text-zinc-500">Height </span>
                    <strong>{o.heightCm ? formatHeight(o.heightCm) : '–'}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Gender </span>
                    <strong className="capitalize">{o.gender || '–'}</strong>
                  </div>
                </div>
              </div>

              {o.design ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {(['left', 'right'] as HandSide[]).map((hand) => (
                    <div key={hand} className="rounded border border-zinc-200 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{hand} hand</span>
                        <div className="flex gap-1.5">
                          {(['stl', 'step'] as FileKind[]).map((kind) => {
                            const id = `${o.orderId}-${hand}-${kind}`;
                            return (
                              <button
                                key={kind}
                                onClick={() => download(o, hand, kind)}
                                disabled={!!building}
                                className="flex items-center gap-1 rounded border border-zinc-300 px-2 py-1 text-xs font-bold hover:bg-zinc-50 disabled:opacity-50"
                              >
                                {building === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                                {kind.toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <table className="w-full text-xs">
                        <thead className="text-left text-[10px] uppercase tracking-wider text-zinc-400">
                          <tr>
                            <th className="py-0.5 font-bold">Finger</th>
                            <th className="py-0.5 text-right font-bold">Length</th>
                            <th className="py-0.5 text-right font-bold">Width</th>
                          </tr>
                        </thead>
                        <tbody className="tabular-nums">
                          {(['pinky', 'ring', 'middle', 'index'] as const).map((f) => (
                            <tr key={f} className="border-t border-zinc-100">
                              <td className="py-0.5 capitalize">{f}</td>
                              <td className="py-0.5 text-right">{f === 'pinky' ? 0 : o.design![hand].offset[f]} mm</td>
                              <td className="py-0.5 text-right">{o.design![hand].width[f]} mm</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">No design stored for this order.</p>
              )}

              {o.designUrl && (
                <a
                  href={o.designUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-black"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in the designer
                </a>
              )}
            </div>
          ))}
        </div>

        {building && (
          <p className="mt-4 text-xs text-zinc-500">Building the model… the first time loads the CAD engine (about 8 MB).</p>
        )}
      </main>
    </div>
  );
}
