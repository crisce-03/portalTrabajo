import { pool } from '../Data/db.js';

// shortcut: la lista ya trae las secciones completas; con muchos recursos, separar GET /api/recursos/:id
export const findPublicados = async (categoria) => {
    const result = await pool.query(`
        SELECT id, categoria, tipo, titulo, resumen, lectura, secciones, creado_en AS fecha
        FROM recursos
        WHERE publicado AND ($1::text IS NULL OR categoria = $1)
        ORDER BY creado_en DESC, id`, [categoria ?? null]);

    return result.rows;
}
