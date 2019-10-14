"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONECTADO = function (cliente) {
    console.log("CLIENTE CONECTADO");
    // USUARIO CONECTADO DEL NIT 
    cliente.on('personaLogeada', function (usuario) {
        console.log('Usuario conectado del NIT:', usuario);
    });
    // E V E N T O - B O T O N - A C T I V A D O 
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
        console.log('CLIENTE DESCONECTADO');
    });
};
// Escuchar mensaje de tipo sockeT
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
