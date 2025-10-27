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
