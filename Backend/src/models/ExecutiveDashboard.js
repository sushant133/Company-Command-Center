import mongoose from 'mongoose'

const executiveDashboardSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Dashboard configuration
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Layout and widgets
    layout: {
      type: mongoose.Schema.Types.Mixed, // Grid layout configuration
    },
    widgets: [{
      id: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['kpi', 'chart', 'table', 'metric', 'alert', 'timeline'],
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        w: { type: Number, default: 4 },
        h: { type: Number, default: 3 },
      },
      config: {
        type: mongoose.Schema.Types.Mixed, // Widget-specific configuration
      },
      dataSource: {
        type: {
          type: String,
          enum: ['projects', 'tasks', 'approvals', 'hr', 'financial', 'alerts'],
        },
        filters: {
          type: mongoose.Schema.Types.Mixed,
        },
        refreshInterval: {
          type: Number, // minutes
          default: 5,
        },
      },
      permissions: {
        viewRoles: [{
          type: String,
          enum: ['owner', 'admin', 'manager', 'user'],
        }],
        editRoles: [{
          type: String,
          enum: ['owner', 'admin', 'manager'],
        }],
      },
    }],
    // KPI definitions
    kpis: [{
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      category: {
        type: String,
        enum: ['financial', 'operational', 'hr', 'project', 'quality'],
        required: true,
      },
      calculation: {
        type: mongoose.Schema.Types.Mixed, // Formula or aggregation logic
      },
      target: {
        value: { type: Number },
        operator: {
          type: String,
          enum: ['gt', 'gte', 'lt', 'lte', 'eq'],
        },
        period: {
          type: String,
          enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
        },
      },
      currentValue: {
        type: Number,
        default: 0,
      },
      trend: {
        type: String,
        enum: ['up', 'down', 'stable'],
      },
      status: {
        type: String,
        enum: ['on_track', 'at_risk', 'off_track'],
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    }],
    // Dashboard filters and settings
    filters: {
      dateRange: {
        start: { type: Date },
        end: { type: Date },
        preset: {
          type: String,
          enum: ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_quarter', 'last_quarter', 'this_year', 'last_year'],
        },
      },
      departments: [{
        type: String,
      }],
      projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      }],
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
    },
    // Access control
    accessControl: {
      viewUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      editUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      viewRoles: [{
        type: String,
        enum: ['owner', 'admin', 'manager', 'user'],
      }],
      editRoles: [{
        type: String,
        enum: ['owner', 'admin', 'manager'],
      }],
    },
    // Metadata
    tags: [{
      type: String,
      trim: true,
    }],
    version: {
      type: Number,
      default: 1,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// Indexes for performance
executiveDashboardSchema.index({ companyId: 1, userId: 1 })
executiveDashboardSchema.index({ companyId: 1, isDefault: 1 })
executiveDashboardSchema.index({ 'kpis.category': 1 })

export default mongoose.model('ExecutiveDashboard', executiveDashboardSchema)