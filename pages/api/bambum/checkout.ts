import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16' as any,
    })
  : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      itemType = 'pair', // 'pair' | 'single'
      quantity = 1,
      shippingZone = 'be', // 'pickup' | 'be' | 'eu'
      couponCode = '',
      email = '',
      customerName = '',
      originUrl,
    } = req.body;

    // Determine unit price and shipping cost
    let basePricePerUnit = itemType === 'single' ? 2495 : 4495; // in eurocents (€24.95 or €44.95)
    let productName = itemType === 'single' ? 'Sloper King™ (Single Unit)' : 'Sloper King™ (Set of 2 - Pair)';
    let productDescription = itemType === 'single'
      ? '1x Sloper King™ unit with Petzl 800kg cord & 220-grit contact strip'
      : 'Complete set of 2x Sloper King™ units, 2x Petzl 800kg load cords, 1x stamped cotton pouch & guide card';

    // Apply promo coupons if valid
    const cleanCoupon = (couponCode || '').trim().toUpperCase();
    let discountCents = 0;
    if (cleanCoupon === 'FOUNDER25' || cleanCoupon === 'LAUNCH25') {
      // 25% discount
      discountCents = Math.round(basePricePerUnit * 0.25);
    } else if (cleanCoupon === 'FRIENDS29' && itemType === 'pair') {
      // €10 discount to reach €29.00
      discountCents = 1000;
    }

    const finalUnitPrice = Math.max(500, basePricePerUnit - discountCents);

    // Shipping cost
    let shippingCents = 399; // Default BE = €3.99
    let shippingName = 'Shipping Belgium (bpost track & trace)';
    if (shippingZone === 'pickup') {
      shippingCents = 0;
      shippingName = 'Local Pickup in Leuven (Free)';
    } else if (shippingZone === 'eu') {
      shippingCents = 499;
      shippingName = 'Tracked Shipping European Union';
    }

    const baseOrigin = originUrl || (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer).origin : 'https://www.fre2028.la');
    const successUrl = `${baseOrigin}/bambum?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseOrigin}/bambum?status=cancelled`;

    if (!stripe) {
      // Stripe not configured in env, return simulation URL
      return res.status(200).json({
        url: `${baseOrigin}/bambum?status=demo_success&type=${itemType}&shipping=${shippingZone}&amount=${(finalUnitPrice * quantity + shippingCents) / 100}`,
        mode: 'mock',
        totalPrice: (finalUnitPrice * quantity + shippingCents) / 100,
      });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            description: productDescription,
            images: ['https://www.fre2028.la/images/sloperking-label.svg'],
          },
          unit_amount: finalUnitPrice,
        },
        quantity: Math.max(1, parseInt(quantity as any, 10) || 1),
      },
    ];

    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: shippingName,
            description: 'Verzend- en verpakkingskosten',
          },
          unit_amount: shippingCents,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'bancontact', 'ideal'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: shippingZone === 'pickup' ? 'auto' : 'required',
      shipping_address_collection: shippingZone === 'pickup' ? undefined : {
        allowed_countries: ['BE', 'NL', 'FR', 'DE', 'LU', 'AT', 'CH', 'IT', 'ES', 'GB'],
      },
      metadata: {
        itemType,
        quantity: String(quantity),
        shippingZone,
        couponCode: cleanCoupon,
        customerName: customerName || '',
        product: 'Sloper King',
        brand: 'BamBum Innovation',
      },
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (error: any) {
    console.error('Stripe Checkout Error for Sloper King:', error);
    return res.status(500).json({ error: error.message || 'Kon checkout sessie niet aanmaken' });
  }
}
