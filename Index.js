const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json()); // Para procesar datos en formato JSON

// Configuración de la base de datos
const dbConfig = {
    user: process.env.DB_USER || 'juanpi123_SQLLogin_1',
    password: process.env.DB_PASSWORD || 'b9x48xw44a',
    server: process.env.DB_SERVER || 'DB_PlantaDC.mssql.somee.com', 
    database: process.env.DB_DATABASE || 'DB_PlantaDC',
    options: {
        encrypt: true,                // Mantener TLS activo
        enableArithAbort: true,       // Control de errores
        trustServerCertificate: true  // Permitir certificados autofirmados
        
    },
    port: 1433,
};

// Función para conectar a la base de datos
async function conectarDB() {
    
    try {
        const pool = await sql.connect(dbConfig);
        
        console.log('Conectado a la base de datos');
        
        return pool;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error; // Propaga el error para manejo posterior
    }
}

// Nueva ruta para consultar el valor desde la base de datos
app.get('/RecetaSeleccionada', async (req, res) => {
    try {
        const pool = await conectarDB();  // Conectar a la base de datos
        
        if (pool) {
            const result = await pool.request()
                .query("SELECT * FROM Recetas WHERE Receta_Seleccionada = 'true'");

            if (result.recordset.length > 0) {
                const Receta_Seleccionada = result.recordset[0].Receta_Seleccionada;
                console.log(`Valor consultado: ${Receta_Seleccionada}`);
                
                // Devolver el valor booleano en la respuesta
                res.status(200).json({ Receta_Seleccionada });
            } else {
                res.status(404).json({ message: 'No se encontró ninguna receta seleccionada' });
            }
        }
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).send('Error al consultar la base de datos');
    }
});


// Ruta para recibir datos desde el ESP32
app.post('/updatetemperature', async (req, res) => {
    const { DatoDB } = req.body;

    if (DatoDB === undefined) {
        return res.status(400).send('DatoDB no proporcionado en la solicitud');
    }

    try {
        const pool = await conectarDB();  // Conectar a la base de datos
        if (pool) {
            const result = await pool.request()
                .input('TemperaturaMacerado', sql.Numeric, DatoDB)
                .query("UPDATE Recetas SET Temp_Macerado_Real = @TemperaturaMacerado WHERE Nombre_De_Receta = 'IPA'");
            
            console.log('Dato actualizado correctamente en la base de datos');
            res.status(200).send('Dato actualizado correctamente');
        }
    } catch (error) {
        console.error('Error al actualizar en la base de datos:', error);
        res.status(500).send('Error al actualizar en la base de datos');
    }
});

// Iniciar el servidor en el puerto 3001
const PORT = process.env.PORT || 3001;
app.listen(3001, '0.0.0.0', () => {
    console.log('API corriendo en el puerto 3001');
});




