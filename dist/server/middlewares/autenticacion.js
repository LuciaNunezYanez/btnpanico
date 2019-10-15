"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require('jsonwebtoken');
// ========================
// VERIFICACION DEL TOKEN 
// ========================
var verificaToken = function (req, res, next) {
    var token = req.get('token');
    var SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    jwt.verify(token, SEED, function (err, decoded) {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: err
            });
        }
        // INFORMACIÓN DECODIFICADA DEL USUARIO
        req.usuario = decoded.usuario;
        next();
    });
};
module.exports = {
    verificaToken: verificaToken
};
