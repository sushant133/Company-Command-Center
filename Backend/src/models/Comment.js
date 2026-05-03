import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetModel',
    },
    targetModel: {
      type: String,
      enum: ['Project', 'Task', 'Approval', 'CompanyEntry'],
      required: true,
    },
    targetName: {
      type: String,
      required: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['sent', 'read', 'responded'],
      default: 'sent',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['instruction', 'followup', 'approval', 'general'],
      default: 'general',
    },
  },
  { timestamps: true }
)

// Indexes for performance
commentSchema.index({ companyId: 1, status: 1 })
commentSchema.index({ fromUserId: 1 })
commentSchema.index({ toUserIds: 1 })
commentSchema.index({ targetId: 1, targetModel: 1 })

export default mongoose.model('Comment', commentSchema)