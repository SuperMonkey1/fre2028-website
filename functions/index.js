const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {getWelcomeEmailTemplate, EMAIL_SUBJECTS} = require("./welcome_email_content");

// Initialize Firebase Admin
initializeApp();

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// Email configuration
const createTransporter = () => {
  // Configure with your email service
  // For Gmail, you'll need to use App Passwords
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Send confirmation email
const sendConfirmationEmail = async (email) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: EMAIL_SUBJECTS.WELCOME,
    html: getWelcomeEmailTemplate({ email })
  };

  await transporter.sendMail(mailOptions);
};

// Send notification email to yourself
const sendAdminNotificationEmail = async (subscriberEmail) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: 'frederik.leys@gmail.com',
    subject: 'Nieuwe inschrijving nieuwsbrief FRE2028',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Nieuwe Nieuwsbrief Inschrijving</h2>
        <p style="color: #333; font-size: 16px;">
          Er is een nieuwe abonnee voor je nieuwsbrief:
        </p>
        <p style="color: #0056b3; font-size: 18px; font-weight: bold;">
          ${subscriberEmail}
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Ingeschreven op: ${new Date().toLocaleString('nl-BE', { 
            dateStyle: 'full', 
            timeStyle: 'short',
            timeZone: 'Europe/Brussels'
          })}
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Subscribe to newsletter endpoint
app.post("/subscribe", async (req, res) => {
  try {
    const {email} = req.body;
    
    console.log(`Newsletter subscription attempt for: ${email}`);

    if (!email) {
      res.status(400).json({error: "Email is verplicht"});
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({error: "Ongeldig email formaat"});
      return;
    }

    // Check if email already exists
    const db = getFirestore();
    const subscribersRef = db.collection("subscribers");
    const existingSubscriber = await subscribersRef.where("email", "==", email).get();

    if (!existingSubscriber.empty) {
      res.status(400).json({error: "Dit email adres is al ingeschreven"});
      return;
    }

    // Add subscriber to Firestore
    await subscribersRef.add({
      email: email,
      subscribedAt: new Date(),
      status: "active",
    });

    // Send confirmation email
    try {
      await sendConfirmationEmail(email);
      console.log(`Confirmation email sent to: ${email}`);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the subscription if email fails
    }

    // Send notification email to admin
    try {
      await sendAdminNotificationEmail(email);
      console.log(`Admin notification email sent for subscriber: ${email}`);
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError);
      // Don't fail the subscription if notification email fails
    }

    console.log(`New subscriber: ${email}`);

    res.status(200).json({
      message: "Succesvol ingeschreven voor de nieuwsbrief",
      email: email,
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({error: "Interne server fout"});
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({status: "OK", timestamp: new Date().toISOString()});
});

// Export the function
exports.newsletter = onRequest(app);

// Create contact form app
const contactApp = express();
contactApp.use(cors({origin: true}));
contactApp.use(express.json());

// Send contact form email
const sendContactFormEmail = async (name, email, inquiryType, message) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: 'frederik.leys@gmail.com',
    replyTo: email,
    subject: `Nieuw contact formulier bericht - ${inquiryType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; border-bottom: 3px solid #dc2626; padding-bottom: 10px; margin-bottom: 20px;">
            Nieuw Contact Formulier Bericht
          </h2>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #666; font-size: 14px; text-transform: uppercase; margin-bottom: 5px;">Type vraag:</h3>
            <p style="color: #333; font-size: 16px; margin: 0; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #dc2626;">
              ${inquiryType}
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #666; font-size: 14px; text-transform: uppercase; margin-bottom: 5px;">Van:</h3>
            <p style="color: #333; font-size: 16px; margin: 0;">
              <strong>${name}</strong><br/>
              <a href="mailto:${email}" style="color: #dc2626; text-decoration: none;">${email}</a>
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #666; font-size: 14px; text-transform: uppercase; margin-bottom: 5px;">Bericht:</h3>
            <div style="color: #333; font-size: 16px; line-height: 1.6; padding: 15px; background-color: #f9f9f9; border-radius: 4px; white-space: pre-wrap;">
              ${message}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 12px;">
            <p style="margin: 0;">
              Ontvangen op: ${new Date().toLocaleString('nl-BE', { 
                dateStyle: 'full', 
                timeStyle: 'short',
                timeZone: 'Europe/Brussels'
              })}
            </p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Contact form endpoint
contactApp.post("/send", async (req, res) => {
  try {
    const {name, email, inquiryType, message} = req.body;
    
    console.log(`Contact form submission from: ${name} (${email})`);

    if (!name || !email || !inquiryType || !message) {
      res.status(400).json({error: "Alle velden zijn verplicht"});
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({error: "Ongeldig email formaat"});
      return;
    }

    // Send email to frederik.leys@gmail.com
    try {
      await sendContactFormEmail(name, email, inquiryType, message);
      console.log(`Contact form email sent from: ${name} (${email})`);
    } catch (emailError) {
      console.error("Error sending contact form email:", emailError);
      res.status(500).json({error: "Fout bij het versturen van het bericht"});
      return;
    }

    // Optionally save to Firestore for records
    try {
      const db = getFirestore();
      await db.collection("contact_messages").add({
        name,
        email,
        inquiryType,
        message,
        submittedAt: new Date(),
        status: "received",
      });
    } catch (dbError) {
      console.error("Error saving to Firestore:", dbError);
      // Don't fail if database save fails, email was sent
    }

    res.status(200).json({
      message: "Bericht succesvol verstuurd",
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    res.status(500).json({error: "Interne server fout"});
  }
});

// Health check endpoint
contactApp.get("/health", (req, res) => {
  res.status(200).json({status: "OK", timestamp: new Date().toISOString()});
});

// Export the contact function
exports.contact = onRequest(contactApp);

// ==================== STRIPE PAYMENTS FUNCTION ====================
const paymentApp = express();
paymentApp.use(cors({origin: true}));
paymentApp.use(express.json());

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

paymentApp.post("/create-checkout-session", async (req, res) => {
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

    const baseOrigin = originUrl || req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : "https://www.fre2028.la");
    const successUrl = returnUrl ? `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}stripe_status=success&session_id={CHECKOUT_SESSION_ID}` : `${baseOrigin}/payments?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = returnUrl ? `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}stripe_status=cancelled` : `${baseOrigin}/payments?status=cancelled`;

    const params = new URLSearchParams();
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    if (email) {
      params.append("customer_email", email);
    }

    // Metadata
    params.append("metadata[companyName]", companyName || "");
    params.append("metadata[contactName]", contactName || "");
    params.append("metadata[email]", email || "");
    params.append("metadata[vatNumber]", vatNumber || "");
    params.append("metadata[address]", address || "");
    params.append("metadata[notes]", notes || "");
    params.append("metadata[plan]", plan || "");

    params.append("allow_promotion_codes", "true");
    params.append("tax_id_collection[enabled]", "true");
    params.append("billing_address_collection", "required");

    if (plan === "monthly") {
      params.append("mode", "subscription");
      params.append("line_items[0][price]", process.env.STRIPE_PRICE_MONTHLY || "price_1U6CAZRowpYHCRdUXDhDxPmd");
      params.append("line_items[0][quantity]", "1");
      params.append("payment_method_types[0]", "card");
    } else if (plan === "yearly") {
      params.append("mode", "payment");
      params.append("invoice_creation[enabled]", "true");
      params.append("line_items[0][price]", process.env.STRIPE_PRICE_YEARLY || "price_1U6CAaRowpYHCRdU5WtN7rYM");
      params.append("line_items[0][quantity]", "1");
      params.append("payment_method_types[0]", "card");
    } else if (plan === "two_years") {
      params.append("mode", "payment");
      params.append("invoice_creation[enabled]", "true");
      params.append("line_items[0][price]", process.env.STRIPE_PRICE_TWO_YEARS || "price_1U6CAbRowpYHCRdUCIqQhDHl");
      params.append("line_items[0][quantity]", "1");
      params.append("payment_method_types[0]", "card");
    } else if (plan === "custom") {
      const amountInCents = Math.round(Number(customAmount) * 100);
      if (!amountInCents || amountInCents < 500) {
        res.status(400).json({error: "Minimaal sponsorbedrag is € 5,-"});
        return;
      }
      params.append("mode", "payment");
      params.append("invoice_creation[enabled]", "true");
      params.append("line_items[0][price_data][currency]", "eur");
      params.append("line_items[0][price_data][unit_amount]", amountInCents.toString());
      params.append("line_items[0][price_data][product_data][name]", "Sponsoring Road to LA 2028 — Aangepast Bedrag");
      params.append("line_items[0][quantity]", "1");
      params.append("payment_method_types[0]", "card");
    } else if (plan === "test_1euro" || plan === "test_monthly") {
      params.append("mode", "subscription");
      if (process.env.STRIPE_PRICE_TEST_1EURO) {
        params.append("line_items[0][price]", process.env.STRIPE_PRICE_TEST_1EURO);
      } else {
        params.append("line_items[0][price_data][currency]", "eur");
        params.append("line_items[0][price_data][unit_amount]", "100");
        params.append("line_items[0][price_data][recurring][interval]", "month");
        params.append("line_items[0][price_data][product_data][name]", "Test Partner Sponsoring (€1 / maand)");
        params.append("line_items[0][price_data][product_data][description]", "Stripe Test Maandelijkse Partnerbijdrage van 1 euro per maand");
      }
      params.append("line_items[0][quantity]", "1");
      params.append("payment_method_types[0]", "card");
    } else {
      res.status(400).json({error: "Ongeldig partnerplan geselecteerd"});
      return;
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok || session.error) {
      console.error("Stripe Error in Cloud Function:", session.error);
      res.status(stripeResponse.status || 500).json({
        error: session.error?.message || "Fout bij het aanmaken van de betaalsessie",
      });
      return;
    }

    // Save intent in Firestore for admin lead tracker
    try {
      const db = getFirestore();
      await db.collection("sponsor_checkout_intents").add({
        sessionId: session.id,
        plan,
        companyName: companyName || "",
        contactName: contactName || "",
        email: email || "",
        vatNumber: vatNumber || "",
        address: address || "",
        createdAt: new Date(),
        status: "created",
      });
    } catch (dbErr) {
      console.error("Error saving checkout intent:", dbErr);
    }

    res.status(200).json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error in payments endpoint:", error);
    res.status(500).json({error: "Interne serverfout"});
  }
});

