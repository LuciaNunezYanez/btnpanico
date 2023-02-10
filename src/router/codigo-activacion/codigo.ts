import { Router, Request, Response } from 'express';
import MySQL from '../../mysql/mysql';
const jwt = require('jsonwebtoken');
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
            return res.json({
                ok: false, 
                error: err
            });
        } else {
            // Si el estatus es 0 y se abrió correctamente (res=1) se regresa la información 
            // completa del usuario (Usuario, comercio y dirección)
            if ( resultado[0][0].res === 1 ){
                const queryUsuario = `CALL getTodoUsuarioAppID(${resultado[0][0].id_usuario});`;
                MySQL.ejecutarQuery(queryUsuario, (err: any, comercio: any[][]) => {
                    if(err) {
                        return res.status(400).json({
                            ok: false, 
                            error: err
                        });
                    } else {
                        //GENERAR TOKEN PARA EL COMERCIO
                        var f = new Date();
                        let token = jwt.sign({
                            id_comercio: comercio[0][0].id_comercio,
                            id_direccion: comercio[0][0].id_dir_comercio,
                            id_usuarios_app: comercio[0][0].id_usuarios_app,
                            fecha_activacion: f.getFullYear() + "/" + (f.getMonth() + 1) + "/" + f.getDate()
                        }, process.env.SEED || 'este-es-el-seed-de-desarrollo', 
                        { expiresIn: 60 * 60 * 8760 }); // 365 días de expiración 
                        
                        return res.json({
                            ok: true, 
                            resultado: resultado[0][0].resultado, 
                            comercio: comercio[0][0],
                            token
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

router.post('/independ/' , (req: Request, res: Response) =>{
    const id_usuario: number = Number.parseInt(req.body.id_usuario);
    const id_usuario_com: number = Number.parseInt(req.body.id_usuario_com);
    const date = new Date();
    const fecha: string = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    const codigo_activacion: number = Number.parseInt(req.body.codigo_activacion);


    const QUERY = `CALL addCodigoActivacion(${id_usuario}, ${id_usuario_com}, ${MySQL.instance.cnn.escape(fecha)}, ${codigo_activacion}, ${0});`
    // console.log(QUERY);
    MySQL.ejecutarQuery( QUERY, (err: any, resultado: any[][]) => {
        if(err) {
            return res.json({
                ok: false, 
                message: 'No se pudo agregar el código de activación.',
                error: err
            });
        } else {
           return res.json({
               ok: true, 
               message: 'Éxito al agregar código de activación',
               resultado
           });
        }
    });
                  
                        
});


export default router;