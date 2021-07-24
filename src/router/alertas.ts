import { Router, Request, Response } from 'express';
const { verificaToken, verificaTokenComercio } = require('../server/middlewares/autenticacion');
const { obtenerAlertasPendientes } = require('../mysql/mysql-alertas.nit');
const { Alertas }  = require('../server/classes/alertas');
import Server from '../server/server';
import MySQL from '../mysql/mysql';
import KML from '../kml/kml';

const router = Router();
const alertas = new Alertas();
const socketServer = Server.instance;

// Registrar nueva alerta de panico
router.post('/', (req: Request, res: Response) => {  
    const idUserCc: number = 1; // 1 = Sin atender
    const idComercReporte: number = req.body.idComercio;
    const idUserApp: number = req.body.idUsuario;
    const idUnidad: number = 1; // 1 = Ninguna unidad
    const fhDoc: string = MySQL.instance.cnn.escape(obtenerFechaHoy());
    const fhAtaque: string = MySQL.instance.cnn.escape(req.body.fecha);
    const tipoInc: number = 1 ; // 1 = Desconocido
    const descripEmerg: string = MySQL.instance.cnn.escape('');
    const clasifEmerg: number = 0; // 0 = Normal
    const estatusActual: number = 0; // 0 = Sin atender
    const cierreConcl: string = MySQL.instance.cnn.escape('');
    
    
    // Agrega reporte pero sin coordenadas
    KML.instance.buscarSala(req.body).then( (sala: any )=>{
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
            ${MySQL.instance.cnn.escape(sala)},
            @last_id);`;

            
        ejecutarC(query, res, idComercReporte, idUserApp, sala);
    }).catch( (sala: any)=> {
        // console.log('CATCH');
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
            ${MySQL.instance.cnn.escape('C5DURANGO')},
            @last_id);`;
        ejecutarC(query, res, idComercReporte, idUserApp, 'C5DURANGO');
    });

});

// Registrar nueva alerta de panico con coodenadas
router.post('/coordenadas/', (req: Request, res: Response) => {


    console.log('/alerta/coordenadas/', req.body);

    const idUserCc: number = 1; // 1 = Sin atender
    const idComercReporte: number = req.body.idComercio;
    const idUserApp: number = req.body.idUsuario;
    const idUnidad: number = 1; // 1 = Ninguna unidad
    const fhDoc: string = MySQL.instance.cnn.escape(obtenerFechaHoy());
    const fhAtaque: string = MySQL.instance.cnn.escape(req.body.fecha);
    const tipoInc: number = 1 ; // 0 = Desconocido
    let descripEmerg: string ='';
    const clasifEmerg: number = 0; // 0 = Normal
    const estatusActual: number = 0; // 0 = Sin atender
    const cierreConcl: string = MySQL.instance.cnn.escape('');

    // DATOS DE LAS COORDENADAS    
    const latitud = MySQL.instance.cnn.escape(req.body.latitud);
    const longitud = MySQL.instance.cnn.escape(req.body.longitud);
    const lugar_ataque = MySQL.instance.cnn.escape(req.body.lugar || req.body.tipo);

    if(idComercReporte == undefined){    
        return res.json({
            ok: false, 
            message: 'Datos de comercio incompletos'
        });
    }

    // if(req.body?.latitud != 0.0 && req.body?.latitud != undefined){
    //     // Trabajar con las coordenadas y poligonos.
    //     latitud = MySQL.instance.cnn.escape(req.body.latitud);
    //     longitud = MySQL.instance.cnn.escape(req.body.longitud);
    //     lugar_ataque = MySQL.instance.cnn.escape(req.body.lugar || req.body.tipo);
    // } 
    

    KML.instance.buscarSala(req.body).then( (sala: any )=>{
        const query = `CALL addReporteCoordRtID(
            ${idUserCc},
            ${idComercReporte},
            ${idUserApp},
            ${idUnidad},
            ${fhDoc},
            ${fhAtaque},
            ${tipoInc},
            ${MySQL.instance.cnn.escape(descripEmerg)},
            ${clasifEmerg},
            ${estatusActual},
            ${cierreConcl},
            ${MySQL.instance.cnn.escape(sala)},
    
            ${latitud},
            ${longitud},
            ${fhAtaque},
            ${lugar_ataque},
            @last_id_reporte);`;

            ejecutarC(query, res, idComercReporte, idUserApp, sala);

    }).catch((sala: any)=>{

        const query = `CALL addReporteCoordRtID(
            ${idUserCc},
            ${idComercReporte},
            ${idUserApp},
            ${idUnidad},
            ${fhDoc},
            ${fhAtaque},
            ${tipoInc},
            ${MySQL.instance.cnn.escape(descripEmerg + '\nNOTA SISTEMA: NO SE DETERMINÓ UBICACIÓN.')},
            ${clasifEmerg},
            ${estatusActual},
            ${cierreConcl},
            ${MySQL.instance.cnn.escape('C5DURANGO')},
    
            ${latitud},
            ${longitud},
            ${fhAtaque},
            ${lugar_ataque},
            @last_id_reporte);`;
        
        ejecutarC(query, res, idComercReporte, idUserApp, 'C5DURANGO');
    });


    

    

});

