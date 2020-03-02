"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var verificaToken = require('../server/middlewares/autenticacion').verificaToken;
var obtenerAlertasPendientes = require('../mysql/mysql-alertas.nit').obtenerAlertasPendientes;
var Alertas = require('../server/classes/alertas').Alertas;
var server_1 = __importDefault(require("../server/server"));
var mysql_1 = __importDefault(require("../mysql/mysql"));
var router = express_1.Router();
var alertas = new Alertas();
var socketServer = server_1.default.instance;
// Registrar nueva alerta de panico (Se cambió de socket a POST)
router.post('/', function (req, res) {
    // Recibir datos p t reporte
    var idUserCc = 1; // 1 = Sin atender
    var idComercReporte = req.body.idComercio;
    var idUserApp = req.body.idUsuario;
    var idUnidad = 1; // 1 = Ninguna unidad
    var fhDoc = mysql_1.default.instance.cnn.escape(obtenerFechaHoy());
    var fhAtaque = mysql_1.default.instance.cnn.escape(req.body.fecha);
    var tipoInc = 0; // 0 = Desconocido
    var descripEmerg = mysql_1.default.instance.cnn.escape('');
    var clasifEmerg = 0; // 0 = Normal
    var estatusActual = 0; // 0 = Sin atender
    var cierreConcl = mysql_1.default.instance.cnn.escape('');
    var query = "CALL addReporteRtID(\n        " + idUserCc + ",\n        " + idComercReporte + ",\n        " + idUserApp + ",\n        " + idUnidad + ",\n        " + fhDoc + ",\n        " + fhAtaque + ",\n        " + tipoInc + ",\n        " + descripEmerg + ",\n        " + clasifEmerg + ",\n        " + estatusActual + ",\n        " + cierreConcl + ",\n        @last_id);";
    mysql_1.default.ejecutarQuery(query, function (err, id) {
        if (err) {
            res.status(500).json({
                ok: false,
                message: 'Ocurrió un error al emitir alerta',
                err: err
            });
        }
        else {
            // Se retornan los datos del reporte
            var reporteAgregado = id[0][0].last_id;
            var alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercReporte, idUserApp, 1, 0);
            obtenerAlertasPendientes(function (err, alertas) {
                if (err) {
                    console.log('Error al obtener alertas pendientes');
                    console.log(err);
                }
                else {
                    socketServer.emitirAlertasActualizadas(alertas, 'NIT');
                }
            });
            console.log("Se cre\u00F3 el reporte " + reporteAgregado + " <==============");
            res.json({
                ok: true,
                reporteCreado: reporteAgregado,
                message: 'Reporte creado con éxito. Folio #' + reporteAgregado,
            });
            // Emitir a cliente android que la alerta se recibio con el # del reporte 
            //cliente.emit('alertaRecibida', `${reporteAgregado}`);
        }
    });
});
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
function obtenerFechaHoy() {
    var fh = new Date();
    var dia = fh.getDate();
    var mes = fh.getMonth() + 1;
    var anio = fh.getFullYear();
    var hora = fh.getHours();
    var min = fh.getMinutes();
    var seg = fh.getSeconds();
    var fechaCompleta = anio + "-" + mes + "-" + dia + " " + hora + ":" + min + ":" + seg;
    return fechaCompleta;
}
exports.default = router;
