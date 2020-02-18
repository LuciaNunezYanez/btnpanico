// import { Request, Response } from 'express';
// import { verify } from 'crypto';
// import MySQL from '../../mysql/mysql';
const jwt = require('jsonwebtoken');


function decodificarToken ( Token: any) {
    let token = Token;
    const SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo'; // NITDurango (Variable Heroku)
    let respuesta = {};
    
    jwt.verify(token, SEED, (err: any, decoded: any) => {
        if(err){
            console.log('Ocurrió un error al decodificar token');
            respuesta = {
                ok: false, 
                err: 'Ocurrió un error al decodificar token'
                
            };
        } else{ 
            // RETORNA LA INFORMACIÓN DECODIFICADA DEL USUARIO
            respuesta = {
                ok: true,
                usuario: decoded.usuario
            }
        }
    });
    return respuesta;
};

module.exports = {
    decodificarToken
}