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
    // console.log(req.body);
    var usuario = mysql_1.default.instance.cnn.escape(req.body.usuario);
    var passNoEnctrip = req.body.contrasena;
    var query = "CALL getUsuarioCCID(" + usuario + ")";
    if (usuario === undefined || passNoEnctrip === undefined) {
        return res.json({
            ok: false,
            resp: 'Ingrese datos completos por favor.'
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
                var _b = data[0][0], id_usuarios_cc = _b.id_usuarios_cc, usuario_1 = _b.usuario, nombres_usuarios_cc = _b.nombres_usuarios_cc, apellido_paterno = _b.apellido_paterno, apellido_materno = _b.apellido_materno, tipo_usuario = _b.tipo_usuario, dependencia = _b.dependencia, sexo_cc = _b.sexo_cc, id_estacion_pertenece = _b.id_estacion_pertenece, estatus_usuario = _b.estatus_usuario, id_asociacion_cc = _b.id_asociacion_cc, sala_usuario_cc = _b.sala_usuario_cc;
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
                    id_asociacion_cc: id_asociacion_cc
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
                resp: e.message
            });
        }
    });
});
router.post('/app/', function (req, res) {
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
exports.default = router;
