import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';

const router = Router();

// Obtener todos los comercios
router.get('/' , (req: Request, res: Response) =>{
    
    const query = ` SELECT * FROM comercio; `;

    MySQL.ejecutarQuery( query, (err: any, comercios: Object[]) => {
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true,
                comercios
            });
        }
    });
    
});

// Obtener datos completos del comercio por ID 
// Comercio y dirección 
router.get('/:id' , (req: Request, res: Response) =>{

    const id = req.params.id;
    const escapedId = MySQL.instance.cnn.escape( id );

    const query = `CALL getComercioID(${escapedId})`;

    MySQL.ejecutarQuery( query, (err: any, comercio: Object[]) => {
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true,
                comercio: comercio[0]
            });
        }
    });
});

export default router;