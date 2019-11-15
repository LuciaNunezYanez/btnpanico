"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("./server/server"));
var comercio_1 = __importDefault(require("./router/comercio"));
var reporte_1 = __importDefault(require("./router/reporte"));
var multimedia_1 = __importDefault(require("./router/multimedia"));
var imagenes_1 = __importDefault(require("./router/imagenes"));
var nota_1 = __importDefault(require("./router/nota"));
var usuarios_nit_1 = __importDefault(require("./router/usuarios-nit"));
var alertas_1 = __importDefault(require("./router/alertas"));
var login_1 = __importDefault(require("./router/login"));
var uploads_1 = __importDefault(require("./router/uploads"));
var usuarios_comercios_1 = __importDefault(require("./router/usuarios-comercios"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors = require('cors');
var server = server_1.default.instance;
// BodyParser
server.app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
server.app.use(body_parser_1.default.json({ limit: '50mb' }));
// CORS - Para permitir que se puedan llamar los servicios     
// server.app.use(cors ({origin: true, credentials: true})); // Se cambia por la siguiente configuración
server.app.use(cors(), function (req, res, next) {
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
server.app.use('/comercio', comercio_1.default);
server.app.use('/reporte', reporte_1.default);
server.app.use('/multimedia', multimedia_1.default);
server.app.use('/imagenes', imagenes_1.default);
server.app.use('/nota', nota_1.default);
server.app.use('/alerta', alertas_1.default);
server.app.use('/usuarionit', usuarios_nit_1.default);
server.app.use('/login', login_1.default);
server.app.use('/upload', uploads_1.default);
server.app.use('/usuariocomercio', usuarios_comercios_1.default);
// MySQL get instance 
// MySQL.instance;
server.start(function () {
    console.log("Servidor corriendo en el puerto " + server.port);
});
