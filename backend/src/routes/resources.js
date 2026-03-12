import { Router } from 'express';
import * as ctrl from '../controllers/resources.js';
import { body, param, query } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import { uploadMiddleware, handleUploadError, getMimeTypeFromFile } from '../middleware/upload.js';
const router = Router();

// Require auth for all resource routes
router.use(authRequired);

// Resources / Materials list
router.get('/', [
  query('classId').optional().isString(),
  query('type').optional().isString()
], ctrl.listResources);

// Upload file → returns URL for createResource
router.post('/upload',
  uploadMiddleware.single('file'),
  handleUploadError,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const fileType = getMimeTypeFromFile(req.file)
    res.json({
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType,
      size: req.file.size,
      mimeType: req.file.mimetype,
    })
  }
);

// Create new resource
router.post('/', [
  body('classId').isString(),
  body('title').isString().notEmpty(),
  body('fileUrl').isString(),
  body('fileType').optional().isString()
], ctrl.createResource);

// Delete resource
router.delete('/:id', [
  param('id').isString()
], ctrl.deleteResource);

export default router;