// Registrar nueva alerta con reporte manual
router.post('/notificacion/', (req: Request, res: Response) => {

    // console.log('/alerta/notificacion/', req.body);
    
    const idUserCc: number = 1; // 1 = Sin atender
    const idComercReporte: number = req.body.idComercio;
    const idUserApp: number = req.body.idUsuario;
    const idUnidad: number = 1; // 1 = Ninguna unidad
    const fhDoc: string = MySQL.instance.cnn.escape(obtenerFechaHoy());
    const fhAtaque: string = MySQL.instance.cnn.escape(req.body.fecha);
    const tipoInc: number = 1 ; // 0 = Desconocido
    const tipoInc_user: string = MySQL.instance.cnn.escape(req.body.tipoIncidUser || '');
    const descripEmerg: string = MySQL.instance.cnn.escape('');
    const descripEmerg_user: string = MySQL.instance.cnn.escape(req.body.descripEmergUser || '');
    const clasifEmerg: number = 0; // 0 = Normal
    const quien: string = MySQL.instance.cnn.escape(req.body.quien || 'Yo');
    const cuerpo: string = MySQL.instance.cnn.escape(req.body.cuerpo || 'Desconocido');
    const estatusActual: number = 0; // 0 = Sin atender
    const cierreConcl: string = MySQL.instance.cnn.escape('');

    KML.instance.buscarSala(req.body).then( (sala: any )=>{
        const query = `CALL addReporteNotificacionRtID(
            ${idUserCc},
            ${idComercReporte},
            ${idUserApp},
            ${idUnidad},
            ${fhDoc},
            ${fhAtaque},
            ${tipoInc},
            ${tipoInc_user},
            ${cuerpo},
            ${descripEmerg},
            ${descripEmerg_user},
            ${clasifEmerg},
            ${quien},
            ${estatusActual},
            ${cierreConcl},
            ${MySQL.instance.cnn.escape(sala)},
            @last_id);`;

        ejecutarC(query, res, idComercReporte, idUserApp, sala);

    }).catch( (sala: any)=> {
        const query = `CALL addReporteNotificacionRtID(
            ${idUserCc},
            ${idComercReporte},
            ${idUserApp},
            ${idUnidad},
            ${fhDoc},
            ${fhAtaque},
            ${tipoInc},
            ${tipoInc_user},
            ${cuerpo},
            ${descripEmerg},
            ${descripEmerg_user},
            ${clasifEmerg},
            ${quien},
            ${estatusActual},
            ${cierreConcl},
            ${MySQL.instance.cnn.escape('C5DURANGO')},
            @last_id);`;

        ejecutarC(query, res, idComercReporte, idUserApp, 'C5DURANGO');

    });
        
    
        
            // MySQL.ejecutarQuery( query, (err: any, data: any[][]) => {
            //     if(err) {
            //         res.json({
            //             ok: false, 
            //             message: 'Ocurrió un error al emitir alerta',
            //             err
            //         });
            //     } else {
            //         // Se retornan los datos del reporte
            //         const reporteAgregado = data[0][0].last_id;
            //         const estacion = data[0][0].estacion;
            //         console.log('LA ESTACION ES: ' + estacion);
    
            //         let alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercReporte, idUserApp, 1, 0);
            //         // primer parametro es object {estacion y sala}
            //         obtenerAlertasPendientes( {sala: data[0][0].sala, estacion}, (err: any, alertas: Object) => {
            //             if(err){
            //                 console.log('Error al obtener alertas pendientes');
            //                 console.log(err);
            
            //             } else {
            //                 socketServer.emitirAlertasActualizadas( Number.parseInt(estacion), alertas, data[0][0].sala);
            //             }
            //         });
            //         console.log(`Se creó el reporte ${reporteAgregado} <==============`);
            //         res.json({
            //             ok: true, 
            //             reporteCreado: reporteAgregado,
            //             message: 'Reporte creado con éxito. Folio #' + reporteAgregado, 
            //         });
            //     }
            // });

});

