"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var admin = require('firebase-admin');
var router = express_1.Router();
router.post('/:id_usuario', function (req, res) {
    var id_usuario = Number.parseInt(req.params.id_usuario);
    var titulo = req.body.titulo;
    var descripcion = req.body.descripcion;
    var payload = {
        notification: {
            title: titulo,
            body: descripcion,
        }
    };
    var options = {
        priority: 'high',
        timeToLive: 60 * 60 * 24
    };
    // Obtener token de la base de datos
    var QUERY = "CALL getTokenApp(" + id_usuario + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, resp) {
        var _a;
        if (err) {
            return res.json({
                ok: false,
                message: err['sqlMessage']
            });
        }
        else {
            if ((_a = resp[0][0]) === null || _a === void 0 ? void 0 : _a.token_FB) {
                var registrationToken = resp[0][0].token_FB;
                // Enviar token con apoyo de Firebase
                try {
                    admin.messaging().sendToDevice(registrationToken, payload, options)
                        .then(function (resp) {
                        if (resp.results[0].error) {
                            return res.json({
                                ok: false,
                                message: 'Error al enviar mensaje',
                                err: resp.results[0].error
                            });
                        }
                        console.log(resp.results[0].error);
                        return res.json({
                            ok: true,
                            message: 'Éxito al enviar mensaje',
                            resp: resp
                        });
                    })
                        .catch(function (err) {
                        return res.json({
                            ok: false,
                            message: 'Error al enviar mensaje',
                            err: err
                        });
                    });
                }
                catch (excepcion) {
                    return res.json({
                        ok: false,
                        message: excepcion
                    });
                }
            }
            else {
                return res.json({
                    ok: false,
                    message: 'Error al enviar mensaje, token de usuario inválido',
                });
            }
        }
    });
});
exports.default = router;
