"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var verificaTokenIDUsuario = require('../../server/middlewares/authenticacion').verificaTokenIDUsuario;
var router = express_1.Router();
router.post('/app', [verificaTokenIDUsuario], function (req, res) {
    try {
        var id_usuario = Number.parseInt(req.body.id_usuario);
        var query = (req.body.tipo === 'externo') ?
            "CALL updateTokenApp(" + id_usuario + ", " + mysql_1.default.instance.cnn.escape(req.body.token_FB) + ");" :
            "CALL updateTokenCC(" + id_usuario + ", " + mysql_1.default.instance.cnn.escape(req.body.token_FB) + ");";
        mysql_1.default.ejecutarQuery(query, function (err, resultado) {
            if (resultado.affectedRows == 0) {
                // No se editó el token FB
                return res.json({
                    ok: false,
                    error: err
                });
            }
            else {
                return res.json({
                    ok: true,
                    message: '¡Token del dispositivo registrado con éxito!'
                });
            }
        });
    }
    catch (e) {
        return res.json({
            ok: false,
            error: 'Datos del token incompletos!'
        });
    }
});
exports.default = router;
