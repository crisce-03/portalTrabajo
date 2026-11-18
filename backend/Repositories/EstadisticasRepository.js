import { pool } from '../Data/db.js';

export const obtenerResumenPublico = async () => {
    const result = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM usuarios) AS usuarios,
            (SELECT COUNT(*) FROM empresas) AS empresas,
            (SELECT COUNT(*) FROM ofertas o JOIN empresas e ON e.id = o.empresa_id
             JOIN usuarios u ON u.id = e.usuario_id WHERE o.estado = 'activa' AND u.activo = TRUE) AS ofertas,
            (SELECT COUNT(*) FROM postulaciones
             WHERE creado_en >= date_trunc('month', NOW()) AND creado_en < date_trunc('month', NOW()) + INTERVAL '1 month') AS postulaciones_mes`);
    return result.rows[0];
};
