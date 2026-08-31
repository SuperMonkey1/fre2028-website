import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AdminPasswordModal, useAdminShortcut } from '../components/AdminPasswordModal'
import { useEffect } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'
import { analytics } from '@/lib/firebase'

export default function App({ Component, pageProps }: AppProps) {
  const { isModalOpen, setIsModalOpen } = useAdminShortcut();
  const router = useRouter();

  // Route change tracking for Google Analytics SPA navigation
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Track incoming partner outreach campaign clicks
  useEffect(() => {
    if (!router.isReady) return;

    const { utm_source, utm_medium, utm_campaign, company, partner } = router.query;
    const companyIdentifier = (utm_source || company || partner) as string;

    if (companyIdentifier) {
      gtag.trackPartnerVisit(companyIdentifier, {
        medium: (utm_medium as string) || 'email',
        campaign: (utm_campaign as string) || 'partner_outreach_2028',
        page: router.asPath,
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Google Analytics] Partner campaign click detected for: ${companyIdentifier}`);
      }
    }
  }, [router.isReady, router.query, router.asPath]);

  // Firebase analytics initialization log
  useEffect(() => {
    if (analytics) {
      console.log('Firebase Analytics initialized');
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <AdminPasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}

