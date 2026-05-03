import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    companyIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
      },
    ],
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'overdue'],
      default: 'active',
    },
    dueDate: Date,
    budget: {
      type: Number,
      default: 0,
    },
    budgetCurrency: {
      type: String,
      default: 'USD',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startDate: Date,
    endDate: Date,
    spent: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    blockers: {
      type: Number,
      default: 0,
    },
    followUp: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        originalName: String,
        mimeType: String,
        size: Number,
        storageUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
)

taskSchema.index({ status: 1 })
taskSchema.index({ priority: 1 })
taskSchema.index({ dueDate: 1 })
taskSchema.index({ sectionId: 1 })
taskSchema.index({ companyIds: 1, status: 1 })
taskSchema.index({ status: 1, priority: 1 })

export default mongoose.model('Task', taskSchema)
