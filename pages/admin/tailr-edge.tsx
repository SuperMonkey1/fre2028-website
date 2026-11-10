import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Download, ExternalLink, Hand, Loader2, Printer, RefreshCw } from 'lucide-react';

import { PAYMENTS_API } from '@/lib/bambum/shop';
import { formatHeight } from '@/lib/fingerprint/savedHand';
import { orderCode } from '@/lib/fingerprint/orderCode';
import type { FingerParams, Hand as HandSide } from '@/lib/fingerprint/layout';

// Tailr Edge orders with everything needed to make them: the customer's height and gender, the design values per hand
// and the final STL/STEP files, built here in the browser with the same CAD engine as the designer.
// Loading needs SLOPERKING_ADMIN_KEY from functions/.env (the same key as /admin/shipping).
const ADMIN_KEY_STORAGE = 'sloperking_admin_key';
const ORDERS_API = `${PAYMENTS_API}/fingerprint/admin/orders`;
const PHOTO_API = `${PAYMENTS_API}/fingerprint/admin/measurement`;
const INVITES_API = `${PAYMENTS_API}/fingerprint/admin/invites`;
// Runs the print script on this PC (only when this page runs on localhost with npm run dev)
const PRINT_API = '/api/admin/tailr-print';

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
  /** Early-access order: sent with (or picked up with) this Sloper King order */
  earlyAccess: { sloperKingOrderId: string; pickup: boolean } | null;
  /** Stored photo with the measurement overlay, from the measure page */
  measurementId: string;
}

interface Invite {
  token: string;
  link: string;
  name: string;
  email: string;
  pickup: boolean;
  city: string;
  sloperKingOrderId: string;
  livemode: boolean;
  usedAt: string | null;
  tailrOrderId: string;
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
  // Printing: up to two orders per plate, prepared by tools/tailr-edge-print.cjs on this PC
  const [printAvailable, setPrintAvailable] = useState(false);
  const [printed, setPrinted] = useState<Record<string, { at: string; file: string }>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [printing, setPrinting] = useState(false);
  const [printLog, setPrintLog] = useState<{ ok: boolean; text: string } | null>(null);
  // Early-access links for Sloper King buyers (€24 set, sent with their Sloper King)
  const [invites, setInvites] = useState<Invite[] | null>(null);
  const [invitesBusy, setInvitesBusy] = useState(false);
  const [invitesNote, setInvitesNote] = useState<string | null>(null);

  const makeInvites = async () => {
    if (!adminKey || invitesBusy) return;
    setInvitesBusy(true);
    setInvitesNote(null);
    try {
      const res = await fetch(INVITES_API, { method: 'POST', headers: { 'x-admin-key': adminKey } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not create the links.');
      setInvites(data.invites || []);
      setInvitesNote(data.created ? `${data.created} new link${data.created === 1 ? '' : 's'} created.` : 'All Sloper King buyers already have a link.');
    } catch (e: any) {
      setInvitesNote(e?.message || 'Could not create the links.');
    } finally {
      setInvitesBusy(false);
    }
  };

  const copyInvites = () => {
    const rows = (invites || []).map((i) => [i.name, i.email, i.pickup ? 'pickup' : i.city, i.link].join('\t'));
    navigator.clipboard?.writeText(['Name\tEmail\tDelivery\tLink', ...rows].join('\n'));
    setInvitesNote('Copied as a table (paste into a spreadsheet).');
  };

  const loadPrinted = async () => {
    try {
      const res = await fetch(PRINT_API);
      if (!res.ok) throw new Error();
      setPrinted((await res.json()).printed || {});
      setPrintAvailable(true);
    } catch {
      setPrintAvailable(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 2 ? [...s, id] : s));

  const preparePrint = async () => {
    if (!selected.length || printing) return;
    setPrinting(true);
    setPrintLog(null);
    try {
      const res = await fetch(PRINT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: selected }),
      });
      const data = await res.json().catch(() => ({}));
      setPrintLog({ ok: !!data.ok, text: data.log || data.error || 'No output.' });
      if (data.ok) setSelected([]);
      await loadPrinted();
    } catch (e: any) {
      setPrintLog({ ok: false, text: e?.message || 'Could not run the print script.' });
    } finally {
      setPrinting(false);
    }
  };

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
    loadPrinted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const shown = useMemo(
    () => (orders || []).filter((o) => showUnfinished || o.status === 'paid'),
    [orders, showUnfinished],
  );

