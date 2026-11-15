import { Router } from 'express';
import * as candidatoController from '../Controllers/CandidatoController.js';
import { autenticar, requiereRol } from '../Middlewares/Auth.js';
import uploadCv from '../Middlewares/UploadCv.js';
import { ROLES } from '../Constants/roles.js';

const router = Router();

router.use(autenticar, requiereRol(ROLES.CANDIDATO));

router.get('/', candidatoController.getPerfil);
router.put('/', uploadCv, candidatoController.updatePerfil);
router.get('/alertas', candidatoController.getAlertas);
router.post('/alertas', candidatoController.createAlerta);
router.patch('/alertas/:id', candidatoController.updateAlerta);

export default router;
