import fs from 'fs'
import path from 'path'
import multer from 'multer'

const uploadDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const sanitizedName = file.originalname.replace(/\s+/g, '_')
    cb(null, `${Date.now()}-${sanitizedName}`)
  },
})

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv', 'text/plain'
];

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // SECURITY: Reduced to 5MB
  },
  fileFilter: (req, file, cb) => {
    // SECURITY: Restrict file types
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`), false)
    }
  },
})

/*
SECURITY NOTES:
1. Production: Use cloud storage (AWS S3, Cloudinary) with server-side scanning
2. Add ClamAV or VirusTotal API for production virus scanning
3. Current limits: 5MB max, office/docs/images only
4. Filenames auto-sanitized with timestamp
*/
