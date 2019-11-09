"use strict";
// Almacena las alertas recibidas 
// Pendientes y en uso
var Alertas = /** @class */ (function () {
    function Alertas() {
        this.alertas = [];
        this.alertas = [];
    }
    Alertas.prototype.agregarAlerta = function (idReporte, idComercio, idUsuarioApp, idUsuarioNIT, estatus) {
        var alerta = {
            idReporte: idReporte,
            idComercio: idComercio,
            idUsuarioApp: idUsuarioApp,
            idUsuarioNIT: idUsuarioNIT,
            estatus: estatus
        };
        this.alertas.push(alerta);
        return alerta;
    };
    Alertas.prototype.getAlerta = function (idReporte) {
        var alerta = this.alertas.filter(function (alerta) {
            return alerta.idReporte === idReporte;
        })[0];
    };
    Alertas.prototype.getAlertas = function () {
        return this.alertas;
    };
    Alertas.prototype.getAlertasPendientes = function () {
        var alertasPendientes = this.alertas.filter(function (alerta) {
            return alerta.estatus === 0;
        });
        return alertasPendientes;
    };
    Alertas.prototype.getAlertasUso = function () {
        var alertasUso = this.alertas.filter(function (alerta) {
            return alerta.estatus === 1;
        });
        return alertasUso;
    };
    Alertas.prototype.borrarAlerta = function (idReporte) {
        var alertaAtendidaEliminada = this.getAlerta(idReporte);
        this.alertas = this.alertas.filter(function (alerta) {
            return alerta.idReporte != idReporte;
        });
        return alertaAtendidaEliminada;
    };
    return Alertas;
}());
module.exports = {
    Alertas: Alertas
};