// Registrar nueva alerta con reporte manual y coordenadas
router.post('/notificacion/coordenadas/', (req: Request, res: Response) => {

    
    // console.log('/alerta/notificacion/coordenadas/', req.body);
    const idUserCc: number = 1; // 1 = Sin atender
    const idComercReporte: number = req.body.idComercio;
    const idUserApp: number = req.body.idUsuario;
    const idUnidad: number = 1; // 1 = Ninguna unidad
    const fhDoc: string = MySQL.instance.cnn.escape(obtenerFechaHoy());
    const fhAtaque: string = MySQL.instance.cnn.escape(req.body.fecha);
    const tipoInc: number = 1 ; // 0 = Desconocido
    const tipoInc_user: string = MySQL.instance.cnn.escape(req.body.tipoIncidUser || '');
    const descripEmerg: string = MySQL.instance.cnn.escape('');
    const descripEmerg_user: string = req.body.descripEmergUser || '';
    const clasifEmerg: number = 0; // 0 = Normal
    const quien: string = MySQL.instance.cnn.escape(req.body.quien || 'Yo');
    const cuerpo: string = MySQL.instance.cnn.escape(req.body.cuerpo || 'Desconocido');
    const estatusActual: number = 0; // 0 = Sin atender
    const cierreConcl: string = MySQL.instance.cnn.escape('');
    
    // DATOS DE LAS COORDENADAS    
    let latitud = MySQL.instance.cnn.escape(0.0);
    let longitud = MySQL.instance.cnn.escape(0.0);
    let lugar_ataque = MySQL.instance.cnn.escape('Casa');

    if(idComercReporte == undefined){    
        return res.json({
            ok: false, 
            message: 'Datos de comercio incompletos'
        });
    }

    if(req.body?.latitud != 0.0 && req.body?.latitud != undefined){
        // Trabajar con las coordenadas y poligonos.
        latitud = MySQL.instance.cnn.escape(req.body.latitud);
        longitud = MySQL.instance.cnn.escape(req.body.longitud);
        lugar_ataque = MySQL.instance.cnn.escape(req.body.lugar);
    } 

    KML.instance.buscarSala(req.body).then( (sala: any )=>{
        const query = `CALL addReporteNotificacionCoord(
            ${idUserCc},
            ${idComercReporte},
            ${idUserApp},
            ${idUnidad},
            ${fhDoc},
            ${fhAtaque},
            ${tipoInc},
            ${tipoInc_user},
            ${cuerpo},
            ${descripEmerg},
            ${MySQL.instance.cnn.escape(descripEmerg_user)},
            ${clasifEmerg},
            ${quien},
            ${estatusActual},
            ${cierreConcl},
            ${MySQL.instance.cnn.escape(sala)},
    
            ${latitud}, 
            ${longitud},
            ${fhAtaque},
            ${lugar_ataque},
            @last_id);`;
        
        ejecutar(query, res, idComercReporte, idUserApp, sala);
        
    }).catch((sala: any)=>{
        // No se ubicó la sala, se manda a C5DURANGO
        console.log('No se ubicó la sala');
        const query = `CALL addReporteNotificacionCoord(
            ${idUserCc},
            ${idComercReporte},
            ${idUserApp},
            ${idUnidad},
            ${fhDoc},
            ${fhAtaque},
            ${tipoInc},
            ${tipoInc_user},
            ${cuerpo},
            ${descripEmerg},
            ${MySQL.instance.cnn.escape(descripEmerg_user + '\nNOTA SISTEMA: NO SE DETERMINÓ UBICACIÓN.')},
            ${clasifEmerg},
            ${quien},
            ${estatusActual},
            ${cierreConcl},
            ${MySQL.instance.cnn.escape('C5DURANGO')},
    
            ${latitud}, 
            ${longitud},
            ${fhAtaque},
            ${lugar_ataque},
            @last_id);`;
        
        ejecutar(query, res, idComercReporte, idUserApp, 'C5DURANGO');
    });
});