// ==================== FINGERPRINT ORDERS ====================
// A FingerPrint set (left + right hand) is made to the customer's own finger
// measurements. The design is stored in Firestore (fingerprint_orders) and on the
// Stripe session/payment metadata, so every payment can be traced back to its design.

// FINGERPRINT_STRIPE_MODE=live switches orders to the live Stripe account; anything else uses the
// Stripe sandbox (STRIPE_SECRET_KEY_TEST / STRIPE_PRICE_FINGERPRINT_SET_TEST), so no one is charged while testing.
const FINGERPRINT_LIVE = process.env.FINGERPRINT_STRIPE_MODE === "live";
const FINGERPRINT_STRIPE_KEY = FINGERPRINT_LIVE ? STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY_TEST;
const FINGERPRINT_PRICE_ID = FINGERPRINT_LIVE ?
  (process.env.STRIPE_PRICE_FINGERPRINT_SET || "price_1UNIvDRowpYHCRdUewkEcHNc") :
  process.env.STRIPE_PRICE_FINGERPRINT_SET_TEST;
const FINGERPRINT_PUBLISHABLE_KEY = FINGERPRINT_LIVE ?
  process.env.STRIPE_PUBLISHABLE_KEY :
  process.env.STRIPE_PUBLISHABLE_KEY_TEST;
// Shipping is calculated from the address the customer enters in the embedded Stripe form
// (/fingerprint/shipping). The rates live in the Stripe dashboard (Product catalog > Shipping rates);
// amount/label are only a fallback if no rate id is set.
const FINGERPRINT_SHIPPING = {
  be: {
    rateId: FINGERPRINT_LIVE ? process.env.STRIPE_SHIPPING_RATE_BE : process.env.STRIPE_SHIPPING_RATE_BE_TEST,
    amount: 299,
    label: "Belgium",
    countries: ["BE"],
  },
  eu: {
    rateId: FINGERPRINT_LIVE ? process.env.STRIPE_SHIPPING_RATE_EU : process.env.STRIPE_SHIPPING_RATE_EU_TEST,
    amount: 499,
    label: "Europe (EU)",
    countries: [
      "AT", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
      "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
    ],
  },
};
const FINGERPRINT_SHIP_COUNTRIES = Object.values(FINGERPRINT_SHIPPING).flatMap((z) => z.countries);
const shippingZoneFor = (country) =>
  Object.keys(FINGERPRINT_SHIPPING).find((z) => FINGERPRINT_SHIPPING[z].countries.includes(String(country || "").toUpperCase()));

/** Adds shipping_options[0] for a zone (dashboard rate if configured, else an inline rate). */
const appendShippingOption = (params, zone) => {
  const shipping = FINGERPRINT_SHIPPING[zone];
  if (shipping.rateId) {
    params.append("shipping_options[0][shipping_rate]", shipping.rateId);
  } else {
    params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    params.append("shipping_options[0][shipping_rate_data][display_name]", shipping.label);
    params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(shipping.amount));
    params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
  }
};

const ADMIN_EMAIL = "frederik.leys@gmail.com";

// Promo codes that make a Tailr Edge order completely free. The customer types them in Stripe's own promo code field:
// they are Stripe promotion codes on a 100% coupon that only applies to the Tailr Edge product (so not to Sloper King),
// created by this function when missing. Stripe never discounts shipping, so the shipping update sets it to €0 too.
const FINGERPRINT_FREE_CODES = ["FRITS"];
const FINGERPRINT_FREE_COUPON_ID = "tailr-edge-free";
const isFreeCode = (code) => FINGERPRINT_FREE_CODES.includes(String(code || "").trim().toUpperCase());

let freePromotionReady = null;
/** Makes sure the free coupon and its promotion codes exist in the Stripe account (once per function instance). */
const ensureFreePromotion = () => {
  if (!freePromotionReady) {
    freePromotionReady = (async () => {
      try {
        await stripeRequest(`coupons/${FINGERPRINT_FREE_COUPON_ID}`);
      } catch (error) {
        if (error.status !== 404) throw error;
        const price = await stripeRequest(`prices/${FINGERPRINT_PRICE_ID}`);
        const params = new URLSearchParams();
        params.append("id", FINGERPRINT_FREE_COUPON_ID);
        params.append("percent_off", "100");
        params.append("duration", "once");
        params.append("name", "Free Tailr Edge");
        params.append("applies_to[products][0]", typeof price.product === "string" ? price.product : price.product.id);
        await stripeRequest("coupons", {method: "POST", params});
      }
      for (const code of FINGERPRINT_FREE_CODES) {
        const list = await stripeRequest(`promotion_codes?code=${encodeURIComponent(code)}&active=true&limit=1`);
        if (list.data?.length) continue;
        const params = new URLSearchParams();
        params.append("code", code);
        params.append("coupon", FINGERPRINT_FREE_COUPON_ID);
        try {
          await stripeRequest("promotion_codes", {method: "POST", params});
        } catch (error) {
          // Newer Stripe API versions name the coupon under "promotion"
          const alt = new URLSearchParams();
          alt.append("code", code);
          alt.append("promotion[type]", "coupon");
          alt.append("promotion[coupon]", FINGERPRINT_FREE_COUPON_ID);
          await stripeRequest("promotion_codes", {method: "POST", params: alt});
        }
      }
    })().catch((error) => {
      freePromotionReady = null;
      throw error;
    });
  }
  return freePromotionReady;
};

/** The free promo code applied to a checkout session (retrieved with expand[]=discounts.promotion_code), or "". */
const freeCodeOf = (session) =>
  (session.discounts || []).map((d) => d.promotion_code?.code).find((code) => isFreeCode(code)) || "";

