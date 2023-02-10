"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var admin = require("firebase-admin");
var FB = /** @class */ (function () {
    function FB() {
    }
    FB.enviarNotifEspecificaFB = function (titulo, descripcion, token, data) {
        return new Promise(function (resolve, reject) {
            try {
                var payload = {
                    notification: {
                        title: titulo,
                        body: descripcion,
                    },
                    data: data
                };
                var options = {
                    priority: 'high',
                    timeToLive: 60 * 60 * 24,
                };
                admin.messaging().sendToDevice(token, payload, options)
                    .then(function (resp) {
                    resolve({
                        ok: true,
                        mensaje: 'Notificación enviada con éxito.',
                        resp: resp,
                        data: data
                    });
                })
                    .catch(function (err) {
                    reject({
                        ok: false,
                        mensaje: 'Ocurrió un error al enviar la notificación.',
                        err: err,
                        data: data
                    });
                });
            }
            catch (error) {
                reject({
                    ok: false,
                    mensaje: 'Ocurrió un error al enviar la notificación..',
                    err: error,
                    data: data
                });
            }
        });
    };
    return FB;
}());
exports.default = FB;
