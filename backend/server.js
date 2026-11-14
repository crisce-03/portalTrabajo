import app from './app.js';
import dotenv from 'dotenv';
import { pool } from './Data/db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});