import { z } from 'zod';
import { TAMANOS_EMPRESA } from '../Constants/empresas.js';
import { textoObligatorio, textoOpcional } from './Validators.js';

export const empresaSchema = z.object({
    nombre: textoObligatorio('El nombre de la empresa es obligatorio', 150),
    sector: textoObligatorio('El sector es obligatorio', 100),
    tamano: z.enum(TAMANOS_EMPRESA, 'El tamaño de la empresa no es válido').optional(),
    correoContacto: z.string('El correo de contacto es obligatorio').trim().toLowerCase().email('El correo de contacto no es válido'),
    telefono: textoOpcional(30),
    ubicacion: textoObligatorio('La ubicación es obligatoria', 150),
    sitioWeb: z.string().trim().url('El sitio web debe ser una dirección válida (https://...)').max(200).optional(),
    acerca: textoObligatorio('La descripción de la empresa es obligatoria', 3000),
});