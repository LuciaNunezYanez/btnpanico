"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var obtenerAlertasPendientes = require('../mysql/mysql-alertas.nit').obtenerAlertasPendientes;
var Usuarios = require('../server/classes/usuarios').Usuarios;
var Alertas = require('../server/classes/alertas').Alertas;
var jwt = require('jsonwebtoken');
var usuarios = new Usuarios();
var alertas = new Alertas();
exports.CONECTADO = function (cliente) {
    console.log("-> CLIENTE CONECTADO");
    // ==================================
    // USUARIOS NIT
    // ==================================
    cliente.on('loginNIT', function (usuario, callback) {
        console.log('loginNIT');
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
        console.log('* La sala: ' + sala);
        // console.log(`(loginNIT) Usuario ${usuario_desenc.usuario} conectado a la sala ${sala}: `);
        // AGREGA EL USUARIO A LA LISTA DE PERSONAS CONECTADAS 
        var usuariosNITConectados = usuarios.agregarUsuario(cliente.id, usuario_desenc.id_usuario, usuario_desenc.usuario, sala, usuario_desenc.nombres, usuario_desenc.apellPat, usuario_desenc.apellMat, usuario_desenc.tipo, usuario_desenc.depend, usuario_desenc.sexo, usuario_desenc.estatus);
        // SE NOTIFICA NUEVO CLIENTE EN LA SALA NIT (No util)
        cliente.broadcast.to(usuario.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuario.sala));
        callback(usuarios.getPersonasPorSala(usuario.sala));
        // primer parametro es object {idEstacion y sala}
        obtenerAlertasPendientes({ sala: sala, estacion: usuario.idEstacion }, function (err, alertas) {
            if (err) {
                // Deberia de mostrar una pantalla de alerta
                console.log(err);
            }
            else {
                cliente.emit('alertasActualizadas' + usuario.idEstacion, alertas);
            }
        });
    });
    // ========================================
    // CLIENTE DESCONECTADO
    // ========================================
    cliente.on('disconnect', function () {
        var usuarioEliminado = usuarios.borrarPersona(cliente.id);
        console.log('<- CLIENTE DESCONECTADO');
    });
};
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
