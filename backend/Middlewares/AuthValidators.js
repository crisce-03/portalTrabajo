import { z } from "zod";
import { ROLES, TIPOS_REGISTRO } from '../Constants/roles.js';

const nombre = z.string('El nombre es obligatorio')
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo');

const apellidos = z.string('Los apellidos son obligatorios')
    .trim()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(100, 'Los apellidos son demasiado largos');

const correo = z.string('El correo es obligatorio')
    .trim()
    .toLowerCase()
    .email('El correo no es válido');

const clave = z.string('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar los 72 caracteres');

export const registroSchema = z.object({
    tipo: z.enum(TIPOS_REGISTRO, 'El tipo de cuenta debe ser candidato o empresa'),
    nombre,
    apellidos,
    correo,
    clave,
    telefono: z.string().trim().max(30, 'El teléfono es demasiado largo').optional(),
    empresa: z.string().trim().max(150, 'El nombre de la empresa es demasiado largo').optional(),
    sector: z.string().trim().max(100, 'El sector es demasiado largo').optional(),
}).refine((datos) => datos.tipo !== ROLES.EMPRESA || (datos.empresa && datos.sector), {
    message: 'El nombre de la empresa y el sector son obligatorios',
    path: ['empresa'],
});

export const loginSchema = z.object({
    correo,
    clave: z.string('La contraseña es obligatoria').min(1, 'La contraseña es obligatoria'),
});
