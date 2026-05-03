import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    questioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      trim: true,
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    answeredAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'request-changes'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const approvalSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'NPR',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'under-review'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['budget', 'expense', 'contract', 'hire', 'other'],
      default: 'expense',
    },
    questions: [questionSchema],
    reviews: [reviewSchema],
    approvalComments: {
      type: String,
      trim: true,
    },
    fileIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
    }],
    approvedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
)

// Indexes for performance
approvalSchema.index({ companyId: 1, status: 1 })
approvalSchema.index({ requestedBy: 1 })
approvalSchema.index({ approvedBy: 1 })
approvalSchema.index({ urgency: 1 })

export default mongoose.model('Approval', approvalSchema)