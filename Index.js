/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql'); // Asegúrate de que estás usando 'mssql'

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configuración de la base de datos
const DBConfig = {
    user: process.env.DB_USER || 'juanpi123_SQLLogin_1',
    password: process.env.DB_PASSWORD || 'b9x48xw44a',
    server: process.env.DB_SERVER || 'DB_PlantaDC.mssql.somee.com', 
    database: process.env.DB_DATABASE || 'DB_PlantaDC',
    options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,
    },
    port: 1433,
};

// Función para conectar a la base de datos
async function conectarDB() {
    try {
        const pool = await sql.connect(DBConfig);
        console.log('Conectado a la base de datos');
        return pool;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
}

// Endpoint para obtener datos
app.get('/data', async (req, res) => {
    try {
        const pool = await conectarDB();
        const result = await pool.request().query('SELECT Nom_Usuario FROM Usuarios');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener datos:', err);
        res.status(500).send(err.message);
    }
});

// Middleware para registrar solicitudes
app.use((req, res, next) => {
    console.log(`Recibiendo solicitud para: ${req.url}`);
    next();
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API corriendo en el puerto ${PORT}`);
});
