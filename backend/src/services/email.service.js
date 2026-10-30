const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER || 'dummy_user',
        pass: process.env.SMTP_PASS || 'dummy_pass',
      },
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Multischool ID System'}" <${process.env.FROM_EMAIL || 'noreply@multischool.com'}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error sending email to ${to}: ${error.message}`);
      throw new Error('Email could not be sent');
    }
  }

  async sendVerificationEmail(email, name, token) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const message = `
      <h1>Welcome to Multischool ID Card System, ${name}!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If the button doesn't work, copy and paste this link into your browser: <br/> ${verifyUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `;
    return this.sendEmail(email, 'Verify Your Email Address', message);
  }

  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>Hello ${name},</p>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 15 minutes.</p>
    `;
    return this.sendEmail(email, 'Password Reset Instruction', message);
  }
}

module.exports = new EmailService();
