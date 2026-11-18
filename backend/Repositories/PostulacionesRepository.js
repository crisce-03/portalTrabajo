import { pool } from '../Data/db.js';
import { aCamelCase } from '../Utils/CamelCase.js';

export const crear = async ({ ofertaId, candidatoId, mensaje, cvNombre, cvRuta }) => {
    const result = await pool.query(`
        INSERT INTO postulaciones (oferta_id, candidato_id, mensaje, cv_nombre, cv_ruta)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, oferta_id, candidato_id, mensaje, cv_nombre, estado, creado_en`,
    [ofertaId, candidatoId, mensaje || null, cvNombre || null, cvRuta || null]);
    return aCamelCase(result.rows[0]);
};

export const listarPorCandidato = async candidatoId => {
    const result = await pool.query(`
        SELECT p.id, p.oferta_id, o.titulo, o.ubicacion, o.modalidad, o.contrato,
               p.estado, p.cv_nombre, (p.cv_ruta IS NOT NULL) AS tiene_cv,
               p.creado_en::date AS fecha, e.nombre AS empresa
        FROM postulaciones p
        JOIN ofertas o ON o.id = p.oferta_id
        JOIN empresas e ON e.id = o.empresa_id
        WHERE p.candidato_id = $1
        ORDER BY p.creado_en DESC`, [candidatoId]);
    return aCamelCase(result.rows);
};

export const listarPorEmpresa = async (empresaId, { ofertaId, estado, buscar }) => {
    const result = await pool.query(`
        SELECT p.id, p.oferta_id, p.candidato_id, o.titulo AS oferta,
               u.nombre, u.apellidos, u.correo, u.telefono, u.cargo,
               pc.ubicacion, p.mensaje, p.cv_nombre, (p.cv_ruta IS NOT NULL) AS tiene_cv,
               p.estado, p.creado_en::date AS fecha, p.creado_en
        FROM postulaciones p
        JOIN ofertas o ON o.id = p.oferta_id
        JOIN usuarios u ON u.id = p.candidato_id
        LEFT JOIN perfiles_candidato pc ON pc.usuario_id = u.id
        WHERE o.empresa_id = $1
          AND (CAST($2 AS INTEGER) IS NULL OR o.id = CAST($2 AS INTEGER))
          AND ($3::varchar IS NULL OR p.estado = $3)
          AND ($4 = '' OR CONCAT_WS(' ', u.nombre, u.apellidos, u.correo) ILIKE '%' || $4 || '%')
        ORDER BY p.creado_en DESC`, [empresaId, ofertaId || null, estado || null, buscar || '']);
    return aCamelCase(result.rows);
};

export const obtenerDetalleEmpresa = async (id, empresaId) => {
    const result = await pool.query(`
        SELECT p.id, p.mensaje, p.cv_nombre, p.estado, p.creado_en,
               o.id AS "ofertaId", o.titulo AS oferta, o.estado AS "estadoOferta",
               e.nombre AS empresa,
               CONCAT_WS(' ', u.nombre, u.apellidos) AS "candidatoNombre",
               u.correo, u.telefono, u.cargo,
               pc.ubicacion, pc.resumen,
               COALESCE(pc.habilidades, '{}') AS habilidades,
               COALESCE(pc.experiencia, '{}') AS experiencia,
               pc.formacion,
               (p.cv_ruta IS NOT NULL) AS "tieneCv"
        FROM postulaciones p
        JOIN ofertas o ON o.id = p.oferta_id
        JOIN empresas e ON e.id = o.empresa_id
        JOIN usuarios u ON u.id = p.candidato_id
        LEFT JOIN perfiles_candidato pc ON pc.usuario_id = u.id
        WHERE p.id = $1 AND e.id = $2`, [id, empresaId]);
    return aCamelCase(result.rows[0]);
};

export const actualizarEstado = async (id, empresaId, estado) => {
    const result = await pool.query(`
        UPDATE postulaciones p SET estado = $3
        FROM ofertas o
        WHERE p.id = $1 AND p.oferta_id = o.id AND o.empresa_id = $2
        RETURNING p.id, p.estado`, [id, empresaId, estado]);
    return aCamelCase(result.rows[0]);
};

export const buscarCvEmpresa = async (id, empresaId) => {
    const result = await pool.query(`
        SELECT p.cv_nombre, p.cv_ruta
        FROM postulaciones p JOIN ofertas o ON o.id = p.oferta_id
        WHERE p.id = $1 AND o.empresa_id = $2`, [id, empresaId]);
    return result.rows[0];
};

export const buscarOfertaActiva = async ofertaId => {
    const result = await pool.query('SELECT id FROM ofertas WHERE id = $1 AND estado = \'activa\'', [ofertaId]);
    return result.rows[0];
};

export const buscarPorCandidato = async (id, candidatoId) => {
    const result = await pool.query(`SELECT id, cv_ruta FROM postulaciones WHERE id = $1 AND candidato_id = $2`, [id, candidatoId]);
    return result.rows[0];
};

export const actualizarCv = async (id, candidatoId, cvNombre, cvRuta) => {
    const result = await pool.query(`UPDATE postulaciones SET cv_nombre = $3, cv_ruta = $4
        WHERE id = $1 AND candidato_id = $2 RETURNING id, cv_nombre`, [id, candidatoId, cvNombre, cvRuta]);
    return result.rows[0];
};
