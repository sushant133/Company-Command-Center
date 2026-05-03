import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: String,
    size: Number,
    storageUrl: {
      type: String,
      required: true,
    },
    publicId: String,
  },
  { timestamps: true }
)

export default mongoose.model('File', fileSchema)
