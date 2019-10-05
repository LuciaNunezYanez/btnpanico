import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';

const router = Router();


// Obtener archivos multimedia por ID 
router.get('/:id' , (req: Request, res: Response) =>{

    const id = req.params.id;
    const escapedId = MySQL.instance.cnn.escape( id );

    const query = `CALL getMultimedID(${escapedId})`;

    MySQL.ejecutarQuery( query, (err: any, multimedia: Object[]) => {
        if(err) {
            res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            res.json({
                ok: true,
                multimedia: multimedia[0]
            });
        }
    });
});


// Agregar archivos multimedia 
router.post('/', (req: Request, res: Response) => {
    
    const fhCapturada: string = MySQL.instance.cnn.escape(req.body.fh_captura);
    const tipoArchivo: string = MySQL.instance.cnn.escape(req.body.tipo_archivo);
    const ruta: string = MySQL.instance.cnn.escape(req.body.ruta);
    const idReporte: number = req.body.id_reporte;

    const query = `CALL addMultimediaRtID(
                    ${fhCapturada},
                    ${tipoArchivo},
                    ${ruta},
                    ${idReporte},
                    @last_id);`;

    MySQL.ejecutarQuery(query, (err: any, id:any[][]) => {
        if(err) {
            res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            res.json({
                ok: true,
                id: id[0][0].last_id
            });
        }
    });
    
});

export default router;