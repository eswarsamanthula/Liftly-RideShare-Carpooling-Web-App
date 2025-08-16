import { Router } from "express";
import nodemailer from "nodemailer"; // 👈 add this
import transporter from "../config/email";

const router = Router();

router.get("/send", async (req, res) => {
  try {
    const mailOptions = {
      from: `"Liftly 🚗" <${process.env.EMAIL_USER}>`,
      to: "yourgmail@gmail.com", // 👈 replace with your test email
      subject: "Liftly Test Email ✅",
      text: "Hello Eswar! This is a test email from your Liftly backend.",
      html: "<h2>Hello Eswar 👋</h2><p>This is a <b>test email</b> sent successfully ✅</p>",
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      message: "Test email sent successfully",
      messageId: info.messageId,
      previewURL: nodemailer.getTestMessageUrl?.(info) || null,
    });
  } catch (error: any) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
