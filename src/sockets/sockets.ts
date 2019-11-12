import { Socket } from 'socket.io';
import express = require('express');
const { verificaToken } = require('../server/middlewares/autenticacion');
import MySQL from '../mysql/mysql';
const { Usuarios }  = require('../server/classes/usuarios');
const { Alertas }  = require('../server/classes/alertas');
const { obtenerAlertasPendientes, abrirPeticion } = require('../mysql/mysql-alertas');

const usuarios = new Usuarios();
const alertas = new Alertas();

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


        obtenerAlertasPendientes( (err: any, alertas: Object) => {
            if(err){
                // Deberia de mostrar una pantalla de alerta
                console.log(err);

            } else {
                cliente.emit('alertasActualizadas', alertas);
            }
        });
    });

    cliente.on('peticionAbierta', (data: any, callback: Function) => {
        if(!data.idReporte || !Number.isInteger(data.idReporte)){
            return callback({
                ok: false, 
                resp: 'El folio del reporte es inválido.'
            });
        } else if(!data.idUsuario || !Number.isInteger(data.idUsuario)){
            return callback({
                ok: false, 
                resp: 'El usuario es inválido.'
            });
        }

        abrirPeticion(data.idReporte, data.idUsuario, ( err: any, resp: any) => {
            if (err){
                // Deberia de mostrar una pantalla de alerta de error al abrir petición 
                return callback({
                    ok: false, 
                    resp: err
                });
            } else {
                // Mandar lista actualizada a todos los usuarios 
                obtenerAlertasPendientes( (err: any, alertas: Object) => {
                    if(err){
                        // Deberia de mostrar una pantalla de alerta de error al traer la nueva lista
                        return callback({
                            ok: false, 
                            resp: err
                        });
        
                    } else {
                        cliente.emit('alertasActualizadas', alertas);
                        callback(null, {
                            ok: true,     
                            resp: 'Petición abierta con éxito.'
                        })
                    }
                });
            }

        });
        

    });


    // ========================================
    // CLIENTE DESCONECTADO
    // ========================================
    cliente.on('disconnect', function (){
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
    

    // ========================================
    // ALERTAS COMERCIOS
    // ========================================
    cliente.on('botonActivado', function(comercio){ 
        const { idComercio, idUsuario , sala, fecha } = comercio;
        
        console.log(`-> Nueva alerta de pánico del comercio: ${idComercio}`);               

        // AGREGAR USUARIO COMERCIO A LA SALA COMERCIOS 
        usuarios.agregarUsuario(
            cliente.id, 
            idUsuario, 
            idComercio, 
            sala);

        // UNIR EL USUARIO A LA SALA 
        cliente.join(sala);

        agregarReporte(cliente, idComercio, idUsuario, fecha );
    }
    );
}

export const MULTIMEDIA = (cliente: Socket) => {
    console.log("-> ARCHIVO MULTIMEDIA RECIBIDO");
    
    cliente.on('imagenEnviada', (data, callback) => {
        cliente.broadcast.to('NIT').emit('imagenNueva', usuarios.usuarios.getPersonasPorSala('NIT'));
    });
}

function obtenerFechaHoy(){
    const fh = new Date();
    let dia = fh.getDate();
    let mes = fh.getMonth() +1 ;
    let anio = fh.getFullYear();
    let hora = fh.getHours();
    let min = fh.getMinutes();
    let seg = fh.getSeconds();
    const fechaCompleta = `${ anio }-${ mes }-${ dia } ${ hora }:${ min }:${ seg }`;
    return fechaCompleta;
}


function agregarReporte(cliente: Socket, idComercio: number, idUsuario: number, fecha: string){

    // Recibir datos p t reporte
    const idUserCc: number = 1; // 1 = Sin atender
    const idComercReporte: number = idComercio;
    const idUserApp: number = idUsuario;
    const idUnidad: number = 1; // 1 = Ninguna unidad
    const fhDoc: string = MySQL.instance.cnn.escape(obtenerFechaHoy());
    const fhAtaque: string = MySQL.instance.cnn.escape(fecha);
    const tipoInc: number = 0 ; // 0 = Desconocido
    const descripEmerg: string = MySQL.instance.cnn.escape('');
    const clasifEmerg: number = 0; // 0 = Normal
    const estatusActual: number = 0; // 0 = Sin atender
    const cierreConcl: string = MySQL.instance.cnn.escape('');

    const query = `CALL addReporteRtID(
        ${idUserCc},
        ${idComercReporte},
        ${idUserApp},
        ${idUnidad},
        ${fhDoc},
        ${fhAtaque},
        ${tipoInc},
        ${descripEmerg},
        ${clasifEmerg},
        ${estatusActual},
        ${cierreConcl},
        @last_id);`;

    
    MySQL.ejecutarQuery( query, (err: any, id:any[][]) => {
        if(err) {
            console.log('No se pudo agregar reporte: ', err);
             // Emitir a cliente android que NO se pudo agregar el reporte 
             cliente.emit('alertaNoRecibida', '0');

        } else {
            // Se retornan los datos del reporte
            const reporteAgregado = id[0][0].last_id;

            let alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercio, idUsuario, 1, 0);
            //cliente.broadcast.to('NIT').emit('alertaAgregada', alertaAgregada);
            // VA EL MISMO CODIGO DE LOGIN 
            obtenerAlertasPendientes( (err: any, alertas: Object) => {
                if(err){
                    console.log(err);
    
                } else {
                    cliente.broadcast.to('NIT').emit('alertasActualizadas', alertas);
                }
            });
            console.log(`Se creó el reporte ${reporteAgregado}`);
            // Emitir a cliente android que la alerta se recibio con el # del reporte 
            cliente.emit('alertaRecibida', `${reporteAgregado}`);
        }
    });
}