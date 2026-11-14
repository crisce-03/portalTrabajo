import { Router } from 'express';
import healthRoutes from '../Routes/HealthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);

export default router;