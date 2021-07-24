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


router.get('/:id_estado', (req: Request, res: Response) =>{
    const QUERY = `CALL getMunicipioIDEstado(${req.params.id_estado});`;
    MySQL.ejecutarQuery(QUERY, (err: any, municipios: any[][]) => {
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {

            var id_municipios = [];
            var nombre_municipio = [];
            for(var i = 0; i < municipios[0].length; i++){
                id_municipios.push(municipios[0][i].ID_MUNICIPIOS);
                nombre_municipio.push(municipios[0][i].NOMBRE_MUNICIPIO)
            }
            return res.json({
                ok: true,
                municipios: municipios[0],
                id_municipios,
                nombre_municipio
            });
        }
    });
});


export default router;
