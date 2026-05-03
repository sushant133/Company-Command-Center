import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

/**
 * Create a transporter using Gmail SMTP.
 *
 * Gmail SMTP Setup Instructions:
 * 1. Go to https://myaccount.google.com/security
 * 2. Enable 2-Factor Authentication (required for App Passwords)
 * 3. Go to https://myaccount.google.com/apppasswords
 * 4. Select "Mail" as the app and "Other (Custom name)" as the device
 * 5. Name it something like "Multi-Company Command Center"
 * 6. Click "Generate" and copy the 16-character App Password
 * 7. Paste that App Password as SMTP_PASS in your .env file (no spaces)
 * 8. Use your full Gmail address as SMTP_USER
 *
 * NOTE: Do NOT use your regular Gmail password. Use the App Password only.
 */
const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465, // true for 465, false for other ports like 587
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
})

/**
 * Send OTP email to user for password reset
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name (optional)
 */
export const sendOTPEmail = async (to, otp, name = '') => {
  const recipientName = name || to.split('@')[0]

  const mailOptions = {
    from: `"Multi-Company Command Center" <${env.smtpFrom}>`,
    to,
    subject: 'Your Password Reset OTP Code',
    text: `Hello ${recipientName},\n\nYour password reset OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nMulti-Company Command Center Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Multi-Company Command Center</h1>
        </div>
        <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello <strong>${recipientName}</strong>,</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Use the OTP code below to proceed:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 40px; border-radius: 12px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">This code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">If you did not request a password reset, please ignore this email or contact your administrator.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Multi-Company Command Center &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    `,
  }

  const info = await transporter.sendMail(mailOptions)
  return info
}

/**
 * Verify SMTP connection is working
 */
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email service is ready to send messages')
    return true
  } catch (error) {
    console.error('❌ Email service connection failed:', error.message)
    return false
  }
}

