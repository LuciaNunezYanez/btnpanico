import { Router, Request, Response } from 'express';
import MySQL from '../../mysql/mysql';
const router = Router();

router.get('/', (req: Request, res: Response) =>{
    const QUERY = 'CALL getLocalidades();'
    MySQL.ejecutarQuery(QUERY, (err: any, localidades: Object[]) => {
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true,
                localidades: localidades[0]
            });
        }
    });
});

router.get('/:id_municipio', (req: Request, res: Response) =>{
    const QUERY = `CALL getLocalidadIDMunicipio(${req.params.id_municipio});`
    MySQL.ejecutarQuery(QUERY, (err: any, localidades: any[][]) => {
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            var id_localidades = [];
            var nombre_localidad = [];
            for(var i = 0; i < localidades[0].length; i++){
                id_localidades.push(localidades[0][i].ID_LOCALIDADES);
                nombre_localidad.push(localidades[0][i].NOMBRE_LOCALIDAD)
            }

            return res.json({
                ok: true,
                localidades: localidades[0],
                id_localidades, 
                nombre_localidad
            });
        }
    });
});


export default router;
