// Consumir procedimiento almacenadoo getDireccionID(ID)

import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const router = Router();

router.get('/:id_direccion', (req: Request, res: Response) =>{
    const query = `CALL getDireccionID(${req.params.id_direccion});`;
    
    MySQL.ejecutarQuery( query, (err: any, direccion: any[][]) =>{
        if(err){
            return res.status(400).json({
                ok:false, 
                error: err
            });
        } else {
            return res.json({
                ok: true, 
                direccion: direccion[0][0]
            });
        }
    });
});

router.post('/:id', (req: Request, res: Response) => {
    const idDireccion = req.params.id;
    if(!idDireccion){
        return res.json({
            ok: false,
            resp: '¡Datos de dirección incompleta!'
        });
    }

    let { calle, numero, colonia, cp, entre1, entre2, referencia, idLocalidad, lat, lg } = req.body;
    
    if(!idLocalidad)
        return res.json({
            ok: false,
            resp: 'Datos de localidad incompleta'
        });
    
    cp = !cp? 0 : cp;
    lat = !lat? 0.0 : lat;
    lg = !lg? 0.0 : lg;
    entre1 = entre1 === undefined? '' : entre1;
    entre2 = entre2 === undefined? '' : entre2;

    if(!calle || !numero || !colonia || !referencia)
        return res.json({
            ok: false,
            resp: 'Datos de dirección incompleta'
        });
    
    
    const QUERY = `CALL updateDireccion(
        ${MySQL.instance.cnn.escape(calle)},
        ${MySQL.instance.cnn.escape(numero)},
        ${MySQL.instance.cnn.escape(colonia)},
        ${cp},
        ${MySQL.instance.cnn.escape(entre1)},
        ${MySQL.instance.cnn.escape(entre2)},
        ${MySQL.instance.cnn.escape(referencia)},
        ${idLocalidad},
        ${lat},
        ${lg},
        ${idDireccion});`;
        
    MySQL.ejecutarQuery(QUERY, (err: any, resp: any[][])=>{
        if(err){
            return res.json({
                ok: false,
                resp: err
            });
        } else {
            return res.json({
                ok:  resp[0][0].res === 1 ? true : false,
                resp: resp[0][0].resp
            });
        }
    });

});

export default router;