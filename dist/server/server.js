"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var socket_io_1 = __importDefault(require("socket.io"));
var http_1 = __importDefault(require("http"));
var Server = /** @class */ (function () {
    function Server() {
        this.port = process.env.PORT || 3000;
        this.app = express();
        // Inicializar conf de sockets 
        this.httpServer = new http_1.default.Server(this.app);
        this.io = socket_io_1.default(this.httpServer);
        this.escucharSockets();
    }
    Object.defineProperty(Server, "instance", {
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
        this.app.use(express.static(publicPath));
        //Express HBS
        this.app.set('view engine', 'hbs');
    };
    Server.prototype.escucharSockets = function () {
        console.log('Escuchando conexiones - SOCKETS ');
        // Escuchas conexion con sockets
        this.io.on('connection', function (socket) {
            console.log('Nuevo cliente conectado a traves de sockets');
            var respuesta = "Se ha recibido tu alerta";
            // E V E N T O - B O T O N - A C T I V A D O 
            socket.on('botonActivado', function (comercio) {
                console.log("Nueva alerta de pánico del comercio: " + comercio);
                socket.emit('alertaRecibida', respuesta);
                socket.on('datosComercio', function (codigoComercio) {
                    socket.emit('alertaRecibida', "Se recibieron los datos del comercio " + codigoComercio);
                });
            });
            // Envia la alerta a TODOS 
            // this.io.emit('recibido', respuesta);
        });
    };
    Server.prototype.start = function (callback) {
        this.httpServer.listen(this.port, callback);
        this.publicFolder();
    };
    return Server;
}());
exports.default = Server;
