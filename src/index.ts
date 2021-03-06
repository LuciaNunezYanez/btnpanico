import Server from './server/server';
import comercios from './router/comercio';
import reporte from './router/reporte';
import multimedia from './router/multimedia';
import imagenes from './router/multimedia/imagenes';
import audios from './router/multimedia/audios';
import usuariosNit from './router/usuarios-nit';
import alertas from './router/alertas';
import login from './router/login';
import uploads from './router/uploads';
import usuarioscomercios from './router/usuarios-comercios';
import incidentes from './router/incidentes';
import registrocomercios from './router/registro-comercios/registro-comercios';
import estados from './router/estados/estados';
import municipios from './router/estados/municipios';
import localidades from './router/estados/localidades';
import coordenadas from './router/coordenadas-app';
import codigoActivacion from './router/codigo-activacion/codigo';
import activaciones from './router/activaciones';

import bodyParser from 'body-parser';
var cors = require('cors');

const server = Server.instance;

// BodyParser
server.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
server.app.use(bodyParser.json({ limit: '50mb' }));

// CORS - Para permitir que se puedan llamar los servicios     
// server.app.use(cors ({origin: true, credentials: true})); // Se cambia por la siguiente configuración
server.app.use(cors(), (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    // Esta de prueba
    res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
    next();
});

// Rutas de servicios 
server.app.use('/comercio', comercios);
server.app.use('/reporte', reporte);
server.app.use('/multimedia', multimedia);
server.app.use('/imagenes', imagenes);
server.app.use('/audios', audios);
server.app.use('/alerta', alertas);
server.app.use('/usuarionit', usuariosNit);
server.app.use('/login', login);
server.app.use('/upload', uploads);
server.app.use('/usuariocomercio', usuarioscomercios)
server.app.use('/incidentes', incidentes);
server.app.use('/registrocomercios', registrocomercios);
server.app.use('/estados', estados);
server.app.use('/municipios', municipios);
server.app.use('/localidades', localidades);
server.app.use('/coordenadas', coordenadas);
server.app.use('/codigoactivacion', codigoActivacion);
server.app.use('/activaciones', activaciones);

// MySQL get instance 
// MySQL.instance;

server.start(() => {
    console.log(`Servidor corriendo en el puerto ${server.port}`);
});

