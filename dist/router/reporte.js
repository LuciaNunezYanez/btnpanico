"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var verificaToken = require('../server/middlewares/authenticacion').verificaToken;
var router = express_1.Router();
// verificaToken,
router.get('/:id', function (req, res) {
    // return res.json({usuario: req.usuario});
    var id = req.params.id;
    var escapedId = mysql_1.default.instance.cnn.escape(id);
    var query = "CALL getReporteID(" + escapedId + ")";
    mysql_1.default.ejecutarQuery(query, function (err, reporte) {
        var obj = reporte[0];
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                reporte: obj
            });
        }
    });
});
router.get('/app/personales/:id', function (req, res) {
    var query = "CALL getReportesUsuarioApp(" + req.params.id + ")";
    mysql_1.default.ejecutarQueryPr(query)
        .then(function (reportes) {
        return res.json({
            ok: true,
            reportes: reportes[0]
        });
    })
        .catch(function () {
        return res.json({
            ok: false,
            mensaje: 'No se pudieron obtener los reportes.'
        });
    });
});
// Trae el reporte completo (excepto activaciones, coordenadas y multimedia)
router.get('/full/:id', function (req, res) {
    var query = "CALL getReporteFull(" + mysql_1.default.instance.cnn.escape(req.params.id) + ")";
    // console.log(query);
    mysql_1.default.ejecutarQuery(query, function (err, reporte) {
        var _a, _b;
        if (err) {
            return res.json({
                ok: false,
                error: err
            });
        }
        else {
            var contactos = [];
            if ((_a = reporte[0][0]) === null || _a === void 0 ? void 0 : _a.nombre_contacto_emerg) {
                for (var index = 0; index < reporte[0].length; index++) {
                    contactos.push({
                        nombre_contacto_emerg: reporte[0][index].nombre_contacto_emerg,
                        telefono_contacto_emerg: reporte[0][index].telefono_contacto_emerg,
                        parentezco_contacto_emerg: reporte[0][index].parentezco_contacto_emerg
                    });
                }
            }
            if (!((_b = reporte[0][0]) === null || _b === void 0 ? void 0 : _b.id_reporte)) {
                return res.json({ ok: false, error: 'No existe el reporte' });
            }
            return res.json({
                ok: true,
                reporteFull: reporte[0][0],
                contactos: contactos
            });
        }
    });
});
// Filtto/buscador de reportes
router.post('/filtro/', function (req, res) {
    var folio_rep = mysql_1.default.instance.cnn.escape(req.body.folio || '');
    var folio_CAD = mysql_1.default.instance.cnn.escape(req.body.folioCAD || '');
    var fecha_inicio_rep = mysql_1.default.instance.cnn.escape(req.body.fecha_inicio || '');
    var fecha_fin_rep = mysql_1.default.instance.cnn.escape(req.body.fecha_fin || '');
    var tel_us = mysql_1.default.instance.cnn.escape(req.body.telefono || '');
    var calle_us = mysql_1.default.instance.cnn.escape(req.body.calle || '');
    var numero_us = mysql_1.default.instance.cnn.escape(req.body.numero || '');
    var colonia_us = mysql_1.default.instance.cnn.escape(req.body.colonia || '');
    var cp_us = mysql_1.default.instance.cnn.escape(req.body.cp || '');
    var municipio_us = mysql_1.default.instance.cnn.escape(req.body.municipio || '');
    var localidad_us = mysql_1.default.instance.cnn.escape(req.body.localidad || '');
    var id_operador_cc = mysql_1.default.instance.cnn.escape(req.body.id_operador || '');
    var sala_cc = mysql_1.default.instance.cnn.escape(req.body.sala || '');
    var estacion_cc = req.body.estacion || 0;
    // console.log(req.body);
    // console.log(sala_cc, sala_cc.length);
    // console.log(estacion_cc, estacion_cc.length);
    // console.log(fecha_fin_rep, fecha_fin_rep.length);
    // console.log(fecha_inicio_rep, fecha_inicio_rep.length);
    // No avanzar sin sala, estacion y fechas
    if (sala_cc.length <= 2 || estacion_cc == 0 || fecha_fin_rep.length <= 2 || fecha_inicio_rep.length <= 2) {
        return res.json({
            ok: false,
            mensaje: 'La sala, estación, fecha de inicio y fecha de fin son campos obligatorios.'
        });
    }
    var query = "CALL busquedaReportes(" + folio_rep + "," + folio_CAD + "," + fecha_inicio_rep + "," + fecha_fin_rep + ",\n        " + tel_us + "," + calle_us + "," + numero_us + "," + colonia_us + "," + cp_us + "," + municipio_us + "," + localidad_us + ",\n        " + id_operador_cc + "," + sala_cc + "," + estacion_cc + ");";
    mysql_1.default.ejecutarQuery(query, function (err, results) {
        if (err) {
            return res.json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                results: results[0]
            });
        }
    });
});
// No se utiliza por la aplicación móvil 
router.post('/', verificaToken, function (req, res) {
    // Recibir datos p t reporte
    var idUserCc = req.body.id_user_cc || 1; // 1 = Sin atender
    var idComercReporte = req.body.id_comerc;
    var idUserApp = req.body.id_user_app;
    var idUnidad = req.body.id_unidad || 1; // 1 = Ninguna unidad
    var fhDoc = mysql_1.default.instance.cnn.escape(req.body.fh_doc || '');
    var fhAtaque = mysql_1.default.instance.cnn.escape(req.body.fh_ataque || '');
    var tipoInc = req.body.tipo_incid || 1; // 1 = Desconocido
    var descripEmerg = mysql_1.default.instance.cnn.escape(req.body.descrip_emerg || '');
    var clasifEmerg = req.body.clasif_emerg || 0; // 0 = Normal
    var estatusActual = req.body.estatus || 0; // 0 = Sin atender
    var cierreConcl = mysql_1.default.instance.cnn.escape(req.body.cierre || '');
    var query = "CALL addReporteRtID(\n                    " + idUserCc + ",\n                    " + idComercReporte + ",\n                    " + idUserApp + ",\n                    " + idUnidad + ",\n                    " + fhDoc + ",\n                    " + fhAtaque + ",\n                    " + tipoInc + ",\n                    " + descripEmerg + ",\n                    " + clasifEmerg + ",\n                    " + estatusActual + ",\n                    " + cierreConcl + ",\n                    @last_id);";
    mysql_1.default.ejecutarQuery(query, function (err, id) {
        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                id: id[0][0].last_id
            });
        }
    });
});
exports.default = router;