const toNumber = (v, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 1000) / 1000 : null;
};

/** Validates one hand: offsets (mm longer than pinky) and edge widths (mm). Returns null when invalid. */
const parseHand = (hand) => {
  if (!hand || typeof hand !== "object") return null;
  const offset = {
    ring: toNumber(hand.offset?.ring, -5, 60),
    middle: toNumber(hand.offset?.middle, -5, 60),
    index: toNumber(hand.offset?.index, -5, 60),
  };
  const width = {
    pinky: toNumber(hand.width?.pinky, 12, 30),
    ring: toNumber(hand.width?.ring, 12, 30),
    middle: toNumber(hand.width?.middle, 12, 30),
    index: toNumber(hand.width?.index, 12, 30),
  };
  if ([...Object.values(offset), ...Object.values(width)].some((v) => v === null)) return null;
  return {offset, width};
};

// Same format the /shop/tailr-edge page reads to reload a design: ring,middle,index,pinkyW,ringW,middleW,indexW
const handParam = (h) => [h.offset.ring, h.offset.middle, h.offset.index, h.width.pinky, h.width.ring, h.width.middle, h.width.index].join(",");
const handSummary = (h) =>
  `Length ring ${h.offset.ring} / middle ${h.offset.middle} / index ${h.offset.index} mm; ` +
  `width pinky ${h.width.pinky} / ring ${h.width.ring} / middle ${h.width.middle} / index ${h.width.index} mm`;

const stripeRequest = async (path, {method = "GET", params, key = FINGERPRINT_STRIPE_KEY} = {}) => {
  if (!key) throw new Error("Stripe key for FingerPrint orders is not configured");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params ? params.toString() : undefined,
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    const err = new Error(data.error?.message || "Stripe request failed");
    err.status = response.status;
    throw err;
  }
  return data;
};

paymentApp.post("/fingerprint/checkout", async (req, res) => {
  try {
    const {design, email, originUrl, heightCm, gender, measurementId, returnPath} = req.body || {};
    // The friends test page (/tailr-edge/friends) sends buyers back to itself; anything else returns to the shop page
    const friends = returnPath === "/tailr-edge/friends";
    if (!FINGERPRINT_PUBLISHABLE_KEY) throw new Error("Stripe publishable key for FingerPrint orders is not configured");
    const left = parseHand(design?.left);
    const right = parseHand(design?.right);
    if (!left || !right) {
      res.status(400).json({error: "Invalid FingerPrint design. Check your finger lengths and widths."});
      return;
    }
    // Body height and gender from the photo measure page (optional for designs entered by hand)
    const height = toNumber(heightCm, 100, 250);
    const sex = ["male", "female"].includes(gender) ? gender : "";
    // The free promo codes must exist before the customer types one; a failure here mustn't block the order
    await ensureFreePromotion().catch((error) => console.error("Could not set up the free Tailr Edge promo code:", error));

    const origin = originUrl || req.headers.origin || "https://fre2028.la";
    const db = getFirestore();
    const orderRef = db.collection("fingerprint_orders").doc();
    const orderId = orderRef.id;
    const designUrl = `https://fre2028.la/shop/tailr-edge?left=${handParam(left)}&right=${handParam(right)}`;

    await orderRef.set({
      orderId,
      status: "checkout_created",
      livemode: FINGERPRINT_LIVE,
      design: {left, right, sameForBothHands: !!design?.locked},
      designUrl,
      email: email || "",
      priceId: FINGERPRINT_PRICE_ID,
      heightCm: height,
      gender: sex,
      measurementId: isMeasurementId(measurementId) ? measurementId : "",
      source: friends ? "friends" : "shop",
      createdAt: new Date(),
    });

    const metadata = {
      product: "fingerprint",
      orderId,
      source: friends ? "friends" : "shop",
      left: handSummary(left),
      right: handSummary(right),
      designUrl,
    };
    if (height) metadata.heightCm = String(Math.round(height));
    if (sex) metadata.gender = sex;

    const params = new URLSearchParams();
    // Embedded Stripe form on our page; shipping is set from the address the customer enters.
    params.append("mode", "payment");
    params.append("ui_mode", "form");
    params.append("line_items[0][price]", FINGERPRINT_PRICE_ID);
    params.append("line_items[0][quantity]", "1");
    params.append("customer_creation", "always");
    params.append("client_reference_id", orderId);
    params.append("return_url", `${origin}${friends ? "/tailr-edge/friends" : "/shop/tailr-edge"}?order=success&session_id={CHECKOUT_SESSION_ID}`);
    params.append("billing_address_collection", "required");
    // Same per-country shipping prices as Sloper King (edited on /admin/shipping)
    const rates = await getSloperKingRates();
    const shipCountries = Object.keys(rates);
    if (shipCountries.length === 0) {
      res.status(400).json({error: "Shipping is not available at the moment."});
      return;
    }
    shipCountries.forEach((c, i) => params.append(`shipping_address_collection[allowed_countries][${i}]`, c));
    // Start at the highest rate until the address is known, so a payment can never be under-charged.
    // Neutral name, because the customer's country isn't known yet.
    params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    params.append("shipping_options[0][shipping_rate_data][display_name]", "Shipping");
    params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(Math.max(...Object.values(rates))));
    params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
    params.append("allow_promotion_codes", "true");
    if (email) params.append("customer_email", email);
    for (const [key, value] of Object.entries(metadata)) {
      params.append(`metadata[${key}]`, value);
      params.append(`payment_intent_data[metadata][${key}]`, value);
    }
    params.append("payment_intent_data[description]", `Tailr Edge set - order ${orderId}`);

    const session = await stripeRequest("checkout/sessions", {method: "POST", params});
    await orderRef.update({sessionId: session.id});

    res.status(200).json({
      clientSecret: session.client_secret,
      publishableKey: FINGERPRINT_PUBLISHABLE_KEY,
      orderId,
      livemode: FINGERPRINT_LIVE,
    });
  } catch (error) {
    console.error("Error creating FingerPrint checkout:", error);
    res.status(error.status && error.status < 500 ? error.status : 500).json({error: "Could not start the checkout. Please try again."});
  }
});

// Voluntary "pay what you want" contribution for the free STL/STEP files. The price lets the
// customer choose the amount on Stripe's hosted page; the downloads stay free either way.
const FINGERPRINT_CONTRIBUTION_PRICE_ID = FINGERPRINT_LIVE ?
  process.env.STRIPE_PRICE_FINGERPRINT_CONTRIBUTION :
  process.env.STRIPE_PRICE_FINGERPRINT_CONTRIBUTION_TEST;

