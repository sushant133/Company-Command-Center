import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    budget: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
    timeline: {
      start: Date,
      end: Date,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    health: {
      type: String,
      enum: ['green', 'amber', 'red'],
      default: 'green',
    },
    followUp: {
      type: String,
      trim: true,
    },
    nextActionBy: {
      type: String,
      enum: ['today', 'this-week', 'this-month', 'next-month'],
      default: 'this-week',
    },
    blockers: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
)

// Indexes for performance
projectSchema.index({ companyId: 1, status: 1 })
projectSchema.index({ ownerId: 1 })
projectSchema.index({ health: 1 })
projectSchema.index({ nextActionBy: 1 })

export default mongoose.model('Project', projectSchema)