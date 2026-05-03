import mongoose from 'mongoose'

const taxDeductionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null, // null = company-level deduction
    },
    financialYear: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true, // 80C, 80D, 80G, HRA, LTA, etc.
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    proofUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

taxDeductionSchema.index({ companyId: 1, financialYear: 1 })
taxDeductionSchema.index({ companyId: 1, employeeId: 1 })

export default mongoose.model('TaxDeduction', taxDeductionSchema)

