import MySQL from './mysql';


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

function abrirPeticion(idReporte: number, idUsuarioNIT: number, callback: Function){
    const query = `CALL editEstatusReporte(${idReporte}, ${idUsuarioNIT}, 1, @nuevo_estatus);`;
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
}

module.exports = {
    obtenerAlertasPendientes,
    abrirPeticion
}
