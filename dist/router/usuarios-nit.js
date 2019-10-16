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
// Obtener usuario por usuario
router.get('/:id', [verificaToken, verificaAdmin_role], function (req, res) {
    var idusuario = mysql_1.default.instance.cnn.escape(req.params.id);
    var query = "CALL getUsuarioCCID(" + idusuario + ")";
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
// Agregar usuarios NIT
router.post('/', [verificaToken, verificaAdmin_role], function (req, res) {
    // Encriptar contraseña FORMA 1 
    var contrasena = (req.body.contrasena);
    // Quizá quitando el escape
    var contrEncript = bcrypt.hashSync(contrasena, salt);
    contrEncript = mysql_1.default.instance.cnn.escape(contrEncript);
    var nombre = mysql_1.default.instance.cnn.escape(req.body.nombre);
    var apePat = mysql_1.default.instance.cnn.escape(req.body.apePat);
    var apeMat = mysql_1.default.instance.cnn.escape(req.body.apeMat) || '';
    var usuario = mysql_1.default.instance.cnn.escape(req.body.usuario);
    var tipoUsuario = req.body.tipo;
    var depend = mysql_1.default.instance.cnn.escape(req.body.depend);
    var sexo = mysql_1.default.instance.cnn.escape(req.body.sexo);
    var estatus = req.body.estatus || 1;
    var QUERY = "CALL addUsuarioCC(\n        " + nombre + ",\n        " + apePat + ",\n        " + apeMat + ",\n        " + usuario + ",\n        " + contrEncript + ",\n        " + tipoUsuario + ",\n        " + depend + ",\n        " + sexo + ",\n        " + estatus + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, data) {
        if (err) {
            return res.status(400).json({
                ok: false,
                resp: err
            });
        }
        else {
            return res.json({
                ok: true,
                resp: req.body.usuario
            });
        }
    });
});
// Editar usuario NIT 
router.put('/:id', [verificaToken, verificaAdmin_role], function (req, res) {
    var usuario = mysql_1.default.instance.cnn.escape(req.params.id);
    var body = req.body;
    var nombre = mysql_1.default.instance.cnn.escape(body.nombre);
    var apePat = mysql_1.default.instance.cnn.escape(body.apePat);
    var apeMat = mysql_1.default.instance.cnn.escape(body.apeMat) || '';
    var tipoUsuario = body.tipo;
    var depend = mysql_1.default.instance.cnn.escape(body.depend);
    var sexo = mysql_1.default.instance.cnn.escape(body.sexo);
    var estatus = body.estatus || 1;
    // Encriptar la nueva contraseña
    var contrasena = body.contrasena;
    var contrEncript = mysql_1.default.instance.cnn.escape(bcrypt.hashSync(contrasena, salt));
    var QUERY = "CALL editUsuarioCCID(\n        " + nombre + ",\n        " + apePat + ",\n        " + apeMat + ",\n        " + contrEncript + ",\n        " + tipoUsuario + ",\n        " + depend + ",\n        " + sexo + ",\n        " + estatus + ",\n        " + usuario + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, usuario) {
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
exports.default = router;
