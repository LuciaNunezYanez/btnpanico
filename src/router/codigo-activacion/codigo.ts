import { Router, Request, Response } from 'express';
import MySQL from '../../mysql/mysql';
const { verificaToken } = require('../../server/middlewares/autenticacion');
const router = Router();

// ABRIR CODIGO DE ACTIVACIÓN 
// Pasa de estatus 0 a 1 
router.post('/' , (req: Request, res: Response) =>{
    const codigo_activacion = req.body.codigo_activacion;
    const fecha_apertura = MySQL.instance.cnn.escape(req.body.fecha_apertura);
    const estatus_abierto = 1;

    const queryCodigo = `CALL abrirCodigoActivacion(${codigo_activacion}, ${fecha_apertura}, ${estatus_abierto});`;
    
    MySQL.ejecutarQuery( queryCodigo, (err: any, resultado: any[][]) => {
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            // Si el estatus es 0 y se abrió correctamente (res=1) se regresa la información 
            // completa del usuario (Usuario, comercio y dirección)
            if ( resultado[0][0].res === 1 ){
                const queryUsuario = `CALL getTodoUsuarioAppID(${resultado[0][0].id_usuario});`;
                MySQL.ejecutarQuery(queryUsuario, (err: any, comercio: Object[][]) => {
                    if(err) {
                        return res.status(400).json({
                            ok: false, 
                            error: err
                        });
                    } else {
                        return res.json({
                            ok: true, 
                            resultado: resultado[0][0].resultado, 
                            comercio: comercio[0][0]
                        });
                    }
                });
            } else {
                return res.json({
                    ok: true,
                    resultado: resultado[0][0].resultado
                });
            }            
        }
    });
});


export default router;