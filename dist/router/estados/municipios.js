"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var router = express_1.Router();
router.get('/', function (req, res) {
    var QUERY = 'CALL getmunicipios();';
    mysql_1.default.ejecutarQuery(QUERY, function (err, municipios) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                municipios: municipios[0]
            });
        }
    });
});
router.get('/:id_estado', function (req, res) {
    var QUERY = "CALL getMunicipioIDEstado(" + req.params.id_estado + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, municipios) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            var id_municipios = [];
            var nombre_municipio = [];
            for (var i = 0; i < municipios[0].length; i++) {
                id_municipios.push(municipios[0][i].ID_MUNICIPIOS);
                nombre_municipio.push(municipios[0][i].NOMBRE_MUNICIPIO);
            }
            return res.json({
                ok: true,
                municipios: municipios[0],
                id_municipios: id_municipios,
                nombre_municipio: nombre_municipio
            });
        }
    });
});
exports.default = router;
