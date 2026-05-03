import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

// TTL index: MongoDB will automatically delete documents after expiresAt is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('OTP', otpSchema)

