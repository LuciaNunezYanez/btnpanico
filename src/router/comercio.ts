import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const { verificaToken } = require('../server/middlewares/authenticacion');
const router = Router();

// Obtener todos los comercios
router.get('/' , verificaToken, (req: Request, res: Response) =>{
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
// verificaToken,
router.get('/:id', (req: Request, res: Response) =>{
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

router.get('/folio/:codigo_activacion', (req: Request, res: Response) =>{
    const codigo_activacion = req.params.codigo_activacion;
    const escapedCodigo =  MySQL.instance.cnn.escape(codigo_activacion);
    const query = `CALL getComercioFolio(${escapedCodigo})`;

    MySQL.ejecutarQuery( query, (err: any, comercio: Object[][]) => {
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true,
                comercio: comercio[0][0]            
            });
            
        }
    });
});

export default router;