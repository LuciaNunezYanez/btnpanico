"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("../../mysql/mysql"));
var configFB_1 = __importDefault(require("../../firebase/configFB"));
var notificaciones_1 = __importDefault(require("../../server/global/notificaciones"));
var verificaToken = require('../../server/middlewares/authenticacion').verificaToken;
var router = express_1.Router();
router.get('/', function (req, res) {
    var QUERY = "CALL getUnidades();";
    mysql_1.default.ejecutarQueryPr(QUERY).then(function (unidades) {
        return res.status(200).json({
            ok: true,
            res: unidades[0]
        });
    }).catch(function (error) {
        return res.json({
            ok: false,
            res: {
                error: error.message,
                resp: 'Ocurrió un error al obtener las unidades.'
            }
        });
    });
});
router.get('/:estatus', function (req, res) {
    console.log('GET');
    var QUERY = "CALL getUnidadesOnline(" + req.params.estatus + ");";
    mysql_1.default.ejecutarQueryPr(QUERY).then(function (unidades) {
        return res.status(200).json({
            ok: true,
            res: unidades[0]
        });
    }).catch(function (error) {
        return res.json({
            ok: false,
            res: {
                error: error.message,
                resp: 'Ocurrió un error al obtener las unidades con estatus.'
            }
        });
    });
});
// Registrar cada vez que se presiona el botón de pánico con un reporte existente generado
router.post('/', function (req, res) {
    var QUERY = "CALL addUnidad(\n        " + req.body.id_corp + ", \n        " + mysql_1.default.instance.cnn.escape(req.body.num_unidad) + ", \n        " + mysql_1.default.instance.cnn.escape(req.body.placas_unidad) + ",\n        " + req.body.id_localidad + ");";
    mysql_1.default.ejecutarQueryPr(QUERY).then(function (respuesta) {
        return res.status(200).json({
            ok: true,
            res: respuesta[0][0]
        });
    }).catch(function (error) {
        return res.json({
            ok: false,
            res: {
                error: error.message,
                resp: 'Ocurrió un error, verifique el número de unidad y las placas.'
            }
        });
    });
});
router.put('/asignar', function (req, res) {
    var estatus_chat = 1;
    var rep = req.body.reporte;
    var unidad = req.body.unidad;
    var usuario = req.body.usuario;
    var titulo = req.body.titulo;
    var mensaje = req.body.mensaje;
    // Toma el reporte y el folio de la unidad
    // Ir a traer token viendo que si esté en linea
    // Modificar el id unidad en el reporte y si todo OK 
    // Enviar notificación push
    // En la información debe ir todo del reporte.
    // Asigna la unidad 
    var QUERY_ASIG = "CALL asignarUnidad(1,\n                    " + rep + ",\n                    " + unidad + ",\n                    " + estatus_chat + ",\n                    " + usuario + ");";
    mysql_1.default.ejecutarQueryPr(QUERY_ASIG).then(function (respuesta_asign) {
        var _a, _b, _c, _d;
        // Comprobar si es OK true
        if (respuesta_asign[0][0].OK === 1) {
            if (respuesta_asign[0][0].token) {
                /*
                  Obtener toda la info del reporte
                  y enviarla en la notificación.
                */
                var QUERY_FULL = "CALL getReporteFull(" + rep + ");";
                mysql_1.default.ejecutarQueryPr(QUERY_FULL).then(function (reporte) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18;
                    // Desestructurar el reporte
                    var r = reporte[0][0];
                    var data = {
                        tipo: notificaciones_1.default.tipoInterno,
                        type: notificaciones_1.default.typeAsignacion,
                        id_reporte: ((_a = r) === null || _a === void 0 ? void 0 : _a.id_reporte).toString(),
                        estatusLocal: 'pendiente',
                        chatOperador: (((_b = r) === null || _b === void 0 ? void 0 : _b.operador_unidad_chat) || '0').toString(),
                        chatUsuario: (((_c = r) === null || _c === void 0 ? void 0 : _c.unidad_usuario_chat) || '0').toString(),
                        fecha_hora_asig_unidad: (Math.floor(r.fecha_hora_asig_unidad / 1000)).toString(),
                        fecha_hora_ataq: (Math.floor(((_d = r) === null || _d === void 0 ? void 0 : _d.fecha_hora_ataq) / 1000)).toString(),
                        tipo_incid_usuario: ((_e = r) === null || _e === void 0 ? void 0 : _e.tipo_incid_usuario).toString(),
                        cuerpo_emerg_usuario: ((_f = r) === null || _f === void 0 ? void 0 : _f.cuerpo_emerg_usuario).toString(),
                        descrip_emerg_usuario: ((_g = r) === null || _g === void 0 ? void 0 : _g.descrip_emerg_usuario).toString(),
                        quien_emergencia: ((_h = r) === null || _h === void 0 ? void 0 : _h.quien_emergencia).toString(),
                        estatus_actual: ((_j = r) === null || _j === void 0 ? void 0 : _j.estatus_actual).toString(),
                        id_usuarios_app: ((_k = r) === null || _k === void 0 ? void 0 : _k.id_user_app).toString(),
                        id_unidad_rep: ((_l = r) === null || _l === void 0 ? void 0 : _l.id_unidad_rep).toString(),
                        num_unidad: ((_m = r) === null || _m === void 0 ? void 0 : _m.num_unidad).toString(),
                        placas_unidad: ((_o = r) === null || _o === void 0 ? void 0 : _o.placas_unidad).toString(),
                        id_coord_reporte: (((_p = r) === null || _p === void 0 ? void 0 : _p.id_coord_reporte) || '').toString(),
                        id_coordenada: (((_q = r) === null || _q === void 0 ? void 0 : _q.id_coordenada) || '').toString(),
                        lat_coord_reporte: (((_r = r) === null || _r === void 0 ? void 0 : _r.lat_coord_reporte) || '').toString(),
                        lng_coord_reporte: (((_s = r) === null || _s === void 0 ? void 0 : _s.lng_coord_reporte) || '').toString(),
                        fecha_coord_reporte: (Math.floor(((_t = r) === null || _t === void 0 ? void 0 : _t.fecha_coord_reporte) / 1000)).toString(),
                        tipo_ubicacion: (((_u = r) === null || _u === void 0 ? void 0 : _u.tipo_ubicacion) || '').toString(),
                        // id_usuarios_app: (r?.id_usuarios_app).toString(), // Se repite
                        nombres_usuarios_app: ((_v = r) === null || _v === void 0 ? void 0 : _v.nombres_usuarios_app).toString(),
                        apell_pat: ((_w = r) === null || _w === void 0 ? void 0 : _w.apell_pat).toString(),
                        apell_mat: ((_x = r) === null || _x === void 0 ? void 0 : _x.apell_mat).toString(),
                        fecha_nacimiento: (Math.floor(r.fecha_nacimiento / 1000)).toString(),
                        sexo_app: ((_y = r) === null || _y === void 0 ? void 0 : _y.sexo_app).toString(),
                        padecimientos: ((_z = r) === null || _z === void 0 ? void 0 : _z.padecimientos).toString(),
                        tel_movil: ((_0 = r) === null || _0 === void 0 ? void 0 : _0.tel_movil).toString(),
                        alergias: ((_1 = r) === null || _1 === void 0 ? void 0 : _1.alergias).toString(),
                        tipo_sangre: ((_2 = r) === null || _2 === void 0 ? void 0 : _2.tipo_sangre).toString(),
                        id_direccion: ((_3 = r) === null || _3 === void 0 ? void 0 : _3.id_direccion).toString(),
                        calle: ((_4 = r) === null || _4 === void 0 ? void 0 : _4.calle).toString(),
                        numero: ((_5 = r) === null || _5 === void 0 ? void 0 : _5.numero).toString(),
                        numero_int: ((_6 = r) === null || _6 === void 0 ? void 0 : _6.numero_int).toString(),
                        colonia: ((_7 = r) === null || _7 === void 0 ? void 0 : _7.colonia).toString(),
                        cp: ((_8 = r) === null || _8 === void 0 ? void 0 : _8.cp).toString(),
                        entre_calle_1: ((_9 = r) === null || _9 === void 0 ? void 0 : _9.entre_calle_1).toString(),
                        entre_calle_2: ((_10 = r) === null || _10 === void 0 ? void 0 : _10.entre_calle_2).toString(),
                        fachada: ((_11 = r) === null || _11 === void 0 ? void 0 : _11.fachada).toString(),
                        id_localidad: ((_12 = r) === null || _12 === void 0 ? void 0 : _12.id_localidad).toString(),
                        nombre_localidad: ((_13 = r) === null || _13 === void 0 ? void 0 : _13.nombre_localidad).toString(),
                        id_municipios: ((_14 = r) === null || _14 === void 0 ? void 0 : _14.id_municipios).toString(),
                        nombre_municipio: ((_15 = r) === null || _15 === void 0 ? void 0 : _15.nombre_municipio).toString(),
                        id_estados: ((_16 = r) === null || _16 === void 0 ? void 0 : _16.id_estados).toString(),
                        nombre_estado: ((_17 = r) === null || _17 === void 0 ? void 0 : _17.nombre_estado).toString(),
                        id_usuarios_cc: ((_18 = r) === null || _18 === void 0 ? void 0 : _18.id_usuarios_cc).toString()
                    };
                    // console.log(data);
                    // return;
                    configFB_1.default.enviarNotifEspecificaFB(titulo, mensaje, respuesta_asign[0][0].token, data).then(function (resp) {
                        var _a;
                        return res.json({
                            codigo: 1,
                            ok: true,
                            mensaje: (_a = respuesta_asign[0][0]) === null || _a === void 0 ? void 0 : _a.mensaje,
                            resp: resp,
                            data: data
                        });
                    }).catch(function (err) {
                        var _a, _b;
                        // console.log(err);
                        return res.json({
                            codigo: 2,
                            ok: false,
                            mensaje: (_a = respuesta_asign[0][0]) === null || _a === void 0 ? void 0 : _a.mensaje,
                            error: {
                                error: err,
                                mensaje: (_b = respuesta_asign[0][0]) === null || _b === void 0 ? void 0 : _b.mensaje,
                            }
                        });
                    });
                }).catch(function (error) {
                    return res.json({
                        codigo: 3,
                        ok: false,
                        error: {
                            error: error.message,
                            mensaje: 'Ocurrió un error al asignar unidad, verifique la información.'
                        }
                    });
                });
            }
            else {
                // Responder que no se puede enviar la notificación
                return res.json({
                    codigo: 4,
                    ok: false,
                    mensaje: (_a = respuesta_asign[0][0]) === null || _a === void 0 ? void 0 : _a.mensaje,
                    error: {
                        mensaje: (_b = respuesta_asign[0][0]) === null || _b === void 0 ? void 0 : _b.mensaje,
                    }
                });
            }
            // Obtener reporteFull
            // const QUERY_FULL = `CALL getReporteFull(${reporte})`;
            // MySQL.ejecutarQueryPr( QUERY_FULL).then((respuesta_reporte: any)=>{
            //     // TODO: Aqui debería desestructurar y solo enviar la información necesaria 
            //     // Enviar notificación push y luego respuesta 
            //     FB.enviarNotifEspecificaFB(
            //         titulo,
            //         mensaje,
            //         ''
            //     ).then( (resp)=>{
            //     }).catch( (err)=>{
            //     });
            //     return res.json({
            //         ok: true,
            //         mensaje: respuesta_asign[0][0]?.mensaje,
            //         reporte: respuesta_reporte[0][0]
            //     });
            // }
            // )
            // .catch((error: MysqlError)=>{
            //     return res.json({
            //         ok: false, 
            //         mensaje: respuesta_asign[0][0]?.mensaje,
            //         error: {
            //             error: error.message, 
            //             resp: 'Ocurrió un error al obtener reporte full, verifique la información.'
            //         }
            //     });
            // });
        }
        else {
            // Retornar el mensaje de error 
            return res.json({
                codigo: 5,
                ok: false,
                mensaje: (_c = respuesta_asign[0][0]) === null || _c === void 0 ? void 0 : _c.mensaje,
                error: {
                    mensaje: (_d = respuesta_asign[0][0]) === null || _d === void 0 ? void 0 : _d.mensaje,
                }
            });
        }
    }).catch(function (error) {
        return res.json({
            codigo: 6,
            ok: false,
            mensaje: 'Ocurrió un error al asignar unidad, verifique la información.',
            error: {
                error: error,
                mensaje: 'Ocurrió un error al asignar unidad, verifique la información.'
            }
        });
    });
});
exports.default = router;
