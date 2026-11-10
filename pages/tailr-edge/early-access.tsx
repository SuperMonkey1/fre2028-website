import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import BambumLayout from '@/components/bambum/BambumLayout';
import PhotoDesigner, { type EarlyAccessInvite } from '@/components/fingerprint/PhotoDesigner';
import { PAYMENTS_API } from '@/lib/bambum/shop';

// Personal early-access page for Sloper King buyers: /tailr-edge/early-access?invite=TOKEN.
// The invite (from the email) tells who it is and where the set goes; without a valid invite there is no offer.
export default function TailrEdgeEarlyAccessPage() {
  const [invite, setInvite] = useState<EarlyAccessInvite | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('invite') || '';
    if (!/^[A-Za-z0-9_-]{6,40}$/.test(token)) {
      setError('This link is not valid.');
      return;
    }
    fetch(`${PAYMENTS_API}/fingerprint/invite/${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || 'This link is not valid.');
        setInvite({ ...data, token });
      })
      .catch((e) => setError(e?.message || 'This link is not valid.'));
  }, []);

  if (invite) return <PhotoDesigner invite={invite} />;

  return (
    <BambumLayout active="tailr-edge" links={[]} hideShopNav>
      <Head>
        <title>Tailr Edge | Early access</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-black text-slate-950">{error}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The early-access offer only works with the personal link from your email. Copy the whole link, or have a look at
              Tailr Edge in the shop.
            </p>
            <Link
              href="/shop/tailr-edge"
              className="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800"
            >
              Go to Tailr Edge
            </Link>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading your early-access offer…
          </div>
        )}
      </main>
    </BambumLayout>
  );
}
