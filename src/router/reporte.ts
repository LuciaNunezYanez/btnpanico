import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const { verificaToken } = require('../server/middlewares/autenticacion');
const router = Router();

// verificaToken,
router.get('/:id', (req: Request, res: Response) => {
    // return res.json({usuario: req.usuario});

    const id = req.params.id;
    const escapedId = MySQL.instance.cnn.escape( id );
    const query = `CALL getReporteID(${escapedId})`;

    MySQL.ejecutarQuery( query, (err: any, reporte: Object[]) => {
        const obj = reporte[0];
        if(err) {
            return res.status(400).json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true,
                reporte: obj
            });
        }
    });
});


// Trae el reporte completo (excepto activaciones, coordenadas y multimedia)
router.get('/full/:id', (req: Request, res: Response) => {

    const query = `CALL getReporteFull(${MySQL.instance.cnn.escape( req.params.id )})`;
    console.log(query);

    MySQL.ejecutarQuery( query, (err: any, reporte: Object[][]) => {
        if(err) {
            return res.json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true,
                reporteFull: reporte[0][0]
            });
        }
    });
});

// Filtto/buscador de reportes
router.post('/filtro/', (req: Request, res: Response) => {

    const folio_rep = MySQL.instance.cnn.escape(req.body.folio || '');
    const folio_CAD = MySQL.instance.cnn.escape(req.body.folioCAD || '');
    const fecha_inicio_rep = MySQL.instance.cnn.escape(req.body.fecha_inicio || '');
    const fecha_fin_rep = MySQL.instance.cnn.escape(req.body.fecha_fin || '');

    const tel_us = MySQL.instance.cnn.escape(req.body.telefono || '');
    const calle_us = MySQL.instance.cnn.escape(req.body.calle || '');
    const numero_us = MySQL.instance.cnn.escape(req.body.numero || '');
    const colonia_us = MySQL.instance.cnn.escape(req.body.colonia || '');
    const cp_us = MySQL.instance.cnn.escape(req.body.cp || '');
    const municipio_us = MySQL.instance.cnn.escape(req.body.municipio || '');
    const localidad_us = MySQL.instance.cnn.escape(req.body.localidad || '');

    const id_operador_cc = MySQL.instance.cnn.escape(req.body.id_operador || '');
    const sala_cc = MySQL.instance.cnn.escape(req.body.sala || '');
    const estacion_cc = req.body.estacion || 0;

    // console.log(req.body);
    // console.log(sala_cc, sala_cc.length);
    // console.log(estacion_cc, estacion_cc.length);
    // console.log(fecha_fin_rep, fecha_fin_rep.length);
    // console.log(fecha_inicio_rep, fecha_inicio_rep.length);
   

    // No avanzar sin sala, estacion y fechas
    if(sala_cc.length <= 2 || estacion_cc == 0 || fecha_fin_rep.length <= 2 || fecha_inicio_rep.length <= 2){        
        return res.json({
            ok: false,
            mensaje: 'La sala, estación, fecha de inicio y fecha de fin son campos obligatorios.'
        });
    }
    
    const query = `CALL busquedaReportes(${folio_rep},${folio_CAD},${fecha_inicio_rep},${fecha_fin_rep},
        ${tel_us},${calle_us},${numero_us},${colonia_us},${cp_us},${municipio_us},${localidad_us},
        ${id_operador_cc},${sala_cc},${estacion_cc});`;


    MySQL.ejecutarQuery( query, (err: any, results: Object[]) => {
        if(err) {
            return res.json({
                ok: false, 
                error: err
            });
        } else {
            return res.json({
                ok: true,
                results: results[0]
            });
        }
    });
});


// No se utiliza por la aplicación móvil 
router.post('/', verificaToken, (req: Request, res: Response) => {

    // Recibir datos p t reporte
    const idUserCc: number = req.body.id_user_cc || 1; // 1 = Sin atender
    const idComercReporte: number = req.body.id_comerc;
    const idUserApp: number = req.body.id_user_app;
    const idUnidad: number = req.body.id_unidad || 1; // 1 = Ninguna unidad
    const fhDoc: string = MySQL.instance.cnn.escape(req.body.fh_doc || '');
    const fhAtaque: string = MySQL.instance.cnn.escape(req.body.fh_ataque || '');
    const tipoInc: number = req.body.tipo_incid || 1 ; // 1 = Desconocido
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
                return res.status(400).json({
                    ok: false, 
                    error: err
                });
            } else {
                return res.json({
                    ok: true,
                    id: id[0][0].last_id
                });
            }
        });
});

export default router;