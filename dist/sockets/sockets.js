"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Usuarios = require('../server/classes/usuarios').Usuarios;
var usuarios = new Usuarios();
exports.CONECTADO = function (cliente) {
    console.log("-> CLIENTE CONECTADO");
    // ==================================
    // USUARIOS NIT
    // ==================================
    cliente.on('loginNIT', function (usuario, callback) {
        // console.log('=========== USUARIO NIT CONECTADO ============');
        console.log('Usuario conectado del NIT:', usuario);
        // Agregar el usuario a la lista de personas conectadas 
        if (!usuario.usuario) {
            return callback({
                error: true,
                mensaje: 'El usuario es necesario'
            });
        }
        console.log('LOS DATOS RECIBIDOS SON: ', usuario);
        var conectados = usuarios.agregarPersona(cliente.id, usuario.usuario, usuario.nombre, usuario.apePat, usuario.apeMat, usuario.tipo, usuario.depend, usuario.sexo, usuario.sala);
        callback(conectados);
    });
    // ==================================
    // USUARIOS BOTON DE PANICO 
    // ==================================
    cliente.on('botonActivado', function (codigoComercio) {
        var COD_COMERCIO = codigoComercio;
        // Se recibe el codigo de comercio para traer los datos de la BASE DE DATOS
        // Despues de traerlos se emiten a ANGULAR
        console.log("Nueva alerta de p\u00E1nico del comercio: " + COD_COMERCIO);
        cliente.emit('alertaRecibida', 'Se ha recibido tu alerta');
        // Se debe enviar la alerta a todos los clientes de ANGULAR
    });
    cliente.on('datosComercio', function (codigoComercio) {
        // Se recibe el codigo del comercio
        // Se genera alerta en el dashboard 
    });
    cliente.on('fotografias', Object);
};
// Envia la alerta a TODOS 
// this.io.emit('recibido', respuesta);
exports.DESCONECTADO = function (cliente) {
    cliente.on('disconnect', function () {
        console.log('<- CLIENTE DESCONECTADO');
    });
};
// Escuchar mensaje de tipo socket ¿De quien? 
exports.mensaje = function (cliente) {
    cliente.on('mensaje', function (payload) {
        console.log('RECIBIENDO  MENSAJE');
        console.log(payload);
    });
};
exports.alertaComercio = function (cliente) {
    cliente.on('botonActivado', function () {
    });
};