paymentApp.post("/fingerprint/contribution", async (req, res) => {
  try {
    if (!FINGERPRINT_CONTRIBUTION_PRICE_ID) throw new Error("Contribution price is not configured");
    const origin = req.body?.originUrl || req.headers.origin || "https://fre2028.la";
    // Bring the visitor back to the design they were looking at
    const left = parseHand(req.body?.design?.left);
    const right = parseHand(req.body?.design?.right);
    const designQuery = left && right ? `&left=${handParam(left)}&right=${handParam(right)}` : "";

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("submit_type", "donate");
    params.append("line_items[0][price]", FINGERPRINT_CONTRIBUTION_PRICE_ID);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${origin}/shop/tailr-edge?contribution=thanks${designQuery}`);
    params.append("cancel_url", `${origin}/shop/tailr-edge?contribution=cancelled${designQuery}`);
    params.append("metadata[product]", "fingerprint_contribution");
    params.append("payment_intent_data[metadata][product]", "fingerprint_contribution");
    params.append("payment_intent_data[description]", "Tailr Edge - pay what you want");

    const session = await stripeRequest("checkout/sessions", {method: "POST", params});
    res.status(200).json({url: session.url});
  } catch (error) {
    console.error("Error creating FingerPrint contribution checkout:", error);
    res.status(500).json({error: "Could not open the contribution page. Please try again."});
  }
});

// Called by the embedded Stripe form (via runServerUpdate) once the shipping address is complete.
// Response format is what the Stripe form expects: {type: "object"} or {type: "error", message}.
paymentApp.post("/fingerprint/shipping", async (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId || "");
    const country = req.body?.shippingDetails?.address?.country || req.body?.shippingDetails?.country;
    if (!sessionId.startsWith("cs_")) {
      res.status(400).json({type: "error", message: "Invalid checkout session."});
      return;
    }
    const amount = sloperKingRateFor(await getSloperKingRates(), country);
    if (amount === undefined) {
      res.status(200).json({type: "error", message: "We don't ship to this country yet."});
      return;
    }
    // Free shipping when a free promo code is applied (the form calls this again when a code is added or removed)
    const current = await stripeRequest(`checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=discounts.promotion_code`);
    const params = new URLSearchParams();
    appendSloperKingShipping(params, String(country).toUpperCase(), freeCodeOf(current) ? 0 : amount);
    params.append("metadata[shippingCountry]", String(country).toUpperCase());
    await stripeRequest(`checkout/sessions/${encodeURIComponent(sessionId)}`, {method: "POST", params});
    res.status(200).json({type: "object", value: {succeeded: true}});
  } catch (error) {
    console.error("Error updating FingerPrint shipping:", error);
    res.status(200).json({type: "error", message: "We couldn't calculate shipping. Please try again."});
  }
});

// Called by the /shop/tailr-edge page when the customer returns from Stripe.
paymentApp.get("/fingerprint/order/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const key = sessionId.startsWith("cs_live_") ? STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY_TEST;
    const session = await stripeRequest(`checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=discounts.promotion_code`, {key});
    const freeCode = freeCodeOf(session);
    const orderId = session.client_reference_id || session.metadata?.orderId;
    if (session.metadata?.product !== "fingerprint" || !orderId) {
      res.status(404).json({error: "Order not found"});
      return;
    }
    // A free order (promo code) is complete without a payment
    const paid = session.payment_status === "paid" || (session.status === "complete" && session.payment_status === "no_payment_required");
    const db = getFirestore();
    const orderRef = db.collection("fingerprint_orders").doc(orderId);

    if (paid) {
      // Flag orders whose charged shipping doesn't match the delivery country (e.g. a wallet
      // payment that skipped our address-based update), so it can be corrected by hand.
      const shipDetails = session.collected_information?.shipping_details || session.shipping_details;
      const expectedRate = sloperKingRateFor(await getSloperKingRates(), shipDetails?.address?.country);
      const invite = session.metadata?.invite || "";
      const expectedShipping = freeCode || invite ? 0 : expectedRate === undefined ? null : expectedRate;
      const chargedShipping = session.shipping_cost?.amount_total ?? null;
      const shippingCheck = expectedShipping === chargedShipping ? "ok" :
        `charged €${((chargedShipping || 0) / 100).toFixed(2)}, expected ` +
        (expectedShipping === null ? "no delivery to this country" : `€${(expectedShipping / 100).toFixed(2)}`);

      // Mark the order paid (once)
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(orderRef);
        if (!snap.exists || snap.data().status === "paid") return;
        tx.update(orderRef, {
          status: "paid",
          paidAt: new Date(),
          paymentIntentId: session.payment_intent || "",
          free: !!freeCode,
          promoCode: freeCode,
          amountTotal: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email || "",
          customerName: session.customer_details?.name || "",
          customerPhone: session.customer_details?.phone || "",
          // Early-access orders keep the address of their Sloper King order (stored at checkout)
          shipping: shipDetails || snap.data().shipping || null,
          shippingCharged: chargedShipping,
          shippingCheck,
        });
      });

      if (invite) {
        await db.collection("tailr_edge_invites").doc(invite).set({usedAt: new Date(), tailrOrderId: orderId}, {merge: true});
      }

      // Notify the admin until one email has gone out. A failed send is retried on the next check;
      // the short claim window stops two simultaneous checks from both sending.
      const claimed = await db.runTransaction(async (tx) => {
        const snap = await tx.get(orderRef);
        if (!snap.exists) return false;
        const data = snap.data();
        const claimedAt = data.adminNotifyClaimedAt?.toDate?.();
        if (data.adminNotifiedAt || (claimedAt && Date.now() - claimedAt.getTime() < 60000)) return false;
        tx.update(orderRef, {adminNotifyClaimedAt: new Date()});
        return true;
      });

      if (claimed) {
        try {
          const shipping = session.shipping_details || session.collected_information?.shipping_details;
          const addr = shipping?.address || {};
          const esc = (v) => String(v || "").replace(/[&<>"']/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"})[c]);
          await createTransporter().sendMail({
            from: process.env.EMAIL_USER || "your-email@gmail.com",
            to: ADMIN_EMAIL,
            subject: `${session.livemode ? "" : "[TEST] "}New Tailr Edge order ${orderId}`,
            html: `
              <h2>New Tailr Edge order (${freeCode ? `free, code ${esc(freeCode)}` : "paid"}${session.livemode ? "" : ", TEST"})</h2>
              <p><strong>Order:</strong> ${orderId}<br>
              <strong>Customer:</strong> ${esc(session.customer_details?.name)} &lt;${esc(session.customer_details?.email)}&gt;<br>
              <strong>Phone:</strong> ${esc(session.customer_details?.phone)}<br>
              <strong>Amount:</strong> €${((session.amount_total || 0) / 100).toFixed(2)}
              (shipping €${((chargedShipping || 0) / 100).toFixed(2)})</p>
              ${shippingCheck === "ok" ? "" : `<p style="color:#b91c1c"><strong>Check shipping:</strong> ${esc(shippingCheck)}</p>`}
              <p><strong>Ship to:</strong><br>${esc(shipping?.name)}<br>${esc(addr.line1)} ${esc(addr.line2)}<br>
              ${esc(addr.postal_code)} ${esc(addr.city)}<br>${esc(addr.country)}</p>
              <p><strong>Left hand:</strong> ${esc(session.metadata.left)}<br>
              <strong>Right hand:</strong> ${esc(session.metadata.right)}</p>
              <p><a href="${esc(session.metadata.designUrl)}">Open this design in the Tailr Edge designer</a></p>
            `,
          });
          await orderRef.update({adminNotifiedAt: new Date()});
        } catch (mailErr) {
          console.error("Error sending FingerPrint order email:", mailErr);
        }
      }
    }

    res.status(200).json({
      paid,
      orderId,
      email: session.customer_details?.email || "",
    });
  } catch (error) {
    console.error("Error checking FingerPrint order:", error);
    res.status(error.status === 404 ? 404 : 500).json({error: "Could not check the order."});
  }
});

// Tailr Edge orders for /admin/tailr-edge (newest first). Same admin key as /admin/shipping.
paymentApp.get("/fingerprint/admin/orders", async (req, res) => {
  try {
    const adminKey = process.env.SLOPERKING_ADMIN_KEY;
    if (!adminKey || req.get("x-admin-key") !== adminKey) {
      res.status(401).json({error: "Wrong admin key."});
      return;
    }
    const snap = await getFirestore().collection("fingerprint_orders").orderBy("createdAt", "desc").limit(300).get();
    const iso = (v) => (v && v.toDate ? v.toDate().toISOString() : null);
    const orders = snap.docs.map((d) => {
      const o = d.data();
      return {
        orderId: d.id,
        status: o.status || "",
        livemode: !!o.livemode,
        free: !!o.free || !!o.promoCode,
        promoCode: o.promoCode || "",
        createdAt: iso(o.createdAt),
        paidAt: iso(o.paidAt),
        customerName: o.customerName || "",
        customerEmail: o.customerEmail || o.email || "",
        heightCm: o.heightCm || null,
        gender: o.gender || "",
        design: o.design || null,
        designUrl: o.designUrl || "",
        amountTotal: o.amountTotal ?? null,
        shippingCountry: o.shipping?.address?.country || "",
        measurementId: o.measurementId || "",
        earlyAccess: o.invite ? {sloperKingOrderId: o.sloperKingOrderId || "", pickup: !!o.pickup} : null,
      };
    });
    res.status(200).json({orders});
  } catch (error) {
    console.error("Error listing Tailr Edge orders:", error);
    res.status(500).json({error: "Could not load the orders."});
  }
});

// ==================== TAILR EDGE EARLY ACCESS ====================
// Sloper King buyers get a personal link (/tailr-edge/early-access?invite=TOKEN) to order one Tailr Edge set
// for €24 until the deadline. The set is sent with their Sloper King, to the address of that order (or picked up
// with it), so the checkout has no address or shipping step. One set per link. Invites live in tailr_edge_invites.
const EARLY_ACCESS_PRICE_CENTS = 2400;
const EARLY_ACCESS_NORMAL_PRICE_CENTS = 3900;
const EARLY_ACCESS_DEADLINE = new Date("2026-12-01T23:59:59+01:00");
const EARLY_ACCESS_PAGE = "https://fre2028.la/tailr-edge/early-access";
// Counter on the early-access page: starts at 20 of 50 Christmas sets, plus every set ordered through a link
const EARLY_ACCESS_SOLD_START = 20;
const EARLY_ACCESS_CHRISTMAS_SPOTS = 50;

const requireAdmin = (req, res) => {
  const adminKey = process.env.SLOPERKING_ADMIN_KEY;
  if (!adminKey || req.get("x-admin-key") !== adminKey) {
    res.status(401).json({error: "Wrong admin key."});
    return false;
  }
  return true;
};

const inviteSummary = (id, v) => ({
  token: id,
  link: `${EARLY_ACCESS_PAGE}?invite=${id}`,
  name: v.name || "",
  email: v.email || "",
  pickup: !!v.pickup,
  city: v.shipping?.address?.city || "",
  sloperKingOrderId: v.sloperKingOrderId || "",
  livemode: v.livemode !== false,
  usedAt: v.usedAt?.toDate ? v.usedAt.toDate().toISOString() : null,
  tailrOrderId: v.tailrOrderId || "",
});

// Creates a link for every paid Sloper King order that doesn't have one yet, and lists all links.
paymentApp.post("/fingerprint/admin/invites", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const db = getFirestore();
    const [orders, invites] = await Promise.all([
      db.collection("sloperking_orders").where("status", "==", "paid").get(),
      db.collection("tailr_edge_invites").get(),
    ]);
    const invited = new Set(invites.docs.map((d) => d.data().sloperKingOrderId));
    let created = 0;
    for (const doc of orders.docs) {
      if (invited.has(doc.id)) continue;
      const o = doc.data();
      const token = crypto.randomBytes(9).toString("base64url");
      await db.collection("tailr_edge_invites").doc(token).set({
        sloperKingOrderId: doc.id,
        name: o.customerName || o.shipping?.name || "",
        email: o.customerEmail || o.email || "",
        pickup: !!o.pickup,
        shipping: o.shipping || null,
        livemode: o.livemode !== false,
        createdAt: new Date(),
      });
      created++;
    }
    const all = await db.collection("tailr_edge_invites").get();
    res.status(200).json({created, invites: all.docs.map((d) => inviteSummary(d.id, d.data()))});
  } catch (error) {
    console.error("Error creating Tailr Edge invites:", error);
    res.status(500).json({error: "Could not create the invites."});
  }
});

// What the early-access page shows: first name and where the set goes, nothing more.
paymentApp.get("/fingerprint/invite/:token", async (req, res) => {
  try {
    const invites = getFirestore().collection("tailr_edge_invites");
    const snap = await invites.doc(String(req.params.token)).get();
    if (!snap.exists) {
      res.status(404).json({error: "This link is not valid."});
      return;
    }
    const v = snap.data();
    const addr = v.shipping?.address || {};
    const ordered = await invites.where("usedAt", "!=", null).count().get().then((c) => c.data().count).catch(() => 0);
    res.status(200).json({
      sold: EARLY_ACCESS_SOLD_START + ordered,
      christmasSpots: EARLY_ACCESS_CHRISTMAS_SPOTS,
      firstName: String(v.name || "").trim().split(/\s+/)[0] || "",
      pickup: !!v.pickup,
      street: addr.line1 || "",
      city: [addr.postal_code, addr.city].filter(Boolean).join(" "),
      used: !!v.usedAt,
      expired: Date.now() > EARLY_ACCESS_DEADLINE.getTime(),
      deadline: EARLY_ACCESS_DEADLINE.toISOString(),
      priceCents: EARLY_ACCESS_PRICE_CENTS,
      normalPriceCents: EARLY_ACCESS_NORMAL_PRICE_CENTS,
    });
  } catch (error) {
    console.error("Error loading Tailr Edge invite:", error);
    res.status(500).json({error: "Could not load this link."});
  }
});

// Checkout for one early-access set: €24, no address or shipping step, sent with the Sloper King order.
paymentApp.post("/fingerprint/invite/:token/checkout", async (req, res) => {
  try {
    const token = String(req.params.token);
    const db = getFirestore();
    const inviteRef = db.collection("tailr_edge_invites").doc(token);
    const snap = await inviteRef.get();
    if (!snap.exists) {
      res.status(404).json({error: "This link is not valid."});
      return;
    }
    const v = snap.data();
    if (v.usedAt) {
      res.status(400).json({error: "You already ordered your Tailr Edge set with this link."});
      return;
    }
    if (Date.now() > EARLY_ACCESS_DEADLINE.getTime()) {
      res.status(400).json({error: "This early-access offer has ended."});
      return;
    }
    const {design, originUrl, heightCm, gender, measurementId} = req.body || {};
    const left = parseHand(design?.left);
    const right = parseHand(design?.right);
    if (!left || !right) {
      res.status(400).json({error: "Invalid Tailr Edge design. Check your finger lengths and widths."});
      return;
    }
    const height = toNumber(heightCm, 100, 250);
    const sex = ["male", "female"].includes(gender) ? gender : "";

    const origin = originUrl || req.headers.origin || "https://fre2028.la";
    const orderRef = db.collection("fingerprint_orders").doc();
    const orderId = orderRef.id;
    const designUrl = `https://fre2028.la/shop/tailr-edge?left=${handParam(left)}&right=${handParam(right)}`;
    await orderRef.set({
      orderId,
      status: "checkout_created",
      livemode: FINGERPRINT_LIVE,
      design: {left, right, sameForBothHands: !!design?.locked},
      designUrl,
      email: v.email || "",
      priceId: "",
      heightCm: height,
      gender: sex,
      measurementId: isMeasurementId(measurementId) ? measurementId : "",
      invite: token,
      sloperKingOrderId: v.sloperKingOrderId || "",
      pickup: !!v.pickup,
      shipping: v.shipping || null,
      createdAt: new Date(),
    });

    const metadata = {
      product: "fingerprint",
      orderId,
      invite: token,
      sloperKingOrderId: v.sloperKingOrderId || "",
      shipWith: v.pickup ? "Sloper King pickup in Leuven" : "Sloper King shipment",
      left: handSummary(left),
      right: handSummary(right),
      designUrl,
    };
    if (height) metadata.heightCm = String(Math.round(height));
    if (sex) metadata.gender = sex;

    const price = await stripeRequest(`prices/${FINGERPRINT_PRICE_ID}`);
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("ui_mode", "form");
    params.append("line_items[0][price_data][currency]", "eur");
    params.append("line_items[0][price_data][unit_amount]", String(EARLY_ACCESS_PRICE_CENTS));
    params.append("line_items[0][price_data][product]", typeof price.product === "string" ? price.product : price.product.id);
    params.append("line_items[0][quantity]", "1");
    params.append("customer_creation", "always");
    params.append("client_reference_id", orderId);
    params.append("return_url", `${origin}/tailr-edge/early-access?invite=${token}&order=success&session_id={CHECKOUT_SESSION_ID}`);
    if (v.email) params.append("customer_email", v.email);
    for (const [key, value] of Object.entries(metadata)) {
      params.append(`metadata[${key}]`, value);
      params.append(`payment_intent_data[metadata][${key}]`, value);
    }
    params.append("payment_intent_data[description]", `Tailr Edge set (early access) - order ${orderId}`);

    const session = await stripeRequest("checkout/sessions", {method: "POST", params});
    await orderRef.update({sessionId: session.id});
    res.status(200).json({
      clientSecret: session.client_secret,
      publishableKey: FINGERPRINT_PUBLISHABLE_KEY,
      orderId,
      livemode: FINGERPRINT_LIVE,
    });
  } catch (error) {
    console.error("Error creating Tailr Edge early-access checkout:", error);
    res.status(error.status && error.status < 500 ? error.status : 500).json({error: "Could not start the checkout. Please try again."});
  }
});

