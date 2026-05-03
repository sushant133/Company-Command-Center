import dotenv from 'dotenv'

dotenv.config()

const required = ['MONGODB_URI', 'JWT_SECRET']

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

// SECURITY: Validate JWT_SECRET strength (minimum 32 chars, not default)
if (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('your-super-secure')) {
  throw new Error('JWT_SECRET must be >=32 chars and not default. Run: openssl rand -hex 32')
}

// Production security checks
if (process.env.NODE_ENV === 'production') {
  if (!process.env.CLIENT_URL || !process.env.CLIENT_URL.startsWith('https://')) {
    throw new Error('Production CLIENT_URL must be HTTPS')
  }
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Production SMTP config required for OTP emails')
  }
}

/**
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
export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',  // SECURITY: Short-lived access tokens
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  // SMTP Configuration for sending OTP emails
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@commandcenter.com',
}
