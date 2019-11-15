"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var verificaToken = require('../server/middlewares/autenticacion').verificaToken;
var router = express_1.Router();
// Obtener archivos multimedia por ID 
router.get('/:id', function (req, res) {
    var id = req.params.id;
    var escapedId = mysql_1.default.instance.cnn.escape(id);
    var query = "CALL getMultimedID(" + escapedId + ")";
    mysql_1.default.ejecutarQuery(query, function (err, multimedia) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                multimedia: multimedia[0]
            });
        }
    });
});
// Obtener archivos multimedia por numero de reporte
router.get('/reporte/:id_reporte', function (req, res) {
    var id_reporte = req.params.id_reporte;
    var escapedId = mysql_1.default.instance.cnn.escape(id_reporte);
    var query = "CALL getMultimedRep(" + escapedId + ")";
    mysql_1.default.ejecutarQuery(query, function (err, multimedia) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                multimedia: multimedia[0]
            });
        }
    });
});
exports.default = router;
