import { Router, Request, Response, request } from 'express';
import MySQL from '../mysql/mysql';
import Server from '../server/server';

const router = Router();
const socketServer = Server.instance;
const { obtenerAlertasPendientes } = require('../mysql/mysql-alertas.nit');

router.get('/:id_reporte', (req: Request, res: Response) => {
    const id_reporte = req.params.id_reporte;

    const QUERY = `CALL getActivacionesReporte(${id_reporte});`;
    MySQL.ejecutarQuery(QUERY, (err: any, activaciones: any[]) => {
        if(err) {
            return res.status(500).json({
                ok: false, 
                error: err
            });
        } else{
            // Emitir a un usuario en especifico la hora del nuevo botonazo 
            // if(Number.parseInt(id_reporte) >= 1){
            //     socketServer.emitirListaBotonazos(Number.parseInt(id_reporte), { activaciones: activaciones[0] });
            // }
            return res.json({
                ok: true, 
                activaciones: activaciones[0]
            });
        }
    });
});

// Cancelar la alerta o activación
router.put('/:id_reporte', (req: Request, res: Response) => {
    const id_reporte: number = Number.parseInt(req.params.id_reporte);
    const estatus: number = Number.parseInt(req.body.estatus);
    const QUERY = `UPDATE reporte SET estatus_actual = ${estatus} WHERE id_reporte = ${id_reporte};`

    MySQL.ejecutarQuery(QUERY, (err: any, resultado: any) => {
        if(err){
            console.log('Error al modificar el estatus del reporte');
            console.log(err);
            return res.status(500).json({
                ok: false, 
                err
            });
        } else {
            // console.log('Todo salió bien');
            // console.log(resultado);
            return res.json({
                ok: true, 
                col_afectadas: resultado.affectedRows
            });
        }
    })

})


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
                            // Emitir a todos los usuarios la lista actualizada de alertas
                            socketServer.emitirAlertasActualizadas(alertas, 'NIT');

                            // Una vez agregada la alerta se actualiza la lista
                            const QUERY = `CALL getActivacionesReporte(${id_reporte});`;
                            MySQL.ejecutarQuery(QUERY, (err: any, activaciones: any[]) => {
                                if(err) {
                                    console.log('Error al obtener activaciones por reporte');
                                    console.log(err);
                                    return res.json({
                                        ok: false,
                                        error: err
                                    });
                                } else{
                                    // Emitir a un usuario en especifico la hora del nuevo botonazo 
                                    socketServer.emitirListaBotonazos(id_reporte, { activaciones: activaciones[0] });

                                    // Responder
                                    return res.json({
                                        ok: true
                                    });
                                }
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