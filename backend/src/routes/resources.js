import { Router } from 'express';
import * as ctrl from '../controllers/resources.js';
import { body, param, query } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
const router = Router();

// Require auth for all resource routes
router.use(authRequired);

// Resources / Materials list
router.get('/', [
  query('classId').optional().isString(),
  query('type').optional().isString()
], ctrl.listResources);

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
