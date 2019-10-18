import { Socket } from 'socket.io';
import { callbackify } from 'util';
const { Usuarios }  = require('../server/classes/usuarios');

const usuarios = new Usuarios();

export const CONECTADO = (cliente: Socket) => {

    console.log("-> CLIENTE CONECTADO");

    // ==================================
    // USUARIOS NIT
    // ==================================
    cliente.on('loginNIT', (usuario, callback) => {
        // console.log('=========== USUARIO NIT CONECTADO ============');
        console.log('Usuario conectado del NIT:', usuario);

        // Agregar el usuario a la lista de personas conectadas 
        if (!usuario.usuario){
            return callback({
                error: true, 
                mensaje: 'El usuario es necesario'
            });
        }
        
        console.log('LOS DATOS RECIBIDOS SON: ', usuario);

        let conectados = usuarios.agregarPersona(cliente.id, 
            usuario.usuario, 
            usuario.nombre, 
            usuario.apePat, 
            usuario.apeMat, 
            usuario.tipo, 
            usuario.depend,
            usuario.sexo,
            usuario.sala  
            );
        callback(conectados);
    })



    // ==================================
    // USUARIOS BOTON DE PANICO 
    // ==================================
    cliente.on('botonActivado', function(codigoComercio){
        const COD_COMERCIO = codigoComercio;
        // Se recibe el codigo de comercio para traer los datos de la BASE DE DATOS
        // Despues de traerlos se emiten a ANGULAR
        console.log(`Nueva alerta de pánico del comercio: ${COD_COMERCIO}`);               
        cliente.emit('alertaRecibida', 'Se ha recibido tu alerta');
        // Se debe enviar la alerta a todos los clientes de ANGULAR
    });

    cliente.on('datosComercio', function(codigoComercio){
        // Se recibe el codigo del comercio
        // Se genera alerta en el dashboard 
    });
    
    cliente.on('fotografias', Object);
}

    // Envia la alerta a TODOS 
    // this.io.emit('recibido', respuesta);

export const DESCONECTADO = (cliente: Socket) => {
    cliente.on('disconnect', () =>{
        console.log('<- CLIENTE DESCONECTADO');
    });
}

// Escuchar mensaje de tipo socket ¿De quien? 
export const mensaje = (cliente: Socket) => {
    cliente.on('mensaje', (payload) => {
        console.log('RECIBIENDO  MENSAJE');
        console.log(payload);
    });
}

export const alertaComercio = (cliente: Socket) =>{
    cliente.on('botonActivado', () =>{
        
    });
}