"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var socket_io_1 = __importDefault(require("socket.io"));
var http_1 = __importDefault(require("http"));
var socket = __importStar(require("../sockets/sockets"));
var _a = require('../mysql/mysql-alertas.nit'), obtenerAlertasPendientes = _a.obtenerAlertasPendientes, abrirPeticion = _a.abrirPeticion;
var Server = /** @class */ (function () {
    function Server() {
        this.port = process.env.PORT || 3000;
        this.app = express();
        // Inicializar configuración de sockets 
        this.httpServer = new http_1.default.Server(this.app);
        this.io = socket_io_1.default(this.httpServer);
        this.escucharSockets();
    }
    Object.defineProperty(Server, "instance", {
        // Evita la declaración de varias instancias 
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    Server.init = function () {
        return new Server();
    };
    Server.prototype.publicFolder = function () {
        var publicPath = path.resolve(__dirname, '../public');
        var publicPathArchivos = path.resolve(__dirname, '../public/archivos');
        this.app.use(express.static(publicPath));
        this.app.use(express.static(publicPathArchivos));
        //Express HBS
        this.app.set('view engine', 'hbs');
    };
    Server.prototype.escucharSockets = function () {
        var _this = this;
        console.log('Escuchando conexiones - SOCKETS ');
        // Escuchar conexion con sockets
        this.io.on('connection', function (cliente) {
            // Escuchar cuando un cliente se conecto
            socket.CONECTADO(cliente);
            // Escuchar si tengo una alerta abierta 
            // ( Moverla a un archivo donde no estorbe. ) 
            cliente.on('alertaAbierta', function (data, callback) {
                if (!data.id_reporte || !Number.isInteger(data.id_reporte)) {
                    return callback({
                        ok: false,
                        resp: 'El folio del reporte es inválido.'
                    });
                }
                else if (!data.id_user_cc || !Number.isInteger(data.id_user_cc)) {
                    return callback({
                        ok: false,
                        resp: 'El usuario es inválido.'
                    });
                }
                abrirPeticion(data, function (err, resp) {
                    if (err) {
                        // Deberia de mostrar una pantalla de alerta de error al abrir petición 
                        return callback({
                            ok: false,
                            resp: err
                        });
                    }
                    else {
                        // Mandar lista actualizada a todos los usuarios 
                        obtenerAlertasPendientes(function (err, alertas) {
                            if (err) {
                                // Deberia de mostrar una pantalla de alerta de error al traer la nueva lista
                                return callback({
                                    ok: false,
                                    resp: err
                                });
                            }
                            else {
                                _this.io.emit('alertasActualizadas', alertas);
                                callback(null, {
                                    ok: true,
                                    resp: 'Petición abierta con éxito.'
                                });
                            }
                        });
                    }
                });
            });
        });
    };
    Server.prototype.start = function (callback) {
        this.httpServer.listen(this.port, callback);
        this.publicFolder();
    };
    return Server;
}());
exports.default = Server;