// ==================== MEASUREMENT PHOTOS ====================
// When a customer saves the measure page, the photo with the boxes and values drawn on it is stored in Firebase
// Storage (tailr-edge-measurements/ID.jpg); the order keeps the ID so the measurement can be checked on
// /admin/tailr-edge. Only readable with the admin key.
const MEASUREMENT_DIR = "tailr-edge-measurements";
const isMeasurementId = (v) => typeof v === "string" && /^[A-Za-z0-9_-]{16}$/.test(v);

paymentApp.post("/fingerprint/measurement", async (req, res) => {
  try {
    const buf = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : null);
    // a JPEG of reasonable size
    if (!buf || buf.length < 1000 || buf.length > 4 * 1024 * 1024 || buf[0] !== 0xff || buf[1] !== 0xd8) {
      res.status(400).json({error: "Invalid image."});
      return;
    }
    const id = crypto.randomBytes(12).toString("base64url");
    await getStorage().bucket().file(`${MEASUREMENT_DIR}/${id}.jpg`).save(buf, {contentType: "image/jpeg", resumable: false});
    res.status(200).json({id});
  } catch (error) {
    console.error("Error storing measurement photo:", error);
    res.status(500).json({error: "Could not store the photo."});
  }
});

// The customer's original photo, as uploaded (with its camera information), stored next to the overlay photo
// as ID-original. Can only be added once, to a measurement that exists.
const ORIGINAL_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif"};

