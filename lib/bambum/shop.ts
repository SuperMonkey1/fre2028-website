// Orders run through the `payments` Cloud Function (the static site has no API routes in production)
export const PAYMENTS_API = 'https://us-central1-fre-2028-website.cloudfunctions.net/payments';

export type ShopProductSlug = 'sloper-king' | 'tailr-edge';

export const SHOP_PRODUCTS: {
  slug: ShopProductSlug;
  name: string;
  href: string;
  eyebrow: string;
  headline: string;
  blurb: string;
  price: string;
  points: string[];
  cta: string;
}[] = [
  {
    slug: 'sloper-king',
    name: 'Sloper King™',
    href: '/shop/sloper-king',
    eyebrow: 'Pump trainer',
    headline: 'Train the strength that hangboards forget.',
    blurb:
      'An ultra-lightweight (<100g), biomechanically engineered sloper with 5 cantilever angles. Train the 4 forearm and wrist muscles that a hangboard skips.',
    price: 'From €24.95',
    points: ['Single unit or complete pair', '800kg load cord, 5 difficulty angles', 'Made in Belgium'],
    cta: 'View Sloper King™',
  },
  {
    slug: 'tailr-edge',
    name: 'Tailr Edge',
    href: '/shop/tailr-edge',
    eyebrow: 'Made-to-measure crimp edge',
    headline: 'Every finger, its share.',
    blurb:
      'Made to your fingers, kind to your pulleys. Enter your finger lengths, see the result in 3D and get an edge that loads all four fingers evenly.',
    price: '€49 per set',
    points: ['3D-printed from your finger lengths', 'Open drag position, minimal load on A2', 'Free STL & STEP files to print yourself'],
    cta: 'Design your Tailr Edge',
  },
];
