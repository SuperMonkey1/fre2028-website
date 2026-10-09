// Unified Tracking & Analytics Helper for Sloper King™ / Fre2028
// Supports Google Analytics 4 (GA4), Meta Pixel (Instagram/Facebook), and Microsoft Clarity

export const GA_TRACKING_ID = 
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 
  process.env.NEXT_PUBLIC_GA_ID || 
  'G-BLZXHXVC42';

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || '';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

// ============================================================================
// 1. Core Wrappers (Safe on Server & Client)
// ============================================================================

export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === 'function') {
      window.gtag(...args);
    } else {
      const gtagFn = function () {
        window.dataLayer?.push(arguments);
      };
      window.gtag = window.gtag || gtagFn;
      window.gtag(...args);
    }
  }
};

export const fbq = (...args: any[]) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
};

export const clarityEvent = (eventName: string) => {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', eventName);
  }
};

// ============================================================================
// 2. Standard Pageview & Generic Event
// ============================================================================

export const pageview = (url: string) => {
  if (typeof window !== 'undefined') {
    if (GA_TRACKING_ID) {
      gtag('config', GA_TRACKING_ID, {
        page_path: url,
      });
    }
    fbq('track', 'PageView');
  }
};

export const event = (action: string, params: Record<string, any> = {}) => {
  gtag('event', action, params);
};

// ============================================================================
// 3. Dedicated Sloper King™ E-Commerce Funnel Trackers
// ============================================================================

/**
 * Funnel Step 1: Bezoeker bekijkt /bambum/sloper-king landingspagina
 */
export const trackSloperKingView = () => {
  event('view_item_list', {
    item_list_id: 'sloper_king_products',
    item_list_name: 'Sloper King Training Tools',
    items: [
      { item_id: 'sloper_king_single', item_name: 'Sloper King™ (Single)', price: 24.95, item_category: 'Climbing Hardware' },
      { item_id: 'sloper_king_pair', item_name: 'Sloper King™ (Complete Pair)', price: 44.95, item_category: 'Climbing Hardware' },
    ],
  });

  fbq('track', 'ViewContent', {
    content_name: 'Sloper King Biomechanical Trainer',
    content_category: 'Climbing Hardware',
    content_ids: ['sloper_king_single', 'sloper_king_pair'],
    content_type: 'product',
    value: 24.95,
    currency: 'EUR',
  });

  clarityEvent('view_sloperking_landing');
};

/**
 * Funnel Step 2: Bezoeker start de 15-minuten breakdown video
 */
export const trackSloperKingVideo = (source = 'hero_button') => {
  event('video_engagement', {
    event_category: 'video',
    event_label: 'Sloper King 15-Min Breakdown Docu',
    click_source: source,
  });

  fbq('trackCustom', 'WatchVideoDocu', {
    video_title: 'Sloper King 15-Min Biomechanics Breakdown',
    click_source: source,
  });

  clarityEvent('click_15min_video');
};

/**
 * Funnel Step 3: Bezoeker kiest tussen Single (€24.95) en Pair (€44.95)
 */
export const trackSloperKingSelect = (itemType: 'single' | 'pair', price: number) => {
  event('select_item', {
    item_list_name: 'Sloper King Selection',
    items: [
      {
        item_id: itemType === 'pair' ? 'sloper_king_pair' : 'sloper_king_single',
        item_name: itemType === 'pair' ? 'Sloper King™ Complete Pair' : 'Sloper King™ Single Unit',
        price,
        item_category: 'Climbing Hardware',
      },
    ],
  });

  clarityEvent(`select_${itemType}`);
};

/**
 * Funnel Step 4: Bezoeker klikt op "Proceed to Checkout" (Stripe initialisatie)
 */
export const trackSloperKingCheckout = (
  itemType: 'single' | 'pair',
  quantity: number,
  totalAmount: number,
  shippingZone: string
) => {
  event('begin_checkout', {
    currency: 'EUR',
    value: totalAmount,
    coupon: '',
    items: [
      {
        item_id: itemType === 'pair' ? 'sloper_king_pair' : 'sloper_king_single',
        item_name: itemType === 'pair' ? 'Sloper King™ Complete Pair' : 'Sloper King™ Single Unit',
        price: itemType === 'pair' ? 44.95 : 24.95,
        quantity,
      },
    ],
  });

  fbq('track', 'InitiateCheckout', {
    content_name: itemType === 'pair' ? 'Sloper King Complete Pair' : 'Sloper King Single Unit',
    content_category: 'Climbing Hardware',
    content_ids: [itemType === 'pair' ? 'sloper_king_pair' : 'sloper_king_single'],
    num_items: quantity,
    value: totalAmount,
    currency: 'EUR',
  });

  clarityEvent('initiate_stripe_checkout');
};

/**
 * Funnel Step 5: Bezoeker keert terug na succesvolle betaling
 */
export const trackSloperKingPurchase = (
  sessionId: string,
  itemType: string,
  amount: number,
  shippingZone = 'be'
) => {
  event('purchase', {
    transaction_id: sessionId,
    value: amount,
    currency: 'EUR',
    shipping: shippingZone === 'pickup' ? 0.0 : shippingZone === 'eu' ? 4.99 : 3.99,
    items: [
      {
        item_id: itemType === 'single' ? 'sloper_king_single' : 'sloper_king_pair',
        item_name: itemType === 'single' ? 'Sloper King™ Single Unit' : 'Sloper King™ Complete Pair',
        price: amount,
        quantity: 1,
      },
    ],
  });

  fbq('track', 'Purchase', {
    content_name: itemType === 'single' ? 'Sloper King Single Unit' : 'Sloper King Complete Pair',
    content_type: 'product',
    value: amount,
    currency: 'EUR',
  });

  clarityEvent('purchase_success');
};
