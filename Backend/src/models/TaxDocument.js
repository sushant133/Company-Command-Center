import mongoose from 'mongoose'

const taxDocumentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    financialYear: {
      type: String,
      required: true,
    },
    docType: {
      type: String,
      enum: ['Form16', 'Form16A', 'Form26AS', 'ITR', 'GSTReturn', 'TDSReturn', 'Other'],
      default: 'Other',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    storageUrl: {
      type: String,
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

taxDocumentSchema.index({ companyId: 1, financialYear: 1 })
taxDocumentSchema.index({ companyId: 1, docType: 1 })

export default mongoose.model('TaxDocument', taxDocumentSchema)

