import { Router, Request, Response } from 'express';
import MySQL from '../mysql/mysql';
import { verify } from 'crypto';
const { verificaToken, verificaAdmin_role } = require('../server/middlewares/autenticacion');
const bcrypt = require('bcrypt');
const router = Router();
let salt = bcrypt.genSaltSync(10);

// [verificaToken, verificaAdmin_role],
// Obtener usuario por usuario
router.get('/:id',  ( req: Request, res: Response ) =>{
    const idusuario = MySQL.instance.cnn.escape(req.params.id);
    const query = `CALL getUsuarioAppID(${idusuario})`;

    MySQL.ejecutarQuery(query, (err: any, usuario: any[][]) => {
        if( err ){
            return res.status(400).json({
                ok: false, 
                resp: err 
            })
        } else {
            return res.json({
                ok: true, 
                resp: usuario[0][0]
            })

        }
    });

});

export default router;