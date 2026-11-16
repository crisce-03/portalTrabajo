import { z } from 'zod';
import { MODALIDADES, CONTRATOS, EXPERIENCIAS, SECTORES } from '../Constants/ofertas.js';
import { textoObligatorio, textoOpcional } from './Validators.js';

const lista = z.preprocess(
    (valor) => typeof valor === 'string' ? valor.split('\n').map((linea) => linea.trim()).filter(Boolean) : valor,
    z.array(z.string().trim().min(1).max(300, 'Cada elemento de la lista es demasiado largo'), 'Debe ser una lista de textos')
        .max(20, 'La lista no puede tener más de 20 elementos')
        .optional()
);

const campos = {
    titulo: textoObligatorio('El título es obligatorio', 150),
    ubicacion: textoOpcional(150),
    modalidad: z.enum(MODALIDADES, 'La modalidad no es válida').optional(),
    contrato: z.enum(CONTRATOS, 'El tipo de contrato no es válido').optional(),
    experiencia: z.enum(EXPERIENCIAS, 'El nivel de experiencia no es válido').optional(),
    sector: z.enum(SECTORES, 'El sector no es válido').optional(),
    salarioMin: z.number('El salario mínimo debe ser un número').min(0, 'El salario no puede ser negativo').optional(),
    salarioMax: z.number('El salario máximo debe ser un número').min(0, 'El salario no puede ser negativo').optional(),
    correoContacto: z.string().trim().toLowerCase().email('El correo de contacto no es válido').optional(),
    descripcion: textoOpcional(5000),
    responsabilidades: lista,
    requisitos: lista,
    beneficios: lista,
};

const salarioCoherente = (datos) => datos.salarioMin === undefined || datos.salarioMax === undefined || datos.salarioMax >= datos.salarioMin;
const errorSalario = { message: 'El salario máximo no puede ser menor que el mínimo', path: ['salarioMax'] };

export const ofertaSchema = z.object(campos).refine(salarioCoherente, errorSalario);

export const crearOfertaSchema = z.object({
    ...campos,
    estado: z.enum(['borrador', 'activa'], 'El estado debe ser borrador o activa').default('borrador'),
}).refine(salarioCoherente, errorSalario);