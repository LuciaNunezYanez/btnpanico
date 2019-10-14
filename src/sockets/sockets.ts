import { Socket } from 'socket.io';

export const CONECTADO = (cliente: Socket) => {

    console.log("CLIENTE CONECTADO");

    // USUARIO CONECTADO DEL NIT 
    cliente.on('personaLogeada', (usuario) => {
        console.log('Usuario conectado del NIT:', usuario);
    })



    // E V E N T O - B O T O N - A C T I V A D O 
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
        console.log('CLIENTE DESCONECTADO');
    });
    
}

// Escuchar mensaje de tipo sockeT
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