import { Router } from 'express';
import * as valoracionController from '../Controllers/ValoracionController.js';
import { autenticar, permitirRoles } from '../Middlewares/Auth.js';
import { ROLES } from '../Constants/roles.js';

const router = Router();

router.get('/', valoracionController.getEmpresas);
router.post('/', autenticar, permitirRoles(ROLES.CANDIDATO), valoracionController.save);
router.post('/:id/reportes', autenticar, valoracionController.report);

export default router;
