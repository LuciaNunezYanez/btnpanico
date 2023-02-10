"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var router = express_1.Router();
router.get('/:id', function (req, res) {
    var id_usuario = Number.parseInt(req.params.id);
    if (id_usuario === undefined || id_usuario === 0) {
        return res.json({
            ok: false,
            message: 'ID inválido'
        });
    }
    var QUERY = "CALL getContactEmergAPP(" + id_usuario + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, resp) {
        if (err) {
            return res.json({
                ok: false,
                message: err['sqlMessage']
            });
        }
        else {
            return res.json({
                ok: true,
                contactos: resp[0]
            });
        }
    });
});
router.post('/:id', function (req, res) {
    var id_usuario = mysql_1.default.instance.cnn.escape(req.params.id);
    var contactos = req.body;
    for (var index = 0; index < contactos.length; index++) {
        var nombre = mysql_1.default.instance.cnn.escape(contactos[index].nombre_contacto_emerg);
        var telefono = mysql_1.default.instance.cnn.escape(contactos[index].telefono_contacto_emerg);
        var parentezco = mysql_1.default.instance.cnn.escape(contactos[index].parentezco_contacto_emerg || '');
        var QUERY = "CALL addContactoEmergencia(" + nombre + ", " + telefono + ", " + parentezco + ", " + id_usuario + ");";
        mysql_1.default.ejecutarQuery(QUERY, function (err, resp) {
            if (err) {
                return res.json({
                    ok: false,
                    message: err['sqlMessage']
                });
            }
        });
    }
    return res.json({
        ok: true
    });
});
exports.default = router;
