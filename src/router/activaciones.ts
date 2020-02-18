import { Router, Request, Response} from 'express';
import MySQL from '../mysql/mysql';
import Server from '../server/server';

const router = Router();
const socketServer = Server.instance;
const { obtenerAlertasPendientes } = require('../mysql/mysql-alertas.nit');

// Registrar cada vez que se presiona el botón de pánico con un reporte existente generado
router.post('/:id_reporte', (req: Request, res: Response) => {
    const id_reporte: number = Number.parseInt(req.params.id_reporte);
    const fecha_activacion = MySQL.instance.cnn.escape(req.body.fecha_activacion);
    const QUERY = `CALL addActivacionReporte(${id_reporte}, ${fecha_activacion});`
    
    if(id_reporte >= 1 && fecha_activacion != undefined ){
        MySQL.ejecutarQuery(QUERY, (err: any, resp: any) => { 
            if(err) {
                return res.status(500).json({
                    ok: false, 
                    error: err
                });
            } else {
                if(resp.affectedRows && resp.affectedRows == 1){
                    
                     // Mandar lista actualizada a todos los usuarios 
                     obtenerAlertasPendientes( (err: any, alertas: Object) => {
                        if(err){
                            // Deberia de mostrar una pantalla de alerta de error al traer la nueva lista
                            console.log('Ocurrió un error al agregar botonazo');
                            console.log(err);
                            return res.json({
                                ok: false,
                                error: err
                            });
                        } else {
                            socketServer.emitirAlertasActualizadas(alertas);
                            return res.json({
                                ok: true
                            });
                        }
                    });
                    
                   
                } else {
                    return res.json({
                        ok: false, 
                        error: 'No se insertó activación'
                    });
                }
            }
        });
    } else {
        return res.json({
            ok: false, 
            error: 'Información incompleta'
        });
    }
});


export default router; 