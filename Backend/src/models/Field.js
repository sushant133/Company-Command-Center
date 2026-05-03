import mongoose from 'mongoose'

const fieldSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'file'],
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: [String],
    placeholder: String,
    order: {
      type: Number,
      default: 0,
    },
    validation: {
      min: Number,
      max: Number,
      pattern: String,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Field', fieldSchema)
