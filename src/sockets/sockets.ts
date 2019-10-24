import { Socket } from 'socket.io';
import { callbackify } from 'util';
import MySQL from '../mysql/mysql';
const { Usuarios }  = require('../server/classes/usuarios');

const usuarios = new Usuarios();

export const CONECTADO = (cliente: Socket) => {
    console.log("-> CLIENTE CONECTADO");

    // ==================================
    // USUARIOS NIT
    // ==================================
    cliente.on('loginNIT', (usuario, callback) => {
        if(!usuario.sala) {
            return callback({
                ok: false, 
                mensaje: 'La sala es necesaria'
            });
        }
        // EL USUARIO SE UNE A UNA SALA
        cliente.join(usuario.sala);
        console.log(`(loginNIT) Usuario ${usuario.usuario} conectado a la sala ${usuario.sala}: `);

        // AGREGA EL USUARIO A LA LISTA DE PERSONAS CONECTADAS 
        let misUsuarios = usuarios.agregarPersona(
                        cliente.id, 
                        usuario.usuario, 
                        usuario.nombre, 
                        usuario.apePat, 
                        usuario.apeMat, 
                        usuario.tipo, 
                        usuario.depend,
                        usuario.sexo,
                        usuario.sala);
        // console.log('GET PESONAS POR SALA: ', usuarios.getPersonasPorSala(usuario.sala));
        cliente.broadcast.to(usuario.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuario.sala));
        callback(usuarios.getPersonasPorSala(usuario.sala));
    });

    // ========================================
    // CLIENTE DESCONECTADO (NIT y comercios)
    // ========================================
    cliente.on('disconnect', () =>{
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
    // USUARIOS BOTON DE PANICO 
    // ==================================
    cliente.on('botonActivado', function(comercio){ // Suponiendo que es un objeto
        const DATA_COMERCIO = comercio;
        console.log(`Nueva alerta de pánico del comercio: ${DATA_COMERCIO.codigo}`);               
        
        // Información del comercio
        const codComercio = DATA_COMERCIO.codigo;

        const query = `CALL getComercioID(${codComercio});`;
        let dataComercio: any;
        MySQL.ejecutarQuery(query, (err: any, data: any[][]) => {
            if(err) {
                console.log('Ocurrió un error al traer datos del comercio: ', err);
            } else {
                dataComercio = data [0][0];
                if(dataComercio === undefined){
                    console.log(`El comercio con codigo ${codComercio} no existe en la BD.`);
                } else {
                    //VARIABLES DE INCERCIÓN 
                    const nit:number = 1;
                    const cod:number = DATA_COMERCIO.codigo;
                    const usuarioo:number = DATA_COMERCIO.usuario;
                    const unidad:number = 1;
                    const fechaDoc = MySQL.instance.cnn.escape('2019-10-22');
                    const fechaAtaq = MySQL.instance.cnn.escape('2019-10-23');
                    const incidente:number = 1;
                    const emergencia = MySQL.instance.cnn.escape('Desconocida');
                    const clasificacion:number = 1;
                    const estatus:number = 1;
                    const conclusion = MySQL.instance.cnn.escape('Pendiente');
                    


                    const addReporte = `CALL addReporteRtID(${ nit },${ cod },${ usuarioo },${ unidad },${ fechaDoc },
                        ${ fechaAtaq },${ incidente },${ emergencia },${ clasificacion },${ estatus },${ conclusion }, @last_id);`;

                        //DATA_COMERCIO.fhAtaque
                    MySQL.ejecutarQuery(addReporte, (err: any, id:any[][]) => {
                        if(err){
                            console.log('Ocurrió un error al agregar un reporte: ', err);
                        } else { // Se retornan los datos del reporte
                            console.log(`Se agrego el reporte ${id[0][0].last_id}`);
                            cliente.emit('alertaRecibida', 'Se ha recibido tu alerta');
                            // Se debe enviar la alerta a todos los clientes de ANGULAR
                            // DATA REPORTE en vez de DATA_COMERCIO
                            cliente.broadcast.to('NIT').emit('nuevaAlerta', DATA_COMERCIO);
                        }
                    });
                }
                // console.log('La información del comercio es: ', data[0][0]);
            }

        })
        
        
        
        
    });

    cliente.on('datosComercio', function(comercio){
        // Se recibe el codigo del comercio
        // Se genera alerta en el dashboard 
    });
    
    cliente.on('fotografias', Object);
}

// Escuchar mensaje de tipo socket ¿De quien? 
export const mensaje = (cliente: Socket) => {
    cliente.on('mensaje', (payload) => {
        console.log('RECIBIENDO  MENSAJE');
        console.log(payload);
    });
}
