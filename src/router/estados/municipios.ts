import { Router, Request, Response } from 'express';
import MySQL from '../../mysql/mysql';
const router = Router();

router.get('/', (req: Request, res: Response) =>{
    const QUERY = 'CALL getmunicipios();'
    MySQL.ejecutarQuery(QUERY, (err: any, municipios: Object[]) => {
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true,
                municipios: municipios[0]
            });
        }
    });
});


export default router;
