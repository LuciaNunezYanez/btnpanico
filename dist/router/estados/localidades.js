"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var router = express_1.Router();
router.get('/', function (req, res) {
    var QUERY = 'CALL getLocalidades();';
    mysql_1.default.ejecutarQuery(QUERY, function (err, localidades) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                localidades: localidades[0]
            });
        }
    });
});
router.get('/:id_municipio', function (req, res) {
    var QUERY = "CALL getLocalidadIDMunicipio(" + req.params.id_municipio + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, localidades) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            var id_localidades = [];
            var nombre_localidad = [];
            for (var i = 0; i < localidades[0].length; i++) {
                id_localidades.push(localidades[0][i].ID_LOCALIDADES);
                nombre_localidad.push(localidades[0][i].NOMBRE_LOCALIDAD);
            }
            return res.json({
                ok: true,
                localidades: localidades[0],
                id_localidades: id_localidades,
                nombre_localidad: nombre_localidad
            });
        }
    });
});
exports.default = router;
