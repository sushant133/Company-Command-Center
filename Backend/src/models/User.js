import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin'],
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    // SECURITY: Refresh token support for secure, long-lived sessions
    refreshTokenHash: {
      type: String,
      default: null,
    },
    refreshTokenExpiry: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
)

userSchema.pre('save', function validateCompanyScope(next) {
  if (this.role === 'admin' && !this.companyId) {
    return next(new Error('Admin must belong to a company'))
  }

  if (this.role === 'superadmin') {
    this.companyId = null
  }

  return next()
})

userSchema.index({ companyId: 1, role: 1 })
userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ refreshTokenHash: 1 }) // SECURITY: Fast refresh token lookups & revocation

export default mongoose.model('User', userSchema)
