"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var verificaToken = require('../../server/middlewares/autenticacion').verificaToken;
var router = express_1.Router();
router.post('/', function (req, res) {
    var body = req.body;
    // console.log('REGISTRAR COMERCIO COMPLETO <------------');
    // console.log(body);
    // return;
    // DIRECCION 
    var calle = mysql_1.default.instance.cnn.escape(body.calle);
    var numero = mysql_1.default.instance.cnn.escape(body.numero);
    var colonia = mysql_1.default.instance.cnn.escape(body.colonia);
    var cp = body.cp;
    var entre_calle_1 = mysql_1.default.instance.cnn.escape(body.entre_calle_1 || '');
    var entre_calle_2 = mysql_1.default.instance.cnn.escape(body.entre_calle_2 || '');
    var fachada = mysql_1.default.instance.cnn.escape(body.fachada);
    var id_localidad = body.id_localidad; //
    var lat_dir = body.lat_dir; // 
    var lgn_dir = body.lgn_dir; // 
    // SI FALTAN DATOS DEL COMERCIO RETORNAR QUE FALTAN
    // COMERCIO 
    var num_empleados = body.num_empleados || 0;
    var nombre_comercio = mysql_1.default.instance.cnn.escape(body.nombre_comercio);
    var giro = mysql_1.default.instance.cnn.escape(body.giro);
    var telefono_fijo = mysql_1.default.instance.cnn.escape(body.telefono_fijo || '');
    var folio_comercio = body.folio_comercio;
    var razon_social = mysql_1.default.instance.cnn.escape(body.razon_social);
    var id_grupo = body.id_grupo || 1;
    // USUARIO APP 
    var nombres_usuarios_app = mysql_1.default.instance.cnn.escape(body.nombres_usuarios_app);
    var apell_pat = mysql_1.default.instance.cnn.escape(body.apell_pat);
    var apell_mat = mysql_1.default.instance.cnn.escape(body.apell_mat);
    var fecha_nacimiento = mysql_1.default.instance.cnn.escape(body.fecha_nacimiento);
    var sexo_app = mysql_1.default.instance.cnn.escape(body.sexo_app); // 
    var padecimientos = mysql_1.default.instance.cnn.escape(body.padecimientos || '');
    var tel_movil = mysql_1.default.instance.cnn.escape(body.tel_movil);
    var alergias = mysql_1.default.instance.cnn.escape(body.alergias || '');
    var tipo_sangre = mysql_1.default.instance.cnn.escape(body.tipo_sangre || '');
    var estatus_usuario = body.estatus_usuario || 1; // 1 POR DEFAULT COMO ACTIVO 
    // DATOS DEL USUARIO DEL NIT 
    var id_usuario_nit = body.id_usuario_nit;
    var fecha_creacion = body.fecha_creacion;
    // SEPARAR LA FECHA DE CREACION (0000/00/00)
    var fecha_creacion_separada = fecha_creacion.split('/');
    var fecha_creacion_lista = fecha_creacion_separada[2] + '/' + fecha_creacion_separada[1] + '/' + fecha_creacion_separada[0];
    fecha_creacion_lista = mysql_1.default.instance.cnn.escape(fecha_creacion_lista);
    // SEPARAR LA FECHA DE NACIMIENTO DEL USUARIO (0000/00/00)
    // const fecha_separada = fecha_nacimiento_sucia.split('/');
    // var fecha_nacimiento_lista = fecha_separada[2] + '/' + fecha_separada[1] + '/' + fecha_separada[0];
    // fecha_nacimiento_lista = MySQL.instance.cnn.escape(fecha_nacimiento_lista);
    var QUERY = "CALL addComercioCompleto(\n        " + calle + ",\n        " + numero + ",\n        " + colonia + ",\n        " + cp + ",\n        " + entre_calle_1 + ",\n        " + entre_calle_2 + ",\n        " + fachada + ",\n        " + id_localidad + ",\n        " + lat_dir + ",\n        " + lgn_dir + ",\n        \n        " + num_empleados + ",\n        " + nombre_comercio + ",\n        " + giro + ",\n        " + telefono_fijo + ",\n        " + folio_comercio + ",\n        " + razon_social + ",\n        " + id_grupo + ",\n\n        " + nombres_usuarios_app + ",\n        " + apell_pat + ",\n        " + apell_mat + ",\n        " + fecha_nacimiento + ",\n        " + sexo_app + ",\n        " + padecimientos + ",\n        " + tel_movil + ",\n        " + alergias + ",\n        " + tipo_sangre + ",\n        " + estatus_usuario + ",\n\n        " + folio_comercio + ", \n        " + fecha_creacion_lista + ",    \n        0, \n        " + id_usuario_nit + ",\n\n        @id_direccion,\n        @id_comercio,\n        @id_usuarios_app,\n        @id_cod_activ);";
    mysql_1.default.ejecutarQuery(QUERY, function (err, result) {
        if (err) {
            return res.json({
                ok: false,
                error: err
            });
        }
        else {
            return res.json({
                ok: true,
                id_direccion: result[0][0].id_direccion,
                id_comercio: result[1][0].id_comercio,
                id_usuarios_app: result[2][0].id_usuarios_app,
                id_cod_activ: result[3][0].id_cod_activ
                // data: result
            });
        }
    });
});
exports.default = router;
