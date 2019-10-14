"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
// const bcrypt = require('bcrypt');
var bcrypt = require('bcrypt-nodejs');
var router = express_1.Router();
// Obtener usuario por ID
router.get('/:id', function (req, res) {
    var id = mysql_1.default.instance.cnn.escape(req.params.id);
    var query = "CALL getUsuarioCCID(" + id + ")";
    mysql_1.default.ejecutarQuery(query, function (err, data) {
        if (err) {
            res.status(400).json({
                ok: false,
                resp: err
            });
        }
        else {
            res.json({
                ok: true,
                resp: data[0][0]
            });
        }
    });
});
// Agregar usuarios NIT
router.post('/', function (req, res) {
    var contrasena = req.body.contrasena;
    var salt = bcrypt.genSaltSync(10);
    var contrEncript = mysql_1.default.instance.cnn.escape(bcrypt.hashSync(contrasena, salt));
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
            res.status(400).json({
                ok: false,
                err: err
            });
        }
        else {
            res.json({
                ok: true
            });
        }
    });
});
// interface Usuario {
//     nombre: string; 
//     apellidoPat: string;
//     apellidoMat: string; 
//     usuario: string;
//     contrasenia: string; 
//     tipoUsuario: number;
//     dependencia: string;
//     sexo: string, 
//     estatus: boolean 
// }
exports.default = router;
