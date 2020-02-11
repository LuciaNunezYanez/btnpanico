import { Socket } from 'socket.io';
import express = require('express');
import MySQL from '../mysql/mysql';

const { obtenerAlertasPendientes } = require('../mysql/mysql-alertas.nit');
const { verificaToken } = require('../server/middlewares/autenticacion');
const { Usuarios }  = require('../server/classes/usuarios');
const { Alertas }  = require('../server/classes/alertas');
const jwt = require('jsonwebtoken');

const usuarios = new Usuarios();
const alertas = new Alertas();

export const CONECTADO = (cliente: Socket) => {
    console.log("-> CLIENTE CONECTADO - DESCONOCIDO");

    // ==================================
    // USUARIOS NIT
    // ==================================
    cliente.on('loginNIT', (usuario, callback) => {
        // Des-encriptar usuario para agregarlo a donde corresponde
        
     
        if(!usuario || usuario === undefined){
            return callback({
                ok: false,
                err: {
                    message: 'Usuario inválido'
                }
            });
        }
        
        let token = usuario.token;
        let sala = usuario.sala;
        const SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
        
        let usuario_desenc: any;
        jwt.verify(token, SEED, (err: any, decoded: any)=> {
            if(err){
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

        if(!sala || sala === undefined) {
            return callback({
                ok: false, 
                mensaje: 'La sala es necesaria'
            });
        }
        if(!usuario_desenc || usuario_desenc === undefined) {
            return callback({
                ok: false, 
                mensaje: 'Token invalido'
            });
        }
        
        // EL USUARIO SE UNE A UNA SALA
        cliente.join(sala);
        console.log(`(loginNIT) Usuario ${usuario_desenc.usuario} conectado a la sala ${sala}: `);
        
        // AGREGA EL USUARIO A LA LISTA DE PERSONAS CONECTADAS 
        let usuariosNITConectados = usuarios.agregarUsuario(
                        cliente.id, 
                        usuario_desenc.id_usuario,
                        usuario_desenc.usuario, 
                        sala,
                        usuario_desenc.nombres, 
                        usuario_desenc.apellPat, 
                        usuario_desenc.apellMat, 
                        usuario_desenc.tipo, 
                        usuario_desenc.depend,
                        usuario_desenc.sexo,
                        usuario_desenc.estatus);

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
            obtenerAlertasPendientes( (err: any, alertas: Object) => {
                if(err){
                    console.log(err);
    
                } else {
                    cliente.broadcast.to('NIT').emit('alertasActualizadas', alertas);
                }
            });
            console.log(`Se creó el reporte ${reporteAgregado} <==============`);
            // Emitir a cliente android que la alerta se recibio con el # del reporte 
            cliente.emit('alertaRecibida', `${reporteAgregado}`);
        }
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

export interface Alerta {
    id_reporte: number, 
    id_user_app: number, 
    id_com_reporte: number,
    estatus_actual: number,
    id_user_cc: number, 
    tipo: number, 
    nombres?: string,
    apellPat?: string, 
    apellMat?: string, 
    estatus?: number
  }
