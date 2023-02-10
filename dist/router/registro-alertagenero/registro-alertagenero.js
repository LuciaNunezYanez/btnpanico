"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var router = express_1.Router();
router.post('/', function (req, res) {
    var body = req.body;
    // DIRECCION 
    var calle = mysql_1.default.instance.cnn.escape(body.calle);
    var numero = mysql_1.default.instance.cnn.escape(body.numero || '');
    var numeroInt = mysql_1.default.instance.cnn.escape(body.numero_int || '');
    var colonia = mysql_1.default.instance.cnn.escape(body.colonia || '');
    var cp = body.cp || 0;
    var entre_calle_1 = mysql_1.default.instance.cnn.escape(body.entre_calle_1 || '');
    var entre_calle_2 = mysql_1.default.instance.cnn.escape(body.entre_calle_2 || '');
    var fachada = mysql_1.default.instance.cnn.escape(body.fachada || '');
    var id_localidad = body.id_localidad; //
    var lat_dir = body.lat_dir || 0; // 
    var lgn_dir = body.lgn_dir || 0; // 
    // USUARIO APP 
    var nombres_usuarios_app = mysql_1.default.instance.cnn.escape(body.nombres_usuarios_app);
    var apell_pat = mysql_1.default.instance.cnn.escape(body.apell_pat);
    var apell_mat = mysql_1.default.instance.cnn.escape(body.apell_mat);
    var fecha_nacimiento_sucia = body.fecha_nacimiento || '0000/00/00';
    var sexo_app = mysql_1.default.instance.cnn.escape(body.sexo_app); // 
    var padecimientos = mysql_1.default.instance.cnn.escape(body.padecimientos || '');
    var tel_movil = mysql_1.default.instance.cnn.escape(body.tel_movil);
    var alergias = mysql_1.default.instance.cnn.escape(body.alergias || '');
    var tipo_sangre = mysql_1.default.instance.cnn.escape(body.tipo_sangre || '');
    var estatus_usuario = body.estatus_usuario || 1; // 1 POR DEFAULT COMO ACTIVO 
    var correo_usuario = mysql_1.default.instance.cnn.escape(body.correo_usuario);
    var id_grupo = Number.parseInt(body.id_grupo) || 1; // 1 = Comercio 2 = Alerta de genero 3 = APADAC 
    var id_comercio = body.id_comercio || 1; // 1 = Comercio alerta de genero preregistrado | 2 = APADAC
    var contrasena = mysql_1.default.instance.cnn.escape(body.contrasena);
    var id_asociacion = Number.parseInt(body.id_asociacion) || 0;
    var id_datos_medicos = Number.parseInt(body.id_datos_medicos) || 1;
    var id_foto_perfil = Number.parseInt(body.id_foto_perfil) || 0;
    //console.log('Body id grupo: ', body.id_grupo + ' Y ' + id_grupo);
    // SEPARAR LA FECHA DE NACIMIENTO DEL USUARIO (YYYY/mm/dd)
    var fecha_nacimiento_lista = '1900/01/01';
    if (fecha_nacimiento_sucia && ((fecha_nacimiento_sucia.substring(2, 3) === '-') || (fecha_nacimiento_sucia.substring(2, 3) === '/'))) {
        var fecha_separada = fecha_nacimiento_sucia.split('/');
        fecha_nacimiento_lista = fecha_separada[2] + '/' + fecha_separada[1] + '/' + fecha_separada[0];
        fecha_nacimiento_lista = mysql_1.default.instance.cnn.escape(fecha_nacimiento_lista);
    }
    else {
        fecha_nacimiento_lista = mysql_1.default.instance.cnn.escape(fecha_nacimiento_lista);
    }
    var QUERY = "CALL addUsuarioAppIndependiente(\n        " + calle + ",\n        " + numero + ",\n        " + numeroInt + ",\n        " + colonia + ",\n        " + cp + ",\n        " + entre_calle_1 + ",\n        " + entre_calle_2 + ",\n        " + fachada + ",\n        " + id_localidad + ",\n        " + lat_dir + ",\n        " + lgn_dir + ",\n        \n\n        " + nombres_usuarios_app + ",\n        " + apell_pat + ",\n        " + apell_mat + ",\n        " + fecha_nacimiento_lista + ",\n        " + sexo_app + ",\n        " + padecimientos + ",\n        " + tel_movil + ",\n        " + alergias + ",\n        " + tipo_sangre + ",\n        " + estatus_usuario + ",\n        " + correo_usuario + ",\n        " + id_grupo + ",\n        " + contrasena + ",\n\n        " + id_asociacion + ",\n        " + id_datos_medicos + ",\n        " + id_foto_perfil + ",\n\n        " + id_comercio + "\n        );";
    mysql_1.default.ejecutarQuery(QUERY, function (err, result) {
        if (err) {
            return res.json({
                ok: false,
                error: err
            });
        }
        else {
            var js = {
                ok: !(result[0][0].resultado === 0),
                resultado: result[0][0],
                error: result[0][0].mensage
            };
            return res.json(js);
        }
    });
});
exports.default = router;
