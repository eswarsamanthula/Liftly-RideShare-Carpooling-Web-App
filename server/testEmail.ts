import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., "smtp.gmail.com"
      port: Number(process.env.EMAIL_PORT), // 587 or 465
      secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your App Password (16 chars)
      },
      tls: {
        rejectUnauthorized: false, // avoid self-signed cert errors
      },
    });

    // Verify connection configuration
    await transporter.verify();
    console.log("✅ Email server is ready to send emails");

    // Send a test email
    const info = await transporter.sendMail({
      from: `"Liftly App" <${process.env.EMAIL_USER}>`, // sender address
      to: process.env.TEST_RECEIVER || process.env.EMAIL_USER, // test recipient
      subject: "🚀 Test Email from Liftly",
      text: "Hello! This is a test email from your Liftly project.",
      html: "<p>Hello! 👋 This is a <b>test email</b> from your Liftly project.</p>",
    });

    console.log("📩 Test email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email server connection failed:", err);
  }
}

testEmail();
