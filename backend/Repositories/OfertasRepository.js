import { pool } from '../Data/db.js';
import { aCamelCase } from '../Utils/CamelCase.js';

const COLUMNAS = `id, empresa_id, titulo, ubicacion, modalidad, contrato, experiencia, sector,
                salario_min, salario_max, correo_contacto, descripcion, responsabilidades,
                requisitos, beneficios, estado, publicada_en, creado_en, actualizado_en`;

const valores = datos => [
    datos.titulo,
    datos.ubicacion || null,
    datos.modalidad || null,
    datos.contrato || null,
    datos.experiencia || null,
    datos.sector || null,
    datos.salarioMin ?? null,
    datos.salarioMax ?? null,
    datos.correoContacto || null,
    datos.descripcion || null,
    datos.responsabilidades || [],
    datos.requisitos || [],
    datos.beneficios || [],
];

const listarPorEmpresa = async (empresaId, estado) => {
    const query = `
            SELECT o.id, o.titulo, o.ubicacion, o.modalidad, o.contrato, o.estado, o.publicada_en, o.creado_en,
            (SELECT COUNT(*) FROM postulaciones p WHERE p.oferta_id = o.id)::int AS postulaciones
            FROM ofertas o
            WHERE o.empresa_id = $1 AND ($2::varchar IS NULL OR o.estado = $2)
            ORDER BY o.creado_en DESC`;

    const result = await pool.query(query, [empresaId, estado || null]);

    return aCamelCase(result.rows);
};

const buscarPorId = async (id, empresaId) => {
    const query = `SELECT ${COLUMNAS} FROM ofertas WHERE id = $1 AND empresa_id = $2`;

    const result = await pool.query(query, [id, empresaId]);

    return aCamelCase(result.rows[0]);
};

const crear = async (empresaId, datos) => {
    const publicadaEn = datos.estado === 'activa' ? new Date() : null;

    const query = `
            INSERT INTO ofertas (empresa_id, titulo, ubicacion, modalidad, contrato, experiencia, sector,
            salario_min, salario_max, correo_contacto, descripcion,
            responsabilidades, requisitos, beneficios, estado, publicada_en)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING ${COLUMNAS}`

    const result = await pool.query(query, [empresaId, ...valores(datos), datos.estado, publicadaEn]);

    return aCamelCase(result.rows[0]);
};

const actualizar = async (id, empresaId, datos) => {
    const query = `
        UPDATE ofertas SET titulo = $3, ubicacion = $4, modalidad = $5, contrato = $6, experiencia = $7, sector = $8,
        salario_min = $9, salario_max = $10, correo_contacto = $11, descripcion = $12,
        responsabilidades = $13, requisitos = $14, beneficios = $15
        WHERE id = $1 AND empresa_id = $2
        RETURNING ${COLUMNAS}`;

    const result = await pool.query(query, [id, empresaId, ...valores(datos)]);

    return aCamelCase(result.rows[0]);
};

const cambiarEstado = async (id, empresaId, estado) => {
    const publicadaEn = estado === 'activa' ? new Date() : null;

    const query = 
            `UPDATE ofertas SET estado = $3, publicada_en = COALESCE($4, publicada_en)
            WHERE id = $1 AND empresa_id = $2
            RETURNING ${COLUMNAS}`;

    const result = await pool.query(query, [id, empresaId, estado, publicadaEn]);

    return aCamelCase(result.rows[0]);
};

const eliminar = async (id, empresaId) => {
    const query = `DELETE FROM ofertas WHERE id = $1 AND empresa_id = $2`;
    
    await pool.query(query, [id, empresaId]);
};

export { listarPorEmpresa, buscarPorId, crear, cambiarEstado, actualizar, eliminar };