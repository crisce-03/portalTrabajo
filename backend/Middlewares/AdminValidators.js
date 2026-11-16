import { z } from 'zod';
import { ESTADOS_OFERTA } from '../Constants/ofertas.js';
import { VALORES_DECISIONES_REPORTE, VALORES_TIPOS_REGISTRO_ADMIN } from '../Constants/administracion.js';
import { esquemaId } from './Validators.js';

export const estadoUsuarioAdminSchema = z.object({ activo: z.boolean() });
export const estadoEmpresaAdminSchema = z.object({ activo: z.boolean().optional(), verificada: z.boolean().optional() })
    .refine(datos => datos.activo !== undefined || datos.verificada !== undefined, 'Debes indicar el estado que quieres cambiar');
export const estadoOfertaAdminSchema = z.object({ estado: z.enum(Object.values(ESTADOS_OFERTA)) });
export const decisionReporteAdminSchema = z.object({ decision: z.enum(VALORES_DECISIONES_REPORTE) });
export const tipoRegistroAdminSchema = z.enum(VALORES_TIPOS_REGISTRO_ADMIN);
export const registroAdminParamsSchema = z.object({ tipo: tipoRegistroAdminSchema, id: esquemaId });
export const idAdminParamsSchema = z.object({ id: esquemaId });
