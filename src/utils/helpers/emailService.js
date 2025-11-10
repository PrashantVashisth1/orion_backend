// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// // This function will set up the Nodemailer transporter using Gmail
// const setupGmailTransporter = () => {
//   // Create a transporter object using the Gmail SMTP transport
//   const transporter = nodemailer.createTransport({
//     service: 'gmail', // Use the built-in Gmail service
//     auth: {
//       user: process.env.GMAIL_USER, // Your Gmail address from .env file
//       pass: process.env.GMAIL_APP_PASSWORD, // Your App Password from .env file
//     },
//   });

//   return transporter;
// };

// export const sendOtpEmail = async (to, otp) => {
//   const transporter = setupGmailTransporter();

//   const mailOptions = {
//     from: `"Orion Eduverse" <${process.env.GMAIL_USER}>`, // Your Gmail address
//     to: to,
//     subject: 'Your Verification Code',
//     html: `<p>Your OTP for signing up is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('OTP email sent successfully to:', to);
//   } catch (error) {
//     console.error('Error sending OTP email via Gmail:', error);
//     throw new Error('Could not send OTP email.');
//   }
// };

// export const sendPasswordResetEmail = async (to, token) => {
//   const transporter = setupGmailTransporter();
//   console.log(process.env.FRONTEND_URL)
//   const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

//   const mailOptions = {
//     from: `"Orion" <${process.env.GMAIL_USER}>`,
//     to: to,
//     subject: 'Your Password Reset Link',
//     html: `<p>You requested a password reset. Click the link below to set a new password:</p>
//            <a href="${resetLink}">Reset Password</a>
//            <p>This link is valid for 1 hour.</p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Password reset email sent successfully to:', to);
//   } catch (error) {
//     console.error('Error sending password reset email:', error);
//     throw new Error('Could not send password reset email.');
//   }
// };



// src/utils/helpers/emailService.js
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
if (!BREVO_API_KEY) {
  console.warn('Warning: BREVO_API_KEY not set. Email sending will fail until you set it.');
}

// Use Brevo email or fallback to your old Gmail user var
const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER; 
const senderName = process.env.BREVO_SENDER_NAME || 'Orion Eduverse';

// --- This is the correct initialization logic ---
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = BREVO_API_KEY;
const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
// ------------------------------------------------

/**
 * sendOtpEmail - send an OTP email using Brevo Transactional API
 * @param {string} to - recipient email
 * @param {string} otp - OTP string
 */
export const sendOtpEmail = async (to, otp) => {
  if (!to || !otp) {
    throw new Error('Missing "to" or "otp" in sendOtpEmail');
  }

  const subject = 'Your Verification Code';
  const htmlContent = `
    <p>Your OTP for signing up is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>
  `;

  const sendSmtpEmail = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log('OTP email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending OTP email via Brevo:', error?.response?.body || error);
    throw new Error('Could not send OTP email.');
  }
};

/**
 * sendPasswordResetEmail - send password reset link using Brevo
 * @param {string} to - recipient email
 * @param {string} token - reset token
 */
export const sendPasswordResetEmail = async (to, token) => {
  if (!to || !token) {
    throw new Error('Missing "to" or "token" in sendPasswordResetEmail');
  }

  // Your original logic is preserved
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = 'Your Password Reset Link';
  const htmlContent = `
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>This link is valid for 1 hour.</p>
  `;

  const sendSmtpEmail = {
    // Use senderName for "Orion" or "Orion Eduverse" based on your .env
    sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || "Orion" }, 
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log('Password reset email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending password reset email:', error?.response?.body || error);
    throw new Error('Could not send password reset email.');
  }
};