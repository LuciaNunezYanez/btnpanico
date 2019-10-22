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
        if (!usuario.sala) {
            return callback({
                ok: false,
                mensaje: 'La sala es necesaria'
            });
        }
        // EL USUARIO SE UNE A UNA SALA
        cliente.join(usuario.sala);
        console.log("(loginNIT) Usuario " + usuario.usuario + " conectado a la sala " + usuario.sala + ": ");
        // AGREGA EL USUARIO A LA LISTA DE PERSONAS CONECTADAS 
        var misUsuarios = usuarios.agregarPersona(cliente.id, usuario.usuario, usuario.nombre, usuario.apePat, usuario.apeMat, usuario.tipo, usuario.depend, usuario.sexo, usuario.sala);
        // console.log('GET PESONAS POR SALA: ', usuarios.getPersonasPorSala(usuario.sala));
        cliente.broadcast.to(usuario.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuario.sala));
        callback(usuarios.getPersonasPorSala(usuario.sala));
    });
    // ========================================
    // CLIENTE DESCONECTADO (NIT y comercios)
    // ========================================
    cliente.on('disconnect', function () {
        // let usuarioBorrado = usuarios.borrarPersona ( cliente.id );
        // if(usuarioBorrado === undefined){
        //     console.log('No se elimino nadie ');
        // } else {
        //     cliente.broadcast.to(usuarioBorrado.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuarioBorrado.sala));
        // }
        // const personaBorrada = usuarios.borrarPersona( cliente.id );
        // EMITE SOLO A SU SALA LA NUEVA LISTA DE LOS USUARIOS CONECTADOS
        // cliente.broadcast.to(personaBorrada.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(personaBorrada.sala));
        console.log('<--- CLIENTE DESCONECTADO -- ');
    });
    // ==================================
    // ON CONNECT DE LOS USUARIOS BOTON DE PANICO 
    // ==================================
    cliente.on('botonActivado', function (comercio) {
        var DATA_COMERCIO = comercio;
        // Se recibe el codigo de comercio para traer los datos de la BASE DE DATOS
        // Despues de traerlos se emiten a ANGULAR
        console.log("Nueva alerta de p\u00E1nico del comercio: " + DATA_COMERCIO);
        cliente.emit('alertaRecibida', 'Se ha recibido tu alerta');
        // Se debe enviar la alerta a todos los clientes de ANGULAR
        cliente.broadcast.to('NIT').emit('nuevaAlerta', DATA_COMERCIO);
    });
    cliente.on('datosComercio', function (comercio) {
        // Se recibe el codigo del comercio
        // Se genera alerta en el dashboard 
    });
    cliente.on('fotografias', Object);
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
