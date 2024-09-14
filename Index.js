
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

// Nueva ruta para consultar el valor desde la base de datos
app.get('/RecetaSeleccionada', async (req, res) => {
    try {
        const pool = await conectarDB();  // Conectar a la base de datos
        
        if (pool) {
            const result = await pool.request()
                .query("SELECT * FROM Recetas WHERE Receta_Seleccionada = 'True'");

            if (result.recordset.length > 0) {
                const receta = result.recordset[0];  // Obtener la primera receta seleccionada
                
                const Receta_Seleccionada = receta.Receta_Seleccionada;
                const Nombre_Receta = receta.Nombre_De_Receta;

                //Ingredientes
                const TipoDeMalta = receta.Malta;
                const CantidadMalta = receta.Cant_De_Malta;
                
                //Temperaturas
                const TemperaturaHervido = receta.Temperatura_de_hervido;
                const TemperaturaMacerado = receta.Temperatura_Macerado;
                
                //Tiempos
                const TiempoMacerado = receta.Tiempo_de_macerado;  
                const TiempoClarificado = receta.Tiempo_de_clarificado; 
                
                //Otras variables
                const CantLitros = receta.Litros;

                console.log(`Receta seleccionada: ${Nombre_Receta}`);
                console.log(`Ingredientes: ${TipoDeMalta,CantidadMalta}`);
                console.log(`Temperaturas: ${TemperaturaHervido,TemperaturaMacerado}`);
                console.log(`Tiempos: ${TiempoMacerado,TiempoClarificado}`);
                console.log(`Otras variables: ${CantLitros}`);
                
                // Devolver el estado, nombre de la receta, ingredientes, temperaturas, tiempos y litros en la respuesta
                res.status(200).json({
                    Receta_Seleccionada,
                    Nombre_Receta,
                    Ingredientes: 
                    {
                        TipoDeMalta,
                        CantidadMalta, 
                    },
                    
                        TemperaturaHervido,
                        TemperaturaMacerado,
                        TiempoMacerado,
                        TiempoClarificado,
                        CantLitros
                });
            } else {
                res.status(404).json({ message: 'Esperando a que comience el proceso....' });
            }
        }
    } catch (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).send('Error al consultar la base de datos');
    }
});

// Nueva ruta para recibir el volumen acumulado del sensor
app.post('/Litros', async (req, res) => {
    const { volumen } = req.body;  // Obtener el volumen del cuerpo de la solicitud

    try {
        const pool = await conectarDB();  // Conectar a la base de datos
        
        if (pool) {
            // Inserta el valor del volumen en la base de datos
            const result = await pool.request()
                .input('Volumen', sql.Float, volumen)
                .query("INSERT INTO Recetas (Litros_Llenado) VALUES (@Volumen");

            res.status(200).json({ message: 'Volumen registrado con éxito' });
        }
    } catch (error) {
        console.error('Error al registrar el volumen:', error);
        res.status(500).send('Error al registrar el volumen');
    }
});

// Middleware para registrar solicitudes
app.use((req, res, next) => {
    console.log(`Recibiendo solicitud para: ${req.url}`);
    next();
});

// Iniciar el servidor en el puerto 3000
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API corriendo en el puerto ${PORT}`);
});
