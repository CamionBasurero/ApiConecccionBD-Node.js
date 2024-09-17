
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql'); // Asegúrate de que estás usando 'mssql'
const moment = require('moment');

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
                const TiempoMacerado = moment(receta.Tiempo_de_macerado).format('HH:mm:ss');
                const TiempoClarificado = moment(receta.Tiempo_de_clarificado).format('HH:mm:ss');
                
                //Otras variables
                const CantLitros = receta.Litros;
                const EstadoHervido = receta.Estado_Hervido;
                const EstadoMacerado = receta.Estado_Macerado;

                console.log(`Receta seleccionada: ${Nombre_Receta}`);
                console.log(`Ingredientes: ${TipoDeMalta,CantidadMalta}`);
                console.log(`Temperaturas: ${TemperaturaHervido,TemperaturaMacerado}`);
                console.log(`Tiempos: ${TiempoMacerado,TiempoClarificado}`);
                console.log(`Otras variables: ${CantLitros,EstadoHervido,EstadoMacerado}`);
                
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
                        CantLitros,
                        EstadoHervido,
                        EstadoMacerado
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

app.post('/ActualizarReceta', async (req, res) => {
    const { NombreReceta, volumen, temperaturaHervidoReal, temperaturaMaceradoReal, tiempoMaceradoTranscurrido, tiempoClarificadoTranscurrido,E_Hervido = false, E_Macerado = false } = req.body;

    try {
        const pool = await conectarDB();  // Conectar a la base de datos
        
        if (pool) {
            let query = "UPDATE Recetas SET ";
            let params = [];

            // Agregar parámetros dinámicamente si están presentes
            if (volumen !== undefined && volumen !== null) {
                console.log(`Recibido volumen: ${volumen}`);
                query += "Litros_Llenado = @Volumen, ";
                params.push({ name: 'Volumen', value: volumen, type: sql.Float });
            }

            if (temperaturaHervidoReal !== undefined && temperaturaHervidoReal !== null) {
                console.log(`Recibido temperaturaHervidoReal: ${temperaturaHervidoReal}`);
                query += "Temp_Hervido_Real = @TemperaturaHervido, ";
                params.push({ name: 'TemperaturaHervido', value: temperaturaHervidoReal, type: sql.Float });
            }

            if (temperaturaMaceradoReal !== undefined && temperaturaMaceradoReal !== null) {
                console.log(`Recibido temperaturaMaceradoReal: ${temperaturaMaceradoReal}`);
                query += "Temp_Macerado_Real = @TemperaturaMacerado, ";
                params.push({ name: 'TemperaturaMacerado', value: temperaturaMaceradoReal, type: sql.Float });
            }

            if (tiempoMaceradoTranscurrido !== '00:00:00' && tiempoMaceradoTranscurrido !== null) {
                console.log(`Recibido tiempoMaceradoTranscurrido: ${tiempoMaceradoTranscurrido}`);
                query += "Tiempo_Macerado_Transcurrido = @TiempoMacerado, ";
                params.push({ name: 'TiempoMacerado', value: tiempoMaceradoTranscurrido, type: sql.VarChar });
            }

            if (tiempoClarificadoTranscurrido !== '00:00:00' && tiempoClarificadoTranscurrido !== null) {
                console.log(`Recibido tiempoClarificadoTranscurrido: ${tiempoClarificadoTranscurrido}`);
                query += "Tiempo_Recirculado_Transcurrido = @TiempoClarificado, ";
                params.push({ name: 'TiempoClarificado', value: tiempoClarificadoTranscurrido, type: sql.VarChar });
            }

            if (E_Hervido !== undefined && E_Hervido !== null) {
                console.log(`Estado hervido: ${E_Hervido}`);
                query += "Estado_Hervido = @E_Hervido, ";
                params.push({ name: 'E_Hervido', value: E_Hervido ? 1 : 0, type: sql.Bit });  // Convertir bool a bit
            }

            if (E_Macerado !== undefined ) {
                console.log(`Recibido E_Macerado: ${E_Macerado}`);
                query += "Estado_Macerado = @E_Macerado, ";
                params.push({ name: 'E_Macerado', value: E_Macerado ? 1 : 0, type: sql.Bit });
            }

            // Eliminar la última coma y agregar la condición WHERE
            query = query.slice(0, -2) + " WHERE Nombre_De_Receta = @NombreReceta";
            params.push({ name: 'NombreReceta', value: NombreReceta, type: sql.VarChar });

            // Preparar la consulta
            const request = pool.request();
            params.forEach(param => {
                request.input(param.name, param.type, param.value);
            });

            // Ejecutar la consulta
            const result = await request.query(query);

            // Verificar si se actualizó alguna fila
            if (result.rowsAffected[0] > 0) {
                res.status(200).json({ message: 'Receta actualizada con éxito' });
            } else {
                res.status(404).json({ message: 'No se encontró la receta especificada' });
            }
        }
    } catch (error) {
        console.error('Error al actualizar la receta:', error);
        res.status(500).send('Error al actualizar la receta');
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

