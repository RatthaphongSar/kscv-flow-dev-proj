import { Router } from 'express';
import * as ctrl from '../controllers/resources.js';
import { body, param, query } from 'express-validator';
const router = Router();

// Resources / Materials list
router.get('/', [
  // no validators yet
], ctrl.listResources);

export default router;
