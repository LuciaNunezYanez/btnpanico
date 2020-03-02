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
var obtenerAlertasPendientes = require('../mysql/mysql-alertas.nit').obtenerAlertasPendientes;
router.get('/:id_reporte', function (req, res) {
    var id_reporte = req.params.id_reporte;
    var QUERY = "CALL getActivacionesReporte(" + id_reporte + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, activaciones) {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
        else {
            // Emitir a un usuario en especifico la hora del nuevo botonazo 
            // if(Number.parseInt(id_reporte) >= 1){
            //     socketServer.emitirListaBotonazos(Number.parseInt(id_reporte), { activaciones: activaciones[0] });
            // }
            return res.json({
                ok: true,
                activaciones: activaciones[0]
            });
        }
    });
});
// Cancelar la alerta o activación
router.put('/:id_reporte', function (req, res) {
    var id_reporte = Number.parseInt(req.params.id_reporte);
    var estatus = Number.parseInt(req.body.estatus);
    var QUERY = "UPDATE reporte SET estatus_actual = " + estatus + " WHERE id_reporte = " + id_reporte + ";";
    mysql_1.default.ejecutarQuery(QUERY, function (err, resultado) {
        if (err) {
            console.log('Error al modificar el estatus del reporte');
            console.log(err);
            return res.status(500).json({
                ok: false,
                err: err
            });
        }
        else {
            // console.log('Todo salió bien');
            // console.log(resultado);
            return res.json({
                ok: true,
                col_afectadas: resultado.affectedRows
            });
        }
    });
});
// Registrar cada vez que se presiona el botón de pánico con un reporte existente generado
router.post('/:id_reporte', function (req, res) {
    var id_reporte = Number.parseInt(req.params.id_reporte);
    var fecha_activacion = mysql_1.default.instance.cnn.escape(req.body.fecha_activacion);
    var QUERY = "CALL addActivacionReporte(" + id_reporte + ", " + fecha_activacion + ");";
    if (id_reporte >= 1 && fecha_activacion != undefined) {
        mysql_1.default.ejecutarQuery(QUERY, function (err, resp) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }
            else {
                if (resp.affectedRows && resp.affectedRows == 1) {
                    // Mandar lista actualizada a todos los usuarios 
                    obtenerAlertasPendientes(function (err, alertas) {
                        if (err) {
                            // Deberia de mostrar una pantalla de alerta de error al traer la nueva lista
                            console.log('Ocurrió un error al agregar botonazo');
                            console.log(err);
                            return res.json({
                                ok: false,
                                error: err
                            });
                        }
                        else {
                            // Emitir a todos los usuarios la lista actualizada de alertas
                            socketServer.emitirAlertasActualizadas(alertas, 'NIT');
                            // Una vez agregada la alerta se actualiza la lista
                            var QUERY_1 = "CALL getActivacionesReporte(" + id_reporte + ");";
                            mysql_1.default.ejecutarQuery(QUERY_1, function (err, activaciones) {
                                if (err) {
                                    console.log('Error al obtener activaciones por reporte');
                                    console.log(err);
                                    return res.json({
                                        ok: false,
                                        error: err
                                    });
                                }
                                else {
                                    // Emitir a un usuario en especifico la hora del nuevo botonazo 
                                    socketServer.emitirListaBotonazos(id_reporte, { activaciones: activaciones[0] });
                                    // Responder
                                    return res.json({
                                        ok: true
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    return res.json({
                        ok: false,
                        error: 'No se insertó activación'
                    });
                }
            }
        });
    }
    else {
        return res.json({
            ok: false,
            error: 'Información incompleta'
        });
    }
});
exports.default = router;
