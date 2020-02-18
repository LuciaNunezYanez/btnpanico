"use strict";
// import { Request, Response } from 'express';
// import { verify } from 'crypto';
// import MySQL from '../../mysql/mysql';
var jwt = require('jsonwebtoken');
function decodificarToken(Token) {
    var token = Token;
    var SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo'; // NITDurango (Variable Heroku)
    var respuesta = {};
    jwt.verify(token, SEED, function (err, decoded) {
        if (err) {
            console.log('Ocurrió un error al decodificar token');
            respuesta = {
                ok: false,
                err: 'Ocurrió un error al decodificar token'
            };
        }
        else {
            // RETORNA LA INFORMACIÓN DECODIFICADA DEL USUARIO
            respuesta = {
                ok: true,
                usuario: decoded.usuario
            };
        }
    });
    return respuesta;
}
;
module.exports = {
    decodificarToken: decodificarToken
};
