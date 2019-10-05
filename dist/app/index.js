"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("../server/server"));
var comercio_1 = __importDefault(require("../router/comercio"));
var reporte_1 = __importDefault(require("../router/reporte"));
var multimedia_1 = __importDefault(require("../router/multimedia"));
var nota_1 = __importDefault(require("../router/nota"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var server = server_1.default.instance;
// BodyParser
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
server.app.use(body_parser_1.default.json());
// CORS - Para permitir que se puedan llamar los servicios     
server.app.use(cors_1.default({ origin: true, credentials: true }));
// Rutas de servicios 
server.app.use('/comercio', comercio_1.default);
server.app.use('/reporte', reporte_1.default);
server.app.use('/multimedia', multimedia_1.default);
server.app.use('/nota', nota_1.default);
// MySQL get instance 
// MySQL.instance;
server.start(function () {
    console.log('Servidor corriendo en el puerto 3000');
});
