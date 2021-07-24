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
        var _a;
        if (err) {
            return res.json({
                ok: false,
                message: err['sqlMessage']
            });
        }
        else {
            if (!((_a = resp[0][0]) === null || _a === void 0 ? void 0 : _a.id_contacto_emergencia)) {
                return res.json({
                    ok: false,
                    message: 'Sin contacto de emergencia'
                });
            }
            return res.json({
                ok: true,
                contacto_emergencia: resp[0][0]
            });
        }
    });
});
router.post('/', function (req, res) {
    var id_usuario = mysql_1.default.instance.cnn.escape(req.body.idUsuario);
    var nombre = mysql_1.default.instance.cnn.escape(req.body.nombre_contacto_emerg);
    var telefono = mysql_1.default.instance.cnn.escape(req.body.telefono_contacto_emerg);
    var parentezco = mysql_1.default.instance.cnn.escape(req.body.parentezco_contacto_emerg || '');
    if (id_usuario === undefined || nombre === undefined || telefono === undefined || nombre.length < 5 || telefono.length < 9) {
        return res.json({
            ok: false,
            message: 'Datos del contacto incompletos'
        });
    }
    var QUERY = "CALL addContactoEmergencia(" + nombre + ", " + telefono + ", " + parentezco + ", " + id_usuario + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, resp) {
        if (err) {
            return res.json({
                ok: false,
                message: err['sqlMessage']
            });
        }
        else {
            return res.json({
                ok: !(resp[0][0]['res'] === 0),
                id_contacto_emergencia: resp[0][0]['id_contacto_emergencia']
            });
        }
    });
});
exports.default = router;