  // Measurement photos of the shown orders, loaded with the admin key (they are not public)
  const [photos, setPhotos] = useState<Record<string, string>>({});
  useEffect(() => {
    for (const o of shown) {
      if (!o.measurementId || !adminKey) continue;
      // the photo with the overlay, and the original as the customer uploaded it
      for (const [key, url] of [
        [o.measurementId, `${PHOTO_API}/${o.measurementId}`],
        [`${o.measurementId}:original`, `${PHOTO_API}/${o.measurementId}?original=1`],
      ]) {
        if (photos[key] !== undefined) continue;
        setPhotos((p) => ({ ...p, [key]: '' }));
        fetch(url, { headers: { 'x-admin-key': adminKey } })
          .then((r) => (r.ok ? r.blob() : Promise.reject()))
          .then((b) => setPhotos((p) => ({ ...p, [key]: URL.createObjectURL(b) })))
          .catch(() => setPhotos((p) => ({ ...p, [key]: 'error' })));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, adminKey]);

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

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
          {printAvailable ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={preparePrint}
                disabled={!selected.length || printing}
                className="flex items-center gap-1.5 rounded bg-black px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-40"
              >
                {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                {printing ? 'Preparing…' : `Prepare print${selected.length ? ` (${selected.map((id) => orderCode(id)).join(' + ')})` : ''}`}
              </button>
              <span className="text-sm text-zinc-500">
                Tick one or two orders (one plate). They are built with their code engraved, put in your Bambu Studio
                template, sliced and opened in Bambu Studio: you only press Print.
              </span>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              To send orders to the printer, open this page on your own PC with <code className="rounded bg-zinc-100 px-1">npm run dev</code>{' '}
              (localhost:3000/admin/tailr-edge).
            </p>
          )}
          {printLog && (
            <pre
              className={`mt-3 max-h-60 overflow-auto whitespace-pre-wrap rounded border p-3 text-xs ${
                printLog.ok ? 'border-zinc-200 bg-zinc-50 text-zinc-700' : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {printLog.text}
            </pre>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={makeInvites}
              disabled={!adminKey || invitesBusy}
              className="flex items-center gap-1.5 rounded border border-zinc-300 px-4 py-2 text-sm font-bold hover:bg-zinc-50 disabled:opacity-40"
            >
              {invitesBusy && <Loader2 className="h-4 w-4 animate-spin" />} Early-access links for Sloper King buyers
            </button>
            {invites && invites.length > 0 && (
              <button onClick={copyInvites} className="text-sm font-bold text-zinc-600 underline-offset-2 hover:text-black hover:underline">
                Copy as table
              </button>
            )}
            <span className="text-sm text-zinc-500">
              {invitesNote || 'One personal link per paid Sloper King order: one Tailr Edge set for €24, sent with their Sloper King.'}
            </span>
          </div>
          {invites && invites.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left text-[10px] uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="py-1 pr-3 font-bold">Name</th>
                    <th className="py-1 pr-3 font-bold">Email</th>
                    <th className="py-1 pr-3 font-bold">Delivery</th>
                    <th className="py-1 pr-3 font-bold">Link</th>
                    <th className="py-1 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((i) => (
                    <tr key={i.token} className="border-t border-zinc-100">
                      <td className="py-1 pr-3">{i.name || '–'}</td>
                      <td className="py-1 pr-3">{i.email || '–'}</td>
                      <td className="py-1 pr-3">{i.pickup ? 'pickup Leuven' : i.city || '–'}</td>
                      <td className="py-1 pr-3 font-mono">
                        <a href={i.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          …{i.token}
                        </a>
                      </td>
                      <td className="py-1">
                        {i.usedAt ? `ordered (${orderCode(i.tailrOrderId)})` : 'not used'}
                        {!i.livemode && ' · TEST'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                    {printAvailable && o.status === 'paid' && o.design && (
                      <input
                        type="checkbox"
                        aria-label={`Select ${orderCode(o.orderId)} for printing`}
                        checked={selected.includes(o.orderId)}
                        disabled={!selected.includes(o.orderId) && selected.length >= 2}
                        onChange={() => toggle(o.orderId)}
                        className="h-4 w-4"
                      />
                    )}
                    <span
                      title="Engraved on the printed parts"
                      className="rounded bg-black px-1.5 py-0.5 font-mono text-sm font-bold tracking-wider text-white"
                    >
                      {orderCode(o.orderId)}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">{o.orderId}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        o.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {o.status === 'paid' ? (o.free ? 'free' : 'paid') : o.status.replace(/_/g, ' ')}
                    </span>
                    {printed[o.orderId] && (
                      <span
                        title={printed[o.orderId].file}
                        className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-800"
                      >
                        printed {dateTime(printed[o.orderId].at)}
                      </span>
                    )}
                    {o.earlyAccess && (
                      <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-800">
                        early access · {o.earlyAccess.pickup ? 'pickup with' : 'ship with'} Sloper King
                      </span>
                    )}
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

              {o.measurementId ? (
                <div className="mt-4 flex flex-wrap gap-4">
                  {(
                    [
                      [o.measurementId, 'Measurement photo', 'Customer photo with the measurement overlay', 'Could not load the photo.'],
                      [`${o.measurementId}:original`, 'Original photo', 'Customer photo as uploaded', 'No original photo stored.'],
                    ] as const
                  ).map(([key, title, alt, missing]) => (
                    <div key={key}>
                      <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</div>
                      {photos[key] && photos[key] !== 'error' ? (
                        <a href={photos[key]} target="_blank" rel="noopener noreferrer" title="Open full size">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photos[key]} alt={alt} className="max-h-96 rounded border border-zinc-200" />
                        </a>
                      ) : (
                        <p className="text-sm text-zinc-500">{photos[key] === 'error' ? missing : 'Loading photo…'}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-zinc-400">No measurement photo (ordered before photos were stored, or values entered by hand).</p>
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
