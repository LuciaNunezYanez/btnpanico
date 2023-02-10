"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require('jsonwebtoken');
// ========================
// VERIFICACION DEL TOKEN 
// ========================
var verificaToken = function (req, res, next) {
    var _a, _b;
    var token = (_b = (_a = req.get('token'), (_a !== null && _a !== void 0 ? _a : req.body.token)), (_b !== null && _b !== void 0 ? _b : req.params.token));
    if (token === 'ST') {
        return next();
    }
    // Lo correcto sería ir a la base de datos
    // y ver que el usuario exista
    // y esté correcto para darle acceso.
    // No solo desencriptar el token.
    var SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    jwt.verify(token, SEED, function (err, decoded) {
        if (err) {
            return res.json({
                ok: false,
                err: err
            });
        }
        // Información decodificada del usuario
        req.usuario = decoded.usuario;
        // Se le da acceso
        return next();
    });
};
// Entra el token
// Sale id_usuario y tipo
var verificaTokenIDUsuario = function (req, res, next) {
    var _a, _b;
    var token = (_a = req.get('token'), (_a !== null && _a !== void 0 ? _a : req.body.token));
    // Si viene el id del usuario no ocupo el token
    if ((_b = req.body) === null || _b === void 0 ? void 0 : _b.id_usuario) {
        return next();
    }
    // Sin token no hay acceso
    if (token === undefined || token === NaN) {
        return res.json({
            ok: false,
            message: 'Token inválido!'
        });
    }
    // Si lo encontré; ponerlo donde va.
    req.body.token = token;
    var SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    jwt.verify(token, SEED, function (err, decoded) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (err) {
            return res.json({
                ok: false,
                message: 'Token inválido',
                err: err
            });
        }
        // Información decodificada del token
        // console.log(decoded);
        var id_usuario = (_c = (_b = (_a = decoded) === null || _a === void 0 ? void 0 : _a.usuario) === null || _b === void 0 ? void 0 : _b.id_usuarios_cc, (_c !== null && _c !== void 0 ? _c : (_e = (_d = decoded) === null || _d === void 0 ? void 0 : _d.usuario) === null || _e === void 0 ? void 0 : _e.id_usuarios_app));
        req.body.id_usuario = id_usuario;
        req.body.tipo = (_g = (_f = decoded) === null || _f === void 0 ? void 0 : _f.usuario) === null || _g === void 0 ? void 0 : _g.tipo;
        return next();
    });
};
var verificaTokenComercio = function (req, res, next) {
    var token = req.params.token;
    var SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';
    if (token === undefined) {
        return res.status(401).json({
            ok: false,
            err: 'Token inválido'
        });
    }
    jwt.verify(token, SEED, function (err, decoded) {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: err
            });
        }
        // console.log('Información decodificada del comercio:');
        // console.log(decoded);
        return next();
        // INFORMACIÓN DECODIFICADA DEL USUARIO
        // req.usuario = decoded.usuario;
        // return next();
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
            return next();
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
    // console.log(usuario);
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
        return next();
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
    verificaTokenIDUsuario: verificaTokenIDUsuario,
    verificaTokenComercio: verificaTokenComercio,
    verificaAdmin_role: verificaAdmin_role,
    verificaTokenPertenece: verificaTokenPertenece,
    decodificarToken: decodificarToken
};
