import mongoose from 'mongoose'

const smartAlertSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['deadline', 'budget', 'performance', 'risk', 'milestone', 'compliance', 'system'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
      default: 'active',
    },
    // Reference to the entity that triggered the alert
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetModel',
    },
    targetModel: {
      type: String,
      enum: ['Project', 'Task', 'Approval', 'Company'],
    },
    targetName: {
      type: String,
    },
    // Alert conditions and thresholds
    conditions: {
      metric: {
        type: String,
        enum: ['deadline', 'budget_utilization', 'task_overdue', 'project_delay', 'approval_pending', 'performance_drop'],
      },
      threshold: {
        type: mongoose.Schema.Types.Mixed, // Can be number, date, or string
      },
      operator: {
        type: String,
        enum: ['gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'contains', 'before', 'after'],
      },
      currentValue: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    // Recipients
    recipients: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['owner', 'admin', 'manager', 'user'],
      },
      notifiedAt: {
        type: Date,
      },
      acknowledgedAt: {
        type: Date,
      },
    }],
    // Auto-resolution settings
    autoResolve: {
      enabled: {
        type: Boolean,
        default: false,
      },
      condition: {
        type: String,
      },
      resolveAfter: {
        type: Number, // hours
        default: 24,
      },
    },
    // Escalation rules
    escalation: {
      enabled: {
        type: Boolean,
        default: false,
      },
      escalateAfter: {
        type: Number, // hours
        default: 48,
      },
      escalateTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      escalatedAt: {
        type: Date,
      },
    },
    // Metadata
    source: {
      type: String,
      enum: ['system', 'manual', 'integration'],
      default: 'system',
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  { timestamps: true }
)

// Indexes for performance
smartAlertSchema.index({ companyId: 1, status: 1, severity: -1 })
smartAlertSchema.index({ companyId: 1, type: 1 })
smartAlertSchema.index({ 'recipients.userId': 1, status: 1 })
smartAlertSchema.index({ createdAt: -1 })

export default mongoose.model('SmartAlert', smartAlertSchema)