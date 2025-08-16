import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

/* -------------------------------
   ✅ Config Logs
-------------------------------- */
console.log("🔧 Email Service Configuration:");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST || "NOT SET");
console.log("EMAIL_PORT:", process.env.EMAIL_PORT || "NOT SET");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "NOT SET");
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? `SET (${process.env.EMAIL_PASS.length} chars)` : "NOT SET"
);

/* -------------------------------
   ✅ Validate Config
-------------------------------- */
const validateEmailConfig = () => {
  const required = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing email configuration:", missing.join(", "));
    return false;
  }

  console.log("✅ Email configuration validated");
  return true;
};

/* -------------------------------
   ✅ Transporter Setup
-------------------------------- */
let transporter: nodemailer.Transporter | null = null;

const createTransporter = () => {
  if (!validateEmailConfig()) {
    console.error("❌ Cannot create transporter - invalid configuration");
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false, // use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      debug: process.env.NODE_ENV === "development",
      logger: process.env.NODE_ENV === "development",
    });

    console.log("✅ Email transporter created successfully");
    return transporter;
  } catch (error: any) {
    console.error("❌ Failed to create transporter:", error.message);
    return null;
  }
};

// initialize once
createTransporter();

/* -------------------------------
   ✅ OTP Generator
-------------------------------- */
export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("🎲 Generated OTP:", otp);
  return otp;
};

/* -------------------------------
   ✅ Send OTP Email
-------------------------------- */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  type: "forgot-password" | "verification" = "verification"
): Promise<boolean> => {
  console.log("📧 Preparing to send email...");
  console.log("📧 Email:", email);
  console.log("🔑 OTP:", otp);
  console.log("📝 Type:", type);

  if (!email || !otp) throw new Error("Email and OTP are required");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Invalid email format");
  if (!/^\d{6}$/.test(otp)) throw new Error("OTP must be 6 digits");

  if (!transporter) {
    console.log("🔄 Transporter not found, recreating...");
    if (!createTransporter()) throw new Error("Email service not configured properly");
  }

  const subject =
    type === "forgot-password"
      ? "Password Reset OTP - Lifty"
      : "Email Verification OTP - Lifty";

  const title =
    type === "forgot-password" ? "Reset Your Password" : "Verify Your Email";

  const mailOptions = {
    from: `"Lifty App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#fff;border-radius:10px;border:1px solid #ddd">
        <h2 style="text-align:center;color:#3b82f6;">🚗 Lifty</h2>
        <h3 style="text-align:center;color:#111">${title}</h3>
        <p style="text-align:center;font-size:16px;">Use the OTP below to continue:</p>
        <div style="text-align:center;background:#3b82f6;color:#fff;padding:20px;border-radius:8px;font-size:32px;letter-spacing:8px;">
          ${otp}
        </div>
        <p style="text-align:center;color:#555;">This code will expire in 10 minutes.</p>
        <p style="font-size:14px;color:#888;text-align:center;border-top:1px solid #eee;padding-top:10px;">
          © 2025 Lifty App. Do not share this OTP with anyone.
        </p>
      </div>
    `,
  };

  try {
    console.log("📤 Sending email...");
    const info = await transporter!.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
    console.log("📬 Response:", info.response);
    return true;
  } catch (error: any) {
    console.error("❌ EMAIL SEND ERROR:", error.message, error.code);

    if (error.code === "EAUTH") {
      throw new Error("Gmail authentication failed. Check EMAIL_USER & EMAIL_PASS");
    }
    if (error.code === "ECONNECTION") {
      throw new Error("Cannot connect to Gmail servers. Check internet.");
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/* -------------------------------
   ✅ Test Email Connection
-------------------------------- */
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    console.log("🔍 Testing email connection...");

    if (!validateEmailConfig()) return false;
    if (!transporter) createTransporter();

    await transporter!.verify();
    console.log("✅ Email server connection verified!");
    return true;
  } catch (error: any) {
    console.error("❌ Email connection test failed:", error.message);
    return false;
  }
};

// Initialize
console.log("🚀 Email service ready");
