import { Router, Request, Response } from 'express';
const { verificaToken } = require('../server/middlewares/autenticacion');
const { obtenerAlertasPendientes } = require('../mysql/mysql-alertas.nit');
const { Alertas }  = require('../server/classes/alertas');
import Server from '../server/server';
import MySQL from '../mysql/mysql';

const router = Router();
const alertas = new Alertas();
const socketServer = Server.instance;

// Registrar nueva alerta de panico (Se cambió de socket a POST)
router.post('/', (req: Request, res: Response) => {
    
    // Recibir datos p t reporte
    const idUserCc: number = 1; // 1 = Sin atender
    const idComercReporte: number = req.body.idComercio;
    const idUserApp: number = req.body.idUsuario;
    const idUnidad: number = 1; // 1 = Ninguna unidad
    const fhDoc: string = MySQL.instance.cnn.escape(obtenerFechaHoy());
    const fhAtaque: string = MySQL.instance.cnn.escape(req.body.fecha);
    const tipoInc: number = 0 ; // 0 = Desconocido
    const descripEmerg: string = MySQL.instance.cnn.escape('');
    const clasifEmerg: number = 0; // 0 = Normal
    const estatusActual: number = 0; // 0 = Sin atender
    const cierreConcl: string = MySQL.instance.cnn.escape('');

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
                res.status(500).json({
                    ok: false, 
                    message: 'Ocurrió un error al emitir alerta',
                    err
                });
            } else {
                // Se retornan los datos del reporte
                const reporteAgregado = id[0][0].last_id;
    
                let alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercReporte, idUserApp, 1, 0);
                obtenerAlertasPendientes( (err: any, alertas: Object) => {
                    if(err){
                        console.log('Error al obtener alertas pendientes');
                        console.log(err);
        
                    } else {
                        socketServer.emitirAlertasActualizadas(alertas, 'NIT');
                    }
                });
                console.log(`Se creó el reporte ${reporteAgregado} <==============`);
                res.json({
                    ok: true, 
                    reporteCreado: reporteAgregado,
                    message: 'Reporte creado con éxito. Folio #' + reporteAgregado, 
                });
                // Emitir a cliente android que la alerta se recibio con el # del reporte 
                //cliente.emit('alertaRecibida', `${reporteAgregado}`);
            }
        });

});

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

function obtenerFechaHoy(){
    const fh = new Date();
    let dia = fh.getDate();
    let mes = fh.getMonth() +1 ;
    let anio = fh.getFullYear();
    let hora = fh.getHours();
    let min = fh.getMinutes();
    let seg = fh.getSeconds();
    const fechaCompleta = `${ anio }-${ mes }-${ dia } ${ hora }:${ min }:${ seg }`;
    return fechaCompleta;
}

export default
 router;