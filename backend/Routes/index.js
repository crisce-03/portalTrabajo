import { Router } from 'express';
import healthRoutes from '../Routes/HealthRoutes.js';
import candidatoRoutes from '../Routes/CandidatoRoutes.js';
import valoracionRoutes from '../Routes/ValoracionRoutes.js';
import recursoRoutes from '../Routes/RecursoRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/candidatos/me', candidatoRoutes);
router.use('/valoraciones', valoracionRoutes);
router.use('/recursos', recursoRoutes);

export default router;
