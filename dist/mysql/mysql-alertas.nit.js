"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("./mysql"));
function obtenerAlertasPendientes(callback) {
    var query = "CALL getReportesPend();";
    mysql_1.default.ejecutarQuery(query, function (err, alertas) {
        if (err) {
            callback({
                ok: false,
                err: err
            });
        }
        else {
            callback(null, {
                ok: true,
                alertas: alertas[0],
                status: alertas[1]
            });
        }
    });
}
function abrirPeticion(alerta, callback) {
    var id_reporte = alerta.id_reporte, estatus_actual = alerta.estatus_actual, id_user_cc = alerta.id_user_cc;
    if (estatus_actual === 0) {
        var query = "update reporte set id_user_cc = " + id_user_cc + ", estatus_actual = 1 where id_reporte = " + id_reporte;
        mysql_1.default.ejecutarQuery(query, function (err, respuesta) {
            if (err) {
                callback({
                    ok: false,
                    err: err
                });
            }
            else {
                callback(null, {
                    ok: true,
                    respuesta: respuesta
                });
            }
        });
    }
    else {
        callback(null, {
            ok: false,
            err: 'La alerta ya fue atendida por otro usuario. '
        });
    }
}
module.exports = {
    obtenerAlertasPendientes: obtenerAlertasPendientes,
    abrirPeticion: abrirPeticion
};
