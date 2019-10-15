import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
const bcrypt = require('bcrypt');
const router = Router();

let salt = bcrypt.genSaltSync(10);

// Log in
router.post('/', (req: Request, res: Response) => {
    
    const usuario = MySQL.instance.cnn.escape(req.body.usuario);
    const passNoEnctrip = req.body.contrasenia;
    const query = `CALL getUsuarioCCID(${usuario})`;

    MySQL.ejecutarQuery(query, (err: any, data: any[][]) => {
        try{ 
            if( err ){
                return res.status(500).json({
                    ok: false, 
                    resp: err
                })
            } else {
                const passEncript = data[0][0].contrasena;
 
                if(bcrypt.compareSync(passNoEnctrip, passEncript)){
                    return res.json({
                        ok: true, 
                        resp: 'Contraseña exitosa', 
                        data: data[0][0]
                    });
                }else{
                    return res.json({
                        ok: true ,
                        resp: 'Contraseña incorrecta'
                    });
                } 
            }
        } catch (e){
            return res.status(400).json({
                ok: false, 
                resp: e.message
            });
        } 
    });



});

    

export default router;