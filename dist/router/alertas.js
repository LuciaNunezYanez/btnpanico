"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var _a = require('../server/middlewares/autenticacion'), verificaToken = _a.verificaToken, verificaTokenComercio = _a.verificaTokenComercio;
var obtenerAlertasPendientes = require('../mysql/mysql-alertas.nit').obtenerAlertasPendientes;
var Alertas = require('../server/classes/alertas').Alertas;
var server_1 = __importDefault(require("../server/server"));
var mysql_1 = __importDefault(require("../mysql/mysql"));
var kml_1 = __importDefault(require("../kml/kml"));
var router = express_1.Router();
var alertas = new Alertas();
var socketServer = server_1.default.instance;
// Registrar nueva alerta de panico
router.post('/', function (req, res) {
    var idUserCc = 1; // 1 = Sin atender
    var idComercReporte = req.body.idComercio;
    var idUserApp = req.body.idUsuario;
    var idUnidad = 1; // 1 = Ninguna unidad
    var fhDoc = mysql_1.default.instance.cnn.escape(obtenerFechaHoy());
    var fhAtaque = mysql_1.default.instance.cnn.escape(req.body.fecha);
    var tipoInc = 1; // 1 = Desconocido
    var descripEmerg = mysql_1.default.instance.cnn.escape('');
    var clasifEmerg = 0; // 0 = Normal
    var estatusActual = 0; // 0 = Sin atender
    var cierreConcl = mysql_1.default.instance.cnn.escape('');
    // Agrega reporte pero sin coordenadas
    kml_1.default.instance.buscarSala(req.body).then(function (sala) {
        var query = "CALL addReporteRtID(\n            " + idUserCc + ",\n            " + idComercReporte + ",\n            " + idUserApp + ",\n            " + idUnidad + ",\n            " + fhDoc + ",\n            " + fhAtaque + ",\n            " + tipoInc + ",\n            " + descripEmerg + ",\n            " + clasifEmerg + ",\n            " + estatusActual + ",\n            " + cierreConcl + ",\n            " + mysql_1.default.instance.cnn.escape(sala) + ",\n            @last_id);";
        ejecutarC(query, res, idComercReporte, idUserApp, sala);
    }).catch(function (sala) {
        // console.log('CATCH');
        var query = "CALL addReporteRtID(\n            " + idUserCc + ",\n            " + idComercReporte + ",\n            " + idUserApp + ",\n            " + idUnidad + ",\n            " + fhDoc + ",\n            " + fhAtaque + ",\n            " + tipoInc + ",\n            " + descripEmerg + ",\n            " + clasifEmerg + ",\n            " + estatusActual + ",\n            " + cierreConcl + ",\n            " + mysql_1.default.instance.cnn.escape('C5DURANGO') + ",\n            @last_id);";
        ejecutarC(query, res, idComercReporte, idUserApp, 'C5DURANGO');
    });
});
// Registrar nueva alerta de panico con coodenadas
router.post('/coordenadas/', function (req, res) {
    console.log('/alerta/coordenadas/', req.body);
    var idUserCc = 1; // 1 = Sin atender
    var idComercReporte = req.body.idComercio;
    var idUserApp = req.body.idUsuario;
    var idUnidad = 1; // 1 = Ninguna unidad
    var fhDoc = mysql_1.default.instance.cnn.escape(obtenerFechaHoy());
    var fhAtaque = mysql_1.default.instance.cnn.escape(req.body.fecha);
    var tipoInc = 1; // 0 = Desconocido
    var descripEmerg = '';
    var clasifEmerg = 0; // 0 = Normal
    var estatusActual = 0; // 0 = Sin atender
    var cierreConcl = mysql_1.default.instance.cnn.escape('');
    // DATOS DE LAS COORDENADAS    
    var latitud = mysql_1.default.instance.cnn.escape(req.body.latitud);
    var longitud = mysql_1.default.instance.cnn.escape(req.body.longitud);
    var lugar_ataque = mysql_1.default.instance.cnn.escape(req.body.lugar || req.body.tipo);
    if (idComercReporte == undefined) {
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
    kml_1.default.instance.buscarSala(req.body).then(function (sala) {
        var query = "CALL addReporteCoordRtID(\n            " + idUserCc + ",\n            " + idComercReporte + ",\n            " + idUserApp + ",\n            " + idUnidad + ",\n            " + fhDoc + ",\n            " + fhAtaque + ",\n            " + tipoInc + ",\n            " + mysql_1.default.instance.cnn.escape(descripEmerg) + ",\n            " + clasifEmerg + ",\n            " + estatusActual + ",\n            " + cierreConcl + ",\n            " + mysql_1.default.instance.cnn.escape(sala) + ",\n    \n            " + latitud + ",\n            " + longitud + ",\n            " + fhAtaque + ",\n            " + lugar_ataque + ",\n            @last_id_reporte);";
        ejecutarC(query, res, idComercReporte, idUserApp, sala);
    }).catch(function (sala) {
        var query = "CALL addReporteCoordRtID(\n            " + idUserCc + ",\n            " + idComercReporte + ",\n            " + idUserApp + ",\n            " + idUnidad + ",\n            " + fhDoc + ",\n            " + fhAtaque + ",\n            " + tipoInc + ",\n            " + mysql_1.default.instance.cnn.escape(descripEmerg + '\nNOTA SISTEMA: NO SE DETERMINÓ UBICACIÓN.') + ",\n            " + clasifEmerg + ",\n            " + estatusActual + ",\n            " + cierreConcl + ",\n            " + mysql_1.default.instance.cnn.escape('C5DURANGO') + ",\n    \n            " + latitud + ",\n            " + longitud + ",\n            " + fhAtaque + ",\n            " + lugar_ataque + ",\n            @last_id_reporte);";
        ejecutarC(query, res, idComercReporte, idUserApp, 'C5DURANGO');
    });
});
// Registrar nueva alerta con reporte manual
router.post('/notificacion/', function (req, res) {
    // console.log('/alerta/notificacion/', req.body);
    var idUserCc = 1; // 1 = Sin atender
    var idComercReporte = req.body.idComercio;
    var idUserApp = req.body.idUsuario;
    var idUnidad = 1; // 1 = Ninguna unidad
    var fhDoc = mysql_1.default.instance.cnn.escape(obtenerFechaHoy());
    var fhAtaque = mysql_1.default.instance.cnn.escape(req.body.fecha);
    var tipoInc = 1; // 0 = Desconocido
    var tipoInc_user = mysql_1.default.instance.cnn.escape(req.body.tipoIncidUser || '');
    var descripEmerg = mysql_1.default.instance.cnn.escape('');
    var descripEmerg_user = mysql_1.default.instance.cnn.escape(req.body.descripEmergUser || '');
    var clasifEmerg = 0; // 0 = Normal
    var quien = mysql_1.default.instance.cnn.escape(req.body.quien || 'Yo');
    var cuerpo = mysql_1.default.instance.cnn.escape(req.body.cuerpo || 'Desconocido');
    var estatusActual = 0; // 0 = Sin atender
    var cierreConcl = mysql_1.default.instance.cnn.escape('');
    kml_1.default.instance.buscarSala(req.body).then(function (sala) {
        var query = "CALL addReporteNotificacionRtID(\n            " + idUserCc + ",\n            " + idComercReporte + ",\n            " + idUserApp + ",\n            " + idUnidad + ",\n            " + fhDoc + ",\n            " + fhAtaque + ",\n            " + tipoInc + ",\n            " + tipoInc_user + ",\n            " + cuerpo + ",\n            " + descripEmerg + ",\n            " + descripEmerg_user + ",\n            " + clasifEmerg + ",\n            " + quien + ",\n            " + estatusActual + ",\n            " + cierreConcl + ",\n            " + mysql_1.default.instance.cnn.escape(sala) + ",\n            @last_id);";
        ejecutarC(query, res, idComercReporte, idUserApp, sala);
    }).catch(function (sala) {
        var query = "CALL addReporteNotificacionRtID(\n            " + idUserCc + ",\n            " + idComercReporte + ",\n            " + idUserApp + ",\n            " + idUnidad + ",\n            " + fhDoc + ",\n            " + fhAtaque + ",\n            " + tipoInc + ",\n            " + tipoInc_user + ",\n            " + cuerpo + ",\n            " + descripEmerg + ",\n            " + descripEmerg_user + ",\n            " + clasifEmerg + ",\n            " + quien + ",\n            " + estatusActual + ",\n            " + cierreConcl + ",\n            " + mysql_1.default.instance.cnn.escape('C5DURANGO') + ",\n            @last_id);";
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
router.post('/notificacion/coordenadas/', function (req, res) {
    var _a, _b;
    // console.log('/alerta/notificacion/coordenadas/', req.body);
    var idUserCc = 1; // 1 = Sin atender
    var idComercReporte = req.body.idComercio;
    var idUserApp = req.body.idUsuario;
    var idUnidad = 1; // 1 = Ninguna unidad
    var fhDoc = mysql_1.default.instance.cnn.escape(obtenerFechaHoy());
    var fhAtaque = mysql_1.default.instance.cnn.escape(req.body.fecha);
    var tipoInc = 1; // 0 = Desconocido
    var tipoInc_user = mysql_1.default.instance.cnn.escape(req.body.tipoIncidUser || '');
    var descripEmerg = mysql_1.default.instance.cnn.escape('');
    var descripEmerg_user = req.body.descripEmergUser || '';
    var clasifEmerg = 0; // 0 = Normal
    var quien = mysql_1.default.instance.cnn.escape(req.body.quien || 'Yo');
    var cuerpo = mysql_1.default.instance.cnn.escape(req.body.cuerpo || 'Desconocido');
    var estatusActual = 0; // 0 = Sin atender
    var cierreConcl = mysql_1.default.instance.cnn.escape('');
    // DATOS DE LAS COORDENADAS    
    var latitud = mysql_1.default.instance.cnn.escape(0.0);
    var longitud = mysql_1.default.instance.cnn.escape(0.0);
    var lugar_ataque = mysql_1.default.instance.cnn.escape('Casa');
    if (idComercReporte == undefined) {
        return res.json({
            ok: false,
            message: 'Datos de comercio incompletos'
        });
    }
    if (((_a = req.body) === null || _a === void 0 ? void 0 : _a.latitud) != 0.0 && ((_b = req.body) === null || _b === void 0 ? void 0 : _b.latitud) != undefined) {
        // Trabajar con las coordenadas y poligonos.
        latitud = mysql_1.default.instance.cnn.escape(req.body.latitud);
        longitud = mysql_1.default.instance.cnn.escape(req.body.longitud);
        lugar_ataque = mysql_1.default.instance.cnn.escape(req.body.lugar);
    }
    kml_1.default.instance.buscarSala(req.body).then(function (sala) {
        var query = "CALL addReporteNotificacionCoord(\n            " + idUserCc + ",\n            " + idComercReporte + ",\n            " + idUserApp + ",\n            " + idUnidad + ",\n            " + fhDoc + ",\n            " + fhAtaque + ",\n            " + tipoInc + ",\n            " + tipoInc_user + ",\n            " + cuerpo + ",\n            " + descripEmerg + ",\n            " + mysql_1.default.instance.cnn.escape(descripEmerg_user) + ",\n            " + clasifEmerg + ",\n            " + quien + ",\n            " + estatusActual + ",\n            " + cierreConcl + ",\n            " + mysql_1.default.instance.cnn.escape(sala) + ",\n    \n            " + latitud + ", \n            " + longitud + ",\n            " + fhAtaque + ",\n            " + lugar_ataque + ",\n            @last_id);";
        ejecutar(query, res, idComercReporte, idUserApp, sala);
    }).catch(function (sala) {
        // No se ubicó la sala, se manda a C5DURANGO
        console.log('No se ubicó la sala');
        var query = "CALL addReporteNotificacionCoord(\n            " + idUserCc + ",\n            " + idComercReporte + ",\n            " + idUserApp + ",\n            " + idUnidad + ",\n            " + fhDoc + ",\n            " + fhAtaque + ",\n            " + tipoInc + ",\n            " + tipoInc_user + ",\n            " + cuerpo + ",\n            " + descripEmerg + ",\n            " + mysql_1.default.instance.cnn.escape(descripEmerg_user + '\nNOTA SISTEMA: NO SE DETERMINÓ UBICACIÓN.') + ",\n            " + clasifEmerg + ",\n            " + quien + ",\n            " + estatusActual + ",\n            " + cierreConcl + ",\n            " + mysql_1.default.instance.cnn.escape('C5DURANGO') + ",\n    \n            " + latitud + ", \n            " + longitud + ",\n            " + fhAtaque + ",\n            " + lugar_ataque + ",\n            @last_id);";
        ejecutar(query, res, idComercReporte, idUserApp, 'C5DURANGO');
    });
});
function ejecutarC(query, res, idComercReporte, idUserApp, sala) {
    try {
        // console.log('AQUI EN ejecutarC() --> QUERY QUE EJECUTARÉ', query);
        mysql_1.default.ejecutarQuery(query, function (err, data) {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'Ocurrió un error al emitir alerta',
                    err: err
                });
            }
            else {
                // Se retornan los datos del reporte 
                var reporteAgregado = data[0][0].last_id;
                var estacion_1 = data[0][0].estacion;
                var coordenada = data[0][0].id_coord;
                // console.log('(1) LA ESTACION ES: ' + estacion);
                // console.log(data[0][0]);
                if (estacion_1 == 0 || estacion_1 == undefined) {
                    // POR MIENTRAS
                    estacion_1 = 2020023;
                }
                var alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercReporte, idUserApp, 1, 0);
                // primer parametro es object {idEstacion y sala}
                obtenerAlertasPendientes({ sala: sala, estacion: estacion_1 }, function (err, alertas) {
                    if (err) {
                        console.log('Error al obtener alertas pendientes');
                        console.log(err);
                    }
                    else {
                        socketServer.emitirAlertasActualizadas(Number.parseInt(estacion_1), alertas, sala);
                    }
                });
                console.log("Se cre\u00F3 el reporte " + reporteAgregado + " <==============");
                return res.json({
                    ok: true,
                    reporteCreado: reporteAgregado,
                    message: 'Reporte creado con éxito. Folio #' + reporteAgregado,
                });
            }
        });
    }
    catch (error) {
        return res.json({
            ok: false,
            message: 'Ocurrió un error al agregar reporte',
            error: error
        });
    }
}
function ejecutar(query, res, idComercReporte, idUserApp, sala) {
    // console.log('QUERY QUE EJECUTARÉ', query);
    try {
        mysql_1.default.ejecutarQuery(query, function (err, data) {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'Ocurrió un error al emitir alerta',
                    err: err
                });
            }
            else {
                // Se retornan los datos del reporte
                var reporteAgregado = data[0][0].last_id;
                var estacion_2 = data[0][0].estacion;
                var coordenada = data[0][0].id_coord;
                // console.log('(2) LA ESTACION ES: ' + estacion);
                // console.log(data[0][0]);
                if (estacion_2 == 0 || estacion_2 == undefined) {
                    estacion_2 = 2020023;
                }
                var alertaAgregada = alertas.agregarAlerta(reporteAgregado, idComercReporte, idUserApp, 1, 0);
                // primer parametro es object {idEstacion y sala}
                obtenerAlertasPendientes({ sala: sala, estacion: estacion_2 }, function (err, alertas) {
                    if (err) {
                        console.log('Error al obtener alertas pendientes');
                        console.log(err);
                    }
                    else {
                        socketServer.emitirAlertasActualizadas(Number.parseInt(estacion_2), alertas, sala);
                    }
                });
                console.log("Se cre\u00F3 el reporte " + reporteAgregado + " <==============");
                return res.json({
                    ok: true,
                    reporteCreado: reporteAgregado,
                    message: 'Reporte creado con éxito. Folio #' + reporteAgregado,
                });
            }
        });
    }
    catch (error) {
        return res.json({
            ok: false,
            message: 'Ocurrió un error al agregar reporte',
            error: error
        });
    }
}
// Obtener todos los comercios // NO SE UTILIZA
router.get('/', function (req, res) {
    var query = "CALL getReportesPendient();";
    mysql_1.default.ejecutarQuery(query, function (err, reportes) {
        if (err) {
            console.log('Ocurrió un error al traer los reportes: ', err);
        }
        else {
            res.status(200).json({
                ok: true,
                res: reportes
            });
        }
    });
});
function obtenerFechaHoy() {
    var fh = new Date();
    var dia = fh.getDate();
    var mes = fh.getMonth() + 1;
    var anio = fh.getFullYear();
    var hora = fh.getHours();
    var min = fh.getMinutes();
    var seg = fh.getSeconds();
    var fechaCompleta = anio + "-" + mes + "-" + dia + " " + hora + ":" + min + ":" + seg;
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
exports.default = router;
