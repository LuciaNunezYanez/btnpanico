import Server from './server/server';
import KML from './kml/kml';

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
import registroalertagenero from './router/registro-alertagenero/registro-alertagenero';
import estados from './router/estados/estados';
import municipios from './router/estados/municipios';
import localidades from './router/estados/localidades';
import coordenadas from './router/coordenadas-app';
import codigoActivacion from './router/codigo-activacion/codigo';
import activaciones from './router/activaciones';
import direccion from './router/direccion';
import directorio from './router/directorio';
import recuperar from './router/recuperacion-email';
import datosmedicos from './router/registro-alertagenero/datos-medicos';
import contactoemerg from './router/contacto-emergencia/contacto-emergencia';
import token from './router/codigo-activacion/tokens';
import tokenapp from './router/codigo-activacion/tokens_app';
import mensajes from './router/firebase/mensajes';
import video from './router/multimedia/video';
import corporaciones from './router/corporacion/corporaciones';
import unidades from './router/unidades/unidades';
import chat from './router/chat/chat';


import bodyParser from 'body-parser';

var cors = require('cors');
// Config FB
var admin = require('firebase-admin');
// /dist/firebase/fir-storage-sdk.json
var serviceAccount = require('./firebase/fir-storage-sdk.json');

const server = Server.instance;
const kml = KML.instance;

// BodyParser
server.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
server.app.use(bodyParser.json({ limit: '50mb' }));

// CORS - Para permitir que se puedan llamar los servicios     
// server.app.use(cors ({origin: true, credentials: true})); // Se cambia por la siguiente configuración
server.app.use(cors(), (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    // res.header('Access-Control-Allow-Headers', '*');
    // Método que hace que descargue los archivos, el que sea
    // res.header('Content-Type', 'application/x-www-form-urlencoded');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    // res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
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
server.app.use('/registroalertagenero', registroalertagenero);
server.app.use('/estados', estados);
server.app.use('/municipios', municipios);
server.app.use('/localidades', localidades);
server.app.use('/coordenadas', coordenadas);
server.app.use('/codigoactivacion', codigoActivacion);
server.app.use('/activaciones', activaciones);
server.app.use('/direccion', direccion);
server.app.use('/directorio', directorio);
server.app.use('/recuperar', recuperar);
server.app.use('/datosmedicos', datosmedicos);
server.app.use('/contactoemerg', contactoemerg);
server.app.use('/token', token);
server.app.use('/tokenapp', tokenapp);
server.app.use('/mensajes', mensajes);
server.app.use('/videos', video);
server.app.use('/corporaciones', corporaciones);
server.app.use('/unidades', unidades);
server.app.use('/chat', chat);

server.start(() => {
    console.log(`Servidor corriendo en el puerto ${server.port}`);       
});

// Firebase 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://boton-panico-aa49f.firebaseio.com"
  });