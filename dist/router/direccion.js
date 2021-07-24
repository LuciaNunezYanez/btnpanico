"use strict";
// Consumir procedimiento almacenadoo getDireccionID(ID)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var router = express_1.Router();
router.get('/:id_direccion', function (req, res) {
    var query = "CALL getDireccionID(" + req.params.id_direccion + ");";
    mysql_1.default.ejecutarQuery(query, function (err, direccion) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                direccion: direccion[0][0]
            });
        }
    });
});
router.post('/:id', function (req, res) {
    var idDireccion = req.params.id;
    if (!idDireccion) {
        return res.json({
            ok: false,
            resp: '¡Datos de dirección incompleta!'
        });
    }
    var _a = req.body, calle = _a.calle, numero = _a.numero, colonia = _a.colonia, cp = _a.cp, entre1 = _a.entre1, entre2 = _a.entre2, referencia = _a.referencia, idLocalidad = _a.idLocalidad, lat = _a.lat, lg = _a.lg;
    if (!idLocalidad)
        return res.json({
            ok: false,
            resp: 'Datos de localidad incompleta'
        });
    cp = !cp ? 0 : cp;
    lat = !lat ? 0.0 : lat;
    lg = !lg ? 0.0 : lg;
    entre1 = entre1 === undefined ? '' : entre1;
    entre2 = entre2 === undefined ? '' : entre2;
    if (!calle || !numero || !colonia || !referencia)
        return res.json({
            ok: false,
            resp: 'Datos de dirección incompleta'
        });
    var QUERY = "CALL updateDireccion(\n        " + mysql_1.default.instance.cnn.escape(calle) + ",\n        " + mysql_1.default.instance.cnn.escape(numero) + ",\n        " + mysql_1.default.instance.cnn.escape(colonia) + ",\n        " + cp + ",\n        " + mysql_1.default.instance.cnn.escape(entre1) + ",\n        " + mysql_1.default.instance.cnn.escape(entre2) + ",\n        " + mysql_1.default.instance.cnn.escape(referencia) + ",\n        " + idLocalidad + ",\n        " + lat + ",\n        " + lg + ",\n        " + idDireccion + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, resp) {
        if (err) {
            return res.json({
                ok: false,
                resp: err
            });
        }
        else {
            return res.json({
                ok: resp[0][0].res === 1 ? true : false,
                resp: resp[0][0].resp
            });
        }
    });
});
exports.default = router;
