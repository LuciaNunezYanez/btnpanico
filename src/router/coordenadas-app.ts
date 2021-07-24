import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
import Server from '../server/server';

const { verificaToken } = require('../server/middlewares/autenticacion');
const router = Router();
const socketServer = Server.instance;

// Log in
router.post('/:id_reporte', (req: Request, res: Response) => {

    const id_coord_reporte: number = Number.parseInt(req.params.id_reporte);
    const lat_coord_reporte = req.body.lat_coord_reporte;
    const lng_coord_reporte = req.body.lng_coord_reporte;
    const fecha_coord_reporte: string = MySQL.instance.cnn.escape(req.body.fecha_coord_reporte);
    let lugar: string = req.body.lugar;
    
    
    if(lugar === undefined){
        lugar = MySQL.instance.cnn.escape('Actual');
    } else {
        lugar = MySQL.instance.cnn.escape(lugar);
    }
    
    console.log('Coordenadas: Lat ' + lat_coord_reporte + ' Lng '+ lng_coord_reporte);
    // console.log("id_reporte: " + id_coord_reporte);
    // console.log("latitud: " + lat_coord_reporte);
    // console.log("longitud: " + lng_coord_reporte);
    // console.log("fecha: " + fecha_coord_reporte);
    // return; 
    const query = `CALL addCoordenadasRtID(
        ${id_coord_reporte},
        ${lat_coord_reporte},
        ${lng_coord_reporte},
        ${fecha_coord_reporte},
        ${lugar},
        @last_id);`;

    // console.log(query);
    if(id_coord_reporte != undefined && lat_coord_reporte != undefined && lng_coord_reporte != undefined && fecha_coord_reporte != null){
        MySQL.ejecutarQuery(query, (err: any, resp: any[][]) => {
            try{ 
                if( err ){
                    return res.status(500).json({
                        ok: false, 
                        resp: err
                    })
                } else {
                    const data = {
                        id_coord_reporte, 
                        lat_coord_reporte, 
                        lng_coord_reporte, 
                        fecha_coord_reporte   
                    };
                    socketServer.emitirGeolocalizacion(id_coord_reporte, data);

                    return res.json({
                        ok: true,
                        resp: 'Exito al agregar coordenadas', 
                        last_id: resp[0][0].last_id
                    });
                }
            } catch (e){
                return res.status(400).json({
                    ok: false, 
                    resp: e.message
                });
            } 
        });
    } else {
        return res.status(400).json({
            ok: false, 
            resp: 'Datos incompletos'
        });
    } 
       

});

router.get('/:id_reporte', (req: Request, res: Response) => {
    try{
        var id_reporte = Number.parseInt(req.params.id_reporte);
        var query = `CALL getCoordenadasRep(${id_reporte});`;
    
        MySQL.ejecutarQuery(query, (err: any, coord: any[][]) => {
            try{ 
                if( err ){
                    return res.status(500).json({
                        ok: false, 
                        resp: err
                    })
                } else {
                    return res.json({
                        ok: true,
                        resp: 'Exito al obtener coordenadas', 
                        id_coordenada: coord[0][0]?.id_coordenada,
                        id_coord_reporte: coord[0][0]?.id_coord_reporte,
                        lat_coord_reporte: coord[0][0]?.lat_coord_reporte,
                        lng_coord_reporte: coord[0][0]?.lng_coord_reporte,
                        fecha_coord_reporte: coord[0][0]?.fecha_coord_reporte,
                        tipo_ubicacion: coord[0][0]?.tipo_ubicacion
                    });
                }
            } catch (e){
                return res.status(400).json({
                    ok: false, 
                    resp: e.message
                });
            } 
        });
    } catch (e) {
        return res.status(400).json({
            ok: false, 
            resp: 'ID de reporte incorrecto'
        });
    }
});

export default router;