paymentApp.post("/fingerprint/measurement/:id/original", async (req, res) => {
  try {
    const id = String(req.params.id);
    const type = String(req.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const buf = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : null);
    if (!isMeasurementId(id) || !ORIGINAL_TYPES[type] || !buf || buf.length < 1000 || buf.length > 25 * 1024 * 1024) {
      res.status(400).json({error: "Invalid image."});
      return;
    }
    const bucket = getStorage().bucket();
    const [overlayExists] = await bucket.file(`${MEASUREMENT_DIR}/${id}.jpg`).exists();
    const original = bucket.file(`${MEASUREMENT_DIR}/${id}-original`);
    const [originalExists] = await original.exists();
    if (!overlayExists || originalExists) {
      res.status(400).json({error: "Invalid measurement."});
      return;
    }
    await original.save(buf, {contentType: type, resumable: false});
    res.status(200).json({ok: true});
  } catch (error) {
    console.error("Error storing original measurement photo:", error);
    res.status(500).json({error: "Could not store the photo."});
  }
});

// ?original=1 returns the original photo instead of the one with the overlay
paymentApp.get("/fingerprint/admin/measurement/:id", async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    if (!isMeasurementId(req.params.id)) {
      res.status(400).end();
      return;
    }
    const original = req.query.original === "1";
    const file = getStorage().bucket().file(`${MEASUREMENT_DIR}/${req.params.id}${original ? "-original" : ".jpg"}`);
    const [buf] = await file.download();
    const type = original ? (await file.getMetadata())[0].contentType || "application/octet-stream" : "image/jpeg";
    res.set("Content-Type", type).set("Cache-Control", "private, max-age=3600").send(buf);
  } catch (error) {
    res.status(error.code === 404 ? 404 : 500).end();
  }
});

// ==================== SLOPER KING ORDERS ====================
// Same flow as FingerPrint (embedded Stripe form, shipping from the entered address, order stored in
// Firestore, admin email once paid), but for a standard product sold as a single unit or a pair.
// Test/live mode follows FINGERPRINT_STRIPE_MODE. The price depends on how many orders are sold (see tiers below).
const SLOPERKING_PRODUCTS = {
  pair: {
    productId: FINGERPRINT_LIVE ? process.env.SLOPERKING_PRODUCT_PAIR : process.env.SLOPERKING_PRODUCT_PAIR_TEST,
    name: "Sloper King™ (Set of 2 - Pair)",
    description: "Complete set of 2x Sloper King™ units, 2x Petzl 800kg load cords, 1x stamped cotton pouch & guide card",
  },
  single: {
    productId: FINGERPRINT_LIVE ? process.env.SLOPERKING_PRODUCT_SINGLE : process.env.SLOPERKING_PRODUCT_SINGLE_TEST,
    name: "Sloper King™ (Single Unit)",
    description: "1x Sloper King™ unit with Petzl 800kg cord & 220-grit contact strip",
  },
};
// Sloper Kings sold before the online shop (the first 60 early birds plus 2), counted on top of the paid units in Firestore.
const SLOPERKING_SOLD_OFFSET = 62;
// Price per Sloper King number: 1-60 early bird, up to 300 presale, then retail. An order is priced at the tier of its first unit.
const SLOPERKING_PRICE_TIERS = [
  {upTo: 60, label: "Early bird", single: 1600, pair: 3000},
  {upTo: 300, label: "Presale", single: 2100, pair: 3900},
  {upTo: Infinity, label: "Retail", single: 2495, pair: 4495},
];
const sloperKingTierFor = (orderNumber) => SLOPERKING_PRICE_TIERS.find((t) => orderNumber <= t.upTo);
// Counts Sloper Kings, not orders: a pair is 2 units, and every order can have a quantity.
const sloperKingUnits = (itemType, quantity) => (itemType === "pair" ? 2 : 1) * (Math.round(Number(quantity)) || 1);
const countSloperKingSold = async () => {
  const snap = await getFirestore().collection("sloperking_orders")
    .where("status", "==", "paid")
    .where("livemode", "==", FINGERPRINT_LIVE)
    .select("itemType", "quantity")
    .get();
  let units = 0;
  snap.forEach((doc) => {
    const {itemType, quantity} = doc.data();
    units += sloperKingUnits(itemType, quantity);
  });
  return SLOPERKING_SOLD_OFFSET + units;
};
// Shipping cost per country in cents, edited on /admin/shipping and stored in Firestore.
// Countries without a rate can't order yet. Until the admin saves rates, these defaults apply.
const SLOPERKING_DEFAULT_RATES = Object.fromEntries(FINGERPRINT_SHIPPING.eu.countries.map((c) => [c, 499]));
SLOPERKING_DEFAULT_RATES.BE = 399;
const SLOPERKING_RATES_DOC = "settings/sloperking_shipping";
let sloperKingRatesCache = {at: 0, rates: null};
const getSloperKingRates = async () => {
  if (!sloperKingRatesCache.rates || Date.now() - sloperKingRatesCache.at > 60000) {
    const snap = await getFirestore().doc(SLOPERKING_RATES_DOC).get();
    const rates = snap.exists && snap.data().rates ? snap.data().rates : SLOPERKING_DEFAULT_RATES;
    sloperKingRatesCache = {at: Date.now(), rates};
  }
  return sloperKingRatesCache.rates;
};
const sloperKingRateFor = (rates, country) => rates[String(country || "").toUpperCase()];
const appendSloperKingShipping = (params, country, amount) => {
  params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.append("shipping_options[0][shipping_rate_data][display_name]", `Shipping (${country}, tracked)`);
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(amount));
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
};

