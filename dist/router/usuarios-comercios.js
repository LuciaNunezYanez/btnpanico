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
exports.default = router;
