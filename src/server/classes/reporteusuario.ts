// Utilizada para relacionar el reporte en uso con 
// el usuario que se encuentra atendiendolo. (Socket)



class ReporteUsuario{

    reportes:Object[] = [];
    
    constructor() {
        this.reportes = [];
    }

    agregarReporte(
        idReporte: number, 
        id_socket: any,
        fecha: string, 
        hora: string, 
        estatus_reporte: number, 
        estatus_fotos: number,
        estatus_geolocalizacion: number,
        estatus_audio: number
    ) {

        let reporte: ReporteSocket = {
            idReporte, 
            id_socket, 
            fecha, 
            hora, 
            estatus_reporte,
            estatus_fotos,
            estatus_geolocalizacion,
            estatus_audio
        }

        this.reportes.push(reporte);
        return this.reportes;
    }

    // Obtener la lista de reporte que tiene X socket
    getMisReportes(id_socket: any){
        let misReportes = this.reportes.filter( (reporte: any) => {
            return reporte.id_socket === id_socket;
        });
        return misReportes;
    }

    // Obtener la data del reporte
    // De ahí tomar id_socket
    getReporte(idReporte: number){
        let reporte = this.reportes.filter( (reporte: any) => {
            return reporte.idReporte === idReporte;
        })[0];
        return reporte;
    }

    // Eliminar el reporte por numero de reporte
    borrarReporte(idReporte: number){
        let reporteBorrado = this.getReporte(idReporte);

        this.reportes = this.reportes.filter( (reporte: any) => {
            return reporte.idReporte != idReporte;
        });

        return reporteBorrado;
    }

    // Agregar socketNIT a reporte
    tomarReporte(id_socket: any, idReporte: number){

    }

    // (Aún no se bien que irá aquí) 
    updateEstatusReporte(idReporte: number, estatus: number){

    }


    
    // Modificar cuando se esta recibiendo multimedia 
    // 1 = Recibiendo multimedia
    // 0 = Finalizo recepcion de multimedia
    updateEstatusFotos(idReporte: number, estatus: number){
        
    }

    updateEstatusGeol(idReporte: number, estatus: number){
        
    }

    updateEstatusAudio(idReporte: number, estatus: number){
        
    }

}

interface ReporteSocket{
    idReporte: number; 
    id_socket: any;
    fecha: string; 
    hora: string; 
    estatus_reporte: number; 
    estatus_fotos: number;
    estatus_geolocalizacion: number;
    estatus_audio: number
}

module.exports = {
    ReporteUsuario
}