function ejecutarC(query: string, res: Response, idComercReporte: any, idUserApp: any, sala: any){
    try {
        // console.log('AQUI EN ejecutarC() --> QUERY QUE EJECUTARÉ', query);
        MySQL.ejecutarQuery( query, (err: any, data: any[][]) => {
            if(err) {
                return res.json({
                    ok: false, 
                    message: 'Ocurrió un error al emitir alerta',
                    err
                });
            } else {
                // Se retornan los datos del reporte 
                
                const reporteAgregado = data[0][0].last_id;
                let estacion = data[0][0].estacion;
                const coordenada = data[0][0].id_coord;
                
                // console.log('(1) LA ESTACION ES: ' + estacion);
                // console.log(data[0][0]);

                if (estacion == 0 || estacion == undefined){
                    // POR MIENTRAS
                    estacion = 2020023;
                } 

                let alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercReporte, idUserApp, 1, 0);
                // primer parametro es object {idEstacion y sala}
                obtenerAlertasPendientes( {sala, estacion}, (err: any, alertas: Object) => {
                    if(err){
                        console.log('Error al obtener alertas pendientes');
                        console.log(err);
                    } else {
                        socketServer.emitirAlertasActualizadas( Number.parseInt(estacion), alertas, sala);
                    }
                });
                console.log(`Se creó el reporte ${reporteAgregado} <==============`);
                return res.json({
                    ok: true, 
                    reporteCreado: reporteAgregado,
                    message: 'Reporte creado con éxito. Folio #' + reporteAgregado, 
                });
            }
        });
    } catch(error){
        return res.json({
            ok: false, 
            message: 'Ocurrió un error al agregar reporte',
            error
        });
    }
}

function ejecutar(query: string, res: Response, idComercReporte: any, idUserApp: any, sala: any){
    // console.log('QUERY QUE EJECUTARÉ', query);
    try{
        MySQL.ejecutarQuery( query, (err: any, data: any[][]) => {
            if(err) {
                return res.json({
                    ok: false, 
                    message: 'Ocurrió un error al emitir alerta',
                    err
                });
            } else {
                // Se retornan los datos del reporte
                const reporteAgregado = data[0][0].last_id;
                let estacion = data[0][0].estacion;
                const coordenada = data[0][0].id_coord;
    
                // console.log('(2) LA ESTACION ES: ' + estacion);
                // console.log(data[0][0]);
                if (estacion == 0 || estacion == undefined){
                    estacion = 2020023;
                }   
    
                let alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercReporte, idUserApp, 1, 0);
                // primer parametro es object {idEstacion y sala}
                obtenerAlertasPendientes( {sala, estacion}, (err: any, alertas: Object) => {
                    if(err){
                        console.log('Error al obtener alertas pendientes');
                        console.log(err);
                    } else {
                        socketServer.emitirAlertasActualizadas( Number.parseInt(estacion), alertas, sala);
                    }
                });
                console.log(`Se creó el reporte ${reporteAgregado} <==============`);
                return res.json({
                    ok: true, 
                    reporteCreado: reporteAgregado,
                    message: 'Reporte creado con éxito. Folio #' + reporteAgregado, 
                });
            }
        });
    } catch(error){
        return res.json({
            ok: false, 
            message: 'Ocurrió un error al agregar reporte',
            error
        });
    }
}


// Obtener todos los comercios // NO SE UTILIZA
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

// Registrar nueva alerta con reporte manual y coordenadas //SI
// router.post('/notificacion/coordenadas/', (req: Request, res: Response) => {

//     console.log('/alerta/notificacion/coordenadas/', req.body);

//     // Si lleva codigo de municipio lo hace con dirección
//     // req.body.cod_municipio = 39;
//     KML.instance.buscarSala(req.body).then( (sala: any )=>{
//         console.log('La sala: ' + sala + ' - ' + sala.length);
//         // Si la longitud de la sala es de 0, no existió. 
//         // Al tener sala se puede agregar en la base de datos


//     }).catch(()=>{
//         console.log('No se ubicó la sala');
//     });
    
