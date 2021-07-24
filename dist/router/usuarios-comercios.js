"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var _a = require('../server/middlewares/autenticacion'), verificaToken = _a.verificaToken, verificaAdmin_role = _a.verificaAdmin_role;
var bcrypt = require('bcrypt');
var router = express_1.Router();
var salt = bcrypt.genSaltSync(10);
// [verificaToken, verificaAdmin_role],
// Obtener usuario por usuario
router.get('/:id', function (req, res) {
    var idusuario = mysql_1.default.instance.cnn.escape(req.params.id);
    var query = "CALL getUsuarioAppID(" + idusuario + ")";
    mysql_1.default.ejecutarQuery(query, function (err, usuario) {
        if (err) {
            return res.status(400).json({
                ok: false,
                resp: err
            });
        }
        else {
            return res.json({
                ok: true,
                resp: usuario[0][0]
            });
        }
    });
});
router.get('/completo/:id', function (req, res) {
    var idusuario = mysql_1.default.instance.cnn.escape(req.params.id);
    var query = "CALL getTodoUsuarioAppID(" + idusuario + ")";
    mysql_1.default.ejecutarQuery(query, function (err, usuario) {
        if (err) {
            return res.json({
                ok: false,
                resp: err
            });
        }
        else {
            return res.json({
                ok: true,
                resp: usuario[0][0]
            });
        }
    });
});
router.post('/:id', function (req, res) {
    var idUsuario = req.params.id;
    if (!idUsuario) {
        return res.json({
            ok: false,
            resp: 'Datos de usuario incompletos'
        });
    }
    var _a = req.body, nombre = _a.nombre, paterno = _a.paterno, materno = _a.materno, nacimiento = _a.nacimiento, sexo = _a.sexo, padecimientos = _a.padecimientos, telefono = _a.telefono, alergias = _a.alergias, sangre = _a.sangre, pass = _a.pass;
    if (!nombre || !paterno || !sexo || !telefono || !pass)
        return res.json({
            ok: false,
            resp: 'Datos personales incompletos'
        });
    var fecha = '0000/00/00';
    if (nacimiento) {
        var fecha_separada = nacimiento.split('/');
        fecha = fecha_separada[2] + '/' + fecha_separada[1] + '/' + fecha_separada[0];
    }
    var QUERY = "CALL updateUsuarioApp(\n        " + mysql_1.default.instance.cnn.escape(nombre) + ",\n        " + mysql_1.default.instance.cnn.escape(paterno) + ",\n        " + mysql_1.default.instance.cnn.escape(materno) + ",\n        " + mysql_1.default.instance.cnn.escape(fecha) + ",\n        " + mysql_1.default.instance.cnn.escape(sexo) + ",\n        " + mysql_1.default.instance.cnn.escape(padecimientos) + ",\n        " + mysql_1.default.instance.cnn.escape(telefono) + ",\n        " + mysql_1.default.instance.cnn.escape(alergias) + ",\n        " + mysql_1.default.instance.cnn.escape(sangre) + ",\n        " + mysql_1.default.instance.cnn.escape(pass) + ",\n        " + Number.parseInt(idUsuario) + "\n        );";
    console.log(QUERY);
    mysql_1.default.ejecutarQuery(QUERY, function (err, resp) {
        if (err) {
            return res.json({
                ok: false,
                resp: err
            });
        }
        else {
            var i = resp[0][0].res === 1 ? true : false;
            return res.json({
                ok: i,
                resp: resp[0][0].resp
            });
        }
    });
});
exports.default = router;
