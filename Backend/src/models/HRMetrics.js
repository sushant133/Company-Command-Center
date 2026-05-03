import mongoose from 'mongoose'

const hrMetricsSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // Attendance metrics
    attendance: {
      totalEmployees: {
        type: Number,
        default: 0,
      },
      presentToday: {
        type: Number,
        default: 0,
      },
      absentToday: {
        type: Number,
        default: 0,
      },
      lateToday: {
        type: Number,
        default: 0,
      },
      attendanceRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    // Hiring pipeline
    hiring: {
      openPositions: {
        type: Number,
        default: 0,
      },
      applicationsReceived: {
        type: Number,
        default: 0,
      },
      interviewsScheduled: {
        type: Number,
        default: 0,
      },
      offersExtended: {
        type: Number,
        default: 0,
      },
      offersAccepted: {
        type: Number,
        default: 0,
      },
      timeToHire: {
        type: Number, // days
        default: 0,
      },
    },
    // Team performance
    performance: {
      averageProductivity: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      taskCompletionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      teamSatisfaction: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      turnoverRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    // Department breakdown
    departments: [{
      name: {
        type: String,
        required: true,
      },
      employeeCount: {
        type: Number,
        default: 0,
      },
      attendanceRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      productivity: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    }],
  },
  { timestamps: true }
)

// Indexes for performance
hrMetricsSchema.index({ companyId: 1, date: -1 })
hrMetricsSchema.index({ companyId: 1, 'attendance.attendanceRate': -1 })

export default mongoose.model('HRMetrics', hrMetricsSchema)