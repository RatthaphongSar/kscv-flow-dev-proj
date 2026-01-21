import { Router } from 'express';
import * as ctrl from '../controllers/community.js';
const router = Router();

// Communities by Year & Major
router.get('/', [
  // no validators yet
], ctrl.listCommunities);

export default router;
