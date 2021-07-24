import MySQL from './mysql';
import { Alerta } from '../sockets/sockets';
const { decodificarToken } = require('../server/middlewares/autenticacion');

function obtenerAlertasPendientes( data: any, callback: Function){
    // data es object {estacion y sala}

    // const query = `CALL getReportesPend(${data.idEstacion}, ${data.sala});`;
    const query = `CALL getReportesPend(${MySQL.instance.cnn.escape(data.sala)}, ${data.estacion});`;
    console.log(query + " <----------- ");
    MySQL.ejecutarQuery(query, (err: any, alertas: any) =>{
        if(err) {
            callback({
                ok: false,
                err
            });
        } else {

        // console.log(alertas[0]);
             callback(null, {
                 ok: true, 
                 alertas: alertas[0],
                 status: alertas[1]
             });
        }
    });
}

function abrirPeticion( alerta: any, callback: Function){
    // console.log('ABRIR PETICION MYSQL ALERTAS');
    // console.log(alerta);
    const { id_reporte, estatus_actual, id_user_cc, nuevo_estatus} = alerta;

    if(estatus_actual === 0 || estatus_actual === 3){
        const QUERY = `CALL editarEstatusReporte(${id_user_cc}, ${nuevo_estatus}, ${id_reporte});`;

        MySQL.ejecutarQuery(QUERY, (err: any, respuesta: any) =>{
        if(err) {
            return callback({
                ok: false,
                err
            });
        } else {
            return callback(null, {
                 ok: true, 
                 respuesta
             });
        }
    });
    } else {
        return callback(null, {
            ok: false, 
            err: 'La alerta ya fue atendida por otro usuario. '
        });
    }
    
}

/* Puede cerrar alertas con estatus 0 y estatus 3 (Sin modificarlo)*/
function cerrarPeticion( data: any, callback: Function){
    var { id_reporte, estatus_actual, tipo_incid, descrip_emerg, cierre_conclusion, num_unidad, token} = data;
    var id_user_cc;
    
    // Decodificar token 
    const tokenDecodificado = decodificarToken(token);

    if(tokenDecodificado.ok && tokenDecodificado.usuario){
        id_user_cc = tokenDecodificado.usuario.id_usuario;
        // console.log('EL ID DEL USUARIO ES: ' + id_user_cc);
    } else {
        // console.log('Token decodificado');
        // console.log(tokenDecodificado);
        callback({
            ok: false,
            err: 'El id del usuario no viene en el token'
        });
        return;
    }

    const corporacion = 4; //DESCONOCIDA 
    if( estatus_actual === 1){
    
        const QUERY = `CALL editCerrarReporte(
            ${ id_reporte }, 
            ${ id_user_cc }, 
            ${ estatus_actual }, 
            ${ tipo_incid }, 
            ${ MySQL.instance.cnn.escape(descrip_emerg)}, 
            ${ MySQL.instance.cnn.escape(cierre_conclusion)}, 
            ${ corporacion }, 
            ${ MySQL.instance.cnn.escape(num_unidad)}
        );`
        MySQL.ejecutarQuery(QUERY, (err: any, resultado: any) => {
            if(err) {
                callback({
                    ok: false,
                    err
                });
            } else {
                callback(null, {
                    ok: true, 
                    resultado
                });
            }
        })

    } else if( estatus_actual === 3){
        const QUERY = `CALL editCerrarReporteCancelado(
            ${ id_reporte }, 
            ${ id_user_cc }, 
            ${ estatus_actual }, 
            ${ tipo_incid }, 
            ${ MySQL.instance.cnn.escape(descrip_emerg) }, 
            ${ MySQL.instance.cnn.escape(cierre_conclusion) }, 
            ${ corporacion }, 
            ${ MySQL.instance.cnn.escape(num_unidad) }
        );`

        MySQL.ejecutarQuery(QUERY, (err: any, resultado: any) => {
            if(err) {
                callback({
                    ok: false,
                    err
                });
            } else {
                callback(null, {
                    ok: true, 
                    resultado
                });
            }
        })

    } else {
        callback({
            ok: false, 
            err: 'La alerta ya fue cerrada por otro usuario. '
        });
    }
}

module.exports = {
    obtenerAlertasPendientes,
    abrirPeticion, 
    cerrarPeticion
}
