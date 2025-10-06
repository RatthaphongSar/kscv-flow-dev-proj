import { Router } from 'express';
import * as ctrl from '../controllers/organization.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Organization info tree (faculty/majors/years/sections)
router.get('/', [
  // no validators yet
], ctrl.orgInfo);

export default router;
