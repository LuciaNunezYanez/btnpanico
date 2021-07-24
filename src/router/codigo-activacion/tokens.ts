import { Router, Request, Response, request } from 'express';
import MySQL from '../../mysql/mysql';
const router = Router();

router.get('/:id_usuario', (req: Request, res: Response) => {
    const id_usuario: number = Number.parseInt(req.params.id_usuario);

    const queryGETtoken = `CALL getTokenApp(${id_usuario});`;
    MySQL.ejecutarQuery( queryGETtoken, (err: any, resultado: any[][]) => {
        if(err) {
            return res.json({
                ok: false, 
                error: err
            });
        } else {
            if(resultado[0][0]?.token_FB){
                return res.json({
                    ok: true, 
                    token: resultado[0][0].token_FB,
                    message: 'Token obtenido con éxito'
                });
                } else {
                    return res.json({
                        ok: false,
                        message: 'No se tiene registro del usuario y/o token'
                    });
                }
        }
    });
});

router.put('/:id_usuario' , (req: Request, res: Response) =>{
    const id_usuario: number = Number.parseInt(req.params.id_usuario);
    const token: string = MySQL.instance.cnn.escape(req.body.token);

    const queryEditar = `CALL updateTokenApp(${id_usuario}, ${token});`;
    // console.log(queryEditar);
    MySQL.ejecutarQuery( queryEditar, (err: any, resultado: any) => {
        if(err) {
            return res.json({
                ok: false, 
                error: err
            });
        } else {
            if(resultado.affectedRows){
                return res.json({
                    ok: true,  
                    res: {
                        message: 'Éxito al modificar token'
                    }
                });
            } else {
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

export default router;