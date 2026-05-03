import mongoose from 'mongoose'

const tdsRecordSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    financialYear: {
      type: String,
      required: true, // e.g., '2024-25'
    },
    month: {
      type: String,
      required: true, // e.g., '2024-04'
    },
    salary: {
      type: Number,
      default: 0,
    },
    tdsAmount: {
      type: Number,
      default: 0,
    },
    regime: {
      type: String,
      enum: ['old', 'new'],
      default: 'new',
    },
    // Section-wise breakdown
    deductions: {
      type: Map,
      of: Number,
      default: {},
    },
    taxableIncome: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

tdsRecordSchema.index({ companyId: 1, employeeId: 1, financialYear: 1 })
tdsRecordSchema.index({ companyId: 1, month: 1 })

export default mongoose.model('TDSRecord', tdsRecordSchema)

