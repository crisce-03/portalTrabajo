import { Router } from 'express';

import healthRoutes from '../Routes/HealthRoutes.js';
import authRoutes from '../Routes/AuthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/', authRoutes);

export default router;