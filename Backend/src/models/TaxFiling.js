import mongoose from 'mongoose'

const taxFilingSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    filingType: {
      type: String,
      enum: ['GST', 'IncomeTax', 'TDS', 'AdvanceTax', 'ProfessionalTax'],
      required: true,
    },
    period: {
      type: String,
      required: true, // e.g., 'Q1-2024', 'FY2024-25', 'Apr-2024'
    },
    dueDate: {
      type: Date,
      required: true,
    },
    filedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Filed', 'Overdue'],
      default: 'Pending',
    },
    amount: {
      type: Number,
      default: 0,
    },
    challanNumber: {
      type: String,
      trim: true,
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

taxFilingSchema.index({ companyId: 1, status: 1 })
taxFilingSchema.index({ companyId: 1, dueDate: 1 })
taxFilingSchema.index({ companyId: 1, filingType: 1 })

export default mongoose.model('TaxFiling', taxFilingSchema)

