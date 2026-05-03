import fs from 'fs'
import path from 'path'

const uploadDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

export const buildLocalFileRecord = (file) => {
  const fileName = file.originalname.replace(/\s+/g, '_')
  const filePath = file.path || path.join(uploadDir, `${Date.now()}-${fileName}`)
  const publicPath = `/uploads/${path.basename(filePath)}`

  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storageUrl: publicPath,
    publicId: null,
  }
}
