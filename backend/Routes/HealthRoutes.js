import { Router } from 'express';
import * as healthController from '../Controllers/HealthController.js';

const router = Router();

router.get('/', healthController.check);

export default router;