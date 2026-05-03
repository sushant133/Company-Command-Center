import mongoose from 'mongoose'

const financialMetricsSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    // Revenue metrics
    revenue: {
      total: {
        type: Number,
        default: 0,
      },
      recurring: {
        type: Number,
        default: 0,
      },
      oneTime: {
        type: Number,
        default: 0,
      },
      projected: {
        type: Number,
        default: 0,
      },
      growth: {
        type: Number, // percentage
        default: 0,
      },
    },
    // Expense metrics
    expenses: {
      total: {
        type: Number,
        default: 0,
      },
      operational: {
        type: Number,
        default: 0,
      },
      capital: {
        type: Number,
        default: 0,
      },
      personnel: {
        type: Number,
        default: 0,
      },
      marketing: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
    },
    // Budget tracking
    budget: {
      allocated: {
        type: Number,
        default: 0,
      },
      spent: {
        type: Number,
        default: 0,
      },
      remaining: {
        type: Number,
        default: 0,
      },
      utilization: {
        type: Number, // percentage
        min: 0,
        max: 100,
        default: 0,
      },
    },
    // Profitability
    profitability: {
      grossProfit: {
        type: Number,
        default: 0,
      },
      netProfit: {
        type: Number,
        default: 0,
      },
      profitMargin: {
        type: Number, // percentage
        default: 0,
      },
      ebitda: {
        type: Number,
        default: 0,
      },
    },
    // Cash flow
    cashFlow: {
      operating: {
        type: Number,
        default: 0,
      },
      investing: {
        type: Number,
        default: 0,
      },
      financing: {
        type: Number,
        default: 0,
      },
      netCashFlow: {
        type: Number,
        default: 0,
      },
    },
    // Key ratios
    ratios: {
      currentRatio: {
        type: Number,
        default: 0,
      },
      quickRatio: {
        type: Number,
        default: 0,
      },
      debtToEquity: {
        type: Number,
        default: 0,
      },
      returnOnAssets: {
        type: Number,
        default: 0,
      },
      returnOnEquity: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
)

// Indexes for performance
financialMetricsSchema.index({ companyId: 1, period: 1, startDate: -1 })
financialMetricsSchema.index({ companyId: 1, 'budget.utilization': -1 })

export default mongoose.model('FinancialMetrics', financialMetricsSchema)