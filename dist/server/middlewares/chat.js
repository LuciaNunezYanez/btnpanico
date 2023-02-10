"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("../../mysql/mysql"));
// Comprueba que se pueda chatear entre dos usuarios
var verificaPermiso = function (req, res, next) {
    var tipo = req.body.tipo || '';
    var id_operador_cc_chat = req.body.id_operador_cc_chat || 0;
    var id_unidad_chat = req.body.id_unidad_chat || 0;
    var id_usuario_chat = req.body.id_usuario_chat || 0;
    var id_reporte_chat = req.body.id_reporte_chat || 0;
    var QUERY = '';
    switch (tipo) {
        case 'oun':
            QUERY = "SELECT * FROM chat WHERE id_operador_cc_chat = " + id_operador_cc_chat + " AND id_unidad_chat = " + id_unidad_chat + " AND id_reporte_chat = " + id_reporte_chat + " ORDER BY id_chat DESC LIMIT 1";
            break;
        case 'ous':
            QUERY = "SELECT * FROM chat WHERE id_operador_cc_chat = " + id_operador_cc_chat + " AND id_usuario_chat = " + id_usuario_chat + " AND id_reporte_chat = " + id_reporte_chat + " ORDER BY id_chat DESC LIMIT 1";
            break;
        case 'unus':
            QUERY = "SELECT * FROM chat WHERE id_unidad_chat = " + id_unidad_chat + " AND id_usuario_chat = " + id_usuario_chat + " AND id_reporte_chat = " + id_reporte_chat + " ORDER BY id_chat DESC LIMIT 1";
            break;
        default:
            return res.json({
                ok: false,
                mensaje: "La petici\u00F3n no cumple con los parametros suficientes."
            });
    }
    mysql_1.default.ejecutarQueryPr(QUERY).then(function (resp) {
        if (resp.length > 0 && resp.length < 5) {
            // Ya que existe el registro ver si se tiene el permiso de chater entre si
            console.log(resp);
            var permiso = 0;
            switch (tipo) {
                case 'oun':
                    permiso = resp[0].operador_unidad_chat;
                    break;
                case 'ous':
                    permiso = resp[0].operador_usuario_chat;
                    break;
                case 'unus':
                    permiso = resp[0].unidad_usuario_chat;
                    break;
            }
            if (permiso == 1) {
                return next();
            }
            return res.json({
                ok: false,
                mensaje: 'No cuenta con el permiso para chatear con este usuario'
            });
        }
        // No se encontró un chat que coincida
        return res.json({
            ok: false,
            mensaje: 'No se encontró un chat que coincida',
            error: {
                mensaje: resp
            }
        });
    }).catch(function (e) {
        return res.json({
            ok: false,
            mensaje: "Ocurri\u00F3 un error al buscar chat: " + e
        });
    });
};
module.exports = {
    verificaPermiso: verificaPermiso
};
