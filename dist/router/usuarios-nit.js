"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../mysql/mysql"));
var _a = require('../server/middlewares/authenticacion'), verificaToken = _a.verificaToken, verificaAdmin_role = _a.verificaAdmin_role;
var bcrypt = require('bcrypt');
var router = express_1.Router();
var salt = bcrypt.genSaltSync(10);
// Obtener usuario por usuario
router.get('/:id', [verificaToken, verificaAdmin_role], function (req, res) {
    var idusuario = mysql_1.default.instance.cnn.escape(req.params.id);
    var query = "CALL getUsuarioCCID(" + idusuario + ")";
    mysql_1.default.ejecutarQuery(query, function (err, usuario) {
        if (err) {
            return res.status(400).json({
                ok: false,
                resp: err
            });
        }
        else {
            return res.json({
                ok: true,
                resp: usuario[0][0]
            });
        }
    });
});
router.get('/asociac/:asoc', function (req, res) {
    var query = "CALL getUsuariosAsocUnidad(" + req.params.asoc + ")";
    mysql_1.default.ejecutarQueryPr(query).then(function (usuarios) {
        return res.json({
            ok: true,
            usuarios: usuarios[0]
        });
    }).catch(function (err) {
        return res.json({
            ok: false,
            resp: err
        });
    });
});
router.get('/usuarios/:sala/:estacion/:dpto', function (req, res) {
    var sala = mysql_1.default.instance.cnn.escape(req.params.sala);
    var estacion = req.params.estacion;
    var dpto = mysql_1.default.instance.cnn.escape(req.params.dpto);
    var query = "CALL getUsuariosCC(" + sala + "," + estacion + "," + dpto + ")";
    mysql_1.default.ejecutarQuery(query, function (err, usuarios) {
        if (err) {
            return res.json({
                ok: false,
                resp: err
            });
        }
        else {
            return res.json({
                ok: true,
                usuarios: usuarios[0]
            });
        }
    });
});
// Agregar usuarios NIT
// [verificaToken, verificaAdmin_role], 
router.post('/', function (req, res) {
    console.log(req.body);
    // Encriptar contraseña FORMA 1 
    var contrasena = (req.body.contrasena);
    // Quizá quitando el escape
    var contrEncript = bcrypt.hashSync(contrasena, salt);
    contrEncript = mysql_1.default.instance.cnn.escape(contrEncript);
    var nombre = mysql_1.default.instance.cnn.escape(req.body.nombres);
    var apePat = mysql_1.default.instance.cnn.escape(req.body.apellPat);
    var apeMat = mysql_1.default.instance.cnn.escape(req.body.apellMat) || '';
    var usuario = mysql_1.default.instance.cnn.escape(req.body.usuario);
    var tipoUsuario = req.body.tipo;
    var depend = mysql_1.default.instance.cnn.escape(req.body.depend);
    var sexo = mysql_1.default.instance.cnn.escape(req.body.sexo);
    var estatus = req.body.estatus || 1;
    var sala = mysql_1.default.instance.cnn.escape(req.body.sala || 'C5DURANGO');
    var estacion = req.body.estacion || 2020023;
    var asociacion = req.body.asociacion || 0;
    var dpto = mysql_1.default.instance.cnn.escape(req.body.dpto || '');
    var p_normal = 0, p_tr = 0, p_admin = 0, p_app_emerg = 0;
    switch (req.body.privilegio) {
        case 'p_normal':
            p_normal = 1;
            p_tr = 0;
            p_admin = 0;
            p_app_emerg = 0;
            break;
        case 'p_tr':
            p_normal = 0;
            p_tr = 1;
            p_admin = 0;
            p_app_emerg = 0;
            break;
        case 'p_normal_admin':
            p_normal = 1;
            p_tr = 0;
            p_admin = 1;
            p_app_emerg = 0;
            break;
        case 'p_tr_admin':
            p_normal = 0;
            p_tr = 1;
            p_admin = 1;
            p_app_emerg = 0;
            break;
        case 'p_app_emerg':
            p_normal = 0;
            p_tr = 0;
            p_admin = 0;
            p_app_emerg = 1;
            break;
        default:
            p_normal = 0;
            p_tr = 0;
            p_admin = 0;
            p_app_emerg = 0;
            break;
    }
    var QUERY;
    // Si existe la unidad se agrega a la tabla, de lo contrario es un usuario normal
    if (req.body.id_unidad) {
        QUERY = "CALL addUsuarioCCUnidad(\n            " + nombre + ",\n            " + apePat + ",\n            " + apeMat + ",\n            " + usuario + ",\n            " + contrEncript + ",\n            " + tipoUsuario + ",\n            " + depend + ",\n            " + sexo + ",\n            " + estatus + ", \n            " + sala + ", \n            " + estacion + ", \n            " + asociacion + ",\n            " + dpto + ",\n            " + req.body.id_unidad + ",\n            " + p_normal + ", \n            " + p_tr + ", \n            " + p_admin + ", \n            " + p_app_emerg + ");";
    }
    else {
        QUERY = "CALL addUsuarioCC(\n            " + nombre + ",\n            " + apePat + ",\n            " + apeMat + ",\n            " + usuario + ",\n            " + contrEncript + ",\n            " + tipoUsuario + ",\n            " + depend + ",\n            " + sexo + ",\n            " + estatus + ", \n            " + sala + ", \n            " + estacion + ", \n            " + asociacion + ",\n            " + dpto + ", \n            " + p_normal + ", \n            " + p_tr + ", \n            " + p_admin + ", \n            " + p_app_emerg + ");";
    }
    mysql_1.default.ejecutarQuery(QUERY, function (err, data) {
        if (err) {
            return res.status(400).json({
                ok: false,
                resp: err
            });
        }
        else {
            return res.json({
                ok: true,
                resp: req.body.id
            });
        }
    });
});
// Editar usuario NIT 
router.put('/:id', [verificaToken, verificaAdmin_role], function (req, res) {
    var usuario = mysql_1.default.instance.cnn.escape(req.params.id);
    var body = req.body;
    var nombre = mysql_1.default.instance.cnn.escape(body.nombre);
    var apePat = mysql_1.default.instance.cnn.escape(body.apePat);
    var apeMat = mysql_1.default.instance.cnn.escape(body.apeMat) || '';
    var tipoUsuario = body.tipo;
    var depend = mysql_1.default.instance.cnn.escape(body.depend);
    var sexo = mysql_1.default.instance.cnn.escape(body.sexo);
    var estatus = body.estatus || 1;
    // Encriptar la nueva contraseña
    var contrasena = body.contrasena;
    var contrEncript = mysql_1.default.instance.cnn.escape(bcrypt.hashSync(contrasena, salt));
    var QUERY = "CALL editUsuarioCCID(\n        " + nombre + ",\n        " + apePat + ",\n        " + apeMat + ",\n        " + contrEncript + ",\n        " + tipoUsuario + ",\n        " + depend + ",\n        " + sexo + ",\n        " + estatus + ",\n        " + usuario + ");";
    mysql_1.default.ejecutarQuery(QUERY, function (err, usuario) {
        if (err) {
            return res.status(400).json({
                ok: false,
                resp: err
            });
        }
        else {
            return res.json({
                ok: true,
                resp: usuario[0][0]
            });
        }
    });
});
exports.default = router;
