const express = require('express');
const bodyParser = require('body-parser');
const conectarDB = require('./DB-Config');



const app = express();
app.use(bodyParser.json());

app.get('/data', async (req, res) => {
    app.listen();
    try {
        const pool = await conectarDB();
        const result = await pool.request().query('SELECT Nom_Usuario FROM Usuarios');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const cors = require('cors');
app.use(cors());

app.use((req, res, next) => {
    console.log(`Recibiendo solicitud para: ${req.url}`);
    next();
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(3000, '0.0.0.0', () => {
    console.log('API corriendo en el puerto 3001');
});

