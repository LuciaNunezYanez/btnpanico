import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const { verificaToken } = require('../server/middlewares/autenticacion');
const router = Router();


// Obtener archivos multimedia por ID 
router.get('/:id' , (req: Request, res: Response) =>{
    const id = req.params.id;
    const escapedId = MySQL.instance.cnn.escape( id );
    const query = `CALL getMultimedID(${escapedId})`;

    MySQL.ejecutarQuery( query, (err: any, multimedia: Object[]) => {
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true,
                multimedia: multimedia[0]
            });
        }
    });
});


export default router;