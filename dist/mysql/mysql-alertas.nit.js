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
function abrirPeticion(idReporte, idUsuarioNIT, callback) {
    var query = "CALL editEstatusReporte(" + idReporte + ", " + idUsuarioNIT + ", 1, @nuevo_estatus);";
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
module.exports = {
    obtenerAlertasPendientes: obtenerAlertasPendientes,
    abrirPeticion: abrirPeticion
};
