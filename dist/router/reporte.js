"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var router = express_1.Router();
router.get('/:id', function (req, res) {
    var id = req.params.id;
    // Escapar ID 
    var escapedId = mysql_1.default.instance.cnn.escape(id);
    var query = "CALL getReporteID(" + escapedId + ")";
    mysql_1.default.ejecutarQuery(query, function (err, reporte) {
        var obj = reporte[0];
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                reporte: obj
            });
        }
    });
});
router.post('/', function (req, res) {
    // Recibir datos p t reporte
    var idUserCc = req.body.id_user_cc || 1; // 1 = Sin atender
    var idComercReporte = req.body.id_comerc;
    var idUserApp = req.body.id_user_app;
    var idUnidad = req.body.id_unidad || 1; // 1 = Ninguna unidad
    var fhDoc = mysql_1.default.instance.cnn.escape(req.body.fh_doc || '');
    var fhAtaque = mysql_1.default.instance.cnn.escape(req.body.fh_ataque || '');
    var tipoInc = req.body.tipo_incid || 0; // 0 = Desconocido
    var descripEmerg = mysql_1.default.instance.cnn.escape(req.body.descrip_emerg || '');
    var clasifEmerg = req.body.clasif_emerg || 0; // 0 = Normal
    var estatusActual = req.body.estatus || 0; // 0 = Sin atender
    var cierreConcl = mysql_1.default.instance.cnn.escape(req.body.cierre || '');
    var query = "CALL addReporteRtID(\n                    " + idUserCc + ",\n                    " + idComercReporte + ",\n                    " + idUserApp + ",\n                    " + idUnidad + ",\n                    " + fhDoc + ",\n                    " + fhAtaque + ",\n                    " + tipoInc + ",\n                    " + descripEmerg + ",\n                    " + clasifEmerg + ",\n                    " + estatusActual + ",\n                    " + cierreConcl + ",\n                    @last_id);";
    mysql_1.default.ejecutarQuery(query, function (err, id) {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                id: id[0][0].last_id
            });
        }
    });
});
exports.default = router;
