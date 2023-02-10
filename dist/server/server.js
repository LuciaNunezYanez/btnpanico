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
        this.port = process.env.PORT || 8888;
        this.app = express();
        this.hostname = process.env.HOST || '10.11.127.70';
        // '10.11.118.91'
        // this.hostname = 'localhost'
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
    // Emite a quién tenga el reporte
    Server.prototype.emitirNuevaImagen = function (id_rep, data) {
        this.io.emit("nuevaImagen" + id_rep, data);
    };
    // Emite a quién tenga el reporte
    Server.prototype.emitirNuevoAudio = function (id_rep, data) {
        this.io.emit("nuevoAudio" + id_rep, data);
    };
    // Emite a quién tenga el reporte
    Server.prototype.emitirNuevoVideo = function (id_rep, data) {
        // console.log('Emitiré un nuevo video.');
        this.io.emit("nuevoVideo" + id_rep, data);
    };
    // Emite a quién tenga el reporte
    Server.prototype.emitirGeolocalizacion = function (id_rep, data) {
        this.io.emit("nuevaGeolocalizacion" + id_rep, data);
    };
    // Emite a la estación correspondiente, filtrada por sala. 
    Server.prototype.emitirAlertasActualizadas = function (estacion, alertas, sala) {
        this.io.to(sala).emit('alertasActualizadas' + estacion, alertas);
    };
    // Emite a quién tenga el reporte
    Server.prototype.emitirAlertaCancelada = function (id_rep, data) {
        this.io.emit("alertaCancelada" + id_rep, data);
    };
    // Emite a quién tenga el reporte
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
        // // const publicPathArchivos = path.resolve(__dirname, '../public/archivos');
        this.app.use(express.static(publicPath));
        // // this.app.use( express.static( publicPathArchivos ));
        // //Express HBS
        // this.app.set('view engine', 'hbs');
    };
    Server.prototype.escucharSockets = function () {
        var _this = this;
        console.log('Escuchando conexiones - SOCKETS ');
        // Escuchar conexion con sockets
        this.io.on('connection', function (cliente) {
            // Escuchar cuando un cliente se conecto
            socket.CONECTADO(cliente);
            // Escuchar si tengo una alerta abierta 
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
                // console.log('ANTES DE ABRIR PETICION');
                // console.log(data);
                abrirPeticion(data, function (err, dataResp) {
                    // console.log('ABRIR PETICION - SERVER');
                    // console.log(dataResp.respuesta[0][0]);
                    if (err) {
                        // Deberia de mostrar una pantalla de alerta de error al abrir petición 
                        return callback({
                            CD: 1,
                            ok: false,
                            resp: err
                        });
                    }
                    else {
                        // Mandar lista actualizada a todos los usuarios 
                        // primer parametro es object {estacion y sala}
                        obtenerAlertasPendientes({ sala: dataResp.respuesta[0][0].sala, estacion: data.idEstacion }, function (err, alertas) {
                            if (err) {
                                // Deberia de mostrar una pantalla de alerta de error al traer la nueva lista
                                return callback({
                                    CD: 2,
                                    ok: false,
                                    resp: err
                                });
                            }
                            else {
                                _this.emitirAlertasActualizadas(data.idEstacion, alertas, dataResp.respuesta[0][0].sala);
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
                /* Puede cerrar alertas con estatus 0 y estatus 3 (Sin modificarlo) */
                //   Debe tener:
                // id_reporte
                // estatus_actual
                // tipo_incid
                // descrip_emerg
                // cierre_conclusion
                // num_unidad
                // token (VALIDAR EL # DEL USUARIO)
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
                cerrarPeticion(data, function (err, dataResp) {
                    if (err) {
                        // Deberia de mostrar una pantalla de alerta de error al cerrar petición 
                        return callback({
                            ok: false,
                            resp: err
                        });
                    }
                    else {
                        // primer parametro es object {estacion y sala}
                        obtenerAlertasPendientes({ sala: dataResp.resultado[0][0].sala, estacion: dataResp.resultado[0][0].estacion }, function (err, alertas) {
                            if (err) {
                                // Deberia de mostrar una pantalla de alerta de error al traer la nueva lista
                                return callback({
                                    ok: false,
                                    resp: err
                                });
                            }
                            else {
                                _this.emitirAlertasActualizadas(Number.parseInt(dataResp.resultado[0][0].estacion), alertas, dataResp.resultado[0][0].sala);
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
