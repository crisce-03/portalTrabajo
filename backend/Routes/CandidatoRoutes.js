import { Router } from 'express';
import * as candidatoController from '../Controllers/CandidatoController.js';
import { autenticar, permitirRoles } from '../Middlewares/Auth.js';
import uploadCv from '../Middlewares/UploadCv.js';
import { ROLES } from '../Constants/roles.js';
import * as postulacionesController from '../Controllers/PostulacionesController.js';
import { validar, validarParametros } from '../Middlewares/Validators.js';
import {
    alertaCandidatoSchema,
    estadoAlertaCandidatoSchema,
    perfilCandidatoSchema,
    idAlertaCandidatoParamsSchema,
    ofertaGuardadaParamsSchema,
} from '../Middlewares/CandidatoValidators.js';
import { idPostulacionParamsSchema, crearPostulacionRequestSchema } from '../Middlewares/PostulacionesValidators.js';

const router = Router();

router.use(autenticar, permitirRoles(ROLES.CANDIDATO));

router.get('/', candidatoController.getPerfil);
router.put('/', uploadCv, validar(perfilCandidatoSchema), candidatoController.updatePerfil);
router.get('/alertas', candidatoController.getAlertas);
router.post('/alertas', validar(alertaCandidatoSchema), candidatoController.createAlerta);
router.patch('/alertas/:id', validarParametros(idAlertaCandidatoParamsSchema), validar(estadoAlertaCandidatoSchema), candidatoController.updateAlerta);
router.get('/guardadas', candidatoController.getGuardadas);
router.put('/guardadas/:ofertaId', validarParametros(ofertaGuardadaParamsSchema), candidatoController.saveGuardada);
router.delete('/guardadas/:ofertaId', validarParametros(ofertaGuardadaParamsSchema), candidatoController.removeGuardada);
router.get('/postulaciones', postulacionesController.listarCandidato);
router.post('/postulaciones', uploadCv, validar(crearPostulacionRequestSchema), postulacionesController.crear);
router.put('/postulaciones/:id/cv', uploadCv, validarParametros(idPostulacionParamsSchema), postulacionesController.actualizarCvCandidato);

export default router;
