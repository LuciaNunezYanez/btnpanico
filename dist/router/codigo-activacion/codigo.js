"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var verificaToken = require('../../server/middlewares/autenticacion').verificaToken;
var jwt = require('jsonwebtoken');
var router = express_1.Router();
// ABRIR CODIGO DE ACTIVACIÓN 
// Pasa de estatus 0 a 1 
router.post('/', function (req, res) {
    var codigo_activacion = req.body.codigo_activacion;
    var fecha_apertura = mysql_1.default.instance.cnn.escape(req.body.fecha_apertura);
    var estatus_abierto = 1;
    var queryCodigo = "CALL abrirCodigoActivacion(" + codigo_activacion + ", " + fecha_apertura + ", " + estatus_abierto + ");";
    mysql_1.default.ejecutarQuery(queryCodigo, function (err, resultado) {
        if (err) {
            return res.json({
                ok: false,
                error: err
            });
        }
        else {
            // Si el estatus es 0 y se abrió correctamente (res=1) se regresa la información 
            // completa del usuario (Usuario, comercio y dirección)
            if (resultado[0][0].res === 1) {
                var queryUsuario = "CALL getTodoUsuarioAppID(" + resultado[0][0].id_usuario + ");";
                mysql_1.default.ejecutarQuery(queryUsuario, function (err, comercio) {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            error: err
                        });
                    }
                    else {
                        //GENERAR TOKEN PARA EL COMERCIO
                        var f = new Date();
                        var token = jwt.sign({
                            id_comercio: comercio[0][0].id_comercio,
                            id_direccion: comercio[0][0].id_dir_comercio,
                            id_usuarios_app: comercio[0][0].id_usuarios_app,
                            fecha_activacion: f.getFullYear() + "/" + (f.getMonth() + 1) + "/" + f.getDate()
                        }, process.env.SEED || 'este-es-el-seed-de-desarrollo', { expiresIn: 60 * 60 * 8760 }); // 365 días de expiración 
                        return res.json({
                            ok: true,
                            resultado: resultado[0][0].resultado,
                            comercio: comercio[0][0],
                            token: token
                        });
                    }
                });
            }
            else {
                return res.json({
                    ok: true,
                    resultado: resultado[0][0].resultado
                });
            }
        }
    });
});
router.post('/independ/', function (req, res) {
    var id_usuario = Number.parseInt(req.body.id_usuario);
    var id_usuario_com = Number.parseInt(req.body.id_usuario_com);
    var date = new Date();
    var fecha = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    var codigo_activacion = Number.parseInt(req.body.codigo_activacion);
    var QUERY = "CALL addCodigoActivacion(" + id_usuario + ", " + id_usuario_com + ", " + mysql_1.default.instance.cnn.escape(fecha) + ", " + codigo_activacion + ", " + 0 + ");";
    // console.log(QUERY);
    mysql_1.default.ejecutarQuery(QUERY, function (err, resultado) {
        if (err) {
            return res.json({
                ok: false,
                message: 'No se pudo agregar el código de activación.',
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                message: 'Éxito al agregar código de activación',
                resultado: resultado
            });
        }
    });
});
exports.default = router;
