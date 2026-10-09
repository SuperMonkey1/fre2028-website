const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
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

// Same format the /fingerprint page reads to reload a design: ring,middle,index,pinkyW,ringW,middleW,indexW
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
    const {design, email, originUrl} = req.body || {};
    if (!FINGERPRINT_PUBLISHABLE_KEY) throw new Error("Stripe publishable key for FingerPrint orders is not configured");
    const left = parseHand(design?.left);
    const right = parseHand(design?.right);
    if (!left || !right) {
      res.status(400).json({error: "Invalid FingerPrint design. Check your finger lengths and widths."});
      return;
    }

    const origin = originUrl || req.headers.origin || "https://fre2028.la";
    const db = getFirestore();
    const orderRef = db.collection("fingerprint_orders").doc();
    const orderId = orderRef.id;
    const designUrl = `https://fre2028.la/fingerprint?left=${handParam(left)}&right=${handParam(right)}`;

    await orderRef.set({
      orderId,
      status: "checkout_created",
      livemode: FINGERPRINT_LIVE,
      design: {left, right, sameForBothHands: !!design?.locked},
      designUrl,
      email: email || "",
      priceId: FINGERPRINT_PRICE_ID,
      createdAt: new Date(),
    });

    const metadata = {
      product: "fingerprint",
      orderId,
      left: handSummary(left),
      right: handSummary(right),
      designUrl,
    };

    const params = new URLSearchParams();
    // Embedded Stripe form on our page; shipping is set from the address the customer enters.
    params.append("mode", "payment");
    params.append("ui_mode", "form");
    params.append("line_items[0][price]", FINGERPRINT_PRICE_ID);
    params.append("line_items[0][quantity]", "1");
    params.append("client_reference_id", orderId);
    params.append("return_url", `${origin}/fingerprint?order=success&session_id={CHECKOUT_SESSION_ID}`);
    params.append("billing_address_collection", "required");
    params.append("phone_number_collection[enabled]", "true");
    FINGERPRINT_SHIP_COUNTRIES.forEach((c, i) => params.append(`shipping_address_collection[allowed_countries][${i}]`, c));
    // Start at the highest rate until the address is known, so a payment can never be under-charged.
    // Neutral name, because the customer's country isn't known yet.
    params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
    params.append("shipping_options[0][shipping_rate_data][display_name]", "Shipping");
    params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(FINGERPRINT_SHIPPING.eu.amount));
    params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "eur");
    params.append("allow_promotion_codes", "true");
    if (email) params.append("customer_email", email);
    for (const [key, value] of Object.entries(metadata)) {
      params.append(`metadata[${key}]`, value);
      params.append(`payment_intent_data[metadata][${key}]`, value);
    }
    params.append("payment_intent_data[description]", `FingerPrint set - order ${orderId}`);

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
    params.append("success_url", `${origin}/fingerprint?contribution=thanks${designQuery}`);
    params.append("cancel_url", `${origin}/fingerprint?contribution=cancelled${designQuery}`);
    params.append("metadata[product]", "fingerprint_contribution");
    params.append("payment_intent_data[metadata][product]", "fingerprint_contribution");
    params.append("payment_intent_data[description]", "FingerPrint - pay what you want");

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
    const zone = shippingZoneFor(country);
    if (!sessionId.startsWith("cs_")) {
      res.status(400).json({type: "error", message: "Invalid checkout session."});
      return;
    }
    if (!zone) {
      res.status(200).json({type: "error", message: "We currently only ship to Belgium and the rest of the EU."});
      return;
    }
    const params = new URLSearchParams();
    appendShippingOption(params, zone);
    params.append("metadata[shippingCountry]", String(country).toUpperCase());
    await stripeRequest(`checkout/sessions/${encodeURIComponent(sessionId)}`, {method: "POST", params});
    res.status(200).json({type: "object", value: {succeeded: true}});
  } catch (error) {
    console.error("Error updating FingerPrint shipping:", error);
    res.status(200).json({type: "error", message: "We couldn't calculate shipping. Please try again."});
  }
});

// Called by the /fingerprint page when the customer returns from Stripe.
paymentApp.get("/fingerprint/order/:sessionId", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const key = sessionId.startsWith("cs_live_") ? STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY_TEST;
    const session = await stripeRequest(`checkout/sessions/${encodeURIComponent(sessionId)}`, {key});
    const orderId = session.client_reference_id || session.metadata?.orderId;
    if (session.metadata?.product !== "fingerprint" || !orderId) {
      res.status(404).json({error: "Order not found"});
      return;
    }
    const paid = session.payment_status === "paid";
    const db = getFirestore();
    const orderRef = db.collection("fingerprint_orders").doc(orderId);

    if (paid) {
      // Flag orders whose charged shipping doesn't match the delivery country (e.g. a wallet
      // payment that skipped our address-based update), so it can be corrected by hand.
      const shipDetails = session.collected_information?.shipping_details || session.shipping_details;
      const expectedZone = shippingZoneFor(shipDetails?.address?.country);
      const expectedShipping = expectedZone ? FINGERPRINT_SHIPPING[expectedZone].amount : null;
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
            subject: `${session.livemode ? "" : "[TEST] "}New FingerPrint order ${orderId}`,
            html: `
              <h2>New FingerPrint order (paid${session.livemode ? "" : ", TEST"})</h2>
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
              <p><a href="${esc(session.metadata.designUrl)}">Open this design in the FingerPrint designer</a></p>
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

paymentApp.get("/health", (req, res) => {
  res.status(200).json({status: "OK", timestamp: new Date().toISOString()});
});

exports.payments = onRequest(paymentApp);

