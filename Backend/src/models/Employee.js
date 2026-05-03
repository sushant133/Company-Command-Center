import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'onleave'],
      default: 'active',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    joinDate: {
      type: Date,
      required: true,
    },
    salary: {
      type: Number,
      default: 0,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    address: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

// Indexes for HR queries
employeeSchema.index({ companyId: 1, status: 1 })
employeeSchema.index({ companyId: 1, department: 1 })
employeeSchema.index({ companyId: 1, joinDate: -1 })
employeeSchema.index({ name: 'text', email: 'text', employeeId: 'text' })

export default mongoose.model('Employee', employeeSchema)

