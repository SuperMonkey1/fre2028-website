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

async function stripePost(endpoint, data) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    params.append(key, value);
  }

  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe API error on ${endpoint}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function createProducts() {
  console.log('--- Creating Products in Stripe ---');

  // 1. Monthly Product & Price
  const monthlyProduct = await stripePost('products', {
    'name': 'De Leuven 25 Support Circle — Maandelijks',
    'description': 'Maandelijkse sponsorbijdrage Road to LA 2028 (€ 100/maand, doorlopend en opzegbaar).',
    'metadata[plan]': 'monthly',
    'metadata[tier]': 'Leuven 25 Support Circle',
  });
  console.log('Created Monthly Product:', monthlyProduct.id);

  const monthlyPrice = await stripePost('prices', {
    'product': monthlyProduct.id,
    'unit_amount': '10000', // €100.00
    'currency': 'eur',
    'recurring[interval]': 'month',
    'metadata[plan]': 'monthly',
  });
  console.log('Created Monthly Price:', monthlyPrice.id);

  // 2. Yearly Product & Price
  const yearlyProduct = await stripePost('products', {
    'name': 'De Leuven 25 Support Circle — 1 Jaar',
    'description': 'Volledig jaarlidmaatschap van De Leuven 25 Support Circle (€ 1.200/jaar).',
    'metadata[plan]': 'yearly',
    'metadata[tier]': 'Leuven 25 Support Circle',
  });
  console.log('Created Yearly Product:', yearlyProduct.id);

  const yearlyPrice = await stripePost('prices', {
    'product': yearlyProduct.id,
    'unit_amount': '120000', // €1,200.00
    'currency': 'eur',
    'metadata[plan]': 'yearly',
  });
  console.log('Created Yearly Price:', yearlyPrice.id);

  // 3. Two-Year Product & Price
  const twoYearsProduct = await stripePost('products', {
    'name': 'De Leuven 25 Support Circle — 2 Jaar (Tot LA 2028)',
    'description': 'Tweejarig sponsorschap tot de Paralympische Spelen in Los Angeles 2028 (€ 2.400 eenmalig).',
    'metadata[plan]': 'two_years',
    'metadata[tier]': 'Leuven 25 Support Circle',
  });
  console.log('Created Two-Years Product:', twoYearsProduct.id);

  const twoYearsPrice = await stripePost('prices', {
    'product': twoYearsProduct.id,
    'unit_amount': '240000', // €2,400.00
    'currency': 'eur',
    'metadata[plan]': 'two_years',
  });
  console.log('Created Two-Years Price:', twoYearsPrice.id);

  // 4. Test 1 Euro / Month Product & Price
  const testOneEuroProduct = await stripePost('products', {
    'name': 'Test Sponsoring — €1 per Maand',
    'description': 'Test maandelijks partnerschap (€ 1,00/maand, doorlopend).',
    'metadata[plan]': 'test_1euro',
  });
  console.log('Created Test 1 Euro Product:', testOneEuroProduct.id);

  const testOneEuroPrice = await stripePost('prices', {
    'product': testOneEuroProduct.id,
    'unit_amount': '100', // €1.00
    'currency': 'eur',
    'recurring[interval]': 'month',
    'metadata[plan]': 'test_1euro',
  });
  console.log('Created Test 1 Euro Price:', testOneEuroPrice.id);

  console.log('\n=== SUMMARY OF CREATED STRIPE PRICES ===');
  console.log('STRIPE_PRICE_MONTHLY=' + monthlyPrice.id);
  console.log('STRIPE_PRICE_YEARLY=' + yearlyPrice.id);
  console.log('STRIPE_PRICE_TWO_YEARS=' + twoYearsPrice.id);
  console.log('STRIPE_PRICE_TEST_1EURO=' + testOneEuroPrice.id);

  return {
    monthlyPriceId: monthlyPrice.id,
    yearlyPriceId: yearlyPrice.id,
    twoYearsPriceId: twoYearsPrice.id,
    testOneEuroPriceId: testOneEuroPrice.id,
  };
}

createProducts().catch(console.error);
