import { Router } from 'express';
import * as ctrl from '../controllers/organization.js';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate.js';
const router = Router();

// Organization info tree (faculty/majors/years/sections)
router.get('/', [
  query('includeInactive').optional().isBoolean(),
  query('facultyId').optional().isString()
], validate, ctrl.orgInfo);

export default router;
