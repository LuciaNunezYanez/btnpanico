"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var router = express_1.Router();
// Obtener archivos multimedia por ID 
router.get('/:id', function (req, res) {
    var id = req.params.id;
    var escapedId = mysql_1.default.instance.cnn.escape(id);
    var query = "CALL getMultimedID(" + escapedId + ")";
    mysql_1.default.ejecutarQuery(query, function (err, multimedia) {
        if (err) {
            res.status(400).json({
                ok: false,
                error: err
            });
        }
        else {
            res.json({
                ok: true,
                multimedia: multimedia[0]
            });
        }
    });
});
// Agregar archivos multimedia 
router.post('/', function (req, res) {
    var fhCapturada = mysql_1.default.instance.cnn.escape(req.body.fh_captura);
    var tipoArchivo = mysql_1.default.instance.cnn.escape(req.body.tipo_archivo);
    var ruta = mysql_1.default.instance.cnn.escape(req.body.ruta);
    var idReporte = req.body.id_reporte;
    var query = "CALL addMultimediaRtID(\n                    " + fhCapturada + ",\n                    " + tipoArchivo + ",\n                    " + ruta + ",\n                    " + idReporte + ",\n                    @last_id);";
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
