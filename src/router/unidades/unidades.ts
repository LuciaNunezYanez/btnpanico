import { Router, Request, Response, request } from 'express';
import { MysqlError } from 'mysql';
import MySQL from '../../mysql/mysql';
import FB from '../../firebase/configFB'
import Server from '../../server/server';
import Notificacion from '../../server/global/notificaciones';
const { verificaToken } = require('../../server/middlewares/authenticacion');

const router = Router();

router.get('/', (req: Request, res: Response) => {
    const QUERY = `CALL getUnidades();`;
    MySQL.ejecutarQueryPr(QUERY).then((unidades: any) => {
        return res.status(200).json({
            ok: true,
            res: unidades[0]
        });
    }).catch((error: MysqlError) => {
        return res.json({
            ok: false,
            res: {
                error: error.message,
                resp: 'Ocurrió un error al obtener las unidades.'
            }
        });
    });
});

router.get('/:estatus', (req: Request, res: Response) => {
    console.log('GET');
    const QUERY = `CALL getUnidadesOnline(${req.params.estatus});`;
    MySQL.ejecutarQueryPr(QUERY).then((unidades: any) => {
        return res.status(200).json({
            ok: true,
            res: unidades[0]
        });
    }).catch((error: MysqlError) => {
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
router.post('/', (req: Request, res: Response) => {
    const QUERY = `CALL addUnidad(
        ${req.body.id_corp}, 
        ${MySQL.instance.cnn.escape(req.body.num_unidad)}, 
        ${MySQL.instance.cnn.escape(req.body.placas_unidad)},
        ${req.body.id_localidad});`;

    MySQL.ejecutarQueryPr(QUERY).then((respuesta: any) => {
        return res.status(200).json({
            ok: true,
            res: respuesta[0][0]
        });
    }).catch((error: MysqlError) => {
        return res.json({
            ok: false,
            res: {
                error: error.message,
                resp: 'Ocurrió un error, verifique el número de unidad y las placas.'
            }

        });
    });
});

router.put('/asignar', (req: Request, res: Response) => { // [verificaToken]
    const estatus_chat = 1;
    const rep = req.body.reporte;
    const unidad = req.body.unidad;
    const usuario = req.body.usuario;
    var titulo = req.body.titulo;
    var mensaje = req.body.mensaje;
    // Toma el reporte y el folio de la unidad
    // Ir a traer token viendo que si esté en linea
    // Modificar el id unidad en el reporte y si todo OK 
    // Enviar notificación push

    // En la información debe ir todo del reporte.
    // Asigna la unidad 
    const QUERY_ASIG = `CALL asignarUnidad(1,
                    ${rep},
                    ${unidad},
                    ${estatus_chat},
                    ${usuario});`;
    
    MySQL.ejecutarQueryPr(QUERY_ASIG).then((respuesta_asign: any) => {
        // Comprobar si es OK true
        if (respuesta_asign[0][0].OK === 1) {
            if (respuesta_asign[0][0].token) {
                /*
                  Obtener toda la info del reporte
                  y enviarla en la notificación.
                */
                const QUERY_FULL = `CALL getReporteFull(${rep});`;
                MySQL.ejecutarQueryPr(QUERY_FULL).then((reporte: any) => {
                    // Desestructurar el reporte
                    const r = reporte[0][0]

                    let data = {
                        tipo: Notificacion.tipoInterno,
                        type: Notificacion.typeAsignacion,

                        id_reporte: (r?.id_reporte).toString(),
                        estatusLocal: 'pendiente',
                        chatOperador: (r?.operador_unidad_chat || '0').toString(),
                        chatUsuario: (r?.unidad_usuario_chat || '0').toString(),

                        fecha_hora_asig_unidad: (Math.floor(r.fecha_hora_asig_unidad/1000)).toString(),
                        fecha_hora_ataq: (Math.floor(r?.fecha_hora_ataq/1000)).toString(),

                        tipo_incid_usuario: (r?.tipo_incid_usuario).toString(),
                        cuerpo_emerg_usuario: (r?.cuerpo_emerg_usuario).toString(),
                        descrip_emerg_usuario: (r?.descrip_emerg_usuario).toString(),
                        quien_emergencia: (r?.quien_emergencia).toString(),
                        estatus_actual: (r?.estatus_actual).toString(),
                        id_usuarios_app: (r?.id_user_app).toString(),
                        id_unidad_rep: (r?.id_unidad_rep).toString(),
                        num_unidad: (r?.num_unidad).toString(),
                        placas_unidad: (r?.placas_unidad).toString(),

                        id_coord_reporte: (r?.id_coord_reporte || '').toString(),
                        id_coordenada: (r?.id_coordenada || '').toString(),
                        lat_coord_reporte: (r?.lat_coord_reporte || '').toString(),
                        lng_coord_reporte: (r?.lng_coord_reporte || '').toString(),
                        fecha_coord_reporte: (Math.floor(r?.fecha_coord_reporte/1000)).toString(),
                        tipo_ubicacion: (r?.tipo_ubicacion || '').toString(),

                        // id_usuarios_app: (r?.id_usuarios_app).toString(), // Se repite
                        nombres_usuarios_app: (r?.nombres_usuarios_app).toString(),
                        apell_pat: (r?.apell_pat).toString(),
                        apell_mat: (r?.apell_mat).toString(),
                        fecha_nacimiento: (Math.floor(r.fecha_nacimiento/1000)).toString(),
                        sexo_app: (r?.sexo_app).toString(),
                        padecimientos: (r?.padecimientos).toString(),
                        tel_movil: (r?.tel_movil).toString(),
                        alergias: (r?.alergias).toString(),
                        tipo_sangre: (r?.tipo_sangre).toString(),

                        id_direccion: (r?.id_direccion).toString(), 
                        calle: (r?.calle).toString(),
                        numero: (r?.numero).toString(),
                        numero_int: (r?.numero_int).toString(),
                        colonia: (r?.colonia).toString(),
                        cp: (r?.cp).toString(),
                        entre_calle_1: (r?.entre_calle_1).toString(),
                        entre_calle_2: (r?.entre_calle_2).toString(),
                        fachada: (r?.fachada).toString(),
                        id_localidad: (r?.id_localidad).toString(),
                        nombre_localidad: (r?.nombre_localidad).toString(),
                        id_municipios: (r?.id_municipios).toString(),
                        nombre_municipio: (r?.nombre_municipio).toString(),
                        id_estados: (r?.id_estados).toString(),
                        nombre_estado: (r?.nombre_estado).toString(),

                        id_usuarios_cc: (r?.id_usuarios_cc).toString()
                    };
                    // console.log(data);
                    // return;
                    FB.enviarNotifEspecificaFB(
                        titulo,
                        mensaje,
                        respuesta_asign[0][0].token,
                        data
                    ).then((resp: any) => {
                        return res.json({
                            codigo: 1,
                            ok: true,
                            mensaje: respuesta_asign[0][0]?.mensaje,
                            resp,
                            data
                        });
    
                    }).catch((err) => {
                        // console.log(err);
                        return res.json({
                            codigo: 2,
                            ok: false,
                            mensaje: respuesta_asign[0][0]?.mensaje,
                            error: {
                                error: err,                                
                                mensaje: respuesta_asign[0][0]?.mensaje,
                            }
                        });
                    });

                }).catch((error: MysqlError) => {
                    return res.json({
                        codigo: 3,
                        ok: false,
                        error: {
                            error: error.message,
                            mensaje: 'Ocurrió un error al asignar unidad, verifique la información.'
                        }
                    });
                });
            } else {
                // Responder que no se puede enviar la notificación
                return res.json({
                    codigo: 4,
                    ok: false,
                    mensaje: respuesta_asign[0][0]?.mensaje,
                    error: {
                        mensaje: respuesta_asign[0][0]?.mensaje,
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
        } else {
            // Retornar el mensaje de error 
            return res.json({
                codigo: 5,
                ok: false,
                mensaje: respuesta_asign[0][0]?.mensaje,
                error: {
                    mensaje: respuesta_asign[0][0]?.mensaje,
                }
            });
        }
    }).catch((error: MysqlError) => {
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




export default router; 