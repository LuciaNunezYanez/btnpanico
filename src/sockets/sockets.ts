import { Socket } from 'socket.io';
import { callbackify } from 'util';
import MySQL from '../mysql/mysql';
const { Usuarios }  = require('../server/classes/usuarios');

const usuarios = new Usuarios();

export const CONECTADO = (cliente: Socket) => {
    console.log("-> CLIENTE CONECTADO - DESCONOCIDO");

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
        let usuariosNITConectados = usuarios.agregarUsuario(
                        cliente.id, 
                        usuario.usuario, 
                        usuario.nombre, 
                        usuario.sala,
                        usuario.apePat, 
                        usuario.apeMat, 
                        usuario.tipo, 
                        usuario.depend,
                        usuario.sexo);
        // SE NOTIFICA NUEVO CLIENTE EN LA SALA NIT
        cliente.broadcast.to(usuario.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuario.sala));
        callback(usuarios.getPersonasPorSala(usuario.sala));
    });



    // ========================================
    // CLIENTE DESCONECTADO
    // ========================================
    cliente.on('disconnect', function (){
        // let misSalas = usuarios.getPersonas();
        // console.log('Mis salas: ', misSalas);

        let usuarioEliminado = usuarios.borrarPersona( cliente.id );
        if (usuarioEliminado === undefined){ 
            console.log('S<- CLIENTE DESCONECTADO - COMERCIO INACTIVO');
        } else { 
            if(usuarioEliminado.sala === 'NIT'){
                console.log('<- CLIENTE DESCONECTADO - NIT');
            } else if(usuarioEliminado.sala === 'Comercios'){
                console.log('<- CLIENTE DESCONECTADO - COMERCIO ACTIVO');
            }
        }
    });


    // ==================================
    // USUARIOS BOTON DE PANICO 
    // ==================================
    cliente.on('botonActivado', function(comercio){ // Suponiendo que es un objeto
        const { idComercio, idUsuario, sala, fecha } = comercio;
        console.log(`Nueva alerta de pánico del comercio: ${idComercio},${idUsuario},${sala},${fecha} `);               
        
        // AGREGAR USUARIO COMERCIO A LA SALA COMERCIOS 
        usuarios.agregarUsuario(
            cliente.id, 
            idUsuario, 
            idComercio, 
            sala);

        // UNIR EL USUARIO A LA SALA 
        cliente.join(sala);

        //VARIABLES DE INSERCIÓN 
        const nit:number = 1;
        const cod:number = idComercio;
        const usuarioo:number = idUsuario;
        const unidad:number = 1;
        const fechaDoc = MySQL.instance.cnn.escape('2019-10-28 15:24:55'); // TOMAR MI FECHA Y HORA DEL SISTEMA
        const fechaAtaq = MySQL.instance.cnn.escape(fecha);
        const incidente:number = 1;
        const emergencia = MySQL.instance.cnn.escape('Desconocida');
        const clasificacion:number = 1;
        const estatus:number = 1;
        const conclusion = MySQL.instance.cnn.escape('Pendiente');

        // console.log(`CALL addReporteRtID(${ nit },${ cod },${ usuarioo },${ unidad },${ fechaDoc },
        //     ${ fechaAtaq },${ incidente },${ emergencia },${ clasificacion },${ estatus },${ conclusion }, @last_id);`);
        //     return;
        const addReporte = `CALL addReporteRtID(${ nit },${ cod },${ usuarioo },${ unidad },${ fechaDoc },
            ${ fechaAtaq },${ incidente },${ emergencia },${ clasificacion },${ estatus },${ conclusion }, @last_id);`;

        MySQL.ejecutarQuery(addReporte, (err: any, id:any[][]) => {
            if(err){
                console.log('No se pudo agregar reporte: ', err ,
                '--------------------------------------------------');
            } else { 
                // Se retornan los datos del reporte
                const reporteAgregado = id[0][0].last_id;
                console.log(`Se agrego el reporte ${reporteAgregado}`);
                // Emitir a cliente android que la alerta se recibio 
                cliente.emit('alertaRecibida', 'ALERTA RECIBIDA');
                // Emitir alerta a todos los usuarios NIT
                cliente.broadcast.to('NIT').emit('nuevaAlerta', reporteAgregado);
            }
        });
    }
    );

    cliente.on('datosComercio', function(comercio){
        // Se recibe el codigo del comercio
        // Se genera alerta en el dashboard 
    });
    
    cliente.on('fotografias', Object);
}

// Escuchar mensaje de tipo socket ¿De quien? // No se utiliza por el momento
export const mensaje = (cliente: Socket) => {
    cliente.on('mensaje', (payload) => {
        console.log('RECIBIENDO  MENSAJE');
        console.log(payload);
    });
}
