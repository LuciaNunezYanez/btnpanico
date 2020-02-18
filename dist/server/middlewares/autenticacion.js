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
// VERIFICAR TOKEN IMAGEN
// Compara el id_usuario_pertenece
// VS el id_usuario
// ========================
var verificaTokenPertenece = function (req, res, next) {
    var token = req.query.token;
    var id_usuario_pertenece = Number.parseInt(req.query.id_usuario_pertenece);
    var SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    // NITDurango (Variable Heroku)
    jwt.verify(token, SEED, function (err, decoded) {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }
        // INFORMACIÓN DECODIFICADA DEL USUARIO
        var usuario = req.usuario = decoded.usuario;
        if (usuario.id_usuario !== id_usuario_pertenece) {
            // console.log('Usuario token');
            // console.log(usuario.id_usuario);
            // console.log('usuario por ruta');
            // console.log(id_usuario_pertenece);
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Permiso denegado'
                }
            });
        }
        else {
            next();
        }
    });
};
function decodificarToken(token) {
    var usuario;
    var SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    jwt.verify(token, SEED, function (err, decoded) {
        if (err) {
            // Token no valido 
            usuario = {
                ok: false
            };
        }
        else {
            // INFORMACIÓN DECODIFICADA DEL USUARIO
            usuario = {
                ok: true,
                usuario: decoded.usuario
            };
        }
    });
    console.log(usuario);
    return usuario;
}
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
    verificaAdmin_role: verificaAdmin_role,
    verificaTokenPertenece: verificaTokenPertenece,
    decodificarToken: decodificarToken
};
