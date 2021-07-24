import { Router, Request, Response } from 'express';
import MySQL from '../../mysql/mysql';
const router = Router();

router.get('/:id', (req: Request, res: Response) => {
    const id_usuario: number = Number.parseInt(req.params.id);


    if(id_usuario === undefined || id_usuario === 0){
        return res.json({
            ok: false, 
            message: 'ID inválido'
        });
    }

    const QUERY = `CALL getContactEmergAPP(${id_usuario});`
    
    MySQL.ejecutarQuery(QUERY, (err: any, resp: any[][]) => {
        if(err){
            return res.json({
                ok: false, 
                message: err['sqlMessage']
            });
        } else {
            if(!resp[0][0]?.id_contacto_emergencia){
                return res.json({
                    ok: false, 
                    message: 'Sin contacto de emergencia'
                });
            }
            return res.json({
                ok: true,
                contacto_emergencia: resp[0][0]
            });
        }
    });

})

router.post('/', (req: Request, res: Response) => {
    const id_usuario = MySQL.instance.cnn.escape(req.body.idUsuario);
    const nombre = MySQL.instance.cnn.escape(req.body.nombre_contacto_emerg);
    const telefono = MySQL.instance.cnn.escape(req.body.telefono_contacto_emerg);
    const parentezco = MySQL.instance.cnn.escape(req.body.parentezco_contacto_emerg || '');


    if(id_usuario === undefined || nombre === undefined || telefono === undefined || nombre.length < 5 || telefono.length < 9){
        return res.json({
            ok: false, 
            message: 'Datos del contacto incompletos'
        });
    }

    const QUERY = `CALL addContactoEmergencia(${nombre}, ${telefono}, ${parentezco}, ${id_usuario});`
    
    MySQL.ejecutarQuery(QUERY, (err: any, resp: any[][]) => {
        if(err){
            return res.json({
                ok: false, 
                message: err['sqlMessage']
            });
        } else {
            return res.json({
                ok: !(resp[0][0]['res'] === 0),
                id_contacto_emergencia: resp[0][0]['id_contacto_emergencia']
            });
        }
    });

})

export default router;