import { Router } from 'express';
import * as candidatoController from '../Controllers/CandidatoController.js';
import { autenticar, permitirRoles } from '../Middlewares/Auth.js';
import uploadCv from '../Middlewares/UploadCv.js';
import { ROLES } from '../Constants/roles.js';
import * as postulacionesController from '../Controllers/PostulacionesController.js';

const router = Router();

router.use(autenticar, permitirRoles(ROLES.CANDIDATO));

router.get('/', candidatoController.getPerfil);
router.put('/', uploadCv, candidatoController.updatePerfil);
router.get('/alertas', candidatoController.getAlertas);
router.post('/alertas', candidatoController.createAlerta);
router.patch('/alertas/:id', candidatoController.updateAlerta);
router.get('/guardadas', candidatoController.getGuardadas);
router.put('/guardadas/:ofertaId', candidatoController.saveGuardada);
router.delete('/guardadas/:ofertaId', candidatoController.removeGuardada);
router.get('/postulaciones', postulacionesController.listarCandidato);
router.post('/postulaciones', uploadCv, postulacionesController.crear);
router.put('/postulaciones/:id/cv', uploadCv, postulacionesController.actualizarCvCandidato);

export default router;
