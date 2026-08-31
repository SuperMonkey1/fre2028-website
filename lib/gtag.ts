export const GA_TRACKING_ID = 
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 
  process.env.NEXT_PUBLIC_GA_ID || 
  'G-BLZXHXVC42';

// Safe gtag wrapper that buffers calls to dataLayer if gtag.js is still loading
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag(...args);
    } else {
      // Fallback gtag implementation matching Google's snippet
      const gtagFunction = function () {
        (window as any).dataLayer.push(arguments);
      };
      (window as any).gtag = (window as any).gtag || gtagFunction;
      (window as any).gtag(...args);
    }
  }
};

// Track pageviews across route transitions in Next.js SPA
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom Google Analytics events
export const event = (action: string, params: Record<string, any> = {}) => {
  gtag('event', action, params);
};

// Dedicated tracker for partner outreach campaigns
export const trackPartnerVisit = (
  company: string,
  details?: { medium?: string; campaign?: string; page?: string }
) => {
  event('partner_email_open', {
    company_name: company,
    campaign_source: company,
    campaign_medium: details?.medium || 'email',
    campaign_name: details?.campaign || 'partner_outreach_2028',
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    page_title: typeof document !== 'undefined' ? document.title : '',
    timestamp: new Date().toISOString(),
  });
};
