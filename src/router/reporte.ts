import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const router = Router();

router.get('/:id', (req: Request, res: Response) => {
    
    const id = req.params.id;

    // Escapar ID 
    const escapedId = MySQL.instance.cnn.escape( id );

    const query = `CALL getReporteID(${escapedId})`;

    MySQL.ejecutarQuery( query, (err: any, reporte: Object[]) => {
        
        const obj = reporte[0];

        if(err) {
            res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            res.json({
                ok: true,
                reporte: obj
            });
        }
    });
});

router.post('/', (req: Request, res: Response) => {

    // Recibir datos p t reporte
    const idUserCc: number = req.body.id_user_cc || 1; // 1 = Sin atender
    const idComercReporte: number = req.body.id_comerc;
    const idUserApp: number = req.body.id_user_app;
    const idUnidad: number = req.body.id_unidad || 1; // 1 = Ninguna unidad
    const fhDoc: string = MySQL.instance.cnn.escape(req.body.fh_doc || '');
    const fhAtaque: string = MySQL.instance.cnn.escape(req.body.fh_ataque || '');
    const tipoInc: number = req.body.tipo_incid || 0 ; // 0 = Desconocido
    const descripEmerg: string = MySQL.instance.cnn.escape(req.body.descrip_emerg || '');
    const clasifEmerg: number = req.body.clasif_emerg || 0; // 0 = Normal
    const estatusActual: number = req.body.estatus || 0; // 0 = Sin atender
    const cierreConcl: string = MySQL.instance.cnn.escape(req.body.cierre || '');

    const query = `CALL addReporteRtID(
                    ${idUserCc},
                    ${idComercReporte},
                    ${idUserApp},
                    ${idUnidad},
                    ${fhDoc},
                    ${fhAtaque},
                    ${tipoInc},
                    ${descripEmerg},
                    ${clasifEmerg},
                    ${estatusActual},
                    ${cierreConcl},
                    @last_id);`;

        MySQL.ejecutarQuery( query, (err: any, id:any[][]) => {
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