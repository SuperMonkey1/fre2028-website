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
