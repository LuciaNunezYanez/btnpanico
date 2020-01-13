"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var router = express_1.Router();
router.get('/clasificacion', function (req, res) {
    var query = 'CALL getClasificacion()';
    mysql_1.default.ejecutarQuery(query, function (err, clasificacion) {
        var misClasificaciones = clasificacion[0];
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                clasificacion: misClasificaciones
            });
        }
    });
});
router.get('/subclasificacion', function (req, res) {
    var query = 'CALL getSubclasificacion()';
    mysql_1.default.ejecutarQuery(query, function (err, subclasificacion) {
        var misSublasificaciones = subclasificacion[0];
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                subclasificacion: misSublasificaciones
            });
        }
    });
});
router.get('/incidentes', function (req, res) {
    var query = 'CALL getIncidentes()';
    mysql_1.default.ejecutarQuery(query, function (err, incidentes) {
        var misIncidentes = incidentes[0];
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                incidentes: misIncidentes
            });
        }
    });
});
exports.default = router;
