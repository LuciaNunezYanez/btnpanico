"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var router = express_1.Router();
router.get('/:id_usuario', function (req, res) {
    var id_usuario = Number.parseInt(req.params.id_usuario);
    var queryGETtoken = "CALL getTokenApp(" + id_usuario + ");";
    mysql_1.default.ejecutarQuery(queryGETtoken, function (err, resultado) {
        var _a;
        if (err) {
            return res.json({
                ok: false,
                error: err
            });
        }
        else {
            if ((_a = resultado[0][0]) === null || _a === void 0 ? void 0 : _a.token_FB) {
                return res.json({
                    ok: true,
                    token: resultado[0][0].token_FB,
                    message: 'Token obtenido con éxito'
                });
            }
            else {
                return res.json({
                    ok: false,
                    message: 'No se tiene registro del usuario y/o token'
                });
            }
        }
    });
});
router.put('/:id_usuario', function (req, res) {
    var id_usuario = Number.parseInt(req.params.id_usuario);
    var token = mysql_1.default.instance.cnn.escape(req.body.token);
    var queryEditar = "CALL updateTokenApp(" + id_usuario + ", " + token + ");";
    // console.log(queryEditar);
    mysql_1.default.ejecutarQuery(queryEditar, function (err, resultado) {
        if (err) {
            return res.json({
                ok: false,
                error: err
            });
        }
        else {
            if (resultado.affectedRows) {
                return res.json({
                    ok: true,
                    res: {
                        message: 'Éxito al modificar token'
                    }
                });
            }
            else {
                return res.json({
                    ok: false,
                    res: {
                        message: 'No se modificó ningún token'
                    }
                });
            }
        }
    });
});
exports.default = router;
