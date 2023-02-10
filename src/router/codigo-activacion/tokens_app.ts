import { Router, Request, Response, request } from 'express';
import MySQL from '../../mysql/mysql';
const { verificaTokenIDUsuario } = require('../../server/middlewares/authenticacion');

const router = Router();

router.post('/app', [verificaTokenIDUsuario], (req: Request, res: Response) => {
    try {
        const id_usuario: number = Number.parseInt(req.body.id_usuario);
        const query = (req.body.tipo === 'externo')?
            `CALL updateTokenApp(${id_usuario}, ${MySQL.instance.cnn.escape(req.body.token_FB)});` :
            `CALL updateTokenCC(${id_usuario}, ${MySQL.instance.cnn.escape(req.body.token_FB)});`;
        MySQL.ejecutarQuery( query, (err: any, resultado: any) => {
    
            if(resultado.affectedRows == 0){
                // No se editó el token FB
                return res.json({
                    ok: false, 
                    error: err
                });
            } else {
                return res.json({
                    ok: true,
                    message: '¡Token del dispositivo registrado con éxito!'
                });
            }
        });
    } catch(e){
        return res.json({
            ok: false, 
            error: 'Datos del token incompletos!'
        });
    }
});

export default router;