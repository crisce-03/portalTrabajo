import { Router } from 'express';
import * as authController from '../Controllers/AuthController.js';
import { autenticar } from '../Middlewares/Auth.js';
import { validar } from '../Middlewares/Validators.js';
import { registroSchema, loginSchema } from '../Middlewares/AuthValidators.js';

const router = Router();

router.post('/registro', validar(registroSchema), authController.registro);
router.post('/login', validar(loginSchema), authController.login);
router.get('/me', autenticar, authController.me);

export default router;