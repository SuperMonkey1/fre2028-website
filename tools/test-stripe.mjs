import fs from 'fs';
import path from 'path';

let STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^STRIPE_SECRET_KEY=(.+)$/m);
      if (match) STRIPE_SECRET_KEY = match[1].trim();
    }
  } catch (e) {}
}

if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY is not set in environment or .env.local');
  process.exit(1);
}

async function testStripe() {
  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', 'https://www.fre2028.la/payments?status=success&session_id={CHECKOUT_SESSION_ID}');
  params.append('cancel_url', 'https://www.fre2028.la/payments?status=cancelled');
  params.append('line_items[0][price_data][currency]', 'eur');
  params.append('line_items[0][price_data][unit_amount]', '120000');
  params.append('line_items[0][price_data][product_data][name]', 'De Leuven 25 Support Circle — Jaarlijks Partnerschap');
  params.append('line_items[0][quantity]', '1');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await res.json();
  console.log('Stripe Response Status:', res.status);
  console.log('Checkout URL:', data.url);
}

testStripe().catch(console.error);
