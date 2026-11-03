import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Plus, Save, Trash2, Truck } from 'lucide-react';

import { KNOWN_COUNTRIES, SHIPPING_RATES_API, countryNamer, fetchShippingRates } from '@/lib/bambum/shipping';

// Sloper King shipping cost per country. Countries not in the list can't order yet
// (the presale page puts them on the waitlist). Saving needs SLOPERKING_ADMIN_KEY from functions/.env.
const ADMIN_KEY_STORAGE = 'sloperking_admin_key';

export default function ShippingAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rows, setRows] = useState<{ code: string; price: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newPrice, setNewPrice] = useState('4.99');
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const countryName = useMemo(countryNamer, []);

  useEffect(() => {
    if (sessionStorage.getItem('admin_authenticated') !== 'true') {
      router.push('/');
      return;
    }
    setIsAuthenticated(true);
    try {
      setAdminKey(localStorage.getItem(ADMIN_KEY_STORAGE) || '');
    } catch {}
    fetchShippingRates()
      .then((rates) => setRows(Object.entries(rates).map(([code, eur]) => ({ code, price: eur.toFixed(2) }))))
      .catch((err) => setStatus({ type: 'error', text: err.message }))
      .finally(() => setIsLoading(false));
  }, [router]);

  const sortedRows = [...rows].sort((a, b) => countryName(a.code).localeCompare(countryName(b.code)));
  const available = KNOWN_COUNTRIES.filter((c) => !rows.some((r) => r.code === c)).sort((a, b) =>
    countryName(a).localeCompare(countryName(b))
  );

  const update = (next: { code: string; price: string }[]) => {
    setRows(next);
    setDirty(true);
    setStatus(null);
  };

  const addCountry = () => {
    if (!newCountry) return;
    update([...rows, { code: newCountry, price: newPrice }]);
    setNewCountry('');
  };

  const save = async () => {
    const invalid = rows.find((r) => !/^\d+([.,]\d{1,2})?$/.test(r.price.trim()) || Number(r.price.replace(',', '.')) > 100);
    if (invalid) {
      setStatus({ type: 'error', text: `Check the price for ${countryName(invalid.code)} (e.g. 4.99, max €100).` });
      return;
    }
    if (!adminKey) {
      setStatus({ type: 'error', text: 'Enter the admin key (SLOPERKING_ADMIN_KEY in functions/.env).' });
      return;
    }
    setIsSaving(true);
    setStatus(null);
    try {
      const res = await fetch(SHIPPING_RATES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ rates: Object.fromEntries(rows.map((r) => [r.code, Number(r.price.replace(',', '.'))])) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save the rates.');
      try {
        localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
      } catch {}
      setDirty(false);
      setStatus({ type: 'ok', text: 'Saved. The shop and checkout use the new rates within a minute.' });
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message });
    }
    setIsSaving(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Head>
        <title>Admin - Sloper King shipping</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Truck className="h-5 w-5" /> Sloper King shipping
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-zinc-600">
          Shipping cost per order, per country. Customers can only order to the countries listed here; any other country
          gets the waitlist on <Link href="/sloperking" className="font-semibold underline">/sloperking</Link>.
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {isLoading ? (
            <div className="p-6 text-sm text-zinc-500">Loading rates…</div>
          ) : sortedRows.length === 0 ? (
            <div className="p-6 text-sm text-zinc-500">No countries yet: nobody can order with shipping.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-2.5">Country</th>
                  <th className="px-4 py-2.5">Shipping (€)</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sortedRows.map((row) => (
                  <tr key={row.code}>
                    <td className="px-4 py-2 font-medium">
                      {countryName(row.code)} <span className="text-xs text-zinc-400">{row.code}</span>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        inputMode="decimal"
                        value={row.price}
                        onChange={(e) => update(rows.map((r) => (r.code === row.code ? { ...r, price: e.target.value } : r)))}
                        className="w-24 rounded border border-zinc-300 px-2 py-1 focus:border-black focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        aria-label={`Remove ${countryName(row.code)}`}
                        onClick={() => update(rows.filter((r) => r.code !== row.code))}
                        className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-3">
            <select
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">Add a country…</option>
              {available.map((c) => (
                <option key={c} value={c}>
                  {countryName(c)}
                </option>
              ))}
            </select>
            <input
              inputMode="decimal"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-sm"
              aria-label="Shipping price for the new country"
            />
            <button
              onClick={addCountry}
              disabled={!newCountry}
              className="inline-flex items-center gap-1.5 rounded bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-zinc-300 hover:bg-zinc-100 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="flex-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
            Admin key
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="SLOPERKING_ADMIN_KEY from functions/.env"
              className="mt-1 block w-full rounded border border-zinc-300 px-3 py-2 text-sm font-normal normal-case tracking-normal focus:border-black focus:outline-none"
            />
          </label>
          <button
            onClick={save}
            disabled={isSaving || isLoading || !dirty}
            className="inline-flex items-center gap-2 bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {isSaving ? 'Saving…' : 'Save rates'}
          </button>
        </div>
        {status && (
          <p className={`mt-3 text-sm font-semibold ${status.type === 'ok' ? 'text-emerald-700' : 'text-red-600'}`}>{status.text}</p>
        )}
      </main>
    </div>
  );
}
