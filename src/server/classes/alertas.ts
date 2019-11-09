
// Almacena las alertas recibidas 
// Pendientes y en uso

class Alertas {
    
    alertas: Object[] = [];

    constructor() {
        this.alertas = [];
    }

    agregarAlerta(idReporte: number, 
        idComercio: number,
        idUsuarioApp: number, 
        idUsuarioNIT: number, 
        estatus: number){

        let alerta = {
            idReporte,
            idComercio, 
            idUsuarioApp,
            idUsuarioNIT,
            estatus
        };

        this.alertas.push(alerta);
        return alerta;

    }

    getAlerta(idReporte: number){
        let alerta = this.alertas.filter((alerta: any ) => {
            return alerta.idReporte === idReporte;
        })[0];
    }

    getAlertas(){
        return this.alertas;
    }

    getAlertasPendientes(){
        let alertasPendientes = this.alertas.filter((alerta: any )=>{
            return alerta.estatus === 0;
        });
        return alertasPendientes;
    }

    getAlertasUso(){
        let alertasUso = this.alertas.filter((alerta: any )=>{
            return alerta.estatus === 1;
        });
        return alertasUso;
    }

    borrarAlerta(idReporte: number ){
        let alertaAtendidaEliminada = this.getAlerta(idReporte);

        this.alertas = this.alertas.filter((alerta: any) => {
            return alerta.idReporte != idReporte;
        });

        return alertaAtendidaEliminada;
    }
    
}

module.exports = {
    Alertas
}