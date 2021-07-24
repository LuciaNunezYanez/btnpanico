"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("./mysql"));
var decodificarToken = require('../server/middlewares/autenticacion').decodificarToken;
function obtenerAlertasPendientes(data, callback) {
    // data es object {estacion y sala}
    // const query = `CALL getReportesPend(${data.idEstacion}, ${data.sala});`;
    var query = "CALL getReportesPend(" + mysql_1.default.instance.cnn.escape(data.sala) + ", " + data.estacion + ");";
    console.log(query + " <----------- ");
    mysql_1.default.ejecutarQuery(query, function (err, alertas) {
        if (err) {
            callback({
                ok: false,
                err: err
            });
        }
        else {
            // console.log(alertas[0]);
            callback(null, {
                ok: true,
                alertas: alertas[0],
                status: alertas[1]
            });
        }
    });
}
function abrirPeticion(alerta, callback) {
    // console.log('ABRIR PETICION MYSQL ALERTAS');
    // console.log(alerta);
    var id_reporte = alerta.id_reporte, estatus_actual = alerta.estatus_actual, id_user_cc = alerta.id_user_cc, nuevo_estatus = alerta.nuevo_estatus;
    if (estatus_actual === 0 || estatus_actual === 3) {
        var QUERY = "CALL editarEstatusReporte(" + id_user_cc + ", " + nuevo_estatus + ", " + id_reporte + ");";
        mysql_1.default.ejecutarQuery(QUERY, function (err, respuesta) {
            if (err) {
                return callback({
                    ok: false,
                    err: err
                });
            }
            else {
                return callback(null, {
                    ok: true,
                    respuesta: respuesta
                });
            }
        });
    }
    else {
        return callback(null, {
            ok: false,
            err: 'La alerta ya fue atendida por otro usuario. '
        });
    }
}
/* Puede cerrar alertas con estatus 0 y estatus 3 (Sin modificarlo)*/
function cerrarPeticion(data, callback) {
    var id_reporte = data.id_reporte, estatus_actual = data.estatus_actual, tipo_incid = data.tipo_incid, descrip_emerg = data.descrip_emerg, cierre_conclusion = data.cierre_conclusion, num_unidad = data.num_unidad, token = data.token;
    var id_user_cc;
    // Decodificar token 
    var tokenDecodificado = decodificarToken(token);
    if (tokenDecodificado.ok && tokenDecodificado.usuario) {
        id_user_cc = tokenDecodificado.usuario.id_usuario;
        // console.log('EL ID DEL USUARIO ES: ' + id_user_cc);
    }
    else {
        // console.log('Token decodificado');
        // console.log(tokenDecodificado);
        callback({
            ok: false,
            err: 'El id del usuario no viene en el token'
        });
        return;
    }
    var corporacion = 4; //DESCONOCIDA 
    if (estatus_actual === 1) {
        var QUERY = "CALL editCerrarReporte(\n            " + id_reporte + ", \n            " + id_user_cc + ", \n            " + estatus_actual + ", \n            " + tipo_incid + ", \n            " + mysql_1.default.instance.cnn.escape(descrip_emerg) + ", \n            " + mysql_1.default.instance.cnn.escape(cierre_conclusion) + ", \n            " + corporacion + ", \n            " + mysql_1.default.instance.cnn.escape(num_unidad) + "\n        );";
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
    else if (estatus_actual === 3) {
        var QUERY = "CALL editCerrarReporteCancelado(\n            " + id_reporte + ", \n            " + id_user_cc + ", \n            " + estatus_actual + ", \n            " + tipo_incid + ", \n            " + mysql_1.default.instance.cnn.escape(descrip_emerg) + ", \n            " + mysql_1.default.instance.cnn.escape(cierre_conclusion) + ", \n            " + corporacion + ", \n            " + mysql_1.default.instance.cnn.escape(num_unidad) + "\n        );";
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
        callback({
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
