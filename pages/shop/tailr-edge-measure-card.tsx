import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { MEASURE_PAGE } from '@/lib/fingerprint/savedHand';

/** Old address of the card measure page; the measure page itself now uses the card. */
export default function TailrEdgeMeasureCardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(MEASURE_PAGE);
  }, [router]);
  return (
    <Head>
      <meta name="robots" content="noindex" />
    </Head>
  );
}
