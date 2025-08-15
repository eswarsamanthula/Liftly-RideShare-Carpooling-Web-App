import express from 'express';
import { sendOTP } from '../utils/mailer.js';

const router = express.Router();

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  try {
    await sendOTP(email, otp);
    res.json({ success: true, message: 'OTP sent successfully', otp }); // ⚠️ Don't send OTP in production
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

export default router;
