"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("../mysql/mysql"));
var obtenerAlertasPendientes = require('../mysql/mysql-alertas.nit').obtenerAlertasPendientes;
var verificaToken = require('../server/middlewares/autenticacion').verificaToken;
var Usuarios = require('../server/classes/usuarios').Usuarios;
var Alertas = require('../server/classes/alertas').Alertas;
var jwt = require('jsonwebtoken');
var usuarios = new Usuarios();
var alertas = new Alertas();
exports.CONECTADO = function (cliente) {
    console.log("-> CLIENTE CONECTADO - DESCONOCIDO");
    // ==================================
    // USUARIOS NIT
    // ==================================
    cliente.on('loginNIT', function (usuario, callback) {
        // Des-encriptar usuario para agregarlo a donde corresponde
        if (!usuario || usuario === undefined) {
            return callback({
                ok: false,
                err: {
                    message: 'Usuario inválido'
                }
            });
        }
        var token = usuario.token;
        var sala = usuario.sala;
        var SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
        var usuario_desenc;
        jwt.verify(token, SEED, function (err, decoded) {
            if (err) {
                return callback({
                    ok: false,
                    err: {
                        message: 'Token invalido'
                    }
                });
            }
            // INFORMACIÓN DECODIFICADA DEL USUARIO
            usuario_desenc = decoded.usuario;
        });
        if (!sala || sala === undefined) {
            return callback({
                ok: false,
                mensaje: 'La sala es necesaria'
            });
        }
        if (!usuario_desenc || usuario_desenc === undefined) {
            return callback({
                ok: false,
                mensaje: 'Token invalido'
            });
        }
        // EL USUARIO SE UNE A UNA SALA
        cliente.join(sala);
        console.log("(loginNIT) Usuario " + usuario_desenc.usuario + " conectado a la sala " + sala + ": ");
        // AGREGA EL USUARIO A LA LISTA DE PERSONAS CONECTADAS 
        var usuariosNITConectados = usuarios.agregarUsuario(cliente.id, usuario_desenc.id_usuario, usuario_desenc.usuario, sala, usuario_desenc.nombres, usuario_desenc.apellPat, usuario_desenc.apellMat, usuario_desenc.tipo, usuario_desenc.depend, usuario_desenc.sexo, usuario_desenc.estatus);
        // SE NOTIFICA NUEVO CLIENTE EN LA SALA NIT
        cliente.broadcast.to(usuario.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuario.sala));
        callback(usuarios.getPersonasPorSala(usuario.sala));
        obtenerAlertasPendientes(function (err, alertas) {
            if (err) {
                // Deberia de mostrar una pantalla de alerta
                console.log(err);
            }
            else {
                cliente.emit('alertasActualizadas', alertas);
            }
        });
    });
    // ========================================
    // CLIENTE DESCONECTADO
    // ========================================
    cliente.on('disconnect', function () {
        var usuarioEliminado = usuarios.borrarPersona(cliente.id);
        if (usuarioEliminado === undefined) {
            console.log('S<- CLIENTE DESCONECTADO - COMERCIO INACTIVO');
        }
        else {
            if (usuarioEliminado.sala === 'NIT') {
                console.log('<- CLIENTE DESCONECTADO - NIT');
            }
            else if (usuarioEliminado.sala === 'Comercios') {
                console.log('<- CLIENTE DESCONECTADO - COMERCIO ACTIVO');
            }
        }
    });
    // ========================================
    // ALERTAS COMERCIOS
    // ========================================
    cliente.on('botonActivado', function (comercio) {
        var idComercio = comercio.idComercio, idUsuario = comercio.idUsuario, sala = comercio.sala, fecha = comercio.fecha;
        console.log("-> Nueva alerta de p\u00E1nico del comercio: " + idComercio);
        // AGREGAR USUARIO COMERCIO A LA SALA COMERCIOS 
        usuarios.agregarUsuario(cliente.id, idUsuario, idComercio, sala);
        // UNIR EL USUARIO A LA SALA 
        cliente.join(sala);
        agregarReporte(cliente, idComercio, idUsuario, fecha);
    });
};
exports.MULTIMEDIA = function (cliente) {
    console.log("-> ARCHIVO MULTIMEDIA RECIBIDO");
    cliente.on('imagenEnviada', function (data, callback) {
        cliente.broadcast.to('NIT').emit('imagenNueva', usuarios.usuarios.getPersonasPorSala('NIT'));
    });
};
function agregarReporte(cliente, idComercio, idUsuario, fecha) {
    // Recibir datos p t reporte
    var idUserCc = 1; // 1 = Sin atender
    var idComercReporte = idComercio;
    var idUserApp = idUsuario;
    var idUnidad = 1; // 1 = Ninguna unidad
    var fhDoc = mysql_1.default.instance.cnn.escape(obtenerFechaHoy());
    var fhAtaque = mysql_1.default.instance.cnn.escape(fecha);
    var tipoInc = 0; // 0 = Desconocido
    var descripEmerg = mysql_1.default.instance.cnn.escape('');
    var clasifEmerg = 0; // 0 = Normal
    var estatusActual = 0; // 0 = Sin atender
    var cierreConcl = mysql_1.default.instance.cnn.escape('');
    var query = "CALL addReporteRtID(\n        " + idUserCc + ",\n        " + idComercReporte + ",\n        " + idUserApp + ",\n        " + idUnidad + ",\n        " + fhDoc + ",\n        " + fhAtaque + ",\n        " + tipoInc + ",\n        " + descripEmerg + ",\n        " + clasifEmerg + ",\n        " + estatusActual + ",\n        " + cierreConcl + ",\n        @last_id);";
    mysql_1.default.ejecutarQuery(query, function (err, id) {
        if (err) {
            console.log('No se pudo agregar reporte: ', err);
            // Emitir a cliente android que NO se pudo agregar el reporte 
            cliente.emit('alertaNoRecibida', '0');
        }
        else {
            // Se retornan los datos del reporte
            var reporteAgregado = id[0][0].last_id;
            var alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercio, idUsuario, 1, 0);
            obtenerAlertasPendientes(function (err, alertas) {
                if (err) {
                    console.log(err);
                }
                else {
                    cliente.broadcast.to('NIT').emit('alertasActualizadas', alertas);
                }
            });
            console.log("Se cre\u00F3 el reporte " + reporteAgregado + " <==============");
            // Emitir a cliente android que la alerta se recibio con el # del reporte 
            cliente.emit('alertaRecibida', "" + reporteAgregado);
        }
    });
}
function obtenerFechaHoy() {
    var fh = new Date();
    var dia = fh.getDate();
    var mes = fh.getMonth() + 1;
    var anio = fh.getFullYear();
    var hora = fh.getHours();
    var min = fh.getMinutes();
    var seg = fh.getSeconds();
    var fechaCompleta = anio + "-" + mes + "-" + dia + " " + hora + ":" + min + ":" + seg;
    return fechaCompleta;
}
