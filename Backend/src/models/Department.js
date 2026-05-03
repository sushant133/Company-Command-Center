import mongoose from 'mongoose'

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    code: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    budget: {
      type: Number,
      default: 0,
    },
    employeeCount: {
      type: Number,
      default: 0,
    },
    location: {
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

departmentSchema.index({ companyId: 1, name: 1 }, { unique: true })
departmentSchema.index({ companyId: 1, isActive: 1 })

export default mongoose.model('Department', departmentSchema)

