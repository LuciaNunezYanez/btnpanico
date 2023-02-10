import { Socket } from 'socket.io';
import express = require('express');
import MySQL from '../mysql/mysql';

const { obtenerAlertasPendientes } = require('../mysql/mysql-alertas.nit');
const { Usuarios }  = require('../server/classes/usuarios');
const { Alertas }  = require('../server/classes/alertas');
const jwt = require('jsonwebtoken');

const usuarios = new Usuarios();
const alertas = new Alertas();

export const CONECTADO = (cliente: Socket) => {
    console.log("-> CLIENTE CONECTADO");

    // ==================================
    // USUARIOS NIT
    // ==================================
    cliente.on('loginNIT', (usuario, callback) => {
        console.log('loginNIT');
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
        console.log('* La sala: ' + sala );
        // console.log(`(loginNIT) Usuario ${usuario_desenc.usuario} conectado a la sala ${sala}: `);
        
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

        // SE NOTIFICA NUEVO CLIENTE EN LA SALA NIT (No util)
        cliente.broadcast.to(usuario.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuario.sala));
        callback(usuarios.getPersonasPorSala(usuario.sala));

        // primer parametro es object {idEstacion y sala}
        obtenerAlertasPendientes( {sala, estacion: usuario.idEstacion}, (err: any, alertas: Object) => {
            if(err){
                // Deberia de mostrar una pantalla de alerta
                console.log(err);
            } else {
                cliente.emit('alertasActualizadas' + usuario.idEstacion, alertas);
            }
        });
    });


    // ========================================
    // CLIENTE DESCONECTADO
    // ========================================
    cliente.on('disconnect', function (){
        let usuarioEliminado = usuarios.borrarPersona( cliente.id );
        console.log('<- CLIENTE DESCONECTADO');
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
    token?: string,  
    estatus?: number
    idEstacion?: number
  }
