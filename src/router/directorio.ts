// Consumir procedimiento almacenadoo getDireccionID(ID)

import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const router = Router();

router.get('/:tipo', (req: Request, res: Response) =>{
    const query = `CALL getDirectorio(${MySQL.instance.cnn.escape(req.params.tipo)});`;
    
    MySQL.ejecutarQuery( query, (err: any, directorio: any[]) =>{
        if(err){
            return res.status(400).json({
                ok:false, 
                error: err
            });
        } else {
            return res.json({
                ok: true, 
                directorio: directorio[0]
            });
        }
    });
});

export default router;