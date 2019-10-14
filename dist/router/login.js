"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var bcrypt = require('bcrypt-nodejs');
var router = express_1.Router();
// Log in
router.post('/', function (req, res) {
    var usuario = mysql_1.default.instance.cnn.escape(req.body.usuario);
    var passNoEnctrip = mysql_1.default.instance.cnn.escape(req.body.contrasenia);
    var query = "CALL getUsuarioCCID(" + usuario + ")";
    mysql_1.default.ejecutarQuery(query, function (err, data) {
        if (err) {
            return res.status(400).json({
                ok: false,
                resp: err
            });
        }
        else {
            var passEncript = data[0][0].contrasena;
            bcrypt.compare(passNoEnctrip, passEncript, function (err, result) {
                if (err) {
                    return res.json({
                        ok: false,
                        resp: 'Ocurrio un error'
                    });
                }
                if (result == true) {
                    return res.json({
                        ok: true,
                        resp: 'Contraseña exitosa',
                        data: data[0][0]
                    });
                }
                else {
                    return res.json({
                        ok: true,
                        resp: 'Contraseña incorrecta'
                    });
                }
            });
        }
    });
});
exports.default = router;
