"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("./server/server"));
var kml_1 = __importDefault(require("./kml/kml"));
var comercio_1 = __importDefault(require("./router/comercio"));
var reporte_1 = __importDefault(require("./router/reporte"));
var multimedia_1 = __importDefault(require("./router/multimedia"));
var imagenes_1 = __importDefault(require("./router/multimedia/imagenes"));
var audios_1 = __importDefault(require("./router/multimedia/audios"));
var usuarios_nit_1 = __importDefault(require("./router/usuarios-nit"));
var alertas_1 = __importDefault(require("./router/alertas"));
var login_1 = __importDefault(require("./router/login"));
var uploads_1 = __importDefault(require("./router/uploads"));
var usuarios_comercios_1 = __importDefault(require("./router/usuarios-comercios"));
var incidentes_1 = __importDefault(require("./router/incidentes"));
var registro_comercios_1 = __importDefault(require("./router/registro-comercios/registro-comercios"));
var registro_alertagenero_1 = __importDefault(require("./router/registro-alertagenero/registro-alertagenero"));
var estados_1 = __importDefault(require("./router/estados/estados"));
var municipios_1 = __importDefault(require("./router/estados/municipios"));
var localidades_1 = __importDefault(require("./router/estados/localidades"));
var coordenadas_app_1 = __importDefault(require("./router/coordenadas-app"));
var codigo_1 = __importDefault(require("./router/codigo-activacion/codigo"));
var activaciones_1 = __importDefault(require("./router/activaciones"));
var direccion_1 = __importDefault(require("./router/direccion"));
var directorio_1 = __importDefault(require("./router/directorio"));
var recuperacion_email_1 = __importDefault(require("./router/recuperacion-email"));
var datos_medicos_1 = __importDefault(require("./router/registro-alertagenero/datos-medicos"));
var contacto_emergencia_1 = __importDefault(require("./router/contacto-emergencia/contacto-emergencia"));
var tokens_1 = __importDefault(require("./router/codigo-activacion/tokens"));
var tokens_app_1 = __importDefault(require("./router/codigo-activacion/tokens_app"));
var mensajes_1 = __importDefault(require("./router/firebase/mensajes"));
var video_1 = __importDefault(require("./router/multimedia/video"));
var corporaciones_1 = __importDefault(require("./router/corporacion/corporaciones"));
var unidades_1 = __importDefault(require("./router/unidades/unidades"));
var chat_1 = __importDefault(require("./router/chat/chat"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors = require('cors');
// Config FB
var admin = require('firebase-admin');
// /dist/firebase/fir-storage-sdk.json
var serviceAccount = require('./firebase/fir-storage-sdk.json');
var server = server_1.default.instance;
var kml = kml_1.default.instance;
// BodyParser
server.app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
server.app.use(body_parser_1.default.json({ limit: '50mb' }));
// CORS - Para permitir que se puedan llamar los servicios     
// server.app.use(cors ({origin: true, credentials: true})); // Se cambia por la siguiente configuración
server.app.use(cors(), function (req, res, next) {
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
server.app.use('/comercio', comercio_1.default);
server.app.use('/reporte', reporte_1.default);
server.app.use('/multimedia', multimedia_1.default);
server.app.use('/imagenes', imagenes_1.default);
server.app.use('/audios', audios_1.default);
server.app.use('/alerta', alertas_1.default);
server.app.use('/usuarionit', usuarios_nit_1.default);
server.app.use('/login', login_1.default);
server.app.use('/upload', uploads_1.default);
server.app.use('/usuariocomercio', usuarios_comercios_1.default);
server.app.use('/incidentes', incidentes_1.default);
server.app.use('/registrocomercios', registro_comercios_1.default);
server.app.use('/registroalertagenero', registro_alertagenero_1.default);
server.app.use('/estados', estados_1.default);
server.app.use('/municipios', municipios_1.default);
server.app.use('/localidades', localidades_1.default);
server.app.use('/coordenadas', coordenadas_app_1.default);
server.app.use('/codigoactivacion', codigo_1.default);
server.app.use('/activaciones', activaciones_1.default);
server.app.use('/direccion', direccion_1.default);
server.app.use('/directorio', directorio_1.default);
server.app.use('/recuperar', recuperacion_email_1.default);
server.app.use('/datosmedicos', datos_medicos_1.default);
server.app.use('/contactoemerg', contacto_emergencia_1.default);
server.app.use('/token', tokens_1.default);
server.app.use('/tokenapp', tokens_app_1.default);
server.app.use('/mensajes', mensajes_1.default);
server.app.use('/videos', video_1.default);
server.app.use('/corporaciones', corporaciones_1.default);
server.app.use('/unidades', unidades_1.default);
server.app.use('/chat', chat_1.default);
server.start(function () {
    console.log("Servidor corriendo en el puerto " + server.port);
});
// Firebase 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://boton-panico-aa49f.firebaseio.com"
});
