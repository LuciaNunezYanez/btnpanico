import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const router = Router();

router.get('/clasificacion', (req: Request, res: Response) =>{
    const query = 'CALL getClasificacion()';
    
    MySQL.ejecutarQuery( query, (err: any, clasificacion: any[][]) =>{
        const misClasificaciones = clasificacion[0];
        if(err){
            return res.status(400).json({
                ok:false, 
                error: err
            });
        } else {
            return res.json({
                ok: true, 
                clasificacion: misClasificaciones
            });
        }
    });
});

router.get('/subclasificacion', (req: Request, res: Response) =>{
    const query = 'CALL getSubclasificacion()';
    
    MySQL.ejecutarQuery( query, (err: any, subclasificacion: any[][]) =>{
        const misSublasificaciones = subclasificacion[0];
        if(err){
            return res.status(400).json({
                ok:false, 
                error: err
            });
        } else {
            return res.json({
                ok: true, 
                subclasificacion: misSublasificaciones
            });
        }
    });
});

router.get('/incidentes', (req: Request, res: Response) =>{
    const query = 'CALL getIncidentes()';
    
    MySQL.ejecutarQuery( query, (err: any, incidentes: any[][]) =>{
        const misIncidentes = incidentes[0];
        if(err){
            return res.status(400).json({
                ok:false, 
                error: err
            });
        } else {
            return res.json({
                ok: true, 
                incidentes: misIncidentes
            });
        }
    });
});


export default router;