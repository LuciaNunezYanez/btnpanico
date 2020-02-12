import MySQL from './mysql';
import { Alerta } from '../sockets/sockets';

function obtenerAlertasPendientes( callback: Function){
    const query = `CALL getReportesPend();`;
    MySQL.ejecutarQuery(query, (err: any, alertas: any) =>{
        if(err) {
            callback({
                ok: false,
                err
            });
        } else {
             callback(null, {
                 ok: true, 
                 alertas: alertas[0],
                 status: alertas[1]
             });
        }
    });
}

function abrirPeticion( alerta: Alerta, callback: Function){
    const { id_reporte, estatus_actual ,id_user_cc} = alerta;

    if(estatus_actual === 0){
        const query = `update reporte set id_user_cc = ${id_user_cc}, estatus_actual = 1 where id_reporte = ${id_reporte}`;
        MySQL.ejecutarQuery(query, (err: any, respuesta: any) =>{
        if(err) {
            callback({
                ok: false,
                err
            });
        } else {
             callback(null, {
                 ok: true, 
                 respuesta
             });
        }
    });
    } else {
        callback(null, {
            ok: false, 
            err: 'La alerta ya fue atendida por otro usuario. '
        });
    }
    
}

function cerrarPeticion( data: any, callback: Function){
    var { id_reporte, id_user_cc, estatus_actual, tipo_incid, descrip_emerg, cierre_conclusion, num_unidad} = data;
    
    descrip_emerg = MySQL.instance.cnn.escape(descrip_emerg);
    cierre_conclusion = MySQL.instance.cnn.escape(cierre_conclusion);
    num_unidad = MySQL.instance.cnn.escape(num_unidad);

    // También agregar combo box de corporaciones para recibir el ID 
    const corporacion = 4; //DESCONOCIDA 
    const QUERY = `CALL editCerrarReporte(
        ${ id_reporte }, 
        ${ id_user_cc }, 
        ${ estatus_actual }, 
        ${ tipo_incid }, 
        ${ descrip_emerg }, 
        ${ cierre_conclusion }, 
        ${ corporacion }, 
        ${ num_unidad }
    );`

    if( estatus_actual === 1){
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
        callback(null, {
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
