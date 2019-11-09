import { Router, Request, Response } from 'express';
const { verificaToken } = require('../server/middlewares/autenticacion');
import MySQL from '../mysql/mysql';

const router = Router();

// Obtener todos los comercios
router.get('/' , (req: Request, res: Response) =>{
    const query = `CALL getReportesPendient();`;
    
    MySQL.ejecutarQuery( query, (err: any, reportes: any) => {
        if(err) {
            console.log('Ocurrió un error al traer los reportes: ', err);
        } else {
            res.status(200).json({
                ok: true, 
                res: reportes
            });
        }
    });
    
});

export default
 router;