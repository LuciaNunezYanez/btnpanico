import { Socket } from 'socket.io';

export const connectado = (cliente: Socket) => {

    console.log("CLIENTE CONECTADO");

    // E V E N T O - B O T O N - A C T I V A D O 
    cliente.on('botonActivado', function(comercio){
        const respuesta = "Se ha recibido tu alerta";
        console.log("Nueva alerta de pánico del comercio: " + comercio);                
        cliente.emit('alertaRecibida', respuesta);
    });
                
    
    cliente.on('datosComercio', function(codigoComercio){
        // Se recibe el codigo del comercio
        // Se genera alerta en el dashboard 
    });
    
    cliente.on('fotografias', Object);
        
}

    // Envia la alerta a TODOS 
    // this.io.emit('recibido', respuesta);


export const desconectar = (cliente: Socket) => {
    
    cliente.on('disconnect', () =>{
        console.log('CLIENTE DESCONECTADO');
    });
    
}