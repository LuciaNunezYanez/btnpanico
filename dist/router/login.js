"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var router = express_1.Router();
// Log in
router.post('/', function (req, res) {
    // console.log('LOGIN1');
    // console.log(req.body);
    var usuario = mysql_1.default.instance.cnn.escape(req.body.usuario);
    var passNoEnctrip = req.body.contrasena;
    // const query = `CALL getUsuarioCCID(${usuario})`;
    var query = "CALL getLoginMon(" + usuario + ");";
    if (usuario === undefined || passNoEnctrip === undefined) {
        return res.json({
            ok: false,
            resp: 'Ingrese los datos completos por favor.'
        });
    }
    mysql_1.default.ejecutarQuery(query, function (err, data) {
        var _a;
        try {
            if (err) {
                return res.json({
                    ok: false,
                    resp: err
                });
            }
            else {
                if (!((_a = data[0][0]) === null || _a === void 0 ? void 0 : _a.id_usuarios_cc)) {
                    return res.json({
                        ok: false,
                        resp: 'Datos no encontrados'
                    });
                }
                var _b = data[0][0], id_usuarios_cc = _b.id_usuarios_cc, usuario_1 = _b.usuario, nombres_usuarios_cc = _b.nombres_usuarios_cc, apellido_paterno = _b.apellido_paterno, apellido_materno = _b.apellido_materno, tipo_usuario = _b.tipo_usuario, dependencia = _b.dependencia, sexo_cc = _b.sexo_cc, id_estacion_pertenece = _b.id_estacion_pertenece, estatus_usuario = _b.estatus_usuario, id_asociacion_cc = _b.id_asociacion_cc, sala_usuario_cc = _b.sala_usuario_cc, p_admin = _b.p_admin, p_normal = _b.p_normal, p_tr = _b.p_tr;
                // console.log('ESTACION PERTENECE', id_estacion_pertenece);
                // VALIDAR USUARIO ACTIVO 
                if (estatus_usuario === 0) {
                    return res.json({
                        ok: false,
                        resp: 'Usuario inactivo'
                    });
                }
                var usuario_log = {
                    id_usuario: id_usuarios_cc,
                    usuario: usuario_1,
                    nombres: nombres_usuarios_cc,
                    apellPat: apellido_paterno,
                    apellMat: apellido_materno,
                    tipo: tipo_usuario,
                    depend: dependencia,
                    sexo: sexo_cc,
                    estatus: estatus_usuario,
                    id_estacion_pertenece: id_estacion_pertenece,
                    id_asociacion_cc: id_asociacion_cc,
                    p_admin: p_admin,
                    p_normal: p_normal,
                    p_tr: p_tr
                };
                var expiresIn = 60 * 60 * 12;
                //GENERAR TOKEN
                var token = jwt.sign({
                    usuario: usuario_log
                }, process.env.SEED || 'este-es-el-seed-de-desarrollo', { expiresIn: expiresIn }); // 24 hrs de expiración 
                // console.log(expiresIn);
                // VALIDAR INICIO DE SESIÓN 
                var passEncript = data[0][0].contrasena;
                if (bcrypt.compareSync(passNoEnctrip, passEncript)) {
                    // console.log('SI COINCIDEN');
                    return res.json({
                        ok: true,
                        resp: 'Contraseña correcta',
                        id_usuario: id_usuarios_cc,
                        usuario: usuario_1,
                        estacion: id_estacion_pertenece,
                        id_asociacion: id_asociacion_cc,
                        expiresIn: expiresIn,
                        sala: sala_usuario_cc,
                        p_admin: p_admin,
                        p_normal: p_normal,
                        p_tr: p_tr,
                        token: token
                    });
                }
                else {
                    // console.log('NO COINCIDEN');
                    return res.json({
                        ok: false,
                        resp: 'Contraseña incorrecta'
                    });
                }
            }
        }
        catch (e) {
            return res.json({
                ok: false,
                resp: e
            });
        }
    });
});
router.post('/app/', function (req, res) {
    // console.log('LOGIN2');
    var correo = req.body.c;
    var contrasena = req.body.ct;
    if (!correo || !contrasena) {
        return res.json({
            ok: false,
            resp: 'Datos incompletos'
        });
    }
    var QUERY = "SELECT id_usuarios_app FROM usuarios_app WHERE \n        correo_usuario_app = " + mysql_1.default.instance.cnn.escape(correo) + " \n        AND contrasena_app = " + mysql_1.default.instance.cnn.escape(contrasena) + "\n        AND estatus_usuario = 1 LIMIT 1;";
    mysql_1.default.ejecutarQuery(QUERY, function (err, respuesta) {
        var _a, _b;
        if (err) {
            return res.json({
                ok: false,
                resp: err
            });
        }
        else {
            if ((_a = respuesta[0]) === null || _a === void 0 ? void 0 : _a.id_usuarios_app)
                return res.json({
                    ok: true,
                    resp: 'Éxito al iniciar sesión',
                    id: (_b = respuesta[0]) === null || _b === void 0 ? void 0 : _b.id_usuarios_app
                });
            else
                return res.json({
                    ok: false,
                    resp: 'Correo y/o contraseña incorrecta.'
                });
        }
    });
});
router.post('/mult/app/', function (req, res) {
    // console.log('LOGIN3');
    var usuario = mysql_1.default.instance.cnn.escape(req.body.usuario);
    var contrasenaPlana = req.body.contrasena;
    var query = "CALL getLogin(" + usuario + ")";
    if (usuario === undefined || contrasenaPlana === undefined) {
        return res.json({
            ok: false,
            resp: 'Ingrese datos completos por favor.'
        });
    }
    mysql_1.default.ejecutarQueryPr(query).then(function (data) {
        try {
            var usuarioDB = data[0][0];
            console.log('111');
            if (usuarioDB === undefined) {
                return res.json({
                    ok: false,
                    mensaje: 'Usuario no encontrado'
                });
            }
            if (usuarioDB.id_usuarios_app) { // Usuario app no encripta la contraseña 
                if (contrasenaPlana != usuarioDB.contrasena_app) {
                    // Existe pero no pasa
                    console.log('222');
                    usuarioDB.access = false;
                    return res.json({
                        ok: true,
                        usuario: {
                            tipo: 'na',
                            mensaje: 'Contraseña incorrecta',
                            exist: 1,
                            access: false
                        }
                    });
                }
                else {
                    console.log('333');
                    // Todo bien 
                    // Es usuario de la app
                    // Encriptar token
                    var token = generarToken({
                        tipo: usuarioDB.tipo,
                        id_comercio: usuarioDB.id_comercio,
                        id_direccion: usuarioDB.id_direccion,
                        id_usuarios_app: usuarioDB.id_usuarios_app,
                        id_asociacion_pertenece: usuarioDB.id_asociacion_pertenece
                    });
                    usuarioDB.access = true;
                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token
                    });
                }
            }
            else if (usuarioDB.id_usuarios_cc) { // Usuario cc si la encripa
                if (!bcrypt.compareSync(contrasenaPlana, usuarioDB.contrasena)) {
                    console.log('444');
                    // Existe pero no pasa
                    usuarioDB.access = false;
                    return res.json({
                        ok: true,
                        usuario: {
                            tipo: 'na',
                            mensaje: 'Contraseña incorrecta',
                            exist: 1,
                            access: false
                        }
                    });
                }
                else {
                    console.log('555');
                    // Todo bien
                    // Es usuario cc
                    // Encriptar token
                    var token = generarToken({
                        tipo: usuarioDB.tipo,
                        id_comercio: 0,
                        id_direccion: 0,
                        id_usuarios_cc: usuarioDB.id_usuarios_cc,
                        id_asociacion_cc: usuarioDB.id_asociacion_cc
                    });
                    usuarioDB.access = true;
                    return res.json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token
                    });
                }
            }
            else {
                console.log('666');
                usuarioDB.access = false;
                return res.json({
                    ok: true,
                    usuario: usuarioDB
                });
            }
        }
        catch (err) {
            console.log('777');
            return res.json({
                ok: false,
                resp: err
            });
        }
    }).catch(function (err) {
        console.log('888');
        return res.json({
            ok: false,
            resp: err
        });
    });
});
function generarToken(data) {
    var token = jwt.sign({
        usuario: data
    }, process.env.SEED || 'este-es-el-seed-de-desarrollo');
    return token;
}
exports.default = router;
