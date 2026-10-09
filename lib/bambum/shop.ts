// Orders run through the `payments` Cloud Function (the static site has no API routes in production)
export const PAYMENTS_API = 'https://us-central1-fre-2028-website.cloudfunctions.net/payments';

export type ShopProductSlug = 'sloper-king' | 'fingerprint';

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
    href: '/bambum/sloper-king',
    eyebrow: 'Pump trainer',
    headline: 'Train the strength that hangboards forget.',
    blurb:
      'An ultra-lightweight (<100g), biomechanically engineered sloper with 5 cantilever angles. Train the 4 forearm and wrist muscles that a hangboard skips.',
    price: 'From €24.95',
    points: ['Single unit or complete pair', '800kg load cord, 5 difficulty angles', 'Made in Belgium'],
    cta: 'View Sloper King™',
  },
  {
    slug: 'fingerprint',
    name: 'FingerPrint',
    href: '/bambum/fingerprint',
    eyebrow: 'Custom crimp edge',
    headline: 'One edge per finger, shaped to your hand.',
    blurb:
      'Your fingers are not the same length, so why train on a straight edge? Enter your measurements, see the result in 3D and get a set made for your hand.',
    price: '€49 per set',
    points: ['Designed in your browser', 'Free STL & STEP files to print yourself', 'Or order a set made for you'],
    cta: 'Design your FingerPrint',
  },
];
