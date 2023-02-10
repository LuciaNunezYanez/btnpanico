"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var configFB_1 = __importDefault(require("../../firebase/configFB"));
var notificaciones_1 = __importDefault(require("../../server/global/notificaciones"));
var verificaPermiso = require('../../server/middlewares/chat').verificaPermiso;
var router = express_1.Router();
// Enviar mensaje entre si.
// TODO: Códificar los mensajes.
router.post('/send', [verificaPermiso], function (req, res) {
    // Si se ejecuta el siguiente código SI PASÓ el middleware
    res.json({
        ok: true,
        chat: 'SI PUEDO CHATEAR'
    });
});
router.get('/:id_reporte', function (req, res) {
    var id_reporte = req.params.id_reporte;
    var QUERY = "SELECT * FROM chat WHERE id_reporte_chat = " + id_reporte + " LIMIT 1;";
    mysql_1.default.ejecutarQueryPr(QUERY).then(function (resp) {
        if (resp.length === 1) {
            return res.json({
                ok: true,
                mensaje: 'Datos del chat obtenidos',
                chat: resp[0]
            });
        }
        else {
            return res.json({ ok: false, mensaje: resp });
        }
    }).catch(function (e) {
        return res.json({ ok: false, mensaje: e });
    });
});
// Habilitar/deshabilitar chats
router.post('/changepermiso', function (req, res) {
    var tipo = req.body.tipo || '';
    var estatus = Number.parseInt(req.body.estatus);
    var estatusString = (estatus === 1) ? 'habilitó' : 'deshabilitó';
    var id_reporte_chat = Number.parseInt(req.body.id_reporte_chat || 0);
    var QUERY_UPDATE = '';
    switch (tipo) {
        case 'oun':
            QUERY_UPDATE = "UPDATE chat SET operador_unidad_chat = " + estatus + " WHERE id_reporte_chat = " + id_reporte_chat;
            break;
        case 'ous':
            QUERY_UPDATE = "UPDATE chat SET operador_usuario_chat = " + estatus + " WHERE id_reporte_chat = " + id_reporte_chat;
            break;
        case 'unus':
            QUERY_UPDATE = "UPDATE chat SET unidad_usuario_chat = " + estatus + " WHERE id_reporte_chat = " + id_reporte_chat;
            break;
        default:
            return res.json({
                ok: false,
                mensaje: 'No se encontró un chat con los parametros solicitados.'
            });
    }
    mysql_1.default.ejecutarQueryPr(QUERY_UPDATE).then(function (resp) {
        var _a, _b;
        // console.log('LA RESPUESTA DE MODIFICAR PERMISO');
        // console.log(resp);
        if (((_a = resp) === null || _a === void 0 ? void 0 : _a.affectedRows) != 0 && ((_b = resp) === null || _b === void 0 ? void 0 : _b.affectedRows) != undefined) {
            var QUERY_TOKEN = "CALL getTokensChat(" + id_reporte_chat + ");";
            mysql_1.default.ejecutarQueryPr(QUERY_TOKEN).then(function (resp) {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                if (resp.length > 0) {
                    var chat = resp[0][0];
                    var titulo = "Se cambiaron los permisos del chat. Reporte #" + id_reporte_chat;
                    var descripcion = '';
                    var descripcion2 = '';
                    var token = '';
                    var token2 = '';
                    // TODO:
                    // Enviar el numero de reporte para poder abrirlo y chatear
                    // También el tipo
                    var data = {
                        type: notificaciones_1.default.typeCambioEstatusChat,
                        id_reporte: id_reporte_chat,
                        estatus: estatus
                    };
                    // Depende el tipo es a quienes les enviará las notificaciones
                    switch (tipo) {
                        case 'oun':
                            if (((_a = chat) === null || _a === void 0 ? void 0 : _a.token_un.length) > 0) {
                                // Avisar a la unidad
                                descripcion = "Se " + estatusString + " el chat para conversar con el operador.";
                                token = (_b = chat) === null || _b === void 0 ? void 0 : _b.token_un;
                            }
                            break;
                        case 'ous':
                            if (((_c = chat) === null || _c === void 0 ? void 0 : _c.token_us.length) > 0) {
                                // Avisar al usuario
                                descripcion = "Se " + estatusString + " el chat para conversar con el operador.";
                                token = (_d = chat) === null || _d === void 0 ? void 0 : _d.token_us;
                            }
                            break;
                        case 'unus':
                            if (((_e = chat) === null || _e === void 0 ? void 0 : _e.token_un.length) > 0) {
                                // Avisar a la unidad
                                descripcion = "Se " + estatusString + " el chat para conversar con el usuario.";
                                token = (_f = chat) === null || _f === void 0 ? void 0 : _f.token_un;
                            }
                            if (((_g = chat) === null || _g === void 0 ? void 0 : _g.token_us.length) > 0) {
                                // Avisar al usuario
                                descripcion2 = "Se " + estatusString + " el chat para conversar con la unidad.";
                                token2 = (_h = chat) === null || _h === void 0 ? void 0 : _h.token_us;
                            }
                            break;
                    }
                    // ENVIAR LA NOTIFICACIÓN 
                    if (token.length > 0) {
                        configFB_1.default.enviarNotifEspecificaFB(titulo, descripcion, token, data)
                            .then(function (resp) {
                            // console.log('La notificación');
                            // console.log(resp);
                            if (resp.resp.successCount != 0) {
                                return res.json({
                                    ok: true,
                                    estatus: estatus,
                                    mensaje: 'Los permisos han sido modificados con exito.',
                                });
                            }
                            else {
                                return res.json({
                                    ok: true,
                                    estatus: estatus,
                                    mensaje: 'Los permisos han sido modificados con exito, pero no se notificó al usuario del cambio.',
                                });
                            }
                        })
                            .catch(function (e) {
                            return res.json({
                                ok: true,
                                estatus: estatus,
                                mensaje: 'Los permisos han sido modificados con exito, pero no se notificó al usuario del cambio.',
                                error: e
                            });
                        });
                    }
                    else {
                        return res.json({
                            ok: true,
                            estatus: estatus,
                            mensaje: 'Los permisos han sido modificados con exito, pero no se notificó al usuario del cambio.'
                        });
                    }
                    if (token2.length > 0) {
                        configFB_1.default.enviarNotifEspecificaFB(titulo, descripcion2, token2, data)
                            .then(function (resp) {
                            if (resp.resp.successCount != 0) {
                            }
                            else { }
                        })
                            .catch(function (e) { });
                    }
                    else { }
                }
                else {
                    return res.json({
                        ok: false,
                        mensaje: 'No se encontró un chat con los parametros solicitados.'
                    });
                }
            }).catch(function (e) {
                return res.json({
                    ok: false,
                    mensaje: e
                });
            });
        }
        else {
            return res.json({
                ok: false,
                mensaje: 'No se encontró un chat con los parametros solicitados.'
            });
        }
    }).catch(function (e) {
        return res.json({
            ok: false,
            mensaje: 'Ocurrió un error al modificar los permisos.',
            error: {
                mensaje: e
            }
        });
    });
});
exports.default = router;
