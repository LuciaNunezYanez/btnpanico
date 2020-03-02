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
var _a = require('../mysql/mysql-alertas.nit'), obtenerAlertasPendientes = _a.obtenerAlertasPendientes, abrirPeticion = _a.abrirPeticion, cerrarPeticion = _a.cerrarPeticion;
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
    Server.prototype.emitirNuevaImagen = function (id_rep, data) {
        this.io.emit("nuevaImagen" + id_rep, data);
    };
    Server.prototype.emitirNuevoAudio = function (id_rep, data) {
        this.io.emit("nuevoAudio" + id_rep, data);
    };
    Server.prototype.emitirGeolocalizacion = function (id_rep, data) {
        this.io.emit("nuevaGeolocalizacion" + id_rep, data);
    };
    Server.prototype.emitirAlertasActualizadas = function (alertas, sala) {
        this.io.to(sala).emit('alertasActualizadas', alertas);
        // this.io.emit(`alertasActualizadas`, alertas)
    };
    Server.prototype.emitirListaBotonazos = function (id_rep, data) {
        this.io.emit("listaBotonazos" + id_rep, data);
    };
    // public emitirNuevoBotonazo(id_reporte: number, data: Object){
    //     this.io.emit(`nuevoBotonazo${id_reporte}`, data);
    // }
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
                // Debe tener:
                // id_reporte
                // id_user_cc
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
                                return callback(null, {
                                    ok: true,
                                    resp: 'Petición abierta con éxito.'
                                });
                            }
                        });
                    }
                });
            });
            cliente.on('alertaCerrada', function (data, callback) {
                //   Debe tener:
                // id_reporte
                // estatus_actual
                // tipo_incid
                // descrip_emerg
                // cierre_conclusion
                // num_unidad
                // TOKEN (VALIDAR EL # DEL USUARIO)
                if (!data.id_reporte || !Number.isInteger(data.id_reporte)) {
                    return callback({
                        ok: false,
                        resp: 'El folio del reporte es inválido.'
                    });
                }
                else if (!data.token) {
                    return callback({
                        ok: false,
                        resp: 'El token es inválido, por favor inicie sesión.'
                    });
                }
                cerrarPeticion(data, function (err, resp) {
                    if (err) {
                        // Deberia de mostrar una pantalla de alerta de error al cerrar petición 
                        return callback({
                            ok: false,
                            resp: err
                        });
                    }
                    else {
                        console.log('XD');
                        console.log(resp);
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
                                return callback(null, {
                                    ok: true,
                                    resp: 'Petición cerrada con éxito.'
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
