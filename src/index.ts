import Server from './server/server';
import comercios from './router/comercio';
import reporte from './router/reporte';
import multimedia from './router/multimedia';
import notas from './router/nota';

import alertas from './router/alertas';

import bodyParser from 'body-parser';
import cors from 'cors';

const server = Server.instance;

// BodyParser
server.app.use(bodyParser.urlencoded({ extended: true}));
server.app.use(bodyParser.json());

// CORS - Para permitir que se puedan llamar los servicios     
server.app.use(cors ({origin: true, credentials: true}));


// Rutas de servicios 
server.app.use('/comercio', comercios);
server.app.use('/reporte', reporte);
server.app.use('/multimedia', multimedia);
server.app.use('/nota', notas);
server.app.use('/alertas', alertas);


// MySQL get instance 
// MySQL.instance;

server.start(() => {
    console.log(`Servidor corriendo en el puerto ${server.port}`);
});

