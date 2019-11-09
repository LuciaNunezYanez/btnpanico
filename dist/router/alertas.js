"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var verificaToken = require('../server/middlewares/autenticacion').verificaToken;
var mysql_1 = __importDefault(require("../mysql/mysql"));
var router = express_1.Router();
// Obtener todos los comercios
router.get('/', function (req, res) {
    var query = "CALL getReportesPendient();";
    mysql_1.default.ejecutarQuery(query, function (err, reportes) {
        if (err) {
            console.log('Ocurrió un error al traer los reportes: ', err);
        }
        else {
            res.status(200).json({
                ok: true,
                res: reportes
            });
        }
    });
});
exports.default = router;
