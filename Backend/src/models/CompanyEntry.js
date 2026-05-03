import mongoose from 'mongoose'

const companyEntrySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    entryType: {
      type: String,
      enum: ['project', 'task', 'approval', 'hr_metric', 'financial_metric', 'comment'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Entry data - flexible schema for different entry types
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Status and workflow
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'rejected', 'published'],
      default: 'draft',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      trim: true,
    },
    // Validation and requirements
    requiredFields: [{
      fieldName: {
        type: String,
        required: true,
      },
      fieldType: {
        type: String,
        enum: ['string', 'number', 'date', 'boolean', 'array', 'object'],
        required: true,
      },
      required: {
        type: Boolean,
        default: true,
      },
      validation: {
        type: mongoose.Schema.Types.Mixed,
      },
    }],
    // Attachments and references
    attachments: [{
      fileName: {
        type: String,
        required: true,
      },
      fileUrl: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // Related entities
    relatedEntities: [{
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      entityType: {
        type: String,
        enum: ['Project', 'Task', 'Approval', 'User'],
        required: true,
      },
      entityName: {
        type: String,
        required: true,
      },
    }],
    // Priority and urgency
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    // Audit trail
    history: [{
      action: {
        type: String,
        enum: ['created', 'updated', 'submitted', 'approved', 'rejected', 'published'],
        required: true,
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      performedAt: {
        type: Date,
        default: Date.now,
      },
      changes: {
        type: mongoose.Schema.Types.Mixed,
      },
      notes: {
        type: String,
      },
    }],
  },
  { timestamps: true }
)

// Indexes for performance
companyEntrySchema.index({ companyId: 1, entryType: 1, status: 1 })
companyEntrySchema.index({ submittedBy: 1, status: 1 })
companyEntrySchema.index({ reviewedBy: 1 })
companyEntrySchema.index({ dueDate: 1, status: 1 })

export default mongoose.model('CompanyEntry', companyEntrySchema)