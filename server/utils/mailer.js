import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Liftly OTP Service" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your Liftly OTP Code',
      text: `Your OTP is: ${otp}`,
      html: `<p>Your OTP code is: <b>${otp}</b></p>`,
    });
    console.log(`OTP sent to ${to}`);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};
