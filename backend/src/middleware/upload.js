// backend/src/middleware/upload.js
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ===== Allowed MIME types =====
const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  // Documents
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
}

// ===== Size limits (bytes) =====
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// ===== Setup upload directory =====
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// ===== Storage configuration =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Format: timestamp_roomId_sanitizedname_random
    const timestamp = Date.now()
    const roomId = req.params.roomId || 'unknown'
    const ext = path.extname(file.originalname)
    // Sanitize filename: remove special chars and limit length
    const sanitizedName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace non-ASCII with underscore
      .slice(0, 50) // Limit to 50 chars
    const filename = `${timestamp}_${roomId}_${sanitizedName}_${Math.random().toString(36).slice(2, 9)}${ext}`
    cb(null, filename)
  }
})

// ===== File filter =====
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    const err = new Error(`File type not allowed: ${file.mimetype}`)
    err.code = 'INVALID_FILE_TYPE'
    return cb(err, false)
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const err = new Error(`File too large: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB > 10MB)`)
    err.code = 'FILE_TOO_LARGE'
    return cb(err, false)
  }

  cb(null, true)
}

// ===== Multer instance =====
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // max 10 files per request
  }
})

// ===== Custom error handler =====
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ error: 'File too large (max 10MB)' })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files (max 10)' })
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds limit' })
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` })
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: err.message })
  }

  if (err.code === 'FILE_TOO_LARGE') {
    return res.status(400).json({ error: err.message })
  }

  if (err) {
    console.error('[Upload] Error:', err.message)
    return res.status(400).json({ error: 'Upload failed' })
  }

  next()
}

// ===== Helper to get MIME type from extension =====
export function getMimeTypeFromFile(file) {
  const mimeType = file.mimetype
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
  if (mimeType === 'text/plain') return 'text'
  return 'document'
}

// ===== Helper to get file type icon =====
export function getFileTypeIcon(mimeType) {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️'
  if (mimeType === 'text/plain') return '📋'
  return '📎'
}
