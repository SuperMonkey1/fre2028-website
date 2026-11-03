import { PAYMENTS_API } from '@/lib/bambum/shop';

// Sloper King shipping rates live in Firestore and are edited on /admin/shipping.
// A country without a rate can't order yet (the presale page offers a waitlist instead).
export const SHIPPING_RATES_API = `${PAYMENTS_API}/sloperking/shipping-rates`;

/** Countries the admin can choose from (all accepted by Stripe), and that the waitlist offers. */
export const KNOWN_COUNTRIES = [
  // EU
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT',
  'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // Rest of Europe
  'GB', 'CH', 'NO', 'IS', 'LI', 'MC', 'AD',
  // Rest of the world
  'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'AU', 'NZ', 'JP', 'KR', 'SG', 'HK', 'TW', 'IL', 'AE', 'ZA', 'IN', 'TH',
];

export type ShippingRates = Record<string, number>;

/** Rates in euros per country code. */
export const fetchShippingRates = async (): Promise<ShippingRates> => {
  const res = await fetch(SHIPPING_RATES_API);
  const data = await res.json();
  if (!res.ok || !data.rates) throw new Error(data.error || 'Could not load shipping rates.');
  return data.rates;
};

export const countryNamer = () => {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {}
  return (code: string) => names?.of(code) || code;
};

/** Short summary for product pages, e.g. "€4.99 Belgium · €8.35–€26.82 elsewhere". */
export const shippingSummary = (rates: ShippingRates) => {
  const values = Object.values(rates);
  if (values.length === 0) return 'Shipping not available yet';
  const be = rates.BE;
  const others = Object.entries(rates).filter(([c]) => c !== 'BE').map(([, v]) => v);
  const eur = (v: number) => `€${v.toFixed(2)}`;
  if (be !== undefined && others.length > 0) {
    const min = Math.min(...others);
    const max = Math.max(...others);
    return `${eur(be)} Belgium · ${min === max ? eur(min) : `${eur(min)}–${eur(max)}`} elsewhere`;
  }
  return `From ${eur(Math.min(...values))}`;
};
