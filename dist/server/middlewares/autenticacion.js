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
// ========================
// VERIFICAR ADMIN ROLE 
// 0 = Usuario normal
// 1 = Usuario administrador
// ========================
var verificaAdmin_role = function (req, res, next) {
    var usuario = req.usuario;
    if (usuario.tipo === 1) {
        next();
    }
    else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};
module.exports = {
    verificaToken: verificaToken,
    verificaAdmin_role: verificaAdmin_role
};
