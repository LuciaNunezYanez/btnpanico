"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var verificaToken = require('../../server/middlewares/autenticacion').verificaToken;
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
            return res.status(400).json({
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
                        return res.json({
                            ok: true,
                            resultado: resultado[0][0].resultado,
                            comercio: comercio[0][0]
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
exports.default = router;