paymentApp.post("/sloperking/checkout", async (req, res) => {
  try {
    const {itemType, quantity, pickup, email, originUrl, country, returnPath} = req.body || {};
    if (!FINGERPRINT_PUBLISHABLE_KEY) throw new Error("Stripe publishable key is not configured");
    const product = SLOPERKING_PRODUCTS[itemType];
    const qty = Math.round(Number(quantity));
    if (!product || !Number.isFinite(qty) || qty < 1 || qty > 20) {
      res.status(400).json({error: "Invalid order. Choose a single unit or a pair and a quantity."});
      return;
    }
    const isPickup = pickup === true;
    const rates = await getSloperKingRates();
    const shipCountries = Object.keys(rates);
    if (!isPickup && shipCountries.length === 0) {
      res.status(400).json({error: "Shipping is not available at the moment."});
      return;
    }
    // Country picked on the presale page (informational; the shipping cost still follows the entered address)
    const chosenCountry = sloperKingRateFor(rates, country) !== undefined ? String(country).toUpperCase() : "";
    // The presale landing page sends buyers back to itself; anything else returns to the shop page
    const returnTo = returnPath === "/sloperking" ? "/sloperking" : "/shop/sloper-king";
    // Price from the live count, never from the browser
    const orderNumber = (await countSloperKingSold()) + 1; // number of the first Sloper King in this order
    const tier = sloperKingTierFor(orderNumber);
    const unitCents = tier[itemType];

    const origin = originUrl || req.headers.origin || "https://fre2028.la";
    const db = getFirestore();
    const orderRef = db.collection("sloperking_orders").doc();
    const orderId = orderRef.id;

    await orderRef.set({
      orderId,
      status: "checkout_created",
      livemode: FINGERPRINT_LIVE,
      itemType,
      quantity: qty,
      pickup: isPickup,
      email: email || "",
      country: chosenCountry,
      priceTier: tier.label,
      unitCents,
      createdAt: new Date(),
    });

    const metadata = {
      product: "sloperking",
      orderId,
      itemType,
      quantity: String(qty),
      pickup: isPickup ? "yes" : "no",
      country: chosenCountry,
      priceTier: tier.label,
    };

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("ui_mode", "form");
    params.append("line_items[0][price_data][currency]", "eur");
    params.append("line_items[0][price_data][unit_amount]", String(unitCents));
    if (product.productId) {
      // Linked to the catalog product, so orders show up under Products in Stripe
      params.append("line_items[0][price_data][product]", product.productId);
    } else {
      params.append("line_items[0][price_data][product_data][name]", `${product.name} - ${tier.label} price`);
      params.append("line_items[0][price_data][product_data][description]", product.description);
    }
    params.append("line_items[0][quantity]", String(qty));
    params.append("customer_creation", "always");
    params.append("client_reference_id", orderId);
    params.append("return_url", `${origin}${returnTo}?order=success&session_id={CHECKOUT_SESSION_ID}`);
    if (isPickup) {
      params.append("billing_address_collection", "auto");
    } else {
      params.append("billing_address_collection", "required");
      if (chosenCountry) {
        // The buyer already picked the country on the page: only accept that country and charge its rate from the
        // start, so the total in the payment form is right immediately.
        params.append("shipping_address_collection[allowed_countries][0]", chosenCountry);
        appendSloperKingShipping(params, chosenCountry, sloperKingRateFor(rates, chosenCountry));
      } else {
        shipCountries.forEach((c, i) => params.append(`shipping_address_collection[allowed_countries][${i}]`, c));
        // Start at the highest rate until the address is known, so a payment can never be under-charged.
        params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
        params.append("shipping_options[0][shipping_rate_data][display_name]", "Shipping");
        params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(Math.max(...Object.values(rates))));
        params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
      }
    }
    params.append("allow_promotion_codes", "true");
    if (email) params.append("customer_email", email);
    for (const [key, value] of Object.entries(metadata)) {
      params.append(`metadata[${key}]`, value);
      params.append(`payment_intent_data[metadata][${key}]`, value);
    }
    params.append("payment_intent_data[description]", `Sloper King ${itemType} x${qty} - order ${orderId}`);

    const session = await stripeRequest("checkout/sessions", {method: "POST", params});
    await orderRef.update({sessionId: session.id});

    res.status(200).json({
      clientSecret: session.client_secret,
      publishableKey: FINGERPRINT_PUBLISHABLE_KEY,
      orderId,
      livemode: FINGERPRINT_LIVE,
    });
  } catch (error) {
    console.error("Error creating Sloper King checkout:", error);
    res.status(error.status && error.status < 500 ? error.status : 500).json({error: "Could not start the checkout. Please try again."});
  }
});

// Called by the embedded Stripe form once the shipping address is complete (same contract as FingerPrint).
paymentApp.post("/sloperking/shipping", async (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId || "");
    const country = req.body?.shippingDetails?.address?.country || req.body?.shippingDetails?.country;
    if (!sessionId.startsWith("cs_")) {
      res.status(400).json({type: "error", message: "Invalid checkout session."});
      return;
    }
    const amount = sloperKingRateFor(await getSloperKingRates(), country);
    if (amount === undefined) {
      res.status(200).json({type: "error", message: "We don't ship to this country yet."});
      return;
    }
    const params = new URLSearchParams();
    appendSloperKingShipping(params, String(country).toUpperCase(), amount);
    params.append("metadata[shippingCountry]", String(country).toUpperCase());
    await stripeRequest(`checkout/sessions/${encodeURIComponent(sessionId)}`, {method: "POST", params});
    res.status(200).json({type: "object", value: {succeeded: true}});
  } catch (error) {
    console.error("Error updating Sloper King shipping:", error);
    res.status(200).json({type: "error", message: "We couldn't calculate shipping. Please try again."});
  }
});

// Called by the Sloper King page when the customer returns from Stripe.
paymentApp.get("/sloperking/order/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const key = sessionId.startsWith("cs_live_") ? STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY_TEST;
    const session = await stripeRequest(`checkout/sessions/${encodeURIComponent(sessionId)}`, {key});
    const orderId = session.client_reference_id || session.metadata?.orderId;
    if (session.metadata?.product !== "sloperking" || !orderId) {
      res.status(404).json({error: "Order not found"});
      return;
    }
    const paid = session.payment_status === "paid";
    const isPickup = session.metadata?.pickup === "yes";
    const db = getFirestore();
    const orderRef = db.collection("sloperking_orders").doc(orderId);

    if (paid) {
      const shipDetails = session.collected_information?.shipping_details || session.shipping_details;
      const rate = sloperKingRateFor(await getSloperKingRates(), shipDetails?.address?.country);
      const expectedShipping = isPickup ? 0 : rate ?? null;
      const chargedShipping = session.shipping_cost?.amount_total ?? 0;
      const shippingCheck = expectedShipping === chargedShipping ? "ok" :
        `charged €${(chargedShipping / 100).toFixed(2)}, expected ` +
        (expectedShipping === null ? "no delivery to this country" : `€${(expectedShipping / 100).toFixed(2)}`);

      await db.runTransaction(async (tx) => {
        const snap = await tx.get(orderRef);
        if (!snap.exists || snap.data().status === "paid") return;
        tx.update(orderRef, {
          status: "paid",
          paidAt: new Date(),
          paymentIntentId: session.payment_intent || "",
          amountTotal: session.amount_total,
          currency: session.currency,
          customerEmail: session.customer_details?.email || "",
          customerName: session.customer_details?.name || "",
          customerPhone: session.customer_details?.phone || "",
          shipping: shipDetails || null,
          shippingCharged: chargedShipping,
          shippingCheck,
        });
      });

      // Notify the admin until one email has gone out (see the FingerPrint handler for the claim logic).
      const claimed = await db.runTransaction(async (tx) => {
        const snap = await tx.get(orderRef);
        if (!snap.exists) return false;
        const data = snap.data();
        const claimedAt = data.adminNotifyClaimedAt?.toDate?.();
        if (data.adminNotifiedAt || (claimedAt && Date.now() - claimedAt.getTime() < 60000)) return false;
        tx.update(orderRef, {adminNotifyClaimedAt: new Date()});
        return true;
      });

      if (claimed) {
        try {
          const addr = shipDetails?.address || {};
          const esc = (v) => String(v || "").replace(/[&<>"']/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"})[c]);
          const product = SLOPERKING_PRODUCTS[session.metadata.itemType];
          await createTransporter().sendMail({
            from: process.env.EMAIL_USER || "your-email@gmail.com",
            to: ADMIN_EMAIL,
            subject: `${session.livemode ? "" : "[TEST] "}New Sloper King order ${orderId}`,
            html: `
              <h2>New Sloper King order (paid${session.livemode ? "" : ", TEST"})</h2>
              <p><strong>Order:</strong> ${orderId}<br>
              <strong>Item:</strong> ${esc(session.metadata.quantity)} x ${esc(product ? product.name : session.metadata.itemType)}<br>
              <strong>Customer:</strong> ${esc(session.customer_details?.name)} &lt;${esc(session.customer_details?.email)}&gt;<br>
              <strong>Phone:</strong> ${esc(session.customer_details?.phone)}<br>
              <strong>Amount:</strong> €${((session.amount_total || 0) / 100).toFixed(2)}
              (shipping €${(chargedShipping / 100).toFixed(2)})</p>
              ${shippingCheck === "ok" ? "" : `<p style="color:#b91c1c"><strong>Check shipping:</strong> ${esc(shippingCheck)}</p>`}
              ${isPickup ?
                "<p><strong>Local pickup in Leuven</strong> (no shipping address)</p>" :
                `<p><strong>Ship to:</strong><br>${esc(shipDetails?.name)}<br>${esc(addr.line1)} ${esc(addr.line2)}<br>
                ${esc(addr.postal_code)} ${esc(addr.city)}<br>${esc(addr.country)}</p>`}
            `,
          });
          await orderRef.update({adminNotifiedAt: new Date()});
        } catch (mailErr) {
          console.error("Error sending Sloper King order email:", mailErr);
        }
      }
    }

    res.status(200).json({
      paid,
      orderId,
      email: session.customer_details?.email || "",
      itemType: session.metadata.itemType,
      quantity: Number(session.metadata.quantity) || 1,
      pickup: isPickup,
      amountTotal: (session.amount_total || 0) / 100,
    });
  } catch (error) {
    console.error("Error checking Sloper King order:", error);
    res.status(error.status === 404 ? 404 : 500).json({error: "Could not check the order."});
  }
});