//     // Recibir datos p t reporte
//     const idUserCc: number = 1; // 1 = Sin atender
//     const idComercReporte: number = req.body.idComercio;
//     const idUserApp: number = req.body.idUsuario;
//     const idUnidad: number = 1; // 1 = Ninguna unidad
//     const fhDoc: string = MySQL.instance.cnn.escape(obtenerFechaHoy());
//     const fhAtaque: string = MySQL.instance.cnn.escape(req.body.fecha);
//     const tipoInc: number = 0 ; // 0 = Desconocido
//     const tipoInc_user: string = MySQL.instance.cnn.escape(req.body.tipoIncidUser || '');
//     const descripEmerg: string = MySQL.instance.cnn.escape('');
//     const descripEmerg_user: string = MySQL.instance.cnn.escape(req.body.descripEmergUser || '');
//     const clasifEmerg: number = 0; // 0 = Normal
//     const quien: string = MySQL.instance.cnn.escape(req.body.quien || 'Yo');
//     const cuerpo: string = MySQL.instance.cnn.escape(req.body.cuerpo || 'Desconocido');
//     const estatusActual: number = 0; // 0 = Sin atender
//     const cierreConcl: string = MySQL.instance.cnn.escape('');
    
//     // DATOS DE LAS COORDENADAS    
//     let latitud = req.body.latitud;
//     let longitud = req.body.longitud;
//     let lugar_ataque: string = MySQL.instance.cnn.escape(req.body.lugar);

//     if(idComercReporte == undefined){    
//         return res.json({
//             ok: false, 
//             message: 'Datos de comercio incompletos'
//         });
//     }

//     if(req.body?.latitud != 0.0 && req.body?.latitud != undefined){
//         // Trabajar con las coordenadas y poligonos.
//         // console.log('Trabajaré con el poligono');


//     } else {
//         // req.body?.latitud == undefined || req.body?.longitud == undefined || 
//         // Trabajar con la dirección registrada.
//         // console.log('Trabajaré con la dirección');
//         // Marca error en las coordenadas undefined
//         latitud = MySQL.instance.cnn.escape(0.0);
//         longitud = MySQL.instance.cnn.escape(0.0);
//         lugar_ataque = MySQL.instance.cnn.escape('Casa');
//     }

    

//     try {
        
//         const query = `CALL addReporteNotificacionCoord(
//             ${idUserCc},
//             ${idComercReporte},
//             ${idUserApp},
//             ${idUnidad},
//             ${fhDoc},
//             ${fhAtaque},
//             ${tipoInc},
//             ${tipoInc_user},
//             ${cuerpo},
//             ${descripEmerg},
//             ${descripEmerg_user},
//             ${clasifEmerg},
//             ${quien},
//             ${estatusActual},
//             ${cierreConcl},

//             ${latitud}, 
//             ${longitud},
//             ${fhAtaque},
//             ${lugar_ataque},
//             @last_id);`;
    
        
//             MySQL.ejecutarQuery( query, (err: any, data: any[][]) => {
//                 if(err) {
//                     return res.json({
//                         ok: false, 
//                         message: 'Ocurrió un error al emitir alerta',
//                         err
//                     });
//                 } else {
//                     // Se retornan los datos del reporte
//                     const reporteAgregado = data[0][0].last_id;
//                     const estacion = data[0][0].estacion;
//                     const coordenada = data[0][0].id_coord;
                    
                    
//                     console.log('LA ESTACION ES: ' + estacion);

//                     if (estacion == 0 || estacion == undefined){
//                         return res.status(500).json({
//                             ok: false, 
//                             message: 'Ocurrió un error al agregar reporte con coordenadas.',
//                             err
//                         });
//                     }   

//                     let alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercReporte, idUserApp, 1, 0);
//                     // primer parametro es object {idEstacion y sala}
//                     obtenerAlertasPendientes( {sala: data[0][0].sala, estacion}, (err: any, alertas: Object) => {
//                         if(err){
//                             console.log('Error al obtener alertas pendientes');
//                             console.log(err);
//                         } else {
//                             socketServer.emitirAlertasActualizadas( Number.parseInt(estacion), alertas, data[0][0].sala);
//                         }
//                     });
//                     console.log(`Se creó el reporte ${reporteAgregado} <==============`);
//                     res.json({
//                         ok: true, 
//                         reporteCreado: reporteAgregado,
//                         message: 'Reporte creado con éxito. Folio #' + reporteAgregado, 
//                     });
//                 }
//             });
//     } catch(error){
//         res.json({
//             ok: false, 
//             message: 'Ocurrió un error al agregar reporte',
//             error
//         });
//     }

// });


export default
 router;