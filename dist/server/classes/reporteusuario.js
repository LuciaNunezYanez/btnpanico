"use strict";
// Utilizada para relacionar el reporte en uso con 
// el usuario que se encuentra atendiendolo. (Socket)
var ReporteUsuario = /** @class */ (function () {
    function ReporteUsuario() {
        this.reportes = [];
        this.reportes = [];
    }
    ReporteUsuario.prototype.agregarReporte = function (idReporte, id_socket, fecha, hora, estatus_reporte, estatus_fotos, estatus_geolocalizacion, estatus_audio) {
        var reporte = {
            idReporte: idReporte,
            id_socket: id_socket,
            fecha: fecha,
            hora: hora,
            estatus_reporte: estatus_reporte,
            estatus_fotos: estatus_fotos,
            estatus_geolocalizacion: estatus_geolocalizacion,
            estatus_audio: estatus_audio
        };
        this.reportes.push(reporte);
        return this.reportes;
    };
    // Obtener la lista de reporte que tiene X socket
    ReporteUsuario.prototype.getMisReportes = function (id_socket) {
        var misReportes = this.reportes.filter(function (reporte) {
            return reporte.id_socket === id_socket;
        });
        return misReportes;
    };
    // Obtener la data del reporte
    // De ahí tomar id_socket
    ReporteUsuario.prototype.getReporte = function (idReporte) {
        var reporte = this.reportes.filter(function (reporte) {
            return reporte.idReporte === idReporte;
        })[0];
        return reporte;
    };
    // Eliminar el reporte por numero de reporte
    ReporteUsuario.prototype.borrarReporte = function (idReporte) {
        var reporteBorrado = this.getReporte(idReporte);
        this.reportes = this.reportes.filter(function (reporte) {
            return reporte.idReporte != idReporte;
        });
        return reporteBorrado;
    };
    // Agregar socketNIT a reporte
    ReporteUsuario.prototype.tomarReporte = function (id_socket, idReporte) {
    };
    // (Aún no se bien que irá aquí) 
    ReporteUsuario.prototype.updateEstatusReporte = function (idReporte, estatus) {
    };
    // Modificar cuando se esta recibiendo multimedia 
    // 1 = Recibiendo multimedia
    // 0 = Finalizo recepcion de multimedia
    ReporteUsuario.prototype.updateEstatusFotos = function (idReporte, estatus) {
    };
    ReporteUsuario.prototype.updateEstatusGeol = function (idReporte, estatus) {
    };
    ReporteUsuario.prototype.updateEstatusAudio = function (idReporte, estatus) {
    };
    return ReporteUsuario;
}());
module.exports = {
    ReporteUsuario: ReporteUsuario
};
