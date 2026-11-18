
export const MODALIDADES = ['Presencial', 'Híbrido', 'Remoto'];
export const CONTRATOS = ['Tiempo completo', 'Medio tiempo', 'Por proyecto', 'Pasantía'];
export const EXPERIENCIAS = ['Sin experiencia', 'Junior', 'Intermedio', 'Senior'];
export const SECTORES = ['Tecnología', 'Diseño', 'Administración y finanzas', 'Marketing', 'Otro'];

export const ESTADOS_OFERTA = Object.freeze({
    BORRADOR: 'borrador',
    ACTIVA: 'activa',
    CERRADA: 'cerrada',
});

export const ESTADOS_CREACION_OFERTA = [ESTADOS_OFERTA.BORRADOR, ESTADOS_OFERTA.ACTIVA];
export const CAMPOS_OBLIGATORIOS_OFERTA = ['ubicacion', 'modalidad', 'contrato', 'correoContacto', 'descripcion', 'requisitos'];
export const ORDENES_BUSQUEDA_OFERTAS = ['fecha', 'salario'];
