import { Router, Request, Response } from 'express';
import MySQL from '../../mysql/mysql';
var admin = require('firebase-admin');
const router = Router();

router.post('/:id_usuario', (req: Request, res: Response) => {
    const id_usuario: number = Number.parseInt(req.params.id_usuario);
    const titulo: string = req.body.titulo;
    const descripcion: string = req.body.descripcion;

    var payload = {
        notification: {
            title: titulo,
            body: descripcion,
            // image: 'https://www.puntoporpunto.com/web/wp-content/uploads/2021/02/LSM.jpg'
        }
    }
    
    var options = {
        priority: 'high',
        timeToLive: 60 * 60 * 24
    };
    
    // Obtener token de la base de datos
    const QUERY = `CALL getTokenApp(${id_usuario});`
    
    MySQL.ejecutarQuery(QUERY, (err: any, resp: any[][]) => {
        if(err){
            return res.json({
                ok: false, 
                message: err['sqlMessage']
            });
        } else {
            if(resp[0][0]?.token_FB){
                const registrationToken = resp[0][0].token_FB;

                // Enviar token con apoyo de Firebase
                try { 
                    admin.messaging().sendToDevice(registrationToken, payload, options)
                        .then( (resp: any) => {
                            if(resp.results[0].error){
                                return res.json({
                                    ok: false, 
                                    message: 'Error al enviar mensaje', 
                                    err: resp.results[0].error
                                });
                            }
                            console.log(resp.results[0].error);
                            return res.json({
                                ok: true,
                                message: 'Éxito al enviar mensaje',
                                resp
                            });
                        })
                        .catch((err: any) => {
                            return res.json({
                                ok: false, 
                                message: 'Error al enviar mensaje', 
                                err
                            });
                        });
                } catch(excepcion){
                    return res.json({
                        ok: false, 
                        message: excepcion
                    });
                }
            } else {
                return res.json({
                    ok: false, 
                    message: 'Error al enviar mensaje, token de usuario inválido',
                });
            }
        }
    });    
});


export default router;