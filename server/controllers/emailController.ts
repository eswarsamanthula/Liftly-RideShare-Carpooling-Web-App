import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import OTP from '../models/OTP';
import User from '../models/User';
import { sendOTPEmail, generateOTP, testEmailConnection } from '../utils/emailService';

// @desc    Send OTP for forgot password
// @route   POST /api/email/send-forgot-password-otp
// @access  Public
export const sendForgotPasswordOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required', success: false });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Please provide a valid email address', success: false });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'No account found with this email address', success: false });
      return;
    }

    const connectionTest = await testEmailConnection();
    if (!connectionTest) {
      res.status(500).json({ message: 'Email service is currently unavailable. Please try again later.', success: false });
      return;
    }

    const otp = generateOTP(); // Generates 6-digit OTP
    await OTP.deleteMany({ email, type: 'forgot-password' });

    const otpDoc = new OTP({
      email,
      otp,
      type: 'forgot-password',
    });
    await otpDoc.save();

    await sendOTPEmail(email, otp, 'forgot-password');

    res.json({
      message: 'OTP sent successfully to your email',
      email,
      success: true,
      debug: process.env.NODE_ENV === 'development' ? { otp } : undefined,
    });
  } catch (error: any) {
    console.error('Error in sendForgotPasswordOTP:', error);
    let errorMessage = 'Failed to send OTP. Please try again.';
    if (error.message.includes('Gmail authentication')) {
      errorMessage = 'Email service configuration error. Please contact support.';
    } else if (error.message.includes('connect')) {
      errorMessage = 'Cannot connect to email service. Please try again later.';
    }
    res.status(500).json({
      message: errorMessage,
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Verify OTP for forgot password
// @route   POST /api/email/verify-forgot-password-otp
// @access  Public
export const verifyForgotPasswordOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required', success: false });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Please provide a valid email address', success: false });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      res.status(400).json({ message: 'OTP must be 6 digits', success: false });
      return;
    }

    const otpDoc = await OTP.findOne({
      email,
      otp,
      type: 'forgot-password',
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.', success: false });
      return;
    }

    await OTP.deleteOne({ _id: otpDoc._id });

    res.json({ message: 'OTP verified successfully', verified: true, success: true });
  } catch (error: any) {
    console.error('Error in verifyForgotPasswordOTP:', error);
    res.status(500).json({
      message: 'Failed to verify OTP. Please try again.',
      verified: false,
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/email/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ message: 'Email and new password are required', success: false });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Please provide a valid email address', success: false });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long', success: false });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found', success: false });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully', success: true });
  } catch (error: any) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({
      message: 'Failed to reset password. Please try again.',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
