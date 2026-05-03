import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    fileIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
      },
    ],
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'needs_update'],
      default: 'submitted',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

submissionSchema.index({ companyId: 1, taskId: 1 })
submissionSchema.index({ companyId: 1, submittedAt: -1 })
submissionSchema.index({ status: 1 })

export default mongoose.model('Submission', submissionSchema)
