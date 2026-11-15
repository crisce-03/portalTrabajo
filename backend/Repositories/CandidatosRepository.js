import { pool } from '../Data/db.js';

const crearPerfil = async usuarioId => {
    const query = `INSERT INTO perfiles_candidato (usuario_id) VALUES ($1)`;
    await pool.query(query, [usuarioId]);
};

export { crearPerfil };