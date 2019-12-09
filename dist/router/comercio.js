"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var verificaToken = require('../server/middlewares/autenticacion').verificaToken;
var router = express_1.Router();
// Obtener todos los comercios
router.get('/', verificaToken, function (req, res) {
    var query = " SELECT * FROM comercio; ";
    mysql_1.default.ejecutarQuery(query, function (err, comercios) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                comercios: comercios
            });
        }
    });
});
// Obtener datos completos del comercio por ID 
// Comercio y dirección 
// verificaToken,
router.get('/:id', function (req, res) {
    var id = req.params.id;
    var escapedId = mysql_1.default.instance.cnn.escape(id);
    var query = "CALL getComercioID(" + escapedId + ")";
    mysql_1.default.ejecutarQuery(query, function (err, comercio) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                comercio: comercio[0]
            });
        }
    });
});
exports.default = router;
