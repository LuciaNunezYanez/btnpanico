import { Router, Request, Response } from "express";
import MySQL from "../../mysql/mysql";
import FB from "../../firebase/configFB";
import { json } from 'body-parser';
import Notificacion from "../../server/global/notificaciones";

const { verificaPermiso } = require('../../server/middlewares/chat');


const router = Router();

// Enviar mensaje entre si.
// TODO: Códificar los mensajes.
router.post('/send', [verificaPermiso], (req: Request, res: Response) => {
    // Si se ejecuta el siguiente código SI PASÓ el middleware
    
    res.json({
        ok: true,
        chat: 'SI PUEDO CHATEAR'
    });
});

router.get('/:id_reporte', (req: Request, res: Response) => {
    const id_reporte = req.params.id_reporte;
    const QUERY = `SELECT * FROM chat WHERE id_reporte_chat = ${id_reporte} LIMIT 1;`;
    MySQL.ejecutarQueryPr(QUERY).then( (resp: any) => {
        if(resp.length === 1){
            return res.json({
                ok: true,
                mensaje: 'Datos del chat obtenidos', 
                chat: resp[0]
            });
        } else {
            return res.json({ ok: false, mensaje: resp });
        }
    }).catch( ( e) => {
        return res.json({ ok: false, mensaje: e });
    });
});

// Habilitar/deshabilitar chats
router.post('/changepermiso', (req: Request, res: Response) =>{

    const tipo = req.body.tipo || '';
    const estatus: number = Number.parseInt(req.body.estatus);
    const estatusString = (estatus === 1)? 'habilitó' : 'deshabilitó';
    const id_reporte_chat = Number.parseInt(req.body.id_reporte_chat || 0);
    var QUERY_UPDATE = '';

    switch (tipo) {
        case 'oun':
            QUERY_UPDATE = `UPDATE chat SET operador_unidad_chat = ${estatus} WHERE id_reporte_chat = ${id_reporte_chat}`;         
            break;
        case 'ous':
            QUERY_UPDATE = `UPDATE chat SET operador_usuario_chat = ${estatus} WHERE id_reporte_chat = ${id_reporte_chat}`;
            break;
        case 'unus':
            QUERY_UPDATE = `UPDATE chat SET unidad_usuario_chat = ${estatus} WHERE id_reporte_chat = ${id_reporte_chat}`;
            break;
        default:
            return res.json({
                ok: false, 
                mensaje: 'No se encontró un chat con los parametros solicitados.'
            });
    }

    MySQL.ejecutarQueryPr(QUERY_UPDATE).then(( resp: any )=>{
        // console.log('LA RESPUESTA DE MODIFICAR PERMISO');
        // console.log(resp);
        if(resp?.affectedRows != 0 && resp?.affectedRows != undefined) {
            const QUERY_TOKEN = `CALL getTokensChat(${id_reporte_chat});`;
            MySQL.ejecutarQueryPr(QUERY_TOKEN).then((resp: any)=>{
                if(resp.length > 0){
                    const chat = resp[0][0];

                    const titulo = `Se cambiaron los permisos del chat. Reporte #${id_reporte_chat}`;
                    var descripcion = '';
                    var descripcion2 = '';
                    var token = '';
                    var token2 = '';

                    // TODO:
                    // Enviar el numero de reporte para poder abrirlo y chatear
                    // También el tipo
                    const data = {
                        type: Notificacion.typeCambioEstatusChat,
                        id_reporte: id_reporte_chat, 
                        estatus
                    };

                    // Depende el tipo es a quienes les enviará las notificaciones
                    switch (tipo) {
                        case 'oun':
                            if(chat?.token_un.length > 0){
                                // Avisar a la unidad
                                descripcion = `Se ${estatusString} el chat para conversar con el operador.`;
                                token = chat?.token_un;
                            }
                            break;
                        case 'ous':
                            if(chat?.token_us.length > 0){
                                // Avisar al usuario
                                descripcion = `Se ${estatusString} el chat para conversar con el operador.`;
                                token = chat?.token_us;
                            }
                            break;
                        case 'unus':
                            if(chat?.token_un.length > 0){
                                // Avisar a la unidad
                                descripcion = `Se ${estatusString} el chat para conversar con el usuario.`;
                                token = chat?.token_un;
                            }
                            if(chat?.token_us.length > 0){
                                // Avisar al usuario
                                descripcion2 = `Se ${estatusString} el chat para conversar con la unidad.`;
                                token2 = chat?.token_us;
                            }
                            break;
                    }

                    // ENVIAR LA NOTIFICACIÓN 
                    if(token.length > 0){
                        FB.enviarNotifEspecificaFB(titulo, descripcion, token, data)
                        .then(( resp: any )=>{

                            // console.log('La notificación');
                            // console.log(resp);
                            if(resp.resp.successCount != 0){
                                return res.json({
                                    ok: true,
                                    estatus,
                                    mensaje: 'Los permisos han sido modificados con exito.',
                                });
                            } else {
                                return res.json({
                                    ok: true, 
                                    estatus,
                                    mensaje: 'Los permisos han sido modificados con exito, pero no se notificó al usuario del cambio.', 
                                });
                            }                            
                        })
                        .catch(( e )=>{
                            return res.json({
                                ok: true, 
                                estatus,
                                mensaje: 'Los permisos han sido modificados con exito, pero no se notificó al usuario del cambio.', 
                                error: e
                            });
                        });                        
                    } else {
                        return res.json({
                            ok: true, 
                            estatus,
                            mensaje: 'Los permisos han sido modificados con exito, pero no se notificó al usuario del cambio.'
                        });
                    }
                    
                    if(token2.length > 0){
                        FB.enviarNotifEspecificaFB(titulo, descripcion2, token2, data)
                        .then(( resp: any )=>{
                            if(resp.resp.successCount != 0){
                            } else {}                            
                        })
                        .catch(( e )=>{});                        
                    } else {}
                } else {
                    return res.json({
                        ok: false, 
                        mensaje: 'No se encontró un chat con los parametros solicitados.'
                    });
                }
            }).catch((e)=>{
                return res.json({
                    ok: false, 
                    mensaje: e
                });
            });            
        } else {
            return res.json({
                ok: false, 
                mensaje: 'No se encontró un chat con los parametros solicitados.'
            });
        }
    }).catch(( e )=>{
        return res.json({
            ok: false, 
            mensaje: 'Ocurrió un error al modificar los permisos.',
            error: {
                mensaje: e
            }
        });
    });
});


export default router;
