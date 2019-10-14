import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const bcrypt = require('bcrypt-nodejs');
const router = Router();


// Log in
router.post('/', (req: Request, res: Response) => {
    
    const usuario = MySQL.instance.cnn.escape(req.body.usuario);
    const passNoEnctrip = MySQL.instance.cnn.escape(req.body.contrasenia);


    const query = `CALL getUsuarioCCID(${usuario})`;

    MySQL.ejecutarQuery(query, (err: any, data: any[][]) => {
        if( err ){
            return res.status(400).json({
                ok: false, 
                resp: err
            })
        } else {
            const passEncript = data[0][0].contrasena;

            bcrypt.compare(passNoEnctrip, passEncript, function(err: any , result: any) {
                
                if(err){
                    return res.json({
                        ok: false, 
                        resp: 'Ocurrio un error'
                    });
                }

                if(result == true){
                    return res.json({
                        ok: true, 
                        resp: 'Contraseña exitosa', 
                        data: data[0][0]
                    });
                } else {
                    return res.json({
                        ok: true ,
                        resp: 'Contraseña incorrecta'
                    });
                }
            });

        }
    });



});

    

export default router;