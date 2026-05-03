import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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
    location: {
      type: String,
      trim: true,
      default: 'Remote',
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'paused', 'draft'],
      default: 'open',
    },
    description: {
      type: String,
      trim: true,
    },
    requirements: [{
      type: String,
      trim: true,
    }],
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    applicants: {
      type: Number,
      default: 0,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    closingDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

jobSchema.index({ companyId: 1, status: 1 })
jobSchema.index({ companyId: 1, department: 1 })
jobSchema.index({ postedDate: -1 })

export default mongoose.model('Job', jobSchema)

