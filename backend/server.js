const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir el frontend Vanilla JS
app.use(express.static(path.join(__dirname, '../public')));

// Ruta de prueba a la base de datos
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS hora_actual, version();');
        res.json({ 
            success: true, 
            mensaje: '¡Conexión a PostgreSQL en Docker exitosa!',
            datos: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error conectando a la BD' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});