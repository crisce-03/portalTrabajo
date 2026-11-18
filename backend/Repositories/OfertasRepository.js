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
            (SELECT COUNT(*) FROM postulaciones p WHERE p.oferta_id = o.id) AS postulaciones
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

const buscarPublicas = async filtros => {
    const query = `
        SELECT o.id, o.titulo, o.ubicacion, o.modalidad, o.contrato, o.experiencia, o.sector,
               o.salario_min, o.salario_max, o.descripcion, o.publicada_en,
               e.nombre AS empresa, e.verificada
        FROM ofertas o JOIN empresas e ON e.id = o.empresa_id
        JOIN usuarios dueno ON dueno.id = e.usuario_id AND dueno.activo = TRUE
        WHERE o.estado = 'activa'
          AND ($1 = '' OR o.titulo ILIKE '%' || $1 || '%' OR e.nombre ILIKE '%' || $1 || '%'
               OR COALESCE(o.sector, '') ILIKE '%' || $1 || '%' OR COALESCE(o.descripcion, '') ILIKE '%' || $1 || '%'
               OR array_to_string(o.requisitos, ' ') ILIKE '%' || $1 || '%'
               OR array_to_string(o.responsabilidades, ' ') ILIKE '%' || $1 || '%')
          AND ($2 = '' OR COALESCE(o.ubicacion, '') ILIKE '%' || $2 || '%')
          AND (cardinality($3::text[]) = 0 OR o.experiencia = ANY($3))
          AND (cardinality($4::text[]) = 0 OR o.sector = ANY($4))
          AND (cardinality($5::text[]) = 0 OR o.contrato = ANY($5))
          AND (cardinality($6::text[]) = 0 OR o.modalidad = ANY($6))
          AND ($7::numeric IS NULL OR COALESCE(o.salario_max, o.salario_min, 0) >= $7)
        ORDER BY CASE WHEN $8 = 'salario' THEN o.salario_max END DESC NULLS LAST,
                 o.publicada_en DESC NULLS LAST, o.id DESC
        LIMIT $9`;
    const result = await pool.query(query, [
        filtros.q, filtros.ubicacion, filtros.experiencia, filtros.sector,
        filtros.contrato, filtros.modalidad, filtros.salario, filtros.orden, filtros.limite,
    ]);
    return aCamelCase(result.rows);
};

const buscarPublicaPorId = async id => {
    const query = `
        SELECT o.id, o.titulo, o.ubicacion, o.modalidad, o.contrato, o.experiencia, o.sector,
               o.salario_min, o.salario_max, o.correo_contacto, o.descripcion, o.responsabilidades,
               o.requisitos, o.beneficios, o.publicada_en, o.estado,
               e.id AS empresa_id, e.nombre AS empresa, e.sector AS empresa_sector,
               e.correo_contacto AS empresa_contacto, e.telefono AS empresa_telefono,
               e.ubicacion AS empresa_ubicacion, e.sitio_web, e.acerca, e.verificada,
               COALESCE((SELECT AVG(v.calificacion)::numeric(3,1) FROM valoraciones v WHERE v.empresa_id = e.id), 0) AS promedio,
               (SELECT COUNT(*) FROM valoraciones v WHERE v.empresa_id = e.id) AS opiniones,
               COALESCE((SELECT json_agg(json_build_object(
                   'autor', COALESCE(u.cargo, 'Candidato'), 'calificacion', v.calificacion, 'texto', v.comentario
               ) ORDER BY v.creado_en DESC) FROM valoraciones v JOIN usuarios u ON u.id = v.usuario_id
                 WHERE v.empresa_id = e.id), '[]'::json) AS resenas
        FROM ofertas o JOIN empresas e ON e.id = o.empresa_id
        JOIN usuarios dueno ON dueno.id = e.usuario_id AND dueno.activo = TRUE
        WHERE o.id = $1 AND o.estado = 'activa'`;
    const result = await pool.query(query, [id]);
    return aCamelCase(result.rows[0]);
};

export { listarPorEmpresa, buscarPorId, crear, cambiarEstado, actualizar, eliminar, buscarPublicas, buscarPublicaPorId };
