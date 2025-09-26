import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// This function will set up the Nodemailer transporter using Gmail
const setupGmailTransporter = () => {
  // Create a transporter object using the Gmail SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use the built-in Gmail service
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address from .env file
      pass: process.env.GMAIL_APP_PASSWORD, // Your App Password from .env file
    },
  });

  return transporter;
};

export const sendOtpEmail = async (to, otp) => {
  const transporter = setupGmailTransporter();

  const mailOptions = {
    from: `"Orion Eduverse" <${process.env.GMAIL_USER}>`, // Your Gmail address
    to: to,
    subject: 'Your Verification Code',
    html: `<p>Your OTP for signing up is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending OTP email via Gmail:', error);
    throw new Error('Could not send OTP email.');
  }
};

export const sendPasswordResetEmail = async (to, token) => {
  const transporter = setupGmailTransporter();
  console.log(process.env.FRONTEND_URL)
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Orion" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: 'Your Password Reset Link',
    html: `<p>You requested a password reset. Click the link below to set a new password:</p>
           <a href="${resetLink}">Reset Password</a>
           <p>This link is valid for 1 hour.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email.');
  }
};