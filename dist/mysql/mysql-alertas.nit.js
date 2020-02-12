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
function cerrarPeticion(data, callback) {
    var id_reporte = data.id_reporte, id_user_cc = data.id_user_cc, estatus_actual = data.estatus_actual, tipo_incid = data.tipo_incid, descrip_emerg = data.descrip_emerg, cierre_conclusion = data.cierre_conclusion, num_unidad = data.num_unidad;
    descrip_emerg = mysql_1.default.instance.cnn.escape(descrip_emerg);
    cierre_conclusion = mysql_1.default.instance.cnn.escape(cierre_conclusion);
    num_unidad = mysql_1.default.instance.cnn.escape(num_unidad);
    // También agregar combo box de corporaciones para recibir el ID 
    var corporacion = 4; //DESCONOCIDA 
    var QUERY = "CALL editCerrarReporte(\n        " + id_reporte + ", \n        " + id_user_cc + ", \n        " + estatus_actual + ", \n        " + tipo_incid + ", \n        " + descrip_emerg + ", \n        " + cierre_conclusion + ", \n        " + corporacion + ", \n        " + num_unidad + "\n    );";
    if (estatus_actual === 1) {
        mysql_1.default.ejecutarQuery(QUERY, function (err, resultado) {
            if (err) {
                callback({
                    ok: false,
                    err: err
                });
            }
            else {
                callback(null, {
                    ok: true,
                    resultado: resultado
                });
            }
        });
    }
    else {
        callback(null, {
            ok: false,
            err: 'La alerta ya fue cerrada por otro usuario. '
        });
    }
}
module.exports = {
    obtenerAlertasPendientes: obtenerAlertasPendientes,
    abrirPeticion: abrirPeticion,
    cerrarPeticion: cerrarPeticion
};
