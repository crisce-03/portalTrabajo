import { pool } from '../Data/db.js';

export const pingDatabase = async () => {
    const result = await pool.query('SELECT NOW() AS hora_actual, version() AS version');
    
    return result.rows[0];
}