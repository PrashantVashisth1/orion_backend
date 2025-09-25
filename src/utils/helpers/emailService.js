// src/utils/emailService.js
import nodemailer from 'nodemailer';

// This function will set up and use a temporary Ethereal account
const setupEtherealTransporter = async () => {
  // Create a temporary test account
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter object using the Ethereal SMTP credentials
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // Generated Ethereal user
      pass: testAccount.pass, // Generated Ethereal password
    },
  });

  return transporter;
};

export const sendOtpEmail = async (to, otp) => {
  const transporter = await setupEtherealTransporter();

  const mailOptions = {
    from: '"Orion Testing" <no-reply@orion.com>',
    to: to,
    subject: 'Your Verification Code',
    html: `<p>Your OTP for signing up is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    // Log the URL to preview the email
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email.');
  }
};