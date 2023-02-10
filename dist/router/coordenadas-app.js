"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var server_1 = __importDefault(require("../server/server"));
var router = express_1.Router();
var socketServer = server_1.default.instance;
// Log in
router.post('/:id_reporte', function (req, res) {
    var id_coord_reporte = Number.parseInt(req.params.id_reporte);
    var lat_coord_reporte = req.body.lat_coord_reporte;
    var lng_coord_reporte = req.body.lng_coord_reporte;
    var fecha_coord_reporte = mysql_1.default.instance.cnn.escape(req.body.fecha_coord_reporte);
    var lugar = req.body.lugar;
    if (lugar === undefined) {
        lugar = mysql_1.default.instance.cnn.escape('Actual');
    }
    else {
        lugar = mysql_1.default.instance.cnn.escape(lugar);
    }
    console.log('Coordenadas: Lat ' + lat_coord_reporte + ' Lng ' + lng_coord_reporte);
    // console.log("id_reporte: " + id_coord_reporte);
    // console.log("latitud: " + lat_coord_reporte);
    // console.log("longitud: " + lng_coord_reporte);
    // console.log("fecha: " + fecha_coord_reporte);
    // return; 
    var query = "CALL addCoordenadasRtID(\n        " + id_coord_reporte + ",\n        " + lat_coord_reporte + ",\n        " + lng_coord_reporte + ",\n        " + fecha_coord_reporte + ",\n        " + lugar + ",\n        @last_id);";
    // console.log(query);
    if (id_coord_reporte != undefined && lat_coord_reporte != undefined && lng_coord_reporte != undefined && fecha_coord_reporte != null) {
        mysql_1.default.ejecutarQuery(query, function (err, resp) {
            try {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        resp: err
                    });
                }
                else {
                    var data = {
                        id_coord_reporte: id_coord_reporte,
                        lat_coord_reporte: lat_coord_reporte,
                        lng_coord_reporte: lng_coord_reporte,
                        fecha_coord_reporte: fecha_coord_reporte
                    };
                    socketServer.emitirGeolocalizacion(id_coord_reporte, data);
                    return res.json({
                        ok: true,
                        resp: 'Exito al agregar coordenadas',
                        last_id: resp[0][0].last_id
                    });
                }
            }
            catch (e) {
                return res.status(400).json({
                    ok: false,
                    resp: e
                });
            }
        });
    }
    else {
        return res.status(400).json({
            ok: false,
            resp: 'Datos incompletos'
        });
    }
});
router.get('/:id_reporte', function (req, res) {
    try {
        var id_reporte = Number.parseInt(req.params.id_reporte);
        var query = "CALL getCoordenadasRep(" + id_reporte + ");";
        mysql_1.default.ejecutarQuery(query, function (err, coord) {
            var _a, _b, _c, _d, _e, _f;
            try {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        resp: err
                    });
                }
                else {
                    return res.json({
                        ok: true,
                        resp: 'Exito al obtener coordenadas',
                        id_coordenada: (_a = coord[0][0]) === null || _a === void 0 ? void 0 : _a.id_coordenada,
                        id_coord_reporte: (_b = coord[0][0]) === null || _b === void 0 ? void 0 : _b.id_coord_reporte,
                        lat_coord_reporte: (_c = coord[0][0]) === null || _c === void 0 ? void 0 : _c.lat_coord_reporte,
                        lng_coord_reporte: (_d = coord[0][0]) === null || _d === void 0 ? void 0 : _d.lng_coord_reporte,
                        fecha_coord_reporte: (_e = coord[0][0]) === null || _e === void 0 ? void 0 : _e.fecha_coord_reporte,
                        tipo_ubicacion: (_f = coord[0][0]) === null || _f === void 0 ? void 0 : _f.tipo_ubicacion
                    });
                }
            }
            catch (e) {
                return res.status(400).json({
                    ok: false,
                    resp: e
                });
            }
        });
    }
    catch (e) {
        return res.status(400).json({
            ok: false,
            resp: 'ID de reporte incorrecto'
        });
    }
});
exports.default = router;
