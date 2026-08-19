import type { NextApiRequest, NextApiResponse } from 'next';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      plan,
      customAmount,
      companyName,
      contactName,
      email,
      vatNumber,
      address,
      notes,
      originUrl,
      returnUrl,
    } = req.body;

    const baseOrigin = originUrl || (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer).origin : 'https://www.fre2028.la');
    const successUrl = returnUrl ? `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}stripe_status=success&session_id={CHECKOUT_SESSION_ID}` : `${baseOrigin}/payments?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = returnUrl ? `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}stripe_status=cancelled` : `${baseOrigin}/payments?status=cancelled`;

    const params = new URLSearchParams();
    params.append('success_url', successUrl);
    params.append('cancel_url', cancelUrl);
    if (email) {
      params.append('customer_email', email);
    }

    // Metadata for billing & sponsor administration
    params.append('metadata[companyName]', companyName || '');
    params.append('metadata[contactName]', contactName || '');
    params.append('metadata[email]', email || '');
    params.append('metadata[vatNumber]', vatNumber || '');
    params.append('metadata[address]', address || '');
    params.append('metadata[notes]', notes || '');
    params.append('metadata[plan]', plan || '');

    // Allow promotion codes and tax ID collection
    params.append('allow_promotion_codes', 'true');
    params.append('tax_id_collection[enabled]', 'true');
    params.append('billing_address_collection', 'required');

    if (plan === 'monthly') {
      // €100 / month recurring subscription
      params.append('mode', 'subscription');
      params.append('line_items[0][price]', process.env.STRIPE_PRICE_MONTHLY || 'price_1U6CAZRowpYHCRdUXDhDxPmd');
      params.append('line_items[0][quantity]', '1');
      params.append('payment_method_types[0]', 'card');
    } else if (plan === 'yearly') {
      // €1.200 / year
      params.append('mode', 'payment');
      params.append('invoice_creation[enabled]', 'true');
      params.append('line_items[0][price]', process.env.STRIPE_PRICE_YEARLY || 'price_1U6CAaRowpYHCRdU5WtN7rYM');
      params.append('line_items[0][quantity]', '1');
      params.append('payment_method_types[0]', 'card');
    } else if (plan === 'two_years') {
      // €2.400 / 2 year
      params.append('mode', 'payment');
      params.append('invoice_creation[enabled]', 'true');
      params.append('line_items[0][price]', process.env.STRIPE_PRICE_TWO_YEARS || 'price_1U6CAbRowpYHCRdUCIqQhDHl');
      params.append('line_items[0][quantity]', '1');
      params.append('payment_method_types[0]', 'card');
    } else if (plan === 'custom') {
      const amountInCents = Math.round(Number(customAmount) * 100);
      if (!amountInCents || amountInCents < 500) {
        return res.status(400).json({ error: 'Minimaal sponsorbedrag is € 5,-' });
      }
      params.append('mode', 'payment');
      params.append('invoice_creation[enabled]', 'true');
      params.append('line_items[0][price_data][currency]', 'eur');
      params.append('line_items[0][price_data][unit_amount]', amountInCents.toString());
      params.append('line_items[0][price_data][product_data][name]', 'Sponsoring Road to LA 2028 — Aangepast Bedrag');
      params.append(
        'line_items[0][price_data][product_data][description]',
        `Sponsorbijdrage van € ${(amountInCents / 100).toLocaleString('nl-BE')}`
      );
      params.append('line_items[0][quantity]', '1');
      params.append('payment_method_types[0]', 'card');
    } else if (plan === 'test_1euro' || plan === 'test_monthly') {
      // €1 / month recurring test subscription
      params.append('mode', 'subscription');
      if (process.env.STRIPE_PRICE_TEST_1EURO) {
        params.append('line_items[0][price]', process.env.STRIPE_PRICE_TEST_1EURO);
      } else {
        params.append('line_items[0][price_data][currency]', 'eur');
        params.append('line_items[0][price_data][unit_amount]', '100');
        params.append('line_items[0][price_data][recurring][interval]', 'month');
        params.append('line_items[0][price_data][product_data][name]', 'Test Partner Sponsoring (€1 / maand)');
        params.append('line_items[0][price_data][product_data][description]', 'Stripe Test Maandelijkse Partnerbijdrage van 1 euro per maand');
      }
      params.append('line_items[0][quantity]', '1');
      params.append('payment_method_types[0]', 'card');
    } else {
      return res.status(400).json({ error: 'Ongeldig partnerplan geselecteerd' });
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok || session.error) {
      console.error('Stripe Error:', session.error);
      return res.status(stripeResponse.status || 500).json({
        error: session.error?.message || 'Fout bij het aanmaken van de betaalsessie',
      });
    }

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('API Error in Stripe Checkout Session:', error);
    return res.status(500).json({ error: error.message || 'Interne serverfout' });
  }
}
