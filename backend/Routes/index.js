import { Router } from 'express';

import healthRoutes from '../Routes/HealthRoutes.js';
import authRoutes from '../Routes/AuthRoutes.js';
import empresaRoutes from './EmpresaRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use(authRoutes);
router.use('/empresa', empresaRoutes);

export default router;