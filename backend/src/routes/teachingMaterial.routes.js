/**
 * Teaching Material Routes
 * Handles sharing teaching materials (files, links)
 */

import { Router } from 'express';
import { body, param } from 'express-validator';
import { authRequired } from '../middleware/devAuth.js';
import * as ctrl from '../controllers/teachingMaterial.controller.js';

const router = Router();
router.use(authRequired);

// ==================== MATERIAL MANAGEMENT ====================

router.get(
  '/:classId',
  param('classId').isString().trim().notEmpty(),
  ctrl.getClassMaterials
);

router.post(
  '/:classId',
  param('classId').isString().trim().notEmpty(),
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['FILE', 'LINK']).withMessage('Type must be FILE or LINK'),
  body('description').optional().isString(),
  body('fileUrl').optional().isURL(),
  body('linkUrl').optional().isURL(),
  body('fileType').optional().isString(),
  ctrl.addMaterial
);

router.patch(
  '/:materialId',
  param('materialId').isString().trim().notEmpty(),
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('fileUrl').optional().isURL(),
  body('linkUrl').optional().isURL(),
  body('fileType').optional().isString(),
  ctrl.updateMaterial
);

router.delete(
  '/:materialId',
  param('materialId').isString().trim().notEmpty(),
  ctrl.deleteMaterial
);

export default router;
