"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
// import * from '../server/globals';
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var router = express_1.Router();
// Log in
router.post('/', function (req, res) {
    var usuario = mysql_1.default.instance.cnn.escape(req.body.usuario);
    var passNoEnctrip = req.body.contrasenia;
    var query = "CALL getUsuarioCCID(" + usuario + ")";
    mysql_1.default.ejecutarQuery(query, function (err, data) {
        try {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    resp: err
                });
            }
            else {
                var _a = data[0][0], id_usuarios_cc = _a.id_usuarios_cc, nombres_usuarios_cc = _a.nombres_usuarios_cc, apellido_paterno = _a.apellido_paterno, apellido_materno = _a.apellido_materno, tipo_usuario = _a.tipo_usuario, dependencia = _a.dependencia, sexo_cc = _a.sexo_cc, estatus_usuario = _a.estatus_usuario;
                // VALIDAR USUARIO ACTIVO 
                if (estatus_usuario === 0) {
                    return res.json({
                        ok: false,
                        resp: 'Usuario inactivo'
                    });
                }
                var usuario_1 = {
                    id_usuario: id_usuarios_cc,
                    nombres: nombres_usuarios_cc,
                    epellPat: apellido_paterno,
                    apellMat: apellido_materno,
                    tipo: tipo_usuario,
                    depend: dependencia,
                    sexo: sexo_cc,
                    estatus: estatus_usuario
                };
                //GENERAR TOKEN
                var token = jwt.sign({
                    usuario: usuario_1
                }, process.env.SEED || 'este-es-el-seed-de-desarrollo', { expiresIn: 60 * 60 * 24 });
                // VALIDAR INICIO DE SESIÓN 
                var passEncript = data[0][0].contrasena;
                if (bcrypt.compareSync(passNoEnctrip, passEncript)) {
                    return res.json({
                        ok: true,
                        resp: 'Contraseña exitosa',
                        //usuario: { usuario },
                        token: token
                    });
                }
                else {
                    return res.json({
                        ok: false,
                        resp: 'Contraseña incorrecta'
                    });
                }
            }
        }
        catch (e) {
            return res.status(400).json({
                ok: false,
                resp: e.message
            });
        }
    });
});
exports.default = router;
