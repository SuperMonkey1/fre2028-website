import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AdminPasswordModal, useAdminShortcut } from '../components/AdminPasswordModal'
import { useEffect } from 'react'
import Script from 'next/script'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'
import { GA_TRACKING_ID, META_PIXEL_ID, CLARITY_ID, pageview as trackPageview } from '@/lib/analytics'
import { analytics } from '@/lib/firebase'

export default function App({ Component, pageProps }: AppProps) {
  const { isModalOpen, setIsModalOpen } = useAdminShortcut();
  const router = useRouter();

  // Route change tracking for Google Analytics & Meta Pixel SPA navigation
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
      trackPageview(url);
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
      {/* 1. Google Analytics 4 Script */}
      {GA_TRACKING_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <Script
            id="google-analytics-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* 2. Meta Pixel Script (Instagram / Facebook Ads) */}
      {META_PIXEL_ID && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* 3. Microsoft Clarity Script (Heatmaps & Session Recordings) */}
      {CLARITY_ID && (
        <Script
          id="microsoft-clarity-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `,
          }}
        />
      )}

      <Component {...pageProps} />
      <AdminPasswordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}

