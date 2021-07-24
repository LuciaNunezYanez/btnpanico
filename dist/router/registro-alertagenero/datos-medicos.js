"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var router = express_1.Router();
router.get('/:id', function (req, res) {
    var id = Number.parseInt(req.params.id);
    if (id === null || id === undefined || id <= 0) {
        return res.json({
            ok: false,
            message: 'ID médico inválido'
        });
    }
    var QUERY = "CALL getDatoMedico(" + id + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, resp) {
        if (err) {
            return res.json({
                ok: false,
                message: err['sqlMessage']
            });
        }
        else {
            if (!resp[0][0]) {
                return res.json({
                    ok: false,
                    message: 'El ID médico no existe'
                });
            }
            res.json({
                ok: true,
                datos_medicos: resp[0][0]
            });
        }
    });
});
router.post('/', function (req, res) {
    var habla = mysql_1.default.instance.cnn.escape(req.body.habla || '2');
    var escucha = mysql_1.default.instance.cnn.escape(req.body.escucha || '2');
    var lee = mysql_1.default.instance.cnn.escape(req.body.lee || '2');
    var escribe = mysql_1.default.instance.cnn.escape(req.body.escribe || '2');
    var habla_LSM = mysql_1.default.instance.cnn.escape(req.body.habla_LSM || '2');
    var toma_medicamentos = mysql_1.default.instance.cnn.escape(req.body.toma_medicamentos || '');
    var peso = mysql_1.default.instance.cnn.escape(req.body.peso || '');
    var estatura = mysql_1.default.instance.cnn.escape(req.body.estatura || '');
    var senas_particulares = mysql_1.default.instance.cnn.escape(req.body.senas_particulares || '');
    var QUERY = "CALL addDatosMedicos(" + habla + ", " + escucha + ", " + lee + ", " + escribe + ", " + habla_LSM + ", " + toma_medicamentos + ", " + peso + ", " + estatura + ", " + senas_particulares + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, resp) {
        if (err) {
            return res.json({
                ok: false,
                message: err['sqlMessage']
            });
        }
        else {
            res.json({
                ok: true,
                id_dato_medico: resp[0][0]['id'],
                res: resp[0][0]['res']
            });
        }
    });
});
exports.default = router;