// Public shipping rates (euros per country) for the shop and presale pages.
paymentApp.get("/sloperking/shipping-rates", async (req, res) => {
  try {
    const rates = await getSloperKingRates();
    res.status(200).json({rates: Object.fromEntries(Object.entries(rates).map(([c, cents]) => [c, cents / 100]))});
  } catch (error) {
    console.error("Error loading Sloper King shipping rates:", error);
    res.status(500).json({error: "Could not load shipping rates."});
  }
});

// Saves the rates from /admin/shipping. The admin page has no server-side login, so writes need
// SLOPERKING_ADMIN_KEY (functions/.env), which the admin types in once per browser.
paymentApp.post("/sloperking/shipping-rates", async (req, res) => {
  try {
    const adminKey = process.env.SLOPERKING_ADMIN_KEY;
    if (!adminKey || req.get("x-admin-key") !== adminKey) {
      res.status(401).json({error: "Wrong admin key."});
      return;
    }
    const input = req.body?.rates;
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      res.status(400).json({error: "Invalid rates."});
      return;
    }
    const rates = {};
    for (const [code, euros] of Object.entries(input)) {
      const cents = Math.round(Number(euros) * 100);
      if (!/^[A-Z]{2}$/.test(code) || !Number.isFinite(cents) || cents < 0 || cents > 10000) {
        res.status(400).json({error: `Invalid rate for ${code}.`});
        return;
      }
      rates[code] = cents;
    }
    await getFirestore().doc(SLOPERKING_RATES_DOC).set({rates, updatedAt: new Date()});
    sloperKingRatesCache = {at: Date.now(), rates};
    res.status(200).json({ok: true});
  } catch (error) {
    console.error("Error saving Sloper King shipping rates:", error);
    res.status(500).json({error: "Could not save the rates."});
  }
});

// Sold counter for the shop and presale pages: it sets the current price tier and the estimated ship date.
// Cached briefly so a busy landing page doesn't run a Firestore count on every visit (checkout always counts fresh).
let sloperKingStatsCache = {at: 0, sold: 0};
// Also served through Firebase Hosting (/api/payments/...), where the CDN keeps the answer for 30 seconds,
// so visitors far from the US get it from a nearby edge instead of waiting for the function.
paymentApp.get(["/sloperking/stats", "/api/payments/sloperking/stats"], async (req, res) => {
  res.set("Cache-Control", "public, max-age=5, s-maxage=30");
  try {
    if (Date.now() - sloperKingStatsCache.at > 20000) {
      sloperKingStatsCache = {at: Date.now(), sold: await countSloperKingSold()};
    }
    const sold = sloperKingStatsCache.sold;
    const tier = sloperKingTierFor(sold + 1);
    const next = SLOPERKING_PRICE_TIERS[SLOPERKING_PRICE_TIERS.indexOf(tier) + 1];
    const euros = (t) => ({single: t.single / 100, pair: t.pair / 100});
    res.status(200).json({
      sold,
      tier: {label: tier.label, upTo: Number.isFinite(tier.upTo) ? tier.upTo : null, prices: euros(tier)},
      next: next ? {label: next.label, prices: euros(next)} : null,
    });
  } catch (error) {
    console.error("Error counting Sloper King orders:", error);
    res.status(500).json({error: "Could not load the order count."});
  }
});

// Waitlist for countries we don't ship to yet: one entry per email and country.
paymentApp.post("/sloperking/waitlist", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const country = String(req.body?.country || "").trim().toUpperCase().slice(0, 40);
    const quantity = Math.round(Number(req.body?.quantity));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 || !country) {
      res.status(400).json({error: "Please enter a valid email address and country."});
      return;
    }
    const id = `${country}_${email}`.replace(/[\/]/g, "_");
    await getFirestore().collection("sloperking_waitlist").doc(id).set({
      email,
      country,
      quantity: Number.isFinite(quantity) && quantity > 0 && quantity <= 50 ? quantity : 1,
      source: String(req.body?.source || "presale").slice(0, 40),
      updatedAt: new Date(),
    }, {merge: true});
    res.status(200).json({ok: true});
  } catch (error) {
    console.error("Error saving Sloper King waitlist entry:", error);
    res.status(500).json({error: "Could not save your email. Please try again."});
  }
});

// Question form on the presale page: saved in Firestore and emailed to info@paraclimbing.be (reply goes to the sender).
paymentApp.post("/sloperking/question", async (req, res) => {
  try {
    const {name, email, message, country, website} = req.body || {};
    // "website" is a hidden honeypot field: bots fill it, people don't
    if (website) {
      res.status(200).json({ok: true});
      return;
    }
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanName = String(name || "").trim().slice(0, 100);
    const cleanMessage = String(message || "").trim().slice(0, 3000);
    const cleanCountry = String(country || "").trim().slice(0, 40);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 200 || cleanMessage.length < 2) {
      res.status(400).json({error: "Please enter your email address and a question."});
      return;
    }
    await getFirestore().collection("sloperking_questions").add({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      country: cleanCountry,
      createdAt: new Date(),
    });
    const esc = (v) => String(v || "").replace(/[&<>"']/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"})[c]);
    await createTransporter().sendMail({
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: "info@paraclimbing.be",
      replyTo: cleanEmail,
      subject: `Sloper King question from ${cleanName || cleanEmail}`,
      html: `
        <h2>New Sloper King question (presale page)</h2>
        <p><strong>From:</strong> ${esc(cleanName)} &lt;${esc(cleanEmail)}&gt;<br>
        <strong>Country:</strong> ${esc(cleanCountry) || "-"}</p>
        <p style="white-space:pre-wrap">${esc(cleanMessage)}</p>
        <p style="color:#999;font-size:12px">Reply to this email to answer them directly.</p>
      `,
    });
    res.status(200).json({ok: true});
  } catch (error) {
    console.error("Error sending Sloper King question:", error);
    res.status(500).json({error: "Could not send your question. Please try again."});
  }
});

paymentApp.get("/health", (req, res) => {
  res.status(200).json({status: "OK", timestamp: new Date().toISOString()});
});

exports.payments = onRequest(paymentApp);

